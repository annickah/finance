import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  FolderKanban,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Wallet,
  ArrowRight,
  Calendar,
  Building2,
  Tag,
  Plus,
  ArrowRightLeft,
  Command,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatAriary, formatDate } from '../../utils/formatters';
import { NavigationTab } from '../../App';

export type SearchCategoryFilter =
  | 'ALL'
  | 'PROJECTS'
  | 'INVOICES'
  | 'REVENUES'
  | 'EXPENSES'
  | 'CLIENTS'
  | 'ACCOUNTS';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavigationTab, metadata?: { projectId?: string; searchQuery?: string; invoiceId?: string }) => void;
  onOpenNewTx?: () => void;
  onOpenNewProject?: () => void;
  onOpenNewInvoice?: () => void;
  onOpenNewTransfer?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewTx,
  onOpenNewProject,
  onOpenNewInvoice,
  onOpenNewTransfer,
}) => {
  const { projects, invoices, transactions, clients, accounts, fixedExpenses } = useFinance();
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SearchCategoryFilter>('ALL');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setCategoryFilter('ALL');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const q = query.trim().toLowerCase();

  // Search Results aggregation
  const searchResults = useMemo(() => {
    if (!q) {
      return {
        projects: projects.slice(0, 3),
        invoices: invoices.slice(0, 3),
        revenues: transactions.filter((t) => t.type === 'INCOME').slice(0, 3),
        expenses: transactions.filter((t) => t.type === 'EXPENSE').slice(0, 3),
        clients: clients.slice(0, 3),
        accounts: accounts.slice(0, 3),
        totalCount: 0,
      };
    }

    const filteredProjects = (categoryFilter === 'ALL' || categoryFilter === 'PROJECTS')
      ? projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.clientName.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q))
        )
      : [];

    const filteredInvoices = (categoryFilter === 'ALL' || categoryFilter === 'INVOICES')
      ? invoices.filter(
          (i) =>
            i.invoiceNumber.toLowerCase().includes(q) ||
            i.clientName.toLowerCase().includes(q) ||
            i.clientCompany.toLowerCase().includes(q) ||
            (i.projectName && i.projectName.toLowerCase().includes(q)) ||
            (i.notes && i.notes.toLowerCase().includes(q))
        )
      : [];

    const filteredRevenues = (categoryFilter === 'ALL' || categoryFilter === 'REVENUES')
      ? transactions
          .filter((t) => t.type === 'INCOME')
          .filter(
            (t) =>
              t.description.toLowerCase().includes(q) ||
              (t.clientName && t.clientName.toLowerCase().includes(q)) ||
              (t.projectName && t.projectName.toLowerCase().includes(q)) ||
              t.category.toLowerCase().includes(q) ||
              (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q))
          )
      : [];

    const filteredExpenses = (categoryFilter === 'ALL' || categoryFilter === 'EXPENSES')
      ? [
          ...transactions
            .filter((t) => t.type === 'EXPENSE')
            .filter(
              (t) =>
                t.description.toLowerCase().includes(q) ||
                (t.projectName && t.projectName.toLowerCase().includes(q)) ||
                t.category.toLowerCase().includes(q)
            ),
          ...fixedExpenses
            .filter(
              (fe) =>
                fe.label.toLowerCase().includes(q) ||
                fe.assignedTo.toLowerCase().includes(q) ||
                fe.category.toLowerCase().includes(q)
            )
            .map((fe) => ({
              id: fe.id,
              date: `2026-08-${String(fe.dueDay).padStart(2, '0')}`,
              type: 'EXPENSE' as const,
              amount: fe.amount,
              accountId: fe.paymentAccountId || 'acc-bni',
              category: fe.category as any,
              description: `${fe.label} (${fe.assignedTo})`,
              status: fe.status === 'ACTIVE' ? ('PENDING' as const) : ('REALIZED' as const),
              createdAt: '',
              createdBy: 'Charge Fixe',
            })),
        ]
      : [];

    const filteredClients = (categoryFilter === 'ALL' || categoryFilter === 'CLIENTS')
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q)
        )
      : [];

    const filteredAccounts = (categoryFilter === 'ALL' || categoryFilter === 'ACCOUNTS')
      ? accounts.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.provider.toLowerCase().includes(q) ||
            (a.accountNumber && a.accountNumber.toLowerCase().includes(q))
        )
      : [];

    const total =
      filteredProjects.length +
      filteredInvoices.length +
      filteredRevenues.length +
      filteredExpenses.length +
      filteredClients.length +
      filteredAccounts.length;

    return {
      projects: filteredProjects,
      invoices: filteredInvoices,
      revenues: filteredRevenues,
      expenses: filteredExpenses,
      clients: filteredClients,
      accounts: filteredAccounts,
      totalCount: total,
    };
  }, [q, categoryFilter, projects, invoices, transactions, clients, accounts, fixedExpenses]);

  if (!isOpen) return null;

  const categories: { id: SearchCategoryFilter; label: string; count?: number }[] = [
    { id: 'ALL', label: 'Tous' },
    { id: 'PROJECTS', label: 'Projets' },
    { id: 'INVOICES', label: 'Factures' },
    { id: 'REVENUES', label: 'Revenus' },
    { id: 'EXPENSES', label: 'Dépenses' },
    { id: 'CLIENTS', label: 'Clients' },
    { id: 'ACCOUNTS', label: 'Comptes' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-emerald-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher par mot-clé, client, projet, n° facture, montant, date..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-900 text-sm sm:text-base font-semibold placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              title="Effacer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-[11px] font-bold text-slate-500 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-100"
          >
            ESC
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Results / Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar">
          {/* Quick Actions if query is empty */}
          {!q && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Actions Rapides
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {onOpenNewTx && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewTx();
                    }}
                    className="p-3 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200/60 rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950 group-hover:text-emerald-800">
                        Transaction
                      </div>
                      <div className="text-[10px] text-emerald-700">Flux MGA</div>
                    </div>
                  </button>
                )}

                {onOpenNewInvoice && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewInvoice();
                    }}
                    className="p-3 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200/60 rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-indigo-950 group-hover:text-indigo-800">
                        Facture
                      </div>
                      <div className="text-[10px] text-indigo-700">Nouveau devis</div>
                    </div>
                  </button>
                )}

                {onOpenNewProject && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewProject();
                    }}
                    className="p-3 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/60 rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <FolderKanban className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-purple-950 group-hover:text-purple-800">
                        Projet
                      </div>
                      <div className="text-[10px] text-purple-700">Digital / Web</div>
                    </div>
                  </button>
                )}

                {onOpenNewTransfer && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewTransfer();
                    }}
                    className="p-3 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 rounded-xl text-left transition-colors flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ArrowRightLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-blue-950 group-hover:text-blue-800">
                        Virement
                      </div>
                      <div className="text-[10px] text-blue-700">Inter-banques</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* No results message */}
          {q && searchResults.totalCount === 0 && (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700">Aucun résultat trouvé pour « {query} »</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Essayez de chercher par nom de client, numéro de facture (ex: FAC-2026), nom de projet ou catégorie.
              </p>
            </div>
          )}

          {/* Projects Results */}
          {searchResults.projects.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
                  Projets ({searchResults.projects.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('PROJECTS');
                  }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  Voir tous les projets <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {searchResults.projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onClose();
                      onNavigate('PROJECT_DETAIL', { projectId: proj.id });
                    }}
                    className="p-3 bg-slate-50 hover:bg-purple-50/60 border border-slate-200/70 hover:border-purple-200 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                        {proj.code.split('-')[2] || 'P'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-purple-950">
                          {proj.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-slate-700">{proj.clientName}</span>
                          <span>•</span>
                          <span>{proj.code}</span>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 font-bold">
                            {formatAriary(proj.sellingPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-100 text-purple-800">
                        {proj.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Results */}
          {searchResults.invoices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Factures Client ({searchResults.invoices.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('INVOICES', { searchQuery: q });
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  Ouvrir dans Factures <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {searchResults.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onClose();
                      onNavigate('INVOICES', { searchQuery: inv.invoiceNumber, invoiceId: inv.id });
                    }}
                    className="p-3 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/70 hover:border-indigo-200 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                        FAC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 flex items-center gap-2">
                          <span className="font-mono">{inv.invoiceNumber}</span>
                          <span className="text-slate-400 font-normal">|</span>
                          <span>{inv.clientName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          {inv.projectName && <span>{inv.projectName}</span>}
                          <span>•</span>
                          <span>Émise le {formatDate(inv.issueDate)}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-900 font-bold">
                            {formatAriary(inv.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revenues / Encaissements Results */}
          {searchResults.revenues.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                  Revenus & Encaissements ({searchResults.revenues.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('REVENUES', { searchQuery: q });
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  Filtrer dans Revenus <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {searchResults.revenues.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      onClose();
                      onNavigate('REVENUES', { searchQuery: tx.description });
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-200 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        +
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                          {tx.description}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{formatDate(tx.date)}</span>
                          {tx.clientName && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-slate-700">{tx.clientName}</span>
                            </>
                          )}
                          {tx.projectName && (
                            <>
                              <span>•</span>
                              <span>{tx.projectName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-emerald-600">
                        +{formatAriary(tx.amount)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses & Charges Results */}
          {searchResults.expenses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                  Dépenses & Décaissements ({searchResults.expenses.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('EXPENSES', { searchQuery: q });
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  Filtrer dans Dépenses <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {searchResults.expenses.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => {
                      onClose();
                      onNavigate('EXPENSES', { searchQuery: exp.description });
                    }}
                    className="p-3 bg-slate-50 hover:bg-rose-50/60 border border-slate-200/70 hover:border-rose-200 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center">
                        -
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-rose-950">
                          {exp.description}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{formatDate(exp.date)}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.2 bg-slate-200 rounded text-[10px] font-bold text-slate-700">
                            {exp.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-rose-600">
                        -{formatAriary(exp.amount)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clients Results */}
          {searchResults.clients.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  Clients ({searchResults.clients.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('CLIENTS');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  Voir tous les clients <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {searchResults.clients.map((cli) => (
                  <div
                    key={cli.id}
                    onClick={() => {
                      onClose();
                      onNavigate('CLIENTS', { searchQuery: cli.name });
                    }}
                    className="p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-950">
                          {cli.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{cli.company}</span>
                          <span>•</span>
                          <span>{cli.email}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-700">
                            Facturé: {formatAriary(cli.totalBilled, { compact: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounts Results */}
          {searchResults.accounts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  Comptes Trésorerie ({searchResults.accounts.length})
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('TREASURY');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  Ouvrir Trésorerie <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1.5">
                {searchResults.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => {
                      onClose();
                      onNavigate('TREASURY');
                    }}
                    className="p-3 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/70 hover:border-emerald-200 rounded-xl transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-2xs"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.provider.slice(0, 3).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{acc.provider}</span>
                          {acc.accountNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono">{acc.accountNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {formatAriary(acc.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">⌘K</kbd> ou{' '}
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">/</kbd>
            </span>
            <span>pour ouvrir la recherche depuis n'importe où</span>
          </div>
          <span className="font-medium text-slate-400">FinSet • Eray Digital</span>
        </div>
      </div>
    </div>
  );
};
