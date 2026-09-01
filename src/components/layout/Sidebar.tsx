import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar,
  TrendingUp,
  Target,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  FileText,
  Users,
  Building2,
  Coins,
  BookOpen,
  FileSpreadsheet,
  Columns3,
  Scale,
  DollarSign,
  BarChart3,
  Lock,
  Bell,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { NavigationTab } from '../../App';
import { useFinance } from '../../context/FinanceContext';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen = false,
  onClose,
}) => {
  const { alerts, projects, invoices, journalEntries } = useFinance();
  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const overdueCount = invoices.filter((i) => i.status === 'OVERDUE').length;

  const sections: {
    title: string;
    items: {
      id: NavigationTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: 'PILOTAGE STRATÉGIQUE',
      items: [
        {
          id: 'DASHBOARD',
          label: 'Tableau de Bord',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'bg-slate-800 text-slate-200 border border-slate-700',
        },
        {
          id: 'PROJECTS',
          label: 'Projets & Rentabilité',
          icon: FolderKanban,
        },
        {
          id: 'PLANNING',
          label: 'Planning Financier',
          icon: Calendar,
        },
        {
          id: 'FORECAST',
          label: 'Prévisions & Scénarios',
          icon: TrendingUp,
        },
        {
          id: 'BUDGETS',
          label: 'Budgets Mensuels',
          icon: Target,
        },
      ],
    },
    {
      title: 'FLUX & OPÉRATIONS',
      items: [
        {
          id: 'REVENUES',
          label: 'Revenus & Encaissements',
          icon: ArrowDownLeft,
        },
        {
          id: 'EXPENSES',
          label: 'Dépenses & Charges',
          icon: ArrowUpRight,
        },
        {
          id: 'TREASURY',
          label: 'Trésorerie & Comptes',
          icon: Landmark,
        },
        {
          id: 'INVOICES',
          label: 'Facturation & PDF',
          icon: FileText,
          badge: overdueCount > 0 ? `${overdueCount}` : undefined,
          badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
        },
        {
          id: 'CLIENTS',
          label: 'Clients & Créances',
          icon: Users,
        },
        {
          id: 'SUPPLIERS',
          label: 'Fournisseurs & SaaS',
          icon: Building2,
        },
        {
          id: 'COMMISSIONS',
          label: 'Commissions',
          icon: Coins,
        },
      ],
    },
    {
      title: 'COMPTABILITÉ GÉNÉRALE (PCG)',
      items: [
        {
          id: 'PCG_CHART',
          label: 'Plan Comptable',
          icon: BookOpen,
        },
        {
          id: 'PCG_JOURNAL',
          label: 'Journal Comptable',
          icon: FileSpreadsheet,
        },
        {
          id: 'PCG_LEDGER',
          label: 'Grand Livre',
          icon: Columns3,
        },
        {
          id: 'PCG_BALANCE',
          label: 'La Balance',
          icon: Scale,
        },
        {
          id: 'PCG_INCOME',
          label: 'Compte de Résultat',
          icon: DollarSign,
        },
        {
          id: 'PCG_BILAN',
          label: 'Bilan Comptable',
          icon: Landmark,
        },
      ],
    },
    {
      title: 'ANALYSE & GOUVERNANCE',
      items: [
        {
          id: 'FORECAST_VS_REAL',
          label: 'Prévisionnel vs Réel',
          icon: Scale,
        },
        {
          id: 'REPORTS',
          label: 'Rapports Financiers',
          icon: BarChart3,
        },
        {
          id: 'CLOSING',
          label: 'Clôture Mensuelle',
          icon: Lock,
        },
        {
          id: 'ALERTS',
          label: 'Alertes & Risques',
          icon: Bell,
          badge: unresolvedAlerts.length > 0 ? unresolvedAlerts.length : undefined,
          badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
        },
        {
          id: 'AUDIT',
          label: "Journal d'Audit",
          icon: Clock,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 select-none border-r border-slate-200/80 shadow-xs">
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/25">
            <span className="text-xl font-black font-sans">E</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base tracking-tight text-slate-900">
                Eray Digital
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-extrabold tracking-wide uppercase border border-indigo-100">
                FINANCE OS
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-semibold tracking-normal">
              Gestion financière & Trésorerie (Ar)
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-4 py-5 space-y-6 overflow-y-auto custom-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="px-3 pb-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentTab === item.id ||
                  (item.id === 'PROJECTS' && currentTab === 'PROJECT_DETAIL');

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id.toLowerCase()}`}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (onClose) onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 text-left group cursor-pointer ${
                      isActive
                        ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Currency Card */}
      <div className="p-4 m-4 rounded-2xl bg-indigo-50/70 border border-indigo-100/90">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Devise Principale
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold text-[10px]">
            Ariary (Ar)
          </span>
        </div>
        <p className="text-[11px] text-indigo-950/80 mt-1.5 leading-relaxed font-medium">
          Tous les montants sont exprimés en <strong className="text-indigo-900 font-bold">Ariary (Ar)</strong> selon le standard Eray Digital.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-72 shrink-0 flex-col h-full z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
