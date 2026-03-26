import os
import base64
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

# Initialize the new Async Groq Client
api_key = os.getenv("GROQ_API_KEY")

# The Groq library automatically picks up GROQ_API_KEY from the environment,
# but we explicitly pass it here just in case.
client = AsyncGroq(api_key=api_key) if api_key else None

async def check_flood_risk(location: str, rain_data: str):
    if not client:
        return "High", "Mocked response (No GROQ_API_KEY set in .env): High risk due to heavy rainfall in your area."
        
    try:
        prompt = f"""
        Given the location {location} and weather: {rain_data},
        determine flood risk (Low, Medium, High) and explain briefly.

        Format:
        Risk: <level>
        Explanation: <text>
        """

        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        text = response.choices[0].message.content

        risk_level = "Unknown"
        explanation = text

        for line in text.split("\n"):
            if "Risk:" in line:
                risk_level = line.replace("Risk:", "").strip()
            elif "Explanation:" in line:
                explanation = line.replace("Explanation:", "").strip()

        return risk_level, explanation

    except Exception as e:
        return "Unknown", f"Error connecting to AI: {str(e)}"

async def get_chatbot_response(message: str):
    if not client:
        return "Mocked response (No GROQ_API_KEY set in .env): Head to higher ground immediately and listen to local authorities."
        
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a flood emergency assistant specifically for users in Malaysia. Always provide Malaysian emergency numbers (e.g., 999 for Police/Ambulance, 994 for Fire and Rescue/Bomba, and NADMA) and tailor all advice to the Malaysian context. Provide helpful, concise safety advice."},
                {"role": "user", "content": message}
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

async def analyze_flood_image(image_bytes: bytes, location: str, content_type: str):
    if not client:
        return "High", f"Mocked analysis (No GROQ_API_KEY set in .env): The reported flood at {location} appears severe based on the uploaded image."
        
    try:
        # Note: Gemma models do not natively support analyzing images (vision) on Groq yet. 
        # If your hackathon strictly requires Gamma, this specific 'bonus' feature might need 
        # to be swapped out or use a different compatible vision model!
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        prompt = f"Analyze flood severity at {location} based on this image. Return exactly in this format:\nSeverity: <level>\nAnalysis: <text>"

        response = await client.chat.completions.create(
            # Leaving this as a Llama vision model because Gemma has no vision parameters.
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

        text = response.choices[0].message.content

        severity = "Unknown"
        analysis = text

        for line in text.split("\n"):
            if "Severity:" in line:
                severity = line.replace("Severity:", "").strip()
            elif "Analysis:" in line:
                analysis = line.replace("Analysis:", "").strip()

        return severity, analysis

    except Exception as e:
        return "Medium", "Image analysis currently unavailable. Please verify manually."
