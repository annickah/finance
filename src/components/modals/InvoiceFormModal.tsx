import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Plus,
  Trash2,
  ListPlus,
  Sparkles,
  Calculator,
  Building2,
  Calendar,
  Phone,
  FileCheck,
  Check,
  HelpCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Invoice, InvoiceItem, InvoiceStatus } from '../../types';
import { formatAriary } from '../../utils/formatters';
import { formatAmountInWordsAriary } from '../../utils/numberToWords';

interface InvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceToEdit?: Invoice | null;
  preselectedProjectId?: string;
  onSubmit?: (invoice: any) => void;
}

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({
  isOpen,
  onClose,
  invoiceToEdit,
  preselectedProjectId,
  onSubmit,
}) => {
  const { clients, projects, invoices, addInvoice, updateInvoice } = useFinance();

  const isEditing = Boolean(invoiceToEdit);

  // Form State
  const [invoiceType, setInvoiceType] = useState<string>('Facture Avance');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [clientId, setClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientCompany, setClientCompany] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientAddress, setClientAddress] = useState<string>('Antananarivo, Madagascar');
  const [projectId, setProjectId] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<InvoiceStatus>('SENT');
  const [paymentTerms, setPaymentTerms] = useState<string>('Avance à la commande, solde à la livraison');
  const [conditionsText, setConditionsText] = useState<string>(
    'Eray Digital est responsable du renouvellement des sites en cas de piratage.'
  );
  const [renewalTerms, setRenewalTerms] = useState<string>(
    '• Hébergement, nom de domaine, maintenance et sécurisation du site : 400 Ar/an/plateforme.'
  );
  const [notes, setNotes] = useState<string>('');

  // Items State
  const [items, setItems] = useState<
    Array<{
      id: string;
      description: string;
      subItems: string[];
      quantity: number;
      unitPrice: number;
      total: number;
    }>
  >([]);

  // Advance Payment / Paid Amount
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [amountInWords, setAmountInWords] = useState<string>('');
  const [isManualWords, setIsManualWords] = useState<boolean>(false);

  // Initialize form when opened or invoiceToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (invoiceToEdit) {
      setInvoiceType(invoiceToEdit.invoiceType || 'Facture Avance');
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setClientId(invoiceToEdit.clientId || '');
      setClientName(invoiceToEdit.clientName || '');
      setClientCompany(invoiceToEdit.clientCompany || '');
      setClientPhone(invoiceToEdit.clientPhone || '');
      setClientAddress(invoiceToEdit.clientAddress || 'Antananarivo, Madagascar');
      setProjectId(invoiceToEdit.projectId || '');
      setIssueDate(invoiceToEdit.issueDate);
      setDueDate(invoiceToEdit.dueDate);
      setStatus(invoiceToEdit.status);
      setPaymentTerms(invoiceToEdit.paymentTerms || '');
      setConditionsText(
        invoiceToEdit.conditionsText ||
          'Eray Digital est responsable du renouvellement des sites en cas de piratage.'
      );
      setRenewalTerms(
        invoiceToEdit.renewalTerms ||
          '• Hébergement, nom de domaine, maintenance et sécurisation du site : 400 Ar/an/plateforme.'
      );
      setNotes(invoiceToEdit.notes || '');
      setPaidAmount(invoiceToEdit.paidAmount || 0);
      setAmountInWords(invoiceToEdit.amountInWords || '');
      setIsManualWords(Boolean(invoiceToEdit.amountInWords));

      setItems(
        invoiceToEdit.items.map((it) => ({
          id: it.id || `it-${Date.now()}-${Math.random()}`,
          description: it.description,
          subItems: it.subItems || [],
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || 0,
          total: it.total || (it.quantity || 1) * (it.unitPrice || 0),
        }))
      );
    } else {
      // New Invoice Default
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];

      const defaultClient = clients[0];
      const nextNum = `FACTAVC N° ${String(invoices.length + 1).padStart(3, '0')}`;

      setInvoiceType('Facture Avance');
      setInvoiceNumber(nextNum);
      setClientId(defaultClient?.id || '');
      setClientName(defaultClient?.name || 'Name client');
      setClientCompany(defaultClient?.company || 'Entreprise Partenaire');
      setClientPhone(defaultClient?.phone || '020 76 436 75');
      setClientAddress(defaultClient?.address || 'Antananarivo, Madagascar');
      setProjectId(preselectedProjectId || '');
      setIssueDate(today);
      setDueDate(nextMonthStr);
      setStatus('SENT');
      setPaymentTerms('Avance à la commande, solde à la livraison');
      setConditionsText('Eray Digital est responsable du renouvellement des sites en cas de piratage.');
      setRenewalTerms('• Hébergement, nom de domaine, maintenance et sécurisation du site : 400 Ar/an/plateforme.');
      setNotes('');
      setPaidAmount(400);
      setIsManualWords(false);

      setItems([
        {
          id: 'it-1',
          description: 'Développement d’un Site dynamique',
          subItems: [
            'Design 100% responsive (PC, Tablette, Mobile)',
            '2 adresses e-mail professionnelles',
            'Installation complète',
            'Site disponible en 1 langue',
            'Formulaire de contact et demande de devis.',
            '08 pages au choix avec optimisation SEO complète',
            'Hébergement offert pendant 1 an',
            'Maintenance et sécurisation pendant 1 an',
          ],
          quantity: 1,
          unitPrice: 1000,
          total: 1000,
        },
      ]);
    }
  }, [isOpen, invoiceToEdit, preselectedProjectId, clients, invoices.length]);

  // Client Selection Handler
  const handleClientSelect = (cId: string) => {
    setClientId(cId);
    const found = clients.find((c) => c.id === cId);
    if (found) {
      setClientName(found.name);
      setClientCompany(found.company);
      if (found.phone) setClientPhone(found.phone);
      if (found.address) setClientAddress(found.address);
    }
  };

  // Item management
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        description: '',
        subItems: [],
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (
    id: string,
    field: 'description' | 'quantity' | 'unitPrice',
    val: string | number
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const updated = { ...it, [field]: val };
          updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0);
          return updated;
        }
        return it;
      })
    );
  };

  // Sub-items (bullet points) management
  const handleAddSubItem = (itemId: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            subItems: [...(it.subItems || []), ''],
          };
        }
        return it;
      })
    );
  };

  const handleSubItemChange = (itemId: string, index: number, text: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newSubs = [...(it.subItems || [])];
          newSubs[index] = text;
          return { ...it, subItems: newSubs };
        }
        return it;
      })
    );
  };

  const handleRemoveSubItem = (itemId: string, index: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newSubs = (it.subItems || []).filter((_, i) => i !== index);
          return { ...it, subItems: newSubs };
        }
        return it;
      })
    );
  };

  // Calculated totals
  const subtotal = items.reduce((sum, it) => sum + (it.total || 0), 0);
  const totalAmount = subtotal;
  const balanceDue = Math.max(0, totalAmount - (Number(paidAmount) || 0));

  // Auto-generate words when paid amount or total changes
  useEffect(() => {
    if (!isManualWords) {
      const referenceAmount = invoiceType.includes('Avance') || invoiceType.includes('Acompte')
        ? (Number(paidAmount) > 0 ? Number(paidAmount) : totalAmount)
        : totalAmount;
      if (referenceAmount > 0) {
        setAmountInWords(formatAmountInWordsAriary(referenceAmount));
      }
    }
  }, [totalAmount, paidAmount, invoiceType, isManualWords]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientCompany.trim() || items.length === 0 || totalAmount <= 0) return;

    const selectedProject = projects.find((p) => p.id === projectId);

    const invoicePayload = {
      invoiceNumber: invoiceNumber.trim() || `FAC-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      invoiceType: invoiceType.trim() || 'Facture Avance',
      clientId: clientId || 'cli-custom',
      clientName: clientName.trim() || 'Client',
      clientCompany: clientCompany.trim(),
      clientPhone: clientPhone.trim() || undefined,
      clientAddress: clientAddress.trim() || undefined,
      projectId: projectId || undefined,
      projectName: selectedProject?.name,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || issueDate,
      items: items.map((it) => ({
        id: it.id,
        description: it.description.trim() || 'Prestation numérique',
        subItems: it.subItems.filter((s) => s.trim().length > 0),
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || 0,
      })),
      subtotal,
      taxRate: 0,
      taxAmount: 0,
      totalAmount,
      paidAmount: Number(paidAmount) || 0,
      balanceDue,
      status: balanceDue === 0 ? 'PAID' : (Number(paidAmount) > 0 ? 'PARTIAL' : status),
      paymentTerms: paymentTerms.trim(),
      amountInWords: amountInWords.trim(),
      conditionsText: conditionsText.trim(),
      renewalTerms: renewalTerms.trim(),
      notes: notes.trim() || undefined,
    };

    if (isEditing && invoiceToEdit) {
      updateInvoice(invoiceToEdit.id, invoicePayload);
    } else {
      if (onSubmit) {
        onSubmit(invoicePayload);
      } else {
        addInvoice(invoicePayload);
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-red-600 to-rose-700 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-xs text-white border border-white/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight text-white font-mono">
                  {isEditing ? 'Modifier la Facture' : 'Éditer un Modèle de Facture'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase">
                  Eray Digital SARL
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Personnalisez le contenu, les lignes, les sous-spécifications et les conditions de règlement.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Top Row: Type, Number, Status */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 text-xs font-bold uppercase text-slate-600 tracking-wider">
              <FileText className="w-4 h-4 text-red-600" />
              <span>Paramètres du Document</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type de Facture *
                </label>
                <select
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                >
                  <option value="Facture Avance">Facture Avance (Modèle standard)</option>
                  <option value="Facture Solde">Facture Solde</option>
                  <option value="Facture Acompte">Facture Acompte</option>
                  <option value="Facture Standard">Facture Standard</option>
                  <option value="Devis / Proforma">Devis / Proforma</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  N° Facture / Référence *
                </label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="ex: FACTAVC N° 001 ou FAC-2026-001"
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white text-red-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Statut du Document
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                >
                  <option value="SENT">Envoyée (En attente)</option>
                  <option value="PARTIAL">Acompte Reçu (Partiel)</option>
                  <option value="PAID">Payée Intégralement</option>
                  <option value="OVERDUE">En Retard</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client & Project Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 text-xs font-bold uppercase text-slate-600 tracking-wider">
              <Building2 className="w-4 h-4 text-red-600" />
              <span>Coordonnées Client & Projet</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sélection Client Rapide
                </label>
                <select
                  value={clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                >
                  <option value="">-- Saisie libre ou nouveau client --</option>
                  {clients.map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.company} ({cli.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Entreprise / Société *
                </label>
                <input
                  type="text"
                  required
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="ex: Name client ou Entreprise"
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact / Interlocuteur
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="ex: M. Jean Rakoto"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Téléphone Client
                </label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="ex: 020 76 436 75"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse de facturation
                </label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="ex: Antananarivo, Madagascar"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Projet Associé (Optionnel)
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
                >
                  <option value="">-- Aucun / Prestation autonome --</option>
                  {projects.map((prj) => (
                    <option key={prj.id} value={prj.id}>
                      {prj.code} - {prj.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dates & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date d'émission *
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date d'échéance *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modalités de règlement
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="ex: Avance 400 Ar à la commande"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Line Items Builder with Bullet Points */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Lignes de Prestation & Spécifications ({items.length})
                </label>
                <p className="text-[11px] text-slate-500">
                  Ajoutez les titres et les puces descriptives pour chaque livrable.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une prestation</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Intitulé de la prestation #{itemIdx + 1}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Développement d'un Site dynamique"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-xs font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="w-20">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Qté
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-2 text-xs font-mono text-center border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="w-36">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Prix Unitaire (Ar)
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice || ''}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'unitPrice',
                            e.target.value === '' ? 0 : Number(e.target.value)
                          )
                        }
                        className="w-full px-3 py-2 text-xs font-mono font-bold text-slate-900 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="w-32 text-right">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Total Ligne
                      </label>
                      <div className="px-3 py-2 text-xs font-mono font-black text-red-700 bg-red-50/60 rounded-xl border border-red-100">
                        {formatAriary(item.total)}
                      </div>
                    </div>

                    {items.length > 1 && (
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Supprimer la prestation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Bullet Sub-items Section */}
                  <div className="pl-3 border-l-2 border-red-300 space-y-2 bg-white/70 p-3 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                        <ListPlus className="w-3.5 h-3.5 text-red-600" />
                        Spécifications & Puces détaillées (ex: responsive, pages, hébergement...)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddSubItem(item.id)}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        Ajouter une puce
                      </button>
                    </div>

                    {item.subItems && item.subItems.length > 0 ? (
                      <div className="space-y-1.5">
                        {item.subItems.map((sub, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2">
                            <span className="text-red-500 font-bold text-xs">•</span>
                            <input
                              type="text"
                              value={sub}
                              onChange={(e) => handleSubItemChange(item.id, sIdx, e.target.value)}
                              placeholder={`ex: Design 100% responsive ou Hébergement offert...`}
                              className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white focus:ring-1 focus:ring-red-500 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSubItem(item.id, sIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Retirer cette puce"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Aucune puce détaillée ajoutée. Cliquez sur "Ajouter une puce" pour détailler les livrables.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals & Advance Received Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-linear-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                PRIX TOTAUX (Total Brut)
              </span>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {formatAriary(totalAmount)}
              </div>
              <span className="text-[10px] text-slate-400">Total de toutes les lignes</span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Avance Reçu / Acompte (Ar) *
              </label>
              <input
                type="number"
                min="0"
                max={totalAmount}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm font-mono font-bold bg-slate-800 border border-slate-700 rounded-xl text-amber-300 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <span className="text-[10px] text-slate-400">Montant encaissé à la commande</span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                Restant Dû (Solde)
              </span>
              <div className="text-2xl font-black text-rose-400 font-mono mt-1">
                {formatAriary(balanceDue)}
              </div>
              <span className="text-[10px] text-slate-400">À régler à la livraison</span>
            </div>
          </div>

          {/* Sentence in Words (French Legal Ariary) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                Montant arrêté en toutes lettres
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsManualWords(false);
                  const refAmount = invoiceType.includes('Avance') || invoiceType.includes('Acompte')
                    ? (Number(paidAmount) > 0 ? Number(paidAmount) : totalAmount)
                    : totalAmount;
                  setAmountInWords(formatAmountInWordsAriary(refAmount));
                }}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Régénérer automatiquement
              </button>
            </div>
            <input
              type="text"
              value={amountInWords}
              onChange={(e) => {
                setIsManualWords(true);
                setAmountInWords(e.target.value);
              }}
              placeholder="ex: quatre-cent Ariary (400 Ar)"
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400">
              Formule imprimée sur la facture : "La présente facture avance payé est arrêtée à la somme totale de : [montant ci-dessus]."
            </p>
          </div>

          {/* Legal Conditions & Annual Renewals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Conditions Générales & Garantie
              </label>
              <textarea
                rows={2}
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Conditions de Renouvellement Annuel
              </label>
              <textarea
                rows={2}
                value={renewalTerms}
                onChange={(e) => setRenewalTerms(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
          <div className="text-xs text-slate-500">
            Total Net : <strong className="text-slate-900 font-mono">{formatAriary(totalAmount)}</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={totalAmount <= 0 || !clientCompany.trim()}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-linear-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 disabled:opacity-50 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Enregistrer les Modifications' : 'Émettre la Facture'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
