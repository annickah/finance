/**
 * Utilitaires de formatage monétaire en Ariary (Ar), dates, marges et pourcentages.
 * Conçu sur-mesure pour Eray Digital.
 */

/**
 * Formate un montant numérique en Ariary (Ar)
 * Exemples:
 *   formatAriary(1500000) => "1 500 000 Ar"
 *   formatAriary(-450000) => "-450 000 Ar"
 *   formatAriary(250000, { sign: true }) => "+250 000 Ar"
 *   formatAriary(1500000, { compact: true }) => "1,5M Ar"
 */
export function formatAriary(
  amount: number | null | undefined,
  options?: {
    compact?: boolean;
    showSymbol?: boolean;
    sign?: boolean;
    precision?: number;
  }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${options?.showSymbol !== false ? 'Ar' : ''}`.trim();
  }

  const { compact = false, showSymbol = true, sign = false, precision = 1 } = options || {};
  const symbol = showSymbol ? ' Ar' : '';
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let prefix = '';
  if (sign && isPositive) prefix = '+';
  if (isNegative) prefix = '-';

  if (compact) {
    if (absAmount >= 1_000_000_000) {
      const val = (absAmount / 1_000_000_000).toFixed(precision).replace('.', ',');
      return `${prefix}${val} Mrd${symbol}`;
    }
    if (absAmount >= 1_000_000) {
      const val = (absAmount / 1_000_000).toFixed(precision).replace('.', ',');
      return `${prefix}${val}M${symbol}`;
    }
    if (absAmount >= 1_000) {
      const val = (absAmount / 1_000).toFixed(precision).replace('.', ',');
      return `${prefix}${val}k${symbol}`;
    }
    return `${prefix}${absAmount}${symbol}`;
  }

  // Format standard avec espaces insécables pour les milliers
  const formattedNumber = Math.round(absAmount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${prefix}${formattedNumber}${symbol}`;
}

/**
 * Calcule la marge brute et le taux de marge en pourcentage
 * Formules:
 * Marge = Prix de Vente - Coûts Totaux Réels
 * % Marge = (Marge / Prix de Vente) * 100
 */
export function calculateMargin(
  sellingPrice: number,
  totalCosts: number
): {
  grossMargin: number;
  marginRate: number;
  isProfitable: boolean;
} {
  const grossMargin = sellingPrice - totalCosts;
  const marginRate = sellingPrice > 0 ? (grossMargin / sellingPrice) * 100 : 0;

  return {
    grossMargin,
    marginRate: Number(marginRate.toFixed(1)),
    isProfitable: grossMargin >= 0,
  };
}

/**
 * Formate un pourcentage
 */
export function formatPercent(value: number, options?: { sign?: boolean; precision?: number }): string {
  const { sign = false, precision = 1 } = options || {};
  const prefix = sign && value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(precision)}%`;
}

/**
 * Formate une date au format français (ex: 26 août 2026 ou 26/08/2026)
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  mode: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  if (mode === 'short') {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  if (mode === 'long') {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calcule l'écart et le pourcentage entre Prévisionnel et Réel
 */
export function calculateVariance(real: number, planned: number): {
  diff: number;
  diffPercent: number;
  isPositive: boolean;
} {
  const diff = real - planned;
  const diffPercent = planned > 0 ? (diff / planned) * 100 : 0;
  return {
    diff,
    diffPercent: Number(diffPercent.toFixed(1)),
    isPositive: diff >= 0,
  };
}

/**
 * Helper de couleur selon le taux de marge
 */
export function getMarginBadgeClasses(marginRate: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  if (marginRate >= 50) {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      text: 'text-emerald-600',
      border: 'border-emerald-500',
      badge: 'Excellente (>50%)',
    };
  }
  if (marginRate >= 30) {
    return {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      text: 'text-blue-600',
      border: 'border-blue-500',
      badge: 'Saine (30-50%)',
    };
  }
  if (marginRate >= 15) {
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      text: 'text-amber-600',
      border: 'border-amber-500',
      badge: 'Faible (15-30%)',
    };
  }
  return {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    text: 'text-rose-600',
    border: 'border-rose-500',
    badge: 'Critique (<15%)',
  };
}
