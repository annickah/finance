import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatAriary } from '../../utils/formatters';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewTransferModal: React.FC<NewTransferModalProps> = ({ isOpen, onClose }) => {
  const { accounts, addTransfer } = useFinance();

  const [fromAccountId, setFromAccountId] = useState<string>(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(accounts[2]?.id || accounts[1]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState<string>('');

  if (!isOpen) return null;

  const sourceAccount = accounts.find((a) => a.id === fromAccountId);
  const targetAccount = accounts.find((a) => a.id === toAccountId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || fromAccountId === toAccountId) return;

    addTransfer(
      fromAccountId,
      toAccountId,
      Number(amount),
      description || `Virement interne ${sourceAccount?.name} -> ${targetAccount?.name}`
    );

    onClose();
    setAmount('');
    setDescription('');
  };

  const isSameAccount = fromAccountId === toAccountId;
  const isInsufficient = sourceAccount && amount ? sourceAccount.balance < Number(amount) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Virement Inter-Comptes</h2>
              <p className="text-xs text-slate-500">Transfert de trésorerie interne (Neutre en P&L)</p>
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
          <div className="p-3 bg-violet-50/70 border border-violet-100 rounded-xl text-xs text-violet-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <span>
              Cette opération déplace les fonds entre vos comptes (ex: BNI vers MVola) sans impacter le chiffre d'affaires ni les charges de l'entreprise.
            </span>
          </div>

          {/* From Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Compte Source (Débit -) *
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white font-medium"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Solde: {formatAriary(acc.balance)}
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Compte Bénéficiaire (Crédit +) *
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white font-medium"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} disabled={acc.id === fromAccountId}>
                  {acc.name} — Solde: {formatAriary(acc.balance)} {acc.id === fromAccountId ? '(Source)' : ''}
                </option>
              ))}
            </select>
          </div>

          {isSameAccount && (
            <p className="text-xs text-rose-600 font-medium">
              Veuillez sélectionner deux comptes distincts.
            </p>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Montant du Virement en Ariary (Ar) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ex: 5000000"
                className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">Ar</span>
            </div>
            {isInsufficient && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                Attention : Le montant dépasse le solde actuel du compte source.
              </p>
            )}
          </div>

          {/* Description / Motif */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motif du virement (Optionnel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Alimentation flotte MVola pour prestataires"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
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
              disabled={isSameAccount || !amount || Number(amount) <= 0}
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
            >
              Exécuter le virement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
