import React, { useState } from 'react';
import {
  ArrowLeft,
  DollarSign,
  PieChart as PieIcon,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2,
  Tag,
  Receipt,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { CostCategory, ProjectCostItem } from '../types';
import { formatAriary, formatPercent, formatDate, calculateMargin, getMarginBadgeClasses } from '../utils/formatters';
import { AddCostModal } from '../components/modals/AddCostModal';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  onOpenInvoiceModal: (projectId: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  projectId,
  onBack,
  onOpenInvoiceModal,
}) => {
  const { projects, accounts, addCostItem, toggleCostPaid, invoices, fixedExpenses } = useFinance();
  const [isAddCostOpen, setIsAddCostOpen] = useState(false);
  const [selectedPayAccount, setSelectedPayAccount] = useState(accounts[0]?.id || '');

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80">
        <p className="text-sm text-slate-500">Projet introuvable.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  // Cost calculations
  const totalPlannedCosts = project.plannedCosts.reduce(
    (sum, c) => sum + (c.plannedAmount || 0),
    0
  );
  const totalRealCosts = project.realCosts.reduce(
    (sum, c) => sum + (c.realAmount || c.plannedAmount || 0),
    0
  );

  const { grossMargin, marginRate, isProfitable } = calculateMargin(
    project.sellingPrice,
    totalRealCosts
  );

  const marginBadge = getMarginBadgeClasses(marginRate);

  const activeProjectsCount = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'LEAD').length;
  const totalFixedExpenses = fixedExpenses.reduce((sum, f) => sum + f.amount, 0);
  const totalActiveSellingPrice = projects
    .filter((p) => p.status === 'IN_PROGRESS' || p.status === 'LEAD')
    .reduce((sum, p) => sum + p.sellingPrice, 0);
  const fixedCostAllocation =
    activeProjectsCount > 0 && totalActiveSellingPrice > 0
      ? (project.sellingPrice / totalActiveSellingPrice) * totalFixedExpenses
      : 0;

  const variableCosts = totalRealCosts;
  const netProfit = project.sellingPrice - variableCosts - fixedCostAllocation;
  const netProfitRate = project.sellingPrice > 0 ? (netProfit / project.sellingPrice) * 100 : 0;

  const breakEvenRevenue = variableCosts + fixedCostAllocation;
  const revenueGap = project.sellingPrice - breakEvenRevenue;

  const profitabilityBadge = netProfit >= 0
    ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Bénéficiaire' }
    : { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Déficitaire' };

  const netProfitBadge = netProfitRate >= 30
    ? { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', badge: 'Excellente (>30%)' }
    : netProfitRate >= 15
    ? { bg: 'bg-blue-50 text-blue-700 border-blue-200', badge: 'Saine (15-30%)' }
    : netProfitRate >= 0
    ? { bg: 'bg-amber-50 text-amber-700 border-amber-200', badge: 'Faible (0-15%)' }
    : { bg: 'bg-rose-50 text-rose-700 border-rose-200', badge: 'Critique (<0%)' };

  // Planned vs Real variance
  const costVariance = totalRealCosts - totalPlannedCosts;

  // Pie chart breakdown by category
  const costByCategory: Record<string, number> = {};
  project.realCosts.forEach((c) => {
    const key = c.category;
    costByCategory[key] = (costByCategory[key] || 0) + (c.realAmount || c.plannedAmount);
  });

  const categoryLabels: Record<CostCategory, string> = {
    DEV_COMMISSION: 'Commissions Développeurs',
    SALES_COMMISSION: 'Commissions Commerciales',
    CLOUD: 'Serveurs & Cloud',
    HOSTING: 'Hébergement & CDN',
    DOMAIN: 'Nom de Domaine / SSL',
    API: 'API & Passerelles (SMS/Paiement)',
    SUBCONTRACTING: 'Sous-traitance & Audits',
    TRAVEL: 'Déplacements & Missions',
    HARDWARE: 'Matériel Électronique',
    OTHER: 'Autres Coûts',
  };

  const categoryColors = [
    '#10B981',
    '#6366F1',
    '#3B82F6',
    '#F59E0B',
    '#EC4899',
    '#14B8A6',
    '#8B5CF6',
    '#06B6D4',
  ];

  const breakdownData = Object.entries(costByCategory).map(([cat, amount], idx) => ({
    name: categoryLabels[cat as CostCategory] || cat,
    value: amount,
    color: categoryColors[idx % categoryColors.length],
  }));

  // Project Invoices
  const projectInvoices = invoices.filter((inv) => inv.projectId === project.id);

  const handleAddCost = (costData: {
    label: string;
    category: CostCategory;
    plannedAmount: number;
    realAmount: number;
  }) => {
    addCostItem(project.id, {
      ...costData,
      isPaid: false,
    });
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs font-mono border border-indigo-100">
                {project.code}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                {project.category}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  project.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : project.status === 'IN_PROGRESS'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {project.status === 'COMPLETED'
                  ? 'Terminé'
                  : project.status === 'IN_PROGRESS'
                  ? 'En cours'
                  : 'En attente'}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-950 mt-1.5">{project.name}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3.5 h-3.5" />
              Client : <span className="font-semibold text-slate-800">{project.clientName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onOpenInvoiceModal(project.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Émettre Facture</span>
          </button>
          <button
            onClick={() => setIsAddCostOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Ajouter un Coût</span>
          </button>
        </div>
      </div>

      {/* Financial Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Prix de Vente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Prix de Vente Total (CA)</span>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-950 tracking-tight font-mono">
              {formatAriary(project.sellingPrice)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
              <span>Encaissé :</span>
              <span className="font-bold text-emerald-600 font-mono">
                {formatAriary(project.totalCollected)}
              </span>
            </div>
          </div>
        </div>

        {/* Coûts Réels Totaux */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Coûts Totaux Réels</span>
            {costVariance !== 0 && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  costVariance > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {costVariance > 0
                  ? `+${formatAriary(costVariance, { compact: true })} dépas.`
                  : `${formatAriary(costVariance, { compact: true })} sous budget`}
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-600 tracking-tight font-mono">
              {formatAriary(totalRealCosts)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
              <span>Budget Initial :</span>
              <span className="font-semibold text-slate-700 font-mono">
                {formatAriary(totalPlannedCosts)}
              </span>
            </div>
          </div>
        </div>

        {/* Marge Brute en Ariary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Marge Brute Réalisée</span>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600 tracking-tight font-mono">
              {formatAriary(grossMargin)}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 font-medium">
              <span>Rentabilité :</span>
              <span className="font-bold text-slate-800">
                {isProfitable ? 'Bénéficiaire' : 'Déficitaire'}
              </span>
            </div>
          </div>
        </div>

        {/* Taux de Marge (%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Taux de Marge Brute</span>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950 tracking-tight font-mono">
                {formatPercent(marginRate)}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${marginBadge.bg}`}>
                {marginBadge.badge}
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  marginRate >= 40 ? 'bg-emerald-500' : marginRate >= 20 ? 'bg-blue-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, marginRate))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rentability Analysis Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-black text-slate-950">
            Analyse de Rentabilité par Projet
          </h2>
        </div>
        <p className="text-xs text-slate-400 -mt-2">
          Bénéfice net après déduction des coûts variables et de la part des charges fixes
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Prix de Vente (CA) */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Chiffre d'Affaires</span>
            <div className="mt-2">
              <div className="text-xl font-black text-slate-950 tracking-tight font-mono">
                {formatAriary(project.sellingPrice)}
              </div>
            </div>
          </div>

          {/* Coûts Variables Directs */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Coûts Variables Directs</span>
            <div className="mt-2">
              <div className="text-xl font-black text-rose-600 tracking-tight font-mono">
                {formatAriary(variableCosts)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">
                Commissions, hébergement, domaine, sous-traitance...
              </div>
            </div>
          </div>

          {/* Part des Charges Fixes */}
          <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/60 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Part des Charges Fixes</span>
            <div className="mt-2">
              <div className="text-xl font-black text-amber-600 tracking-tight font-mono">
                {formatAriary(fixedCostAllocation)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 font-medium">
                {formatAriary(totalFixedExpenses)} total / réparti au prorata du CA
              </div>
            </div>
          </div>

          {/* Bénéfice Net */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${profitabilityBadge.bg}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Bénéfice Net</span>
            <div className="mt-2">
              <div className={`text-xl font-black tracking-tight font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatAriary(netProfit)}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${netProfitBadge.bg}`}>
                  {netProfitBadge.badge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60">
          <h3 className="text-xs font-black text-slate-700 mb-3">Détail du Calcul de Rentabilité</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Prix de vente (CA)</span>
              <span className="font-bold text-slate-950 font-mono">{formatAriary(project.sellingPrice)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">(-) Coûts variables (commissions, hébergement, domaine...)</span>
              <span className="font-bold text-rose-600 font-mono">- {formatAriary(variableCosts)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">(-) Part des charges fixes (loyer, salaires, internet...)</span>
              <span className="font-bold text-amber-600 font-mono">- {formatAriary(fixedCostAllocation)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-black text-slate-900">Bénéfice Net</span>
                <span className={`font-black font-mono ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {formatAriary(netProfit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider">Taux de Rentabilité Net</span>
                <span className={`font-bold font-mono ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatPercent(netProfitRate)}
                </span>
              </div>

              <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Seuil de Rentabilité (CA minimum)</span>
                  <span className="font-bold text-slate-950 font-mono">{formatAriary(breakEvenRevenue)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Écart / Seuil</span>
                  <span className={`font-bold font-mono ${revenueGap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {revenueGap >= 0 ? '+' : ''}{formatAriary(revenueGap)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      revenueGap >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (project.sellingPrice / Math.max(breakEvenRevenue, 1)) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {revenueGap >= 0
                    ? 'CA au-dessus du seuil de rentabilité'
                    : `Il faut encore ${formatAriary(Math.abs(revenueGap))} de CA pour atteindre le seuil`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Costs Breakdown & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table of Cost Items (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-950">
                Ventilation des Dépenses Directes ({project.realCosts.length})
              </h2>
              <p className="text-xs text-slate-400">
                Commissions développeurs, hébergement, API, licences et frais annexes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Payer via :</span>
              <select
                value={selectedPayAccount}
                onChange={(e) => setSelectedPayAccount(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-xl bg-slate-50 font-semibold"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3">Dépense / Commission</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3 text-right">Montant Prévu</th>
                  <th className="py-3 px-3 text-right">Montant Réel</th>
                  <th className="py-3 px-3 text-center w-24">Statut</th>
                  <th className="py-3 px-3 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.realCosts.map((cost) => (
                  <tr key={cost.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-slate-950">{cost.label}</div>
                      {cost.paidDate && (
                        <span className="text-[10px] text-slate-400">
                          Payé le {formatDate(cost.paidDate, 'short')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {categoryLabels[cost.category] || cost.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {formatAriary(cost.plannedAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-slate-950">
                      {formatAriary(cost.realAmount || cost.plannedAmount)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          cost.isPaid
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {cost.isPaid ? 'RÉGLÉ' : 'À PAYER'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => toggleCostPaid(project.id, cost.id, selectedPayAccount)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer ${
                          cost.isPaid
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-2xs'
                        }`}
                      >
                        {cost.isPaid ? 'Annuler' : 'Payer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost Distribution Breakdown Chart (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-950 mb-1">
              Répartition des Coûts
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Poids des postes de dépense sur le budget total
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatAriary(Number(val)), 'Montant']}
                    contentStyle={{
                      backgroundColor: '#0B0F19',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100">
            {breakdownData.map((b) => (
              <div key={b.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-slate-700 truncate font-medium">{b.name}</span>
                </div>
                <span className="font-bold text-slate-950 font-mono shrink-0">{formatAriary(b.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Invoices Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-950">
              Facturation Client & Encaissements ({projectInvoices.length})
            </h2>
            <p className="text-xs text-slate-400">
              Factures d'acompte et solde rattachées à ce projet
            </p>
          </div>
          <button
            onClick={() => onOpenInvoiceModal(project.id)}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            + Nouvelle Facture
          </button>
        </div>

        {projectInvoices.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Aucune facture émise pour ce projet pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {projectInvoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-xs text-indigo-600">{inv.invoiceNumber}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {inv.status === 'PAID' ? 'PAYÉE' : inv.status === 'OVERDUE' ? 'EN RETARD' : 'ÉMISE'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Émise le {formatDate(inv.issueDate, 'short')} • Échéance: {formatDate(inv.dueDate, 'short')}
                  </span>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black text-slate-950 font-mono">
                    {formatAriary(inv.totalAmount)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Encaissé: {formatAriary(inv.paidAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Cost Modal */}
      <AddCostModal
        isOpen={isAddCostOpen}
        onClose={() => setIsAddCostOpen(false)}
        onAdd={handleAddCost}
      />
    </div>
  );
};
