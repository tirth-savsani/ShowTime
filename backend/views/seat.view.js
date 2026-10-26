/**
 * Presentation serializer for Seat and Hold data (Spec B1, B4)
 */

export const formatSeatMap = (data) => {
  return data;
};

export const formatHoldResult = (data) => {
  return {
    seatIds: data.seatIds,
    expiresAt: data.expiresAt,
    amount: data.amount,
    categories: data.categories,
  };
};

export const formatUserHold = (data) => {
  return data;
};

export default {
  formatSeatMap,
  formatHoldResult,
  formatUserHold,
};
