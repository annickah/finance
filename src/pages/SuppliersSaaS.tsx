import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  Server,
  Cloud,
  Layers,
  CreditCard,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Globe,
  Sparkles,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary } from '../utils/formatters';
import { SupplierFormModal } from '../components/modals/SupplierFormModal';
import { Supplier } from '../types';

export const SuppliersSaaS: React.FC = () => {
  const { suppliers, paySupplierInvoice, accounts, deleteSupplier } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  const handleOpenCreate = () => {
    setSupplierToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      deleteSupplier(supplierToDelete.id);
      setSupplierToDelete(null);
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalOutstandingToSuppliers = suppliers.reduce((s, sup) => s + sup.balanceDue, 0);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/60 text-xs font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Partenaires, Hébergement & Outils SaaS
            </span>
            <span className="text-xs font-semibold text-slate-400">{suppliers.length} Fournisseurs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Fournisseurs & SaaS
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Gestion des prestataires techniques, hébergements cloud (AWS, Vercel), licences SaaS (Figma, GitHub, Google Workspace) et dettes fournisseurs.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Dettes Fournisseurs Totales
            </span>
            <span className="text-xl font-black text-rose-600 font-mono">
              {formatAriary(totalOutstandingToSuppliers)}
            </span>
          </div>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nouveau Fournisseur</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Dettes Fournisseurs en Cours
          </span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatAriary(totalOutstandingToSuppliers)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Factures d'achat à régler</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Abonnements SaaS & Cloud
          </span>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            4 Services Actifs
          </div>
          <span className="text-[11px] text-cyan-600 font-semibold">AWS, Vercel, Figma, Google</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Coût Récurrent Mensuel
          </span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1">
            {formatAriary(1450000)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Infrastructures & logiciels</span>
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Répertoire des Fournisseurs & Abonnements
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Coordonnées et statut des paiements des prestataires
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher fournisseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-cyan-500 w-48 sm:w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-cyan-300 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{supplier.name}</h4>
                    <span className="text-xs text-slate-500 font-medium block">{supplier.contact}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[10px] font-extrabold border border-cyan-200/60">
                      {supplier.category}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(supplier)}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                      title="Modifier le fournisseur"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setSupplierToDelete(supplier)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Supprimer le fournisseur"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  <div>Email : {supplier.email}</div>
                  <div>Tél : {supplier.phone}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Dette Fournisseur
                  </span>
                  <span
                    className={`text-sm font-black font-mono ${
                      supplier.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {formatAriary(supplier.balanceDue)}
                  </span>
                </div>

                {supplier.balanceDue > 0 ? (
                  <button
                    onClick={() =>
                      paySupplierInvoice(
                        supplier.id,
                        supplier.balanceDue,
                        accounts[0]?.id || '',
                        `Règlement facture ${supplier.name}`
                      )
                    }
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs"
                  >
                    Régler
                  </button>
                ) : (
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                    Soldé
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create / Edit Supplier Modal */}
      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSupplierToEdit(null);
        }}
        supplierToEdit={supplierToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {supplierToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 text-center">Confirmer la suppression</h3>
            <p className="text-xs text-slate-500 text-center mt-2">
              Êtes-vous sûr de vouloir supprimer définitivement le fournisseur{' '}
              <strong className="text-slate-800">{supplierToDelete.name}</strong> ?
            </p>
            <div className="pt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSupplierToDelete(null)}
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
