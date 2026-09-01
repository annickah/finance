import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Calendar, DollarSign, Tag, Building2, Trash2, History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionCategory, TransactionType, TransactionStatus } from '../../types';
import { formatAriary } from '../../utils/formatters';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { accounts, projects, clients, updateTransaction, deleteTransaction, currentUserName } = useFinance();

  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState<number | ''>('');
  const [accountId, setAccountId] = useState<string>('');
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('PROJECT_VARIABLE');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('REALIZED');
  const [projectId, setProjectId] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount);
      setAccountId(transaction.accountId);
      setTargetAccountId(transaction.targetAccountId || '');
      setCategory(transaction.category);
      setDescription(transaction.description);
      setDate(transaction.date);
      setStatus(transaction.status || 'REALIZED');
      setProjectId(transaction.projectId || '');
      setClientId(transaction.clientId || '');
      setShowDeleteConfirm(false);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  // Compute live diff to show user what will be logged
  const originalAccountName = accounts.find((a) => a.id === transaction.accountId)?.name || transaction.accountId;
  const currentAccountName = accounts.find((a) => a.id === accountId)?.name || accountId;
  const originalProjName = transaction.projectName || '(Aucun)';
  const currentProjName = projects.find((p) => p.id === projectId)?.name || '(Aucun)';

  const pendingChanges: { label: string; oldVal: string; newVal: string }[] = [];

  if (Number(amount) !== transaction.amount) {
    pendingChanges.push({
      label: 'Montant',
      oldVal: formatAriary(transaction.amount),
      newVal: formatAriary(Number(amount)),
    });
  }
  if (type !== transaction.type) {
    pendingChanges.push({
      label: 'Type de flux',
      oldVal: transaction.type,
      newVal: type,
    });
  }
  if (accountId !== transaction.accountId) {
    pendingChanges.push({
      label: 'Compte',
      oldVal: originalAccountName,
      newVal: currentAccountName,
    });
  }
  if (description.trim() !== transaction.description) {
    pendingChanges.push({
      label: 'Libellé',
      oldVal: transaction.description,
      newVal: description.trim(),
    });
  }
  if (date !== transaction.date) {
    pendingChanges.push({
      label: 'Date',
      oldVal: transaction.date,
      newVal: date,
    });
  }
  if (category !== transaction.category) {
    pendingChanges.push({
      label: 'Catégorie',
      oldVal: transaction.category,
      newVal: category,
    });
  }
  if (status !== (transaction.status || 'REALIZED')) {
    pendingChanges.push({
      label: 'Statut',
      oldVal: transaction.status || 'REALIZED',
      newVal: status,
    });
  }
  if (projectId !== (transaction.projectId || '')) {
    pendingChanges.push({
      label: 'Projet',
      oldVal: originalProjName,
      newVal: currentProjName,
    });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || !accountId || !description.trim()) return;

    const selectedProj = projects.find((p) => p.id === projectId);
    const selectedCli = clients.find((c) => c.id === clientId);

    updateTransaction(transaction.id, {
      date,
      type,
      amount: Number(amount),
      accountId,
      targetAccountId: type === 'TRANSFER' ? targetAccountId || undefined : undefined,
      category,
      description: description.trim(),
      projectId: projectId || undefined,
      projectName: selectedProj?.name,
      clientId: clientId || undefined,
      clientName: selectedCli?.name,
      status,
    });

    onClose();
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                type === 'INCOME'
                  ? 'bg-emerald-100 text-emerald-700'
                  : type === 'EXPENSE'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {type === 'INCOME' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : type === 'EXPENSE' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <History className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Modifier la Transaction</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                  #{transaction.id.slice(-6)}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Toutes les modifications sont automatiquement consignées dans le journal d'audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Type Toggle */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategory('PROJECT_VARIABLE');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dépense (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategory('PROJECT_INVOICE');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recette (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('TRANSFER');
                setCategory('TRANSFER');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Virement (⇄)
            </button>
          </div>

          {/* Amount & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Montant en Ariary (Ar) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {type === 'TRANSFER' ? 'Compte Source (Débité) *' : 'Compte Bancaire / Caisse *'}
              </label>
              <select
                required
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.provider})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Account for Transfer */}
          {type === 'TRANSFER' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Compte Destinataire (Crédité) *
              </label>
              <select
                required
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Sélectionner le compte récepteur</option>
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.provider})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Libellé / Motif de la transaction *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex: Règlement facture client X..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Date, Category, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date de valeur *
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {type === 'INCOME' ? (
                  <>
                    <option value="PROJECT_INVOICE">Facture Projet</option>
                    <option value="CLIENT_DEPOSIT">Acompte Client</option>
                    <option value="INVESTMENT_IN">Apport / Investissement</option>
                    <option value="OTHER_INCOME">Autre Recette</option>
                  </>
                ) : type === 'EXPENSE' ? (
                  <>
                    <option value="PROJECT_VARIABLE">Coût Projet (Freelance/Tech)</option>
                    <option value="SALARY_COMMISSION">Salaire / Commission</option>
                    <option value="FIXED_CHARGE">Charge Fixe (Loyer/Net/Élec)</option>
                    <option value="TAX_LEGAL">Fiscalité & Banque</option>
                    <option value="OTHER_EXPENSE">Autre Dépense</option>
                  </>
                ) : (
                  <option value="TRANSFER">Virement Inter-Comptes</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full px-2.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="REALIZED">Exécuté / Réalisé</option>
                <option value="PENDING">En attente / Bloqué</option>
                <option value="SCHEDULED">Planifié / Prévu</option>
              </select>
            </div>
          </div>

          {/* Project & Client */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Projet rattaché (Optionnel)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">(Aucun projet)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Client rattaché (Optionnel)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">(Aucun client)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Diff Preview: What will be recorded in Audit Log */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-amber-600" />
                Journal d'Audit - Aperçu des modifications
              </span>
              <span className="text-[10px] font-bold text-amber-700">
                Opérateur : {currentUserName}
              </span>
            </div>

            {pendingChanges.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Aucune modification détectée par rapport à la transaction originale.
              </p>
            ) : (
              <div className="space-y-1.5 pt-1">
                {pendingChanges.map((chg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs bg-white/90 p-2 rounded-xl border border-amber-200/50"
                  >
                    <span className="font-bold text-slate-700">{chg.label} :</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-rose-700 line-through bg-rose-50 px-2 py-0.5 rounded-md">
                        {chg.oldVal}
                      </span>
                      <span className="text-slate-400">➔</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                        {chg.newVal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Confirmer la suppression de cette transaction ?
              </div>
              <p className="text-xs text-rose-700">
                Le solde du compte <strong>{originalAccountName}</strong> sera réajusté de{' '}
                <strong>{formatAriary(transaction.amount)}</strong> et cette action sera consignée dans l'audit.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Oui, supprimer définitivement
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Fermer
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
              >
                Enregistrer & Tracer dans l'Audit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
