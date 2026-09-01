export type AccountType = 'BANK' | 'MOBILE_MONEY' | 'CASH';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  provider: string; // e.g. 'BNI Madagascar', 'MVola', 'Orange Money', 'Airtel Money', 'Caisse'
  accountNumber?: string;
  balance: number;
  initialBalance: number;
  color: string;
  currency: 'MGA';
  isArchived?: boolean;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type TransactionCategory =
  | 'PROJECT_INVOICE'
  | 'RECURRING_FIXED'
  | 'PROJECT_VARIABLE'
  | 'COMMISSION'
  | 'SALARY'
  | 'SERVER_CLOUD'
  | 'TAX'
  | 'OFFICE_RENT'
  | 'MARKETING'
  | 'EXCEPTIONAL'
  | 'TRANSFER';

export type TransactionStatus = 'REALIZED' | 'SCHEDULED' | 'PENDING';

export interface Transaction {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  type: TransactionType;
  amount: number;
  accountId: string; // Source account (or target for INCOME)
  targetAccountId?: string; // For TRANSFER
  category: TransactionCategory;
  description: string;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  invoiceId?: string;
  status: TransactionStatus;
  createdAt: string;
  createdBy: string;
  receiptNumber?: string;
}

export type ProjectCategory =
  | 'WEBSITE'
  | 'ECOMMERCE'
  | 'SOFTWARE'
  | 'MOBILE_APP'
  | 'MAINTENANCE'
  | 'EMBEDDED';

export type ProjectStatus =
  | 'LEAD'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'CANCELLED';

export type CostCategory =
  | 'DEV_COMMISSION'
  | 'SALES_COMMISSION'
  | 'HOSTING'
  | 'DOMAIN'
  | 'API'
  | 'CLOUD'
  | 'SUBCONTRACTING'
  | 'TRAVEL'
  | 'HARDWARE'
  | 'OTHER';

export interface ProjectCostItem {
  id: string;
  label: string;
  category: CostCategory;
  plannedAmount: number;
  realAmount: number;
  isPaid: boolean;
  paidDate?: string;
  invoiceRef?: string;
  beneficiary?: string;
}

