import os
from PIL import Image

source_image = "public/icon.png"

# Ensure the file exists
if not os.path.exists(source_image):
    print(f"Error: {source_image} not found.")
    exit(1)

# Open and convert image
img = Image.open(source_image).convert("RGBA")

# Define required icon sizes matching `manifest.json`
sizes = {
    "favicon.ico": [(16, 16), (32, 32), (48, 48)],  # Multiple sizes in ICO format
    "icons/favicon-16x16.png": (16, 16),
    "icons/favicon-32x32.png": (32, 32),
    "icons/apple-touch-icon.png": (180, 180),
    "icons/android-chrome-192x192.png": (192, 192),
    "icons/android-chrome-512x512.png": (512, 512),
}

# Create output directory
output_dir = "public/icons"
os.makedirs(output_dir, exist_ok=True)

# Generate and save PNG icons
for filename, size in sizes.items():
    if filename == "favicon.ico":
        img.save(os.path.join("public", filename), format="ICO", sizes=size)
        print(f"Generated: {filename}")
    else:
        resized_img = img.resize(size)
        resized_img.save(os.path.join("public", filename), format="PNG")
        print(f"Generated: {filename}")

print("\n✅ Icons generated successfully in 'public/icons/'")