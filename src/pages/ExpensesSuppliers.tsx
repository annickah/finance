import React, { useState } from 'react';
import {
  Receipt,
  Building,
  Server,
  Plus,
  CheckCircle2,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  Briefcase,
  Users,
  Search,
  ArrowRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatDate } from '../utils/formatters';
import { FixedExpense, Supplier } from '../types';

export const ExpensesSuppliers: React.FC = () => {
  const {
    fixedExpenses,
    suppliers,
    accounts,
    projects,
    addFixedExpense,
    payFixedExpense,
    paySupplierInvoice,
    currentUserRole,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'FIXED' | 'SUPPLIERS' | 'PROJECT_COSTS'>('FIXED');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpenseToPay, setSelectedExpenseToPay] = useState<FixedExpense | null>(null);
  const [selectedSupplierToPay, setSelectedSupplierToPay] = useState<Supplier | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || '');
  const [supplierPayAmount, setSupplierPayAmount] = useState<number>(0);
  const [supplierPayDesc, setSupplierPayDesc] = useState('');

  // New Fixed Expense Form state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpLabel, setNewExpLabel] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<FixedExpense['category']>('RENT');
  const [newExpAmount, setNewExpAmount] = useState<number>(500000);
  const [newExpDueDay, setNewExpDueDay] = useState<number>(5);
  const [newExpAssignedTo, setNewExpAssignedTo] = useState('Direction');

  const totalMonthlyFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSupplierDebts = suppliers.reduce((sum, s) => sum + s.balanceDue, 0);

  // All project real costs
  const allProjectCosts = projects.flatMap((p) =>
    p.realCosts.map((c) => ({
      ...c,
      projectId: p.id,
      projectName: p.name,
      projectCode: p.code,
    }))
  );

  const totalProjectCosts = allProjectCosts.reduce((sum, c) => sum + (c.realAmount || c.plannedAmount), 0);

  const handleConfirmPayExpense = () => {
    if (!selectedExpenseToPay || !selectedAccountId) return;
    payFixedExpense(selectedExpenseToPay.id, selectedAccountId);
    setSelectedExpenseToPay(null);
  };

  const handleConfirmPaySupplier = () => {
    if (!selectedSupplierToPay || !selectedAccountId || supplierPayAmount <= 0) return;
    paySupplierInvoice(selectedSupplierToPay.id, supplierPayAmount, selectedAccountId, supplierPayDesc);
    setSelectedSupplierToPay(null);
  };

  const handleCreateFixedExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpLabel || newExpAmount <= 0) return;
    addFixedExpense({
      label: newExpLabel,
      category: newExpCategory,
      amount: newExpAmount,
      frequency: 'MONTHLY',
      dueDay: newExpDueDay,
      assignedTo: newExpAssignedTo,
      paymentAccountId: accounts[0]?.id || 'acc-bni',
      autoGenerateNextDue: true,
      status: 'ACTIVE',
    });
    setIsAddExpenseOpen(false);
    setNewExpLabel('');
    setNewExpAmount(500000);
  };

  const getCategoryLabel = (cat: FixedExpense['category']) => {
    switch (cat) {
      case 'RENT': return 'Loyer Bureaux';
      case 'WIFI': return 'Fibre & Internet';
      case 'ELECTRICITY': return 'Électricité & Eau';
      case 'SALARIES': return 'Salaires Fixes';
      case 'PHONE': return 'Téléphonie';
      case 'SAAS': return 'Outils & SaaS';
      case 'SERVERS': return 'Serveurs / Cloud';
      case 'ACCOUNTING': return 'Expertise Comptable';
      case 'TRANSPORT': return 'Transport & Déplacement';
      case 'SUPPLIES': return 'Fournitures';
      case 'MARKETING': return 'Marketing & Pub';
      default: return cat;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner & Quick Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Receipt className="w-7 h-7 text-rose-400" />
            Charges & Fournisseurs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pilotage des charges fixes, coûts variables projets et dettes prestataires d'Eray Digital
          </p>
        </div>

        <div className="flex items-center gap-3">
          {currentUserRole !== 'READONLY' && (
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle Charge Fixe</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Charges Fixes / Mois</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-3">
            {formatAriary(totalMonthlyFixed)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fixedExpenses.length} abonnements et contrats récurrents actifs
          </div>
        </div>

        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Dettes Fournisseurs Dues</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-3">
            {formatAriary(totalSupplierDebts)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            AWS, Vercel, OVH, Développeurs externes
          </div>
        </div>

        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Coûts Réels Engagés Projets</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-400 font-mono mt-3">
            {formatAriary(totalProjectCosts)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Ventilés sur {projects.length} projets actifs
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('FIXED')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'FIXED'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Charges Fixes Récurrentes ({fixedExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'SUPPLIERS'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Fournisseurs & Prestataires ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROJECT_COSTS')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'PROJECT_COSTS'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Coûts Directs Projets ({allProjectCosts.length})</span>
        </button>
      </div>

      {/* TAB 1: Fixed Recurring Expenses */}
      {activeTab === 'FIXED' && (
        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-base font-bold text-white">Échéancier des Charges Fixes</h2>
              <p className="text-xs text-slate-400">
                Paiements mensuels automatiques ou manuels pour le fonctionnement d'Eray Digital
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Libellé & Catégorie</th>
                  <th className="py-3 px-4">Jour d'Échéance</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4 text-right">Montant Mensuel</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fixedExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{exp.label}</div>
                      <div className="text-[11px] text-emerald-400 font-medium">{getCategoryLabel(exp.category)}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      Chaque {exp.dueDay} du mois
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {exp.assignedTo}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {formatAriary(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20">
                        ACTIF
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {currentUserRole !== 'READONLY' && (
                        <button
                          onClick={() => setSelectedExpenseToPay(exp)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Payer ce mois
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Suppliers & Providers */}
      {activeTab === 'SUPPLIERS' && (
        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-base font-bold text-white">Répertoire des Fournisseurs & Prestataires</h2>
              <p className="text-xs text-slate-400">
                Suivi des factures hébergeurs (AWS, Vercel), licences SaaS et développeurs externes
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border border-indigo-500/20">
                      {sup.category}
                    </span>
                    <h3 className="text-base font-extrabold text-white mt-1.5">{sup.name}</h3>
                    <p className="text-xs text-slate-400">{sup.contact} • {sup.email}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Reste à payer</span>
                    <span className={`text-base font-black font-mono ${sup.balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatAriary(sup.balanceDue)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Total Facturé :</span>
                    <span className="font-mono font-bold text-slate-300">{formatAriary(sup.totalBilled)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Déjà Réglé :</span>
                    <span className="font-mono font-bold text-emerald-400">{formatAriary(sup.totalPaid)}</span>
                  </div>
                </div>

                {sup.balanceDue > 0 && currentUserRole !== 'READONLY' && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedSupplierToPay(sup);
                        setSupplierPayAmount(sup.balanceDue);
                        setSupplierPayDesc(`Règlement facture ${sup.name}`);
                      }}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Enregistrer un Décaissement
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Project Direct Costs */}
      {activeTab === 'PROJECT_COSTS' && (
        <div className="bg-[#111625] border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-base font-bold text-white">Coûts Variables Directs par Projet</h2>
              <p className="text-xs text-slate-400">
                Commissions développeurs, noms de domaine, API et déplacements rattachés aux projets clients
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Projet</th>
                  <th className="py-3 px-4">Libellé Coût</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4 text-right">Montant Réel</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {allProjectCosts.map((c) => (
                  <tr key={`${c.projectId}-${c.id}`} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div>{c.projectName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.projectCode}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {c.label}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                      {formatAriary(c.realAmount || c.plannedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isPaid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {c.isPaid ? 'PAYÉ' : 'À PAYER'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Fixed Expense Modal */}
      {selectedExpenseToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-[#111625] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5">
            <h3 className="text-lg font-bold text-white">Règlement Charge Fixe</h3>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-sm font-bold text-white">{selectedExpenseToPay.label}</div>
              <div className="text-xs text-slate-400">{getCategoryLabel(selectedExpenseToPay.category)}</div>
              <div className="text-xl font-black text-rose-400 font-mono pt-2">
                {formatAriary(selectedExpenseToPay.amount)}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">
                Compte Source de Débit
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — {formatAriary(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedExpenseToPay(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPayExpense}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Confirmer Paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {selectedSupplierToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-[#111625] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5">
            <h3 className="text-lg font-bold text-white">Décaissement Fournisseur</h3>
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1">
              <div className="text-sm font-bold text-white">{selectedSupplierToPay.name}</div>
              <div className="text-xs text-slate-400">Reste dû : {formatAriary(selectedSupplierToPay.balanceDue)}</div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Montant à Payer (Ar)</label>
              <input
                type="number"
                value={supplierPayAmount}
                onChange={(e) => setSupplierPayAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Compte de Paiement</label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — {formatAriary(acc.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Description / Motif</label>
              <input
                type="text"
                value={supplierPayDesc}
                onChange={(e) => setSupplierPayDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedSupplierToPay(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPaySupplier}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Enregistrer Décaissement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Fixed Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateFixedExpense} className="bg-[#111625] border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Ajouter une Charge Récurrente</h3>
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Libellé</label>
              <input
                type="text"
                required
                placeholder="Ex: Loyer Antanimena, Abonnement JetBrains..."
                value={newExpLabel}
                onChange={(e) => setNewExpLabel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Catégorie</label>
                <select
                  value={newExpCategory}
                  onChange={(e) => setNewExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="RENT">Loyer</option>
                  <option value="WIFI">Internet / Wifi</option>
                  <option value="ELECTRICITY">Électricité</option>
                  <option value="SALARIES">Salaires Fixes</option>
                  <option value="SAAS">SaaS & Logiciels</option>
                  <option value="SERVERS">Serveurs</option>
                  <option value="ACCOUNTING">Comptabilité</option>
                  <option value="TRANSPORT">Transport</option>
                  <option value="MARKETING">Marketing</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Jour d'Échéance (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newExpDueDay}
                  onChange={(e) => setNewExpDueDay(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Montant Mensuel (Ar)</label>
              <input
                type="number"
                required
                min="0"
                step="10000"
                value={newExpAmount}
                onChange={(e) => setNewExpAmount(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Responsable</label>
              <input
                type="text"
                value={newExpAssignedTo}
                onChange={(e) => setNewExpAssignedTo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Créer la Charge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
