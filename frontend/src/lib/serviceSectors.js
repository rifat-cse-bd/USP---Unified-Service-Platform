import { FALLBACK_MAJORS, getMajorMeta, imageSrc } from './serviceCatalog';

/** @deprecated Use FALLBACK_MAJORS from serviceCatalog.js */
export const FALLBACK_SECTORS = FALLBACK_MAJORS;

/** Blurbs for major sectors (images come from /public/images). */
export const SERVICE_SECTORS = Object.fromEntries(
  FALLBACK_MAJORS.map((m) => [
    m.slug,
    {
      image: m.image_url,
      blurb: m.description,
    },
  ])
);

export { getMajorMeta, imageSrc };
