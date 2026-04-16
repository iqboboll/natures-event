import os
import base64
import httpx
import logging
import asyncio
import json
from groq import AsyncGroq # pyright: ignore[reportMissingImports]
from google import genai  # pyright: ignore[reportMissingImports]
from google.genai import types  # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv # type: ignore

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================
# HYBRID AI ARCHITECTURE: Groq (Speed) + Gemini (Intelligence)
# ============================================================
# Groq  -> Chatbot, Evacuation Plans  (ultra-fast responses)
# Gemini -> Hazard Risk Analysis, Image Vision (superior reasoning)
# ============================================================

# --- Initialize Groq Client ---
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = AsyncGroq(api_key=groq_api_key) if groq_api_key else None

# --- Initialize Gemini Client (New google-genai SDK) ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
gcp_project = os.getenv("GCP_PROJECT_ID")
gcp_location = os.getenv("GCP_LOCATION", "us-central1")
gemini_client_vertex = None
gemini_client_ai_studio = None

# 🚀 1. Attempt Vertex AI (Uses GCP Credits)
if gcp_project:
    try:
        gemini_client_vertex = genai.Client(vertexai=True, project=gcp_project, location=gcp_location)
        logger.info(f"🚀 Gemini Vertex AI Ready (Project: {gcp_project})")
    except Exception as e:
        logger.error(f"⚠️ Vertex AI not ready yet: {e}")

# 🔗 2. Attempt AI Studio (Uses Free API Key)
if gemini_api_key:
    try:
        gemini_client_ai_studio = genai.Client(api_key=gemini_api_key)
        logger.info("🔗 Gemini AI Studio Ready (API Key Mode)")
    except Exception as e:
        logger.error(f"⚠️ AI Studio not ready: {e}")

if groq_client:
    logger.info("✅ Groq AI Ready (llama-3.3-70b-versatile)")

GEMINI_MODEL = "gemini-2.5-flash"

# Helper to get the best available Gemini client
def get_gemini_client():
    # Priority: 1. Vertex (Credits) -> 2. AI Studio (Key) -> 3. None (Fall back to Groq)
    if gemini_client_vertex:
        return gemini_client_vertex, True # True means it's Vertex
    return gemini_client_ai_studio, False # False means it's AI Studio


