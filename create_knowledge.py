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

def extract_section_chunks(soup):
    """
    Extracts content by heading sections (h1-h6) for more context-rich chunks.
    Returns a list of (heading, text) tuples.
    """
    chunks = []
    headings = soup.find_all([f'h{i}' for i in range(1, 7)])
    if not headings:
        # Fallback: just return all visible text as one chunk
        text = ' '.join(soup.stripped_strings)
        return [("", text)]
    for idx, heading in enumerate(headings):
        section_title = heading.get_text(strip=True)
        section_content = []
        # Get all elements until the next heading of same or higher level
        for sibling in heading.next_siblings:
            if sibling.name and sibling.name.startswith('h') and int(sibling.name[1]) <= int(heading.name[1]):
                break
            if hasattr(sibling, 'get_text'):
                section_content.append(sibling.get_text(" ", strip=True))
        chunk_text = section_title + "\n" + " ".join(section_content)
        if chunk_text.strip():
            chunks.append((section_title, chunk_text.strip()))
    return chunks

def scrape_clean_text(url):
    """Scrape and clean the main text content from a page, chunked by section."""
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Remove scripts/styles
        for tag in soup(['script', 'style', 'noscript']):
            tag.decompose()
        # Extract section-based chunks
        section_chunks = extract_section_chunks(soup)
        return section_chunks
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return []

def batch_scrape(base_url, batch_size=10):
    """Scrape all internal pages in batches and return a dict of url:[(heading, text)]."""
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

def chunk_text(section_chunks, min_length=200):
    print("Chunking text by section...")
    chunks = []
    for heading, text in section_chunks:
        # Further split if section is too long
        if len(text) > 2 * min_length:
            paragraphs = [p.strip() for p in text.split('\n') if p.strip()]
            current = ""
            for p in paragraphs:
                if len(current) + len(p) < min_length:
                    current += (" " if current else "") + p
                else:
                    if current:
                        chunks.append({"heading": heading, "text": current})
                    current = p
            if current:
                chunks.append({"heading": heading, "text": current})
        else:
            chunks.append({"heading": heading, "text": text})
    print(f"Created {len(chunks)} chunks.")
    return chunks

def embed_chunks(chunks):
    print(f"Embedding {len(chunks)} chunks...")
    embedded = []
    for i, chunk in enumerate(chunks):
        try:
            print(f"Embedding chunk {i+1}/{len(chunks)}...")
            embedding = embed_content(model="models/text-embedding-004", content=chunk["text"])
            embedded.append({"heading": chunk["heading"], "text": chunk["text"], "embedding": embedding["embedding"]})
        except Exception as e:
            print(f"Embedding failed for chunk {i+1}: {e}")
    print(f"Embedded {len(embedded)} chunks.")
    return embedded

def process_and_embed_all(raw_data_path, output_path):
    print(f"Loading raw data from {raw_data_path}...")
    with open(raw_data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    all_entries = []
    for url, section_chunks in data.items():
        print(f"Processing URL: {url}")
        chunks = chunk_text(section_chunks)
        embedded = embed_chunks(chunks)
        for entry in embedded:
            entry["url"] = url
        all_entries.extend(embedded)
    print(f"Saving {len(all_entries)} entries to {output_path}...")
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
    