import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  CreditCard,
  Send,
  X,
  Download,
  Printer,
  Sparkles,
  Users,
  FolderKanban,
  Phone,
  Tag,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Invoice, InvoiceStatus } from '../types';
import { formatAriary, formatDate } from '../utils/formatters';
import { InvoicePreviewModal } from '../components/modals/InvoicePreviewModal';
import { InvoiceFormModal } from '../components/modals/InvoiceFormModal';
import {
  AdvancedFilterBar,
  FilterState,
  INITIAL_FILTER_STATE,
} from '../components/common/AdvancedFilterBar';
import { downloadCSV } from '../utils/exportUtils';

interface InvoicesPDFProps {
  onOpenNewInvoice?: () => void;
}

export const InvoicesPDF: React.FC<InvoicesPDFProps> = ({ onOpenNewInvoice }) => {
  const { invoices, deleteInvoice, recordInvoicePayment, accounts, clients, projects } = useFinance();
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Preview Modal
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form Modal (Create or Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);

  // Delete Confirmation Modal
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Payment Quick Modal State
  const [payModalInvoice, setPayModalInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payAccountId, setPayAccountId] = useState(accounts[0]?.id || '');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Text Search
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        const matchesNumber = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesType = inv.invoiceType ? inv.invoiceType.toLowerCase().includes(q) : false;
        const matchesClient = inv.clientName.toLowerCase().includes(q);
        const matchesCompany = inv.clientCompany.toLowerCase().includes(q);
        const matchesProject = inv.projectName ? inv.projectName.toLowerCase().includes(q) : false;
        const matchesNotes = inv.notes ? inv.notes.toLowerCase().includes(q) : false;
        if (!matchesNumber && !matchesType && !matchesClient && !matchesCompany && !matchesProject && !matchesNotes) {
          return false;
        }
      }

      // 2. Date Range (matches issueDate or dueDate)
      if (filters.startDate) {
        if (inv.issueDate < filters.startDate && inv.dueDate < filters.startDate) return false;
      }
      if (filters.endDate) {
        if (inv.issueDate > filters.endDate && inv.dueDate > filters.endDate) return false;
      }

      // 3. Client Filter
      if (filters.clientId !== 'ALL' && inv.clientId !== filters.clientId) return false;

      // 4. Project Filter
      if (filters.projectId !== 'ALL' && inv.projectId !== filters.projectId) return false;

      // 5. Status Filter
      if (filters.status !== 'ALL') {
        if (filters.status === 'PARTIALLY_PAID') {
          if (inv.status !== 'PARTIAL') return false;
        } else if (inv.status !== filters.status) {
          return false;
        }
      }

      // 6. Min Amount
      if (filters.minAmount !== '') {
        const min = Number(filters.minAmount);
        if (!isNaN(min) && inv.totalAmount < min) return false;
      }

      // 7. Max Amount
      if (filters.maxAmount !== '') {
        const max = Number(filters.maxAmount);
        if (!isNaN(max) && inv.totalAmount > max) return false;
      }

      return true;
    });
  }, [invoices, filters]);

  // Actions
  const handleOpenCreate = () => {
    setInvoiceToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setIsFormOpen(true);
  };

  const handleOpenPreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleDuplicate = (invoice: Invoice) => {
    const nextNum = `FACTAVC N° ${String(invoices.length + 1).padStart(3, '0')}`;
    const duplicated: Invoice = {
      ...invoice,
      id: '',
      invoiceNumber: nextNum,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
    };
    setInvoiceToEdit(duplicated);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      setInvoiceToDelete(null);
      if (selectedInvoice?.id === invoiceToDelete.id) {
        setIsPreviewOpen(false);
        setSelectedInvoice(null);
      }
    }
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

  // Filtered Summaries
  const totalFilteredInvoiced = filteredInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalFilteredCollected = filteredInvoices.reduce((s, i) => s + i.paidAmount, 0);
  const totalFilteredBalanceDue = filteredInvoices.reduce((s, i) => s + i.balanceDue, 0);

  // Status options for dropdown
  const statusOptions = [
    { value: 'DRAFT', label: 'Brouillon' },
    { value: 'SENT', label: 'Envoyée / En attente' },
    { value: 'PARTIAL', label: 'Acompte Payé (Partiel)' },
    { value: 'PAID', label: 'Payée Intégralement' },
    { value: 'OVERDUE', label: 'En Retard de Paiement' },
  ];

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers = [
      'N° Facture',
      'Type',
      'Client',
      'Société',
      'Téléphone',
      'Projet',
      'Date Émission',
      'Date Échéance',
      'Montant Total (MGA)',
      'Déjà Encaissé (MGA)',
      'Reste Dû (MGA)',
      'Statut',
      'Conditions de Règlement',
    ];

    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.invoiceType || 'Facture',
      inv.clientName,
      inv.clientCompany,
      inv.clientPhone || '',
      inv.projectName || 'Prestation forfaitaire',
      inv.issueDate,
      inv.dueDate,
      inv.totalAmount,
      inv.paidAmount,
      inv.balanceDue,
      inv.status,
      inv.paymentTerms,
    ]);

    downloadCSV('Factures_Clients_ErayDigital', headers, rows);
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200/60 text-xs font-bold flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Facturation & Modèle Officiel
            </span>
            <span className="text-xs font-semibold text-slate-400">Édition • Suppression • Export PDF</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Facturation & Devis
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Gestion complète des factures Eray Digital : créez, modifiez le contenu et les puces descriptives, supprimez, enregistrez les acomptes et générez le modèle officiel conforme.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-linear-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une Facture</span>
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <AdvancedFilterBar
        filters={filters}
        onFilterChange={setFilters}
        clients={clients}
        projects={projects}
        statusOptions={statusOptions}
        showStatusFilter={true}
        showAccountFilter={false}
        onExportCSV={handleExportCSV}
        exportLabel="Exporter CSV"
        totalFilteredCount={filteredInvoices.length}
        totalItemsCount={invoices.length}
        placeholder="Rechercher par n° facture, type, client, société, projet..."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Facturé (Filtré)
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatAriary(totalFilteredInvoiced)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Sur {filteredInvoices.length} facture(s)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Encaissé / Acomptes
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {formatAriary(totalFilteredCollected)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Taux de recouvrement :{' '}
            {totalFilteredInvoiced > 0
              ? ((totalFilteredCollected / totalFilteredInvoiced) * 100).toFixed(0)
              : 0}
            %
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Reste à Recouvrer (Solde)
          </span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            {formatAriary(totalFilteredBalanceDue)}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">Créances en attente</span>
        </div>
      </div>

      {/* Invoice Table with Full CRUD Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Registre des Factures & Devis ({filteredInvoices.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultez, modifiez les données, imprimez ou supprimez vos factures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Exporter CSV</span>
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouvelle Facture</span>
            </button>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Aucune facture ne correspond aux critères</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Vérifiez vos filtres ou créez votre première facture avec le modèle officiel.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setFilters(INITIAL_FILTER_STATE)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 cursor-pointer"
              >
                Créer une Facture
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">N° Facture & Type</th>
                  <th className="py-3.5 px-6">Client / Entreprise</th>
                  <th className="py-3.5 px-6">Projet</th>
                  <th className="py-3.5 px-6">Échéance</th>
                  <th className="py-3.5 px-6 text-right">Montant Total</th>
                  <th className="py-3.5 px-6 text-right">Avance / Reste Dû</th>
                  <th className="py-3.5 px-6 text-center">Statut</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="font-mono font-black text-red-700">{inv.invoiceNumber}</div>
                      <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md bg-red-50 text-red-700 font-semibold text-[10px] border border-red-100">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{inv.invoiceType || 'Facture'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{inv.clientCompany}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-5">{inv.clientName}</div>
                      {inv.clientPhone && (
                        <div className="text-[10px] font-mono text-slate-400 pl-5 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          <span>{inv.clientPhone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-6">
                      {inv.projectName ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <FolderKanban className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          <span className="truncate max-w-[160px] font-medium">{inv.projectName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Prestation directe</span>
                      )}
                    </td>

                    <td className="py-3.5 px-6 font-mono text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(inv.dueDate, 'short')}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Émis: {formatDate(inv.issueDate, 'short')}</div>
                    </td>

                    <td className="py-3.5 px-6 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatAriary(inv.totalAmount)}
                    </td>

                    <td className="py-3.5 px-6 text-right font-mono whitespace-nowrap">
                      {inv.paidAmount > 0 ? (
                        <div>
                          <div className="text-emerald-600 font-bold text-[11px]">
                            Avance: {formatAriary(inv.paidAmount)}
                          </div>
                          <div className="text-amber-600 font-black text-xs">
                            Reste: {formatAriary(inv.balanceDue)}
                          </div>
                        </div>
                      ) : (
                        <div className="font-bold text-amber-600">{formatAriary(inv.balanceDue)}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-6 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'OVERDUE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : inv.status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {inv.status === 'PAID'
                          ? 'PAYÉE'
                          : inv.status === 'OVERDUE'
                          ? 'RETARD'
                          : inv.status === 'PARTIAL'
                          ? 'ACOMPTE'
                          : 'ENVOYÉE'}
                      </span>
                    </td>

                    {/* Full Actions Toolbar */}
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview / Print */}
                        <button
                          onClick={() => handleOpenPreview(inv)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          title="Aperçu officiel & Imprimer PDF"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(inv)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                          title="Modifier la facture et son contenu"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(inv)}
                          className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors cursor-pointer"
                          title="Dupliquer la facture"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Record Payment */}
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(inv)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors cursor-pointer"
                            title="Enregistrer un règlement"
                          >
                            Encaisser
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setInvoiceToDelete(inv)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Supprimer la facture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice PDF Preview Modal */}
      {selectedInvoice && (
        <InvoicePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onEdit={(inv) => {
            setIsPreviewOpen(false);
            handleOpenEdit(inv);
          }}
          onDelete={(id) => {
            deleteInvoice(id);
            setIsPreviewOpen(false);
            setSelectedInvoice(null);
          }}
          onDuplicate={(inv) => {
            setIsPreviewOpen(false);
            handleDuplicate(inv);
          }}
          onRecordPayment={(id) => {
            const inv = invoices.find((i) => i.id === id);
            if (inv) handleOpenPayModal(inv);
          }}
        />
      )}

      {/* Invoice Form Modal (Create or Edit) */}
      <InvoiceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setInvoiceToEdit(null);
        }}
        invoiceToEdit={invoiceToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {invoiceToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-extrabold text-slate-900 text-center">
              Confirmer la suppression
            </h3>

            <p className="text-xs text-slate-500 text-center mt-2">
              Êtes-vous sûr de vouloir supprimer définitivement la facture{' '}
              <strong className="text-slate-800 font-mono">{invoiceToDelete.invoiceNumber}</strong> (
              {invoiceToDelete.clientCompany}) d'un montant de{' '}
              <strong className="text-slate-800 font-mono">
                {formatAriary(invoiceToDelete.totalAmount)}
              </strong>{' '}
              ?
            </p>

            <div className="pt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setInvoiceToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Enregistrer un Encaissement
              </h3>
              <button
                onClick={() => setPayModalInvoice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4 pt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Facture & Client
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div className="font-mono font-bold text-red-700">{payModalInvoice.invoiceNumber}</div>
                  <div className="font-bold text-slate-900 mt-0.5">{payModalInvoice.clientCompany}</div>
                  <div className="text-slate-500 mt-1">
                    Reste à payer :{' '}
                    <strong className="text-amber-600 font-mono">
                      {formatAriary(payModalInvoice.balanceDue)}
                    </strong>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Montant Reçu (Ar)
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  max={payModalInvoice.balanceDue}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Compte de Dépôt / Réception
                </label>
                <select
                  value={payAccountId}
                  onChange={(e) => setPayAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatAriary(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPayModalInvoice(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Valider l'Encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