# ============================================================
# 1. EVACUATION PLAN — Powered by GEMINI (Primary) + GROQ (Fallback)
# ============================================================
async def get_evacuation_plan(lat: float, lon: float, hazard: str) -> dict:
    client, _ = get_gemini_client()
    if not groq_client and not client:
        return {
            "instruction": "Please move to higher ground and seek the nearest hospital or police station.",
            "safe_zone_name": "Nearest official safe zone",
            "lat": lat + 0.01,
            "lon": lon + 0.01
        }
    
    # Query OpenStreetMap (Overpass API) for nearest hospital or safe zone within 5km
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:5000,{lat},{lon});
      node["amenity"="police"](around:5000,{lat},{lon});
      node["amenity"="community_centre"](around:5000,{lat},{lon});
    );
    out body 1;
    """
    
    safe_zone_name = "the nearest official safe zone"
    target_lat = lat + 0.005 # Default slightly away if API fails
    target_lon = lon + 0.005
    
    try:
        async with httpx.AsyncClient() as http_client:
            resp = await http_client.post("https://overpass-api.de/api/interpreter", data=query, timeout=5.0)
            data = resp.json()
            if data and "elements" in data and len(data["elements"]) > 0:
                element = data["elements"][0]
                tags = element.get("tags", {})
                safe_zone_name = tags.get("name", "Nearest Safe facility")
                target_lat = element.get("lat", lat + 0.005)
                target_lon = element.get("lon", lon + 0.005)
    except Exception as e:
        logger.error(f"Overpass API error: {e}")
        
    prompt = f"There is a High severity {hazard} reported near {lat}, {lon}. We found a safe zone: {safe_zone_name}. Draft a brief, 1-sentence urgent emergency evacuation instruction directed at the user, telling them to evacuate to {safe_zone_name}."
    
    instruction = f"Urgent: {hazard} detected. Please evacuate to {safe_zone_name}."

    # Try Gemini first (primary), fall back to Groq
    client, is_vertex = get_gemini_client()
    if client:
        try:
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json'
                )
            )
            data = json.loads(response.text)
            logger.info(f"✅ Evacuation Plan by Gemini ({'Vertex' if is_vertex else 'AI Studio'})")
            return data
        except Exception as e:
            logger.warning(f"Gemini error on evacuation plan: {e}. Falling back to Groq...")
    
    # Fallback to Groq
    if groq_client:
        response = None
        for attempt in range(3):
            try:
                response = await groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.5,
                    timeout=20.0, # Increased timeout
                )
                break
            except Exception as e:
                logger.warning(f"Groq API error on evacuation plan attempt {attempt+1}: {e}")
                await asyncio.sleep(2 ** attempt)
                
        if response:
            instruction = response.choices[0].message.content.strip()
            return {
                "instruction": instruction,
                "safe_zone_name": safe_zone_name,
                "lat": target_lat,
                "lon": target_lon
            }
    
    return {
        "instruction": instruction,
        "safe_zone_name": safe_zone_name,
        "lat": target_lat,
        "lon": target_lon
    }


# ============================================================
# 2. HAZARD RISK ANALYSIS — Powered by GEMINI (Superior Reasoning)
# ============================================================
async def check_hazard_risk(location: str, weather_data: str):
    client, _ = get_gemini_client()
    if not client and not groq_client:
        return "None", "High", "Mocked response (No AI keys set): High risk due to simulated extreme conditions."
        
    prompt = f"""
    Given the location {location} and current weather: {weather_data},
    determine the primary natural hazard risk (e.g., Flood, Heatwave, Drought, Storm, Forest Burning, or None)
    and the overall risk level (Low, Medium, High). 
    * Note: For Forest Burning risk (Wildfire), emulate the MET Malaysia FDRS (Fire Danger Rating System) by carefully analyzing if the temperature is high (>32 C), humidity is very low (<60%), and precipitation is 0mm. Explain the risk factor briefly.
    * IMPORTANT: In your Explanation, you MUST BOLD every numerical weather metric (e.g., **32 C**, **85% humidity**, **10 kph**, **1.2mm precipitation**). This is for user readability.
    
    CRITICAL RULE: The weather data contains a [CONFIRMED LOCATION]. You MUST ONLY discuss that exact location name in your explanation. Do NOT hallucinate or assume Kuala Lumpur unless the confirmed location is explicitly Kuala Lumpur. Keep your explanation focused on the confirmed location.

    Format:
    Hazard: <hazard_type>
    Risk: <level>
    Explanation: <text>
    """

    # Try Gemini first (better reasoning), fall back to Groq
    client, is_vertex = get_gemini_client()
    if client:
        try:
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            text = response.text
            logger.info(f"✅ Hazard Analysis by Gemini ({'Vertex' if is_vertex else 'AI Studio'})")
            return _parse_hazard_response(text)
        except Exception as e:
            logger.warning(f"Gemini error on hazard risk: {e}. Falling back to Groq...")
    
    # Fallback to Groq
    if groq_client:
        response = None
        for attempt in range(3):
            try:
                response = await groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.7,
                    timeout=20.0, # Increased timeout
                )
                break
            except Exception as e:
                logger.warning(f"Groq API error on hazard risk attempt {attempt+1}: {e}")
                await asyncio.sleep(2 ** attempt)
                
        if response:
            text = response.choices[0].message.content
            return _parse_hazard_response(text)
    
    return "Unknown", "Unknown", "Error: Both Gemini and Groq failed to analyze hazard risk."


def _parse_hazard_response(text: str):
    """Shared parser for hazard risk responses from any AI model."""
    risk_level = "Unknown"
    primary_hazard = "None"
    explanation = text

    for line in text.split("\n"):
        if "Risk:" in line:
            risk_level = line.replace("Risk:", "").strip()
        elif "Hazard:" in line:
            primary_hazard = line.replace("Hazard:", "").strip()
        elif "Explanation:" in line:
            explanation = line.replace("Explanation:", "").strip()

    return primary_hazard, risk_level, explanation


# ============================================================
# 3. EMERGENCY CHATBOT — Powered by GEMINI (Primary) + GROQ (Fallback)
# ============================================================
async def get_chatbot_response(message: str):
    client, _ = get_gemini_client()
    if not groq_client and not client:
        return "Mocked response (No AI keys set): Head to higher ground immediately and listen to local authorities."
        
    # --- RAG IMPLEMENTATION ---
    rag_context = ""
    try:
        kb_path = os.path.join(os.path.dirname(__file__), "knowledge_base.txt")
        with open(kb_path, "r", encoding="utf-8") as f:
            rag_context = f.read()
    except Exception as e:
        print(f"RAG Knowledge Base not found or unreadable: {e}")

    # --- LIVE SENSOR FUSION ---
    live_weather_data = "No specific location mentioned, no live radar data pulled."
    
    # Use Gemini for location extraction (primary), Groq as fallback
    extraction = "NONE"
    client, is_vertex = get_gemini_client()
    if client:
        try:
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=f"Extract the specific city or location requested in this message. Reply ONLY with the location name. If no location is mentioned, reply EXACTLY with the word 'NONE'.\n\nMessage: {message}",
            )
            extraction = response.text.strip()
            logger.info(f"✅ Location Extraction by Gemini ({'Vertex' if is_vertex else 'AI Studio'})")
        except Exception as e:
            logger.warning(f"Gemini location extraction failed: {e}")
    if extraction == "NONE" and groq_client:
        try:
            loc_response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "Extract the specific city or location requested in the user's message. Reply ONLY with the location name. If no location is mentioned, reply EXACTLY with the word 'NONE'."},
                    {"role": "user", "content": message}
                ],
                temperature=0.0,
            )
            extraction = loc_response.choices[0].message.content.strip()
        except Exception as e:
            logger.warning(f"Groq location extraction fallback failed: {e}")

    if extraction and extraction.upper() != "NONE" and "NONE" not in extraction.upper():
        try:
            from weather_service import get_real_weather
            live_weather_data = await get_real_weather(extraction)
        except Exception as e:
            logger.warning(f"Weather data fetch failed: {e}")

    system_prompt = f"""You are a National Emergency Assistant for Malaysia. 
    Use the following official NADMA guidelines to answer the user's questions. 
    
    [OFFICIAL GUIDELINES CONTEXT]
    {rag_context}
    [END CONTEXT]
    
    [LIVE SENSOR/WEATHER DATA]
    {live_weather_data}
    * If the user asks if there is a flood/emergency in a location, use this live weather data to answer.
    * If precipitation/rain is low and there is no severe risk, concisely answer NO. DO NOT list emergency numbers or evacuation rules if the area is safe. Just tell them it is currently safe.
    [END SENSOR DATA]
    
    CRITICAL TRANSLATION RULE: You must precisely match the language of the user's prompt. If they speak English, reply strictly in English. If they speak Bahasa Melayu, reply strictly in Bahasa Melayu. Do not cross languages. Provide helpful, concise safety advice."""

    # Try Gemini first (primary), fall back to Groq
    client, is_vertex = get_gemini_client()
    if client:
        try:
            full_prompt = f"{system_prompt}\n\nUser question: {message}"
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=full_prompt,
            )
            logger.info(f"✅ Chatbot Response by Gemini ({'Vertex' if is_vertex else 'AI Studio'})")
            return response.text
        except Exception as e:
            logger.warning(f"Gemini chatbot error: {e}. Falling back to Groq...")
    
    # Fallback to Groq
    if groq_client:
        try:
            response = None
            for attempt in range(3):
                try:
                    response = await groq_client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message}
                        ],
                        temperature=0.3,
                        timeout=20.0, # Increased timeout
                    )
                    break
                except Exception as e:
                    logger.warning(f"Groq API error on chatbot attempt {attempt+1}: {e}")
                    await asyncio.sleep(2 ** attempt)
                    
            if response:
                return response.choices[0].message.content
        except Exception as e:
            logger.warning(f"Groq chatbot fallback also failed: {e}")
    
    return "Error: Both AI services are unavailable. Please try again later."


