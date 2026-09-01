import React from 'react';
import { Landmark, Scale, CheckCircle2, AlertTriangle, ShieldCheck, Download, Printer } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';

export const PcgBilan: React.FC = () => {
  const { balanceSheet, incomeStatement } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 rounded-full">
                ÉTAT DU PATRIMOINE
              </span>
              <span className="text-xs font-semibold text-slate-500">• PCG 2005 / SYSCOHADA</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Le Bilan Comptable</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Photographie du patrimoine d'Eray Digital : Les Emplois (Actif) doivent être rigoureusement égaux aux Ressources (Passif).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
              balanceSheet.isBalanced
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {balanceSheet.isBalanced ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Total Actif = Total Passif ({formatAriary(balanceSheet.totalActif)})</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Écart d'équilibre : {formatAriary(Math.abs(balanceSheet.totalActif - balanceSheet.totalPassif))}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bilan Structure Layout: ACTIF (Gauche / Emplois) vs PASSIF (Droite / Ressources) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIF (EMPLOIS) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">ACTIF (Emplois du patrimoine)</h3>
                <span className="text-[10px] text-indigo-100 font-medium">Ce que possède l'entreprise Eray Digital</span>
              </div>
              <span className="font-mono font-black text-base">{formatAriary(balanceSheet.totalActif)}</span>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. Actif Immobilisé */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    1. Actif Immobilisé (Classe 2)
                  </h4>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {formatAriary(balanceSheet.totalActifImmobilise)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {balanceSheet.actifImmobilise.map((item) => (
                    <div key={item.code} className="flex items-center justify-between text-slate-700 py-1 hover:bg-slate-50 px-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 text-[11px]">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">{formatAriary(item.amount)}</span>
                    </div>
                  ))}
                  {balanceSheet.actifImmobilise.length === 0 && (
                    <span className="text-slate-400 italic text-xs block py-1">Néant</span>
                  )}
                </div>
              </div>

              {/* 2. Actif Circulant */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    2. Actif Circulant (Stocks & Créances Clients 411)
                  </h4>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {formatAriary(balanceSheet.totalActifCirculant)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {balanceSheet.actifCirculant.map((item) => (
                    <div key={item.code} className="flex items-center justify-between text-slate-700 py-1 hover:bg-slate-50 px-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 text-[11px]">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">{formatAriary(item.amount)}</span>
                    </div>
                  ))}
                  {balanceSheet.actifCirculant.length === 0 && (
                    <span className="text-slate-400 italic text-xs block py-1">Néant</span>
                  )}
                </div>
              </div>

              {/* 3. Trésorerie Actif */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    3. Trésorerie Actif (Banque 512, Mobile Money 514, Caisse 530)
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    {formatAriary(balanceSheet.totalTresorerieActif)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {balanceSheet.tresorerieActif.map((item) => (
                    <div key={item.code} className="flex items-center justify-between text-slate-700 py-1 hover:bg-slate-50 px-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 text-[11px]">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-emerald-700 font-bold">{formatAriary(item.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 border-t border-indigo-100 flex items-center justify-between text-xs font-black text-indigo-950">
            <span>TOTAL GÉNÉRAL DE L'ACTIF</span>
            <span className="font-mono text-base text-indigo-700">{formatAriary(balanceSheet.totalActif)}</span>
          </div>
        </div>

        {/* PASSIF (RESSOURCES) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="bg-purple-700 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">PASSIF (Ressources & Financement)</h3>
                <span className="text-[10px] text-purple-200 font-medium">Origine des fonds et obligations</span>
              </div>
              <span className="font-mono font-black text-base">{formatAriary(balanceSheet.totalPassif)}</span>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. Capitaux Propres */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    1. Capitaux Propres & Réserves (Classe 1)
                  </h4>
                  <span className="text-xs font-mono font-bold text-purple-700">
                    {formatAriary(balanceSheet.totalCapitauxPropres)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {balanceSheet.capitauxPropres.map((item) => (
                    <div key={item.code} className="flex items-center justify-between text-slate-700 py-1 hover:bg-slate-50 px-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 text-[11px]">{item.code}</span>
                        <span className={item.code === '120' ? 'font-bold text-emerald-700' : item.code === '129' ? 'font-bold text-rose-700' : ''}>
                          {item.name}
                        </span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">{formatAriary(item.amount)}</span>
                    </div>
                  ))}
                  {balanceSheet.capitauxPropres.length === 0 && (
                    <span className="text-slate-400 italic text-xs block py-1">Néant</span>
                  )}
                </div>
              </div>

              {/* 2. Dettes */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    2. Dettes (Emprunts 164, Fournisseurs 401, Salaires/Commissions 421, État 445)
                  </h4>
                  <span className="text-xs font-mono font-bold text-rose-600">
                    {formatAriary(balanceSheet.totalDettes)}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {balanceSheet.dettes.map((item) => (
                    <div key={item.code} className="flex items-center justify-between text-slate-700 py-1 hover:bg-slate-50 px-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-500 text-[11px]">{item.code}</span>
                        <span>{item.name}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-900">{formatAriary(item.amount)}</span>
                    </div>
                  ))}
                  {balanceSheet.dettes.length === 0 && (
                    <span className="text-slate-400 italic text-xs block py-1">Aucune dette</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 border-t border-purple-100 flex items-center justify-between text-xs font-black text-purple-950">
            <span>TOTAL GÉNÉRAL DU PASSIF</span>
            <span className="font-mono text-base text-purple-700">{formatAriary(balanceSheet.totalPassif)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
