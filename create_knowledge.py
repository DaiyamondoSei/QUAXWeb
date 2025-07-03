import os
import requests
from bs4 import BeautifulSoup
import json
from google.generativeai import configure, embed_content
from dotenv import load_dotenv
from urllib.parse import urljoin, urlparse
import time
import shutil
import pathlib

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

def extract_curriculum_data(soup):
    """
    Extracts structured course and pricing data from curriculum.html.
    """
    courses_data = []
    pricing_grid = soup.find('div', class_='pricing-grid')
    if pricing_grid:
        pricing_cards = pricing_grid.find_all('div', class_='pricing-card')
        for card in pricing_cards:
            name = card.find('h3').get_text(strip=True) if card.find('h3') else ""
            subtitle = card.find('p').get_text(strip=True) if card.find('p') else ""
            
            regular_price_elem = card.find('span', class_='regular-price')
            regular_price = regular_price_elem.get_text(strip=True) if regular_price_elem else "N/A"
            
            amount_elem = card.find('span', class_='amount')
            currency_elem = card.find('span', class_='currency')
            period_elem = card.find('span', class_='period')
            
            current_price = ""
            if currency_elem and amount_elem and period_elem:
                current_price = f"{currency_elem.get_text(strip=True)}{amount_elem.get_text(strip=True)} {period_elem.get_text(strip=True)}"
            elif amount_elem:
                current_price = amount_elem.get_text(strip=True)
            else:
                current_price = "N/A"

            features = []
            features_list = card.find('div', class_='pricing-features')
            if features_list:
                for li in features_list.find_all('li'):
                    features.append(li.get_text(strip=True))
            
            courses_data.append({
                "name": name,
                "subtitle": subtitle,
                "regular_price": regular_price,
                "current_price": current_price,
                "features": features
            })
    return courses_data

def extract_business_model_data(soup):
    """
    Extracts structured business model data from business_model.html.
    """
    business_data_chunks = []

    # 1. Market Analysis
    market_analysis_section = soup.find('div', class_='content-section', id=lambda x: x and 'market-analysis' in x)
    if market_analysis_section:
        # Market Stats
        market_stats_container = market_analysis_section.find('div', class_='market-stats-container')
        if market_stats_container:
            stats = []
            for stat_card in market_stats_container.find_all('div', class_='stat-card'):
                header = stat_card.find('h3').get_text(strip=True) if stat_card.find('h3') else ""
                value = stat_card.find('div', class_='stat-value').get_text(strip=True) if stat_card.find('div', class_='stat-value') else ""
                label = stat_card.find('div', class_='stat-label').get_text(strip=True) if stat_card.find('div', class_='stat-label') else ""
                projection = stat_card.find('div', class_='stat-projection').get_text(strip=True) if stat_card.find('div', class_='stat-projection') else ""
                stats.append(f"{header}: {value} {label} {projection}".strip())
            if stats:
                business_data_chunks.append(("Market Statistics", "Market Overview: " + "; ".join(stats)))

        # Competitive Landscape
        competitive_analysis = market_analysis_section.find('div', class_='competitive-analysis')
        if competitive_analysis:
            competitor_info = []
            for category in competitive_analysis.find_all('div', class_='competitor-category'):
                cat_name = category.find('h4').get_text(strip=True) if category.find('h4') else ""
                items = [li.get_text(strip=True) for li in category.find_all('li')]
                if cat_name and items:
                    competitor_info.append(f"{cat_name}: {", ".join(items)}")
            if competitor_info:
                business_data_chunks.append(("Competitive Landscape", "Competitors include: " + "; ".join(competitor_info)))

        # Unique Differentiators
        unique_differentiators = market_analysis_section.find('div', class_='unique-differentiators')
        if unique_differentiators:
            diffs = []
            for diff_card in unique_differentiators.find_all('div', class_='differentiator-card'):
                title = diff_card.find('h4').get_text(strip=True) if diff_card.find('h4') else ""
                desc = diff_card.find('p').get_text(strip=True) if diff_card.find('p') else ""
                if title and desc:
                    diffs.append(f"{title}: {desc}")
            if diffs:
                business_data_chunks.append(("Unique Differentiators", "QUANNEX unique differentiators are: " + "; ".join(diffs)))

    # 2. Monetization Strategy
    monetization_section = soup.find('div', class_='content-section', id=lambda x: x and 'monetization-strategy' in x)
    if monetization_section:
        # Pricing Table
        pricing_table = monetization_section.find('div', class_='pricing-table')
        if pricing_table:
            pricing_tiers = []
            for tier_card in pricing_table.find_all('div', class_='pricing-tier'):
                tier_name = tier_card.find('h3', class_='tier-name').get_text(strip=True) if tier_card.find('h3', class_='tier-name') else ""
                tier_price = tier_card.find('p', class_='tier-price').get_text(strip=True) if tier_card.find('p', class_='tier-price') else ""
                tier_features = [li.get_text(strip=True) for li in tier_card.find('ul', class_='tier-features').find_all('li')] if tier_card.find('ul', class_='tier-features') else []
                pricing_tiers.append(f"{tier_name} priced at {tier_price} with features: {", ".join(tier_features)}")
            if pricing_tiers:
                business_data_chunks.append(("Monetization Tiers", "QUANNEX offers: " + "; ".join(pricing_tiers)))

        # Additional Revenue Streams
        additional_revenue_ul = monetization_section.find('h3', string='Additional Revenue Streams').find_next_sibling('ul') if monetization_section.find('h3', string='Additional Revenue Streams') else None
        if additional_revenue_ul:
            streams = [li.get_text(strip=True) for li in additional_revenue_ul.find_all('li')]
            if streams:
                business_data_chunks.append(("Additional Revenue Streams", "Additional revenue streams include: " + ", ".join(streams)))

    # 3. Initial Funding Strategy
    funding_section = soup.find('div', class_='content-section', id=lambda x: x and 'initial-funding-strategy' in x)
    if funding_section:
        funding_options = funding_section.find_all('div', class_='funding-option')
        for option in funding_options:
            title = option.find('h3').get_text(strip=True) if option.find('h3') else ""
            description = option.find('p').get_text(strip=True) if option.find('p') else ""
            goal = option.find('div', class_='funding-goal').get_text(strip=True) if option.find('div', class_='funding-goal') else ""
            business_data_chunks.append((f"Funding Option: {title}", f"{title}: {description} {goal}"))
        
        future_funding_ul = funding_section.find('h3', string='Future Funding Rounds').find_next_sibling('ul') if funding_section.find('h3', string='Future Funding Rounds') else None
        if future_funding_ul:
            rounds = [li.get_text(strip=True) for li in future_funding_ul.find_all('li')]
            if rounds:
                business_data_chunks.append(("Future Funding Rounds", "Future funding rounds may include: " + ", ".join(rounds)))

    # 4. Financial Projections
    financial_projections_section = soup.find('div', class_='content-section', id=lambda x: x and 'financial-projections' in x)
    if financial_projections_section:
        financial_cards = financial_projections_section.find_all('div', class_='financial-card')
        for card in financial_cards:
            phase_name = card.find('h3').get_text(strip=True) if card.find('h3') else ""
            details = [li.get_text(strip=True) for li in card.find_all('li')]
            if phase_name and details:
                business_data_chunks.append((f"Financial Projection: {phase_name}", f"{phase_name} details: {". ".join(details)}"))

    # 5. Risk Assessment & Mitigation
    risk_assessment_section = soup.find('div', class_='content-section', id=lambda x: x and 'risk-assessment-mitigation' in x)
    if risk_assessment_section:
        risk_categories = risk_assessment_section.find_all('div', class_='risk-category')
        for category in risk_categories:
            risk_name = category.find('h3').get_text(strip=True) if category.find('h3') else ""
            risk_level = category.find('p', class_='risk-level').get_text(strip=True) if category.find('p', class_='risk-level') else ""
            risk_description = category.find('p', class_='risk-description').get_text(strip=True) if category.find('p', class_='risk-description') else ""
            mitigation_ul = category.find('div', class_='mitigation').find('ul') if category.find('div', class_='mitigation') else None
            mitigation_strategies = [li.get_text(strip=True) for li in mitigation_ul.find_all('li')] if mitigation_ul else []
            
            business_data_chunks.append((f"Risk: {risk_name}", f"Risk: {risk_name} ({risk_level}). Description: {risk_description}. Mitigation: {". ".join(mitigation_strategies)}"))

    # 6. Revenue Projections (Detailed Chart Data)
    revenue_projection_section = soup.find('div', class_='content-section', id=lambda x: x and 'revenue-projections' in x)
    if revenue_projection_section:
        revenue_chart = revenue_projection_section.find('div', class_='revenue-chart')
        if revenue_chart:
            chart_data = []
            for bar in revenue_chart.find_all('div', class_='chart-bar'):
                year = bar['data-label']
                value = bar['data-value']
                segments = []
                for segment in bar.find('div', class_='bar-segment'):
                    segment_class = segment['class'][1] if len(segment['class']) > 1 else ""
                    height = segment['style'].replace('height:', '').strip()
                    segments.append(f"{segment_class.capitalize()} {height}")
                chart_data.append(f"{year} projected revenue: {value}. Breakdown: {", ".join(segments)}")
            if chart_data:
                business_data_chunks.append(("Revenue Projections", "5-Year Revenue Projections: " + "; ".join(chart_data)))

        revenue_breakdowns = revenue_projection_section.find_all('div', class_='breakdown-card')
        for breakdown_card in revenue_breakdowns:
            title = breakdown_card.find('h4').get_text(strip=True) if breakdown_card.find('h4') else ""
            legend_items = [li.get_text(strip=True) for li in breakdown_card.find_all('div', class_='legend-item')] if breakdown_card.find_all('div', class_='legend-item') else []
            if title and legend_items:
                business_data_chunks.append((f"Revenue Breakdown: {title}", f"{title}: {", ".join(legend_items)}"))

    # 7. Cost Structure
    cost_structure_section = soup.find('div', class_='content-section', id=lambda x: x and 'cost-structure' in x)
    if cost_structure_section:
        cost_cards = cost_structure_section.find_all('div', class_='cost-card')
        for card in cost_cards:
            cost_name = card.find('h3').get_text(strip=True) if card.find('h3') else ""
            cost_percentage = card.find('div', class_='cost-percentage').get_text(strip=True) if card.find('div', class_='cost-percentage') else ""
            cost_details = [li.get_text(strip=True) for li in card.find('ul', class_='cost-details').find_all('li')] if card.find('ul', class_='cost-details') else []
            
            business_data_chunks.append((f"Cost Structure: {cost_name}", f"{cost_name}: {cost_percentage}. Details: {". ".join(cost_details)}"))

    # 8. Enterprise Solutions
    enterprise_solutions_section = soup.find('div', class_='content-section', id=lambda x: x and 'enterprise-solutions' in x)
    if enterprise_solutions_section:
        enterprise_cards = enterprise_solutions_section.find_all('div', class_='enterprise-card')
        for card in enterprise_cards:
            solution_name = card.find('h3').get_text(strip=True) if card.find('h3') else ""
            price = card.find('div', class_='enterprise-price').get_text(strip=True) if card.find('div', class_='enterprise-price') else ""
            features = [li.get_text(strip=True) for li in card.find('ul', class_='enterprise-features').find_all('li')] if card.find('ul', class_='enterprise-features') else []
            
            business_data_chunks.append((f"Enterprise Solution: {solution_name}", f"{solution_name} priced at {price}. Features: {". ".join(features)}"))

    return business_data_chunks

