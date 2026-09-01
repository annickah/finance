import React, { useState } from 'react';
import {
  Users,
  Search,
  Building2,
  Phone,
  Mail,
  Receipt,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';
import { ClientFormModal } from '../components/modals/ClientFormModal';
import { Client } from '../types';

export const ClientsReceivables: React.FC = () => {
  const { clients, invoices, outstandingReceivables, overdueReceivables, deleteClient } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const handleOpenCreate = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const filteredClients = clients.filter((c) => {
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalOutstanding = clients.reduce((s, c) => s + c.outstandingBalance, 0);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Répertoire B2B & Encours Clients
            </span>
            <span className="text-xs font-semibold text-slate-400">{clients.length} Clients Partenaires</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Clients & Créances
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Suivi des portefeuilles clients, des créances commerciales en cours, des historiques de règlement et de la solvabilité.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Créances Totales à Recouvrer
            </span>
            <span className="text-xl font-black text-amber-600 font-mono">
              {formatAriary(outstandingReceivables)}
            </span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouveau Client</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Créances Clients
          </span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            {formatAriary(outstandingReceivables)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Factures en attente de solde</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Créances Échues (En Retard)
          </span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatAriary(overdueReceivables)}
          </div>
          <span className="text-[11px] text-rose-600 font-semibold">Priorité de relance commerciale</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Délai Moyen de Paiement (DSO)
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            18 jours
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Très bon comportement payeur</span>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Fiches Clients & Encours Financiers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordonnées, volume facturé et restant dû par entreprise
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher client, société..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const clientInvoices = invoices.filter((i) => i.clientCompany === client.company);
            const unpaidCount = clientInvoices.filter((i) => i.status !== 'PAID').length;

            return (
              <div
                key={client.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{client.company}</h4>
                      <span className="text-xs text-slate-500 font-medium block">{client.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-extrabold">
                        {clientInvoices.length} factures
                      </span>
                      <button
                        onClick={(e) => handleOpenEdit(client, e)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                        title="Modifier le client"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setClientToDelete(client);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        title="Supprimer le client"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Créance en cours
                    </span>
                    <span
                      className={`text-sm font-black font-mono ${
                        client.outstandingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatAriary(client.outstandingBalance)}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      client.outstandingBalance > 0
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {client.outstandingBalance > 0 ? `${unpaidCount} en attente` : 'À jour'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Client Modal */}
      <ClientFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 text-center">Confirmer la suppression</h3>
            <p className="text-xs text-slate-500 text-center mt-2">
              Êtes-vous sûr de vouloir supprimer définitivement le client{' '}
              <strong className="text-slate-800">{clientToDelete.company}</strong> ({clientToDelete.name}) ?
              Cette action n'affecte pas les factures déjà émises.
            </p>
            <div className="pt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
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
    </div>
  );
};
