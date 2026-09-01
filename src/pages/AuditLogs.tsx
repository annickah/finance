import React, { useState, useMemo } from 'react';
import {
  History,
  Shield,
  Search,
  Filter,
  User,
  ArrowRight,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Edit3,
  PlusCircle,
  Trash2,
  CreditCard,
  Building2,
  Copy,
  Check,
  Eye,
  SlidersHorizontal,
  RefreshCw,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AuditLog, AuditFieldChange } from '../types';
import { formatDate } from '../utils/formatters';

export const AuditLogs: React.FC = () => {
  const { auditLogs, currentUserName, setCurrentUserName, currentUserRole } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [userFilter, setUserFilter] = useState('ALL');
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());
  const [inspectLog, setInspectLog] = useState<AuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isEditingOperator, setIsEditingOperator] = useState(false);
  const [operatorInput, setOperatorInput] = useState(currentUserName);

  // Toggle log expanded state
  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expand or collapse all
  const toggleExpandAll = () => {
    if (expandedLogIds.size === filteredLogs.length && filteredLogs.length > 0) {
      setExpandedLogIds(new Set());
    } else {
      setExpandedLogIds(new Set(filteredLogs.map((l) => l.id)));
    }
  };

  // Unique list of users from logs
  const userList = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.userName) set.add(l.userName);
    });
    return Array.from(set);
  }, [auditLogs]);

  // Unique list of entity types
  const entityList = useMemo(() => {
    const set = new Set<string>();
    auditLogs.forEach((l) => {
      if (l.entityType) set.add(l.entityType);
    });
    return Array.from(set);
  }, [auditLogs]);

  // Metrics computation
  const stats = useMemo(() => {
    let updates = 0;
    let creates = 0;
    let deletes = 0;
    let payments = 0;

    auditLogs.forEach((l) => {
      const type = l.actionType || (
        l.action.toLowerCase().includes('modif') ? 'UPDATE' :
        l.action.toLowerCase().includes('créat') ? 'CREATE' :
        l.action.toLowerCase().includes('suppr') ? 'DELETE' :
        l.action.toLowerCase().includes('paiement') || l.action.toLowerCase().includes('encaisse') ? 'PAYMENT' : 'OTHER'
      );

      if (type === 'UPDATE') updates++;
      else if (type === 'CREATE') creates++;
      else if (type === 'DELETE') deletes++;
      else if (type === 'PAYMENT') payments++;
    });

    return {
      total: auditLogs.length,
      updates,
      creates,
      deletes,
      payments,
    };
  }, [auditLogs]);

  // Filtering
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.oldValue && log.oldValue.toLowerCase().includes(q)) ||
        (log.newValue && log.newValue.toLowerCase().includes(q)) ||
        (log.changes && log.changes.some((c) => c.label.toLowerCase().includes(q) || String(c.oldVal).toLowerCase().includes(q) || String(c.newVal).toLowerCase().includes(q)));

      const matchesAction =
        actionFilter === 'ALL' ||
        (log.actionType && log.actionType === actionFilter) ||
        log.action === actionFilter ||
        (actionFilter === 'UPDATE' && log.action.toLowerCase().includes('modif')) ||
        (actionFilter === 'CREATE' && log.action.toLowerCase().includes('créat')) ||
        (actionFilter === 'DELETE' && log.action.toLowerCase().includes('suppr')) ||
        (actionFilter === 'PAYMENT' && (log.action.toLowerCase().includes('paiement') || log.action.toLowerCase().includes('encaisse')));

      const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
      const matchesUser = userFilter === 'ALL' || log.userName === userFilter;

      return matchesSearch && matchesAction && matchesEntity && matchesUser;
    });
  }, [auditLogs, searchQuery, actionFilter, entityFilter, userFilter]);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Horodatage', 'Utilisateur', 'Action', 'Type Action', 'Entite', 'ID Entite', 'Details', 'Valeur Precedente', 'Nouvelle Valeur'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.actionType || ''}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${(l.oldValue || '').replace(/"/g, '""')}"`,
      `"${(l.newValue || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Logs_Eray_Digital_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Audit_Logs_Eray_Digital_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Helper for semantic badge colors
  const getActionBadge = (action: string, actionType?: string) => {
    const type = actionType || (
      action.toLowerCase().includes('créat') || action.toLowerCase().includes('nouveau') ? 'CREATE' :
      action.toLowerCase().includes('modif') || action.toLowerCase().includes('mise à jour') ? 'UPDATE' :
      action.toLowerCase().includes('suppr') || action.toLowerCase().includes('annul') ? 'DELETE' :
      action.toLowerCase().includes('paiement') || action.toLowerCase().includes('encaisse') || action.toLowerCase().includes('règlement') ? 'PAYMENT' :
      action.toLowerCase().includes('virement') || action.toLowerCase().includes('transfert') ? 'TRANSFER' :
      action.toLowerCase().includes('clôture') ? 'CLOSE_MONTH' : 'OTHER'
    );

    switch (type) {
      case 'UPDATE':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-500',
          icon: Edit3,
          label: 'Modification',
        };
      case 'CREATE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-500',
          icon: PlusCircle,
          label: 'Création',
        };
      case 'DELETE':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
          dot: 'bg-rose-500',
          icon: Trash2,
          label: 'Suppression',
        };
      case 'PAYMENT':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
          dot: 'bg-blue-500',
          icon: CreditCard,
          label: 'Règlement / Flux',
        };
      case 'TRANSFER':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
          dot: 'bg-indigo-500',
          icon: RefreshCw,
          label: 'Virement',
        };
      case 'CLOSE_MONTH':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200/80',
          dot: 'bg-purple-500',
          icon: CheckCircle2,
          label: 'Clôture Mensuelle',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: History,
          label: 'Événement',
        };
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Piste d'Audit & Journalisation Intégrale
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Conformité financière Eray Digital • Horodatage certifié
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Journal des Modifications & Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Enregistrement automatique et infalsifiable de chaque opération financière : utilisateur responsable, horodatage, et comparaison détaillée <span className="font-semibold text-slate-700">Valeur Précédente (Avant) vs Nouvelle Valeur (Après)</span>.
          </p>
        </div>

        {/* Operator Switcher & Export */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          {/* Active Operator Banner */}
          <div className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Opérateur actif</span>
              {isEditingOperator ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <input
                    type="text"
                    value={operatorInput}
                    onChange={(e) => setOperatorInput(e.target.value)}
                    className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32"
                    placeholder="Nom..."
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (operatorInput.trim()) {
                        setCurrentUserName(operatorInput.trim());
                      }
                      setIsEditingOperator(false);
                    }}
                    className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-md"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900">{currentUserName}</span>
                  <button
                    onClick={() => {
                      setOperatorInput(currentUserName);
                      setIsEditingOperator(true);
                    }}
                    title="Changer le nom de l'opérateur"
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded-md hover:bg-slate-200/60"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Événements</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">{stats.total}</p>
          <span className="text-[10px] text-slate-400">Traces d'activité</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Modifications</span>
            <Edit3 className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-amber-700 font-mono">{stats.updates}</p>
          <span className="text-[10px] text-amber-600 font-medium">Comparatifs Avant/Après</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Créations</span>
            <PlusCircle className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-emerald-700 font-mono">{stats.creates}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Transactions & Factures</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Règlements</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-blue-700 font-mono">{stats.payments}</p>
          <span className="text-[10px] text-blue-600 font-medium">Encaissements & Paiements</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Suppressions</span>
            <Trash2 className="w-4 h-4" />
          </div>
          <p className="text-xl font-black text-rose-700 font-mono">{stats.deletes}</p>
          <span className="text-[10px] text-rose-600 font-medium">Annulations tracées</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pb-4 border-b border-slate-100">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher détails, utilisateur, valeur avant/après, montant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
            />
          </div>

          {/* Action Filter */}
          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Toutes les actions</option>
              <option value="UPDATE">Modifications (Diff)</option>
              <option value="CREATE">Créations</option>
              <option value="PAYMENT">Règlements & Encaissements</option>
              <option value="DELETE">Suppressions & Annulations</option>
              <option value="TRANSFER">Virements</option>
              <option value="CLOSE_MONTH">Clôtures</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Toutes les entités</option>
              {entityList.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>

          {/* User Filter */}
          <div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Tous les utilisateurs</option>
              {userList.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Header & Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{filteredLogs.length}</span>
            <span>entrée(s) trouvée(s)</span>
            {(searchQuery || actionFilter !== 'ALL' || entityFilter !== 'ALL' || userFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActionFilter('ALL');
                  setEntityFilter('ALL');
                  setUserFilter('ALL');
                }}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold underline ml-2"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          <button
            onClick={toggleExpandAll}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {expandedLogIds.size === filteredLogs.length && filteredLogs.length > 0
              ? 'Replier tous les diffs'
              : 'Déplier tous les diffs'}
          </button>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-3 w-8"></th>
                <th className="py-3 px-3">Date & Heure</th>
                <th className="py-3 px-3">Utilisateur</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entité & ID</th>
                <th className="py-3 px-3">Détails & Modifications (Avant vs Après)</th>
                <th className="py-3 px-3 text-right">Inspecter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Aucun événement ne correspond aux critères de recherche.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action, log.actionType);
                  const isExpanded = expandedLogIds.has(log.id);
                  const hasDiff = Boolean(log.oldValue || log.newValue || (log.changes && log.changes.length > 0));
                  const BadgeIcon = badge.icon;

                  // Parse timestamp
                  const logDate = new Date(log.timestamp);
                  const timeString = isNaN(logDate.getTime())
                    ? ''
                    : logDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isExpanded ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        {/* Expand Icon */}
                        <td className="py-3.5 px-3">
                          {hasDiff ? (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="p-1 rounded hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors"
                              title={isExpanded ? 'Masquer le comparatif' : 'Voir le comparatif complet'}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-700" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <div className="w-4" />
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-slate-700 font-bold">
                              {formatDate(log.timestamp, 'short')}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {timeString || log.timestamp}
                            </span>
                          </div>
                        </td>

                        {/* User */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">
                              {log.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 block">
                                {log.userName}
                              </span>
                              {log.userRole && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <BadgeIcon className="w-3 h-3" />
                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono text-[11px] text-slate-800 font-bold">
                              {log.entityType}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              #{log.entityId}
                            </span>
                          </div>
                        </td>

                        {/* Details & Quick Diff */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-1.5">
                            <p className="text-slate-800 font-medium leading-snug">
                              {log.details}
                            </p>

                            {/* Inline Diff Preview if not expanded */}
                            {!isExpanded && (log.oldValue || log.newValue) && (
                              <div className="flex items-center gap-2 flex-wrap text-[11px] font-mono">
                                {log.oldValue && (
                                  <span className="bg-rose-50 border border-rose-200/70 text-rose-800 px-2 py-0.5 rounded-md line-through truncate max-w-xs">
                                    {log.oldValue}
                                  </span>
                                )}
                                {log.oldValue && log.newValue && (
                                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                                )}
                                {log.newValue && (
                                  <span className="bg-emerald-50 border border-emerald-200/70 text-emerald-800 font-bold px-2 py-0.5 rounded-md truncate max-w-xs">
                                    {log.newValue}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Field tags preview */}
                            {!isExpanded && log.changes && log.changes.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {log.changes.map((c, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold border border-slate-200/60"
                                  >
                                    {c.label}: <span className="line-through text-rose-600">{String(c.oldVal ?? '-')}</span> ➔ <span className="text-emerald-700 font-bold">{String(c.newVal)}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Inspect Button */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setInspectLog(log)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
                            title="Inspecter l'événement complet"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Comparison View */}
                      {isExpanded && (
                        <tr className="bg-slate-50/70 border-b border-slate-200">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
                                  Comparaison Détaillée des Changements (Avant vs Après)
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  ID Trace: {log.id}
                                </span>
                              </div>

                              {/* Field-by-Field Breakdown Table */}
                              {log.changes && log.changes.length > 0 ? (
                                <div className="overflow-x-auto rounded-xl border border-slate-100">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase">
                                        <th className="py-2 px-3 text-left">Champ Modifié</th>
                                        <th className="py-2 px-3 text-left">Valeur Précédente (Avant)</th>
                                        <th className="py-2 px-3 text-left">Nouvelle Valeur (Après)</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {log.changes.map((change, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50">
                                          <td className="py-2.5 px-3 font-bold text-slate-800">
                                            {change.label}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono">
                                            {change.oldVal !== null && change.oldVal !== undefined ? (
                                              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200/60 line-through">
                                                {String(change.oldVal)}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400 italic">(Vide / Création)</span>
                                            )}
                                          </td>
                                          <td className="py-2.5 px-3 font-mono">
                                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold">
                                              {String(change.newVal)}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                /* Side-by-side text block */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-rose-700 block">
                                      Valeur Précédente (Avant)
                                    </span>
                                    <p className="text-xs font-mono text-rose-900">
                                      {log.oldValue || '(Aucune valeur antérieure enregistrée)'}
                                    </p>
                                  </div>
                                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                                      Nouvelle Valeur (Après)
                                    </span>
                                    <p className="text-xs font-mono text-emerald-900 font-bold">
                                      {log.newValue || log.details}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-base font-black text-slate-900">Inspecteur d'Événement</h2>
                  <p className="text-xs text-slate-500 font-mono">Trace #{inspectLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Horodatage précis</span>
                  <span className="font-mono font-bold text-slate-800">{inspectLog.timestamp}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Opérateur</span>
                  <span className="font-bold text-slate-800">{inspectLog.userName} ({inspectLog.userRole || 'Utilisateur'})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Type d'Action</span>
                  <span className="font-bold text-slate-800">{inspectLog.action}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Entité ciblée</span>
                  <span className="font-mono font-bold text-slate-800">{inspectLog.entityType} ({inspectLog.entityId})</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">Détails de l'opération</span>
                <p className="text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  {inspectLog.details}
                </p>
              </div>

              {/* Before vs After comparison in Modal */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Comparatif des valeurs</span>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                    <span className="font-bold text-rose-800 block text-[10px] uppercase">Valeur Précédente (Avant) :</span>
                    <span className="font-mono text-rose-900">{inspectLog.oldValue || '(Non renseigné ou Création)'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-800 block text-[10px] uppercase">Nouvelle Valeur (Après) :</span>
                    <span className="font-mono font-bold text-emerald-900">{inspectLog.newValue || inspectLog.details}</span>
                  </div>
                </div>
              </div>

              {/* Raw JSON inspection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-700">Payload JSON vérifié</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(inspectLog, null, 2), inspectLog.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    {copiedId === inspectLog.id ? (
                      <>
                        <Check className="w-3 h-3" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copier JSON
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[10px] font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(inspectLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Fermer l'inspecteur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