def extract_scientific_validation_data(soup):
    """
    Extracts structured scientific validation data from scientific_validation.html.
    """
    scientific_data_chunks = []

    # Scientific Research Foundation
    research_section = soup.find('section', class_='content-section', id=lambda x: x and 'scientific-research-foundation' in x)
    if research_section:
        for institution_article in research_section.find_all('article', class_='research-institution'):
            name = institution_article.find('h3').get_text(strip=True) if institution_article.find('h3') else ""
            relevant_research = institution_article.find('strong').get_text(strip=True) if institution_article.find('strong') else ""
            researchers = "".join([p.get_text(strip=True) for p in institution_article.find_all('p') if "Key Researchers:" in p.get_text()]).replace("Key Researchers:", "").strip()
            application = "".join([p.get_text(strip=True) for p in institution_article.find_all('p') if "Application:" in p.get_text()]).replace("Application:", "").strip()
            
            if name:
                scientific_data_chunks.append((
                    f"Research Institution: {name}",
                    f"Institution: {name}. Relevant Research: {relevant_research}. Key Researchers: {researchers}. Application: {application}."
                ))

    # Measurement and Validation Methodologies
    measurement_section = soup.find('section', class_='content-section', id=lambda x: x and 'measurement-and-validation-methodologies' in x)
    if measurement_section:
        for measurement_type_article in measurement_section.find_all('article', class_='measurement-type'):
            type_name = measurement_type_article.find('h3').get_text(strip=True) if measurement_type_article.find('h3') else ""
            metrics = [li.get_text(strip=True) for li in measurement_type_article.find_all('li')]
            
            if type_name:
                scientific_data_chunks.append((
                    f"Measurement Type: {type_name}",
                    f"Measurement Type: {type_name}. Metrics: {"; ".join(metrics)}."
                ))

    return scientific_data_chunks

def extract_app_features_data(soup):
    """
    Extracts structured app features data from app_features.html.
    """
    app_features_chunks = []

    # Interface Preview
    interface_preview_section = soup.find('section', class_='visual-preview-section')
    if interface_preview_section:
        for preview_card in interface_preview_section.find_all('div', class_='preview-card'):
            title = preview_card.find('h3').get_text(strip=True) if preview_card.find('h3') else ""
            description = preview_card.find('p').get_text(strip=True) if preview_card.find('p') else ""
            features = [li.get_text(strip=True) for li in preview_card.find_all('li')] if preview_card.find_all('li') else []
            if title:
                app_features_chunks.append((
                    f"App Interface Preview: {title}",
                    f"Interface: {title}. Description: {description}. Key Features: {". ".join(features)}."
                ))

    # Technical Architecture
    tech_architecture_section = soup.find('div', class_='section-container', string=lambda text: text and "Technical Architecture" in text.get_text())
    if tech_architecture_section:
        for tech_card in tech_architecture_section.find_all('div', class_='tech-card'):
            category = tech_card.find('h4').get_text(strip=True) if tech_card.find('h4') else ""
            details = [li.get_text(strip=True) for li in tech_card.find_all('li')] if tech_card.find_all('li') else []
            if category:
                app_features_chunks.append((
                    f"Technical Architecture: {category}",
                    f"Category: {category}. Details: {". ".join(details)}."
                ))

    # Core Features (General)
    core_features_section = soup.find('div', class_='section-container', string=lambda text: text and "Core Features" in text.get_text() and "Initial Launch" not in text.get_text())
    if core_features_section:
        for feature_card in core_features_section.find_all('div', class_='feature'):
            title = feature_card.find('h3').get_text(strip=True) if feature_card.find('h3') else ""
            description = feature_card.find('p').get_text(strip=True) if feature_card.find('p') else ""
            sub_features = [li.get_text(strip=True) for li in feature_card.find_all('li')] if feature_card.find_all('li') else []
            if title:
                app_features_chunks.append((
                    f"Core Feature: {title}",
                    f"Feature: {title}. Description: {description}. Sub-features: {". ".join(sub_features)}."
                ))

    # Core Features (Initial Launch - MVP)
    mvp_features_section = soup.find('div', class_='section-container mvp-section')
    if mvp_features_section:
        for feature_card in mvp_features_section.find_all('div', class_='feature'):
            title = feature_card.find('h3').get_text(strip=True) if feature_card.find('h3') else ""
            progress = feature_card.find('span', string=lambda text: text and 'Complete' in text).get_text(strip=True) if feature_card.find('span', string=lambda text: text and 'Complete' in text) else ""
            description = feature_card.find('p').get_text(strip=True) if feature_card.find('p') else ""
            tags = [span.get_text(strip=True) for span in feature_card.find_all('span', class_='tag')] if feature_card.find_all('span', class_='tag') else []
            if title:
                app_features_chunks.append((
                    f"MVP Feature: {title}",
                    f"Feature: {title}. Progress: {progress}. Description: {description}. Tags: {", ".join(tags)}."
                ))

    # Future Vision Features
    future_vision_section = soup.find('div', class_='section-container future-vision-section')
    if future_vision_section:
        for feature_card in future_vision_section.find_all('div', class_='feature'):
            status = feature_card.find('div', class_='feature-status').get_text(strip=True) if feature_card.find('div', class_='feature-status') else ""
            title = feature_card.find('h3').get_text(strip=True) if feature_card.find('h3') else ""
            description = feature_card.find('p').get_text(strip=True) if feature_card.find('p') else ""
            tags = [span.get_text(strip=True) for span in feature_card.find_all('span', class_='tag')] if feature_card.find_all('span', class_='tag') else []
            if title:
                app_features_chunks.append((
                    f"Future Feature: {title}",
                    f"Feature: {title}. Status: {status}. Description: {description}. Tags: {", ".join(tags)}."
                ))

    # Integration Capabilities
    integration_section = soup.find('div', class_='section-container integration-section')
    if integration_section:
        for integration_card in integration_section.find_all('div', class_='integration-card'):
            title = integration_card.find('h3').get_text(strip=True) if integration_card.find('h3') else ""
            integrations = []
            for li in integration_card.find('li'):
                item_name = li.find('span').get_text(strip=True) if li.find('span') else ""
                item_status = li.find('div', class_='status-badge').get_text(strip=True) if li.find('div', class_='status-badge') else ""
                integrations.append(f"{item_name} ({item_status})")
            if title:
                app_features_chunks.append((
                    f"Integration Capability: {title}",
                    f"Category: {title}. Integrations: {"; ".join(integrations)}."
                ))

    # Advanced Features
    advanced_features_section = soup.find('div', class_='section-container advanced-features-section')
    if advanced_features_section:
        for feature_card in advanced_features_section.find_all('div', class_='advanced-feature'):
            title = feature_card.find('h3').get_text(strip=True) if feature_card.find('h3') else ""
            progress = feature_card.find('span', string=lambda text: text and 'Complete' in text).get_text(strip=True) if feature_card.find('span', string=lambda text: text and 'Complete' in text) else ""
            description = feature_card.find('p').get_text(strip=True) if feature_card.find('p') else ""
            sub_features = [li.get_text(strip=True) for li in feature_card.find_all('li')] if feature_card.find_all('li') else []
            tags = [span.get_text(strip=True) for span in feature_card.find_all('span', class_='tag')] if feature_card.find_all('span', class_='tag') else []
            if title:
                app_features_chunks.append((
                    f"Advanced Feature: {title}",
                    f"Feature: {title}. Progress: {progress}. Description: {description}. Sub-features: {". ".join(sub_features)}. Tags: {", ".join(tags)}."
                ))

    return app_features_chunks

