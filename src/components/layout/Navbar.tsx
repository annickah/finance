import React, { useState, useEffect } from 'react';
import {
  Bell,
  Wallet,
  Sparkles,
  ArrowRightLeft,
  Plus,
  RefreshCw,
  Search,
  Menu,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Receipt,
  FileSpreadsheet,
  ChevronDown,
  Command,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatAriary } from '../../utils/formatters';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { NavigationTab } from '../../App';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onOpenNewTx: () => void;
  onOpenNewTransfer: () => void;
  onOpenNewProject: () => void;
  onOpenNewInvoice?: () => void;
  onNavigate?: (tab: NavigationTab, metadata?: { projectId?: string; searchQuery?: string; invoiceId?: string }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNewTx,
  onOpenNewTransfer,
  onOpenNewProject,
  onOpenNewInvoice,
  onNavigate,
}) => {
  const handleTransfer = onOpenNewTransfer;
  const { totalCashBalance, alerts, resolveAlert, resetToDemoData, accounts, currentUserRole, setCurrentUserRole } =
    useFinance();
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global Keyboard shortcut for ⌘K or Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (
    tab: NavigationTab,
    metadata?: { projectId?: string; searchQuery?: string; invoiceId?: string }
  ) => {
    if (onNavigate) {
      onNavigate(tab, metadata);
    }
  };

  return (
    <>
      <header className="h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
        {/* Left Area: Mobile Hamburger + FinSet Global Search Trigger */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Search Trigger Input (Opens Global Search Command Palette) */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative w-full max-w-md cursor-pointer group"
          >
            <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
            <div className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-xl text-slate-500 font-medium transition-all flex items-center justify-between select-none">
              <span className="truncate">Rechercher projet, client, facture, recette, charge...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs group-hover:border-slate-300">
                <span>⌘</span>K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Controls & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Real-time Treasury Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 bg-slate-950 text-white rounded-xl shadow-xs border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 leading-none">
                Trésorerie Globale
              </span>
              <span className="text-xs font-black text-emerald-400 font-mono tracking-tight leading-normal mt-0.5">
                {formatAriary(totalCashBalance)}
              </span>
            </div>
          </div>

          {/* Quick Virement Button */}
          <button
            onClick={handleTransfer}
            id="navbar-transfer-btn"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-950 rounded-xl transition-colors cursor-pointer"
            title="Effectuer un virement inter-comptes"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Virement</span>
          </button>

          {/* FinSet Quick Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              id="navbar-new-action-btn"
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span className="hidden sm:inline">Créer</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-900 opacity-70" />
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Nouveau Flux Financier
                </div>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenNewTx();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Mouvement Trésorerie</span>
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    handleTransfer();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Virement Inter-comptes</span>
                </button>

                <div className="my-1 border-t border-slate-100" />
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Activités & Projets
                </div>

                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenNewProject();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nouveau Projet</span>
                </button>
                {onOpenNewInvoice && (
                  <button
                    onClick={() => {
                      setShowQuickActions(false);
                      onOpenNewInvoice();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nouvelle Facture</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notifications & Alerts */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Alertes"
            >
              <Bell className="w-4 h-4" />
              {unresolvedAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-bounce" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Alertes Trésorerie ({unresolvedAlerts.length})
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Temps réel</span>
                </div>
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {unresolvedAlerts.length === 0 ? (
                    <div className="py-6 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                      <p className="text-xs font-semibold text-slate-700">Aucune alerte critique</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">La trésorerie Eray Digital est saine.</p>
                    </div>
                  ) : (
                    unresolvedAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-xl border text-xs transition-all ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                            : 'bg-amber-50/90 border-amber-200 text-amber-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>{alert.title}</span>
                          </div>
                          <button
                            onClick={() => resolveAlert(alert.id)}
                            className="text-[10px] font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
                          >
                            Acquitter
                          </button>
                        </div>
                        <p className="text-[11px] mt-1 opacity-90 leading-relaxed">{alert.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Demo reset button */}
          <button
            onClick={resetToDemoData}
            title="Réinitialiser les données de démo"
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* User Pill / Profile Avatar with Role Switcher */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 text-emerald-400 flex items-center justify-center font-mono font-black text-xs shadow-xs border border-slate-700">
              ED
            </div>
            <div className="flex flex-col text-left leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-slate-900 hidden sm:inline">Kiady</span>
                <select
                  value={currentUserRole}
                  onChange={(e) => setCurrentUserRole(e.target.value as any)}
                  className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg cursor-pointer"
                  title="Changer de profil d'accès"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="DIRECTION">Direction</option>
                  <option value="FINANCE">Finance</option>
                  <option value="READONLY">Lecture Seule</option>
                </select>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 hidden sm:inline">Eray Digital Antananarivo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
        onOpenNewTx={onOpenNewTx}
        onOpenNewProject={onOpenNewProject}
        onOpenNewInvoice={onOpenNewInvoice}
        onOpenNewTransfer={onOpenNewTransfer}
      />
    </>
  );
};
