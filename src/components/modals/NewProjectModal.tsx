import React, { useState, useEffect } from 'react';
import { X, FolderKanban, Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { ProjectCategory, ProjectStatus, CostCategory, ProjectCostItem, Project } from '../../types';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, projectToEdit }) => {
  const { clients, addProject, updateProject } = useFinance();
  const isEditing = Boolean(projectToEdit);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('WEBSITE');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [status, setStatus] = useState<ProjectStatus>('IN_PROGRESS');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [description, setDescription] = useState('');

  // Initial planned costs
  const [plannedCosts, setPlannedCosts] = useState<
    Array<{ label: string; category: CostCategory; plannedAmount: number }>
  >([
    { label: 'Commission Développeurs', category: 'DEV_COMMISSION', plannedAmount: 0 },
    { label: 'Commission Commerciale', category: 'SALES_COMMISSION', plannedAmount: 0 },
    { label: 'Hébergement / Cloud', category: 'CLOUD', plannedAmount: 0 },
  ]);

  useEffect(() => {
    if (!isOpen) return;

    if (projectToEdit) {
      setName(projectToEdit.name);
      setCategory(projectToEdit.category);
      setClientId(projectToEdit.clientId);
      setSellingPrice(projectToEdit.sellingPrice);
      setStatus(projectToEdit.status);
      setStartDate(projectToEdit.startDate);
      setDeliveryDate(projectToEdit.deliveryDate);
      setDescription(projectToEdit.description || '');
      setPlannedCosts(
        projectToEdit.plannedCosts.map((c) => ({
          label: c.label,
          category: c.category,
          plannedAmount: c.plannedAmount,
        }))
      );
    } else {
      setName('');
      setCategory('WEBSITE');
      setClientId(clients[0]?.id || '');
      setSellingPrice('');
      setStatus('IN_PROGRESS');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDeliveryDate('');
      setDescription('');
      setPlannedCosts([
        { label: 'Commission Développeurs', category: 'DEV_COMMISSION', plannedAmount: 0 },
        { label: 'Commission Commerciale', category: 'SALES_COMMISSION', plannedAmount: 0 },
        { label: 'Hébergement / Cloud', category: 'CLOUD', plannedAmount: 0 },
      ]);
    }
  }, [isOpen, projectToEdit, clients]);

  if (!isOpen) return null;

  const handleAddCostRow = () => {
    setPlannedCosts((prev) => [
      ...prev,
      { label: '', category: 'SUBCONTRACTING', plannedAmount: 0 },
    ]);
  };

  const handleRemoveCostRow = (index: number) => {
    setPlannedCosts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCostChange = (
    index: number,
    field: 'label' | 'category' | 'plannedAmount',
    val: string | number
  ) => {
    setPlannedCosts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: val } : c))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice || Number(sellingPrice) <= 0 || !clientId) return;

    const selectedClient = clients.find((c) => c.id === clientId);

    const formattedCosts: ProjectCostItem[] = plannedCosts
      .filter((c) => c.label.trim() !== '' && c.plannedAmount > 0)
      .map((c, idx) => ({
        id: `cost-init-${idx}-${Date.now()}`,
        label: c.label,
        category: c.category,
        plannedAmount: Number(c.plannedAmount),
        realAmount: Number(c.plannedAmount),
        isPaid: false,
      }));

    if (isEditing && projectToEdit) {
      updateProject(projectToEdit.id, {
        name,
        category,
        clientId,
        clientName: selectedClient ? `${selectedClient.company || selectedClient.name}` : projectToEdit.clientName,
        sellingPrice: Number(sellingPrice),
        status,
        startDate,
        deliveryDate: deliveryDate || startDate,
        description,
      });
    } else {
      addProject({
        name,
        category,
        clientId,
        clientName: selectedClient ? `${selectedClient.company || selectedClient.name}` : 'Client Eray',
        sellingPrice: Number(sellingPrice),
        status,
        startDate,
        deliveryDate: deliveryDate || startDate,
        progressPercent: 0,
        totalCollected: 0,
        description,
        plannedCosts: formattedCosts,
        realCosts: formattedCosts,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Mettez à jour les informations et le budget du projet'
                  : 'Configurez le prix de vente et les coûts budgétés'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom du Projet *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Refonte Portail E-Commerce & Marketplace"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catégorie de Projet *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                <option value="WEBSITE">Site Web Institutionnel</option>
                <option value="ECOMMERCE">E-Commerce & Marketplace</option>
                <option value="SOFTWARE">Logiciel SaaS / ERP</option>
                <option value="MOBILE_APP">Application Mobile iOS / Android</option>
                <option value="MAINTENANCE">Maintenance & Infogérance</option>
                <option value="EMBEDDED">Embedded / Électronique & IoT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Client Commanditaire *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none bg-white"
              >
                {clients.map((cli) => (
                  <option key={cli.id} value={cli.id}>
                    {cli.company || cli.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selling Price & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prix de Vente (Ar) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  step="50000"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="ex: 25000000"
                  className="w-full pl-3 pr-8 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">Ar</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date de livraison estimée
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description & Périmètre fonctionnel
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Spécifications clés, stack technique, jalons..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none resize-none"
            />
          </div>

          {/* Cost Items Breakdown (creation only — costs are edited from the project detail page afterwards) */}
          {!isEditing && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  Budget Prévisionnel des Coûts Directs
                </label>
                <button
                  type="button"
                  onClick={handleAddCostRow}
                  className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter un coût
                </button>
              </div>

              <div className="space-y-2">
                {plannedCosts.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="text"
                      placeholder="Libellé du coût"
                      value={item.label}
                      onChange={(e) => handleCostChange(idx, 'label', e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => handleCostChange(idx, 'category', e.target.value as CostCategory)}
                      className="w-36 px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value="DEV_COMMISSION">Commission Dev</option>
                      <option value="SALES_COMMISSION">Commission Sales</option>
                      <option value="CLOUD">Cloud & AWS</option>
                      <option value="HOSTING">Hébergement / CDN</option>
                      <option value="DOMAIN">Nom de Domaine</option>
                      <option value="API">Passerelles & API</option>
                      <option value="SUBCONTRACTING">Sous-traitance</option>
                      <option value="TRAVEL">Déplacements</option>
                      <option value="HARDWARE">Matériel / IoT</option>
                      <option value="OTHER">Autre coût</option>
                    </select>
                    <div className="relative w-32">
                      <input
                        type="number"
                        placeholder="Montant Ar"
                        value={item.plannedAmount || ''}
                        onChange={(e) =>
                          handleCostChange(idx, 'plannedAmount', e.target.value === '' ? 0 : Number(e.target.value))
                        }
                        className="w-full pl-2 pr-6 py-1.5 text-xs border border-slate-300 rounded bg-white font-medium"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-bold">Ar</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCostRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition-colors"
            >
              {isEditing ? 'Enregistrer les modifications' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
