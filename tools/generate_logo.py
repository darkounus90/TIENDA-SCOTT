import math
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_modern_logo():
    # --- CONFIGURATION ---
    WIDTH = 1000
    HEIGHT = 200 # Wider format for header
    BG_COLOR = (0, 0, 0, 0) # Transparent
    
    # Brand Colors (Matching Favicon)
    C_VIOLET = (139, 92, 246) # Violet-500
    C_CYAN = (6, 182, 212)    # Cyan-500
    C_WHITE = (255, 255, 255)
    
    img = Image.new('RGBA', (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # --- 1. DRAW ICON (Minimalist Turbine) ---
    # We'll reuse the successful logic from the favicon but smaller/cleaner
    icon_size = 140
    padding_left = 20
    icon_x = padding_left
    icon_y = (HEIGHT - icon_size) // 2
    center_x = icon_x + icon_size // 2
    center_y = icon_y + icon_size // 2
    radius = icon_size * 0.45
    
    # Glow for icon
    glow_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    # Draw blades
    num_blades = 8
    for i in range(num_blades):
        angle_start = (math.pi * 2 / num_blades) * i
        angle_end = (math.pi * 2 / num_blades) * (i + 0.6)
        
        # Color interpolation
        t = i / num_blades
        r = int(C_VIOLET[0] * (1-t) + C_CYAN[0] * t)
        g = int(C_VIOLET[1] * (1-t) + C_CYAN[1] * t)
        b = int(C_VIOLET[2] * (1-t) + C_CYAN[2] * t)
        
        # Points for blade
        p1 = (center_x, center_y)
        p2 = (center_x + radius * math.cos(angle_start), center_y + radius * math.sin(angle_start))
        p3 = (center_x + radius * math.cos(angle_end), center_y + radius * math.sin(angle_end))
        
        glow_draw.polygon([p1, p2, p3], fill=(r, g, b, 150)) # More transparent for glow
        draw.polygon([p1, p2, p3], fill=(r, g, b, 255))
        
    # Center hole (dark to simpler look)
    hub_r = radius * 0.3
    draw.ellipse([center_x-hub_r, center_y-hub_r, center_x+hub_r, center_y+hub_r], fill=(0,0,0,0))
    # Add a ring
    draw.ellipse([center_x-hub_r, center_y-hub_r, center_x+hub_r, center_y+hub_r], outline=C_CYAN, width=3)

    # Apply blur to glow layer
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(10))
    img = Image.alpha_composite(glow_layer, img)
    draw = ImageDraw.Draw(img) # Re-get draw for composite

    # --- 2. DRAW TEXT ---
    text = "El Pedalazo"
    text_x = icon_x + icon_size + 20
    
    # Try to find a good font
    font_size = 80
    font_paths = [
        "/System/Library/Fonts/Supplemental/Futura.ttc",
        "/System/Library/Fonts/Supplemental/Arial Black.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial Bold.ttf"
    ]
    
    font = None
    for path in font_paths:
        if os.path.exists(path):
            try:
                font = ImageFont.truetype(path, font_size)
                break
            except: continue
            
    if not font:
        font = ImageFont.load_default()

    # Draw Text Shadow/Glow
    # text_glow = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    # text_draw = ImageDraw.Draw(text_glow)
    # text_draw.text((text_x, (HEIGHT-font_size)//2), text, font=font, fill=(139, 92, 246, 100))
    # text_glow = text_glow.filter(ImageFilter.GaussianBlur(8))
    # img = Image.alpha_composite(img, text_glow)
    # draw = ImageDraw.Draw(img)

    # Draw Main Text
    # Centering vertically
    bbox = draw.textbbox((0, 0), text, font=font)
    text_h = bbox[3] - bbox[1]
    text_y = (HEIGHT - text_h) // 2 - 10
    
    # Gradient Text Effect ( Simulated by drawing multiple slightly offset layers or just solid white for cleanliness)
    # Let's go with Solid High-Contrast White for readability on dark backgrounds
    draw.text((text_x, text_y), text, font=font, fill=C_WHITE)
    
    # Add Subtitle
    subtitle = "PREMIUM BIKE STORE"
    sub_size = 24
    try:
        sub_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", sub_size)
    except:
        sub_font = ImageFont.load_default()
        
    draw.text((text_x + 5, text_y + text_h + 5), subtitle, font=sub_font, fill=C_CYAN)

    # --- SAVE ---
    # Crop to content
    bbox = img.getbbox()
    if bbox:
        # Add some padding
        img = img.crop((bbox[0]-10, bbox[1]-10, bbox[2]+10, bbox[3]+10))
    
    img.save("logo-header.png")
    print("✅ Clean Geometric Logo Generated: logo-header.png")

if __name__ == "__main__":
    create_modern_logo()
