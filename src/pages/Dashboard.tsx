import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  Sparkles,
  ChevronRight,
  FolderKanban,
  Clock,
  ArrowRightLeft,
  Calendar,
  CreditCard,
  Receipt,
  Users,
  ShieldCheck,
  Zap,
  Building,
  Scale,
  BookOpen,
  Landmark,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'motion/react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatPercent, formatDate, calculateMargin } from '../utils/formatters';

interface DashboardProps {
  onNavigateToProjects: () => void;
  onNavigateToTreasury: () => void;
  onNavigateToForecast: () => void;
  onNavigateToInvoices: () => void;
  onNavigateToBilan?: () => void;
  onNavigateToCommissions?: () => void;
  onNavigateToExpenses?: () => void;
  onSelectProject: (projectId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToProjects,
  onNavigateToTreasury,
  onNavigateToForecast,
  onNavigateToInvoices,
  onNavigateToBilan,
  onNavigateToCommissions,
  onNavigateToExpenses,
  onSelectProject,
}) => {
  const {
    accounts,
    projects,
    invoices,
    transactions,
    commissions,
    alerts,
    resolveAlert,
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
    incomeStatement,
    balanceSheet,
  } = useFinance();

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  // Timeframe tabs for charts
  const [chartHorizon, setChartHorizon] = useState<number>(30);

  // Area Chart Data: Cash Evolution & Revenue
  const cashChartData = useMemo(() => {
    return dailyForecasts
      .filter((_, idx) => idx % 2 === 0 && idx <= chartHorizon)
      .map((d) => ({
        date: formatDate(d.date, 'short'),
        Trésorerie: Math.round(d.closingBalance),
        'Entrées Prévues': Math.round(d.plannedIncome),
        'Sorties Prévues': Math.round(d.plannedExpense),
      }));
  }, [dailyForecasts, chartHorizon]);

  // Expenses breakdown for Donut Chart
  const expenseBreakdownData = useMemo(() => {
    const fixedTotal = 8500000 + 3200000 + 650000 + 850000;
    const commissionsTotal = commissions.reduce((sum, c) => sum + c.calculatedAmount, 0);
    const variableTotal = 3450000;

    return [
      { name: 'Charges Fixes (Salaires & Loyer)', value: fixedTotal, color: '#6366F1' }, // Indigo
      { name: 'Commissions & Développeurs', value: commissionsTotal, color: '#EC4899' }, // Pink
      { name: 'Infrastructures Cloud & SaaS', value: variableTotal, color: '#06B6D4' }, // Cyan
      { name: 'Frais Généraux & Divers', value: 1200000, color: '#F59E0B' }, // Amber
    ];
  }, [commissions]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. TOP GRADIENT HERO BANNER (As shown in screenshot)     */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-wider border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                PILOTAGE DE TRÉSORERIE ERAY DIGITAL • VISION STRATÉGIQUE
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
                Trésorerie Actuelle :
              </h1>
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-emerald-300 drop-shadow-sm">
                {formatAriary(totalCashBalance)}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-2xl font-medium leading-relaxed">
              Projection à 30 jours : <strong className="text-white">+{formatAriary(forecastTurnover)}</strong> d'entrées prévues —{' '}
              <strong className="text-white">-{formatAriary(pendingDebtsAndCosts + monthExpense)}</strong> de charges = Trésorerie estimée à{' '}
              <strong className="text-emerald-300 font-mono">{formatAriary(projections.d30)}</strong>.
            </p>
          </div>

          {/* Action quick buttons on banner */}
          <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={onNavigateToForecast}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>📈 Scénarios 30/60/90j</span>
            </button>
            <button
              onClick={onNavigateToForecast}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>📅 Planning Financier</span>
            </button>
            <button
              onClick={onNavigateToBilan || onNavigateToTreasury}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-white text-xs font-bold transition-all hover:scale-[1.02] cursor-pointer shadow-xs"
            >
              <Landmark className="w-4 h-4 text-cyan-300" />
              <span>📑 Bilan Comptable</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. AMBER ALERT BANNERS (As shown in screenshot)          */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950">
                Commission en attente de validation
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                La commission de développement de Faly R. (1 800 000 Ar) sur le projet Axius Driver attend votre validation.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToCommissions || onNavigateToProjects}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-amber-900 text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Traiter &gt;
          </button>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950">
                Échéance Loyer Siège dans 5 jours
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                Le loyer du bureau Ankorondrano (3 200 000 Ar) arrive à échéance le 05 septembre 2026.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToExpenses || onNavigateToTreasury}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/60 border border-amber-200 text-amber-900 text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Traiter &gt;
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. 5 KPI STAT CARDS (As shown in screenshot)             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Entrées Réalisées */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Entrées Réalisées
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-slate-900 font-mono tracking-tight">
              +{formatAriary(monthIncome)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Prévu: <span className="font-semibold text-slate-600">{formatAriary(forecastTurnover)}</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Sorties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Sorties
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-rose-600 font-mono tracking-tight">
              -{formatAriary(monthExpense)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Charges fixes & variables
            </p>
          </div>
        </div>

        {/* KPI 3: Bénéfice Net */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bénéfice Net
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-emerald-600 font-mono tracking-tight">
              {formatAriary(monthIncome - monthExpense)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Encaissements – Décaissements
            </p>
          </div>
        </div>

        {/* KPI 4: Créances Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Créances Clients
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-amber-600 font-mono tracking-tight">
              {formatAriary(outstandingReceivables)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Restant à encaisser
            </p>
          </div>
        </div>

        {/* KPI 5: Marge Moyenne */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Marge Moyenne
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-indigo-600 font-mono tracking-tight">
              {averageMarginRate.toFixed(1)}%
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              {activeProjectsCount} projets en production
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. CHARTS: EVOLUTION TRÉSORERIE & RÉPARTITION CHARGES    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart (7 cols): Evolution de la Trésorerie */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Évolution de la Trésorerie & Chiffre d'Affaires
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Courbe prévisionnelle des liquidités disponibles sur 30 jours
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setChartHorizon(15)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartHorizon === 15 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                15j
              </button>
              <button
                onClick={() => setChartHorizon(30)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartHorizon === 30 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                30j
              </button>
              <button
                onClick={() => setChartHorizon(60)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                  chartHorizon === 60 ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                60j
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashChartData}>
                <defs>
                  <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: number) => [formatAriary(val), '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                />
                <Area
                  type="monotone"
                  dataKey="Trésorerie"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCash)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart (5 cols): Répartition des Charges */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Répartition des Charges d'Exploitation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Structure de coûts d'Eray Digital par pôle
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {expenseBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatAriary(val), '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {expenseBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate text-slate-600 text-[11px]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. ACCOUNTS OVERVIEW & ACTIVE PROJECTS IN PRODUCTION     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Accounts List (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Comptes & Disponibilités
            </h3>
            <button
              onClick={onNavigateToTreasury}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Gérer &gt;
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.type === 'BANK' ? 'B' : acc.type === 'MOBILE_MONEY' ? 'M' : 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{acc.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{acc.accountNumber || acc.provider}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-sm text-slate-900">
                  {formatAriary(acc.balance)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Projets Clés en Production
              </h3>
              <p className="text-xs text-slate-500">Rentabilité et encaissements suivis</p>
            </div>
            <button
              onClick={onNavigateToProjects}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Tous les projets ({projects.length}) &gt;
            </button>
          </div>

          <div className="space-y-3">
             {projects.slice(0, 4).map((proj) => {
              const realCostSum = proj.realCosts.reduce((s, c) => s + (c.realAmount || c.plannedAmount), 0);
              const { marginRate } = calculateMargin(proj.sellingPrice, realCostSum);

              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {proj.code}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{proj.name}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">{proj.clientName}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold font-mono text-slate-900 block">
                        {formatAriary(proj.sellingPrice)}
                      </span>
                       <span className="text-[10px] text-emerald-600 font-bold">
                         Marge : {marginRate.toFixed(1)}%
                       </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. SYNTHÈSE DIRECTION — 8 QUESTIONS CLÉS (Chapitre 28)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
            CHAPITRE 28 DU CAHIER DES CHARGES
          </span>
          <h2 className="text-lg font-black text-slate-900 mt-2">
            Vision Synthétique Exécutive : 8 Questions Clés
          </h2>
          <p className="text-xs text-slate-500">
            Réponses instantanées automatisées pour orienter les décisions de la Direction Générale d'Eray Digital.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Q1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              1. Trésorerie disponible
            </span>
            <p className="text-lg font-black text-emerald-600 font-mono">
              {formatAriary(totalCashBalance)}
            </p>
            <span className="text-[10px] text-slate-500">Sur tous les comptes actifs</span>
          </div>

          {/* Q2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              2. Encaissements attendus (30j)
            </span>
            <p className="text-lg font-black text-indigo-600 font-mono">
              {formatAriary(outstandingReceivables)}
            </p>
            <span className="text-[10px] text-slate-500">Factures en attente</span>
          </div>

          {/* Q3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              3. Décaissements prévus (30j)
            </span>
            <p className="text-lg font-black text-rose-600 font-mono">
              {formatAriary(pendingDebtsAndCosts + monthExpense)}
            </p>
            <span className="text-[10px] text-slate-500">Charges fixes + prestataires</span>
          </div>

          {/* Q4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              4. Solde estimé à 30 jours
            </span>
            <p className="text-lg font-black text-purple-600 font-mono">
              {formatAriary(projections.d30)}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">Trésorerie positive</span>
          </div>

          {/* Q5 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              5. Marge moyenne projets
            </span>
            <p className="text-lg font-black text-slate-900 font-mono">
              {averageMarginRate.toFixed(1)}%
            </p>
            <span className="text-[10px] text-slate-500">Objectif min. 65% atteint</span>
          </div>

          {/* Q6 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              6. Factures en retard
            </span>
            <p className="text-lg font-black text-amber-600 font-mono">
              {formatAriary(overdueReceivables)}
            </p>
            <span className="text-[10px] text-slate-500">Créances à relancer</span>
          </div>

          {/* Q7 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              7. Bénéfice prévisionnel
            </span>
            <p className="text-lg font-black text-emerald-600 font-mono">
              {formatAriary(estimatedNetProfit)}
            </p>
            <span className="text-[10px] text-slate-500">Sur les projets signés</span>
          </div>

          {/* Q8 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              8. Capacité d'investissement
            </span>
            <p className="text-lg font-black text-cyan-600 font-mono">
              {formatAriary(Math.max(0, totalCashBalance - 10000000))}
            </p>
            <span className="text-[10px] text-slate-500">Après réserve de sécurité 10M</span>
          </div>
        </div>
      </div>
    </div>
  );
};