def extract_project_proposal_data(soup):
    """
    Extracts structured data from project_proposal.html.
    """
    project_proposal_chunks = []

    # Executive Summary - Core Innovation Highlight Box
    executive_summary_section = soup.find('div', id='executive-summary')
    if executive_summary_section:
        highlight_box = executive_summary_section.find('div', class_='highlight-box')
        if highlight_box:
            title = highlight_box.find('h4').get_text(strip=True) if highlight_box.find('h4') else ""
            content = highlight_box.find('p').get_text(strip=True) if highlight_box.find('p') else ""
            project_proposal_chunks.append((
                f"Executive Summary: {title}",
                f"Core Innovation: {title}. Description: {content}."
            ))

    # Vision and Concept - Five Quantum Parameters Framework
    vision_concept_section = soup.find('div', id='vision-concept')
    if vision_concept_section:
        quantum_params_ul = vision_concept_section.find('h3', string='Five Quantum Parameters Framework').find_next_sibling('ul')
        if quantum_params_ul:
            params = [li.get_text(strip=True) for li in quantum_params_ul.find_all('li')]
            project_proposal_chunks.append((
                "Five Quantum Parameters Framework",
                "The Five Quantum Parameters Framework includes: " + "; ".join(params) + "."
            ))

    # Key Features - 13-Stage Astral Body Evolution System
    key_features_section = soup.find('div', id='key-features')
    if key_features_section:
        astral_stages_ol = key_features_section.find('h3', string='13-Stage Astral Body Evolution System').find_next_sibling('ol')
        if astral_stages_ol:
            stages = [li.get_text(strip=True) for li in astral_stages_ol.find_all('li')]
            project_proposal_chunks.append((
                "13-Stage Astral Body Evolution System",
                "The 13-Stage Astral Body Evolution System includes: " + "; ".join(stages) + "."
            ))

        # Key Features - Five Mastery Paths
        mastery_paths_ul = key_features_section.find('h3', string='Five Mastery Paths').find_next_sibling('ul')
        if mastery_paths_ul:
            paths = [li.get_text(strip=True) for li in mastery_paths_ul.find_all('li')]
            project_proposal_chunks.append((
                "Five Mastery Paths",
                "The Five Mastery Paths are: " + "; ".join(paths) + "."
            ))

        # Key Features - Innovative Features Highlight Box
        innovative_features_box = key_features_section.find('div', class_='highlight-box')
        if innovative_features_box:
            features = [li.get_text(strip=True) for li in innovative_features_box.find_all('li')] if innovative_features_box.find_all('li') else []
            project_proposal_chunks.append((
                "Innovative Features",
                "Innovative features include: " + "; ".join(features) + "."
            ))

    # Scientific Validation - Research Foundation
    scientific_validation_section = soup.find('div', id='scientific-validation')
    if scientific_validation_section:
        research_institutions_ul = scientific_validation_section.find('h3', string='Research Foundation').find_next_sibling('ul')
        if research_institutions_ul:
            institutions = [li.get_text(strip=True) for li in research_institutions_ul.find_all('li')]
            project_proposal_chunks.append((
                "Scientific Validation: Research Foundation",
                "Research is based on leading institutions such as: " + "; ".join(institutions) + "."
            ))

        # Scientific Validation - Multi-Consciousness Band Approach
        consciousness_bands_ul = scientific_validation_section.find('h3', string='Multi-Consciousness Band Approach').find_next_sibling('ul')
        if consciousness_bands_ul:
            bands = [li.get_text(strip=True) for li in consciousness_bands_ul.find_all('li')]
            project_proposal_chunks.append((
                "Multi-Consciousness Band Approach",
                "The Multi-Consciousness Band Approach targets: " + "; ".join(bands) + "."
            ))

    # Implementation Strategy - Phases
    implementation_section = soup.find('div', id='implementation')
    if implementation_section:
        for i in range(1, 5):
            phase_heading = implementation_section.find('h3', string=lambda text: text and f'Phase {i}:' in text)
            if phase_heading:
                phase_ul = phase_heading.find_next_sibling('ul')
                if phase_ul:
                    features = [li.get_text(strip=True) for li in phase_ul.find_all('li')]
                    project_proposal_chunks.append((
                        f"Implementation Strategy: Phase {i}",
                        f"Phase {i} includes: " + "; ".join(features) + "."
                    ))

    # Business Model - Monetization Strategy
    business_model_section = soup.find('div', id='business-model')
    if business_model_section:
        monetization_ul = business_model_section.find('h3', string='Monetization Strategy').find_next_sibling('ul')
        if monetization_ul:
            tiers = [li.get_text(strip=True) for li in monetization_ul.find_all('li')]
            project_proposal_chunks.append((
                "Business Model: Monetization Strategy",
                "Monetization strategy includes: " + "; ".join(tiers) + "."
            ))

        # Business Model - Revenue Streams
        revenue_streams_ul = business_model_section.find('h3', string='Revenue Streams').find_next_sibling('ul')
        if revenue_streams_ul:
            streams = [li.get_text(strip=True) for li in revenue_streams_ul.find_all('li')]
            project_proposal_chunks.append((
                "Business Model: Revenue Streams",
                "Revenue streams include: " + "; ".join(streams) + "."
            ))

        # Business Model - Growth Strategy Highlight Box
        growth_strategy_box = business_model_section.find('div', class_='highlight-box')
        if growth_strategy_box:
            strategies = [li.get_text(strip=True) for li in growth_strategy_box.find_all('li')] if growth_strategy_box.find_all('li') else []
            project_proposal_chunks.append((
                "Business Model: Growth Strategy",
                "Growth strategies include: " + "; ".join(strategies) + "."
            ))

    return project_proposal_chunks

