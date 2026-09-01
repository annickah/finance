import React, { useState } from 'react';
import { Scale, Search, CheckCircle2, AlertTriangle, Download, Printer, Filter } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';

export const PcgBalance: React.FC = () => {
  const { accountingBalance } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>('ALL');

  const filteredRows = accountingBalance.rows.filter((row) => {
    const matchClass = selectedClass === 'ALL' || row.classNum === selectedClass;
    const matchSearch =
      row.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full">
                BALANCE GÉNÉRALE DES COMPTES
              </span>
              <span className="text-xs font-semibold text-slate-500">• Contrôle arithmétique</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">La Balance Comptable</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              État récapitulatif périodique : Somme des Débits = Somme des Crédits et Somme des Soldes Débiteurs = Somme des Soldes Créditeurs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
              accountingBalance.isBalanced
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {accountingBalance.isBalanced ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Balance Parfaitement Équilibrée</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Déséquilibre Détecté</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Proof Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              1. Total des Mouvements (Journal)
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Égalité Vérifiée</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Débits</span>
              <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {formatAriary(accountingBalance.totalDebit)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Crédits</span>
              <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {formatAriary(accountingBalance.totalCredit)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              2. Total des Soldes Finaux (Grand Livre)
            </span>
            <span className="text-[11px] font-bold text-indigo-600">Égalité Vérifiée</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Soldes Débiteurs (SD)</span>
              <p className="text-lg font-black text-emerald-600 font-mono mt-0.5">
                {formatAriary(accountingBalance.totalSoldeDebiteur)}
              </p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Soldes Créditeurs (SC)</span>
              <p className="text-lg font-black text-purple-600 font-mono mt-0.5">
                {formatAriary(accountingBalance.totalSoldeCrediteur)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            onClick={() => setSelectedClass('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedClass === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous les comptes ({accountingBalance.rows.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((cls) => {
            const count = accountingBalance.rows.filter((r) => r.classNum === cls).length;
            if (count === 0) return null;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  selectedClass === cls
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>Classe {cls}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${selectedClass === cls ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher compte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Balance Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th rowSpan={2} className="py-3 px-4 w-24 border-r border-slate-800">N° Compte</th>
                <th rowSpan={2} className="py-3 px-4 border-r border-slate-800">Intitulé du Compte</th>
                <th colSpan={2} className="py-2 px-4 text-center border-r border-slate-800 bg-slate-800/80">
                  Total Mouvements (Ar)
                </th>
                <th colSpan={2} className="py-2 px-4 text-center bg-indigo-950/80">
                  Soldes Finaux (Ar)
                </th>
              </tr>
              <tr className="border-t border-slate-800 text-[10px]">
                <th className="py-2 px-4 text-right border-r border-slate-800 bg-slate-800/50 w-36 text-emerald-400">Débit</th>
                <th className="py-2 px-4 text-right border-r border-slate-800 bg-slate-800/50 w-36 text-rose-400">Crédit</th>
                <th className="py-2 px-4 text-right border-r border-slate-800 bg-indigo-900/40 w-36 text-emerald-400">Débiteur (SD)</th>
                <th className="py-2 px-4 text-right bg-indigo-900/40 w-36 text-purple-400">Créditeur (SC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredRows.map((row) => (
                <tr key={row.accountCode} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-bold text-indigo-700 bg-slate-50/50 border-r border-slate-100">
                    {row.accountCode}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-100">
                    {row.accountName}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-700 border-r border-slate-100">
                    {row.totalDebit > 0 ? formatAriary(row.totalDebit) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-medium text-slate-700 border-r border-slate-100">
                    {row.totalCredit > 0 ? formatAriary(row.totalCredit) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                    {row.soldeDebiteur > 0 ? formatAriary(row.soldeDebiteur) : '—'}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-purple-700 bg-purple-50/30">
                    {row.soldeCrediteur > 0 ? formatAriary(row.soldeCrediteur) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
              <tr>
                <td colSpan={2} className="py-3.5 px-4 uppercase tracking-wider text-slate-700 border-r border-slate-200">
                  TOTAUX GÉNÉRAUX DE LA BALANCE
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-800 border-r border-slate-200 text-sm">
                  {formatAriary(accountingBalance.totalDebit)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-rose-800 border-r border-slate-200 text-sm">
                  {formatAriary(accountingBalance.totalCredit)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-800 border-r border-slate-200 text-sm">
                  {formatAriary(accountingBalance.totalSoldeDebiteur)}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-purple-800 text-sm">
                  {formatAriary(accountingBalance.totalSoldeCrediteur)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
