import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Security & Integrity Utils
export const getPasswordStrength = (pw: string) => {
  let score = 0;
  if (!pw) return 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
  return score;
};

export const isPasswordStrong = (pw: string) => getPasswordStrength(pw) === 4;

export const isAccessCodeStrong = (code: string) => {
  return code.length >= 6 && /[A-Z]/.test(code) && /[0-9]/.test(code);
};

export const isFakeData = (val: string) => {
  if (!val) return false;
  const lower = val.toLowerCase().trim();
  const commonFakes = ['test', 'temp', 'demo', 'asdf', 'qwerty', '1234', 'admin', 'user', 'fake', 'abcd'];
  if (commonFakes.some(f => lower.includes(f))) return true;
  if (/^(.)\1{3,}$/.test(lower)) return true;
  if (lower.length >= 4 && "1234567890abcdefghijklmnopqrstuvwxyz".includes(lower)) return true;
  return false;
};

export const isValidUrlPattern = (url: string) => {
  // RFC-compliant slug pattern: lowercase alphanumeric, hyphens only, 3-32 characters, no start/end hyphens
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(url) && url.length >= 3 && url.length <= 32;
};

/**
 * Standardizes the URL formation to: https://domain.com/{module}/{action}
 * A professional pattern for high-integrity architectural routing.
 */
export const formatEliteUrl = (module: string, action: string) => {
  const domain = "orbix.ai"; // Primary Platform Domain
  const cleanModule = module.toLowerCase().trim();
  const cleanAction = action.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `https://${domain}/${cleanModule}/${cleanAction}`;
};