# ============================================================
# 4. IMAGE ANALYSIS — Powered by GEMINI (Superior Vision)
# ============================================================
async def analyze_hazard_image(image_bytes: bytes, location: str, content_type: str):
    client, _ = get_gemini_client()
    if not client and not groq_client:
        return "Unknown", "High", f"Mocked analysis (No AI keys set): The reported hazard at {location} appears severe.", "100%"
        
    prompt = f"Analyze this image from {location} for any natural hazards (Flood, Fire, Storm damage, Drought) and state your estimated detection accuracy as a percentage. Return exactly in this format:\nHazard: <hazard_type>\nSeverity: <level>\nConfidence: <0-100%>\nAnalysis: <text>"

    # Try Gemini Vision first (superior multi-modal), fall back to Groq
    client, is_vertex = get_gemini_client()
    if client:
        try:
            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=content_type,
            )
            response = await client.aio.models.generate_content(
                model=GEMINI_MODEL,
                contents=[prompt, image_part],
            )
            text = response.text
            logger.info(f"✅ Image Vision by Gemini ({'Vertex' if is_vertex else 'AI Studio'})")
            return _parse_image_response(text)
        except Exception as e:
            logger.warning(f"Gemini Vision error: {e}. Falling back to Groq...")

    # Fallback to Groq (Llama Vision)
    if groq_client:
        try:
            base64_image = base64.b64encode(image_bytes).decode('utf-8')
            response = None
            for attempt in range(3):
                try:
                    response = await groq_client.chat.completions.create(
                        model="llama-3.2-11b-vision-preview",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": prompt},
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:{content_type};base64,{base64_image}",
                                        },
                                    },
                                ],
                            }
                        ],
                        temperature=0.5,
                    )
                    break
                except Exception as e:
                    logger.warning(f"Groq API error on image analysis attempt {attempt+1}: {e}")
                    await asyncio.sleep(2 ** attempt)
                    
            if response:
                text = response.choices[0].message.content
                return _parse_image_response(text)
        except Exception as e:
            logger.error(f"Groq Vision fallback also failed: {e}")

    return "Unknown", "Unknown", f"Image analysis failed: Both Gemini and Groq are unavailable.", "0%"


def _parse_image_response(text: str):
    """Shared parser for image analysis responses from any AI model."""
    severity = "Unknown"
    hazard = "Unknown"
    confidence = "Unknown"
    analysis = text

    for line in text.split("\n"):
        if "Severity:" in line:
            severity = line.replace("Severity:", "").strip()
        elif "Hazard:" in line:
            hazard = line.replace("Hazard:", "").strip()
        elif "Confidence:" in line:
            confidence = line.replace("Confidence:", "").strip()
        elif "Analysis:" in line:
            analysis = line.replace("Analysis:", "").strip()

    return hazard, severity, analysis, confidence
