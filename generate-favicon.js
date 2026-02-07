const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(512, 512);
const ctx = canvas.getContext('2d');

// Background gradient
const bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
bgGrad.addColorStop(0, '#030014');
bgGrad.addColorStop(1, '#0f172a');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, 512, 512);

// Icon gradient
const iconGrad = ctx.createLinearGradient(0, 0, 512, 512);
iconGrad.addColorStop(0, '#8b5cf6');
iconGrad.addColorStop(0.5, '#a78bfa');
iconGrad.addColorStop(1, '#06b6d4');

// Outer wheel
ctx.strokeStyle = iconGrad;
ctx.lineWidth = 16;
ctx.globalAlpha = 0.8;
ctx.beginPath();
ctx.arc(256, 256, 140, 0, Math.PI * 2);
ctx.stroke();

// Inner hub
ctx.globalAlpha = 1;
ctx.fillStyle = iconGrad;
ctx.beginPath();
ctx.arc(256, 256, 35, 0, Math.PI * 2);
ctx.fill();

// Spokes
ctx.strokeStyle = iconGrad;
ctx.lineWidth = 6;
ctx.globalAlpha = 0.7;

const spokes = [
    [256, 116], [355, 180], [355, 332],
    [256, 396], [157, 332], [157, 180]
];

spokes.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(256, 256);
    ctx.lineTo(x, y);
    ctx.stroke();
});

// Accent ring
ctx.strokeStyle = '#06b6d4';
ctx.lineWidth = 3;
ctx.globalAlpha = 0.4;
ctx.beginPath();
ctx.arc(256, 256, 100, 0, Math.PI * 2);
ctx.stroke();

// Corner accent
ctx.fillStyle = '#8b5cf6';
ctx.globalAlpha = 0.15;
ctx.beginPath();
ctx.arc(420, 92, 30, 0, Math.PI * 2);
ctx.fill();

// Save as PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('favicon-512.png', buffer);

console.log('✅ favicon-512.png created successfully!');
