import React, { useState } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Users,
  FolderKanban,
  Wallet,
  DollarSign,
  X,
  RotateCcw,
  Download,
  ChevronDown,
  ChevronUp,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Client, Project, Account } from '../../types';

export interface DatePreset {
  id: string;
  label: string;
  startDate?: string;
  endDate?: string;
}

export const DATE_PRESETS: DatePreset[] = [
  { id: 'ALL', label: 'Toutes dates' },
  { id: 'THIS_MONTH', label: 'Ce mois (Août)', startDate: '2026-08-01', endDate: '2026-08-31' },
  { id: 'LAST_MONTH', label: 'Mois dernier (Juil)', startDate: '2026-07-01', endDate: '2026-07-31' },
  { id: 'LAST_30_DAYS', label: '30 derniers jours', startDate: '2026-07-27', endDate: '2026-08-26' },
  { id: 'Q3_2026', label: 'T3 2026', startDate: '2026-07-01', endDate: '2026-09-30' },
  { id: 'YEAR_2026', label: 'Année 2026', startDate: '2026-01-01', endDate: '2026-12-31' },
];

export interface FilterState {
  searchQuery: string;
  startDate: string;
  endDate: string;
  datePreset: string;
  clientId: string;
  projectId: string;
  accountId: string;
  status: string;
  category: string;
  minAmount: string;
  maxAmount: string;
}

export const INITIAL_FILTER_STATE: FilterState = {
  searchQuery: '',
  startDate: '',
  endDate: '',
  datePreset: 'ALL',
  clientId: 'ALL',
  projectId: 'ALL',
  accountId: 'ALL',
  status: 'ALL',
  category: 'ALL',
  minAmount: '',
  maxAmount: '',
};

interface AdvancedFilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  clients?: Client[];
  projects?: Project[];
  accounts?: Account[];
  statusOptions?: { value: string; label: string }[];
  categoryOptions?: { value: string; label: string }[];
  onExportCSV?: () => void;
  exportLabel?: string;
  totalFilteredCount?: number;
  totalItemsCount?: number;
  placeholder?: string;
  showCategoryFilter?: boolean;
  showStatusFilter?: boolean;
  showAccountFilter?: boolean;
}

export const AdvancedFilterBar: React.FC<AdvancedFilterBarProps> = ({
  filters,
  onFilterChange,
  clients = [],
  projects = [],
  accounts = [],
  statusOptions = [],
  categoryOptions = [],
  onExportCSV,
  exportLabel = 'Exporter CSV',
  totalFilteredCount,
  totalItemsCount,
  placeholder = 'Rechercher par mot-clé, référence, description...',
  showCategoryFilter = false,
  showStatusFilter = false,
  showAccountFilter = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters (excluding defaults)
  const activeFiltersCount = [
    filters.searchQuery !== '',
    filters.datePreset !== 'ALL' || filters.startDate !== '' || filters.endDate !== '',
    filters.clientId !== 'ALL',
    filters.projectId !== 'ALL',
    filters.accountId !== 'ALL',
    filters.status !== 'ALL',
    filters.category !== 'ALL',
    filters.minAmount !== '',
    filters.maxAmount !== '',
  ].filter(Boolean).length;

  const handleReset = () => {
    onFilterChange(INITIAL_FILTER_STATE);
  };

  const handleDatePresetChange = (presetId: string) => {
    const preset = DATE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.id === 'ALL') {
      onFilterChange({
        ...filters,
        datePreset: 'ALL',
        startDate: '',
        endDate: '',
      });
    } else {
      onFilterChange({
        ...filters,
        datePreset: preset.id,
        startDate: preset.startDate || '',
        endDate: preset.endDate || '',
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden transition-all">
      {/* Primary Bar: Search + Quick Presets + Expand Toggle */}
      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={placeholder}
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/50"
              title="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Date Presets on Desktop */}
        <div className="hidden xl:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl">
          {DATE_PRESETS.slice(0, 4).map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleDatePresetChange(preset.id)}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filters.datePreset === preset.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: Filter Toggle, Reset, CSV Export */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
              activeFiltersCount > 0 || isExpanded
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Filtres Avancés</span>
            {activeFiltersCount > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px] font-black">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              title="Réinitialiser tous les filtres"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          )}

          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
              title="Exporter au format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>{exportLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Advanced Filters Panel */}
      {isExpanded && (
        <div className="px-4 pb-5 pt-1 sm:px-5 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Date Range Start & End */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Période / Date Début
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    startDate: e.target.value,
                    datePreset: 'CUSTOM',
                  })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Date Fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    endDate: e.target.value,
                    datePreset: 'CUSTOM',
                  })
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* 2. Client Filter */}
            {clients.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-slate-400" />
                  Client
                </label>
                <select
                  value={filters.clientId}
                  onChange={(e) => onFilterChange({ ...filters, clientId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tous les clients ({clients.length})</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Project Filter */}
            {projects.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FolderKanban className="w-3 h-3 text-slate-400" />
                  Projet
                </label>
                <select
                  value={filters.projectId}
                  onChange={(e) => onFilterChange({ ...filters, projectId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tous les projets ({projects.length})</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 4. Account / Bank Channel Filter */}
            {showAccountFilter && accounts.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Wallet className="w-3 h-3 text-slate-400" />
                  Compte Bancaire / Canal
                </label>
                <select
                  value={filters.accountId}
                  onChange={(e) => onFilterChange({ ...filters, accountId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tous les comptes</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.provider})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 5. Status Filter (if provided) */}
            {showStatusFilter && statusOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-slate-400" />
                  Statut
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tous les statuts</option>
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 6. Category Filter (if provided) */}
            {showCategoryFilter && categoryOptions.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3 h-3 text-slate-400" />
                  Catégorie
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Toutes les catégories</option>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 7. Min Amount & Max Amount */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Montant Min (Ar)
              </label>
              <input
                type="number"
                placeholder="Ex: 1000000"
                value={filters.minAmount}
                onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Montant Max (Ar)
              </label>
              <input
                type="number"
                placeholder="Ex: 50000000"
                value={filters.maxAmount}
                onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Quick Date Presets Row (mobile & tablet) */}
          <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Raccourcis période :</span>
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleDatePresetChange(preset.id)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                  filters.datePreset === preset.id
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info Strip */}
      {totalFilteredCount !== undefined && totalItemsCount !== undefined && (
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">{totalFilteredCount}</span>
            <span>résultat(s) sur</span>
            <span className="font-semibold text-slate-800">{totalItemsCount}</span>
            {activeFiltersCount > 0 && (
              <span className="text-emerald-700 font-bold ml-1">({activeFiltersCount} filtre(s) actif(s))</span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="text-slate-500 hover:text-rose-600 font-semibold underline cursor-pointer"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};
