import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Account,
  Project,
  Client,
  Invoice,
  Transaction,
  Commission,
  FinancialAlert,
  BudgetPeriod,
  AuditLog,
  AuditActionType,
  AuditFieldChange,
  ForecastScenario,
  DailyForecast,
  ProjectCostItem,
  Supplier,
  FixedExpense,
  UserRole,
  PCGAccount,
  JournalEntry,
  LedgerTAccount,
  AccountingBalanceRow,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_PROJECTS,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_TRANSACTIONS,
  INITIAL_COMMISSIONS,
  INITIAL_ALERTS,
  INITIAL_BUDGET_PERIODS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUPPLIERS,
  INITIAL_FIXED_EXPENSES,
  INITIAL_PCG_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
} from '../utils/dummyData';
import { calculateMargin } from '../utils/formatters';

interface FinanceContextType {
  // State
  accounts: Account[];
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  transactions: Transaction[];
  commissions: Commission[];
  alerts: FinancialAlert[];
  budgetPeriods: BudgetPeriod[];
  auditLogs: AuditLog[];
  suppliers: Supplier[];
  fixedExpenses: FixedExpense[];
  pcgAccounts: PCGAccount[];
  journalEntries: JournalEntry[];
  currentUserRole: UserRole;
  currentUserName: string;
  forecastScenario: ForecastScenario;
  selectedMonth: string; // "YYYY-MM"

