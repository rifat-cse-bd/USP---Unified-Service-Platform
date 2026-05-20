/** Marketplace sectors (single browse model). Shown even when API is offline. */
export const FALLBACK_SECTORS = [
  { id: 1, slug: 'catering', name: 'Catering', icon: 'UtensilsCrossed', description: 'Events and daily meals' },
  { id: 2, slug: 'cleaning', name: 'Cleaning', icon: 'Sparkles', description: 'Home and office cleaning' },
  { id: 3, slug: 'pet-care', name: 'Pet Care', icon: 'PawPrint', description: 'Walking, sitting, and grooming' },
  { id: 4, slug: 'babysitting', name: 'Babysitting', icon: 'Baby', description: 'Child care at home' },
  { id: 5, slug: 'electrician', name: 'Electrician', icon: 'Zap', description: 'Wiring and electrical repairs' },
  { id: 6, slug: 'security', name: 'Security', icon: 'Shield', description: 'Guards and patrol' },
  { id: 7, slug: 'plumbing', name: 'Plumbing', icon: 'Droplets', description: 'Pipes, leaks, and fixtures' },
  { id: 8, slug: 'ac-repair', name: 'AC Repair', icon: 'Wind', description: 'AC installation and servicing' },
  { id: 9, slug: 'home-maintenance', name: 'Home Maintenance', icon: 'Wrench', description: 'General repairs and upkeep' },
];

export const SERVICE_SECTORS = {
  catering: {
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80',
    blurb:
      'Premium catering for events, corporate galas, and daily meals. Gourmet hospitality executed by certified culinary teams.',
  },
  cleaning: {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    blurb:
      'Environment restoration specialists for residential deep cleaning and industrial workspace sanitization.',
  },
  'pet-care': {
    image: 'https://images.unsplash.com/photo-1450770198934-6a982cbdb5b2?w=800&q=80',
    blurb:
      'Professional companionship, dog walking, sitting, and grooming with compassionate, vetted pet carers.',
  },
  babysitting: {
    image: 'https://images.unsplash.com/photo-1503454537845-dc1f0e871d8e?w=800&q=80',
    blurb:
      'Micro-vetted care network for safe, engaging childcare at home with experienced babysitters.',
  },
  electrician: {
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80',
    blurb:
      'Licensed field technicians for wiring, panels, and emergency electrical repairs.',
  },
  security: {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80',
    blurb:
      'Tactical bodyguards, patrol units, and surveillance-ready security professionals.',
  },
  plumbing: {
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e40?w=800&q=80',
    blurb: 'Expert plumbers for leaks, fixtures, and full pipe installations.',
  },
  'ac-repair': {
    image: 'https://images.unsplash.com/photo-1631545806609-efba9a1b4c8d?w=800&q=80',
    blurb: 'AC installation, servicing, and emergency cooling repairs.',
  },
  'home-maintenance': {
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    blurb: 'General home repairs, carpentry, and preventive maintenance.',
  },
};
