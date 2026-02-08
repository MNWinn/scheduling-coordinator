
import os
import json
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI
import psycopg2
from psycopg2.extras import Json

# Load environment variables from .env file
load_dotenv()

# Configuration
DB_URL = os.environ.get("DATABASE_URL")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    print("Error: OPENAI_API_KEY not found.")
    exit(1)

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def get_embedding(text):
    text = text.replace("\n", " ")
    try:
        resp = await client.embeddings.create(input=[text], model="text-embedding-3-small")
        return resp.data[0].embedding
    except Exception as e:
        print(f"Error getting embedding: {e}")
        return None

async def process_activities():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    # Fetch activities without embeddings
    # Note: We can't easily check for null vector in raw SQL with standard drivers sometimes, 
    # but let's try.
    cur.execute("SELECT id, title, description, category FROM \"Activity\" WHERE embedding IS NULL")
    rows = cur.fetchall()
    
    print(f"Found {len(rows)} activities to embed.")

    for row in rows:
        act_id, title, description, category = row
        
        # Construct text to embed
        text_content = f"{title}. {description or ''} Category: {category or ''}"
        
        print(f"Embedding {act_id}...")
        vector = await get_embedding(text_content)
        
        if vector:
            # Update DB
            # We must use proper casting for pgvector
            cur.execute(
                "UPDATE \"Activity\" SET embedding = %s::vector WHERE id = %s",
                (vector, act_id)
            )
            conn.commit()
            print(f"Updated {act_id}")
        
        # Rate limit helpful
        await asyncio.sleep(0.2)
        
    cur.close()
    conn.close()

if __name__ == "__main__":
    asyncio.run(process_activities())
