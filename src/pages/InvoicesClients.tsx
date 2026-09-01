import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  CreditCard,
  Send,
  X,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Invoice, InvoiceStatus } from '../types';
import { formatAriary, formatDate } from '../utils/formatters';
import { InvoicePreviewModal } from '../components/modals/InvoicePreviewModal';

interface InvoicesClientsProps {
  onOpenNewInvoice: () => void;
}

export const InvoicesClients: React.FC<InvoicesClientsProps> = ({ onOpenNewInvoice }) => {
  const { invoices, clients, recordInvoicePayment, accounts } = useFinance();
  const [activeTab, setActiveTab] = useState<'INVOICES' | 'CLIENTS'>('INVOICES');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Payment Quick Modal State
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientCompany.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenPreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleOpenPayModal = (invoice: Invoice) => {
    setPayModalInvoice(invoice);
    setPayAmount(invoice.balanceDue);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice || !payAmount || Number(payAmount) <= 0) return;

    recordInvoicePayment(payModalInvoice.id, Number(payAmount), payAccountId);
    setPayModalInvoice(null);
  };

  // Portfolio Totals
  const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalCollected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalBalanceDue = invoices.reduce((s, i) => s + i.balanceDue, 0);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" />
              Facturation & Recouvrement
            </span>
            <span className="text-xs font-semibold text-slate-400">{invoices.length} factures enregistrées</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Facturation & CRM Clients
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Émission des factures clients, suivi des créances, délais de paiement et encaissement direct en trésorerie.
          </p>
        </div>

        <button
          onClick={onOpenNewInvoice}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Émettre une Facture</span>
        </button>
      </div>

      {/* FinSet Summary KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Volume Total Facturé</span>
          <div className="text-xl font-black text-slate-950 font-mono mt-1.5">
            {formatAriary(totalInvoiced)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Encaissé Réel</span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1.5">
            {formatAriary(totalCollected)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Créances en Attente</span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1.5">
            {formatAriary(totalBalanceDue)}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Factures vs Clients */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'INVOICES'
              ? 'bg-slate-950 text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          Factures & Règlements ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('CLIENTS')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'CLIENTS'
              ? 'bg-slate-950 text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
          }`}
        >
          Portefeuille Clients ({clients.length})
        </button>
      </div>

      {activeTab === 'INVOICES' ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher facture, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="SENT">Émise / En attente</option>
              <option value="OVERDUE">En retard de paiement</option>
              <option value="PAID">Payée intégralement</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-3">Numéro</th>
                  <th className="py-3 px-3">Client & Projet</th>
                  <th className="py-3 px-3">Émission / Échéance</th>
                  <th className="py-3 px-3 text-right">Total Net</th>
                  <th className="py-3 px-3 text-right">Solde Dû</th>
                  <th className="py-3 px-3 text-center w-28">Statut</th>
                  <th className="py-3 px-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-extrabold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-extrabold text-slate-900">{inv.clientCompany}</div>
                      <div className="text-[11px] text-slate-400">{inv.projectName || inv.clientName}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <div>{formatDate(inv.issueDate, 'short')}</div>
                      <div className="text-[10px] text-slate-400">Éch : {formatDate(inv.dueDate, 'short')}</div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">
                      {formatAriary(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-rose-600">
                      {formatAriary(inv.balanceDue)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {inv.status === 'PAID'
                          ? 'PAYÉE'
                          : inv.status === 'OVERDUE'
                          ? 'EN RETARD'
                          : 'EN ATTENTE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center space-x-1.5">
                      <button
                        onClick={() => handleOpenPreview(inv)}
                        title="Aperçu Facture / Imprimer"
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => handleOpenPayModal(inv)}
                          title="Enregistrer un encaissement"
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Clients CRM Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((cli) => (
            <div
              key={cli.id}
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-950">{cli.company}</h3>
                    <p className="text-xs text-slate-400">{cli.name}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      cli.outstandingBalance === 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : cli.overdueDays > 0
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {cli.outstandingBalance === 0
                      ? 'À JOUR'
                      : cli.overdueDays > 0
                      ? `${cli.overdueDays}j Retard`
                      : 'En cours'}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <p className="font-medium">{cli.email}</p>
                  <p className="font-mono text-slate-500">{cli.phone}</p>
                  <p className="text-[11px] text-slate-400">{cli.address}</p>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Facturé</span>
                  <div className="font-mono font-black text-slate-950 mt-0.5">
                    {formatAriary(cli.totalBilled)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Solde Restant</span>
                  <div className="font-mono font-black text-rose-600 mt-0.5">
                    {formatAriary(cli.outstandingBalance)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Preview Modal */}
      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={selectedInvoice}
      />

      {/* Payment Recording Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-950">Enregistrer un Encaissement</h3>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500">Facture :</span>
                <p className="font-extrabold text-sm text-slate-900 font-mono">
                  {payModalInvoice.invoiceNumber} - {payModalInvoice.clientCompany}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Montant Reçu (Ar) :
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Compte d'Encaissement :
                </label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black rounded-xl"
                >
                  Confirmer l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
