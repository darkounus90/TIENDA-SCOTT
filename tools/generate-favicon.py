from PIL import Image, ImageDraw
import math

# Create a 512x512 image
size = 512
img = Image.new('RGB', (size, size), '#030014')
draw = ImageDraw.Draw(img, 'RGBA')

# Center
cx, cy = size // 2, size // 2

# Draw background gradient effect (simplified)
for i in range(size):
    for j in range(size):
        # Calculate distance from center for gradient effect
        dist = math.sqrt((i - cx)**2 + (j - cy)**2)
        if dist < 200:
            alpha = int(15 * (1 - dist / 200))
            draw.point((i, j), fill=(139, 92, 246, alpha))

# Draw outer wheel
draw.ellipse([cx-140, cy-140, cx+140, cy+140], outline='#8b5cf6', width=16)

# Draw inner hub
draw.ellipse([cx-35, cy-35, cx+35, cy+35], fill='#a78bfa')

# Draw spokes
spokes = [
    (cx, cy-140), (cx+99, cy-99), (cx+99, cy+99),
    (cx, cy+140), (cx-99, cy+99), (cx-99, cy-99)
]
for x, y in spokes:
    draw.line([(cx, cy), (x, y)], fill='#06b6d4', width=6)

# Draw accent ring
draw.ellipse([cx-100, cy-100, cx+100, cy+100], outline='#06b6d4', width=3)

# Save as PNG
img.save('favicon-512.png', 'PNG')

# Create smaller versions
for size_px in [256, 128, 64, 32, 16]:
    resized = img.resize((size_px, size_px), Image.Resampling.LANCZOS)
    resized.save(f'favicon-{size_px}.png', 'PNG')

# Create ICO file with multiple sizes
img_16 = Image.open('favicon-16.png')
img_32 = Image.open('favicon-32.png')
img_64 = Image.open('favicon-64.png')
img_16.save('favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (64, 64)])

print('✅ Favicon files created successfully!')
