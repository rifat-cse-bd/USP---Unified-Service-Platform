/** Extended marketing copy per major sector (UI only). */
export const SECTOR_COPY = {
  cleaning: {
    tagline: 'Spotless spaces, every time',
    intro:
      'From routine upkeep to intensive deep cleans, WorkSure connects you with background-checked professionals who bring their own supplies, follow checklists, and leave your home or office inspection-ready.',
    highlights: ['Eco-friendly product options', 'Same-day availability in major cities', 'Before/after photo reports'],
    idealFor: ['Families & apartments', 'Offices & co-working spaces', 'Post-renovation handover'],
  },
  electrician: {
    tagline: 'Safe power, certified hands',
    intro:
      'Licensed electricians on WorkSure handle everything from emergency fault finding to full rewiring and smart-home installs — with clear quotes, safety-first practices, and warranty-friendly documentation.',
    highlights: ['Emergency call-out slots', 'Compliance-aware installations', 'Transparent parts + labor pricing'],
    idealFor: ['Homeowners & landlords', 'Small businesses', 'New construction fit-out'],
  },
  security: {
    tagline: 'Protection you can plan around',
    intro:
      'Deploy vetted guards, event security teams, or surveillance specialists through one platform. Schedule shifts, track check-ins, and scale coverage for residential blocks or commercial sites.',
    highlights: ['Verified personnel profiles', 'Event & retail packages', 'CCTV + access control setup'],
    idealFor: ['Residential compounds', 'Retail & warehouses', 'Private events & VIP visits'],
  },
  catering: {
    tagline: 'Memorable meals, zero chaos',
    intro:
      'Book chefs and catering crews for weddings, corporate lunches, religious feasts, or in-home dining. Menus are agreed upfront, dietary needs are flagged, and service staff arrive on schedule.',
    highlights: ['Custom menus & tasting notes', 'Halal & dietary accommodations', 'On-site service staff available'],
    idealFor: ['Weddings & celebrations', 'Corporate offices', 'Family gatherings'],
  },
  babysitting: {
    tagline: 'Care that parents trust',
    intro:
      'Find nannies, after-school helpers, and emergency sitters with documented experience, references, and platform reviews. Book recurring slots or one-off coverage with full booking history.',
    highlights: ['Infant & special-needs experience', 'Recurring schedule support', 'In-app messaging with carers'],
    idealFor: ['Working parents', 'Single-day events', 'Travel & emergency cover'],
  },
  'pet-care': {
    tagline: 'Happy pets, peaceful owners',
    intro:
      'Dog walkers, groomers, sitters, and exotic-pet specialists on WorkSure follow your pet’s routine — feeding notes, meds, and vet visits included in the booking details.',
    highlights: ['Daily walk photo updates', 'Overnight boarding options', 'Vet appointment escorts'],
    idealFor: ['Busy professionals', 'Travel & holidays', 'Puppies & senior pets'],
  },
};

export const PLATFORM_FEATURES = [
  {
    title: 'Verified professionals',
    description: 'Identity checks, document review, and ongoing quality signals before anyone appears in search results.',
    icon: 'Shield',
  },
  {
    title: 'Transparent pricing',
    description: 'See hourly rates and package estimates upfront. Invoices and payment history live in your dashboard.',
    icon: 'BadgeDollarSign',
  },
  {
    title: 'Realtime coordination',
    description: 'Booking updates, chat, and notifications keep customers and workers aligned from request to completion.',
    icon: 'Zap',
  },
  {
    title: 'Specialized sub-services',
    description: 'Six major sectors with 38+ focused offerings — book exactly what you need, not a generic listing.',
    icon: 'Layers',
  },
  {
    title: 'Reviews & accountability',
    description: 'Post-job ratings, complaint workflows, and admin oversight protect both sides of every booking.',
    icon: 'Star',
  },
  {
    title: 'Built for Bangladesh',
    description: 'Local cities, BDT pricing, and familiar payment flows designed for households and growing teams.',
    icon: 'MapPin',
  },
];

export const HOW_IT_WORKS = [
  { step: '01', title: 'Choose your service', description: 'Browse six core sectors and pick a specialized sub-service that matches your job.' },
  { step: '02', title: 'Compare verified pros', description: 'Filter by city, rating, and verification. Read headlines, rates, and recent reviews.' },
  { step: '03', title: 'Book & pay securely', description: 'Schedule a visit, pay via Stripe or mock bKash/Nagad, and receive instant confirmation.' },
  { step: '04', title: 'Track to completion', description: 'Chat, status updates, and notifications until the job is done — then leave your review.' },
];
