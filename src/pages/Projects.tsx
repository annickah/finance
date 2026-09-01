import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  PieChart as PieIcon,
  CheckCircle2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Project, ProjectCategory, ProjectStatus } from '../types';
import { formatAriary, formatPercent, formatDate, calculateMargin, getMarginBadgeClasses } from '../utils/formatters';
import { NewProjectModal } from '../components/modals/NewProjectModal';

interface ProjectsProps {
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

export const Projects: React.FC<ProjectsProps> = ({
  onSelectProject,
  onOpenNewProject,
}) => {
  const { projects, deleteProject } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesStat = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  // Global Portfolio Stats
  const totalSellingPortfolio = projects.reduce((s, p) => s + p.sellingPrice, 0);
  const totalCostsPortfolio = projects.reduce(
    (s, p) => s + p.realCosts.reduce((cs, c) => cs + (c.realAmount || c.plannedAmount), 0),
    0
  );
  const { grossMargin: totalMarginPortfolio, marginRate: portfolioMarginRate } = calculateMargin(
    totalSellingPortfolio,
    totalCostsPortfolio
  );

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <FolderKanban className="w-3.5 h-3.5" />
              Catalogue & Rentabilité
            </span>
            <span className="text-xs font-semibold text-slate-400">{projects.length} projets</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Projets Digitaux & Marges
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Calcul en direct de la marge brute (Prix de Vente - Coûts Réels) et suivi du taux de rentabilité.
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouveau Projet</span>
        </button>
      </div>

      {/* Portfolio FinSet Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">CA Global Portefeuille</span>
          <div className="text-xl font-black text-slate-950 font-mono mt-1.5">
            {formatAriary(totalSellingPortfolio)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Sur tous les contrats signés</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Coûts Réels Engagés</span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1.5">
            {formatAriary(totalCostsPortfolio)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Développeurs, serveurs, API</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Marge Brute Globale</span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1.5">
            {formatAriary(totalMarginPortfolio)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Bénéfice opérationnel brut</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Taux de Marge Moyen</span>
          <div className="text-xl font-black text-indigo-600 font-mono mt-1.5">
            {formatPercent(portfolioMarginRate)}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">
            {portfolioMarginRate >= 40 ? '✓ Rentabilité excellente' : '✓ Rentabilité conforme'}
          </span>
        </div>
      </div>

      {/* FinSet Search & Filtering Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher code, projet, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Toutes Catégories</option>
            <option value="WEBSITE">Site Web</option>
            <option value="ECOMMERCE">E-Commerce</option>
            <option value="SOFTWARE">Logiciel SaaS/ERP</option>
            <option value="MOBILE_APP">App Mobile</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="EMBEDDED">Embedded / IoT</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Tous Statuts</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="COMPLETED">Terminé</option>
            <option value="LEAD">Prospect</option>
          </select>
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const totalCost = project.realCosts.reduce(
            (sum, c) => sum + (c.realAmount || c.plannedAmount),
            0
          );
          const { grossMargin, marginRate } = calculateMargin(project.sellingPrice, totalCost);
          const badge = getMarginBadgeClasses(marginRate);

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-extrabold text-xs font-mono border border-indigo-100">
                      {project.code}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {project.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        project.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : project.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {project.status === 'COMPLETED' ? 'Terminé' : 'En cours'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToEdit(project);
                      }}
                      className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                      title="Modifier le projet"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      title="Supprimer le projet"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-sm text-slate-950 mt-3 group-hover:text-emerald-700 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{project.clientName}</p>

                {/* Progress bar */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                    <span>Avancement : {project.progressPercent}%</span>
                    <span>
                      Encaissé : {formatAriary(project.totalCollected, { compact: true })} / {formatAriary(project.sellingPrice, { compact: true })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Box */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Prix Vente</span>
                  <div className="text-xs font-black text-slate-950 font-mono mt-0.5">
                    {formatAriary(project.sellingPrice)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Coûts Réels</span>
                  <div className="text-xs font-black text-rose-600 font-mono mt-0.5">
                    {formatAriary(totalCost)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Marge</span>
                  <div className="text-xs font-black text-emerald-600 font-mono mt-0.5">
                    {formatAriary(grossMargin)}
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 border ${badge.bg}`}>
                    {formatPercent(marginRate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Project Modal */}
      <NewProjectModal
        isOpen={Boolean(projectToEdit)}
        onClose={() => setProjectToEdit(null)}
        projectToEdit={projectToEdit}
      />

      {/* Delete Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 text-center">Confirmer la suppression</h3>
            <p className="text-xs text-slate-500 text-center mt-2">
              Êtes-vous sûr de vouloir supprimer définitivement le projet{' '}
              <strong className="text-slate-800">{projectToDelete.name}</strong> ({projectToDelete.code}) ?
              Cette action est irréversible.
            </p>
            <div className="pt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
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
