import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { CostCategory } from '../../types';

interface AddCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (cost: { label: string; category: CostCategory; plannedAmount: number; realAmount: number }) => void;
}

export const AddCostModal: React.FC<AddCostModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<CostCategory>('DEV_COMMISSION');
  const [amount, setAmount] = useState<number | ''>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amount || Number(amount) <= 0) return;

    onAdd({
      label,
      category,
      plannedAmount: Number(amount),
      realAmount: Number(amount),
    });

    onClose();
    setLabel('');
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Ajouter une Ligne de Coût</h2>
              <p className="text-xs text-slate-500">Rattacher une dépense ou commission au projet</p>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Libellé du coût *
            </label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex: Hébergement AWS RDS, Commission Lead Dev..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catégorie de coût
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CostCategory)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
            >
              <option value="DEV_COMMISSION">Commission Développeurs</option>
              <option value="SALES_COMMISSION">Commission Commerciale</option>
              <option value="CLOUD">Cloud & Hébergement (AWS/Vercel)</option>
              <option value="HOSTING">Hébergement Dédié / VPS</option>
              <option value="DOMAIN">Nom de Domaine / SSL</option>
              <option value="API">Passerelles API & SMS (Twilio/MVola)</option>
              <option value="SUBCONTRACTING">Sous-traitance & Audits</option>
              <option value="TRAVEL">Frais de déplacement / Missions</option>
              <option value="HARDWARE">Matériel Électronique / IoT</option>
              <option value="OTHER">Autre Dépense Directe</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Montant en Ariary (Ar) *
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min="1"
                step="5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="ex: 1200000"
                className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">Ar</span>
            </div>
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors"
            >
              Enregistrer le Coût
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
