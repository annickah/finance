import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  Zap,
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
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { ForecastScenario } from '../types';
import { formatAriary, formatPercent, formatDate } from '../utils/formatters';

export const ForecastPlanning: React.FC = () => {
  const {
    totalCashBalance,
    dailyForecasts,
    projections,
    forecastScenario,
    setForecastScenario,
    invoices,
    projects,
  } = useFinance();

  const [forecastHorizon, setForecastHorizon] = useState<30 | 60 | 90>(60);

  // Prepare chart series based on selected horizon
  const chartData = dailyForecasts.slice(0, forecastHorizon).map((d) => ({
    date: formatDate(d.date, 'short'),
    SoldePrevu: Math.round(d.closingBalance),
    Entrees: Math.round(d.plannedIncome),
    Sorties: Math.round(d.plannedExpense),
    isRisk: d.isLowBalanceRisk,
  }));

  // Identify lowest point (point bas de trésorerie)
  let lowestCashPoint = Infinity;
  let lowestCashDate = '';
  dailyForecasts.slice(0, forecastHorizon).forEach((d) => {
    if (d.closingBalance < lowestCashPoint) {
      lowestCashPoint = d.closingBalance;
      lowestCashDate = d.date;
    }
  });

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header with Scenario Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Moteur Prévisionnel & IA
            </span>
            <span className="text-xs font-semibold text-slate-400">Horizon : {forecastHorizon} jours</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Planning & Prévisions de Trésorerie
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Modélisation dynamique : Trésorerie = Solde Réel + Factures Clients Attendues - Charges et Commissions.
          </p>
        </div>

        {/* FinSet Scenario Selector */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setForecastScenario('PESSIMISTIC')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              forecastScenario === 'PESSIMISTIC'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Pessimiste (-20%)
          </button>
          <button
            onClick={() => setForecastScenario('REALISTIC')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              forecastScenario === 'REALISTIC'
                ? 'bg-slate-950 text-emerald-400 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Réaliste (Nominal)
          </button>
          <button
            onClick={() => setForecastScenario('OPTIMISTIC')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              forecastScenario === 'OPTIMISTIC'
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Optimiste (+15%)
          </button>
        </div>
      </div>

      {/* Projection Cards (7d, 30d, 60d, 90d) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde Actuel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Solde Actuel (J0)</span>
          <div className="mt-2">
            <div className="text-xl font-black text-slate-950 font-mono">
              {formatAriary(totalCashBalance)}
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">Point de départ réel</div>
          </div>
        </div>

        {/* Projection 7 jours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Projection à 7 Jours</span>
          <div className="mt-2">
            <div className="text-xl font-black text-indigo-600 font-mono">
              {formatAriary(projections.d7)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Variation : {formatAriary(projections.d7 - totalCashBalance, { sign: true })}
            </div>
          </div>
        </div>

        {/* Projection 30 jours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Projection à 30 Jours</span>
          <div className="mt-2">
            <div className="text-xl font-black text-emerald-600 font-mono">
              {formatAriary(projections.d30)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Variation : {formatAriary(projections.d30 - totalCashBalance, { sign: true })}
            </div>
          </div>
        </div>

        {/* Projection 90 jours */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Projection à 90 Jours</span>
          <div className="mt-2">
            <div className="text-xl font-black text-emerald-600 font-mono">
              {formatAriary(projections.d90)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Variation : {formatAriary(projections.d90 - totalCashBalance, { sign: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Point Bas & Stress Test Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Point Bas de Trésorerie Détecté
            </h4>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {formatAriary(lowestCashPoint)} le{' '}
              <span className="text-emerald-400 font-sans">{formatDate(lowestCashDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Horizon :</span>
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setForecastHorizon(30)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                forecastHorizon === 30 ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              30J
            </button>
            <button
              onClick={() => setForecastHorizon(60)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                forecastHorizon === 60 ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              60J
            </button>
            <button
              onClick={() => setForecastHorizon(90)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                forecastHorizon === 90 ? 'bg-emerald-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              90J
            </button>
          </div>
        </div>
      </div>

      {/* Main Forecast Evolution Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Trajectoire Prévisionnelle du Solde
            </h2>
            <p className="text-xs text-slate-400">
              Scénario actif : <span className="font-bold text-emerald-700 font-mono">{forecastScenario}</span>
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(val: any) => [formatAriary(Number(val)), 'Solde Estimé']}
                contentStyle={{
                  backgroundColor: '#0B0F19',
                  color: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #1E293B',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="SoldePrevu"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#forecastGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
