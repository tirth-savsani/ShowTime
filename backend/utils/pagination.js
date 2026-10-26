/**
 * Pagination helper (Spec B1)
 * Returns a consistent pagination meta object for list responses.
 */

/**
 * Build pagination meta.
 * @param {number} page  - current page (1-indexed)
 * @param {number} limit - items per page
 * @param {number} total - total matching documents
 * @returns {{ page, limit, total, pages }}
 */
export const paginate = (page, limit, total) => {
  const pages = total > 0 ? Math.ceil(total / limit) : 1;
  return { page, limit, total, pages };
};

export default { paginate };
