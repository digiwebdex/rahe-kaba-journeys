import jsPDF from "jspdf";

/**
 * Bengali text detection regex
 */
const BENGALI_REGEX = /[\u0980-\u09FF]/;

/**
 * Check if a string contains Bengali characters
 */
export function hasBengali(text: string): boolean {
  return BENGALI_REGEX.test(text);
}

/**
 * Renders Bengali text on a hidden canvas (which supports full OpenType shaping)
 * and returns an image data URL. This bypasses jsPDF's lack of complex script support.
 */
function renderBengaliTextToImage(
  text: string,
  fontSize: number = 10,
  fontWeight: "normal" | "bold" = "normal",
  color: string = "#000000",
  maxWidth?: number
): { dataUrl: string; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  
  // Use a web-safe Bengali font stack
  const fontFamily = "'Noto Sans Bengali', 'Kalpurush', 'SolaimanLipi', 'Bangla', sans-serif";
  const scaleFactor = 3; // High DPI for crisp text
  const ptToPx = fontSize * 1.33; // Convert pt to px
  const actualFontSize = ptToPx * scaleFactor;
  
  ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
  
  const measured = ctx.measureText(text);
  const textWidth = measured.width;
  const textHeight = actualFontSize * 1.3;
  
  canvas.width = Math.ceil(maxWidth ? maxWidth * scaleFactor : textWidth + 4);
  canvas.height = Math.ceil(textHeight + 4);
  
  // Re-set font after resize (canvas clears on resize)
  ctx.font = `${fontWeight} ${actualFontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.fillText(text, 0, 2);
  
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width / scaleFactor,
    height: canvas.height / scaleFactor,
  };
}

/**
 * Load Noto Sans Bengali font via @font-face for canvas rendering.
 * We inject a CSS @font-face rule and preload it.
 */
let fontLoaded = false;
async function ensureBengaliFontForCanvas(): Promise<void> {
  if (fontLoaded) return;
  
  try {
    if ("FontFace" in window) {
      const font = new FontFace("Noto Sans Bengali", `url(/assets/fonts/NotoSansBengali-Regular.ttf)`);
      await font.load();
      document.fonts.add(font);
      fontLoaded = true;
    }
  } catch (e) {
    console.warn("Could not preload Bengali font for canvas:", e);
    fontLoaded = true;
  }
}

/**
 * Adds Bengali text to a jsPDF document at the given position.
 * If the text contains Bengali characters, renders via canvas for proper shaping.
 * Otherwise falls back to normal jsPDF text rendering.
 */
export async function addBengaliText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    fontWeight?: "normal" | "bold";
    color?: string;
    maxWidth?: number;
  }
): Promise<void> {
  if (!text) return;
  
  const fontSize = options?.fontSize || 10;
  const fontWeight = options?.fontWeight || "normal";
  const color = options?.color || "#000000";
  
  if (hasBengali(text)) {
    await ensureBengaliFontForCanvas();
    const img = renderBengaliTextToImage(text, fontSize, fontWeight, color, options?.maxWidth);
    try {
      doc.addImage(img.dataUrl, "PNG", x, y - img.height * 0.75, img.width, img.height);
    } catch (e) {
      // Fallback to plain text
      doc.text(text, x, y);
    }
  } else {
    doc.text(text, x, y);
  }
}

// ── Legacy jsPDF font registration (still used for autoTable) ──
import bengaliFontUrl from "@/assets/fonts/NotoSansBengali-Regular.ttf";

let fontBase64Cache: string | null = null;

async function loadFontAsBase64(): Promise<string> {
  if (fontBase64Cache) return fontBase64Cache;

  const response = await fetch(bengaliFontUrl);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  fontBase64Cache = btoa(binary);
  return fontBase64Cache;
}

export async function registerBengaliFont(doc: jsPDF): Promise<void> {
  try {
    const base64 = await loadFontAsBase64();
    doc.addFileToVFS("NotoSansBengali-Regular.ttf", base64);
    doc.addFont("NotoSansBengali-Regular.ttf", "NotoSansBengali", "normal");
    // Also preload for canvas rendering
    await ensureBengaliFontForCanvas();
  } catch (e) {
    console.warn("Failed to load Bengali font:", e);
  }
}

/**
 * Sets font to Bengali if available, otherwise helvetica.
 */
export function setBengaliFont(doc: jsPDF, style: "normal" | "bold" = "normal") {
  try {
    doc.setFont("NotoSansBengali", style);
  } catch {
    doc.setFont("helvetica", style);
  }
}

/**
 * Sets font back to helvetica.
 */
export function setLatinFont(doc: jsPDF, style: "normal" | "bold" | "italic" = "normal") {
  doc.setFont("helvetica", style);
}
