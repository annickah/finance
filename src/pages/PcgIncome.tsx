import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';

export const PcgIncome: React.FC = () => {
  const { incomeStatement } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-full">
                COMPTE DE GESTION
              </span>
              <span className="text-xs font-semibold text-slate-500">• Classe 6 (Charges) vs Classe 7 (Produits)</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Le Compte de Résultat</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mesure de la performance économique d'Eray Digital : Produits d'exploitation – Charges d'exploitation = Résultat net (Bénéfice/Perte).
            </p>
          </div>
        </div>

        {/* Big Profit Pill */}
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 ${
            incomeStatement.isProfit
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
              incomeStatement.isProfit ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {incomeStatement.isProfit ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              {incomeStatement.isProfit ? 'Bénéfice Net Réalisé' : 'Perte Nette'}
            </span>
            <span className="text-xl font-black font-mono tracking-tight">
              {formatAriary(Math.abs(incomeStatement.netProfit))}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Charges (Left) vs Produits (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: CHARGES (Classe 6) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-rose-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Charges (Classe 6)</h3>
                  <span className="text-[10px] text-rose-100 font-medium">Consommations de l'exercice & coûts</span>
                </div>
              </div>
              <span className="font-mono font-black text-base">{formatAriary(incomeStatement.totalCharges)}</span>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {incomeStatement.charges.map((charge) => (
                <div key={charge.code} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                      {charge.code}
                    </span>
                    <span className="font-semibold text-slate-800">{charge.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatAriary(charge.amount)}</span>
                </div>
              ))}
              {incomeStatement.charges.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">Aucune charge enregistrée</div>
              )}
            </div>
          </div>

          <div className="bg-rose-50 p-4 border-t border-rose-100 flex items-center justify-between text-xs font-bold text-rose-900">
            <span>TOTAL DES CHARGES (CLASSE 6)</span>
            <span className="font-mono text-sm">{formatAriary(incomeStatement.totalCharges)}</span>
          </div>
        </div>

        {/* Right: PRODUITS (Classe 7) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">Produits (Classe 7)</h3>
                  <span className="text-[10px] text-emerald-100 font-medium">Revenus et prestations de services</span>
                </div>
              </div>
              <span className="font-mono font-black text-base">{formatAriary(incomeStatement.totalProducts)}</span>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {incomeStatement.products.map((prod) => (
                <div key={prod.code} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {prod.code}
                    </span>
                    <span className="font-semibold text-slate-800">{prod.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatAriary(prod.amount)}</span>
                </div>
              ))}
              {incomeStatement.products.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-xs">Aucun produit enregistré</div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 p-4 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-emerald-900">
            <span>TOTAL DES PRODUITS (CLASSE 7)</span>
            <span className="font-mono text-sm">{formatAriary(incomeStatement.totalProducts)}</span>
          </div>
        </div>
      </div>

      {/* Synthesis Section: Rentabilité & Taux de Marge */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-300">
            SYNTHÈSE DU COMPTE DE RÉSULTAT ERAY DIGITAL
          </span>
          <h2 className="text-xl font-bold">
            {incomeStatement.isProfit ? 'Excédent Financier Brut d’Exploitation' : 'Déficit d’Exploitation'}
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Le résultat de l'exercice est calculé par la différence stricte :{' '}
            <strong className="text-white">
              Produits ({formatAriary(incomeStatement.totalProducts)}) – Charges ({formatAriary(incomeStatement.totalCharges)})
            </strong>
            . Il est réinjecté directement dans les Capitaux Propres du Bilan (Compte {incomeStatement.isProfit ? '120' : '129'}).
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Taux de Marge Nette</span>
            <p className="text-2xl font-black text-emerald-400 font-mono">
              {incomeStatement.totalProducts > 0
                ? ((incomeStatement.netProfit / incomeStatement.totalProducts) * 100).toFixed(1)
                : '0'}%
            </p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Solde Net</span>
            <p className="text-2xl font-black font-mono text-white">
              {formatAriary(incomeStatement.netProfit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
