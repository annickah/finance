import React, { useState } from 'react';
import {
  X,
  Printer,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  AlertTriangle,
  Download,
  Share2,
  Handshake,
  Layers,
  FileText,
} from 'lucide-react';
import { Invoice } from '../../types';
import { formatAriary, formatDate } from '../../utils/formatters';

interface InvoicePreviewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoiceId: string) => void;
  onDuplicate?: (invoice: Invoice) => void;
  onRecordPayment?: (invoiceId: string) => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onRecordPayment,
}) => {
  const [templateStyle, setTemplateStyle] = useState<'OFFICIAL_RED' | 'CORPORATE'>('OFFICIAL_RED');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceTypeTitle = invoice.invoiceType || (invoice.status === 'PARTIAL' ? 'Facture Avance' : 'Facture');
  const advanceAmount = invoice.paidAmount || 0;
  const totalAmount = invoice.totalAmount || 0;
  const balanceDue = invoice.balanceDue ?? Math.max(0, totalAmount - advanceAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[95vh] print:max-h-none print:my-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Top Control Bar (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-slate-900">
                {invoice.invoiceNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                  invoice.status === 'PAID'
                    ? 'bg-emerald-100 text-emerald-800'
                    : invoice.status === 'OVERDUE'
                    ? 'bg-rose-100 text-rose-800'
                    : invoice.status === 'PARTIAL'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {invoice.status === 'PAID'
                  ? 'PAYÉE'
                  : invoice.status === 'OVERDUE'
                  ? 'EN RETARD'
                  : invoice.status === 'PARTIAL'
                  ? 'AVANCE REÇUE'
                  : 'ENVOYÉE'}
              </span>
            </div>

            {/* Template switch pill */}
            <div className="hidden sm:flex items-center bg-slate-200/70 p-0.5 rounded-xl text-[11px] font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setTemplateStyle('OFFICIAL_RED')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  templateStyle === 'OFFICIAL_RED'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Modèle Officiel Rouge
              </button>
              <button
                type="button"
                onClick={() => setTemplateStyle('CORPORATE')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  templateStyle === 'CORPORATE'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Modèle Corporate
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit */}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(invoice);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Modifier les données et contenus"
              >
                <Edit className="w-3.5 h-3.5 text-slate-600" />
                <span>Modifier</span>
              </button>
            )}

            {/* Duplicate */}
            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate(invoice);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Dupliquer pour créer une nouvelle facture"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Dupliquer</span>
              </button>
            )}

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>Imprimer / PDF</span>
            </button>

            {/* Record Payment */}
            {balanceDue > 0 && onRecordPayment && (
              <button
                onClick={() => {
                  onRecordPayment(invoice.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Encaisser</span>
              </button>
            )}

            {/* Delete */}
            {onDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Supprimer la facture"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between gap-4 print:hidden animate-in fade-in">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Voulez-vous vraiment supprimer définitivement la facture <strong>{invoice.invoiceNumber}</strong> ?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-white rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (onDelete) onDelete(invoice.id);
                  setShowDeleteConfirm(false);
                  onClose();
                }}
                className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        )}

        {/* ================= Printable Sheet Container ================= */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 flex-1 custom-scrollbar printable-area">
          {templateStyle === 'OFFICIAL_RED' ? (
            /* ========================================================================= */
            /* 1. MODÈLE OFFICIEL ERAY DIGITAL (BANDEAU ROUGE FLUIDE & CONFORME IMAGE) */
            /* ========================================================================= */
            <div className="max-w-[760px] mx-auto space-y-6 text-slate-800 font-sans text-xs">
              {/* Header Curve Top Bar */}
              <div className="relative pt-2 pb-4">
                {/* Top Curve Banner Graphic */}
                <div className="flex items-start justify-between">
                  {/* Left Curve with Facture Title */}
                  <div className="relative -ml-6 -mt-6 sm:-ml-10 sm:-mt-10">
                    <svg
                      viewBox="0 0 340 95"
                      className="w-[280px] sm:w-[340px] h-[75px] sm:h-[95px]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0 0 H320 C280 0 250 85 160 85 C80 85 40 45 0 45 V0 Z"
                        fill="#C8102E"
                      />
                      <text
                        x="28"
                        y="42"
                        fill="#FFFFFF"
                        fontSize="20"
                        fontWeight="900"
                        fontFamily="sans-serif"
                        letterSpacing="0.5"
                      >
                        {invoiceTypeTitle}
                      </text>
                    </svg>
                  </div>

                  {/* Right Red Pill Badge with Invoice Number */}
                  <div className="pt-1">
                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#C8102E] text-white font-mono font-black text-xs sm:text-sm tracking-wide shadow-xs">
                      {invoice.invoiceNumber}
                    </div>
                  </div>
                </div>

                {/* Company Official Details and Logo */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pt-4">
                  {/* Left: Client and Date info */}
                  <div className="space-y-1.5 pt-2">
                    <div className="text-xs font-bold text-slate-800">
                      Le {formatDate(invoice.issueDate, 'short')}
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-1">
                      {invoice.clientCompany || invoice.clientName}
                    </div>
                    {invoice.clientCompany && invoice.clientName && invoice.clientCompany !== invoice.clientName && (
                      <div className="text-xs text-slate-600">{invoice.clientName}</div>
                    )}
                    {invoice.clientPhone && (
                      <div className="text-xs font-mono text-slate-700">{invoice.clientPhone}</div>
                    )}
                    {invoice.clientAddress && (
                      <div className="text-xs text-slate-500">{invoice.clientAddress}</div>
                    )}
                  </div>

                  {/* Right: Company Branding & Legal identifiers */}
                  <div className="sm:text-right space-y-1">
                    {/* Eray Digital Official Vector Badge */}
                    <div className="flex items-center sm:justify-end gap-2.5 pb-1">
                      {/* Logo Icon */}
                      <div className="w-9 h-9 rounded-full bg-[#C8102E] text-white font-black flex items-center justify-center text-sm shadow-xs border-2 border-white">
                        E
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-base font-black tracking-tight text-slate-900">
                            ERAY
                          </span>
                          <span className="text-base font-black text-[#C8102E]">
                            DIGITAL
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                          <Handshake className="w-2.5 h-2.5 text-[#C8102E]" />
                          <span>S.A.R.L</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-900">Eray Digital S.A.R.L</p>
                    <p className="text-[11px] text-slate-600 font-mono">NIF : 20186406</p>
                    <p className="text-[11px] text-slate-600 font-mono">STAT : 63111 11 2024 0 10949</p>
                    <p className="text-[11px] text-slate-600 font-mono">RCS : 2024B00929</p>
                    <p className="text-[11px] text-slate-600 font-mono">+261 38 46 967 20 / +261 38 82 180 33</p>
                    <p className="text-[11px] text-slate-600">eraydigital.direction@gmail.com</p>
                    <p className="text-[11px] text-slate-600">IVN 68 TER ANKADITAPAKA AVARATRA</p>
                  </div>
                </div>
              </div>

              {/* Table of Items */}
              <div className="border border-[#C8102E] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#C8102E] text-white font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-4 font-bold">Description</th>
                      <th className="py-2.5 px-3 text-center w-24 font-bold border-l border-red-700/50">
                        Quantité
                      </th>
                      <th className="py-2.5 px-4 text-right w-36 font-bold border-l border-red-700/50">
                        Prix unitaire
                      </th>
                      <th className="py-2.5 px-4 text-right w-36 font-bold border-l border-red-700/50">
                        Total en AR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="py-3 px-4 space-y-1">
                          <div className="font-bold text-slate-900">{item.description}</div>
                          {item.subItems && item.subItems.length > 0 && (
                            <div className="space-y-0.5 pt-1 text-[11px] text-slate-700">
                              <div className="font-semibold text-slate-600">comprenant :</div>
                              <ul className="space-y-0.5 pl-1">
                                {item.subItems.map((sub, sIdx) => (
                                  <li key={sIdx} className="flex items-start gap-1.5">
                                    <span className="text-[#C8102E] font-bold">•</span>
                                    <span>{sub}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800 border-l border-slate-100">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 border-l border-slate-100">
                          {formatAriary(item.unitPrice, { showSymbol: false })}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 border-l border-slate-100">
                          {formatAriary(item.total, { showSymbol: false })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Box on Right */}
              <div className="flex justify-end pt-1">
                <div className="w-72 border border-[#C8102E] rounded-xl overflow-hidden divide-y divide-slate-200 text-xs">
                  <div className="flex justify-between px-3.5 py-2 font-bold text-slate-900">
                    <span>PRIX TOTAUX</span>
                    <span className="font-mono">{formatAriary(totalAmount, { showSymbol: false })}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2 font-bold text-slate-800 bg-slate-50/50">
                    <span>Avance reçu</span>
                    <span className="font-mono text-emerald-700">
                      {formatAriary(advanceAmount, { showSymbol: false })}
                    </span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2 font-black text-[#C8102E] bg-red-50/40">
                    <span>Restant</span>
                    <span className="font-mono text-sm">
                      {formatAriary(balanceDue, { showSymbol: false })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Sentence in Words */}
              <div className="pt-2">
                <p className="text-xs text-slate-800 italic">
                  La présente {invoiceTypeTitle.toLowerCase()} payé est arrêtée à la somme totale de :{' '}
                  <strong className="font-bold not-italic text-slate-950">
                    {invoice.amountInWords || `${formatAriary(advanceAmount > 0 ? advanceAmount : totalAmount)}.`}
                  </strong>
                </p>
              </div>

              {/* Conditions Section & Signature */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                {/* Conditions Block */}
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="font-bold text-slate-900">Conditions :</div>
                  <p className="text-[11px] leading-relaxed">
                    {invoice.conditionsText ||
                      'Eray Digital est responsable du renouvellement des sites en cas de piratage'}
                  </p>
                  {invoice.renewalTerms && (
                    <div className="pt-1 text-[11px] space-y-0.5">
                      <div className="font-bold text-slate-800">
                        Conditions de renouvellement annuel :
                      </div>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                        {invoice.renewalTerms}
                      </p>
                    </div>
                  )}
                </div>

                {/* Signature Area on Right */}
                <div className="sm:text-right flex flex-col justify-between items-end min-h-[90px]">
                  <div className="font-bold text-xs text-slate-900">Le gérant</div>
                  <div className="w-36 h-14 border-b border-slate-300 flex items-center justify-center text-[10px] text-slate-400 italic">
                    (Signature & Cachet)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* 2. MODÈLE CORPORATE MINIMALISTE                                          */
            /* ========================================================================= */
            <div className="max-w-[760px] mx-auto space-y-8 text-slate-800 font-sans text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black flex items-center justify-center text-sm">
                      ED
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">
                      ERAY DIGITAL S.A.R.L
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Solutions Numériques & Ingénierie Logicielle
                  </p>
                  <p className="text-xs text-slate-500">
                    NIF: 20186406 — STAT: 63111 11 2024 0 10949 — RCS: 2024B00929
                  </p>
                  <p className="text-xs text-slate-500">
                    IVN 68 TER ANKADITAPAKA AVARATRA, Antananarivo
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    {invoiceTypeTitle}
                  </span>
                  <div className="text-2xl font-black text-slate-950 mt-0.5">
                    {invoice.invoiceNumber}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Émission : <span className="font-bold text-slate-800">{formatDate(invoice.issueDate)}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Échéance : <span className="font-bold text-rose-600">{formatDate(invoice.dueDate)}</span>
                  </p>
                </div>
              </div>

              {/* Client and Project Info */}
              <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Destinataire
                  </span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {invoice.clientCompany || invoice.clientName}
                  </div>
                  <div className="text-xs text-slate-600">{invoice.clientName}</div>
                  {invoice.clientPhone && (
                    <div className="text-xs font-mono text-slate-500 mt-0.5">{invoice.clientPhone}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-0.5">
                    {invoice.clientAddress || 'Antananarivo, Madagascar'}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Projet & Conditions
                  </span>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">
                    {invoice.projectName || 'Prestation forfaitaire'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Modalités : <span className="font-semibold text-slate-900">{invoice.paymentTerms}</span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 text-slate-900 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-2">Description</th>
                    <th className="py-2.5 px-2 text-center w-20">Quantité</th>
                    <th className="py-2.5 px-2 text-right w-32">Prix Unitaire</th>
                    <th className="py-2.5 px-2 text-right w-36">Total (Ar)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-900">{it.description}</div>
                        {it.subItems && it.subItems.length > 0 && (
                          <ul className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                            {it.subItems.map((s, si) => (
                              <li key={si} className="flex items-center gap-1.5">
                                <span className="text-slate-400">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">{it.quantity}</td>
                      <td className="py-3 px-2 text-right font-mono text-slate-700">
                        {formatAriary(it.unitPrice)}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-slate-950">
                        {formatAriary(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Word Amount */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200">
                <div className="space-y-2">
                  <div className="text-xs text-slate-700 italic">
                    Arrêtée à la somme de :{' '}
                    <strong className="font-bold not-italic text-slate-900">
                      {invoice.amountInWords || `${formatAriary(advanceAmount > 0 ? advanceAmount : totalAmount)}.`}
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-600 pt-2">
                    <p className="font-bold text-slate-800">Conditions :</p>
                    <p>{invoice.conditionsText}</p>
                    {invoice.renewalTerms && <p className="mt-1">{invoice.renewalTerms}</p>}
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Total Brut :</span>
                    <span className="font-mono font-bold">{formatAriary(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-emerald-700 font-bold">
                    <span>Avance / Acompte réglé :</span>
                    <span className="font-mono">{formatAriary(advanceAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                    <span>Solde Restant Dû :</span>
                    <span className="font-mono text-indigo-700">{formatAriary(balanceDue)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <div className="text-right space-y-8">
                  <div className="text-xs font-bold text-slate-800">Le Gérant</div>
                  <div className="text-[10px] text-slate-400 italic">(Signature et cachet)</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
