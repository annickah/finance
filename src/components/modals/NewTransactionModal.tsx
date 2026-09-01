import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, DollarSign, Tag, Building2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionCategory, TransactionType } from '../../types';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({ isOpen, onClose }) => {
  const { accounts, projects, clients, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<number | ''>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [category, setCategory] = useState<TransactionCategory>('PROJECT_VARIABLE');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [projectId, setProjectId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !accountId || !description) return;

    const selectedProj = projects.find((p) => p.id === projectId);
    const selectedCli = clients.find((c) => c.id === clientId);

    addTransaction({
      date,
      type,
      amount: Number(amount),
      accountId,
      category,
      description,
      projectId: projectId || undefined,
      projectName: selectedProj?.name,
      clientId: clientId || undefined,
      clientName: selectedCli?.name,
      status: 'REALIZED',
    });

    onClose();
    // Reset
    setAmount('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${type === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {type === 'INCOME' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Nouveau Mouvement de Trésorerie</h2>
              <p className="text-xs text-slate-500">Enregistrer une entrée ou sortie réelle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategory('PROJECT_VARIABLE');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sortie / Dépense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategory('PROJECT_INVOICE');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrée / Encaissement (+)
            </button>
          </div>

          {/* Amount & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Montant en Ariary (Ar) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="ex: 1500000"
                  className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">Ar</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compte concerné *
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.balance.toLocaleString()} Ar)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Libellé / Description *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Acompte projet Ravinala ou Achat serveurs..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie comptable
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                {type === 'INCOME' ? (
                  <>
                    <option value="PROJECT_INVOICE">Encaissement Facture Client</option>
                    <option value="EXCEPTIONAL">Rentrée Exceptionnelle / Apport</option>
                  </>
                ) : (
                  <>
                    <option value="PROJECT_VARIABLE">Charge Variable Projet</option>
                    <option value="COMMISSION">Commission Devs / Commercial</option>
                    <option value="SALARY">Salaires fixes</option>
                    <option value="SERVER_CLOUD">Hébergement & Cloud (AWS/Vercel)</option>
                    <option value="OFFICE_RENT">Loyer bureaux & Connexion</option>
                    <option value="MARKETING">Marketing & Publicité</option>
                    <option value="TAX">Impôts & Taxes (NIF/STAT/IRSA)</option>
                    <option value="RECURRING_FIXED">Autre Charge Fixe</option>
                    <option value="EXCEPTIONAL">Dépense Exceptionnelle</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de l'opération
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Optional link to Project */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rattacher à un Projet (Optionnel)
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
            >
              <option value="">-- Aucun projet rattaché --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name} ({p.clientName})
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm transition-colors ${
                type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Valider l'opération
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
