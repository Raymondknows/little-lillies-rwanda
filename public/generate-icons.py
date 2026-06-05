#!/usr/bin/env python3
"""
Generate PWA icons with safe padding from the logo.
This ensures the logo doesn't overflow when the OS applies adaptive masking.
"""

from PIL import Image
import os

def add_padding_to_icon(source_path, output_path, size, padding_percent=15):
    """
    Add padding to an icon image.
    
    Args:
        source_path: Path to source logo image
        output_path: Path to save the padded icon
        size: Final icon size (e.g., 192, 512)
        padding_percent: Percentage of size to use as padding (default 15%)
    """
    try:
        # Open the source image
        img = Image.open(source_path).convert('RGBA')
        
        # Create a new transparent image with the target size
        new_img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
        
        # Calculate padding
        padding = int(size * padding_percent / 100)
        available_size = size - (padding * 2)
        
        # Resize the logo to fit in the padded area
        img_resized = img.resize((available_size, available_size), Image.Resampling.LANCZOS)
        
        # Paste the resized logo in the center
        new_img.paste(img_resized, (padding, padding), img_resized)
        
        # Save the icon
        if output_path.endswith('.png'):
            new_img.save(output_path, 'PNG', quality=95)
        else:
            # Convert RGBA to RGB for formats that don't support transparency
            rgb_img = Image.new('RGB', (size, size), (255, 255, 255))
            rgb_img.paste(new_img, mask=new_img.split()[3])
            rgb_img.save(output_path, quality=95)
        
        print(f"✓ Generated {output_path} ({size}x{size})")
        return True
    except Exception as e:
        print(f"✗ Error generating {output_path}: {e}")
        return False

# Icon specifications
icons_to_generate = [
    ('logo.png', 'favicon-16x16.png', 16, 15),
    ('logo.png', 'favicon-32x32.png', 32, 15),
    ('logo.png', 'favicon-64x64.png', 64, 15),
    ('logo.png', 'android-chrome-192x192.png', 192, 15),
    ('logo.png', 'android-chrome-512x512.png', 512, 15),
]

# Get the public directory
public_dir = os.path.dirname(os.path.abspath(__file__))

print("Generating PWA icons with safe padding...\n")

all_success = True
for source, output, size, padding in icons_to_generate:
    source_path = os.path.join(public_dir, source)
    output_path = os.path.join(public_dir, output)
    
    if not os.path.exists(source_path):
        print(f"✗ Source file not found: {source_path}")
        all_success = False
        continue
    
    if not add_padding_to_icon(source_path, output_path, size, padding):
        all_success = False

if all_success:
    print("\n✓ All icons generated successfully with padding!")
    print("  The logos now have 15% safe padding and won't overflow on PWA installations.")
else:
    print("\n✗ Some icons failed to generate. Check the errors above.")

print("\nNext steps:")
print("1. Clear your browser cache and service worker")
print("2. Uninstall the app from your device")
print("3. Reinstall the PWA")
print("4. The icons should now display with proper padding")
