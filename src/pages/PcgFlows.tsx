import React from 'react';
import { ArrowRightLeft, DollarSign, Layers, ArrowDownLeft, ArrowUpRight, CheckCircle2, BookOpen } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';

export const PcgFlows: React.FC = () => {
  const { journalEntries, transactions } = useFinance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <ArrowRightLeft className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-cyan-100 text-cyan-800 rounded-full">
                THÉORIE & MODÉLISATION DES FLUX
              </span>
              <span className="text-xs font-semibold text-slate-500">• Analyse Ressource / Emploi</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Les Flux Économiques & Financiers</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compréhension des mouvements de valeurs au sein d'Eray Digital : Tout flux a une origine (Ressource = Crédit) et une destination (Emploi = Débit).
            </p>
          </div>
        </div>
      </div>

      {/* 2 Big Concepts Cards from Accounting Course */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Flux Réel vs Flux Financier */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Typologie des Flux</h3>
              <p className="text-xs text-slate-500">Nature des échanges avec les tiers</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> Flux Réels (Biens & Services)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mouvement de prestations de développement web/logiciel, de licences informatiques ou d'équipements livrés aux clients ou reçus des fournisseurs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Flux Financiers (Monnaie & Créances)
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mouvement de monnaie (Ariary via BNI, BMOI, MVola, Orange Money) ou de droits de créances/dettes en contrepartie des flux réels.
              </p>
            </div>
          </div>
        </div>

        {/* Ressource vs Emploi */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Mécanisme Fondamental</h3>
              <p className="text-xs text-slate-500">Point de départ vs Point d'arrivée</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4" /> Ressource (Point de départ)
                </span>
                <span className="px-2 py-0.5 bg-rose-200 text-rose-900 rounded font-mono font-bold text-[10px]">
                  CRÉDIT (C)
                </span>
              </div>
              <p className="text-xs text-rose-900/80 leading-relaxed">
                Le moyen qui permet de réaliser l'opération (Capital des associés, emprunt bancaire, vente de prestation de services 706, dette fournisseur 401).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDownLeft className="w-4 h-4" /> Emploi (Point d'arrivée)
                </span>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded font-mono font-bold text-[10px]">
                  DÉBIT (D)
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                L'utilisation qui est faite de la ressource (Acquisition de matériel informatique 2183, achat de fournitures 607, compte bancaire 512, créance client 411).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Concrete Example Table from Eray Digital */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">
          Exemples concrets d'application sur les opérations réelles d'Eray Digital
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Opération économique</th>
                <th className="py-3 px-4 text-rose-700 font-bold">Ressource (Crédit)</th>
                <th className="py-3 px-4 text-emerald-700 font-bold">Emploi (Débit)</th>
                <th className="py-3 px-4 text-right">Montant (Ar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold">1. Apport de capital initial par les fondateurs</td>
                <td className="py-3 px-4 text-rose-700 font-medium">101 - Capital social</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">512 - Compte Banque BNI</td>
                <td className="py-3 px-4 text-right font-mono font-bold">25 000 000 Ar</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold">2. Achat de serveurs informatiques et postes dev</td>
                <td className="py-3 px-4 text-rose-700 font-medium">512 - Compte Banque BNI</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">2183 - Matériel informatique</td>
                <td className="py-3 px-4 text-right font-mono font-bold">16 000 000 Ar</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold">3. Facturation développement projet Axian</td>
                <td className="py-3 px-4 text-rose-700 font-medium">706 - Prestations de services</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">411 - Créance Client Axian</td>
                <td className="py-3 px-4 text-right font-mono font-bold">18 000 000 Ar</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold">4. Règlement reçu sur compte bancaire</td>
                <td className="py-3 px-4 text-rose-700 font-medium">411 - Créance Client Axian</td>
                <td className="py-3 px-4 text-emerald-700 font-medium">512 - Compte Banque BNI</td>
                <td className="py-3 px-4 text-right font-mono font-bold">13 000 000 Ar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
