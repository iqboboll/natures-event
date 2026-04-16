import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

def list_available_models():
    load_dotenv()
    project = os.getenv("GCP_PROJECT_ID")
    location = os.getenv("GCP_LOCATION", "us-central1")
    
    print(f"--- Listing Vertex AI Models for {project} in {location} ---")
    
    try:
        client = genai.Client(vertexai=True, project=project, location=location)
        # List all models available to this project
        models = client.models.list()
        
        found = False
        for model in models:
            if "gemini" in model.name.lower():
                print(f"SUCCESS: FOUND {model.name}")
                found = True
        
        if not found:
            print("FAILED: No Gemini models found in this region for your project yet.")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    list_available_models()
