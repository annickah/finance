import React, { useState } from 'react';
import {
  Scale,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatPercent } from '../utils/formatters';

export const ForecastVsReal: React.FC = () => {
  const { realizedTurnover, forecastTurnover, monthIncome, monthExpense, projects } = useFinance();

  const comparisonData = [
    {
      category: "Chiffre d'Affaires",
      budgeted: 48000000,
      realized: 46700000,
      variance: -1300000,
      variancePercent: -2.7,
    },
    {
      category: 'Encaissements Clients',
      budgeted: 22000000,
      realized: monthIncome,
      variance: monthIncome - 22000000,
      variancePercent: ((monthIncome - 22000000) / 22000000) * 100,
    },
    {
      category: 'Charges Fixes & RH',
      budgeted: 12500000,
      realized: 12350000,
      variance: -150000, // lower cost is good
      variancePercent: -1.2,
    },
    {
      category: 'Commissions & Freelances',
      budgeted: 4500000,
      realized: 3950000,
      variance: -550000,
      variancePercent: -12.2,
    },
    {
      category: 'Infrastructures & Outils',
      budgeted: 1800000,
      realized: 1450000,
      variance: -350000,
      variancePercent: -19.4,
    },
    {
      category: 'Marge Brute Globale',
      budgeted: 31000000,
      realized: 32400000,
      variance: +1400000,
      variancePercent: +4.5,
    },
  ];

  const chartData = comparisonData.map((d) => ({
    name: d.category,
    'Prévu / Budget': Math.round(d.budgeted / 1000000),
    'Réalisé': Math.round(d.realized / 1000000),
  }));

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Contrôle Budgétaire & Analyse des Écarts
            </span>
            <span className="text-xs font-semibold text-slate-400">Période : Année en cours</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Prévisionnel vs Réel
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Confrontation directe des objectifs financiers avec les réalisations effectives en banque pour mesurer la précision des prévisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Précision Globale</span>
            <span className="font-mono font-black text-emerald-600 text-base">97.3%</span>
          </div>
        </div>
      </div>

      {/* Chart Comparison */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Comparatif Graphique (en Millions d'Ariary)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Barres comparatives : Bleu = Budget Prévu, Vert/Violet = Réalisé
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={10}
                tickLine={false}
                tickFormatter={(val) => `${val}M`}
              />
              <Tooltip
                formatter={(val: number) => [`${val}M Ar`, '']}
                contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '12px', border: 'none' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="Prévu / Budget" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Réalisé" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Variance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Tableau d'Analyse des Écarts & Dérives
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Détail poste par poste avec explicatif de performance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">Poste Financier</th>
                <th className="py-3 px-6 text-right">Budget Prévu</th>
                <th className="py-3 px-6 text-right">Réalisé Effectif</th>
                <th className="py-3 px-6 text-right">Écart en Valeur</th>
                <th className="py-3 px-6 text-right">Écart (%)</th>
                <th className="py-3 px-6 text-center">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {comparisonData.map((row, idx) => {
                const isFavorable =
                  row.category.includes('Charges') || row.category.includes('Commissions')
                    ? row.variance <= 0
                    : row.variance >= 0;

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-900">{row.category}</td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-500">
                      {formatAriary(row.budgeted)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900">
                      {formatAriary(row.realized)}
                    </td>
                    <td
                      className={`py-3.5 px-6 text-right font-mono font-bold ${
                        row.variance > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.variance > 0 ? '+' : ''}
                      {formatAriary(row.variance)}
                    </td>
                    <td
                      className={`py-3.5 px-6 text-right font-mono font-bold ${
                        row.variancePercent > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.variancePercent > 0 ? '+' : ''}
                      {row.variancePercent.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isFavorable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {isFavorable ? 'FAVORABLE' : 'DÉFAVORABLE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
