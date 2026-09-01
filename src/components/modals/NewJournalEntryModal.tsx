import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Scale } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatAriary } from '../../utils/formatters';

interface NewJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewJournalEntryModal: React.FC<NewJournalEntryModalProps> = ({ isOpen, onClose }) => {
  const { pcgAccounts, addJournalEntry } = useFinance();

  const [date, setDate] = useState('2026-08-26');
  const [pieceRef, setPieceRef] = useState('');
  const [label, setLabel] = useState('');
  const [journalType, setJournalType] = useState<'ACHATS' | 'VENTES' | 'BANQUE' | 'CAISSE' | 'OPERATIONS_DIVERSES'>('OPERATIONS_DIVERSES');

  const [lines, setLines] = useState<Array<{ id: string; accountCode: string; accountName: string; debit: number; credit: number }>>([
    { id: '1', accountCode: '512', accountName: 'Banque (BNI / BMOI Madagascar)', debit: 0, credit: 0 },
    { id: '2', accountCode: '706', accountName: 'Prestations de services (Développement web, mobile, SaaS)', debit: 0, credit: 0 },
  ]);

  if (!isOpen) return null;

  const handleAccountChange = (index: number, code: string) => {
    const found = pcgAccounts.find((a) => a.code === code);
    setLines((prev) => {
      const copy = [...prev];
      copy[index].accountCode = code;
      copy[index].accountName = found ? found.name : '';
      return copy;
    });
  };

  const handleLineValueChange = (index: number, field: 'debit' | 'credit', value: string) => {
    const num = parseFloat(value) || 0;
    setLines((prev) => {
      const copy = [...prev];
      copy[index][field] = num;
      if (field === 'debit' && num > 0) copy[index].credit = 0;
      if (field === 'credit' && num > 0) copy[index].debit = 0;
      return copy;
    });
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        accountCode: pcgAccounts[0]?.code || '512',
        accountName: pcgAccounts[0]?.name || '',
        debit: 0,
        credit: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || !label.trim()) return;

    addJournalEntry({
      date,
      pieceRef: pieceRef || 'OD-MANUELLE',
      label,
      journalType,
      lines: lines.map((l) => ({
        id: l.id,
        accountCode: l.accountCode,
        accountName: l.accountName,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nouvelle Écriture Comptable (PCG)</h2>
              <p className="text-xs text-indigo-100">Enregistrement en partie double avec équilibre Débit = Crédit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date de l'opération
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Type de Journal
              </label>
              <select
                value={journalType}
                onChange={(e) => setJournalType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="VENTES">Journal des Ventes</option>
                <option value="ACHATS">Journal des Achats</option>
                <option value="BANQUE">Journal de Banque</option>
                <option value="CAISSE">Journal de Caisse</option>
                <option value="OPERATIONS_DIVERSES">Opérations Diverses (OD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                N° de Pièce / Justificatif
              </label>
              <input
                type="text"
                placeholder="Ex: FAC-2026-042, VIR-BNI"
                value={pieceRef}
                onChange={(e) => setPieceRef(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Libellé de l'Écriture
            </label>
            <input
              type="text"
              placeholder="Ex: Facturation prestation développement pour Groupe Axian"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Lines Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Lignes d'imputation comptable
              </span>
              <button
                type="button"
                onClick={addLine}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une ligne</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Compte PCG</th>
                    <th className="py-2.5 px-3">Intitulé</th>
                    <th className="py-2.5 px-3 text-right w-36">Débit (Ar)</th>
                    <th className="py-2.5 px-3 text-right w-36">Crédit (Ar)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50/70">
                      <td className="py-2 px-3">
                        <select
                          value={line.accountCode}
                          onChange={(e) => handleAccountChange(idx, e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-indigo-700 focus:bg-white"
                        >
                          {pcgAccounts.map((acc) => (
                            <option key={acc.code} value={acc.code}>
                              {acc.code} - {acc.name.substring(0, 32)}...
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-slate-700 font-medium">
                        {line.accountName || pcgAccounts.find((a) => a.code === line.accountCode)?.name}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="0"
                          value={line.debit || ''}
                          onChange={(e) => handleLineValueChange(idx, 'debit', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-right font-mono font-semibold text-emerald-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          placeholder="0"
                          value={line.credit || ''}
                          onChange={(e) => handleLineValueChange(idx, 'credit', e.target.value)}
                          className="w-full px-2.5 py-1.5 text-right font-mono font-semibold text-rose-700 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          disabled={lines.length <= 2}
                          className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-slate-700">
                      Totaux de l'écriture
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-700 text-sm">
                      {formatAriary(totalDebit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-700 text-sm">
                      {formatAriary(totalCredit)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Balance Status indicator */}
            <div
              className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
                isBalanced
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>
                  {isBalanced
                    ? 'Écriture parfaitement équilibrée (Débit = Crédit).'
                    : `Écriture déséquilibrée : écart de ${formatAriary(Math.abs(totalDebit - totalCredit))}. Le débit doit être égal au crédit.`}
                </span>
              </div>
              <span className="font-mono font-bold">
                Écart: {formatAriary(Math.abs(totalDebit - totalCredit))}
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!isBalanced || !label.trim()}
              className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider l'Écriture Comptable</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
