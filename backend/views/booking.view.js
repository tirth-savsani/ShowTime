/**
 * Serializer for booking responses (Spec B1, B4)
 */

export const formatCheckout = (data) => {
  return data;
};

export const formatTicket = (ticket) => {
  return ticket;
};

export const formatBookingList = ({ items, pagination }) => {
  return {
    items,
    pagination,
  };
};

export default {
  formatCheckout,
  formatTicket,
  formatBookingList,
};
