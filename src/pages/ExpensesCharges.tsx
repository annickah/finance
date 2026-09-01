import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  TrendingDown,
  PieChart as PieIcon,
  Sparkles,
  Users,
  FolderKanban,
  Wallet,
  Download,
  CreditCard,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatDate } from '../utils/formatters';
import {
  AdvancedFilterBar,
  FilterState,
  INITIAL_FILTER_STATE,
} from '../components/common/AdvancedFilterBar';
import { downloadCSV } from '../utils/exportUtils';

export const ExpensesCharges: React.FC = () => {
  const { fixedExpenses, payFixedExpense, monthExpense, accounts, transactions, projects, clients, selectedMonth } =
    useFinance();

  const [activeTab, setActiveTab] = useState<'ALL' | 'FIXED' | 'PROJECT_VARIABLE'>('ALL');
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Pay Modal State
  const [payTargetModal, setPayTargetModal] = useState<{ id: string; name: string; amount: number } | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc-bni');

  // Unified items list: fixed expenses + expense transactions
  const expenseTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'EXPENSE');
  }, [transactions]);

  // Combined all expenses view
  const combinedExpenses = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      category: string;
      beneficiary: string;
      date: string;
      amount: number;
      status: 'PAID' | 'PENDING';
      accountId: string;
      projectId?: string;
      projectName?: string;
      clientId?: string;
      clientName?: string;
      isFixedExpense: boolean;
    }> = [];

    // 1. Add Fixed Expenses
    fixedExpenses.forEach((fe) => {
      const isPaidThisMonth = transactions.some(
        (t) =>
          t.category === 'RECURRING_FIXED' &&
          t.status === 'REALIZED' &&
          t.date.startsWith(selectedMonth) &&
          t.description.includes(fe.label)
      );
      list.push({
        id: fe.id,
        name: fe.label,
        category: fe.category,
        beneficiary: fe.assignedTo,
        date: `${selectedMonth}-${String(fe.dueDay).padStart(2, '0')}`,
        amount: fe.amount,
        status: isPaidThisMonth ? 'PAID' : 'PENDING',
        accountId: fe.paymentAccountId || 'acc-bni',
        isFixedExpense: true,
      });
    });

    // 2. Add Project & Variable Expense Transactions
    expenseTransactions.forEach((tx) => {
      // Find associated project and client
      const proj = projects.find((p) => p.id === tx.projectId);
      const cli = clients.find((c) => c.id === tx.clientId || c.id === proj?.clientId);

      list.push({
        id: tx.id,
        name: tx.description,
        category: tx.category,
        beneficiary: tx.createdBy || 'Prestataire / Fournisseur',
        date: tx.date,
        amount: tx.amount,
        status: tx.status === 'REALIZED' ? 'PAID' : 'PENDING',
        accountId: tx.accountId,
        projectId: tx.projectId,
        projectName: tx.projectName || proj?.name,
        clientId: tx.clientId || proj?.clientId,
        clientName: tx.clientName || cli?.name,
        isFixedExpense: false,
      });
    });

    return list;
  }, [fixedExpenses, expenseTransactions, projects, clients]);

  // Filter combined or targeted list
  const filteredList = useMemo(() => {
    let source = combinedExpenses;
    if (activeTab === 'FIXED') {
      source = combinedExpenses.filter((e) => e.isFixedExpense);
    } else if (activeTab === 'PROJECT_VARIABLE') {
      source = combinedExpenses.filter((e) => !e.isFixedExpense);
    }

    return source.filter((item) => {
      // 1. Text search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesBeneficiary = item.beneficiary.toLowerCase().includes(q);
        const matchesProject = item.projectName ? item.projectName.toLowerCase().includes(q) : false;
        const matchesClient = item.clientName ? item.clientName.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesCategory && !matchesBeneficiary && !matchesProject && !matchesClient) {
          return false;
        }
      }

      // 2. Date Range
      if (filters.startDate && item.date < filters.startDate) return false;
      if (filters.endDate && item.date > filters.endDate) return false;

      // 3. Client Filter
      if (filters.clientId !== 'ALL' && item.clientId !== filters.clientId) return false;

      // 4. Project Filter
      if (filters.projectId !== 'ALL' && item.projectId !== filters.projectId) return false;

      // 5. Account Filter
      if (filters.accountId !== 'ALL' && item.accountId !== filters.accountId) return false;

      // 6. Category Filter
      if (filters.category !== 'ALL' && item.category !== filters.category) return false;

      // 7. Status Filter
      if (filters.status !== 'ALL' && item.status !== filters.status) return false;

      // 8. Min Amount
      if (filters.minAmount !== '') {
        const min = Number(filters.minAmount);
        if (!isNaN(min) && item.amount < min) return false;
      }

      // 9. Max Amount
      if (filters.maxAmount !== '') {
        const max = Number(filters.maxAmount);
        if (!isNaN(max) && item.amount > max) return false;
      }

      return true;
    });
  }, [combinedExpenses, activeTab, filters]);

  // Real-time KPI summaries for filtered items
  const totalFilteredAmount = filteredList.reduce((s, e) => s + e.amount, 0);
  const totalPaidAmount = filteredList.filter((e) => e.status === 'PAID').reduce((s, e) => s + e.amount, 0);
  const totalPendingAmount = filteredList.filter((e) => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0);

  // Categories list for dropdown
  const categoryOptions = [
    { value: 'RH', label: 'Ressources Humaines & Salaires' },
    { value: 'LOCAUX', label: 'Locaux & Loyer Siège' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure IT & Cloud' },
    { value: 'ADMIN', label: 'Administration & Frais Généraux' },
    { value: 'COMMISSION', label: 'Commissions Développeurs' },
    { value: 'SERVER_CLOUD', label: 'Serveurs & Hébergement Projets' },
    { value: 'MARKETING', label: 'Marketing & Communication' },
    { value: 'TAX', label: 'Impôts & Taxes (IR / TVA)' },
  ];

  const statusOptions = [
    { value: 'PAID', label: 'Réglé / Décaissé' },
    { value: 'PENDING', label: 'En attente de paiement' },
  ];

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Date / Échéance',
      'Libellé de la Dépense',
      'Catégorie',
      'Bénéficiaire',
      'Client',
      'Projet',
      'Compte Débité',
      'Montant (MGA)',
      'Statut',
    ];

    const rows = filteredList.map((item) => {
      const acc = accounts.find((a) => a.id === item.accountId);
      return [
        item.date,
        item.name,
        item.category,
        item.beneficiary,
        item.clientName || 'N/A',
        item.projectName || 'Frais Structure',
        acc ? `${acc.name} (${acc.provider})` : 'BNI Madagascar',
        item.amount,
        item.status === 'PAID' ? 'RÉGLÉ' : 'EN ATTENTE',
      ];
    });

    downloadCSV('Depenses_Charges_ErayDigital', headers, rows);
  };

  const handleConfirmPay = () => {
    if (!payTargetModal) return;
    payFixedExpense(payTargetModal.id, selectedAccountId);
    setPayTargetModal(null);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 text-xs font-bold flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              Charges d'Exploitation & Décaissements
            </span>
            <span className="text-xs font-semibold text-slate-400">Charges Fixes & Projets Variables</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Dépenses & Charges
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Supervision et filtrage avancé des charges d'Eray Digital : salaires, loyers, commissions dév, hébergement cloud, sous-traitance et frais généraux.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Dépenses Filtrées
            </span>
            <span className="text-2xl font-black text-rose-600 font-mono">
              -{formatAriary(totalFilteredAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Scope Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Toutes les Dépenses ({combinedExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('FIXED')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'FIXED'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Charges Fixes ({fixedExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('PROJECT_VARIABLE')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROJECT_VARIABLE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Coûts Projets & Variables ({expenseTransactions.length})
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <AdvancedFilterBar
        filters={filters}
        onFilterChange={setFilters}
        clients={clients}
        projects={projects}
        accounts={accounts}
        categoryOptions={categoryOptions}
        statusOptions={statusOptions}
        showCategoryFilter={true}
        showStatusFilter={true}
        showAccountFilter={true}
        onExportCSV={handleExportCSV}
        exportLabel="Exporter CSV"
        totalFilteredCount={filteredList.length}
        totalItemsCount={
          activeTab === 'ALL'
            ? combinedExpenses.length
            : activeTab === 'FIXED'
            ? fixedExpenses.length
            : expenseTransactions.length
        }
        placeholder="Rechercher charge, bénéficiaire, client, projet, catégorie..."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Dépenses Filtrées
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatAriary(totalFilteredAmount)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Sur {filteredList.length} ligne(s)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Montant Déjà Réglé
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {formatAriary(totalPaidAmount)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Décaissé sur comptes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            En Attente de Règlement
          </span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatAriary(totalPendingAmount)}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">À régler avant échéance</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Répertoire des Dépenses & Échéancier ({filteredList.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Détail des postes de dépenses avec traçabilité par client et projet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exporter CSV</span>
            </button>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="py-16 text-center">
            <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Aucune dépense ne correspond aux critères de recherche</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Modifiez vos critères de filtrage ou réinitialisez les filtres.
            </p>
            <button
              onClick={() => setFilters(INITIAL_FILTER_STATE)}
              className="mt-4 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Date / Échéance</th>
                  <th className="py-3.5 px-6">Libellé</th>
                  <th className="py-3.5 px-6">Catégorie</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Projet</th>
                  <th className="py-3.5 px-6">Bénéficiaire</th>
                  <th className="py-3.5 px-6 text-right">Montant</th>
                  <th className="py-3.5 px-6 text-center">Statut</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((exp) => {
                  const acc = accounts.find((a) => a.id === exp.accountId);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(exp.date, 'short')}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{exp.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Compte : {acc ? acc.name : 'BNI Madagascar'}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {exp.clientName ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{exp.clientName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Structure</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        {exp.projectName ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <FolderKanban className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="truncate max-w-[150px]">{exp.projectName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Frais Généraux</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 font-medium">
                        {exp.beneficiary}
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-rose-600 text-sm whitespace-nowrap">
                        -{formatAriary(exp.amount)}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            exp.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {exp.status === 'PAID' ? 'RÉGLÉ' : 'À PAYER'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        {exp.status === 'PENDING' && (
                          <button
                            onClick={() =>
                              setPayTargetModal({ id: exp.id, name: exp.name, amount: exp.amount })
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-2xs cursor-pointer"
                          >
                            Payer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Modal Confirmation */}
      {payTargetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Régler la Dépense</h3>
                  <p className="text-xs text-slate-500">Validation du décaissement</p>
                </div>
              </div>
              <button
                onClick={() => setPayTargetModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs text-slate-500 font-medium">Poste de charge :</div>
              <div className="text-sm font-bold text-slate-900">{payTargetModal.name}</div>
              <div className="text-lg font-black text-rose-600 font-mono pt-1">
                {formatAriary(payTargetModal.amount)}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Compte bancaire / Canal émetteur</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.provider}) - Solde : {formatAriary(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayTargetModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Confirmer le règlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
