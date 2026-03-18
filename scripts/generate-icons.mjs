import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

const sizes = [192, 512];
const outputDir = path.join(process.cwd(), "public", "icons");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generateIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background
  const bgColor = "#18181b";
  ctx.fillStyle = bgColor;
  
  if (maskable) {
    // For maskable icons, fill the entire canvas
    ctx.fillRect(0, 0, size, size);
  } else {
    // For regular icons, create rounded corners
    const radius = size * 0.15;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, radius);
    ctx.fill();
  }

  // Draw a stylized guitar pick / music note shape
  const centerX = size / 2;
  const centerY = size / 2;
  const iconSize = maskable ? size * 0.4 : size * 0.5;

  // Guitar pick shape
  ctx.fillStyle = "#22c55e"; // Green color for music/transposition theme
  ctx.beginPath();
  
  // Create a pick shape
  const pickWidth = iconSize * 0.8;
  const pickHeight = iconSize;
  
  ctx.moveTo(centerX, centerY - pickHeight * 0.45);
  ctx.bezierCurveTo(
    centerX + pickWidth * 0.5, centerY - pickHeight * 0.3,
    centerX + pickWidth * 0.5, centerY + pickHeight * 0.1,
    centerX, centerY + pickHeight * 0.55
  );
  ctx.bezierCurveTo(
    centerX - pickWidth * 0.5, centerY + pickHeight * 0.1,
    centerX - pickWidth * 0.5, centerY - pickHeight * 0.3,
    centerX, centerY - pickHeight * 0.45
  );
  ctx.fill();

  // Add a "T" for Transpo
  ctx.fillStyle = "#18181b";
  ctx.font = `bold ${iconSize * 0.4}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("T", centerX, centerY);

  return canvas;
}

for (const size of sizes) {
  // Regular icon
  const regularCanvas = generateIcon(size, false);
  const regularBuffer = regularCanvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, `icon-${size}.png`), regularBuffer);
  console.log(`Generated icon-${size}.png`);

  // Maskable icon
  const maskableCanvas = generateIcon(size, true);
  const maskableBuffer = maskableCanvas.toBuffer("image/png");
  fs.writeFileSync(path.join(outputDir, `icon-maskable-${size}.png`), maskableBuffer);
  console.log(`Generated icon-maskable-${size}.png`);
}

console.log("All icons generated successfully!");
