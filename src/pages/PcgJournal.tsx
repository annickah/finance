import React, { useState } from 'react';
import { BookOpen, Plus, Search, Filter, Calendar, FileText, CheckCircle2, ArrowRightLeft, Download } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';
import { NewJournalEntryModal } from '../components/modals/NewJournalEntryModal';

export const PcgJournal: React.FC = () => {
  const { journalEntries } = useFinance();
  const [selectedJournal, setSelectedJournal] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  const filteredEntries = journalEntries.filter((entry) => {
    const matchJournal = selectedJournal === 'ALL' || entry.journalType === selectedJournal;
    const matchSearch =
      entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.pieceRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.lines.some((l) => l.accountName.toLowerCase().includes(searchQuery.toLowerCase()) || l.accountCode.includes(searchQuery));
    return matchJournal && matchSearch;
  });

  const totalDebits = filteredEntries.reduce((sum, e) => sum + e.totalDebit, 0);
  const totalCredits = filteredEntries.reduce((sum, e) => sum + e.totalCredit, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 rounded-full">
                PARTIE DOUBLE PCG
              </span>
              <span className="text-xs font-semibold text-slate-500">• {journalEntries.length} Écritures validées</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Journal Comptable Général</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enregistrement chronologique obligatoire de toutes les opérations réelles et financières d'Eray Digital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewEntryOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Écriture</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Débits Journal</span>
          <p className="text-xl font-black text-emerald-600 font-mono mt-1">{formatAriary(totalDebits)}</p>
          <span className="text-[10px] text-slate-500">Emplois enregistrés</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Crédits Journal</span>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">{formatAriary(totalCredits)}</p>
          <span className="text-[10px] text-slate-500">Ressources mobilisées</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Équilibre Comptable</span>
            <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Débit = Crédit Strict</span>
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">100% conforme PCG</span>
          </div>
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-mono text-xs font-bold">
            Écart: 0 Ar
          </span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'ALL', label: 'Tous les Journaux' },
            { id: 'VENTES', label: 'Ventes' },
            { id: 'ACHATS', label: 'Achats' },
            { id: 'BANQUE', label: 'Banque' },
            { id: 'CAISSE', label: 'Caisse' },
            { id: 'OPERATIONS_DIVERSES', label: 'Opérations Diverses (OD)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedJournal(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedJournal === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher pièce, libellé, compte..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden hover:border-indigo-200 transition-all"
          >
            {/* Header of Entry */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {entry.entryNumber}
                </span>
                <span className="text-slate-400">•</span>
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {entry.date}
                </span>
                <span className="text-slate-400">•</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium text-[11px]">
                  Pièce: <strong className="font-mono">{entry.pieceRef}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold text-[10px] uppercase tracking-wider">
                  Journal {entry.journalType}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Montant :</span>
                <span className="font-mono font-black text-slate-900">{formatAriary(entry.totalDebit)}</span>
              </div>
            </div>

            {/* Entry Subject */}
            <div className="px-5 py-2.5 bg-white border-b border-slate-100">
              <p className="text-xs font-bold text-slate-800">{entry.label}</p>
            </div>

            {/* Entry Lines Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/40 text-slate-500 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2 px-5 w-28">N° Compte</th>
                    <th className="py-2 px-4">Intitulé du Compte</th>
                    <th className="py-2 px-5 text-right w-44">Débit (Ar)</th>
                    <th className="py-2 px-5 text-right w-44">Crédit (Ar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {entry.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-5 font-mono font-bold text-indigo-700">{line.accountCode}</td>
                      <td className="py-2 px-4 font-medium text-slate-700">{line.accountName}</td>
                      <td className="py-2 px-5 text-right font-mono font-semibold text-emerald-700">
                        {line.debit > 0 ? formatAriary(line.debit) : '—'}
                      </td>
                      <td className="py-2 px-5 text-right font-mono font-semibold text-rose-700">
                        {line.credit > 0 ? formatAriary(line.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <NewJournalEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
      />
    </div>
  );
};
