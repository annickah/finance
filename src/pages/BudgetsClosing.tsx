import React, { useState } from 'react';
import {
  CalendarClock,
  Lock,
  Unlock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatPercent, formatDate } from '../utils/formatters';

export const BudgetsClosing: React.FC = () => {
  const { budgetPeriods, closeMonthlyBudget, monthIncome, monthExpense, totalCashBalance } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [targetRev, setTargetRev] = useState<number>(35000000);
  const [targetExp, setTargetExp] = useState<number>(16000000);

  const activePeriod = budgetPeriods.find((b) => b.month === selectedMonth);

  const handleCloseMonth = () => {
    closeMonthlyBudget(selectedMonth, targetRev, targetExp);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5" />
              Comptabilité & Clôture
            </span>
            <span className="text-xs font-semibold text-slate-400">Périodes mensuelles</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Budgets & Clôture Mensuelle
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Fixation des objectifs prévisionnels, suivi du réalisé et report automatique du solde de clôture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-600">Mois actif :</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Current Month Active Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Période : {selectedMonth}</span>
            <h2 className="text-base font-black text-slate-950 mt-0.5">
              Objectifs vs Réalisé du Mois
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {activePeriod?.isClosed ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl">
                <Lock className="w-3.5 h-3.5" />
                Mois Clôturé & Figé
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs rounded-xl">
                <Unlock className="w-3.5 h-3.5" />
                Période en cours (Ouverte)
              </span>
            )}
          </div>
        </div>

        {/* Goals Input & Realized Comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Revenue Targets */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-950">1. Chiffre d'Affaires & Encaissements</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Objectif Entrées (Ar) :</label>
              <input
                type="number"
                disabled={activePeriod?.isClosed}
                value={targetRev}
                onChange={(e) => setTargetRev(Number(e.target.value))}
                className="w-full p-2.5 text-xs font-mono font-black border border-slate-200 rounded-xl bg-white disabled:bg-slate-100"
              />
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Réalisé en direct :</span>
              <span className="font-bold text-emerald-600 font-mono">{formatAriary(monthIncome)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, targetRev > 0 ? (monthIncome / targetRev) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>

          {/* Expense Targets */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-950">2. Charges & Décaissements</h3>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Plafond Dépenses (Ar) :</label>
              <input
                type="number"
                disabled={activePeriod?.isClosed}
                value={targetExp}
                onChange={(e) => setTargetExp(Number(e.target.value))}
                className="w-full p-2.5 text-xs font-mono font-black border border-slate-200 rounded-xl bg-white disabled:bg-slate-100"
              />
            </div>
            <div className="pt-2 border-t border-slate-200/60 flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Dépensé en direct :</span>
              <span className="font-bold text-rose-600 font-mono">{formatAriary(monthExpense)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  monthExpense > targetExp ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
                style={{
                  width: `${Math.min(100, targetExp > 0 ? (monthExpense / targetExp) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {!activePeriod?.isClosed && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleCloseMonth}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Clôturer la Période & Figer les Soldes</span>
            </button>
          </div>
        )}
      </div>

      {/* Historical Closed Periods */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-black text-sm text-slate-950">Historique des Clôtures Précédentes</h3>
        <div className="divide-y divide-slate-100">
          {budgetPeriods.map((period) => (
            <div key={period.id} className="py-3.5 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-xs text-slate-900">{period.month}</span>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Clôturé le {formatDate(period.closedAt || '', 'short')}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-black text-slate-950">
                  Solde Fin : {formatAriary(period.finalBalance)}
                </div>
                <span className="text-[11px] text-emerald-600 font-bold">
                  Flux Net : {formatAriary(period.realizedRevenue - period.realizedExpense, { sign: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
