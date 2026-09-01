/**
 * Convertit un nombre entier en toutes lettres en français (adapté pour les montants en Ariary).
 * Ex: 400 -> "quatre cents", 1000 -> "mille", 5400000 -> "cinq millions quatre cent mille"
 */

const UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const TENS = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante',
  'quatre-vingt',
  'quatre-vingt',
];

function convertBelowThousand(n: number): string {
  if (n === 0) return '';
  if (n < 20) return UNITS[n];

  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7) {
    if (unit === 1) return 'soixante-et-onze';
    return `soixante-${UNITS[10 + unit]}`;
  }

  if (ten === 8) {
    if (unit === 0) return 'quatre-vingts';
    return `quatre-vingt-${UNITS[unit]}`;
  }

  if (ten === 9) {
    return `quatre-vingt-${UNITS[10 + unit]}`;
  }

  if (unit === 0) {
    return TENS[ten];
  }

  if (unit === 1 && ten < 7) {
    return `${TENS[ten]}-et-un`;
  }

  return `${TENS[ten]}-${UNITS[unit]}`;
}

function convertHundreds(n: number): string {
  if (n < 100) return convertBelowThousand(n);
  const hundred = Math.floor(n / 100);
  const remainder = n % 100;

  let hundredStr = '';
  if (hundred === 1) {
    hundredStr = 'cent';
  } else {
    hundredStr = remainder === 0 ? `${UNITS[hundred]} cents` : `${UNITS[hundred]} cent`;
  }

  if (remainder === 0) return hundredStr;
  return `${hundredStr} ${convertBelowThousand(remainder)}`;
}

export function numberToFrenchWords(num: number): string {
  if (num === 0) return 'zéro';
  if (num < 0) return `moins ${numberToFrenchWords(Math.abs(num))}`;

  const integerPart = Math.floor(num);

  const billions = Math.floor(integerPart / 1_000_000_000);
  const millions = Math.floor((integerPart % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((integerPart % 1_000_000) / 1_000);
  const remainder = integerPart % 1_000;

  const parts: string[] = [];

  if (billions > 0) {
    parts.push(billions === 1 ? 'un milliard' : `${convertHundreds(billions)} milliards`);
  }

  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${convertHundreds(millions)} millions`);
  }

  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertHundreds(thousands)} mille`);
    }
  }

  if (remainder > 0) {
    parts.push(convertHundreds(remainder));
  }

  return parts.join(' ').trim();
}

/**
 * Formate la phrase légale en toutes lettres pour facture Ariary
 * Ex: 400 -> "quatre-cents Ariary (400 Ar)"
 */
export function formatAmountInWordsAriary(amount: number): string {
  const words = numberToFrenchWords(amount);
  const formattedNumber = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${words} Ariary (${formattedNumber} Ar)`;
}
