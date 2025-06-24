import os
import requests
from bs4 import BeautifulSoup
import json
from google.generativeai import configure, embed_content
from dotenv import load_dotenv
from urllib.parse import urljoin, urlparse
import time

# Load API key from .env file
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
configure(api_key=GOOGLE_API_KEY)

def get_internal_links(base_url):
    """Crawl the website and collect all unique internal links."""
    visited = set()
    to_visit = [base_url]
    domain = urlparse(base_url).netloc
    
    while to_visit:
        url = to_visit.pop(0)
        if url in visited:
            continue
        try:
            resp = requests.get(url, timeout=10)
            soup = BeautifulSoup(resp.text, 'html.parser')
            visited.add(url)
            for a in soup.find_all('a', href=True):
                link = urljoin(base_url, a['href'])
                parsed_link = urlparse(link)
                if parsed_link.netloc == domain and link not in visited and link.startswith(base_url):
                    to_visit.append(link)
            time.sleep(1)  # Be polite: 1 second delay
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")
    return list(visited)

def scrape_clean_text(url):
    """Scrape and clean the main text content from a page."""
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Remove scripts/styles
        for tag in soup(['script', 'style', 'noscript']):
            tag.decompose()
        # Get visible text
        text = ' '.join(soup.stripped_strings)
        return text
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return ""

def batch_scrape(base_url, batch_size=10):
    """Scrape all internal pages in batches and return a dict of url:text."""
    links = get_internal_links(base_url)
    print(f"Found {len(links)} pages to scrape.")
    data = {}
    for i in range(0, len(links), batch_size):
        batch = links[i:i+batch_size]
        for url in batch:
            print(f"Scraping: {url}")
            data[url] = scrape_clean_text(url)
        print(f"Processed batch {i//batch_size + 1} of {((len(links)-1)//batch_size)+1}")
    return data 

def chunk_text(text, min_length=200):
    """Split text into paragraphs, merging small ones for meaningful chunks."""
    paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
    chunks = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) < min_length:
            current += (" " if current else "") + p
        else:
            if current:
                chunks.append(current)
            current = p
    if current:
        chunks.append(current)
    return chunks

def embed_chunks(chunks):
    """Embed each text chunk using Google AI and return list of dicts."""
    embedded = []
    for chunk in chunks:
        try:
            embedding = embed_content(model="models/text-embedding-004", content=chunk)
            embedded.append({"text": chunk, "embedding": embedding["embedding"]})
        except Exception as e:
            print(f"Embedding failed for chunk: {e}")
    return embedded

def process_and_embed_all(raw_data_path, output_path):
    with open(raw_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    all_entries = []
    for url, text in data.items():
        chunks = chunk_text(text)
        embedded = embed_chunks(chunks)
        for entry in embedded:
            entry["url"] = url
        all_entries.extend(embedded)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_entries, f, ensure_ascii=False, indent=2)
    print(f"Knowledge crystal created and saved to {output_path}.")

if __name__ == "__main__":
    BASE_URL = "https://www.quannex.earth/"
    print(f"Starting website crawl and scrape for: {BASE_URL}")
    scraped_data = batch_scrape(BASE_URL, batch_size=10)
    with open("raw_website_data.json", "w", encoding="utf-8") as f:
        json.dump(scraped_data, f, ensure_ascii=False, indent=2)
    print(f"Scraping complete! Data saved to raw_website_data.json.")
    # Now process and embed
    process_and_embed_all("raw_website_data.json", "knowledge.json") 