import urllib.request
import re

try:
    resp = urllib.request.urlopen("https://contabilidade-erp.onrender.com/")
    html = resp.read().decode("utf-8")
    
    match = re.search(r'src="(/assets/index-.*?\.js)"', html)
    if not match:
        print("COULD NOT FIND index.js in HTML:")
        print(html)
        exit(1)
        
    js_file = match.group(1)
    print("Found JS:", js_file)
    
    js_url = "https://contabilidade-erp.onrender.com" + js_file
    js_code = urllib.request.urlopen(js_url).read().decode("utf-8")
    
    if "http://localhost:5000" in js_code:
        print("YES! localhost:5000 IS IN THE PRODUCTION JS BUNDLE!")
    else:
        print("NO, localhost:5000 IS NOT IN THE BUNDLE.")
except Exception as e:
    print("Error:", e)
