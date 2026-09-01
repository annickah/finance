import React, { useState, useMemo } from 'react';
import {
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Landmark,
  Smartphone,
  CheckCircle2,
  Sparkles,
  PieChart as PieIcon,
  FolderKanban,
  Users,
  CreditCard,
  Edit3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { Transaction } from '../types';
import { formatAriary, formatDate } from '../utils/formatters';
import {
  AdvancedFilterBar,
  FilterState,
  INITIAL_FILTER_STATE,
} from '../components/common/AdvancedFilterBar';
import { downloadCSV } from '../utils/exportUtils';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';

export const RevenuesReceipts: React.FC = () => {
  const { transactions, invoices, monthIncome, realizedTurnover, accounts, clients, projects } = useFinance();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Income Transactions base
  const incomeTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'INCOME');
  }, [transactions]);

  // Filtered Income Transactions according to full criteria
  const filteredTransactions = useMemo(() => {
    return incomeTransactions.filter((tx) => {
      // 1. Text Search (description, client, project, category, receipt)
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(q);
        const matchesCategory = tx.category.toLowerCase().includes(q);
        const matchesClient = tx.clientName ? tx.clientName.toLowerCase().includes(q) : false;
        const matchesProject = tx.projectName ? tx.projectName.toLowerCase().includes(q) : false;
        const matchesReceipt = tx.receiptNumber ? tx.receiptNumber.toLowerCase().includes(q) : false;
        if (!matchesDesc && !matchesCategory && !matchesClient && !matchesProject && !matchesReceipt) {
          return false;
        }
      }

      // 2. Date Range Filter
      if (filters.startDate) {
        if (tx.date < filters.startDate) return false;
      }
      if (filters.endDate) {
        if (tx.date > filters.endDate) return false;
      }

      // 3. Client Filter
      if (filters.clientId !== 'ALL') {
        if (tx.clientId !== filters.clientId) return false;
      }

      // 4. Project Filter
      if (filters.projectId !== 'ALL') {
        if (tx.projectId !== filters.projectId) return false;
      }

      // 5. Account / Bank Channel Filter
      if (filters.accountId !== 'ALL') {
        if (tx.accountId !== filters.accountId) return false;
      }

      // 6. Category Filter
      if (filters.category !== 'ALL') {
        if (tx.category !== filters.category) return false;
      }

      // 7. Min Amount Filter
      if (filters.minAmount !== '') {
        const min = Number(filters.minAmount);
        if (!isNaN(min) && tx.amount < min) return false;
      }

      // 8. Max Amount Filter
      if (filters.maxAmount !== '') {
        const max = Number(filters.maxAmount);
        if (!isNaN(max) && tx.amount > max) return false;
      }

      return true;
    });
  }, [incomeTransactions, filters]);

  // Breakdown by Account/Channel for filtered items
  const channelData = useMemo(() => {
    const channelMap: Record<string, { name: string; value: number; color: string }> = {
      BNI: { name: 'BNI Madagascar', value: 0, color: '#1E3A8A' },
      BMOI: { name: 'BMOI Réserve', value: 0, color: '#4338CA' },
      MVOLA: { name: 'MVola Business', value: 0, color: '#059669' },
      ORANGE: { name: 'Orange Money', value: 0, color: '#EA580C' },
      CAISSE: { name: 'Caisse Espèces', value: 0, color: '#64748B' },
    };

    const targetList = filteredTransactions.length > 0 ? filteredTransactions : incomeTransactions;

    targetList.forEach((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId);
      const prov = (acc?.provider || '').toUpperCase();

      if (prov.includes('BNI')) channelMap.BNI.value += tx.amount;
      else if (prov.includes('BMOI')) channelMap.BMOI.value += tx.amount;
      else if (prov.includes('MVOLA') || prov.includes('TELMA')) channelMap.MVOLA.value += tx.amount;
      else if (prov.includes('ORANGE')) channelMap.ORANGE.value += tx.amount;
      else channelMap.CAISSE.value += tx.amount;
    });

    return Object.values(channelMap).filter((c) => c.value > 0);
  }, [filteredTransactions, incomeTransactions, accounts]);

  const totalFilteredCollected = filteredTransactions.reduce((s, t) => s + t.amount, 0);
  const averageTicket =
    filteredTransactions.length > 0
      ? Math.round(totalFilteredCollected / filteredTransactions.length)
      : 0;

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Reçu / Ref',
      'Description',
      'Client',
      'Projet',
      'Catégorie',
      'Compte Récepteur',
      'Montant (MGA)',
    ];

    const rows = filteredTransactions.map((tx) => {
      const acc = accounts.find((a) => a.id === tx.accountId);
      return [
        tx.date,
        tx.receiptNumber || tx.id,
        tx.description,
        tx.clientName || 'Général',
        tx.projectName || 'Hors projet',
        tx.category,
        acc ? `${acc.name} (${acc.provider})` : 'N/A',
        tx.amount,
      ];
    });

    downloadCSV('Revenus_Encaissements_ErayDigital', headers, rows);
  };

  const revenueCategories = [
    { value: 'PROJECT_INVOICE', label: 'Factures Projets Clients' },
    { value: 'EXCEPTIONAL', label: 'Recouvrements Exceptionnels' },
    { value: 'TRANSFER', label: 'Virement / Crédit' },
  ];

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Recouvrements & Flux Entrants
            </span>
            <span className="text-xs font-semibold text-slate-400">Canaux BNI, BMOI, MVola, Orange</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Revenus & Encaissements
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Suivi exhaustif et filtrage multi-critères de tous les encaissements réels reçus d'Eray Digital : acomptes, soldes et prestations numériques.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Encaissé (Filtré)
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              +{formatAriary(totalFilteredCollected)}
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <AdvancedFilterBar
        filters={filters}
        onFilterChange={setFilters}
        clients={clients}
        projects={projects}
        accounts={accounts}
        categoryOptions={revenueCategories}
        showCategoryFilter={true}
        showAccountFilter={true}
        onExportCSV={handleExportCSV}
        exportLabel="Exporter CSV"
        totalFilteredCount={filteredTransactions.length}
        totalItemsCount={incomeTransactions.length}
        placeholder="Rechercher par description, client, projet, n° reçu..."
      />

      {/* KPI Cards (Filtered & Global Context) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Encaissements Filtrés
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            +{formatAriary(totalFilteredCollected)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Sur {filteredTransactions.length} transaction(s)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Panier Moyen Encaissé
          </span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1">
            {formatAriary(averageTicket)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Par règlement reçu</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Encaissements du Mois (Global)
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            +{formatAriary(monthIncome)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Crédits sur comptes ce mois</span>
        </div>
      </div>

      {/* Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Répartition des Encaissements par Canal de Règlement
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {filteredTransactions.length} flux
            </span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: number) => [formatAriary(val), 'Montant Encaissé']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Part des Moyens de Paiement
            </h3>
            <p className="text-xs text-slate-500">Flux bancaires vs Mobile Money</p>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={channelData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                  {channelData.map((entry, idx) => (
                    <Cell key={`c-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatAriary(val), '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {channelData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-600 truncate text-[11px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-mono font-bold text-slate-900 text-[11px]">{formatAriary(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Journal des Règlements & Encaissements ({filteredTransactions.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique détaillé des flux de recettes avec ventilation par client et projet
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

        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Aucun encaissement ne correspond aux critères</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Veuillez modifier ou réinitialiser vos filtres (date, client, projet, montant).
            </p>
            <button
              onClick={() => setFilters(INITIAL_FILTER_STATE)}
              className="mt-4 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Projet</th>
                  <th className="py-3.5 px-6">Compte Récepteur</th>
                  <th className="py-3.5 px-6 text-right">Montant Encaissé</th>
                  <th className="py-3.5 px-6 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => {
                  const acc = accounts.find((a) => a.id === tx.accountId);
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-3.5 px-6 font-mono text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(tx.date, 'short')}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{tx.description}</div>
                        {tx.receiptNumber && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Réf: {tx.receiptNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        {tx.clientName ? (
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{tx.clientName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Non spécifié</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        {tx.projectName ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <FolderKanban className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="truncate max-w-xs">{tx.projectName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Hors projet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: acc?.color || '#10B981' }}
                          />
                          <span>{acc ? acc.name : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-black text-emerald-600 text-sm whitespace-nowrap">
                        +{formatAriary(tx.amount)}
                      </td>
                      <td className="py-3.5 px-6 text-center whitespace-nowrap">
                        <button
                          onClick={() => setEditingTx(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                          title="Modifier la transaction et tracer dans l'audit"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Éditer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTx)}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
      />
    </div>
  );
};
