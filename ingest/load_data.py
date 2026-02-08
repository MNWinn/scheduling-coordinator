import json
import os
import psycopg2
from psycopg2.extras import Json
from datetime import datetime
import re
from decimal import Decimal
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
JSON_FILE = "scraped_data/rectrac_dump.json"

# Manually mapped locations for now
LOCATION_MAP = {
    "Fabio Buttitta Park/Pool": {"address": "40 Acorn St", "city": "Deer Park", "state": "NY", "zip": "11729"},
    "Anthony Sanchez Park/Pool": {"address": "200 Sawyer Ave", "city": "West Babylon", "state": "NY", "zip": "11704"},
    "North Lindenhurst Park/Pool": {"address": "200 Straight Path", "city": "Lindenhurst", "state": "NY", "zip": "11757"},
    "Phelps Lane Park/Pool": {"address": "151 Phelps Ln", "city": "North Babylon", "state": "NY", "zip": "11703"}
}

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def parse_ages(age_str):
    """
    Parses age strings like "Ages 3 - 4.99", "3 Years Old", "Must be 4".
    Returns (min_age_years, max_age_years)
    """
    if not age_str:
        return None, None
        
    s = age_str.lower().strip()
    
    # "ages 3 - 4.99"
    m = re.search(r'ages? (\d+(?:\.\d+)?) - (\d+(?:\.\d+)?)', s)
    if m:
        return float(m.group(1)), float(m.group(2))
    
    # "3 years old"
    m = re.search(r'^(\d+) years? old', s)
    if m:
        val = float(m.group(1))
        return val, val + 0.99
        
    # "must be 4"
    m = re.search(r'must be (\d+)', s)
    if m:
        val = float(m.group(1))
        return val, val + 0.99
    
    return None, None

def parse_dates(date_str):
    """
    Parses "06/29/2026 - 07/17/2026 *"
    """
    if not date_str:
        return None, None
        
    clean = date_str.replace('*', '').strip()
    parts = clean.split('-')
    if len(parts) == 2:
        try:
            d1 = datetime.strptime(parts[0].strip(), "%m/%d/%Y").date()
            d2 = datetime.strptime(parts[1].strip(), "%m/%d/%Y").date()
            return d1, d2
        except:
            pass
    return None, None

def main():
    conn = get_connection()
    cursor = conn.cursor()
    
    try:
        print("Connected to DB.")
        
        # 1. Ensure Provider exists
        provider_name = 'Town of Babylon'
        cursor.execute("""
            INSERT INTO "Provider" (id, name, website, "isVerified", source, "updatedAt")
            VALUES (gen_random_uuid(), %s, 'https://www.townofbabylon.com', true, 'rectrac', NOW())
            ON CONFLICT (name) DO UPDATE SET "updatedAt" = NOW()
            RETURNING id;
        """, (provider_name,))
        provider_id = cursor.fetchone()[0]
        print(f"Provider ID: {provider_id}")
        
        # 2. Load Data
        with open(JSON_FILE, 'r') as f:
            items = json.load(f)
            
        print(f"Loading {len(items)} items...")
        
        # 3. Process
        for item in items:
            # Upsert Location
            loc_name = item.get("location", "Unknown Location")
            loc_data = LOCATION_MAP.get(loc_name, {"address": "Unknown", "city": "Babylon", "state": "NY", "zip": "00000"})
            
            # Use ON CONFLICT (name) if unique? Schema says unique([address, city, state])
            # We want to avoid duplicates.
            cursor.execute("""
                INSERT INTO "Location" (id, name, address, city, state, zip, "updatedAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s, %s, NOW())
                ON CONFLICT (address, city, state) DO UPDATE SET "updatedAt" = NOW()
                RETURNING id;
            """, (loc_name, loc_data['address'], loc_data['city'], loc_data['state'], loc_data['zip']))
            loc_id = cursor.fetchone()[0]
            
            # Parse Data
            min_age, max_age = parse_ages(item.get("ages", ""))
            start_date, end_date = parse_dates(item.get("dates", ""))
            
            cost_str = item.get("cost", "").replace("$", "").strip()
            price = None
            if cost_str:
                try:
                    price = float(cost_str)
                except:
                    pass
            
            reg_status = 'OPEN'
            avail = item.get("availability", "").lower()
            if "unavailable" in avail or "closed" in avail:
                reg_status = 'CLOSED'
            elif "waitlist" in avail:
                reg_status = 'WAITLIST'
                
            title = item.get("group_title", "").split('-')[0].strip() or "Untitled Activity"
            external_id = item.get("activity_code")
            
            # Skip if no external ID (shouldn't happen with scraper logic)
            if not external_id:
                print(f"Skipping item without code: {title}")
                continue
                
            # Upsert Activity
            cursor.execute("""
                INSERT INTO "Activity" (
                    id, title, description, "providerId", "locationId",
                    type, "externalId", "imageUrl", "sourceUrl",
                    price, "minAgeMo", "maxAgeMo",
                    "startDate", "endDate",
                    schedule, "regStatus", "lastScraped", "updatedAt"
                )
                VALUES (
                    gen_random_uuid(), %s, %s, %s, %s,
                    'CLASS', %s, %s, %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s, NOW(), NOW()
                )
                ON CONFLICT ("externalId") DO UPDATE SET
                    title = EXCLUDED.title,
                    description = EXCLUDED.description,
                    "imageUrl" = EXCLUDED."imageUrl",
                    price = EXCLUDED.price,
                    "minAgeMo" = EXCLUDED."minAgeMo",
                    "maxAgeMo" = EXCLUDED."maxAgeMo",
                    "startDate" = EXCLUDED."startDate",
                    "endDate" = EXCLUDED."endDate",
                    "regStatus" = EXCLUDED."regStatus",
                    "lastScraped" = NOW(),
                    "updatedAt" = NOW();
            """, (
                title, item.get("group_description"), provider_id, loc_id,
                external_id, item.get("image_url"), item.get("source_url"),
                price, 
                int(min_age * 12) if min_age is not None else None, 
                int(max_age * 12) if max_age is not None else None,
                start_date, end_date,
                Json({"days": item.get("days"), "times": item.get("times")}),
                reg_status
            ))
            
        conn.commit()
        print("Success.")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    main()