export interface Project {
  id: string;
  code: string; // e.g. "PRJ-2026-001"
  name: string;
  category: ProjectCategory;
  clientId: string;
  clientName: string;
  sellingPrice: number; // Prix de vente
  status: ProjectStatus;
  startDate: string;
  deliveryDate: string;
  plannedCosts: ProjectCostItem[];
  realCosts: ProjectCostItem[];
  totalCollected: number; // Encaissements déjà réalisés
  description?: string;
  progressPercent: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  nif?: string;
  stat?: string;
  totalBilled: number;
  totalPaid: number;
  outstandingBalance: number;
  overdueDays: number;
  status: 'GOOD' | 'RISK' | 'CRITICAL';
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface InvoiceItem {
  id: string;
  description: string;
  subItems?: string[]; // Bullet points: e.g. ["Design 100% responsive", "2 adresses e-mail..."]
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "FACTAVC N° 001" or "FAC-2026-042"
  invoiceType?: string; // e.g. "Facture Avance", "Facture Solde", "Facture Acompte", "Facture Standard", "Devis / Proforma"
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientPhone?: string; // e.g. "020 76 436 75"
  clientAddress?: string;
  projectId?: string;
  projectName?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // 0 or 20% TVA
  taxAmount: number;
  totalAmount: number; // PRIX TOTAUX
  paidAmount: number; // Avance reçu / Montant payé
  balanceDue: number; // Restant dû
  status: InvoiceStatus;
  paymentTerms: string;
  amountInWords?: string; // e.g. "quatre-cent Ariary (400 Ar)"
  conditionsText?: string; // e.g. "Eray Digital est responsable du renouvellement des sites en cas de piratage"
  renewalTerms?: string; // e.g. "• Hébergement, nom de domaine, maintenance et sécurisation du site : 400 Ar/an/plateforme."
  notes?: string;
}

export type CommissionRole = 'DEVELOPER' | 'SALES';
export type CommissionRuleType = 'PERCENTAGE' | 'FIXED';

export interface Commission {
  id: string;
  beneficiaryName: string;
  role: CommissionRole;
  projectId: string;
  projectName: string;
  ruleType: CommissionRuleType;
  ruleValue: number; // % or Fixed Amount in Ar
  calculatedAmount: number;
  status: 'DRAFT' | 'VALIDATED' | 'PAID';
  validatedDate?: string;
  paidDate?: string;
  notes?: string;
}

export interface FinancialAlert {
  id: string;
  type: 'OVERDRAFT_RISK' | 'OVERDUE_INVOICE' | 'BUDGET_OVERRUN' | 'LARGE_EXPENSE';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  date: string;
  targetDate?: string;
  amount?: number;
  resolved: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'ACCOUNT' | 'INVOICE' | 'PROJECT';
}

export interface BudgetPeriod {
  id: string;
  month: string; // "YYYY-MM"
  targetRevenue: number;
  targetExpense: number;
  realizedRevenue: number;
  realizedExpense: number;
  initialBalance: number;
  finalBalance: number;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
}

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'PAYMENT' | 'OTHER';

export interface AuditFieldChange {
  label: string;
  oldVal: string;
  newVal: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole?: string;
  action: string;
  actionType?: AuditActionType;
  entityType: string;
  entityId: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  changes?: AuditFieldChange[];
}

export interface Supplier {
  id: string;
  name: string;
  category: 'HOSTING' | 'CLOUD' | 'DOMAIN' | 'DEVELOPER' | 'SAAS' | 'HARDWARE' | 'OFFICE' | 'OTHER';
  contact: string;
  email: string;
  phone: string;
  address?: string;
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface FixedExpense {
  id: string;
  label: string;
  category: 'RENT' | 'WIFI' | 'ELECTRICITY' | 'SALARIES' | 'PHONE' | 'SAAS' | 'SERVERS' | 'ACCOUNTING' | 'TRANSPORT' | 'SUPPLIES' | 'MARKETING';
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  dueDay: number; // Day of the month (1-31)
  assignedTo: string;
  paymentAccountId: string;
  autoGenerateNextDue: boolean;
  status: 'ACTIVE' | 'PAUSED';
}

export type ForecastScenario = 'REALISTIC' | 'PESSIMISTIC' | 'OPTIMISTIC';

export interface DailyForecast {
  date: string;
  openingBalance: number;
  plannedIncome: number;
  plannedExpense: number;
  closingBalance: number;
  isLowBalanceRisk?: boolean;
}

export type UserRole = 'ADMIN' | 'DIRECTION' | 'FINANCE' | 'READONLY';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

// ==========================================
// COMPTABILITÉ GÉNÉRALE (PCG / MADAGASCAR)
// ==========================================

export type AccountClass = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface PCGAccount {
  code: string; // e.g. "101", "2183", "411", "512", "607", "706"
  name: string; // e.g. "Capital", "Matériel informatique", "Clients", "Banque", "Achats de marchandises", "Prestations de services"
  classNum: AccountClass;
  category: 'CAPITAUX_PROPRES' | 'ACTIF_IMMOBILISE' | 'STOCKS' | 'TIERS' | 'TRESORERIE' | 'CHARGES' | 'PRODUITS';
  type: 'DEBIT_NORMAL' | 'CREDIT_NORMAL';
  description?: string;
}

export interface JournalLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  thirdPartyName?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string; // e.g. "ECR-2026-001"
  date: string;
  pieceRef: string; // Facture, Reçu, Virement
  label: string;
  journalType: 'ACHATS' | 'VENTES' | 'BANQUE' | 'CAISSE' | 'OPERATIONS_DIVERSES';
  lines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  relatedEntityType?: 'INVOICE' | 'TRANSACTION' | 'COMMISSION' | 'EXPENSE';
  relatedEntityId?: string;
}

export interface LedgerTAccount {
  accountCode: string;
  accountName: string;
  classNum: AccountClass;
  debits: { date: string; label: string; pieceRef: string; amount: number }[];
  credits: { date: string; label: string; pieceRef: string; amount: number }[];
  totalDebit: number;
  totalCredit: number;
  balanceType: 'SD' | 'SC' | 'NUL'; // Solde Débiteur ou Solde Créditeur
  balanceAmount: number;
}

export interface BalanceSheetItem {
  code: string;
  name: string;
  amount: number;
}

export interface BalanceSheetSection {
  title: string;
  subtitle?: string;
  items: BalanceSheetItem[];
  total: number;
}

export interface AccountingBalanceRow {
  accountCode: string;
  accountName: string;
  classNum: AccountClass;
  totalDebit: number;
  totalCredit: number;
  soldeDebiteur: number;
  soldeCrediteur: number;
}

