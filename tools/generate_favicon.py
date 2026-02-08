from PIL import Image, ImageDraw

def create_favicons():
    sizes = [(180, "apple-touch-icon.png"), (32, "favicon-32x32.png"), (16, "favicon-16x16.png")]
    
    for size, filename in sizes:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Scale factors
        scale = size / 500 * 0.9
        cx, cy = size // 2, size // 2
        
        # Stem Logic
        stem_w = 70 * scale
        stem_h = 360 * scale
        stem_x = cx - (135 * scale) - (stem_w / 2)
        stem_y = cy - (stem_h / 2)
        
        draw.rectangle(
            [stem_x, stem_y, stem_x + stem_w, stem_y + stem_h],
            fill="white"
        )
        
        # Gear Logic
        gear_cx = cx + (240 - 250) * scale 
        gear_cy = cy
        outer_r = 160 * scale
        hole_r = 70 * scale
        
        # Draw Outer Circle
        draw.ellipse(
            [gear_cx - outer_r, gear_cy - outer_r, gear_cx + outer_r, gear_cy + outer_r],
            fill="white"
        )
        
        # Create Loop/Hole Mask
        # We need to erase the center of the gear.
        # Create a mask for the hole
        hole_mask = Image.new("L", (size, size), 0)
        mask_draw = ImageDraw.Draw(hole_mask)
        mask_draw.ellipse(
            [gear_cx - hole_r, gear_cy - hole_r, gear_cx + hole_r, gear_cy + hole_r],
            fill=255 # White means apply transparency here
        )
        
        # Apply transparency to the hole area
        # We want to paste (0,0,0,0) where the mask is white.
        # But `img.paste` mask usually means "where mask is white, copy the source". 
        # Source is (0,0,0,0). So yes.
        img.paste((0,0,0,0), mask=hole_mask)
        
        img.save(filename)
        print(f"Saved {filename}")

if __name__ == "__main__":
    create_favicons()