def extract_academic_alignment_data(soup):
    """
    Extracts structured data from academic_alignment.html.
    """
    academic_chunks = []

    # Key Financial Focus Areas
    financial_focus_section = soup.find('section', id='financial-focus')
    if financial_focus_section:
        for research_area in financial_focus_section.find_all('div', class_='research-area'):
            title = research_area.find('h3').get_text(strip=True) if research_area.find('h3') else ""
            questions = [li.get_text(strip=True) for li in research_area.find('h4', string='Research Questions').find_next_sibling('ul').find_all('li')] if research_area.find('h4', string='Research Questions') else []
            methodologies = [li.get_text(strip=True) for li in research_area.find('h4', string='Methodologies').find_next_sibling('ul').find_all('li')] if research_area.find('h4', string='Methodologies') else []
            academic_chunks.append((
                f"Academic Alignment: Financial Focus - {title}",
                f"Financial Focus Area: {title}. Research Questions: {"; ".join(questions)}. Methodologies: {"; ".join(methodologies)}."
            ))

    # Academic Integration Framework - Thesis Structure
    thesis_structure_section = soup.find('section', id='academic-integration')
    if thesis_structure_section:
        thesis_title = thesis_structure_section.find('h4', string='Proposed Title').find_next_sibling('p').get_text(strip=True) if thesis_structure_section.find('h4', string='Proposed Title') else ""
        chapter_structure = [li.get_text(strip=True) for li in thesis_structure_section.find('h4', string='Chapter Structure').find_next_sibling('ol').find_all('li')] if thesis_structure_section.find('h4', string='Chapter Structure') else []
        academic_chunks.append((
            "Academic Alignment: Thesis Structure",
            f"Proposed Thesis Title: {thesis_title}. Chapter Structure: {"; ".join(chapter_structure)}."
        ))

        # Learning Objectives Alignment
        for objective_group in thesis_structure_section.find_all('div', class_='objective-group'):
            group_name = objective_group.find('h4').get_text(strip=True) if objective_group.find('h4') else ""
            objectives = [li.get_text(strip=True) for li in objective_group.find_all('li')] if objective_group.find_all('li') else []
            academic_chunks.append((
                f"Academic Alignment: Learning Objectives - {group_name}",
                f"Learning Objectives for {group_name}: {"; ".join(objectives)}."
            ))

    # Implementation Timeline
    implementation_timeline_section = soup.find('section', id='implementation')
    if implementation_timeline_section:
        for timeline_item in implementation_timeline_section.find_all('div', class_='timeline-item'):
            phase_name = timeline_item.find('h3').get_text(strip=True) if timeline_item.find('h3') else ""
            details = [li.get_text(strip=True) for li in timeline_item.find_all('li')] if timeline_item.find('li') else []
            academic_chunks.append((
                f"Academic Alignment: Implementation Timeline - {phase_name}",
                f"Implementation Phase: {phase_name}. Details: {"; ".join(details)}."
            ))

    # Academic Integration Timeline
    academic_integration_timeline_section = soup.find('div', class_='academic-timeline')
    if academic_integration_timeline_section:
        for academic_phase in academic_integration_timeline_section.find_all('div', class_='academic-phase'):
            phase_name = academic_phase.find('h3').get_text(strip=True) if academic_phase.find('h3') else ""
            for sub_phase_ul in academic_phase.find_all('ul', recursive=False):
                sub_phase_title = sub_phase_ul.find_previous_sibling('strong').get_text(strip=True) if sub_phase_ul.find_previous_sibling('strong') else ""
                sub_phase_details = [li.get_text(strip=True) for li in sub_phase_ul.find_all('li')] if sub_phase_ul.find_all('li') else []
                academic_chunks.append((
                    f"Academic Alignment: Academic Integration Timeline - {phase_name} - {sub_phase_title}",
                    f"Academic Integration Timeline Phase: {phase_name}, Sub-phase: {sub_phase_title}. Details: {"; ".join(sub_phase_details)}."
                ))

    # Thesis Integration
    thesis_integration_section = soup.find('div', class_='content-section', string=lambda text: text and "Thesis Integration" in text.get_text())
    if thesis_integration_section:
        research_focus_question = thesis_integration_section.find('div', class_='thesis-question').get_text(strip=True) if thesis_integration_section.find('div', class_='thesis-question') else ""
        methodology = [li.get_text(strip=True) for li in thesis_integration_section.find('h4', string='Methodology').find_next_sibling('ul').find_all('li')] if thesis_integration_section.find('h4', string='Methodology') else []
        academic_value = [li.get_text(strip=True) for li in thesis_integration_section.find('h4', string='Academic Value').find_next_sibling('ul').find_all('li')] if thesis_integration_section.find('h4', string='Academic Value') else []
        academic_chunks.append((
            "Academic Alignment: Thesis Integration",
            f"Research Focus Question: {research_focus_question}. Methodology: {"; ".join(methodology)}. Academic Value: {"; ".join(academic_value)}."
        ))

    # University Support Ecosystem
    university_support_section = soup.find('div', class_='university-support')
    if university_support_section:
        for support_card in university_support_section.find_all('div', class_='support-card'):
            title = support_card.find('h3').get_text(strip=True) if support_card.find('h3') else ""
            description = support_card.find('p').get_text(strip=True) if support_card.find('p') else ""
            features = [li.get_text(strip=True) for li in support_card.find_all('li')] if support_card.find_all('li') else []
            academic_chunks.append((
                f"Academic Alignment: University Support - {title}",
                f"University Support: {title}. Description: {description}. Features: {"; ".join(features)}."
            ))

    # Application Process
    application_process_section = soup.find('div', class_='application-steps')
    if application_process_section:
        for step in application_process_section.find_all('div', class_='step'):
            step_number = step.find('div', class_='step-number').get_text(strip=True) if step.find('div', class_='step-number') else ""
            step_title = step.find('h3').get_text(strip=True) if step.find('h3') else ""
            step_description = step.find('p').get_text(strip=True) if step.find('p') else ""
            step_details = [li.get_text(strip=True) for li in step.find('div', class_='step-details').find_all('li')] if step.find('div', class_='step-details') else []
            step_timeline = step.find('div', class_='step-timeline').get_text(strip=True) if step.find('div', class_='step-timeline') else ""
            academic_chunks.append((
                f"Academic Alignment: Application Process - Step {step_number}",
                f"Application Process Step {step_number}: {step_title}. Description: {step_description}. Details: {"; ".join(step_details)}. Timeline: {step_timeline}."
            ))

    return academic_chunks

def extract_advanced_concepts_data(soup):
    """
    Extracts structured data from advanced_concepts.html.
    """
    advanced_concepts_chunks = []

    # Multi-Sensory Quantum Engagement
    multi_sensory_section = soup.find('section', class_='multi-sensory')
    if multi_sensory_section:
        for feature_card in multi_sensory_section.find_all('div', class_='feature-card'):
            title = feature_card.find('h3').get_text(strip=True) if feature_card.find('h3') else ""
            features = [li.get_text(strip=True) for li in feature_card.find_all('li')] if feature_card.find_all('li') else []
            advanced_concepts_chunks.append((
                f"Multi-Sensory Engagement: {title}",
                f"Type: {title}. Features: {"; ".join(features)}."
            ))

    # Staged Disclosure Protocol
    staged_disclosure_section = soup.find('section', id='staged-disclosure')
    if staged_disclosure_section:
        for stage_card in staged_disclosure_section.find_all('div', class_='stage'):
            stage_number = stage_card.find('div', class_='stage-number').get_text(strip=True) if stage_card.find('div', class_='stage-number') else ""
            stage_title = stage_card.find('h3').get_text(strip=True) if stage_card.find('h3') else ""
            stage_description = stage_card.find('p').get_text(strip=True) if stage_card.find('p') else ""
            
            details_section = stage_card.find('div', class_='stage-details')
            if details_section:
                learning_objectives = [li.get_text(strip=True) for li in details_section.find('h4', string='Learning Objectives').find_next_sibling('ul').find_all('li')] if details_section.find('h4', string='Learning Objectives') else []
                prerequisites = [li.get_text(strip=True) for li in details_section.find('h4', string='Prerequisites').find_next_sibling('ul').find_all('li')] if details_section.find('h4', string='Prerequisites') else []
                learning_metrics = [li.get_text(strip=True) for li in details_section.find('h4', string='Learning Metrics').find_next_sibling('ul').find_all('li')] if details_section.find('h4', string='Learning Metrics') else []
                practical_exercises = [li.get_text(strip=True) for li in details_section.find('h4', string='Practical Exercises').find_next_sibling('ul').find_all('li')] if details_section.find('h4', string='Practical Exercises') else []
                scientific_background = [li.get_text(strip=True) for li in details_section.find('h4', string='Scientific Foundation').find_next_sibling('ul').find_all('li')] if details_section.find('h4', string='Scientific Foundation') else []

                advanced_concepts_chunks.append((
                    f"Staged Disclosure Protocol: Stage {stage_number} - {stage_title}",
                    f"Stage {stage_number}: {stage_title}. Description: {stage_description}. Learning Objectives: {"; ".join(learning_objectives)}. Prerequisites: {"; ".join(prerequisites)}. Learning Metrics: {"; ".join(learning_metrics)}. Practical Exercises: {"; ".join(practical_exercises)}. Scientific Foundation: {"; ".join(scientific_background)}."
                ))

    # Quantum Mastery Paths
    mastery_paths_section = soup.find('section', class_='mastery-paths')
    if mastery_paths_section:
        for path_card in mastery_paths_section.find_all('div', class_='path'):
            path_name = path_card.find('h3').get_text(strip=True) if path_card.find('h3') else ""
            path_description = path_card.find('p').get_text(strip=True) if path_card.find('p') else ""
            
            stage_progression = []
            progression_ul = path_card.find('div', class_='stage-progression')
            if progression_ul:
                stage_progression = [li.get_text(strip=True) for li in progression_ul.find_all('li')] if progression_ul.find_all('li') else []

            path_details = path_card.find('div', class_='path-details')
            if path_details:
                quantum_integration = [li.get_text(strip=True) for li in path_details.find('h4', string='Quantum Mechanics Integration').find_next_sibling('ul').find_all('li')] if path_details.find('h4', string='Quantum Mechanics Integration') else []
                practice_protocols = [li.get_text(strip=True) for li in path_details.find('h4', string='Practice Protocols').find_next_sibling('ul').find_all('li')] if path_details.find('h4', string='Practice Protocols') else []

                advanced_concepts_chunks.append((
                    f"Quantum Mastery Path: {path_name}",
                    f"Path: {path_name}. Description: {path_description}. Stage Progression: {"; ".join(stage_progression)}. Quantum Mechanics Integration: {"; ".join(quantum_integration)}. Practice Protocols: {"; ".join(practice_protocols)}."
                ))

    # Quantum Mechanics Engine
    quantum_engine_section = soup.find('section', class_='quantum-engine')
    if quantum_engine_section:
        for engine_feature in quantum_engine_section.find_all('div', class_='engine-feature'):
            title = engine_feature.find('h3').get_text(strip=True) if engine_feature.find('h3') else ""
            features = [li.get_text(strip=True) for li in engine_feature.find_all('li')] if engine_feature.find_all('li') else []
            advanced_concepts_chunks.append((
                f"Quantum Mechanics Engine: {title}",
                f"Category: {title}. Features: {"; ".join(features)}."
            ))

    # Technical Implementation
    technical_implementation_section = soup.find('section', class_='implementation')
    if technical_implementation_section:
        for impl_card in technical_implementation_section.find_all('div', class_='implementation-card'):
            title = impl_card.find('h3').get_text(strip=True) if impl_card.find('h3') else ""
            details = [li.get_text(strip=True) for li in impl_card.find_all('li')] if impl_card.find_all('li') else []
            advanced_concepts_chunks.append((
                f"Technical Implementation: {title}",
                f"Category: {title}. Details: {"; ".join(details)}."
            ))

    return advanced_concepts_chunks

