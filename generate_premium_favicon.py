import math
from PIL import Image, ImageDraw, ImageFilter

def create_premium_favicon():
    # Supersample size for crisp antialiasing
    size = 1024
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    radius = size * 0.4
    
    # Brand Colors
    c_violet = (139, 92, 246) # Primary
    c_cyan = (6, 182, 212)    # Accent
    c_white = (255, 255, 255)
    
    # 1. Outer Glow Ring (Neon Effect)
    # We draw this effectively by drawing the main shape then blurring a copy, 
    # but let's draw a specific glow layer first.
    
    # 2. Main Turbine / Wheel Shape
    # We will draw a set of "turbine blades" to create a dynamic wheel
    num_blades = 6
    for i in range(num_blades):
        angle_start = (math.pi * 2 / num_blades) * i
        angle_end = (math.pi * 2 / num_blades) * (i + 0.7) # Leave some gap
        
        # Color interpolation for each blade to create a gradient wheel
        progress = i / num_blades
        r = int(c_violet[0] * (1-progress) + c_cyan[0] * progress)
        g = int(c_violet[1] * (1-progress) + c_cyan[1] * progress)
        b = int(c_violet[2] * (1-progress) + c_cyan[2] * progress)
        color = (r, g, b)
        
        # Draw blade as a pie slice with a twist
        # To make it look like a turbine, we can use a polygon
        
        # Outer points
        p1 = (center + radius * math.cos(angle_start), center + radius * math.sin(angle_start))
        p2 = (center + radius * math.cos(angle_end), center + radius * math.sin(angle_end))
        
        # Inner points (closer to center, slightly rotated for twist effect)
        inner_radius = radius * 0.25
        twist_offset = 0.2 # Radians
        p3 = (center + inner_radius * math.cos(angle_end + twist_offset), center + inner_radius * math.sin(angle_end + twist_offset))
        p4 = (center + inner_radius * math.cos(angle_start + twist_offset), center + inner_radius * math.sin(angle_start + twist_offset))
        
        draw.polygon([p1, p2, p3, p4], fill=color + (230,))
        
        # Add a glossy highlight on the leading edge
        draw.line([p4, p1], fill=c_white + (150,), width=4)

    # 3. Outer Ring (The "Tire" or container)
    # Gradient stroke
    bbox = [center - radius, center - radius, center + radius, center + radius]
    draw.arc(bbox, start=0, end=360, fill=c_cyan + (200,), width=30)
    
    # 4. Center Hub
    hub_radius = size * 0.12
    draw.ellipse([center - hub_radius, center - hub_radius,
                  center + hub_radius, center + hub_radius],
                 fill=c_violet + (255,))
    
    # Hub Highlight (Glassy reflection)
    highlight_bbox = [center - hub_radius*0.6, center - hub_radius*0.6,
                      center + hub_radius*0.2, center - hub_radius*0.2]
    # Small white oval
    draw.ellipse(highlight_bbox, fill=(255, 255, 255, 100))

    # 5. GENERATE GLOW
    # Create a glow layer
    glow_layer = img.filter(ImageFilter.GaussianBlur(radius=40))
    
    # Enhance glow by pasting it multiple times or adjusting opacity
    # We want a strong neon glow
    final_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    
    # Paste glow
    final_img.paste(glow_layer, (0, 0), glow_layer)
    # Paste slightly tighter glow
    glow_layer_2 = img.filter(ImageFilter.GaussianBlur(radius=20))
    final_img.paste(glow_layer_2, (0, 0), glow_layer_2)
    
    # Paste original sharp image on top
    final_img.paste(img, (0, 0), img)
    
    # 6. RESIZE AND SAVE
    # Save as 512x512 PNG (Master)
    output_png = final_img.resize((512, 512), Image.Resampling.LANCZOS)
    output_png.save('favicon.png')
    
    # Apple Touch Icon (180x180) - usually needs background
    # But usually just resizing the icon works fine on iOS (it adds background if transparent)
    # Let's add a subtle dark background for iOS just in case
    apple_icon = Image.new('RGB', (180, 180), (15, 23, 42)) # Dark blue bg
    icon_resized = final_img.resize((140, 140), Image.Resampling.LANCZOS)
    apple_icon.paste(icon_resized, (20, 20), icon_resized)
    apple_icon.save('apple-touch-icon.png')

    # Save small PNGs
    final_img.resize((192, 192), Image.Resampling.LANCZOS).save('android-chrome-192x192.png')
    final_img.resize((512, 512), Image.Resampling.LANCZOS).save('android-chrome-512x512.png')
    final_img.resize((32, 32), Image.Resampling.LANCZOS).save('favicon-32x32.png')
    final_img.resize((16, 16), Image.Resampling.LANCZOS).save('favicon-16x16.png')
    
    # Save as ICO (Standard sizes)
    img_256 = final_img.resize((256, 256), Image.Resampling.LANCZOS)
    img_128 = final_img.resize((128, 128), Image.Resampling.LANCZOS)
    img_64 = final_img.resize((64, 64), Image.Resampling.LANCZOS)
    img_48 = final_img.resize((48, 48), Image.Resampling.LANCZOS)
    img_32 = final_img.resize((32, 32), Image.Resampling.LANCZOS)
    img_16 = final_img.resize((16, 16), Image.Resampling.LANCZOS)
    
    img_256.save('favicon.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    
    print("✨ Premium Favicon Generated Successfully! (All formats)")

if __name__ == "__main__":
    create_premium_favicon()
