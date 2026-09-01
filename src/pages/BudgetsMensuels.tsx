import React, { useState } from 'react';
import {
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Plus,
  ArrowUpRight,
  PieChart as PieIcon,
  ShieldCheck,
  Building,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatPercent } from '../utils/formatters';

export const BudgetsMensuels: React.FC = () => {
  const { monthExpense, monthIncome, budgetPeriods } = useFinance();
  const currentPeriod = budgetPeriods[0];

  // Budget Envelopes
  const [budgetEnvelopes, setBudgetEnvelopes] = useState([
    { id: '1', category: 'Salaires & Rémunérations', budget: 8500000, consumed: 8500000, color: '#6366F1' },
    { id: '2', category: 'Commissions Développeurs', budget: 4000000, consumed: 2850000, color: '#EC4899' },
    { id: '3', category: 'Loyer & Charges Locatives', budget: 3200000, consumed: 3200000, color: '#06B6D4' },
    { id: '4', category: 'Infrastructures Cloud & SaaS', budget: 1500000, consumed: 950000, color: '#10B981' },
    { id: '5', category: 'Marketing & Prospection B2B', budget: 1200000, consumed: 450000, color: '#F59E0B' },
    { id: '6', category: 'Frais Généraux & Télécoms', budget: 800000, consumed: 620000, color: '#8B5CF6' },
  ]);

  const totalBudgeted = budgetEnvelopes.reduce((s, b) => s + b.budget, 0);
  const totalConsumed = budgetEnvelopes.reduce((s, b) => s + b.consumed, 0);
  const consumptionRate = totalBudgeted > 0 ? (totalConsumed / totalBudgeted) * 100 : 0;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Contrôle de Gestion & Plafonds
            </span>
            <span className="text-xs font-semibold text-slate-400">Mois en cours : Août 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Budgets Mensuels
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Suivi des enveloppes budgétaires allouées par poste de dépenses pour éviter les dépassements et maîtriser le cash burn.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl">
            Budget Global : <strong className="text-slate-900 font-mono">{formatAriary(totalBudgeted)}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Enveloppe Totale Allouée
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatAriary(totalBudgeted)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Plafond mensuel autorisé</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Dépenses Consommées
          </span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1">
            {formatAriary(totalConsumed)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Taux d'exécution : {consumptionRate.toFixed(1)}%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Reliquat Disponible
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {formatAriary(totalBudgeted - totalConsumed)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Marge de sécurité disponible</span>
        </div>
      </div>

      {/* Budget Envelopes Progress Bars */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Consommation par Pôle de Dépenses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Barres de progression en temps réel par rapport au budget fixé
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {budgetEnvelopes.map((env) => {
            const percent = env.budget > 0 ? (env.consumed / env.budget) * 100 : 0;
            const isNearLimit = percent >= 80 && percent <= 100;
            const isExceeded = percent > 100;

            return (
              <div key={env.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: env.color }} />
                    <span className="font-bold text-xs text-slate-900">{env.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {formatAriary(env.consumed)} / {formatAriary(env.budget)}
                    </span>
                    <span
                      className={`ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        isExceeded
                          ? 'bg-rose-100 text-rose-700'
                          : isNearLimit
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isExceeded ? 'bg-rose-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
