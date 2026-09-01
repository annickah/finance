import React from 'react';
import { X, Printer, Download, CheckCircle, Clock, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Invoice } from '../../types';
import { formatAriary, formatDate } from '../../utils/formatters';

interface InvoiceViewModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 border border-slate-200 space-y-6 relative my-8">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl font-mono border border-emerald-200">
              {invoice.invoiceNumber}
            </span>
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                invoice.status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-800'
                  : invoice.status === 'OVERDUE'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {invoice.status === 'PAID'
                ? 'PAYÉE'
                : invoice.status === 'OVERDUE'
                ? 'EN RETARD'
                : 'ÉMISE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document */}
        <div className="space-y-8 print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-400 font-black text-sm">
                  ED
                </div>
                <span className="text-xl font-black tracking-tight text-slate-950 font-mono">
                  ERAY <span className="text-emerald-500 font-sans">DIGITAL</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 font-medium">
                Solutions Digitales, Logiciels & Systèmes Embarqués
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Lot II M 45 Ankorondrano, Antananarivo 101, Madagascar
              </p>
              <p className="text-xs text-slate-400">
                NIF: 4000 892 145 • STAT: 62011 11 2021 0 10892
              </p>
              <p className="text-xs text-slate-400">
                contact@eraydigital.mg • +261 20 22 555 00
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-slate-950 font-mono tracking-tight block">
                FACTURE
              </span>
              <span className="font-mono text-sm font-bold text-indigo-600 block mt-1">
                N° {invoice.invoiceNumber}
              </span>
              <div className="text-xs text-slate-500 mt-3 space-y-0.5">
                <div>Date d'émission : <span className="font-semibold text-slate-800">{formatDate(invoice.issueDate, 'short')}</span></div>
                <div>Date d'échéance : <span className="font-semibold text-slate-800">{formatDate(invoice.dueDate, 'short')}</span></div>
              </div>
            </div>
          </div>

          {/* Client & Project Box */}
          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Facturé à :</span>
              <div className="text-sm font-extrabold text-slate-950 mt-1">{invoice.clientName}</div>
              <div className="text-xs text-slate-600 font-medium">{invoice.clientCompany}</div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projet Rattaché :</span>
              <div className="text-sm font-extrabold text-slate-950 mt-1">{invoice.projectName || 'Prestation Numérique'}</div>
              <div className="text-xs text-slate-600">Conditions : {invoice.paymentTerms || '30 jours nets'}</div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b-2 border-slate-950 text-slate-950 uppercase text-[10px] font-black tracking-wider">
                  <th className="py-2.5 px-2">Désignation</th>
                  <th className="py-2.5 px-2 text-center w-16">Qté</th>
                  <th className="py-2.5 px-2 text-right w-36">Prix Unitaire</th>
                  <th className="py-2.5 px-2 text-right w-36">Total (Ar)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-2 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-600">{formatAriary(item.unitPrice)}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-950">{formatAriary(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary Calculation */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-72 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT :</span>
                <span className="font-mono font-bold text-slate-950">{formatAriary(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (0% / Exonéré) :</span>
                <span className="font-mono font-bold text-slate-950">{formatAriary(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t border-slate-950">
                <span>Total TTC :</span>
                <span className="font-mono">{formatAriary(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Montant Déjà Réglé :</span>
                <span className="font-mono">{formatAriary(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-rose-600 pt-1 border-t border-slate-200">
                <span>Reste à Payer :</span>
                <span className="font-mono">{formatAriary(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions & Bank Details */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-900">Modalités de Règlement :</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div>
                <span className="font-semibold text-slate-800">1. Virement BNI Madagascar :</span>
                <br />
                RIB: <span className="font-mono">00004 01000 12345678901 45</span>
              </div>
              <div>
                <span className="font-semibold text-slate-800">2. Mobile Money (MVola) :</span>
                <br />
                Numéro Pro: <span className="font-mono">+261 34 00 123 45 (Eray Digital)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
