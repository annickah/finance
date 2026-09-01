import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  ArrowRightLeft,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  CreditCard,
  Smartphone,
  Coins,
  CheckCircle,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Zap,
  Edit3,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType } from '../types';
import { formatAriary, formatDate } from '../utils/formatters';
import { EditTransactionModal } from '../components/modals/EditTransactionModal';

interface TreasuryProps {
  onOpenNewTx: () => void;
  onOpenTransfer: () => void;
}

export const Treasury: React.FC<TreasuryProps> = ({ onOpenNewTx, onOpenTransfer }) => {
  const { accounts, transactions, totalCashBalance } = useFinance();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesAccount =
      selectedAccountId === 'ALL' ||
      tx.accountId === selectedAccountId ||
      tx.targetAccountId === selectedAccountId;
    const matchesType = selectedType === 'ALL' || tx.type === selectedType;
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.projectName && tx.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.clientName && tx.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tx.date.includes(searchQuery);
    return matchesAccount && matchesType && matchesSearch;
  });

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return Landmark;
      case 'MOBILE_MONEY':
        return Smartphone;
      case 'CASH':
        return Coins;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5" />
              Multi-Comptes & Banques
            </span>
            <span className="text-xs font-semibold text-slate-400">Solde Global : {formatAriary(totalCashBalance)}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Trésorerie & Comptes
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Gestion consolidée des comptes bancaires, Mobile Money (MVola, Orange Money) et Caisse centrale en Ariary.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTransfer}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Virement Interne</span>
          </button>
          <button
            onClick={onOpenNewTx}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouveau Flux</span>
          </button>
        </div>
      </div>

      {/* Account Cards Grid with FinSet visual tokens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isSelected = selectedAccountId === acc.id;

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccountId(isSelected ? 'ALL' : acc.id)}
              className={`p-6 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                isSelected
                  ? 'bg-gradient-to-br from-[#0B0F19] to-[#1E293B] text-white border-slate-900 shadow-xl'
                  : 'bg-white text-slate-900 border-slate-200/80 hover:border-emerald-300 shadow-xs hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-3 rounded-2xl text-white shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-extrabold text-sm ${isSelected ? 'text-white' : 'text-slate-950'}`}>
                        {acc.name}
                      </h3>
                      <p className={`text-xs ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {acc.provider}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${
                      isSelected
                        ? 'bg-slate-800 text-emerald-400 border-slate-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {acc.type === 'MOBILE_MONEY' ? 'Mobile Money' : acc.type === 'BANK' ? 'Banque' : 'Caisse'}
                  </span>
                </div>

                <div className="mt-6">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    Solde Disponible
                  </span>
                  <div
                    className={`text-2xl font-black tracking-tight font-mono mt-1 ${
                      isSelected ? 'text-emerald-400' : 'text-slate-950'
                    }`}
                  >
                    {formatAriary(acc.balance)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/10 flex items-center justify-between text-[11px]">
                {acc.accountNumber ? (
                  <span className={`font-mono ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    N° {acc.accountNumber}
                  </span>
                ) : (
                  <span className={`font-medium ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    Caisse Siège Eray
                  </span>
                )}

                <span className={`font-bold ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {isSelected ? '✓ Filtré' : 'Cliquer pour filtrer'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions Ledger FinSet Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-slate-950">
              Journal des Flux de Trésorerie ({filteredTransactions.length})
            </h2>
            <p className="text-xs text-slate-400">
              Traçabilité exhaustive de tous les encaissements, décaissements et virements internes
            </p>
          </div>

          {/* FinSet Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrer libellé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Tous types</option>
              <option value="INCOME">Entrées (+)</option>
              <option value="EXPENSE">Sorties (-)</option>
              <option value="TRANSFER">Virements (↔)</option>
            </select>

            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Tous comptes</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Libellé / Contexte</th>
                <th className="py-3 px-3">Compte</th>
                <th className="py-3 px-3 text-right">Montant (Ar)</th>
                <th className="py-3 px-3 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => {
                const sourceAcc = accounts.find((a) => a.id === tx.accountId);
                const targetAcc = accounts.find((a) => a.id === tx.targetAccountId);

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {formatDate(tx.date, 'short')}
                    </td>
                    <td className="py-3.5 px-3">
                      {tx.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">
                          <ArrowDownRight className="w-3 h-3" />
                          ENTRÉE
                        </span>
                      ) : tx.type === 'EXPENSE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/60">
                          <ArrowUpRight className="w-3 h-3" />
                          SORTIE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/60">
                          <ArrowRightLeft className="w-3 h-3" />
                          VIREMENT
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900">{tx.description}</div>
                      {(tx.projectName || tx.clientName) && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tx.projectName ? `Projet : ${tx.projectName}` : ''}
                          {tx.clientName ? ` • Client : ${tx.clientName}` : ''}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-700">
                      {tx.type === 'TRANSFER' ? (
                        <span>
                          {sourceAcc?.name} → <span className="font-bold text-indigo-600">{targetAcc?.name}</span>
                        </span>
                      ) : (
                        <span>{sourceAcc?.name}</span>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-3 text-right font-mono font-black whitespace-nowrap text-sm ${
                        tx.type === 'INCOME'
                          ? 'text-emerald-600'
                          : tx.type === 'EXPENSE'
                          ? 'text-rose-600'
                          : 'text-indigo-600'
                      }`}
                    >
                      {tx.type === 'INCOME'
                        ? `+${formatAriary(tx.amount)}`
                        : tx.type === 'EXPENSE'
                        ? `-${formatAriary(tx.amount)}`
                        : `↔ ${formatAriary(tx.amount)}`}
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setEditingTx(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                        title="Modifier la transaction et tracer dans l'audit"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Éditer</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={Boolean(editingTx)}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
      />
    </div>
  );
};