def extract_advanced_progression_data(soup):
    """
    Extracts structured data from advanced_progression.html.
    """
    progression_chunks = []

    # Evolution Stages
    evolution_stages_section = soup.find('div', class_='evolution-stages')
    if evolution_stages_section:
        for stage_div in evolution_stages_section.find_all('div', class_='stage'):
            phase_name = stage_div.find('h3').get_text(strip=True) if stage_div.find('h3') else ""
            details_ul = stage_div.find('div', class_='stage-details').find('ul')
            details = [li.get_text(strip=True) for li in details_ul.find_all('li')] if details_ul else []
            complexity_fill = stage_div.find('div', class_='complexity-fill')
            complexity = complexity_fill['style'].replace('width:', '').strip() if complexity_fill else "N/A"
            progression_chunks.append((
                f"Evolution Stage: {phase_name}",
                f"Phase: {phase_name}. Core Features: {"; ".join(details)}. Complexity: {complexity}."
            ))

    # Feature Implementation Details
    feature_impl_section = soup.find('div', class_='implementation-phases')
    if feature_impl_section:
        for phase_div in feature_impl_section.find_all('div', class_='phase'):
            title = phase_div.find('h3').get_text(strip=True) if phase_div.find('h3') else ""
            details = [li.get_text(strip=True) for li in phase_div.find_all('li')] if phase_div.find_all('li') else []
            progression_chunks.append((
                f"Feature Implementation: {title}",
                f"Feature: {title}. Details: {"; ".join(details)}."
            ))

    # Future Self Connection
    future_self_connection_section = soup.find('div', class_='content-section', string=lambda text: text and "Future Self Connection" in text.get_text())
    if future_self_connection_section:
        for concept_card in future_self_connection_section.find_all('div', class_='concept-card'):
            title = concept_card.find('h3').get_text(strip=True) if concept_card.find('h3') else ""
            description = concept_card.find('p').get_text(strip=True) if concept_card.find('p') else ""
            progression_chunks.append((
                f"Future Self Connection Concept: {title}",
                f"Concept: {title}. Description: {description}."
            ))

    # 4-Week Intensive Curriculum
    curriculum_timeline_section = soup.find('div', class_='curriculum-timeline')
    if curriculum_timeline_section:
        for week_div in curriculum_timeline_section.find_all('div', class_='timeline-week'):
            week_title = week_div.find('h3').get_text(strip=True) if week_div.find('h3') else ""
            details = [li.get_text(strip=True) for li in week_div.find_all('li')] if week_div.find_all('li') else []
            progression_chunks.append((
                f"4-Week Curriculum: {week_title}",
                f"Week: {week_title}. Details: {"; ".join(details)}."
            ))

    # Visual Design Evolution
    visual_evolution_section = soup.find('div', class_='visual-evolution')
    if visual_evolution_section:
        for visual_element in visual_evolution_section.find_all('div', class_='visual-element'):
            title = visual_element.find('h3').get_text(strip=True) if visual_element.find('h3') else ""
            description = visual_element.find('p').get_text(strip=True) if visual_element.find('p') else ""
            progression_chunks.append((
                f"Visual Design Evolution: {title}",
                f"Element: {title}. Description: {description}."
            ))

    # Implementation Strategy (Timeline)
    impl_strategy_timeline_section = soup.find('div', class_='implementation-timeline')
    if impl_strategy_timeline_section:
        for phase_div in impl_strategy_timeline_section.find_all('div', class_='timeline-phase'):
            duration = phase_div.find('div', class_='phase-duration').get_text(strip=True) if phase_div.find('div', class_='phase-duration') else ""
            title = phase_div.find('h3').get_text(strip=True) if phase_div.find('h3') else ""
            details = [li.get_text(strip=True) for li in phase_div.find_all('li')] if phase_div.find_all('li') else []
            progression_chunks.append((
                f"Implementation Strategy: {title}",
                f"Phase: {title}. Duration: {duration}. Details: {"; ".join(details)}."
            ))

    # Engagement Optimization
    engagement_optimization_section = soup.find('div', class_='engagement-features')
    if engagement_optimization_section:
        for feature_card in engagement_optimization_section.find_all('div', class_='feature-card'):
            title = feature_card.find('h3').get_text(strip=True) if feature_card.find('h3') else ""
            description = feature_card.find('p').get_text(strip=True) if feature_card.find('p') else ""
            progression_chunks.append((
                f"Engagement Optimization: {title}",
                f"Feature: {title}. Description: {description}."
            ))

    # Quantum Experience Points (QXP)
    qxp_section = soup.find('div', class_='content-section', string=lambda text: text and "Quantum Experience Points (QXP)" in text.get_text())
    if qxp_section:
        for concept_card in qxp_section.find_all('div', class_='concept-card'):
            title = concept_card.find('h3').get_text(strip=True) if concept_card.find('h3') else ""
            details = [li.get_text(strip=True) for li in concept_card.find_all('li')] if concept_card.find_all('li') else []
            progression_chunks.append((
                f"QXP: {title}",
                f"Category: {title}. Details: {"; ".join(details)}."
            ))

    return progression_chunks

def extract_quantum_parameters_data(soup):
    """
    Extracts structured data from quantum_parameters.html.
    """
    quantum_parameters_chunks = []

    # Core Parameters
    core_parameters_section = soup.find('div', class_='section-container', string=lambda text: text and "Core Parameters" in text.get_text())
    if core_parameters_section:
        for parameter_card in core_parameters_section.find_all('div', class_='parameter-card'):
            param_name = parameter_card.find('h3').get_text(strip=True) if parameter_card.find('h3') else ""
            param_description = parameter_card.find('p', class_='parameter-description').get_text(strip=True) if parameter_card.find('p', class_='parameter-description') else ""
            
            exercises = [li.get_text(strip=True) for li in parameter_card.find('h4', string='Exercises').find_next_sibling('ul').find_all('li')] if parameter_card.find('h4', string='Exercises') else []
            metrics = [li.get_text(strip=True) for li in parameter_card.find('h4', string='Metrics').find_next_sibling('ul').find_all('li')] if parameter_card.find('h4', string='Metrics') else []
            represents = [li.get_text(strip=True) for li in parameter_card.find('h4', string='Represents in QNX:').find_next_sibling('ul').find_all('li')] if parameter_card.find('h4', string='Represents in QNX:') else []
            symbolic_goal = parameter_card.find('h4', string='Symbolic Goal:').find_next_sibling('p').get_text(strip=True) if parameter_card.find('h4', string='Symbolic Goal:') else ""

            quantum_parameters_chunks.append((
                f"Quantum Parameter: {param_name}",
                f"Parameter: {param_name}. Description: {param_description}. Exercises: {"; ".join(exercises)}. Metrics: {"; ".join(metrics)}. Represents in QNX: {"; ".join(represents)}. Symbolic Goal: {symbolic_goal}."
            ))

    # Tracking in the App
    tracking_section = soup.find('div', class_='section-container', string=lambda text: text and "Tracking in the App" in text.get_text())
    if tracking_section:
        tracking_text = tracking_section.find('p').get_text(strip=True) if tracking_section.find('p') else ""
        quantum_parameters_chunks.append((
            "Quantum Parameters: Tracking in App",
            f"Tracking in the App: {tracking_text}"
        ))

    # Integration in the App
    integration_section = soup.find('div', class_='section-container', string=lambda text: text and "Integration in the App" in text.get_text())
    if integration_section:
        integration_text = integration_section.find('p').get_text(strip=True) if integration_section.find('p') else ""
        integration_features = [li.get_text(strip=True) for li in integration_section.find('ul').find_all('li')] if integration_section.find('ul') else []
        quantum_parameters_chunks.append((
            "Quantum Parameters: Integration in App",
            f"Integration in the App: {integration_text}. Features: {"; ".join(integration_features)}."
        ))

    return quantum_parameters_chunks

