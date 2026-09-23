import QRCode from "qrcode";

/**
 * Server-side QR code as an SVG string, always dark-on-white regardless of
 * branding (colorizing modules risks scan reliability). Only pass URLs we
 * build ourselves from trusted slugs — the result is injected as raw HTML.
 */
export function createQrSvg(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 1,
    color: { dark: "#171717", light: "#ffffff" },
  });
}
