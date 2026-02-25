import re
import os
import random

files = [
    "/Users/jcru/Documents/Anti Gravity/Jcru-Web-new/davies-mainfiles/davies/corporate-video-production.html",
    "/Users/jcru/Documents/Anti Gravity/Jcru-Web-new/davies-mainfiles/davies/workspvt.html"
]

seo_titles = {
    "it": [
        "Corporate Brand Film for a Global IT Services Company",
        "Technology Brand Video Showcasing Digital Transformation",
        "Corporate Film for an Enterprise Technology Organisation",
        "IT Services Corporate Video for Stakeholder Communication",
        "Technology Company Brand Film for Global Audiences",
        "Corporate Video Highlighting Innovation in IT Solutions",
        "Enterprise Technology Film for Internal & External Messaging",
        "Corporate Storytelling Video for a Technology Leader",
        "IT Company Corporate Film Focused on Scale & Capability",
        "Technology Brand Video Designed for B2B Engagement"
    ],
    "saas": [
        "Product Explainer Video for a SaaS Platform",
        "SaaS Brand Film Focused on Product Vision & Growth",
        "Software Product Video for B2B Marketing",
        "Explainer Video Simplifying a Complex SaaS Solution",
        "Product Launch Video for a Software Company",
        "SaaS Marketing Video Designed for Lead Generation",
        "Software Demo Video for Enterprise Customers",
        "SaaS Brand Communication Film for Digital Platforms",
        "Product Storytelling Video for a Software Platform",
        "SaaS Explainer Film for Sales Enablement"
    ],
    "healthcare": [
        "Corporate Film for a Healthcare Organisation",
        "Healthcare Brand Video Focused on Trust & Impact",
        "Corporate Video for a Pharmaceutical Company",
        "Healthcare Explainer Video for Patient & Professional Awareness",
        "Brand Film for a Life Sciences Organisation",
        "Corporate Video Showcasing Healthcare Innovation",
        "Healthcare Communication Film for Internal Teams",
        "Medical Brand Video for Enterprise Stakeholders",
        "Healthcare Corporate Film Designed for Digital Use",
        "Pharmaceutical Brand Video for Corporate Messaging"
    ],
    "manufacturing": [
        "Corporate Film for a Manufacturing Company",
        "Industrial Brand Video Showcasing Scale & Capability",
        "Corporate Video for an Engineering & Manufacturing Firm",
        "Manufacturing Company Brand Film for Corporate Communication",
        "Industrial Corporate Video Focused on Operations & Quality",
        "Infrastructure Brand Film for a Large-Scale Organisation",
        "Manufacturing Corporate Video for Stakeholder Engagement",
        "Industrial Storytelling Film for Enterprise Messaging",
        "Corporate Film Highlighting Manufacturing Excellence",
        "Industrial Brand Video Designed for B2B Audiences"
    ],
    "general": [
        "Corporate Brand Film for a Leading Enterprise Client",
        "Confidential Corporate Video Created Under NDA",
        "Brand Film Developed for a Fortune-Level Organisation",
        "Corporate Video for a Multi-Industry Enterprise",
        "Strategic Brand Film for a Large Organisation",
        "Enterprise Corporate Video Delivered via Agency Collaboration",
        "NDA-Protected Corporate Film for a Global Client",
        "Corporate Video Project for a High-Growth Organisation",
        "Brand Communication Film for an Industry Leader",
        "Enterprise Video Production for a Confidential Client"
    ]
}

def get_category(title):
    title_lower = title.lower()
    
    it_keywords = ['infosys', 'dell', 'tech', 'digital', 'cyber', 'it', 'software', 'app', 'amadeus', 'ai']
    saas_keywords = ['saas', 'app', 'platform', 'cloud', 'data']
    health_keywords = ['abbvie', 'health', 'pharma', 'medical', 'hospital', 'care', 'novo nordisk', 'incretin']
    mfg_keywords = ['mfg', 'forge', 'manufacturing', 'industrial', 'infrastructure', 'engineering', 'ge ', 'nopo']
    
    if any(kw in title_lower for kw in health_keywords):
        return "healthcare"
    if any(kw in title_lower for kw in mfg_keywords):
        return "manufacturing"
    if any(kw in title_lower for kw in saas_keywords):
        return "saas"
    if any(kw in title_lower for kw in it_keywords):
        return "it"
    
    return "general"

used_titles = {cat: 0 for cat in seo_titles.keys()}

def get_seo_title(category):
    titles = seo_titles[category]
    index = used_titles[category] % len(titles)
    used_titles[category] += 1
    return titles[index]

def update_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Match the h6 and the subsequent seo-hidden-desc paragraph
    pattern = r'(<h6><span class="link infor_name">(.*?)</span></h6>)\s*(<p style="opacity: 0; position: absolute; pointer-events: none; z-index: -1; height: 0; width: 0; overflow: hidden;" class="seo-hidden-desc">)(.*?)(</p>)'
    
    def replacer(match):
        h6_tag = match.group(1)
        video_title = match.group(2).strip()
        p_start_tag = match.group(3)
        old_desc = match.group(4)
        p_end_tag = match.group(5)
        
        category = get_category(video_title)
        seo_title = get_seo_title(category)
        
        # New SEO text combines the mapped generic SEO title with the specific original title, followed by the keyword stuffing
        new_desc = f"{seo_title} - {video_title}. Produced by Jcru Studio, a leading corporate video production studio and animation studio. We specialize in event video production, event LED content studio services, and premium video production tailored for your brand's success."
        
        return f"{h6_tag}\n                                {p_start_tag}{new_desc}{p_end_tag}"

    new_content = re.sub(pattern, replacer, content)

    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Updated {filepath}")

for f in files:
    update_file(f)

