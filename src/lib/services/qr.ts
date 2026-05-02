import QRCode from 'qrcode';

/**
 * Service for generating QR codes for document verification.
 */
export const qrService = {
  /**
   * Generates a QR code Data URL for a given verification URL.
   */
  async generateVerificationQR(signatureId: string): Promise<string> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${signatureId}`;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        color: {
          dark: '#1e1b4b', // Indigo 950
          light: '#ffffff',
        },
        width: 400,
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      throw new Error('Failed to generate verification QR code');
    }
  }
};
