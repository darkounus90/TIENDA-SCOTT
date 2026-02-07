import math

def generate_svg():
    # 1. GENERATE ICON (P + GEAR)
    # Tighter viewBox for better vertical centering/sizing
    # Original: 500x500 with significant padding.
    # Content Y range: approx 70 to 430.
    # New ViewBox: y=40, h=420? -> 0 40 500 420
    
    icon_width = 500
    icon_height = 420
    viewbox_y_offset = 40
    
    # Stem
    stem_width = 70
    stem_height = 360
    stem_x = 80
    stem_y = 70
    
    # Gear (Loop)
    gear_cx = 240
    gear_cy = 200
    outer_radius = 160
    inner_radius = 110
    hole_radius = 70
    num_teeth = 8
    tooth_depth = 35
    
    # Generate Gear Path points
    path_d = []
    for i in range(num_teeth * 2):
        angle = math.pi * 2 * i / (num_teeth * 2) - math.pi/2 # Start top
        r = outer_radius if i % 2 == 0 else outer_radius - tooth_depth
        x = gear_cx + math.cos(angle) * r
        y = gear_cy + math.sin(angle) * r
        cmd = 'L' if i > 0 else 'M'
        path_d.append(f'{cmd} {x:.1f} {y:.1f}')
    path_d.append('Z')
    
    hole_path = f'M {gear_cx} {gear_cy - hole_radius} A {hole_radius} {hole_radius} 0 1 0 {gear_cx} {gear_cy + hole_radius} A {hole_radius} {hole_radius} 0 1 0 {gear_cx} {gear_cy - hole_radius} Z'
    
    gear_svg_path = f'<path d="{" ".join(path_d)} {hole_path}" fill="white" fill-rule="evenodd" />'
    stem_rect = f'<rect x="{stem_x}" y="{stem_y}" width="{stem_width}" height="{stem_height}" rx="10" fill="white" />'
    
    # SVG Content for Icon (Tighter Crop)
    svg_icon = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 {viewbox_y_offset} {icon_width} {icon_height}" width="{icon_width}" height="{icon_height}">']
    svg_icon.append(f'  {stem_rect}')
    svg_icon.append(f'  {gear_svg_path}')
    svg_icon.append('</svg>')
    
    with open("logo-pedalazo-icon.svg", "w") as f:
        f.write("\n".join(svg_icon))
        
    # 2. GENERATE FULL LOGO (ICON + TEXT)
    # This one can stay 1200x400 as it includes text
    full_width = 1200
    full_height = 400
    
    svg_full = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {full_width} {full_height}" width="{full_width}" height="{full_height}">']
    
    # Icon Group 
    svg_full.append(f'<g transform="translate(20, -50) scale(0.8)">')
    svg_full.append(f'  {stem_rect}')
    svg_full.append(f'  {gear_svg_path}')
    svg_full.append(f'</g>')
    
    # Text
    text_x = 450
    text_y = 230
    svg_full.append(f'<text x="{text_x}" y="{text_y}" font-family="Arial, sans-serif" font-size="140" font-weight="900" fill="white" letter-spacing="5">EL PEDALAZO</text>')
    
    svg_full.append('</svg>')
    
    with open("logo-pedalazo-completo.svg", "w") as f:
        f.write("\n".join(svg_full))
        
    print("Generated logo-pedalazo-icon.svg (optimised crop) and logo-pedalazo-completo.svg")

if __name__ == "__main__":
    generate_svg()
