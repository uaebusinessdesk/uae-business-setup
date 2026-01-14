/**
 * Setup Type utilities
 * Enforces canonical values and display labels for lead setup types
 */

/**
 * Canonical setup type values
 */
export type SetupType = 'mainland' | 'freezone' | 'offshore' | 'bank';

/**
 * Array of all valid setup types
 */
export const SETUP_TYPES: SetupType[] = ['mainland', 'freezone', 'offshore', 'bank'];

/**
 * Display labels for setup types
 */
export const SETUP_TYPE_LABEL: Record<SetupType, string> = {
  mainland: 'Mainland Company Setup',
  freezone: 'Free Zone Company Setup',
  offshore: 'Offshore Company Setup',
  bank: 'Bank Account Setup',
};

/**
 * Normalize setup type input to canonical value
 * - "company" or empty/null -> "mainland" (legacy support)
 * - Combined types (e.g., "mainland + bank account") -> extract base type (legacy only, combined services no longer supported)
 * - Unknown values -> "mainland" (default fallback)
 * - Returns canonical SetupType
 * Note: Combined services are no longer supported. This normalization is for backward compatibility with existing leads.
 */
export function normalizeSetupType(input: string | null | undefined): SetupType {
  if (!input || input.trim() === '') {
    return 'mainland'; // Legacy: empty/null -> mainland
  }

  const normalized = input.trim().toLowerCase();

  // Handle combined types (e.g., "mainland + bank account", "freezone + bank account")
  if (normalized.includes('+ bank account')) {
    const baseType = normalized.split('+')[0].trim();
    if (baseType === 'mainland') return 'mainland';
    if (baseType === 'freezone') return 'freezone';
    if (baseType === 'offshore') return 'offshore';
  }

  // Legacy: "company" -> "mainland"
  if (normalized === 'company') {
    return 'mainland';
  }

  // Check if it's a valid canonical value
  if (SETUP_TYPES.includes(normalized as SetupType)) {
    return normalized as SetupType;
  }

  // Legacy support for other values
  const legacyMap: Record<string, SetupType> = {
    'existing-company': 'bank',
    'not_sure': 'mainland',
    'mainland company setup': 'mainland',
    'free zone company setup': 'freezone',
    'offshore company setup': 'offshore',
    'bank account setup': 'bank',
  };

  if (legacyMap[normalized]) {
    return legacyMap[normalized];
  }

  // Default fallback to mainland for unknown values
  return 'mainland';
}

/**
 * Get display label for setup type
 * Note: Combined services are no longer supported. For legacy combined types, returns only the base service label.
 */
export function toSetupTypeLabel(input: string | null | undefined): string {
  if (!input || input.trim() === '') {
    return SETUP_TYPE_LABEL['mainland'];
  }

  // Normalize and return label (combined types are normalized to base type)
  const normalizedType = normalizeSetupType(input);
  return SETUP_TYPE_LABEL[normalizedType];
}

