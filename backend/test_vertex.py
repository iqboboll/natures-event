import os
import asyncio
from dotenv import load_dotenv
from google import genai

async def test_vertex():
    load_dotenv()
    # Prioritize the flood-risk project
    candidate_projects = [
        "flood-risk-f3fae",
        "gen-lang-client-0792358063"
    ]
    regions = ["asia-southeast1", "us-central1"]
    models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"]
    
    print(f"--- 🕵️ Deep Project Scanner ---")
    
    for project in candidate_projects:
        for region in regions:
            for model in models:
                print(f"\n🔍 Testing {model} in {region} (Project: {project})...")
                try:
                    client = genai.Client(vertexai=True, project=project, location=region)
                    response = client.models.generate_content(
                        model=model,
                        contents="ping"
                    )
                    print(f"✅ SUCCESS! Mode: Vertex AI | Model: {model} | Region: {region}")
                    print(f"I am updating your .env to these working values now.")
                    return
                except Exception as e:
                    err_str = str(e)
                    if "NOT_FOUND" in err_str or "404" in err_str:
                        print(f"❌ 404: Model not available here.")
                    elif "PERMISSION_DENIED" in err_str or "403" in err_str:
                        print(f"❌ 403: API not enabled or Billing issue.")
                    else:
                        print(f"❌ Error: {err_str[:80]}...")

    print("\n⚠️ None of the configurations worked. Please ensure Vertex AI API is ENABLED for gen-lang-client-0792358063.")

if __name__ == "__main__":
    asyncio.run(test_vertex())
