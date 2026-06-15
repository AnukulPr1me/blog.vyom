import {
  Smartphone, Wallet, Crown, Camera, Gamepad2, Star, Zap, Award,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Smartphone, Wallet, Crown, Camera, Gamepad2, Star, Zap, Award,
};

/**
 * Resolve a Lucide icon by name (stored as a string on PhoneCategory).
 * Falls back to Smartphone if the name isn't recognized.
 */
export function getPhoneCategoryIcon(name?: string): React.ComponentType<LucideProps> {
  return (name && ICON_MAP[name]) || Smartphone;
}
