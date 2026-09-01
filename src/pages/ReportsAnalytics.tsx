import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Building,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatPercent, calculateMargin } from '../utils/formatters';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'];

export const ReportsAnalytics: React.FC = () => {
  const {
    projects,
    invoices,
    transactions,
    accounts,
    fixedExpenses,
    suppliers,
    selectedMonth,
    setSelectedMonth,
    totalCashBalance,
    monthIncome,
    monthExpense,
    realizedTurnover,
    estimatedNetProfit,
    outstandingReceivables,
    pendingDebtsAndCosts,
  } = useFinance();

  const [reportType, setReportType] = useState<'PROFITABILITY' | 'PL' | 'AGING' | 'CASHFLOW'>('PROFITABILITY');

  // Profitability per Project Type (Website, E-commerce, Software, Mobile App, etc.)
  const profitabilityByType = React.useMemo(() => {
    const map: Record<string, { type: string; totalRevenue: number; totalCost: number; margin: number; count: number }> = {};

    projects.forEach((p) => {
      if (!map[p.category]) {
        map[p.category] = { type: p.category, totalRevenue: 0, totalCost: 0, margin: 0, count: 0 };
      }
      const realCost = p.realCosts.reduce((sum, c) => sum + (c.realAmount || c.plannedAmount), 0);
      map[p.category].totalRevenue += p.sellingPrice;
      map[p.category].totalCost += realCost;
      map[p.category].margin += p.sellingPrice - realCost;
      map[p.category].count += 1;
    });

    return Object.values(map).map((item) => {
      const { marginRate } = calculateMargin(item.totalRevenue, item.totalCost);
      return { ...item, marginRate };
    });
  }, [projects]);

  // Expenses breakdown by category
  const expensesBreakdown = React.useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE' && t.status === 'REALIZED')
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [transactions]);

  // Export report to CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Rapport Financier Eray Digital Madagascar\r\n';
    csvContent += `Genere le: ${new Date().toLocaleDateString('fr-FR')}\r\n\r\n`;

    csvContent += 'PROJET,CATEGORIE,PRIX DE VENTE (Ar),COUT REEL (Ar),MARGE (Ar),MARGE (%)\r\n';
    projects.forEach((p) => {
      const realCost = p.realCosts.reduce((s, c) => s + (c.realAmount || c.plannedAmount), 0);
      const { grossMargin: margin, marginRate } = calculateMargin(p.sellingPrice, realCost);
      const rate = p.sellingPrice > 0 ? marginRate : 0;
      csvContent += `"${p.name}","${p.category}",${p.sellingPrice},${realCost},${margin},${rate}%\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Financier_Eray_Digital_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-emerald-400" />
            Rapports & Analyses Financières
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rentabilité par pôle d'activité, compte de résultat (P&L), bilan de trésorerie et balances âgées
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-[#111625] border border-slate-800 rounded-2xl text-xs font-bold text-white cursor-pointer"
          >
            <option value="2026-08">Août 2026</option>
            <option value="2026-07">Juillet 2026</option>
            <option value="2026-06">Juin 2026</option>
            <option value="2026-05">Mai 2026</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-slate-700"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Highlights Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111625] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs text-slate-400 font-medium">Chiffre d'Affaires Encaissé</span>
          <div className="text-xl font-black text-emerald-400 font-mono mt-2">
            {formatAriary(realizedTurnover)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Sur factures acquittées</span>
        </div>

        <div className="bg-[#111625] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs text-slate-400 font-medium">Bénéfice Net Projet Estimé</span>
          <div className="text-xl font-black text-white font-mono mt-2">
            {formatAriary(estimatedNetProfit)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block font-bold">Marge saine &gt; 60%</span>
        </div>

        <div className="bg-[#111625] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs text-slate-400 font-medium">Créances Clients à Recouvrer</span>
          <div className="text-xl font-black text-amber-400 font-mono mt-2">
            {formatAriary(outstandingReceivables)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Entrées de cash attendues</span>
        </div>

        <div className="bg-[#111625] border border-slate-800 rounded-3xl p-5">
          <span className="text-xs text-slate-400 font-medium">Dettes & Coûts Engagés</span>
          <div className="text-xl font-black text-rose-400 font-mono mt-2">
            {formatAriary(pendingDebtsAndCosts)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Fournisseurs & commissions</span>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setReportType('PROFITABILITY')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            reportType === 'PROFITABILITY'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PieIcon className="w-4 h-4" />
          <span>Rentabilité par Type de Projet</span>
        </button>

        <button
          onClick={() => setReportType('PL')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            reportType === 'PL'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Compte de Résultat Simplifié (P&L)</span>
        </button>

        <button
          onClick={() => setReportType('AGING')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            reportType === 'AGING'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Balance Âgée des Créances</span>
        </button>
      </div>

      {/* REPORT 1: Profitability Breakdown */}
      {reportType === 'PROFITABILITY' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Profit Margin Comparison */}
            <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4">
                Chiffre d'Affaires vs Coûts par Pôle
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitabilityByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="type" stroke="#64748B" fontSize={11} />
                    <YAxis
                      stroke="#64748B"
                      fontSize={11}
                      tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    />
                    <Tooltip
                      formatter={(val: number) => [formatAriary(val), '']}
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '1rem' }}
                    />
                    <Legend />
                    <Bar dataKey="totalRevenue" name="CA Total (Ar)" fill="#10B981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="totalCost" name="Coûts Directs (Ar)" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4">
                Répartition des Postes de Dépenses
              </h3>
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expensesBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatAriary(val), '']}
                      contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderRadius: '1rem' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6">
            <h3 className="text-base font-bold text-white mb-3">Synthèse par Catégorie de Prestation</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Pôle / Catégorie</th>
                    <th className="py-3 px-4 text-center">Projets</th>
                    <th className="py-3 px-4 text-right">CA Total</th>
                    <th className="py-3 px-4 text-right">Coûts Réels</th>
                    <th className="py-3 px-4 text-right">Marge Nette (Ar)</th>
                    <th className="py-3 px-4 text-right">Taux de Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profitabilityByType.map((item) => (
                    <tr key={item.type} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{item.type}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">{item.count}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400">
                        {formatAriary(item.totalRevenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-rose-400">
                        {formatAriary(item.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatAriary(item.margin)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-indigo-400">
                        {formatPercent(item.marginRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: P&L Statement */}
      {reportType === 'PL' && (
        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Compte de Résultat Simplifié — {selectedMonth}</h3>
            <p className="text-xs text-slate-400">
              Agrégation des produits encaissés et des charges directes et de structure
            </p>
          </div>

          <div className="space-y-4 max-w-3xl">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">1. Produits d'Exploitation</span>
                <span className="text-sm font-semibold text-white">Encaissements Prestations & Ventes Logiciels</span>
              </div>
              <span className="text-xl font-mono font-black text-emerald-400">{formatAriary(monthIncome)}</span>
            </div>

            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">2. Charges d'Exploitation</span>
                <span className="text-sm font-semibold text-white">Commissions devs, Salaires, Loyer, Wifi, Cloud & Outils</span>
              </div>
              <span className="text-xl font-mono font-black text-rose-400">{formatAriary(monthExpense)}</span>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-700 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">3. Résultat Net du Mois</span>
                <span className="text-sm font-medium text-slate-300">Solde d'exploitation dégagé</span>
              </div>
              <span className={`text-2xl font-mono font-black ${monthIncome - monthExpense >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatAriary(monthIncome - monthExpense)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: Aging Balance */}
      {reportType === 'AGING' && (
        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">Balance Âgée des Créances Clients</h3>
            <p className="text-xs text-slate-400">
              Analyse des créances par niveau d'ancienneté pour cibler les relances prioritaires
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Facture N°</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4 text-right">Montant Dû</th>
                  <th className="py-3 px-4 text-center">Tranche de Retard</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {invoices
                  .filter((inv) => inv.balanceDue > 0)
                  .map((inv) => {
                    const isOverdue = inv.status === 'OVERDUE';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{inv.clientName}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400 text-sm">
                          {formatAriary(inv.balanceDue)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isOverdue
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {isOverdue ? 'Retard > 15 jours' : 'Courant (< 30j)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
