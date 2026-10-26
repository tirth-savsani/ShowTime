import QRCode from 'qrcode';

/**
 * Generates a base64 QR code data URL containing booking verification information
 * @param {string|object} data 
 * @returns {Promise<string>}
 */
export const generateQrCode = async (data) => {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  try {
    const dataUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 250,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    // If QR code generation fails, return a simple text-based fallback
    return '';
  }
};

/**
 * Builds a complete ticket presentation object including QR code data URL (Spec B4, B6.5)
 * @param {object} booking 
 * @returns {Promise<object>}
 */
export const buildTicket = async (booking) => {
  const bookingObj = typeof booking.toObject === 'function' ? booking.toObject() : { ...booking };
  const bookingId = bookingObj.id || bookingObj._id?.toString();

  const qrData = {
    bookingId,
    bookingRef: bookingObj.bookingRef,
    movie: bookingObj.snapshot?.movieTitle,
    theatre: bookingObj.snapshot?.theatreName,
    screen: bookingObj.snapshot?.screenName,
    startTime: bookingObj.snapshot?.startTime,
    seats: (bookingObj.seats || []).map((s) => s.seatId),
  };

  const qrDataUrl = await generateQrCode(qrData);

  return {
    id: bookingId,
    bookingRef: bookingObj.bookingRef,
    status: bookingObj.status,
    amount: bookingObj.amount,
    currency: bookingObj.currency,
    seats: bookingObj.seats,
    snapshot: bookingObj.snapshot,
    razorpay: {
      orderId: bookingObj.razorpay?.orderId,
      paymentId: bookingObj.razorpay?.paymentId,
    },
    refund: bookingObj.refund,
    confirmedAt: bookingObj.confirmedAt,
    cancelledAt: bookingObj.cancelledAt,
    cancelReason: bookingObj.cancelReason,
    createdAt: bookingObj.createdAt,
    qrDataUrl,
  };
};

export default {
  generateQrCode,
  buildTicket,
};
