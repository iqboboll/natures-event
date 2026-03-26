import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

# We check if the app is already initialized to prevent errors on restart/reload
if not firebase_admin._apps:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
    
    # Initialize using the credentials file
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin nicely initialized.")
    else:
        print(f"Warning: Firebase credentials not found at {cred_path}. Trying default.")
        try:
            firebase_admin.initialize_app()
        except ValueError:
            pass

def get_db():
    """Returns the Firestore database client"""
    if firebase_admin._apps:
        return firestore.client()
    return None
