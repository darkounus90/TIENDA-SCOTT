/**
 * Definición de partes de la bicicleta para el visor 3D.
 * 
 * Cada objeto representa un punto de interés (hotspot) o una pieza interactiva.
 * 
 * Propiedades:
 * - id: Identificador único.
 * - name: Nombre visible de la pieza.
 * - description: Descripción corta.
 * - specs: Array de cadenas con especificaciones técnicas.
 * - hotspotPosition: {x, y, z} Coordenadas relativas al modelo para el punto de clic.
 * - cameraPosition: {x, y, z} Dónde colocar la cámara al enfocar esta parte (opcional).
 * - cameraTarget: {x, y, z} Hacia dónde mira la cámara (opcional, por defecto hotspotPosition).
 * - meshNameHints: Array de strings. Si el nombre de una malla en el GLB contiene alguno de estos, se asociará a esta parte.
 */

export const bikeParts = [
    {
        id: 'frame',
        name: 'Cuadro Scale Carbon HMF',
        description: 'Geometría de competición con ángulo de dirección ajustable y sistema de cableado Syncros.',
        specs: [
            'Material: Carbono HMF',
            'Tecnología: Advanced Shock & Standing Damping',
            'Ángulo de dirección: Ajustable +/- 0.6°',
            'Eje: 12x148mm Boost'
        ],
        hotspotPosition: { x: 0.25, y: 0.75, z: 0 },
        cameraPosition: { x: 1.5, y: 0.8, z: 1.5 },
        meshNameHints: ['Frame', 'Cuadro', 'Tube']
    },
    {
        id: 'suspension',
        name: 'Horquilla FOX 32 SC Float',
        description: 'Rendimiento puro de XC con 100mm de recorrido y control remoto RideLoc 2.',
        specs: [
            'Modelo: FOX 32 SC Float Performance Air Grip',
            'Recorrido: 100mm',
            'Eje: 15x110mm QR',
            'Modos: 3 (Bloqueo, Tracción, Descenso)'
        ],
        hotspotPosition: { x: 0.9, y: 0.6, z: 0.1 },
        cameraPosition: { x: 1.5, y: 0.6, z: 1.0 },
        meshNameHints: ['Fork', 'Suspension', 'Fox']
    },
    {
        id: 'drivetrain',
        name: 'Transmisión SRAM GX Eagle',
        description: 'Cambios nítidos y fiabilidad probada en un sistema 1x12.',
        specs: [
            'Desviador: SRAM GX Eagle 12 Speed',
            'Bielas: SRAM GX Eagle DUB (32T)',
            'Cassette: SRAM XG1275 (10-52T)',
            'Cadena: SRAM CN NX Eagle'
        ],
        hotspotPosition: { x: 0, y: 0.3, z: 0.15 },
        cameraPosition: { x: 0.5, y: 0.3, z: 1.2 },
        meshNameHints: ['Derailleur', 'Cassette', 'Chain', 'Crank']
    },
    {
        id: 'brakes',
        name: 'Frenos Shimano Deore',
        description: 'Potencia de frenado modulable para mantener el control.',
        specs: [
            'Modelo: Shimano Deore M6100 Disc',
            'Disco Delantero: Shimano SM-RT64 CL 180mm',
            'Disco Trasero: Shimano SM-RT64 CL 160mm',
            'Manetas: Shimano Deore'
        ],
        hotspotPosition: { x: 1.05, y: 0.35, z: 0.1 },
        cameraPosition: { x: 1.5, y: 0.4, z: 0.8 },
        meshNameHints: ['Brake', 'Disc', 'Caliper']
    },
    {
        id: 'wheels',
        name: 'Ruedas Syncros X-30SE',
        description: 'Juego de ruedas Tubeless ready robusto y ancho para mayor tracción.',
        specs: [
            'Llantas: Syncros X-30SE / 30mm ancho',
            'Neumático Del: Schwalbe Racing Ray 29x2.35"',
            'Neumático Tras: Schwalbe Racing Ralph 29x2.35"',
            'Bujes: Formula CL-811 / CL-14811'
        ],
        hotspotPosition: { x: -0.95, y: 0.7, z: 0 },
        cameraPosition: { x: -1.5, y: 0.5, z: 1.0 },
        meshNameHints: ['Wheel', 'Rim', 'Tire', 'Tyre']
    },
    {
        id: 'cockpit',
        name: 'Puesto de Mando Syncros',
        description: 'Integración total de cables para un perfil limpio y aerodinámico.',
        specs: [
            'Manillar: Syncros Fraser 2.0 XC Alloy 6061',
            'Potencia: Syncros XC 2.0 (-12° rise)',
            'Puños: Syncros Performance XC lock-on',
            'Juego de dirección: Syncros - Acros Angle adjust'
        ],
        hotspotPosition: { x: 0.7, y: 1.05, z: 0 },
        cameraPosition: { x: 1.0, y: 1.3, z: 0.5 },
        meshNameHints: ['Handlebar', 'Stem', 'Saddle', 'Seat']
    }
];
