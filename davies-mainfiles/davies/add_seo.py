import re
import os

files = [
    "/Users/jcru/Documents/Anti Gravity/Jcru-Web-new/davies-mainfiles/davies/corporate-video-production.html",
    "/Users/jcru/Documents/Anti Gravity/Jcru-Web-new/davies-mainfiles/davies/workspvt.html"
]

def add_seo_desc(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the article-blog divs, which hold the video info
    # We want to insert the SEO description inside the .infor div, right after the <h6> that contains the title
    
    # Pattern to match: <h6><span class="link infor_name"> TITLE </span></h6>
    # We will replace it with:
    # <h6><span class="link infor_name"> TITLE </span></h6>
    # <p style="... seo string ..."> TITLE ... seo text ... </p>
    
    # Let's use a regex to find the title
    pattern = r'(<h6><span class="link infor_name">(.*?)</span></h6>)'
    
    def replacer(match):
        full_match = match.group(1)
        title = match.group(2).strip()
        
        seo_text = f'\n                                <p style="opacity: 0; position: absolute; pointer-events: none; z-index: -1; height: 0; width: 0; overflow: hidden;" class="seo-hidden-desc">{title} - Produced by Jcru Studio, a leading corporate video production studio and animation studio. We specialize in event video production, event LED content studio services, and premium video production tailored for your brand\'s success.</p>'
        
        return full_match + seo_text

    new_content = re.sub(pattern, replacer, content)

    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Updated {filepath}")

for f in files:
    add_seo_desc(f)