def extract_consciousness_accelerator_data(soup):
    """
    Extracts structured data from consciousness_accelerator.html.
    """
    accelerator_chunks = []

    # Core Concept
    core_concept_section = soup.find('div', class_='section-container', string=lambda text: text and "Core Concept" in text.get_text())
    if core_concept_section:
        vision = core_concept_section.find('h3', string='Vision').find_next_sibling('p').get_text(strip=True) if core_concept_section.find('h3', string='Vision') else ""
        target_audience = [li.get_text(strip=True) for li in core_concept_section.find('h3', string='Target Audience').find_next_sibling('ul').find_all('li')] if core_concept_section.find('h3', string='Target Audience') else []
        accelerator_chunks.append((
            "Consciousness Accelerator: Core Concept",
            f"Vision: {vision}. Target Audience: {"; ".join(target_audience)}."
        ))

    # Your Quantum Journey
    quantum_journey_section = soup.find('div', class_='section-container progress-visualization')
    if quantum_journey_section:
        for stage in quantum_journey_section.find_all('div', class_='progress-stage'):
            stage_name = stage.find('h4').get_text(strip=True) if stage.find('h4') else ""
            accelerator_chunks.append((
                f"Quantum Journey Stage: {stage_name}",
                f"Stage: {stage_name}."
            ))
        for stat_card in quantum_journey_section.find_all('div', class_='stat-card'):
            stat_name = stat_card.find('h4').get_text(strip=True) if stat_card.find('h4') else ""
            stat_value = stat_card.find('p', class_='stat-value').get_text(strip=True) if stat_card.find('p', class_='stat-value') else ""
            accelerator_chunks.append((
                f"Quantum Journey Stat: {stat_name}",
                f"Stat: {stat_name}. Value: {stat_value}."
            ))

    # Key Features
    key_features_section = soup.find('div', class_='section-container', string=lambda text: text and "Key Features" in text.get_text())
    if key_features_section:
        for h3 in key_features_section.find_all('h3'):
            feature_category = h3.get_text(strip=True)
            features = [li.get_text(strip=True) for li in h3.find_next_sibling('ul').find_all('li')] if h3.find_next_sibling('ul') else []
            accelerator_chunks.append((
                f"Key Feature Category: {feature_category}",
                f"Category: {feature_category}. Features: {"; ".join(features)}."
            ))

    # User Journey
    user_journey_section = soup.find('div', class_='section-container', string=lambda text: text and "User Journey" in text.get_text())
    if user_journey_section:
        for h3 in user_journey_section.find_all('h3'):
            journey_phase = h3.get_text(strip=True)
            steps = [li.get_text(strip=True) for li in h3.find_next_sibling('ul').find_all('li')] if h3.find_next_sibling('ul') else []
            accelerator_chunks.append((
                f"User Journey Phase: {journey_phase}",
                f"Phase: {journey_phase}. Steps: {"; ".join(steps)}."
            ))

    # Enhanced Progress Insights
    progress_insights_section = soup.find('div', class_='section-container progress-insights')
    if progress_insights_section:
        for insight_card in progress_insights_section.find_all('div', class_='insight-card'):
            title = insight_card.find('h4').get_text(strip=True) if insight_card.find('h4') else ""
            description = insight_card.find('p').get_text(strip=True) if insight_card.find('p') else ""
            accelerator_chunks.append((
                f"Progress Insight: {title}",
                f"Insight: {title}. Description: {description}."
            ))

    # Scientific Integration
    scientific_integration_section = soup.find('div', class_='section-container scientific-integration')
    if scientific_integration_section:
        for research_card in scientific_integration_section.find_all('div', class_='research-card'):
            title = research_card.find('h4').get_text(strip=True) if research_card.find('h4') else ""
            description = research_card.find('p').get_text(strip=True) if research_card.find('p') else ""
            accelerator_chunks.append((
                f"Scientific Integration: {title}",
                f"Area: {title}. Description: {description}."
            ))

    # Community Connection
    community_section = soup.find('div', class_='section-container community-section')
    if community_section:
        for community_card in community_section.find_all('div', class_='community-card'):
            title = community_card.find('h4').get_text(strip=True) if community_card.find('h4') else ""
            description = community_card.find('p').get_text(strip=True) if community_card.find('p') else ""
            accelerator_chunks.append((
                f"Community Feature: {title}",
                f"Feature: {title}. Description: {description}."
            ))

    return accelerator_chunks

def extract_consciousness_bands_data(soup):
    """
    Extracts structured data from consciousness_bands.html.
    """
    bands_chunks = []

    # Multi-Consciousness Band Approach
    consciousness_bands_section = soup.find('div', class_='consciousness-bands')
    if consciousness_bands_section:
        for band_div in consciousness_bands_section.find_all('div', class_='band'):
            band_header = band_div.find('h4').get_text(strip=True) if band_div.find('h4') else ""
            band_description = band_div.find('div', class_='band-content').find('p').get_text(strip=True) if band_div.find('div', class_='band-content') and band_div.find('div', class_='band-content').find('p') else ""
            band_features = [li.get_text(strip=True) for li in band_div.find('div', class_='band-content').find('ul').find_all('li')] if band_div.find('div', class_='band-content') and band_div.find('div', class_='band-content').find('ul') else []
            band_progress = band_div.find('div', class_='band-progress').find('div', class_='progress-bar')['style'].replace('width:', '').strip() if band_div.find('div', class_='band-progress') and band_div.find('div', class_='band-progress').find('div', class_='progress-bar') else "N/A"
            band_details = [li.get_text(strip=True) for li in band_div.find('div', class_='band-details').find('ul').find_all('li')] if band_div.find('div', class_='band-details') and band_div.find('div', class_='band-details').find('ul') else []

            bands_chunks.append((
                f"Consciousness Band: {band_header}",
                f"Band: {band_header}. Description: {band_description}. Features: {"; ".join(band_features)}. Progress: {band_progress}. Details: {"; ".join(band_details)}."
            ))

    # Scientific Validation Framework (within consciousness_bands.html)
    scientific_validation_section = soup.find('div', class_='scientific-validation')
    if scientific_validation_section:
        for validation_card in scientific_validation_section.find_all('div', class_='validation-card'):
            card_title = validation_card.find('h4').get_text(strip=True) if validation_card.find('h4') else ""
            card_items = [li.get_text(strip=True) for li in validation_card.find_all('li')] if validation_card.find_all('li') else []
            bands_chunks.append((
                f"Consciousness Bands Scientific Validation: {card_title}",
                f"Category: {card_title}. Items: {"; ".join(card_items)}."
            ))

    return bands_chunks

