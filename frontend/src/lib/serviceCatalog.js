import catalog from '../../../database/service-catalog.json';

export const SERVICE_CATALOG = catalog;

export const FALLBACK_MAJORS = catalog.majors.map((major, index) => ({
  id: index + 1,
  slug: major.slug,
  name: major.name,
  icon: major.icon,
  description: major.description,
  image_url: `/images/${major.image}`,
  subfeatures: major.subfeatures.map((sub, subIndex) => ({
    id: index * 100 + subIndex + 1,
    slug: sub.slug,
    name: sub.name,
    description: sub.description,
    image_url: `/images/${sub.image}`,
  })),
}));

export function getMajorMeta(slug) {
  const major = catalog.majors.find((m) => m.slug === slug);
  if (!major) return null;
  return {
    ...major,
    image_url: `/images/${major.image}`,
    subfeatures: major.subfeatures.map((sub) => ({
      ...sub,
      image_url: `/images/${sub.image}`,
    })),
  };
}

export function getSubfeatureMeta(majorSlug, subSlug) {
  const major = getMajorMeta(majorSlug);
  if (!major) return null;
  const sub = major.subfeatures.find((s) => s.slug === subSlug);
  if (!sub) return null;
  return { major, sub };
}

export function imageSrc(path) {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/images/${path}`;
}
