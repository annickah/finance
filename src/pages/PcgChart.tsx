import React, { useState } from 'react';
import { BookOpen, Search, Filter, Plus, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AccountClass } from '../types';

export const PcgChart: React.FC = () => {
  const { pcgAccounts, ledgerAccounts } = useFinance();
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const classDescriptions: Record<number, { title: string; subtitle: string; color: string; bg: string }> = {
    1: { title: 'Classe 1 : Comptes de Capitaux', subtitle: 'Capitaux propres, réserves, emprunts bancaires et dettes à long terme', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
    2: { title: 'Classe 2 : Comptes d’Immobilisations', subtitle: 'Actif immobilisé : matériels informatiques, serveurs, brevets, licences', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
    3: { title: 'Classe 3 : Comptes de Stocks', subtitle: 'Matières premières, composants IoT et progiciels packagés', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
    4: { title: 'Classe 4 : Comptes de Tiers', subtitle: 'Clients (créances 411), Fournisseurs (401), Personnel (421), État (445)', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    5: { title: 'Classe 5 : Comptes Financiers & Trésorerie', subtitle: 'Banques BNI/BMOI (512), MVola/Orange Money (514), Caisse (530)', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
    6: { title: 'Classe 6 : Comptes de Charges', subtitle: 'Achats, loyers, salaires, commissions dev, fibre, abonnements SaaS', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
    7: { title: 'Classe 7 : Comptes de Produits', subtitle: 'Prestations de développement web/mobile (706), ventes de progiciels (707)', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  };

  const filteredAccounts = pcgAccounts.filter((acc) => {
    const matchClass = selectedClass === 'ALL' || acc.classNum === selectedClass;
    const matchSearch =
      acc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (acc.description && acc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchClass && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full">
                  PCG 2005 / MADAGASCAR
                </span>
                <span className="text-xs font-semibold text-slate-500">• {pcgAccounts.length} Comptes actifs</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">Plan Comptable Général</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Nomenclature officielle des comptes de bilan (Classes 1 à 5) et de gestion (Classes 6 & 7) d'Eray Digital.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher code ou intitulé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium w-64"
              />
            </div>
          </div>
        </div>

        {/* Class Filter Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 custom-scrollbar">
          <button
            onClick={() => setSelectedClass('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedClass === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes les classes ({pcgAccounts.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((cls) => {
            const count = pcgAccounts.filter((a) => a.classNum === cls).length;
            const info = classDescriptions[cls];
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
      </div>

      {/* Class Explanatory Banner if filtered */}
      {selectedClass !== 'ALL' && classDescriptions[selectedClass as number] && (
        <div className={`p-4 rounded-2xl border ${classDescriptions[selectedClass as number].bg} flex items-center justify-between`}>
          <div>
            <h3 className={`text-sm font-extrabold ${classDescriptions[selectedClass as number].color}`}>
              {classDescriptions[selectedClass as number].title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {classDescriptions[selectedClass as number].subtitle}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-3 py-1 bg-white rounded-xl border border-slate-200">
            Classe {selectedClass}
          </span>
        </div>
      )}

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => {
          const ledger = ledgerAccounts.find((l) => l.accountCode === acc.code);
          const hasActivity = ledger && (ledger.totalDebit > 0 || ledger.totalCredit > 0);

          return (
            <div
              key={acc.code}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-black text-sm rounded-lg">
                      {acc.code}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Classe {acc.classNum}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                      acc.type === 'DEBIT_NORMAL'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {acc.type === 'DEBIT_NORMAL' ? 'Solde Débiteur' : 'Solde Créditeur'}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm mt-3 leading-snug">
                  {acc.name}
                </h3>
                {acc.description && (
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {acc.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Activité exercice :</span>
                {hasActivity ? (
                  <span className="font-mono font-bold text-indigo-600">
                    {ledger?.balanceType === 'SD' ? '+' : '-'} {ledger?.balanceAmount.toLocaleString()} Ar ({ledger?.balanceType})
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Aucun mouvement</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
