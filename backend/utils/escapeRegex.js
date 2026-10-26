/**
 * Escapes characters that have special meaning in regular expressions.
 * @param {string} str 
 * @returns {string}
 */
export const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default escapeRegex;
