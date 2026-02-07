from PIL import Image

def make_transparent():
    try:
        img = Image.open("logo-source-ai.png").convert("RGBA")
    except FileNotFoundError:
        print("❌ Source file not found.")
        return

    datas = img.getdata()

    new_data = []
    threshold = 50 
    for item in datas:
        # Check if pixel is dark (black background)
        if item[0] < threshold and item[1] < threshold and item[2] < threshold:
            new_data.append((0, 0, 0, 0)) # Make transparent
        else:
            new_data.append((255, 255, 255, 255)) # Make white pixels purely white for crispness

    img.putdata(new_data)
    
    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save("logo.png")
    
    # Header version (Height ~50px)
    header_h = 50
    ratio = header_h / img.height
    header_w = int(img.width * ratio)
    header_img = img.resize((header_w, header_h), Image.Resampling.LANCZOS)
    header_img.save("logo-header.png")
    
    # Admin version (Height ~40px)
    admin_h = 40
    ratio = admin_h / img.height
    admin_w = int(img.width * ratio)
    admin_img = img.resize((admin_w, admin_h), Image.Resampling.LANCZOS)
    admin_img.save("logo-admin.png")
    
    print("✅ Processed logo.png, logo-header.png, logo-admin.png")

if __name__ == "__main__":
    make_transparent()
