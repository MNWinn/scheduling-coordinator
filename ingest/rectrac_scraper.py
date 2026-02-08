import asyncio
import json
import os
from playwright.async_api import async_playwright
from datetime import datetime

# CONFIGURATION
# In a real scenario, these would be loop inputs
TARGET_URL = "https://web1.myvscloud.com/wbwsc/nybabylonwt.wsc/search.html" # Example RecTrac
OUTPUT_FILE = "scraped_data/rectrac_dump.json"

async def scrape_rectrac():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()

        print(f"Navigating to {TARGET_URL}...")
        try:
            await page.goto(TARGET_URL, timeout=60000)
        except Exception as e:
            print(f"Failed to load page: {e}")
            await browser.close()
            return

        # Select Filters (Required by RecTrac)
        print("Selecting filters...")
        try:
            # Try to click "Select All" in the Type filter group
            # We need to target the specific Select All button for the "Type" or "Category" group
            # Found in HTML: <button class="combobox__control combobox__selectall"> Select All </button>
            # Let's try to click the first visible 'Select All' button
            await page.click('.combobox__selectall', timeout=5000)
            print("Clicked 'Select All'")
        except Exception as e:
            print(f"Failed to click Select All: {e}")
            # Fallback: Try to click purely via text or specific ID if needed
        
        # Trigger Search
        print("Clicking search button...")
        try:
            # Click the main search button.
            # There are two potential buttons, try the one in the filter bar first
            await page.click('#arwebsearch_buttonsearch', timeout=5000)
        except:
            print("Filter search button not found/clickable, trying 'Search Now' button...")
            await page.click('#arwebsearch_noresultsbutton')
        
        # Wait for results to load
        # Look for the grid or the "no results" message disappearing
        print("Waiting for results...")
        await page.wait_for_timeout(5000) # Give it 5s for JS to process

        # Dump HTML for debugging
        content = await page.content()
        with open("debug_page_results.html", "w") as f:
            f.write(content)
        print(" dumped HTML results to debug_page_results.html")

        # Try to find results
        # Use BeautifulSoup for parsing as it's faster for bulk extraction than Playwright iterators
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(content, 'html.parser')
        
        activities = []
        result_blocks = soup.select('.result-content')
        print(f"Found {len(result_blocks)} result groups.")

        for block in result_blocks:
            try:
                # Group Info
                header_info = block.select_one('.result-header__info')
                group_title = header_info.select_one('h2').get_text(strip=True) if header_info else "Unknown"
                group_desc = header_info.select_one('.result-header__description')
                group_desc_text = group_desc.get_text(strip=True) if group_desc else ""
                
                # Image
                img_tag = block.select_one('.result-header__image-container img')
                img_url = img_tag['src'] if img_tag else ""
                if img_url and not img_url.startswith('http'):
                     img_url = f"https://nybabylonweb.myvscloud.com{img_url}"

                # Parse Table Rows
                rows = block.select('table tbody tr')
                for row in rows:
                    cols = row.find_all('td')
                    if not cols: continue
                    
                    # Helper to get text safely
                    def get_col_text(idx):
                        if idx < len(cols):
                            return cols[idx].get_text(" ", strip=True)
                        return ""

                    # Structure based on observed HTML:
                    # 0: Activity #, 1: Descr, 2: Dates, 3: Times, 4: Days, 5: Location, 6: Ages, 7: Cost, 8: Availability
                    
                    activity = {
                        "group_title": group_title,
                        "group_description": group_desc_text,
                        "image_url": img_url,
                        "activity_code": get_col_text(0),
                        "description": get_col_text(1),
                        "dates": get_col_text(2),
                        "times": get_col_text(3),
                        "days": get_col_text(4),
                        "location": get_col_text(5),
                        "ages": get_col_text(6),
                        "cost": get_col_text(7),
                        "availability": get_col_text(8),
                        "source_url": TARGET_URL
                    }
                    activities.append(activity)
            except Exception as e:
                print(f"Error parse row: {e}")

        # Save to JSON
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, "w") as f:
            json.dump(activities, f, indent=2)
        
        print(f"Saved {len(activities)} items to {OUTPUT_FILE}")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(scrape_rectrac())
