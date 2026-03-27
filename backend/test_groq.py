import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

# Load variables from the .env file in the backend folder
load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

async def test_groq():
    print("Testing the Groq connection with model: llama-3.3-70b-versatile...")
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": "Just say 'API works' if you can read this."}],
            temperature=0.7,
        )
        print("SUCCESS! AI Response:", response.choices[0].message.content)
    except Exception as e:
        print("ERROR:", str(e))

asyncio.run(test_groq())
