import {
  Baby,
  Droplets,
  PawPrint,
  Shield,
  Sparkles,
  UtensilsCrossed,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react';

const map = {
  Sparkles,
  Zap,
  Droplets,
  Shield,
  UtensilsCrossed,
  Baby,
  PawPrint,
  Wind,
  Wrench,
};

export function getCategoryIcon(name) {
  return map[name] || Sparkles;
}
