import { query, queryOne } from '../config/database.js';

/** Resolve a category slug to IDs used in filters (sub slug = one id; major = all child ids). */
export async function resolveCategoryIds(slug) {
  if (!slug) return null;
  const row = await queryOne(`SELECT id, parent_id FROM categories WHERE slug = ?`, [slug]);
  if (!row) return null;
  if (row.parent_id) return [row.id];
  const children = await query(`SELECT id FROM categories WHERE parent_id = ?`, [row.id]);
  if (children.length) return children.map((c) => c.id);
  return [row.id];
}

export function categoryFilterSql(categoryIds, alias = 'c') {
  if (!categoryIds?.length) return { clause: '', params: [] };
  const placeholders = categoryIds.map(() => '?').join(', ');
  return { clause: ` AND ${alias}.id IN (${placeholders})`, params: [...categoryIds] };
}
