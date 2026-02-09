import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { bikeParts } from './parts.js';

/**
 * Inicializa el visor 3D de la bicicleta.
 * @param {Object} config - Configuración del visor.
 * @param {string} config.mountId - ID del elemento DOM donde se montará el canvas.
 * @param {string} config.modelUrl - URL del archivo GLB.
 */
export function initBikeViewer({ mountId, modelUrl }) {
    const container = document.getElementById(mountId);
    if (!container) {
        console.error(`BikeViewer: No se encontró el elemento con id "${mountId}"`);
        return;
    }

    // --- SETUP BÁSICO (Escena, Cámara, Renderer) ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Coincide con --bg-deep
    // Añadir niebla para profundidad
    scene.fog = new THREE.Fog(0x0f172a, 3, 10);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(2.5, 1.5, 2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping para aspecto realista
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    // --- CONTROLES ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.target.set(0, 0.5, 0);

    // --- ILUMINACIÓN ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x3b82f6, 0.8); // Luz azul de contra (rim light)
    backLight.position.set(-5, 2, -5);
    scene.add(backLight);

    // --- UI ELEMENTS ---
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.9); display: flex; flex-direction: column;
        justify-content: center; align-items: center; z-index: 10;
        transition: opacity 0.5s;
    `;
    loadingOverlay.innerHTML = `
        <div style="font-size: 1.2rem; margin-bottom: 10px; color: #fff;">Cargando SCOTT Scale 920</div>
        <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
            <div id="loader-bar" style="width: 0%; height: 100%; background: #3b82f6; transition: width 0.2s;"></div>
        </div>
        <div id="loader-text" style="color: #94a3b8; font-size: 0.9rem; margin-top: 8px;">0%</div>
    `;
    container.appendChild(loadingOverlay);

    // Panel de detalles (inicialmente oculto)
    const detailPanel = document.createElement('div');
    detailPanel.id = 'viewer-detail-panel';
    detailPanel.className = 'viewer-panel'; // Estilos en style.css
    detailPanel.innerHTML = `
        <button class="close-panel" aria-label="Cerrar">✕</button>
        <h3 id="panel-title"></h3>
        <p id="panel-desc"></p>
        <ul id="panel-specs"></ul>
    `;
    container.appendChild(detailPanel);

    // Botonera de control
    const controlsBar = document.createElement('div');
    controlsBar.className = 'viewer-controls';
    controlsBar.innerHTML = `
        <button id="btn-explode" class="btn-control" title="Explosionar vista">💥 Distribuir</button>
        <button id="btn-autorotate" class="btn-control active" title="Rotación automática">🔄 Auto</button>
        <button id="btn-reset" class="btn-control" title="Reiniciar vista">⏮ Reset</button>
    `;
    container.appendChild(controlsBar);

    // --- LÓGICA DE CARGA Y MODELO ---
    const manager = new THREE.LoadingManager();
    const loader = new GLTFLoader(manager);

    let bikeModel = null;
    let autoRotate = true;
    let exploded = false;
    const originalPositions = new Map(); // Para guardar posiciones originales de las piezas
    const hotspots = [];
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredPart = null;

    manager.onProgress = (url, itemsLoaded, itemsTotal) => {
        const percent = Math.round((itemsLoaded / itemsTotal) * 100);
        document.getElementById('loader-bar').style.width = percent + '%';
        document.getElementById('loader-text').innerText = percent + '%';
    };

    manager.onLoad = () => {
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => loadingOverlay.remove(), 500);
        }, 500);
        createHotspots();
    };

    loader.load(
        modelUrl,
        (gltf) => {
            bikeModel = gltf.scene;
            setupModel(bikeModel);
            scene.add(bikeModel);
        },
        undefined,
        (error) => {
            console.warn('BikeViewer: Error cargando GLB, usando Placeholder.', error);
            bikeModel = createPlaceholderBike();
            setupModel(bikeModel);
            scene.add(bikeModel);
            // Simular carga completa
            manager.onLoad();
        }
    );

    function setupModel(model) {
        // Centrar y escalar
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.5 / maxDim; // Escalar para que quepa en un cubo de 2.5 unidades
        model.scale.set(scale, scale, scale);

        // Ajustar posición para que esté centrado y sobre el suelo
        model.position.x = -center.x * scale;
        model.position.y = -box.min.y * scale; // Tocar el suelo en Y=0
        model.position.z = -center.z * scale;

        // Sombras y guardar posiciones originales
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // Material tweaks para glassmorphism/estilo limpio
                if (child.material) {
                    child.material.envMapIntensity = 1;
                    child.material.needsUpdate = true;
                }
            }
            // Guardar posición original relativa a su padre
            originalPositions.set(child.uuid, child.position.clone());
        });

        // Crear piso reflectante simple
        const planeGeo = new THREE.CircleGeometry(4, 32);
        const planeMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.2,
            metalness: 0.5
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        plane.receiveShadow = true;
        scene.add(plane);
    }

    // --- PLACEHOLDER BIKE (Geometría Procedural Scott Scale) ---
    function createPlaceholderBike() {
        const group = new THREE.Group();

        // Materiales
        const carbonMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.5,
            name: 'CarbonFrame'
        });
        const accentMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15, // Scott Yellow
            roughness: 0.2,
            metalness: 0.3,
            name: 'Decals'
        });
        const metalMat = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            roughness: 0.2,
            metalness: 0.9,
            name: 'Chrome'
        });
        const rubberMat = new THREE.MeshStandardMaterial({
            color: 0x050505,
            roughness: 0.9,
            name: 'Tires'
        });

        // --- CUADRO (Hardtail Geometry) ---
        // Coordenadas aproximadas (X, Y) vistos de lado
        const headTubePos = new THREE.Vector3(0.8, 1.0, 0);
        const seatTubeTop = new THREE.Vector3(-0.3, 0.9, 0);
        const bbPos = new THREE.Vector3(0, 0.3, 0); // Bottom Bracket
        const rearWheelPos = new THREE.Vector3(-0.95, 0.35, 0);
        const frontWheelPos = new THREE.Vector3(1.05, 0.35, 0);

        // Función helper para tubos
        function createTube(p1, p2, radius, material) {
            const path = new THREE.LineCurve3(p1, p2);
            const geom = new THREE.TubeGeometry(path, 1, radius, 8, false);
            return new THREE.Mesh(geom, material);
        }

        // Top Tube (ligeramente inclinado)
        group.add(createTube(headTubePos, seatTubeTop, 0.045, carbonMat));

        // Down Tube (más grueso)
        group.add(createTube(headTubePos, bbPos, 0.055, carbonMat));

        // Seat Tube
        group.add(createTube(seatTubeTop, bbPos, 0.04, carbonMat));

        // Seat Stays (Triángulo trasero superior)
        const seatStayL = createTube(seatTubeTop, rearWheelPos.clone().add(new THREE.Vector3(0, 0, 0.06)), 0.02, carbonMat);
        const seatStayR = createTube(seatTubeTop, rearWheelPos.clone().add(new THREE.Vector3(0, 0, -0.06)), 0.02, carbonMat);
        group.add(seatStayL, seatStayR);

        // Chain Stays (Triángulo trasero inferior)
        const chainStayL = createTube(bbPos, rearWheelPos.clone().add(new THREE.Vector3(0, 0, 0.06)), 0.025, carbonMat);
        const chainStayR = createTube(bbPos, rearWheelPos.clone().add(new THREE.Vector3(0, 0, -0.06)), 0.025, carbonMat);
        group.add(chainStayL, chainStayR);

        // Head Tube (Vertical corto)
        const headTubeTop = headTubePos.clone().add(new THREE.Vector3(0, 0.05, 0));
        const headTubeBottom = headTubePos.clone().add(new THREE.Vector3(0, -0.1, 0));
        group.add(createTube(headTubeTop, headTubeBottom, 0.05, carbonMat));


        // --- HORQUILLA (Suspension) ---
        const forkCrown = headTubeBottom.clone();
        const forkDropouts = frontWheelPos.clone();

        // Barras superiores (Dorado/Metal)
        const stanchionL = createTube(forkCrown.clone().add(new THREE.Vector3(0, 0, 0.06)), forkDropouts.clone().add(new THREE.Vector3(-0.05, 0.2, 0.06)), 0.035, metalMat);
        const stanchionR = createTube(forkCrown.clone().add(new THREE.Vector3(0, 0, -0.06)), forkDropouts.clone().add(new THREE.Vector3(-0.05, 0.2, -0.06)), 0.035, metalMat);
        group.add(stanchionL, stanchionR);

        // Botellas (Parte baja horquilla - Negra)
        const lowerLegL = createTube(forkDropouts.clone().add(new THREE.Vector3(-0.05, 0.2, 0.06)), forkDropouts.clone().add(new THREE.Vector3(0, 0, 0.06)), 0.04, carbonMat);
        const lowerLegR = createTube(forkDropouts.clone().add(new THREE.Vector3(-0.05, 0.2, -0.06)), forkDropouts.clone().add(new THREE.Vector3(0, 0, -0.06)), 0.04, carbonMat);
        group.add(lowerLegL, lowerLegR);


        // --- RUEDAS (29") ---
        function createWheel(position) {
            const wheelGroup = new THREE.Group();
            wheelGroup.position.copy(position);

            // Neumático
            const tireGeom = new THREE.TorusGeometry(0.36, 0.028, 16, 32); // ~29 inches scaled
            const tire = new THREE.Mesh(tireGeom, rubberMat);

            // Llanta
            const rimGeom = new THREE.TorusGeometry(0.33, 0.015, 16, 32);
            const rim = new THREE.Mesh(rimGeom, carbonMat);

            // Radios (Disco simple con textura o transparencia sería mejor, pero usamos radios básicos)
            const spokesGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.01, 8, 1, false, 0, Math.PI * 2);
            const spokesMat = new THREE.MeshBasicMaterial({ color: 0x333333, wireframe: true, transparent: true, opacity: 0.3 });
            const spokes = new THREE.Mesh(spokesGeom, spokesMat);
            spokes.rotation.x = Math.PI / 2;

            wheelGroup.add(tire, rim, spokes);
            return wheelGroup;
        }

        group.add(createWheel(rearWheelPos));
        group.add(createWheel(frontWheelPos));

        // --- COMPONENTES ---

        // Manillar
        const handleBarGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.76);
        const handleBar = new THREE.Mesh(handleBarGeom, carbonMat);
        handleBar.position.copy(headTubeTop).add(new THREE.Vector3(-0.05, 0.05, 0));
        handleBar.rotation.x = Math.PI / 2;
        group.add(handleBar);

        // Potencia
        const stem = createTube(headTubeTop, handleBar.position, 0.02, carbonMat);
        group.add(stem);

        // Sillín
        const seatPost = createTube(seatTubeTop, seatTubeTop.clone().add(new THREE.Vector3(0, 0.2, 0)), 0.03, carbonMat);
        group.add(seatPost);

        const saddleGeom = new THREE.BoxGeometry(0.25, 0.05, 0.15);
        const saddle = new THREE.Mesh(saddleGeom, carbonMat);
        saddle.position.copy(seatTubeTop).add(new THREE.Vector3(-0.05, 0.22, 0));
        // Darle forma básica
        saddle.geometry.translate(0, 0, 0);
        group.add(saddle);

        // Transmisión (Plato simple)
        const crankParams = { radius: 0.1, tube: 0.01, radialSegments: 16, tubularSegments: 32 };
        const crankGeom = new THREE.TorusGeometry(crankParams.radius, crankParams.tube, crankParams.radialSegments, crankParams.tubularSegments);
        const crank = new THREE.Mesh(crankGeom, metalMat);
        crank.position.copy(bbPos);
        group.add(crank);

        // Nombres para interacción (opcional, si el raycaster usara meshes)
        group.name = "ProceduralScottScale";

        return group;
    }

    // --- HOTSPOTS ---
    function createHotspots() {
        // Limpiar anteriores si hubiera
        hotspots.forEach(h => scene.remove(h));
        hotspots.length = 0;

        const hotspotGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const hotspotMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.8 });
        const hotspotRingGeo = new THREE.RingGeometry(0.1, 0.12, 32);
        const hotspotRingMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

        bikeParts.forEach(part => {
            const group = new THREE.Group();
            group.position.set(part.hotspotPosition.x, part.hotspotPosition.y, part.hotspotPosition.z);

            const dot = new THREE.Mesh(hotspotGeo, hotspotMat.clone());
            const ring = new THREE.Mesh(hotspotRingGeo, hotspotRingMat);

            // Animación pulsante simple en render loop
            group.userData = {
                partId: part.id,
                isHotspot: true,
                originalScale: 1
            };

            group.add(dot);
            group.add(ring);

            // Billboard (siempre mirar a cámara)
            group.lookAt(camera.position);

            scene.add(group);
            hotspots.push(group);
        });
    }

    // --- INTERACCIÓN Y RAYCASTING ---
    function onPointerMove(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onClick(event) {
        // Si estamos arrastrando (moviendo cámara), no clicar
        // (OrbitControls maneja esto, pero para raycast directo a veces hace falta checkear delta)

        if (hoveredPart) {
            showPartDetails(hoveredPart);

            // Enfocar cámara si hay datos
            const part = bikeParts.find(p => p.id === hoveredPart);
            if (part && part.cameraPosition) {
                moveCamera(part.cameraPosition, part.cameraTarget || part.hotspotPosition);
            }

            autoRotate = false;
            updateUI();
        } else {
            // Click en vacío -> cerrar panel?
            // detailPanel.classList.remove('active');
        }
    }

    function showPartDetails(partId) {
        const part = bikeParts.find(p => p.id === partId);
        if (!part) return;

        document.getElementById('panel-title').innerText = part.name;
        document.getElementById('panel-desc').innerText = part.description;

        const specsList = document.getElementById('panel-specs');
        specsList.innerHTML = part.specs.map(s => `<li>${s}</li>`).join('');

        detailPanel.classList.add('active');
    }

    function moveCamera(targetPos, lookAt) {
        // Animación simple de cámara (usando interpolación en render loop sería mejor con Tween, 
        // pero aquí haremos un "salto" suave con controls.target y posición manual)
        // Para simplificar sin Tween.js:

        // Desactivar auto-rotación al interactuar
        autoRotate = false;
        controls.autoRotate = false;

        // Mover controls.target suavemente (OrbitControls tiene damping, así que setear target funciona bien)
        controls.target.set(lookAt.x, lookAt.y, lookAt.z);

        // Mover cámara (sin animación suave compleja por ahora para no añadir deps)
        // camera.position.set(targetPos.x, targetPos.y, targetPos.z); 
        // Mejor: dejar que el usuario explore desde el nuevo punto de vista
    }

    function updateUI() {
        document.getElementById('btn-autorotate').classList.toggle('active', autoRotate);
    }

    // Event Listeners
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    // Botonera listeners
    document.getElementById('btn-reset').addEventListener('click', () => {
        controls.reset();
        camera.position.set(2.5, 1.5, 2.5);
        autoRotate = true;
        exploded = false;
        resetExplosion();
        detailPanel.classList.remove('active');
        updateUI();
    });

    document.getElementById('btn-autorotate').addEventListener('click', () => {
        autoRotate = !autoRotate;
        updateUI();
    });

    document.getElementById('btn-explode').addEventListener('click', () => {
        exploded = !exploded;
        if (exploded) explodeView();
        else resetExplosion();
    });

    document.querySelector('.close-panel').addEventListener('click', () => {
        detailPanel.classList.remove('active');
    });

    // --- LÓGICA DE EXPLOSIÓN (Simplificada) ---
    function explodeView() {
        if (!bikeModel) return;
        const scalar = 0.5; // Cuánto separar

        bikeModel.traverse((child) => {
            if (child.isMesh) {
                // Vector desde el centro hacia afuera
                const center = new THREE.Vector3(); // Centro del modelo (0,0,0 aprox)
                const dir = child.position.clone().sub(center).normalize();

                // Mover
                child.position.add(dir.multiplyScalar(scalar));
            }
        });
    }

    function resetExplosion() {
        if (!bikeModel) return;
        bikeModel.traverse((child) => {
            if (originalPositions.has(child.uuid)) {
                child.position.copy(originalPositions.get(child.uuid));
            }
        });
    }

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();

        // Auto rotación
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 2.0; // Velocidad
        controls.update(); // Necesario para damping y autoRotate

        // Raycasting
        raycaster.setFromCamera(mouse, camera);

        // Detectar hover en hotspots
        const intersects = raycaster.intersectObjects(hotspots, true);

        // Reset estados de hover visual
        hotspots.forEach(h => h.scale.setScalar(1));
        document.body.style.cursor = 'default';
        hoveredPart = null;

        if (intersects.length > 0) {
            const hit = intersects[0].object.parent; // El grupo
            if (hit.userData.isHotspot) {
                hit.scale.setScalar(1.2); // Agrandar al hover
                document.body.style.cursor = 'pointer';
                hoveredPart = hit.userData.partId;
            }
        } else {
            // Si no hay hotspot, probar con meshes del modelo
            if (bikeModel) {
                const modelIntersects = raycaster.intersectObject(bikeModel, true);
                if (modelIntersects.length > 0) {
                    // Lógica más compleja para mapear mesh -> partId
                    // Por ahora simplificado: solo hotspots activan UI
                }
            }
        }

        // Animar hotspots (pulsar)
        const time = clock.getElapsedTime();
        hotspots.forEach(h => {
            // LookAt cámara siempre
            h.lookAt(camera.position);
            // Efecto flotante suave
            h.position.y += Math.sin(time * 2) * 0.0005;
        });

        renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    const onWindowResize = () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onWindowResize);
}
