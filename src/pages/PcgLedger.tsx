import React, { useState } from 'react';
import { Columns3, Search, Filter, ArrowUpRight, ArrowDownLeft, BookOpen, Layers } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';

export const PcgLedger: React.FC = () => {
  const { ledgerAccounts, pcgAccounts } = useFinance();
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyActive, setOnlyActive] = useState(true);

  const filteredAccounts = ledgerAccounts.filter((la) => {
    const matchClass = selectedClass === 'ALL' || la.classNum === selectedClass;
    const matchSearch =
      la.accountCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      la.accountName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchActive = !onlyActive || (la.totalDebit > 0 || la.totalCredit > 0);
    return matchClass && matchSearch && matchActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Columns3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full">
                COMPTES EN T
              </span>
              <span className="text-xs font-semibold text-slate-500">• {filteredAccounts.length} Comptes présentés</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Le Grand Livre des Comptes</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisation en schémas en « T » avec enregistrement à gauche (Débit) et à droite (Crédit), et calcul des Soldes (SD / SC).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={onlyActive}
              onChange={(e) => setOnlyActive(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Comptes mouvementés uniquement</span>
          </label>
        </div>
      </div>

      {/* Class filter & Search */}
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
            Toutes les classes
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedClass === cls
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Classe {cls}
            </button>
          ))}
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

      {/* T-Accounts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAccounts.map((account) => {
          const maxRows = Math.max(account.debits.length, account.credits.length, 1);

          return (
            <div
              key={account.accountCode}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              {/* Compte en T Header */}
              <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 rounded-lg font-mono font-black text-sm">
                    {account.accountCode}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm tracking-tight text-white">{account.accountName}</h3>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Classe {account.classNum}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                      account.balanceType === 'SD'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : account.balanceType === 'SC'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {account.balanceType === 'SD'
                      ? `Solde Débiteur (SD): ${formatAriary(account.balanceAmount)}`
                      : account.balanceType === 'SC'
                      ? `Solde Créditeur (SC): ${formatAriary(account.balanceAmount)}`
                      : 'Solde Nul'}
                  </span>
                </div>
              </div>

              {/* Compte en T Schema Body */}
              <div className="grid grid-cols-2 border-b border-slate-200 flex-1 min-h-[160px]">
                {/* Left Side: DÉBIT */}
                <div className="border-r border-slate-200 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
                      <span>Débit (D) — Emplois</span>
                      <span>Ar</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {account.debits.map((d, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 text-slate-700 hover:bg-slate-50 p-1 rounded">
                          <div className="truncate">
                            <span className="text-[10px] text-slate-400 block font-mono">{d.date} • {d.pieceRef}</span>
                            <span className="font-medium text-slate-800 text-[11px] truncate block">{d.label}</span>
                          </div>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            {formatAriary(d.amount)}
                          </span>
                        </div>
                      ))}
                      {account.debits.length === 0 && (
                        <div className="text-slate-400 italic text-[11px] text-center py-4">Aucun débit</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: CRÉDIT */}
                <div className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-rose-700 font-extrabold text-xs uppercase tracking-wider">
                      <span>Crédit (C) — Ressources</span>
                      <span>Ar</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {account.credits.map((c, i) => (
                        <div key={i} className="flex items-start justify-between gap-2 text-slate-700 hover:bg-slate-50 p-1 rounded">
                          <div className="truncate">
                            <span className="text-[10px] text-slate-400 block font-mono">{c.date} • {c.pieceRef}</span>
                            <span className="font-medium text-slate-800 text-[11px] truncate block">{c.label}</span>
                          </div>
                          <span className="font-mono font-bold text-rose-700 shrink-0">
                            {formatAriary(c.amount)}
                          </span>
                        </div>
                      ))}
                      {account.credits.length === 0 && (
                        <div className="text-slate-400 italic text-[11px] text-center py-4">Aucun crédit</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compte en T Footer: Totaux & Solde */}
              <div className="grid grid-cols-2 bg-slate-50 text-xs font-bold">
                <div className="border-r border-slate-200 px-4 py-2.5 flex items-center justify-between text-emerald-800">
                  <span>Total Débit :</span>
                  <span className="font-mono">{formatAriary(account.totalDebit)}</span>
                </div>
                <div className="px-4 py-2.5 flex items-center justify-between text-rose-800">
                  <span>Total Crédit :</span>
                  <span className="font-mono">{formatAriary(account.totalCredit)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