def extract_implementation_plan_data(soup):
    """
    Extracts structured data from implementation_plan.html.
    """
    implementation_chunks = []

    # Phased Sections (Phase 1-5)
    for i in range(1, 6):
        phase_section = soup.find('div', class_='content-section', id=f'phase-{i}')
        if phase_section:
            for card in phase_section.find_all('div', class_='phase-card'):
                card_title = card.find('h3').get_text(strip=True) if card.find('h3') else ""
                card_content = card.find('p').get_text(strip=True) if card.find('p') else ""
                card_list_items = [li.get_text(strip=True) for li in card.find_all('li')] if card.find_all('li') else []
                
                implementation_chunks.append((
                    f"Implementation Plan: Phase {i} - {card_title}",
                    f"Phase {i}, {card_title}: {card_content}. Details: {"; ".join(card_list_items)}."
                ))

    # Timeline Section
    timeline_section = soup.find('div', class_='content-section', id='timeline')
    if timeline_section:
        for phase_div in timeline_section.find_all('div', class_='phase'):
            phase_header = phase_div.find('h3').get_text(strip=True) if phase_div.find('h3') else ""
            phase_duration = phase_div.find('div', class_='phase-duration').get_text(strip=True) if phase_div.find('div', class_='phase-duration') else ""
            
            objectives = []
            objectives_div = phase_div.find('div', class_='phase-objectives')
            if objectives_div:
                for ul in objectives_div.find_all('ul', recursive=False):
                    obj_title = ul.find_previous_sibling('strong').get_text(strip=True) if ul.find_previous_sibling('strong') else ""
                    obj_items = [li.get_text(strip=True) for li in ul.find_all('li')] if ul.find_all('li') else []
                    objectives.append(f"{obj_title}: {"; ".join(obj_items)}")

            deliverables = []
            deliverables_div = phase_div.find('div', class_='phase-deliverables')
            if deliverables_div:
                for ul in deliverables_div.find_all('ul', recursive=False):
                    del_title = ul.find_previous_sibling('strong').get_text(strip=True) if ul.find_previous_sibling('strong') else ""
                    del_items = [li.get_text(strip=True) for li in ul.find_all('li')] if ul.find_all('li') else []
                    deliverables.append(f"{del_title}: {"; ".join(del_items)}")

            implementation_chunks.append((
                f"Implementation Timeline: {phase_header}",
                f"Phase: {phase_header}. Duration: {phase_duration}. Objectives: {"; ".join(objectives)}. Deliverables: {"; ".join(deliverables)}."
            ))

    # Risk Management
    risk_section = soup.find('div', class_='content-section', id='risks')
    if risk_section:
        for risk_card in risk_section.find_all('div', class_='risk-card'):
            risk_phase = risk_card.find('h3').get_text(strip=True) if risk_card.find('h3') else ""
            risks = []
            for li in risk_card.find('li'):
                risk_desc = li.find('strong').get_text(strip=True) if li.find('strong') else ""
                mitigation = li.find('ul').get_text(strip=True) if li.find('ul') else ""
                risks.append(f"Risk: {risk_desc}. Mitigation: {mitigation}")
            implementation_chunks.append((
                f"Risk Management: {risk_phase}",
                f"Risks for {risk_phase}: {"; ".join(risks)}."
            ))

    # Financial Projections (within implementation_plan.html)
    financial_projections_section = soup.find('div', class_='content-section', string=lambda text: text and "Financial Projections" in text.get_text())
    if financial_projections_section:
        for financial_card in financial_projections_section.find_all('div', class_='financial-card'):
            phase_name = financial_card.find('h3').get_text(strip=True) if financial_card.find('h3') else ""
            details = [li.get_text(strip=True) for li in financial_card.find_all('li')] if financial_card.find_all('li') else []
            implementation_chunks.append((
                f"Implementation Plan Financial Projection: {phase_name}",
                f"{phase_name} details: {". ".join(details)}"
            ))

    # Academic Integration Timeline (within implementation_plan.html)
    academic_integration_timeline_section = soup.find('div', class_='academic-timeline')
    if academic_integration_timeline_section:
        for academic_phase in academic_integration_timeline_section.find_all('div', class_='academic-phase'):
            phase_name = academic_phase.find('h3').get_text(strip=True) if academic_phase.find('h3') else ""
            details = [li.get_text(strip=True) for li in academic_phase.find_all('li')] if academic_phase.find_all('li') else []
            implementation_chunks.append((
                f"Implementation Plan Academic Integration Timeline: {phase_name}",
                f"Academic Integration Timeline Phase: {phase_name}. Details: {"; ".join(details)}."
            ))

    # Requirements Grid (Financial Considerations, Risk Assessment, Academic Integration)
    requirements_grid_section = soup.find('div', class_='requirements-grid')
    if requirements_grid_section:
        for req_card in requirements_grid_section.find_all('div', class_='requirement-card'):
            title = req_card.find('h4').get_text(strip=True) if req_card.find('h4') else ""
            details = [li.get_text(strip=True) for li in req_card.find_all('li')] if req_card.find_all('li') else []
            implementation_chunks.append((
                f"Implementation Plan Requirements: {title}",
                f"Requirement Category: {title}. Details: {"; ".join(details)}."
            ))

    return implementation_chunks

def extract_technical_implementation_data(soup):
    """
    Extracts structured data from technical_implementation.html.
    """
    tech_impl_chunks = []

    # Quantum Mechanics Engine
    quantum_engine_section = soup.find('section', id='quantum-engine')
    if quantum_engine_section:
        for tech_card in quantum_engine_section.find_all('div', class_='tech-card'):
            category = tech_card.find('h4').get_text(strip=True) if tech_card.find('h4') else ""
            features = [li.get_text(strip=True) for li in tech_card.find_all('li')] if tech_card.find_all('li') else []
            progress = tech_card.find('span', class_='progress-label').get_text(strip=True) if tech_card.find('span', class_='progress-label') else "N/A"
            tech_impl_chunks.append((
                f"Technical Implementation: Quantum Mechanics Engine - {category}",
                f"Category: {category}. Features: {"; ".join(features)}. Progress: {progress}."
            ))

    # Mobile Platform
    mobile_platform_section = soup.find('section', id='mobile-platform')
    if mobile_platform_section:
        for tech_card in mobile_platform_section.find_all('div', class_='tech-card'):
            category = tech_card.find('h4').get_text(strip=True) if tech_card.find('h4') else ""
            features = [li.get_text(strip=True) for li in tech_card.find_all('li')] if tech_card.find_all('li') else []
            progress = tech_card.find('span', class_='progress-label').get_text(strip=True) if tech_card.find('span', class_='progress-label') else "N/A"
            tech_impl_chunks.append((
                f"Technical Implementation: Mobile Platform - {category}",
                f"Category: {category}. Features: {"; ".join(features)}. Progress: {progress}."
            ))

    # Multi-Sensory Integration
    multi_sensory_section = soup.find('section', id='multi-sensory')
    if multi_sensory_section:
        for tech_card in multi_sensory_section.find_all('div', class_='tech-card'):
            category = tech_card.find('h4').get_text(strip=True) if tech_card.find('h4') else ""
            features = [li.get_text(strip=True) for li in tech_card.find_all('li')] if tech_card.find_all('li') else []
            progress = tech_card.find('span', class_='progress-label').get_text(strip=True) if tech_card.find('span', class_='progress-label') else "N/A"
            tech_impl_chunks.append((
                f"Technical Implementation: Multi-Sensory Integration - {category}",
                f"Category: {category}. Features: {"; ".join(features)}. Progress: {progress}."
            ))

    # Future Technology Integration
    future_tech_section = soup.find('section', id='future-tech')
    if future_tech_section:
        for tech_card in future_tech_section.find_all('div', class_='tech-card'):
            category = tech_card.find('h4').get_text(strip=True) if tech_card.find('h4') else ""
            features = [li.get_text(strip=True) for li in tech_card.find_all('li')] if tech_card.find_all('li') else []
            progress = tech_card.find('span', class_='progress-label').get_text(strip=True) if tech_card.find('span', class_='progress-label') else "N/A"
            tech_impl_chunks.append((
                f"Technical Implementation: Future Technology Integration - {category}",
                f"Category: {category}. Features: {"; ".join(features)}. Progress: {progress}."
            ))

    return tech_impl_chunks

def extract_app_screens_data(soup):
    """
    Extracts structured data from app_screens.html.
    """
    app_screens_chunks = []

    # Main Interface Screens, Feature Screens, Advanced Feature Screens
    for section_id in ['main-interface-screens', 'feature-screens', 'advanced-feature-screens']:
        screen_section = soup.find('section', class_='screen-section', id=section_id)
        if screen_section:
            for screen_card in screen_section.find_all('div', class_='screen-card'):
                title = screen_card.find('h3').get_text(strip=True) if screen_card.find('h3') else ""
                description = screen_card.find('p').get_text(strip=True) if screen_card.find('p') else ""
                features = [li.get_text(strip=True) for li in screen_card.find_all('li')] if screen_card.find_all('li') else []
                tags = [span.get_text(strip=True) for span in screen_card.find_all('span', class_='screen-tag')] if screen_card.find_all('span', class_='screen-tag') else []
                
                app_screens_chunks.append((
                    f"App Screen: {title}",
                    f"Screen: {title}. Description: {description}. Features: {"; ".join(features)}. Tags: {", ".join(tags)}."
                ))

    return tech_impl_chunks

