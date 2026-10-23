// src/lib/qr-code.ts
// Browser-only: QR codes for menu links, as SVG (for designers and large
// prints) and PNG (for everyone else), optionally with the logo in the middle.
import QRCode from "qrcode";

// Quiet zone around the code, in modules; scanners need it.
const MARGIN = 4;
// Logo box width as a share of the code. With error correction "H" a code
// survives about 30% damage, so this stays well within what scanners recover.
const LOGO_SHARE = 0.22;

interface Layout {
  isDark: (x: number, y: number) => boolean;
  modules: number;
  total: number;
  logo: { start: number; size: number } | null;
}

function layout(text: string, withLogo: boolean): Layout {
  const qr = QRCode.create(text, { errorCorrectionLevel: withLogo ? "H" : "M" });
  const modules = qr.modules.size;

  // An odd number of modules keeps the box centred on the grid.
  let logoSize = Math.round(modules * LOGO_SHARE);
  if (logoSize % 2 !== modules % 2) logoSize += 1;
  const logo = withLogo ? { start: (modules - logoSize) / 2, size: logoSize } : null;

  // Modules under the logo box are left out so its edges stay clean.
  const underLogo = (x: number, y: number) =>
    logo !== null &&
    x >= logo.start &&
    x < logo.start + logo.size &&
    y >= logo.start &&
    y < logo.start + logo.size;

  return {
    isDark: (x, y) => !underLogo(x, y) && qr.modules.get(x, y) === 1,
    modules,
    total: modules + MARGIN * 2,
    logo,
  };
}

/** The code as an SVG document. `logoDataUrl` is embedded when given. */
export function qrToSvg(text: string, logoDataUrl?: string | null): string {
  const { isDark, modules, total, logo } = layout(text, Boolean(logoDataUrl));

  let path = "";
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (isDark(x, y)) path += `M${x + MARGIN} ${y + MARGIN}h1v1h-1z`;
    }
  }

  let logoMarkup = "";
  if (logo && logoDataUrl) {
    const box = logo.start + MARGIN;
    const pad = 0.6;
    logoMarkup =
      `<rect x="${box}" y="${box}" width="${logo.size}" height="${logo.size}" rx="1" fill="#ffffff"/>` +
      `<image href="${logoDataUrl}" x="${box + pad}" y="${box + pad}" width="${logo.size - pad * 2}" ` +
      `height="${logo.size - pad * 2}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="#ffffff"/>` +
    `<path d="${path}" fill="#000000"/>` +
    logoMarkup +
    `</svg>`
  );
}

/** The code as a PNG, `pixels` wide and high (print-ready by default). */
export async function qrToPng(
  text: string,
  logo: HTMLImageElement | null,
  pixels = 2048,
): Promise<Blob> {
  const { isDark, modules, total, logo: box } = layout(text, logo !== null);
  const scale = Math.floor(pixels / total);
  const size = scale * total;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.fillStyle = "#000000";
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      if (isDark(x, y)) context.fillRect((x + MARGIN) * scale, (y + MARGIN) * scale, scale, scale);
    }
  }

  if (box && logo) {
    const start = (box.start + MARGIN) * scale;
    const boxSize = box.size * scale;
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.roundRect(start, start, boxSize, boxSize, scale);
    context.fill();

    // Fit the logo inside the box, keeping its proportions.
    const pad = scale * 0.6;
    const room = boxSize - pad * 2;
    const ratio = Math.min(room / logo.naturalWidth, room / logo.naturalHeight);
    const width = logo.naturalWidth * ratio;
    const height = logo.naturalHeight * ratio;
    context.drawImage(logo, start + (boxSize - width) / 2, start + (boxSize - height) / 2, width, height);
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the image."))), "image/png"),
  );
}

/**
 * Loads a logo for drawing into a QR code, through Next's image endpoint on
 * our own domain: a canvas can't export pixels from another site's image.
 * Returns the image and a PNG data URL for embedding in SVGs.
 */
export async function loadLogo(logoUrl: string): Promise<{ image: HTMLImageElement; dataUrl: string }> {
  const image = new Image();
  image.src = `/_next/image?url=${encodeURIComponent(logoUrl)}&w=256&q=90`;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  canvas.getContext("2d")?.drawImage(image, 0, 0);
  return { image, dataUrl: canvas.toDataURL("image/png") };
}