  // Setters & Actions
  setCurrentUserRole: (role: UserRole) => void;
  setCurrentUserName: (name: string) => void;
  setSelectedMonth: (month: string) => void;
  setForecastScenario: (scenario: ForecastScenario) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addTransfer: (fromAccountId: string, toAccountId: string, amount: number, description: string) => void;
  addProject: (project: Omit<Project, 'id' | 'code'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'totalBilled' | 'totalPaid' | 'outstandingBalance' | 'overdueDays' | 'status'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalBilled' | 'totalPaid' | 'balanceDue'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addCostItem: (projectId: string, cost: Omit<ProjectCostItem, 'id'>, isRealCost?: boolean) => void;
  toggleCostPaid: (projectId: string, costId: string, accountId?: string) => void;
  addInvoice: (invoice: Partial<Invoice> & Omit<Invoice, 'id'>) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  recordInvoicePayment: (invoiceId: string, amount: number, accountId: string) => void;
  addCommission: (commission: Omit<Commission, 'id' | 'calculatedAmount'>) => void;
  updateCommissionStatus: (id: string, status: 'VALIDATED' | 'PAID', accountId?: string) => void;
  addFixedExpense: (exp: Omit<FixedExpense, 'id'>) => void;
  payFixedExpense: (expenseId: string, accountId: string) => void;
  paySupplierInvoice: (supplierId: string, amount: number, accountId: string, description: string) => void;
  resolveAlert: (alertId: string) => void;
  closeMonthlyBudget: (month: string, targetRevenue: number, targetExpense: number) => void;
  resetToDemoData: () => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit' | 'isBalanced'>) => void;

  // Computed Financial Metrics
  totalCashBalance: number;
  monthIncome: number;
  monthExpense: number;
  realizedTurnover: number;
  forecastTurnover: number;
  estimatedNetProfit: number;
  outstandingReceivables: number;
  overdueReceivables: number;
  pendingDebtsAndCosts: number;
  averageMarginRate: number;
  activeProjectsCount: number;
  dailyForecasts: DailyForecast[];
  projections: {
    d7: number;
    d30: number;
    d60: number;
    d90: number;
  };

  // PCG Computed Metrics
  ledgerAccounts: LedgerTAccount[];
  accountingBalance: {
    rows: AccountingBalanceRow[];
    totalDebit: number;
    totalCredit: number;
    totalSoldeDebiteur: number;
    totalSoldeCrediteur: number;
    isBalanced: boolean;
  };
  incomeStatement: {
    charges: { code: string; name: string; amount: number }[];
    totalCharges: number;
    products: { code: string; name: string; amount: number }[];
    totalProducts: number;
    netProfit: number;
    isProfit: boolean;
  };
  balanceSheet: {
    actifImmobilise: { code: string; name: string; amount: number }[];
    totalActifImmobilise: number;
    actifCirculant: { code: string; name: string; amount: number }[];
    totalActifCirculant: number;
    tresorerieActif: { code: string; name: string; amount: number }[];
    totalTresorerieActif: number;
    totalActif: number;

    capitauxPropres: { code: string; name: string; amount: number }[];
    totalCapitauxPropres: number;
    dettes: { code: string; name: string; amount: number }[];
    totalDettes: number;
    totalPassif: number;
    isBalanced: boolean;
  };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'eray_digital_finance_v1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage or fallback to defaults
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_projects`);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_clients`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_invoices`);
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [commissions, setCommissions] = useState<Commission[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_commissions`);
    return saved ? JSON.parse(saved) : INITIAL_COMMISSIONS;
  });

  const [alerts, setAlerts] = useState<FinancialAlert[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [budgetPeriods, setBudgetPeriods] = useState<BudgetPeriod[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_budgets`);
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_PERIODS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_fixed_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_FIXED_EXPENSES;
  });

  const [pcgAccounts, setPcgAccounts] = useState<PCGAccount[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_pcg_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_PCG_ACCOUNTS;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_journal_entries`);
    return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
  });

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ADMIN');
  const [currentUserName, setCurrentUserName] = useState<string>('Direction Eray');

  const [forecastScenario, setForecastScenario] = useState<ForecastScenario>('REALISTIC');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts`, JSON.stringify(accounts));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_projects`, JSON.stringify(projects));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_clients`, JSON.stringify(clients));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_invoices`, JSON.stringify(invoices));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_commissions`, JSON.stringify(commissions));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_budgets`, JSON.stringify(budgetPeriods));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_logs`, JSON.stringify(auditLogs));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_fixed_expenses`, JSON.stringify(fixedExpenses));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_pcg_accounts`, JSON.stringify(pcgAccounts));
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_journal_entries`, JSON.stringify(journalEntries));
  }, [accounts, projects, clients, invoices, transactions, commissions, alerts, budgetPeriods, auditLogs, suppliers, fixedExpenses, pcgAccounts, journalEntries]);

  // Helper to log audit events
  const addAuditLog = (
    action: string,
    entityType: string,
    entityId: string,
    details: string,
    oldValue?: string,
    newValue?: string,
    actionType?: AuditActionType,
    changes?: AuditFieldChange[]
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userName: currentUserName,
      userRole: currentUserRole,
      action,
      actionType,
      entityType,
      entityId,
      details,
      oldValue,
      newValue,
      changes,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Add Transaction (Income, Expense, or Transfer)
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>) => {
    const id = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id,
      createdAt: new Date().toISOString(),
      createdBy: 'Finance Manager',
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update account balances
    if (newTx.type === 'INCOME') {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === newTx.accountId ? { ...acc, balance: acc.balance + newTx.amount } : acc
        )
      );
    } else if (newTx.type === 'EXPENSE') {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === newTx.accountId ? { ...acc, balance: acc.balance - newTx.amount } : acc
        )
      );
    } else if (newTx.type === 'TRANSFER' && newTx.targetAccountId) {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === newTx.accountId) return { ...acc, balance: acc.balance - newTx.amount };
          if (acc.id === newTx.targetAccountId) return { ...acc, balance: acc.balance + newTx.amount };
          return acc;
        })
      );
    }

    addAuditLog(
      `Nouvelle transaction (${newTx.type})`,
      'TRANSACTION',
      id,
      `${newTx.description} (${newTx.amount.toLocaleString()} Ar)`,
      undefined,
      undefined,
      'CREATE'
    );
  };

  // Helper: apply the balance effect of a transaction to the accounts list
  const applyTransactionEffect = (
    accs: Account[],
    tx: Pick<Transaction, 'type' | 'accountId' | 'targetAccountId' | 'amount'>,
    sign: 1 | -1
  ): Account[] => {
    return accs.map((acc) => {
      let balance = acc.balance;
      if (tx.type === 'INCOME' && acc.id === tx.accountId) {
        balance += sign * tx.amount;
      } else if (tx.type === 'EXPENSE' && acc.id === tx.accountId) {
        balance -= sign * tx.amount;
      } else if (tx.type === 'TRANSFER') {
        if (acc.id === tx.accountId) balance -= sign * tx.amount;
        if (acc.id === tx.targetAccountId) balance += sign * tx.amount;
      }
      return balance === acc.balance ? acc : { ...acc, balance };
    });
  };

  // Update Transaction
  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return;

    const updated: Transaction = { ...existing, ...updates, id };

    // Revert the old balance effect, then apply the new one
    setAccounts((prev) => applyTransactionEffect(applyTransactionEffect(prev, existing, -1), updated, 1));

    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));

    // Build a field-level diff for the audit trail
    const fieldLabels: Partial<Record<keyof Transaction, string>> = {
      amount: 'Montant',
      type: 'Type de flux',
      accountId: 'Compte',
      targetAccountId: 'Compte destinataire',
      category: 'Catégorie',
      description: 'Libellé',
      date: 'Date',
      status: 'Statut',
      projectId: 'Projet',
      clientId: 'Client',
    };
    const changes: AuditFieldChange[] = [];
    (Object.keys(updates) as (keyof Transaction)[]).forEach((key) => {
      const oldVal = existing[key];
      const newVal = updated[key];
      if (oldVal !== newVal && fieldLabels[key]) {
        changes.push({ label: fieldLabels[key]!, oldVal: String(oldVal ?? ''), newVal: String(newVal ?? '') });
      }
    });

    addAuditLog(
      'Modification Transaction',
      'TRANSACTION',
      id,
      `Mise à jour de "${updated.description}" (${updated.amount.toLocaleString()} Ar)`,
      undefined,
      undefined,
      'UPDATE',
      changes
    );
  };

  // Delete Transaction
  const deleteTransaction = (id: string) => {
    const existing = transactions.find((t) => t.id === id);
    if (!existing) return;

    // Revert its balance effect and remove it
    setAccounts((prev) => applyTransactionEffect(prev, existing, -1));
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    addAuditLog(
      'Suppression Transaction',
      'TRANSACTION',
      id,
      `Suppression définitive de "${existing.description}" (${existing.amount.toLocaleString()} Ar)`,
      undefined,
      undefined,
      'DELETE'
    );
  };

  // Dedicated Inter-Account Transfer
  const addTransfer = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string
  ) => {
    const fromAcc = accounts.find((a) => a.id === fromAccountId);
    const toAcc = accounts.find((a) => a.id === toAccountId);
    if (!fromAcc || !toAcc) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'TRANSFER',
      amount,
      accountId: fromAccountId,
      targetAccountId: toAccountId,
      category: 'TRANSFER',
      description: description || `Virement de ${fromAcc.name} vers ${toAcc.name}`,
      status: 'REALIZED',
    });

    addAuditLog(
      'Virement de trésorerie',
      'TRANSFER',
      `${fromAccountId}->${toAccountId}`,
      `Transfert de ${amount.toLocaleString()} Ar de ${fromAcc.name} à ${toAcc.name}`
    );
  };

  // Add Project
  const addProject = (projectData: Omit<Project, 'id' | 'code'>) => {
    const id = `prj-${Date.now()}`;
    const code = `PRJ-2026-${String(projects.length + 1).padStart(3, '0')}`;
    const newProject: Project = {
      ...projectData,
      id,
      code,
    };
    setProjects((prev) => [newProject, ...prev]);
    addAuditLog('Création de Projet', 'PROJECT', code, `Nouveau projet: ${newProject.name}`);
  };

  // Update Project
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id === id) {
          const updated = { ...prj, ...updates };
          addAuditLog('Modification de Projet', 'PROJECT', prj.code, `Mise à jour du projet ${prj.name}`, undefined, undefined, 'UPDATE');
          return updated;
        }
        return prj;
      })
    );
  };

  // Delete Project
  const deleteProject = (id: string) => {
    const existing = projects.find((p) => p.id === id);
    if (!existing) return;

    setProjects((prev) => prev.filter((p) => p.id !== id));
    addAuditLog(
      'Suppression de Projet',
      'PROJECT',
      existing.code,
      `Suppression définitive du projet ${existing.name} (${existing.clientName})`,
      undefined,
      undefined,
      'DELETE'
    );
  };

  // Add Cost Item to a Project
  const addCostItem = (projectId: string, costData: Omit<ProjectCostItem, 'id'>, isRealCost: boolean = true) => {
    const costId = `cost-${Date.now()}`;
    const newCost: ProjectCostItem = { ...costData, id: costId };

    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id === projectId) {
          const plannedCosts = isRealCost ? prj.plannedCosts : [...prj.plannedCosts, newCost];
          const realCosts = isRealCost ? [...prj.realCosts, newCost] : prj.realCosts;
          return {
            ...prj,
            plannedCosts,
            realCosts,
          };
        }
        return prj;
      })
    );

    addAuditLog(
      'Ajout Coût Projet',
      'PROJECT_COST',
      projectId,
      `Coût "${costData.label}" ajouté (${costData.realAmount || costData.plannedAmount} Ar)`
    );
  };

  // Toggle Cost Paid Status
  const toggleCostPaid = (projectId: string, costId: string, accountId?: string) => {
    setProjects((prev) =>
      prev.map((prj) => {
        if (prj.id === projectId) {
          const targetCost = prj.realCosts.find((c) => c.id === costId);
          if (!targetCost) return prj;

          const updatedPaid = !targetCost.isPaid;
          const updatedCosts = prj.realCosts.map((c) =>
            c.id === costId
              ? {
                  ...c,
                  isPaid: updatedPaid,
                  paidDate: updatedPaid ? new Date().toISOString().split('T')[0] : undefined,
                }
              : c
          );

          // If paid, create an expense transaction
          if (updatedPaid && accountId) {
            addTransaction({
              date: new Date().toISOString().split('T')[0],
              type: 'EXPENSE',
              amount: targetCost.realAmount || targetCost.plannedAmount,
              accountId,
              category: 'PROJECT_VARIABLE',
              description: `Paiement coût ${targetCost.label} (${prj.name})`,
              projectId: prj.id,
              projectName: prj.name,
              status: 'REALIZED',
            });
          }

          return { ...prj, realCosts: updatedCosts };
        }
        return prj;
      })
    );
  };

  // Add Invoice
  const addInvoice = (invoiceData: Partial<Invoice> & Omit<Invoice, 'id'>) => {
    const id = `inv-${Date.now()}`;
    const invoiceNumber = invoiceData.invoiceNumber?.trim() || `FAC-2026-${String(invoices.length + 1).padStart(3, '0')}`;
    const newInvoice: Invoice = {
      clientId: invoiceData.clientId,
      clientName: invoiceData.clientName,
      clientCompany: invoiceData.clientCompany,
      clientPhone: invoiceData.clientPhone,
      clientAddress: invoiceData.clientAddress,
      projectId: invoiceData.projectId,
      projectName: invoiceData.projectName,
      issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || new Date().toISOString().split('T')[0],
      items: invoiceData.items || [],
      subtotal: invoiceData.subtotal ?? 0,
      taxRate: invoiceData.taxRate ?? 0,
      taxAmount: invoiceData.taxAmount ?? 0,
      totalAmount: invoiceData.totalAmount ?? 0,
      paidAmount: invoiceData.paidAmount ?? 0,
      balanceDue: invoiceData.balanceDue ?? (invoiceData.totalAmount ?? 0) - (invoiceData.paidAmount ?? 0),
      status: invoiceData.status || 'SENT',
      paymentTerms: invoiceData.paymentTerms || '30 jours date de facture',
      invoiceType: invoiceData.invoiceType || 'Facture Avance',
      amountInWords: invoiceData.amountInWords,
      conditionsText: invoiceData.conditionsText,
      renewalTerms: invoiceData.renewalTerms,
      notes: invoiceData.notes,
      id,
      invoiceNumber,
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // Update client billed
    setClients((prev) =>
      prev.map((c) =>
        c.id === invoiceData.clientId
          ? {
              ...c,
              totalBilled: c.totalBilled + (newInvoice.totalAmount || 0),
              totalPaid: c.totalPaid + (newInvoice.paidAmount || 0),
              outstandingBalance: c.outstandingBalance + (newInvoice.balanceDue || 0),
            }
          : c
      )
    );

    addAuditLog('Création Facture', 'INVOICE', invoiceNumber, `Facture ${invoiceNumber} émise à ${newInvoice.clientName} (${newInvoice.totalAmount} Ar)`);
  };

  // Update Invoice
  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const existing = invoices.find((inv) => inv.id === id);
    if (!existing) return;

    const oldTotal = existing.totalAmount;
    const oldBalance = existing.balanceDue;
    const oldPaid = existing.paidAmount;
    const oldClientId = existing.clientId;

    const updatedInvoice: Invoice = {
      ...existing,
      ...updates,
      id,
    };

    // Recalculate balance if total or paid changed
    if (updates.totalAmount !== undefined || updates.paidAmount !== undefined) {
      const tot = updates.totalAmount !== undefined ? updates.totalAmount : existing.totalAmount;
      const pd = updates.paidAmount !== undefined ? updates.paidAmount : existing.paidAmount;
      updatedInvoice.balanceDue = Math.max(0, tot - pd);
      if (updatedInvoice.balanceDue === 0 && tot > 0) {
        updatedInvoice.status = 'PAID';
      }
    }

    setInvoices((prev) => prev.map((inv) => (inv.id === id ? updatedInvoice : inv)));

    // Adjust client balances
    const targetClientId = updatedInvoice.clientId;
    if (targetClientId === oldClientId) {
      const diffBilled = updatedInvoice.totalAmount - oldTotal;
      const diffBalance = updatedInvoice.balanceDue - oldBalance;
      const diffPaid = updatedInvoice.paidAmount - oldPaid;

      setClients((prev) =>
        prev.map((c) =>
          c.id === targetClientId
            ? {
                ...c,
                totalBilled: Math.max(0, c.totalBilled + diffBilled),
                totalPaid: Math.max(0, c.totalPaid + diffPaid),
                outstandingBalance: Math.max(0, c.outstandingBalance + diffBalance),
              }
            : c
        )
      );
    } else {
      // Reassigning client
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === oldClientId) {
            return {
              ...c,
              totalBilled: Math.max(0, c.totalBilled - oldTotal),
              totalPaid: Math.max(0, c.totalPaid - oldPaid),
              outstandingBalance: Math.max(0, c.outstandingBalance - oldBalance),
            };
          }
          if (c.id === targetClientId) {
            return {
              ...c,
              totalBilled: c.totalBilled + updatedInvoice.totalAmount,
              totalPaid: c.totalPaid + updatedInvoice.paidAmount,
              outstandingBalance: c.outstandingBalance + updatedInvoice.balanceDue,
            };
          }
          return c;
        })
      );
    }

    addAuditLog('Modification Facture', 'INVOICE', updatedInvoice.invoiceNumber, `Mise à jour des données de la facture ${updatedInvoice.invoiceNumber}`);
  };

  // Delete Invoice
  const deleteInvoice = (id: string) => {
    const existing = invoices.find((inv) => inv.id === id);
    if (!existing) return;

    setInvoices((prev) => prev.filter((inv) => inv.id !== id));

    // Update client
    setClients((prev) =>
      prev.map((c) =>
        c.id === existing.clientId
          ? {
              ...c,
              totalBilled: Math.max(0, c.totalBilled - existing.totalAmount),
              totalPaid: Math.max(0, c.totalPaid - existing.paidAmount),
              outstandingBalance: Math.max(0, c.outstandingBalance - existing.balanceDue),
            }
          : c
      )
    );

    addAuditLog('Suppression Facture', 'INVOICE', existing.invoiceNumber, `Suppression définitive de la facture ${existing.invoiceNumber} (${existing.clientName})`);
  };

  // Record Payment on Invoice
  const recordInvoicePayment = (invoiceId: string, amount: number, accountId: string) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return;

    const newPaidAmount = invoice.paidAmount + amount;
    const newBalanceDue = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus = newBalanceDue === 0 ? 'PAID' : 'PARTIAL';

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              paidAmount: newPaidAmount,
              balanceDue: newBalanceDue,
              status: newStatus,
            }
          : inv
      )
    );

    // Update Client
    setClients((prev) =>
      prev.map((c) =>
        c.id === invoice.clientId
          ? {
              ...c,
              totalPaid: c.totalPaid + amount,
              outstandingBalance: Math.max(0, c.outstandingBalance - amount),
            }
          : c
      )
    );

    // Update Project collected if attached
    if (invoice.projectId) {
      setProjects((prev) =>
        prev.map((prj) =>
          prj.id === invoice.projectId
            ? { ...prj, totalCollected: prj.totalCollected + amount }
            : prj
        )
      );
    }

    // Add Income Transaction
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'INCOME',
      amount,
      accountId,
      category: 'PROJECT_INVOICE',
      description: `Règlement facture ${invoice.invoiceNumber} (${invoice.clientName})`,
      projectId: invoice.projectId,
      projectName: invoice.projectName,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      invoiceId: invoice.id,
      status: 'REALIZED',
    });

    addAuditLog(
      'Encaissement Facture',
      'INVOICE',
      invoice.invoiceNumber,
      `Paiement de ${amount.toLocaleString()} Ar reçu de ${invoice.clientName}`
    );
  };

  // Add Commission
  const addCommission = (commData: Omit<Commission, 'id' | 'calculatedAmount'>) => {
    const id = `com-${Date.now()}`;
    const project = projects.find((p) => p.id === commData.projectId);
    let calculatedAmount = commData.ruleValue;
    if (commData.ruleType === 'PERCENTAGE' && project) {
      calculatedAmount = (project.sellingPrice * commData.ruleValue) / 100;
    }

    const newCommission: Commission = {
      ...commData,
      id,
      calculatedAmount,
    };
    setCommissions((prev) => [newCommission, ...prev]);
    addAuditLog('Attribution Commission', 'COMMISSION', id, `Commission de ${calculatedAmount} Ar pour ${commData.beneficiaryName}`);
  };

  // Update Commission Status
  const updateCommissionStatus = (id: string, status: 'VALIDATED' | 'PAID', accountId?: string) => {
    setCommissions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const isNowPaid = status === 'PAID';
          if (isNowPaid && accountId) {
            addTransaction({
              date: new Date().toISOString().split('T')[0],
              type: 'EXPENSE',
              amount: c.calculatedAmount,
              accountId,
              category: 'COMMISSION',
              description: `Paiement commission ${c.beneficiaryName} (${c.projectName})`,
              projectId: c.projectId,
              projectName: c.projectName,
              status: 'REALIZED',
            });
          }
          return {
            ...c,
            status,
            paidDate: isNowPaid ? new Date().toISOString().split('T')[0] : c.paidDate,
            validatedDate: status === 'VALIDATED' ? new Date().toISOString().split('T')[0] : c.validatedDate,
          };
        }
        return c;
      })
    );
  };

  // Resolve Alert
  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  // Add Fixed Expense
  const addFixedExpense = (expData: Omit<FixedExpense, 'id'>) => {
    const id = `fe-${Date.now()}`;
    const newExp: FixedExpense = { ...expData, id };
    setFixedExpenses((prev) => [...prev, newExp]);
    addAuditLog('Nouvelle Charge Fixe', 'FIXED_EXPENSE', id, `${expData.label} (${expData.amount.toLocaleString()} Ar)`);
  };

  // Pay Fixed Expense
  const payFixedExpense = (expenseId: string, accountId: string) => {
    const exp = fixedExpenses.find((e) => e.id === expenseId);
    if (!exp) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      amount: exp.amount,
      accountId,
      category: 'RECURRING_FIXED',
      description: `Règlement charge récurrente : ${exp.label}`,
      status: 'REALIZED',
    });

    addAuditLog('Paiement Charge Fixe', 'FIXED_EXPENSE', expenseId, `Règlement de ${exp.amount.toLocaleString()} Ar pour ${exp.label}`);
  };

  // Pay Supplier Invoice
  const paySupplierInvoice = (supplierId: string, amount: number, accountId: string, description: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return;

    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplierId
          ? {
              ...s,
              totalPaid: s.totalPaid + amount,
              balanceDue: Math.max(0, s.balanceDue - amount),
            }
          : s
      )
    );

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'EXPENSE',
      amount,
      accountId,
      category: 'PROJECT_VARIABLE',
      description: description || `Paiement fournisseur ${supplier.name}`,
      status: 'REALIZED',
    });

    addAuditLog('Paiement Fournisseur', 'SUPPLIER', supplierId, `Paiement de ${amount.toLocaleString()} Ar à ${supplier.name}`);
  };

  // Add Client
  const addClient = (
    clientData: Omit<Client, 'id' | 'totalBilled' | 'totalPaid' | 'outstandingBalance' | 'overdueDays' | 'status'>
  ) => {
    const id = `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      totalBilled: 0,
      totalPaid: 0,
      outstandingBalance: 0,
      overdueDays: 0,
      status: 'GOOD',
    };
    setClients((prev) => [newClient, ...prev]);
    addAuditLog('Création de Client', 'CLIENT', id, `Nouveau client : ${newClient.company || newClient.name}`, undefined, undefined, 'CREATE');
  };

  // Update Client
  const updateClient = (id: string, updates: Partial<Client>) => {
    const existing = clients.find((c) => c.id === id);
    if (!existing) return;

    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('Modification de Client', 'CLIENT', id, `Mise à jour de la fiche client ${existing.company || existing.name}`, undefined, undefined, 'UPDATE');
  };

  // Delete Client
  const deleteClient = (id: string) => {
    const existing = clients.find((c) => c.id === id);
    if (!existing) return;

    setClients((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Suppression de Client', 'CLIENT', id, `Suppression définitive du client ${existing.company || existing.name}`, undefined, undefined, 'DELETE');
  };

  // Add Supplier
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalBilled' | 'totalPaid' | 'balanceDue'>) => {
    const id = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id,
      totalBilled: 0,
      totalPaid: 0,
      balanceDue: 0,
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    addAuditLog('Création de Fournisseur', 'SUPPLIER', id, `Nouveau fournisseur : ${newSupplier.name}`, undefined, undefined, 'CREATE');
  };

  // Update Supplier
  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    const existing = suppliers.find((s) => s.id === id);
    if (!existing) return;

    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addAuditLog('Modification de Fournisseur', 'SUPPLIER', id, `Mise à jour de la fiche fournisseur ${existing.name}`, undefined, undefined, 'UPDATE');
  };

  // Delete Supplier
  const deleteSupplier = (id: string) => {
    const existing = suppliers.find((s) => s.id === id);
    if (!existing) return;

    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    addAuditLog('Suppression de Fournisseur', 'SUPPLIER', id, `Suppression définitive du fournisseur ${existing.name}`, undefined, undefined, 'DELETE');
  };

  // Close Monthly Budget Period
  const closeMonthlyBudget = (month: string, targetRevenue: number, targetExpense: number) => {
    const currentTotalCash = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Compute month realized from transactions
    const monthTx = transactions.filter((tx) => tx.date.startsWith(month) && tx.status === 'REALIZED');
    const realizedRevenue = monthTx
      .filter((tx) => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const realizedExpense = monthTx
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);

    setBudgetPeriods((prev) => {
      const existing = prev.find((b) => b.month === month);
      if (existing) {
        return prev.map((b) =>
          b.month === month
            ? {
                ...b,
                targetRevenue,
                targetExpense,
                realizedRevenue,
                realizedExpense,
                finalBalance: currentTotalCash,
                isClosed: true,
                closedAt: new Date().toISOString(),
                closedBy: 'Direction Eray',
              }
            : b
        );
      }
      return [
        ...prev,
        {
          id: `bud-${month}`,
          month,
          targetRevenue,
          targetExpense,
          realizedRevenue,
          realizedExpense,
          initialBalance: currentTotalCash,
          finalBalance: currentTotalCash,
          isClosed: true,
          closedAt: new Date().toISOString(),
          closedBy: 'Direction Eray',
        },
      ];
    });

    addAuditLog('Clôture Mensuelle', 'BUDGET', month, `Le mois ${month} a été clôturé avec succès.`);
  };

  // Reset to Demo data
  const resetToDemoData = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setProjects(INITIAL_PROJECTS);
    setClients(INITIAL_CLIENTS);
    setInvoices(INITIAL_INVOICES);
    setTransactions(INITIAL_TRANSACTIONS);
    setCommissions(INITIAL_COMMISSIONS);
    setAlerts(INITIAL_ALERTS);
    setBudgetPeriods(INITIAL_BUDGET_PERIODS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPcgAccounts(INITIAL_PCG_ACCOUNTS);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    localStorage.clear();
  };

  // Add a general accounting journal entry
  const addJournalEntry = (
    entry: Omit<JournalEntry, 'id' | 'entryNumber' | 'totalDebit' | 'totalCredit' | 'isBalanced'>
  ) => {
    const totalDebit = entry.lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
    const totalCredit = entry.lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

    const newEntryNumber = `ECR-2026-${String(journalEntries.length + 1).padStart(3, '0')}`;
    const newEntry: JournalEntry = {
      ...entry,
      id: `ecr-${Date.now()}`,
      entryNumber: newEntryNumber,
      totalDebit,
      totalCredit,
      isBalanced,
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    addAuditLog(
      'Saisie Écriture Journal',
      'ACCOUNTING',
      newEntry.id,
      `Écriture ${newEntryNumber} enregistrée : ${entry.label} (${totalDebit.toLocaleString()} Ar)`
    );
  };

  // Computed: Grand Livre (Ledger T-Accounts)
  const ledgerAccounts = useMemo<LedgerTAccount[]>(() => {
    return pcgAccounts.map((acc) => {
      const debits: { date: string; label: string; pieceRef: string; amount: number }[] = [];
      const credits: { date: string; label: string; pieceRef: string; amount: number }[] = [];

      journalEntries.forEach((entry) => {
        entry.lines.forEach((line) => {
          if (line.accountCode === acc.code) {
            if (line.debit > 0) {
              debits.push({
                date: entry.date,
                label: entry.label,
                pieceRef: entry.pieceRef,
                amount: line.debit,
              });
            }
            if (line.credit > 0) {
              credits.push({
                date: entry.date,
                label: entry.label,
                pieceRef: entry.pieceRef,
                amount: line.credit,
              });
            }
          }
        });
      });

      const totalDebit = debits.reduce((s, d) => s + d.amount, 0);
      const totalCredit = credits.reduce((s, c) => s + c.amount, 0);

      let balanceType: 'SD' | 'SC' | 'NUL' = 'NUL';
      let balanceAmount = 0;

      if (totalDebit > totalCredit) {
        balanceType = 'SD';
        balanceAmount = totalDebit - totalCredit;
      } else if (totalCredit > totalDebit) {
        balanceType = 'SC';
        balanceAmount = totalCredit - totalDebit;
      }

      return {
        accountCode: acc.code,
        accountName: acc.name,
        classNum: acc.classNum,
        debits,
        credits,
        totalDebit,
        totalCredit,
        balanceType,
        balanceAmount,
      };
    });
  }, [pcgAccounts, journalEntries]);

  // Computed: Balance Générale des Comptes (Balance à 4 colonnes)
  const accountingBalance = useMemo(() => {
    let totDebit = 0;
    let totCredit = 0;
    let totSoldeDebiteur = 0;
    let totSoldeCrediteur = 0;

    const rows: AccountingBalanceRow[] = ledgerAccounts
      .filter((la) => la.totalDebit > 0 || la.totalCredit > 0)
      .map((la) => {
        const soldeDebiteur = la.balanceType === 'SD' ? la.balanceAmount : 0;
        const soldeCrediteur = la.balanceType === 'SC' ? la.balanceAmount : 0;

        totDebit += la.totalDebit;
        totCredit += la.totalCredit;
        totSoldeDebiteur += soldeDebiteur;
        totSoldeCrediteur += soldeCrediteur;

        return {
          accountCode: la.accountCode,
          accountName: la.accountName,
          classNum: la.classNum,
          totalDebit: la.totalDebit,
          totalCredit: la.totalCredit,
          soldeDebiteur,
          soldeCrediteur,
        };
      });

    return {
      rows,
      totalDebit: totDebit,
      totalCredit: totCredit,
      totalSoldeDebiteur: totSoldeDebiteur,
      totalSoldeCrediteur: totSoldeCrediteur,
      isBalanced: Math.abs(totDebit - totCredit) < 0.01 && Math.abs(totSoldeDebiteur - totSoldeCrediteur) < 0.01,
    };
  }, [ledgerAccounts]);

  // Computed: Compte de Résultat (Charges 6xx vs Produits 7xx)
  const incomeStatement = useMemo(() => {
    const charges: { code: string; name: string; amount: number }[] = [];
    const products: { code: string; name: string; amount: number }[] = [];

    ledgerAccounts.forEach((la) => {
      if (la.classNum === 6 && (la.totalDebit > 0 || la.totalCredit > 0)) {
        charges.push({
          code: la.accountCode,
          name: la.accountName,
          amount: la.totalDebit - la.totalCredit,
        });
      } else if (la.classNum === 7 && (la.totalDebit > 0 || la.totalCredit > 0)) {
        products.push({
          code: la.accountCode,
          name: la.accountName,
          amount: la.totalCredit - la.totalDebit,
        });
      }
    });

    const totalCharges = charges.reduce((s, c) => s + c.amount, 0);
    const totalProducts = products.reduce((s, p) => s + p.amount, 0);
    const netProfit = totalProducts - totalCharges;

    return {
      charges,
      totalCharges,
      products,
      totalProducts,
      netProfit,
      isProfit: netProfit >= 0,
    };
  }, [ledgerAccounts]);

  // Computed: Bilan Comptable (Actif vs Passif avec équilibre fondamental)
  const balanceSheet = useMemo(() => {
    const actifImmobilise: { code: string; name: string; amount: number }[] = [];
    const actifCirculant: { code: string; name: string; amount: number }[] = [];
    const tresorerieActif: { code: string; name: string; amount: number }[] = [];

    const capitauxPropres: { code: string; name: string; amount: number }[] = [];
    const dettes: { code: string; name: string; amount: number }[] = [];

    ledgerAccounts.forEach((la) => {
      // Classe 2 : Immobilisations (Actif)
      if (la.classNum === 2 && la.totalDebit > la.totalCredit) {
        actifImmobilise.push({
          code: la.accountCode,
          name: la.accountName,
          amount: la.totalDebit - la.totalCredit,
        });
      }
      // Classe 3 & 4 (Clients 411) : Actif circulant
      else if ((la.classNum === 3 || la.accountCode === '411') && la.totalDebit > la.totalCredit) {
        actifCirculant.push({
          code: la.accountCode,
          name: la.accountName,
          amount: la.totalDebit - la.totalCredit,
        });
      }
      // Classe 5 : Trésorerie Actif
      else if (la.classNum === 5 && la.totalDebit > la.totalCredit) {
        tresorerieActif.push({
          code: la.accountCode,
          name: la.accountName,
          amount: la.totalDebit - la.totalCredit,
        });
      }
      // Classe 1 : Capitaux propres
      else if (la.classNum === 1 && (la.accountCode === '101' || la.accountCode === '106' || la.accountCode === '455')) {
        const val = la.totalCredit - la.totalDebit;
        if (val > 0) {
          capitauxPropres.push({
            code: la.accountCode,
            name: la.accountName,
            amount: val,
          });
        }
      }
      // Classe 1 (Emprunts 164) & Classe 4 (Fournisseurs 401, Personnel 421, État 445) : Dettes
      else if ((la.accountCode === '164' || la.accountCode === '401' || la.accountCode === '421' || la.accountCode === '431' || la.accountCode === '445') && la.totalCredit > la.totalDebit) {
        dettes.push({
          code: la.accountCode,
          name: la.accountName,
          amount: la.totalCredit - la.totalDebit,
        });
      }
    });

    // Ajouter le Résultat de l'exercice au Passif (dans les capitaux propres)
    const resultAmount = incomeStatement.netProfit;
    if (resultAmount !== 0) {
      capitauxPropres.push({
        code: resultAmount >= 0 ? '120' : '129',
        name: resultAmount >= 0 ? "Résultat net de l'exercice (Bénéfice)" : "Résultat net de l'exercice (Perte)",
        amount: resultAmount,
      });
    }

    const totalActifImmobilise = actifImmobilise.reduce((s, i) => s + i.amount, 0);
    const totalActifCirculant = actifCirculant.reduce((s, i) => s + i.amount, 0);
    const totalTresorerieActif = tresorerieActif.reduce((s, i) => s + i.amount, 0);
    const totalActif = totalActifImmobilise + totalActifCirculant + totalTresorerieActif;

    const totalCapitauxPropres = capitauxPropres.reduce((s, i) => s + i.amount, 0);
    const totalDettes = dettes.reduce((s, i) => s + i.amount, 0);
    const totalPassif = totalCapitauxPropres + totalDettes;

    return {
      actifImmobilise,
      totalActifImmobilise,
      actifCirculant,
      totalActifCirculant,
      tresorerieActif,
      totalTresorerieActif,
      totalActif,

      capitauxPropres,
      totalCapitauxPropres,
      dettes,
      totalDettes,
      totalPassif,
      isBalanced: Math.abs(totalActif - totalPassif) < 1,
    };
  }, [ledgerAccounts, incomeStatement]);

  // Computed Values
  const totalCashBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + (curr.isArchived ? 0 : curr.balance), 0);
  }, [accounts]);

  const { monthIncome, monthExpense } = useMemo(() => {
    const currentMonthTxs = transactions.filter(
      (tx) => tx.date.startsWith(selectedMonth) && tx.status === 'REALIZED'
    );
    const inc = currentMonthTxs
      .filter((tx) => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const exp = currentMonthTxs
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { monthIncome: inc, monthExpense: exp };
  }, [transactions, selectedMonth]);

  const realizedTurnover = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === 'PAID' || inv.paidAmount > 0)
      .reduce((sum, inv) => sum + inv.paidAmount, 0);
  }, [invoices]);

  const forecastTurnover = useMemo(() => {
    // Total of all active projects selling price
    return projects
      .filter((p) => p.status !== 'CANCELLED')
      .reduce((sum, p) => sum + p.sellingPrice, 0);
  }, [projects]);

  const estimatedNetProfit = useMemo(() => {
    const activeProjects = projects.filter((p) => p.status !== 'CANCELLED');
    let totalSelling = 0;
    let totalRealCosts = 0;
    activeProjects.forEach((p) => {
      totalSelling += p.sellingPrice;
      const costSum = p.realCosts.reduce((csum, c) => csum + (c.realAmount || c.plannedAmount), 0);
      totalRealCosts += costSum;
    });
    return totalSelling - totalRealCosts;
  }, [projects]);

  const { outstandingReceivables, overdueReceivables } = useMemo(() => {
    let out = 0;
    let over = 0;
    invoices.forEach((inv) => {
      if (inv.status !== 'PAID') {
        out += inv.balanceDue;
        if (inv.status === 'OVERDUE') {
          over += inv.balanceDue;
        }
      }
    });
    return { outstandingReceivables: out, overdueReceivables: over };
  }, [invoices]);

  const pendingDebtsAndCosts = useMemo(() => {
    let totalPending = 0;
    // Unpaid costs from active projects
    projects.forEach((p) => {
      p.realCosts.forEach((c) => {
        if (!c.isPaid) totalPending += c.realAmount || c.plannedAmount;
      });
    });
    // Unpaid validated commissions
    commissions.forEach((c) => {
      if (c.status === 'VALIDATED') totalPending += c.calculatedAmount;
    });
    return totalPending;
  }, [projects, commissions]);

  const averageMarginRate = useMemo(() => {
    const validProjects = projects.filter((p) => p.sellingPrice > 0);
    if (validProjects.length === 0) return 0;

    let totalRate = 0;
    validProjects.forEach((p) => {
      const totalCost = p.realCosts.reduce((sum, c) => sum + (c.realAmount || c.plannedAmount), 0);
      const { marginRate } = calculateMargin(p.sellingPrice, totalCost);
      totalRate += marginRate;
    });
    return Number((totalRate / validProjects.length).toFixed(1));
  }, [projects]);

  const activeProjectsCount = useMemo(() => {
    return projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'LEAD').length;
  }, [projects]);

  // Cashflow Daily Forecasts for next 90 days
  const { dailyForecasts, projections } = useMemo(() => {
    const days: DailyForecast[] = [];
    let runningBalance = totalCashBalance;

    // Multipliers according to active scenario
    let incomeMultiplier = 1.0;
    let expenseMultiplier = 1.0;
    let collectionDelayDays = 0;

    if (forecastScenario === 'PESSIMISTIC') {
      incomeMultiplier = 0.8; // -20% on future collections
      expenseMultiplier = 1.15; // +15% unexpected costs
      collectionDelayDays = 15;
    } else if (forecastScenario === 'OPTIMISTIC') {
      incomeMultiplier = 1.15; // +15% quick cash
      expenseMultiplier = 0.95;
      collectionDelayDays = -5;
    }

    const today = new Date('2026-08-26');

    const fixedExpensesSchedule = fixedExpenses
      .filter((f) => f.status === 'ACTIVE' && f.frequency === 'MONTHLY')
      .map((f) => ({
        day: f.dueDay,
        amount: f.amount * expenseMultiplier,
        desc: f.label,
      }));

    let balAt7 = runningBalance;
    let balAt30 = runningBalance;
    let balAt60 = runningBalance;
    let balAt90 = runningBalance;

    for (let i = 0; i <= 90; i++) {
      const curDate = new Date(today);
      curDate.setDate(today.getDate() + i);
      const dateStr = curDate.toISOString().split('T')[0];
      const dayOfMonth = curDate.getDate();

      let dayIncome = 0;
      let dayExpense = 0;

      // Pending invoices due on or around this date
      invoices.forEach((inv) => {
        if (inv.status !== 'PAID' && inv.dueDate) {
          const invDueDate = new Date(inv.dueDate);
          invDueDate.setDate(invDueDate.getDate() + collectionDelayDays);
          if (invDueDate.toISOString().split('T')[0] === dateStr) {
            dayIncome += inv.balanceDue * incomeMultiplier;
          }
        }
      });

      // Fixed recurring expenses
      fixedExpensesSchedule.forEach((fix) => {
        if (fix.day === dayOfMonth) {
          dayExpense += fix.amount;
        }
      });

      const openBal = runningBalance;
      runningBalance = runningBalance + dayIncome - dayExpense;

      if (i === 7) balAt7 = runningBalance;
      if (i === 30) balAt30 = runningBalance;
      if (i === 60) balAt60 = runningBalance;
      if (i === 90) balAt90 = runningBalance;

      days.push({
        date: dateStr,
        openingBalance: openBal,
        plannedIncome: dayIncome,
        plannedExpense: dayExpense,
        closingBalance: runningBalance,
        isLowBalanceRisk: runningBalance < 5000000, // Alert if under 5M Ar
      });
    }

    return {
      dailyForecasts: days,
      projections: {
        d7: balAt7,
        d30: balAt30,
        d60: balAt60,
        d90: balAt90,
      },
    };
  }, [totalCashBalance, invoices, forecastScenario, fixedExpenses]);

  return (
    <FinanceContext.Provider
      value={{
        accounts,
        projects,
        clients,
        invoices,
        transactions,
        commissions,
        alerts,
        budgetPeriods,
        auditLogs,
        suppliers,
        fixedExpenses,
        pcgAccounts,
        journalEntries,
        currentUserRole,
        setCurrentUserRole,
        currentUserName,
        setCurrentUserName,
        forecastScenario,
        selectedMonth,
        setSelectedMonth,
        setForecastScenario,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addTransfer,
        addProject,
        updateProject,
        deleteProject,
        addClient,
        updateClient,
        deleteClient,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCostItem,
        toggleCostPaid,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordInvoicePayment,
        addCommission,
        updateCommissionStatus,
        addFixedExpense,
        payFixedExpense,
        paySupplierInvoice,
        resolveAlert,
        closeMonthlyBudget,
        resetToDemoData,
        addJournalEntry,
        totalCashBalance,
        monthIncome,
        monthExpense,
        realizedTurnover,
        forecastTurnover,
        estimatedNetProfit,
        outstandingReceivables,
        overdueReceivables,
        pendingDebtsAndCosts,
        averageMarginRate,
        activeProjectsCount,
        dailyForecasts,
        projections,
        ledgerAccounts,
        accountingBalance,
        incomeStatement,
        balanceSheet,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