def extract_quantum_mind_data(soup):
    """
    Extracts structured data from quantum-mind.html (blog post).
    """
    quantum_mind_chunks = []

    title = soup.find('h1', class_='entangle-post-title').get_text(strip=True) if soup.find('h1', class_='entangle-post-title') else ""
    meta = soup.find('div', class_='entangle-post-meta').get_text(strip=True) if soup.find('div', class_='entangle-post-meta') else ""
    
    content_div = soup.find('section', class_='entangle-post-content')
    if content_div:
        paragraphs = [p.get_text(strip=True) for p in content_div.find_all('p')] if content_div.find_all('p') else []
        blockquote = content_div.find('blockquote').get_text(strip=True) if content_div.find('blockquote') else ""
        
        full_content = f"Title: {title}. Meta: {meta}. "
        if paragraphs: full_content += f"Content: {". ".join(paragraphs)}. "
        if blockquote: full_content += f"Quote: {blockquote}."

        quantum_mind_chunks.append(("Quantum Mind Blog Post", full_content.strip()))

    return quantum_mind_chunks

def extract_entanglement_log_data(soup):
    """
    Extracts structured data from entanglement-log.html (blog index).
    """
    entanglement_log_chunks = []

    blog_list_section = soup.find('section', class_='entangle-blog-list')
    if blog_list_section:
        for article_card in blog_list_section.find_all('article', class_='entangle-blog-card'):
            title = article_card.find('h2', class_='entangle-blog-title').get_text(strip=True) if article_card.find('h2', class_='entangle-blog-title') else ""
            author = article_card.find('span', itemprop='name').get_text(strip=True) if article_card.find('span', itemprop='name') else ""
            date_published = article_card.find('time', itemprop='datePublished')['datetime'] if article_card.find('time', itemprop='datePublished') else ""
            keywords = article_card.find('span', itemprop='keywords').get_text(strip=True) if article_card.find('span', itemprop='keywords') else ""
            excerpt = article_card.find('div', class_='entangle-blog-excerpt').get_text(strip=True) if article_card.find('div', class_='entangle-blog-excerpt') else ""
            url = article_card.find('a', itemprop='headline')['href'] if article_card.find('a', itemprop='headline') else ""

            entanglement_log_chunks.append((
                f"Entanglement Log Article: {title}",
                f"Article: {title}. Author: {author}. Published: {date_published}. Keywords: {keywords}. Excerpt: {excerpt}. URL: {url}."
            ))

    return entanglement_log_chunks

def extract_partnerships_data(soup):
    """
    Extracts structured data from partnerships.html.
    """
    partnerships_chunks = []

    # Strategic Partnerships
    strategic_partnerships_section = soup.find('section', id='strategic-partnerships')
    if strategic_partnerships_section:
        # Partnership Metrics (top section)
        partnership_metrics = strategic_partnerships_section.find('div', class_='partnership-metrics')
        if partnership_metrics:
            for metric_card in partnership_metrics.find_all('div', class_='metric-card'):
                title = metric_card.find('h3').get_text(strip=True) if metric_card.find('h3') else ""
                details = [li.get_text(strip=True) for li in metric_card.find_all('li')] if metric_card.find_all('li') else []
                partnerships_chunks.append((
                    f"Partnership Metrics: {title}",
                    f"Metric: {title}. Details: {"; ".join(details)}."
                ))

        # Partnership Grid
        partnership_grid = strategic_partnerships_section.find('div', class_='partnership-grid')
        if partnership_grid:
            for partnership_card in partnership_grid.find_all('div', class_='partnership-card'):
                type_name = partnership_card.find('h3').get_text(strip=True) if partnership_card.find('h3') else ""
                subtitle = partnership_card.find('p', class_='partnership-subtitle').get_text(strip=True) if partnership_card.find('p', class_='partnership-subtitle') else ""
                description = partnership_card.find('p', class_='partnership-description').get_text(strip=True) if partnership_card.find('p', class_='partnership-description') else ""
                
                benefits = [li.get_text(strip=True) for li in partnership_card.find('h4', string='Key Benefits').find_next_sibling('ul').find_all('li')] if partnership_card.find('h4', string='Key Benefits') else []
                integration_options = [li.get_text(strip=True) for li in partnership_card.find('h4', string='Integration Options').find_next_sibling('ul').find_all('li')] if partnership_card.find('h4', string='Integration Options') else []
                
                metrics_preview = []
                for metric in partnership_card.find_all('div', class_='metric'):
                    value = metric.find('span', class_='metric-value').get_text(strip=True) if metric.find('span', class_='metric-value') else ""
                    label = metric.find('span', class_='metric-label').get_text(strip=True) if metric.find('span', class_='metric-label') else ""
                    metrics_preview.append(f"{label}: {value}")

                partnerships_chunks.append((
                    f"Strategic Partnership: {type_name}",
                    f"Type: {type_name}. Subtitle: {subtitle}. Description: {description}. Benefits: {"; ".join(benefits)}. Integration Options: {"; ".join(integration_options)}. Metrics: {"; ".join(metrics_preview)}."
                ))

    # Enterprise Solutions
    enterprise_solutions_section = soup.find('section', id='enterprise-solutions')
    if enterprise_solutions_section:
        for enterprise_card in enterprise_solutions_section.find_all('div', class_='enterprise-card'):
            solution_name = enterprise_card.find('h3').get_text(strip=True) if enterprise_card.find('h3') else ""
            price = enterprise_card.find('p', class_='price').get_text(strip=True) if enterprise_card.find('p', class_='price') else ""
            period = enterprise_card.find('p', class_='period').get_text(strip=True) if enterprise_card.find('p', class_='period') else ""
            features = [li.get_text(strip=True) for li in enterprise_card.find_all('li')] if enterprise_card.find_all('li') else []

            partnerships_chunks.append((
                f"Enterprise Solution: {solution_name}",
                f"Solution: {solution_name}. Pricing: {price} {period}. Features: {"; ".join(features)}."
            ))

    return partnerships_chunks

def scrape_clean_text(url):
    """Scrape and clean the main text content from a page, chunked by section."""
    try:
        resp = requests.get(url, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Remove scripts/styles
        for tag in soup(['script', 'style', 'noscript']):
            tag.decompose()
        
        if "curriculum.html" in url:
            curriculum_data = extract_curriculum_data(soup)
            chunks = []
            for course in curriculum_data:
                course_text = f"Curriculum Course Name: {course['name']}. Subtitle: {course['subtitle']}. Regular Price: {course['regular_price']}. Current Price: {course['current_price']}. Features: {". ".join(course['features'])}"
                chunks.append(("Curriculum Course", course_text))
            return chunks
        elif "business_model.html" in url:
            business_data = extract_business_model_data(soup)
            return business_data
        elif "scientific_validation.html" in url:
            scientific_data = extract_scientific_validation_data(soup)
            return scientific_data
        elif "app_features.html" in url:
            app_features_data = extract_app_features_data(soup)
            return app_features_data
        elif "project_proposal.html" in url:
            project_proposal_data = extract_project_proposal_data(soup)
            return project_proposal_data
        elif "academic_alignment.html" in url:
            academic_alignment_data = extract_academic_alignment_data(soup)
            return academic_alignment_data
        elif "advanced_concepts.html" in url:
            advanced_concepts_data = extract_advanced_concepts_data(soup)
            return advanced_concepts_data
        elif "advanced_progression.html" in url:
            advanced_progression_data = extract_advanced_progression_data(soup)
            return advanced_progression_data
        elif "quantum_parameters.html" in url:
            quantum_parameters_data = extract_quantum_parameters_data(soup)
            return quantum_parameters_data
        elif "consciousness_accelerator.html" in url:
            consciousness_accelerator_data = extract_consciousness_accelerator_data(soup)
            return consciousness_accelerator_data
        elif "consciousness_bands.html" in url:
            consciousness_bands_data = extract_consciousness_bands_data(soup)
            return consciousness_bands_data
        elif "implementation_plan.html" in url:
            implementation_plan_data = extract_implementation_plan_data(soup)
            return implementation_plan_data
        elif "technical_implementation.html" in url:
            technical_implementation_data = extract_technical_implementation_data(soup)
            return technical_implementation_data
        elif "app_screens.html" in url:
            app_screens_data = extract_app_screens_data(soup)
            return app_screens_data
        elif "quantum-mind.html" in url:
            quantum_mind_data = extract_quantum_mind_data(soup)
            return quantum_mind_data
        elif "entanglement-log.html" in url:
            entanglement_log_data = extract_entanglement_log_data(soup)
            return entanglement_log_data
        elif "partnerships.html" in url:
            partnerships_data = extract_partnerships_data(soup)
            return partnerships_data
        else:
            # Extract section-based chunks for other pages
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

    # --- AUTOMATIC COPY TO NETLIFY FUNCTIONS DIR ---
    src = pathlib.Path("knowledge.json")
    dst = pathlib.Path("netlify/functions/knowledge.json")
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    print(f"✅ Copied knowledge.json to {dst}")
    