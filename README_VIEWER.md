# Visor 3D Interactivo - Guía de Uso

Esta guía explica cómo gestionar el visor 3D de la bicicleta Scott Scale 920 implementado en la página de inicio.

## 1. Archivos del Visor

El visor se compone de los siguientes archivos:

*   **`viewer/bikeViewer.js`**: Lógica principal (Three.js, controles, carga).
*   **`viewer/parts.js`**: Datos de las piezas (nombres, descripciones, posiciones de hotspots).
*   **`style.css`**: Estilos del contenedor, overlays y panel de detalles (sección `/* 3D VIEWER STYLES */`).
*   **`index.html`**: Contenedor principal `<section id="bike-viewer">`.

## 2. Cambiar el Modelo 3D

El visor espera encontrar el archivo GLB en la ruta configurada en `app.js`.

1.  Consigue tu archivo `.glb` (optimizado, idealmente < 10MB).
2.  Guárdalo en la carpeta `assets/` (ej. `assets/scale-920.glb`).
3.  Si cambia el nombre, actualiza la referencia en `app.js`:

```javascript
initBikeViewer({
    mountId: 'bike-viewer',
    modelUrl: 'assets/nuevo-modelo.glb' // <-- Actualizar aquí
});
```

> **Nota:** Si el archivo no existe, el visor generará automáticamente una "Bicicleta Placeholder" (cilindros y toroides básicos) para que la página no se rompa.

## 3. Ajustar Hotspots (Puntos de Interés)

Para agregar o modificar los puntos interactivos, edita `viewer/parts.js`.

Cada objeto en el array `bikeParts` define una pieza:

```javascript
{
    id: 'frame', // ID único
    name: 'Cuadro Carbono', // Título en el panel
    description: 'Descripción corta...', 
    specs: ['Material: Carbono', 'Peso: 900g'], // Lista de specs
    hotspotPosition: { x: 0, y: 0.8, z: 0 }, // Coordenadas X, Y, Z del punto azul
    cameraPosition: { x: 1.5, y: 0.8, z: 1.5 }, // (Opcional) Dónde poner la cámara al hacer clic
    meshNameHints: ['Frame', 'Cuadro'] // (Opcional) Para auto-detectar mesh en el futuro
}
```

### ¿Cómo saber las coordenadas?
Actualmente están estimadas. Para mayor precisión, puedes usar herramientas como [gltf.report](https://gltf.report/) para inspeccionar tu modelo y ver las coordenadas de los vértices, o ajustar a prueba y error recargando la página.

## 4. Embeber en otra página

El visor es modular. Para usarlo en otra página (ej. `producto-detalle.html`):

1.  Asegúrate de importar Three.js y el visor.
2.  Crea un contenedor con dimensiones definidas:
    ```html
    <div id="mi-visor" style="width: 100%; height: 500px;"></div>
    ```
3.  Inicialízalo en tu JS:
    ```javascript
    import { initBikeViewer } from './viewer/bikeViewer.js';
    
    initBikeViewer({
        mountId: 'mi-visor',
        modelUrl: 'assets/modelo.glb'
    });
    ```
