import os

replacements = {
    # Hex Colors
    "#8b5cf6": "#3b82f6", # violet-500 -> blue-500
    "#7c3aed": "#2563eb", # violet-600 -> blue-600
    "#6d28d9": "#1d4ed8", # violet-700 -> blue-700
    "#a78bfa": "#60a5fa", # violet-400 -> blue-400
    "#c4b5fd": "#93c5fd", # violet-300 -> blue-300
    "#a855f7": "#0ea5e9", # purple-500 -> sky-500 (used in gradients)

    # RGB strings commonly found in CSS rgba(...)
    "139, 92, 246": "59, 130, 246",
    "124, 58, 237": "37, 99, 235",
    "167, 139, 250": "96, 165, 250",
    "196, 181, 253": "147, 197, 253",
    "168, 85, 247": "14, 165, 233",
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Skipping {filepath}: {e}")
        return

    new_content = content
    for old_str, new_str in replacements.items():
        new_content = new_content.replace(old_str, new_str)
        # Also replace uppercase hex
        if old_str.startswith("#"):
            new_content = new_content.replace(old_str.upper(), new_str.upper())

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(r"c:\react\Sistema_De_Contabilidade\src"):
    for file in files:
        if file.endswith((".css", ".jsx", ".js")):
            replace_in_file(os.path.join(root, file))

print("Done replacing colors.")
