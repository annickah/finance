import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  Printer,
  Calendar,
  DollarSign,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatDate } from '../utils/formatters';

export const MonthlyClosing: React.FC = () => {
  const { budgetPeriods, monthIncome, monthExpense, realizedTurnover, closeMonthlyBudget } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  // Checklist items
  const [checklist, setChecklist] = useState([
    { id: 1, label: 'Rapprochement bancaire complet (BNI, BMOI, MVola)', done: true },
    { id: 2, label: 'Enregistrement de toutes les factures clients du mois', done: true },
    { id: 3, label: 'Contrôle et validation des commissions de développement', done: true },
    { id: 4, label: 'Paiement et comptabilisation du loyer et charges locatives', done: true },
    { id: 5, label: 'Vérification de l’équilibre du Journal Comptable (Débit = Crédit)', done: true },
    { id: 6, label: 'Génération de la Balance Générale et du Compte de Résultat', done: false },
    { id: 7, label: 'Validation finale par la Direction Générale et gel des écritures', done: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const allCompleted = checklist.every((i) => i.done);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              Gouvernance & Clôture d'Exercice
            </span>
            <span className="text-xs font-semibold text-slate-400">Période : Août 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Clôture Mensuelle
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Protocole de clôture financière et comptable : vérification des écritures, rapprochements, équilibre de la balance et verrouillage de la période.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={!allCompleted}
            onClick={() => closeMonthlyBudget('2026-08', 50000000, 15000000)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
              allCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Verrouiller & Clôturer le Mois</span>
          </button>
        </div>
      </div>

      {/* 3 Status KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Chiffre d'Affaires du Mois
          </span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1">
            {formatAriary(realizedTurnover)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Facturation totale validée</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Résultat Net d'Exploitation
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            +{formatAriary(monthIncome - monthExpense)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Solde bénéficiaire positif</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Statut de Clôture
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {checklist.filter((i) => i.done).length} / {checklist.length} Validées
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">En cours de finalisation</span>
        </div>
      </div>

      {/* Checklist Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Checklist de Contrôle Comptable & Légal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cochez les points vérifiés avant le gel définitif des journaux
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
            Normes PCG 2005
          </span>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                item.done
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    item.done ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}
                >
                  {item.done && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold">{item.label}</span>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                  item.done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {item.done ? 'CONFORME' : 'À TRAITER'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Closings */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm">
          Historique des Périodes Précédentes Clôturées
        </h3>
        <div className="divide-y divide-slate-100">
          {budgetPeriods.map((period) => (
            <div key={period.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-900">{period.month}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-500 font-mono">CA : {formatAriary(period.targetRevenue)}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold text-[10px]">
                  {period.isClosed ? 'ARCHIVÉ & GÉLÉ' : 'OUVERT'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
