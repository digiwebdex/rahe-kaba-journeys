import QRCode from "qrcode";
import jsPDF from "jspdf";

const TRACKING_BASE_URL = "https://rahe-kaba-journeys.lovable.app/track";

/**
 * Generate a QR code data URL for a booking tracking ID.
 */
export async function generateTrackingQr(trackingId: string): Promise<string> {
  const url = `${TRACKING_BASE_URL}?id=${encodeURIComponent(trackingId)}`;
  return QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    color: { dark: "#282E38", light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
}

/**
 * Add QR code to a jsPDF document at the specified position.
 * Default: top-right area of the page.
 */
export function addQrToDoc(
  doc: jsPDF,
  qrDataUrl: string,
  options?: { x?: number; y?: number; size?: number }
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const size = options?.size ?? 28;
  const x = options?.x ?? pageWidth - 14 - size;
  const y = options?.y ?? 10;

  try {
    doc.addImage(qrDataUrl, "PNG", x, y, size, size);
    // Small label under QR
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("Scan to Track", x + size / 2, y + size + 3, { align: "center" });
    doc.setTextColor(0);
  } catch {
    /* QR generation failed silently */
  }
}
