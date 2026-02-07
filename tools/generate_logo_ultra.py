
import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

def create_ultra_logo():
    # --- CONFIGURACIÓN ---
    WIDTH = 1200
    HEIGHT = 400
    # Fondo transparente para que puedas montarlo donde quieras
    BG_COLOR = (0, 0, 0, 0) 
    
    # Colores Premium
    # Violeta Neón Brillante
    C_VIOLET_CORE = (167, 139, 250) 
    C_VIOLET_GLOW = (139, 92, 246)
    
    # Cyan Neón Brillante
    C_CYAN_CORE = (103, 232, 249)
    C_CYAN_GLOW = (6, 182, 212)
    
    C_WHITE = (255, 255, 255)
    
    # Lienzo
    img = Image.new('RGBA', (WIDTH, HEIGHT), BG_COLOR)
    
    # --- 1. ICONO "TURBINA CÓSMICA" ---
    # Tamaño y posición
    icon_size = 220
    icon_x = 80
    icon_y = (HEIGHT - icon_size) // 2
    center_x = icon_x + icon_size // 2
    center_y = icon_y + icon_size // 2
    outer_radius = icon_size / 2
    
    # Capas para Glow
    glow_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    glow_draw = ImageDraw.Draw(glow_layer)
    
    shape_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0,0,0,0))
    shape_draw = ImageDraw.Draw(shape_layer)
    
    # A. Aspas de Turbina Dinámicas
    num_blades = 12
    for i in range(num_blades):
        angle_start = (math.pi * 2 / num_blades) * i
        angle_end = (math.pi * 2 / num_blades) * (i + 0.6) # Aspas anchas
        
        # Color Interpolado
        t = i / num_blades
        # Mezcla suave violeta -> cian
        r = int(C_VIOLET_GLOW[0] * (1-t) + C_CYAN_GLOW[0] * t)
        g = int(C_VIOLET_GLOW[1] * (1-t) + C_CYAN_GLOW[1] * t)
        b = int(C_VIOLET_GLOW[2] * (1-t) + C_CYAN_GLOW[2] * t)
        
        # Geometría curvada (simulada con polígono detallado)
        points = []
        steps = 10
        for s in range(steps + 1):
            st = s / steps
            ang = angle_start + (angle_end - angle_start) * st
            rad = outer_radius * (0.4 + 0.6 * st) # Se ensancha hacia afuera
            # Torsión (Twist) para efecto dinámico
            ang += 0.3 * st 
            
            px = center_x + rad * math.cos(ang)
            py = center_y + rad * math.sin(ang)
            points.append((px, py))
            
        points.append((center_x, center_y)) # Volver al centro
        
        # Dibujar en capa Glow (más transparente y difusa)
        glow_draw.polygon(points, fill=(r, g, b, 100))
        # Dibujar en capa Forma (sólida)
        shape_draw.polygon(points, fill=(r, g, b, 240))

    # B. Anillo Exterior (con degradado simulado dibujando arcos)
    for i in range(360):
        ang_rad = math.radians(i)
        t = (math.sin(ang_rad) + 1) / 2 # Variación cíclica
        
        r = int(C_VIOLET_GLOW[0] * (1-t) + C_CYAN_GLOW[0] * t)
        g = int(C_VIOLET_GLOW[1] * (1-t) + C_CYAN_GLOW[1] * t)
        b = int(C_VIOLET_GLOW[2] * (1-t) + C_CYAN_GLOW[2] * t)
        
        shape_draw.arc(
            [center_x - outer_radius, center_y - outer_radius, 
             center_x + outer_radius, center_y + outer_radius],
            start=i, end=i+2, fill=(r, g, b, 255), width=8
        )
        
    # C. Núcleo Central "Energía"
    core_rad = outer_radius * 0.25
    shape_draw.ellipse(
        [center_x - core_rad, center_y - core_rad, center_x + core_rad, center_y + core_rad],
        fill=C_WHITE
    )
    # Efecto halo alrededor del núcleo
    glow_draw.ellipse(
         [center_x - core_rad*1.5, center_y - core_rad*1.5, 
          center_x + core_rad*1.5, center_y + core_rad*1.5],
         fill=(255, 255, 255, 100)
    )

    # --- APLICAR GLOW ---
    # Desenfocar capa de brillo
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(30)) # Mucho blur para el neón
    
    # Combinar: Fondo -> Glow -> Forma
    img = Image.alpha_composite(img, glow_layer)
    img = Image.alpha_composite(img, shape_layer)
    
    draw = ImageDraw.Draw(img)

    # --- 2. TEXTO MODERNO ---
    text_main = "EL PEDALAZO" # Mayúsculas impone más
    text_sub = "SCOTT OFFICIAL DEALER" # Subtítulo premium
    
    text_x = icon_x + icon_size + 60
    
    # Buscar fuentes
    # Prioridad: Fuentes sans-serif geométricas modernas
    font_paths = [
        "/System/Library/Fonts/Supplemental/Futura.ttc", # Futura es muy geométrica/moderna
        "/System/Library/Fonts/Supplemental/Avenir.ttc", 
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/Library/Fonts/Arial Bold.ttf"
    ]
    
    main_font = None
    sub_font = None
    
    for path in font_paths:
        if os.path.exists(path):
            try:
                main_font = ImageFont.truetype(path, 100) # Grande
                sub_font = ImageFont.truetype(path, 32)   # Pequeña
                # print(f"Using font: {path}")
                break
            except: continue
            
    if not main_font:
        main_font = ImageFont.load_default()
        sub_font = ImageFont.load_default()

    # Calcular posición vertical para centrar el bloque de texto
    bbox_m = draw.textbbox((0, 0), text_main, font=main_font)
    h_m = bbox_m[3] - bbox_m[1]
    
    bbox_s = draw.textbbox((0, 0), text_sub, font=sub_font)
    h_s = bbox_s[3] - bbox_s[1]
    
    gap = 15
    total_h = h_m + gap + h_s
    
    start_y = (HEIGHT - total_h) // 2
    
    # Dibujar Texto Principal
    # Sombra sutil para legibilidad
    draw.text((text_x + 2, start_y + 2), text_main, font=main_font, fill=(0,0,0, 100))
    # Texto blanco puro
    draw.text((text_x, start_y), text_main, font=main_font, fill=C_WHITE)
    
    # Dibujar Subtítulo
    # Color Cian para conectar con el icono
    draw.text((text_x + 5, start_y + h_m + gap), text_sub, font=sub_font, fill=C_CYAN_GLOW)
    
    # --- PROCESAMIENTO FINAL ---
    # Recortar espacios vacíos excesivos
    bbox = img.getbbox()
    if bbox:
        # Dar un poco de aire (padding)
        pad = 20
        crop_box = (max(0, bbox[0]-pad), max(0, bbox[1]-pad), min(WIDTH, bbox[2]+pad), min(HEIGHT, bbox[3]+pad))
        img = img.crop(crop_box)
        
    # Guardar
    output_path = "logo-ultra.png"
    img.save(output_path)
    print(f"✅ Logo Ultra-Premium generado: {output_path}")
    
    # Crear versión header (redimensionada)
    header_h = 100
    ratio = header_h / img.height
    header_w = int(img.width * ratio)
    img_header = img.resize((header_w, header_h), Image.Resampling.LANCZOS)
    img_header.save("logo-header.png") # Sobrescribir el que usa la web
    print(f"✅ Logo Header actualizado: logo-header.png")

if __name__ == "__main__":
    create_ultra_logo()
