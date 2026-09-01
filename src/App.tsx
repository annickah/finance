import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

// Page Imports
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { PlanningFinancier } from './pages/PlanningFinancier';
import { ForecastPlanning } from './pages/ForecastPlanning';
import { BudgetsMensuels } from './pages/BudgetsMensuels';
import { RevenuesReceipts } from './pages/RevenuesReceipts';
import { ExpensesCharges } from './pages/ExpensesCharges';
import { Treasury } from './pages/Treasury';
import { InvoicesPDF } from './pages/InvoicesPDF';
import { ClientsReceivables } from './pages/ClientsReceivables';
import { SuppliersSaaS } from './pages/SuppliersSaaS';
import { Commissions } from './pages/Commissions';

// PCG Comptabilité Pages
import { PcgChart } from './pages/PcgChart';
import { PcgJournal } from './pages/PcgJournal';
import { PcgLedger } from './pages/PcgLedger';
import { PcgBalance } from './pages/PcgBalance';
import { PcgIncome } from './pages/PcgIncome';
import { PcgBilan } from './pages/PcgBilan';

// Analyse & Gouvernance Pages
import { ForecastVsReal } from './pages/ForecastVsReal';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { MonthlyClosing } from './pages/MonthlyClosing';
import { RiskAlerts } from './pages/RiskAlerts';
import { AuditLogs } from './pages/AuditLogs';

// Modals
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { NewTransferModal } from './components/modals/NewTransferModal';
import { NewProjectModal } from './components/modals/NewProjectModal';
import { NewInvoiceModal } from './components/modals/NewInvoiceModal';
import { NewJournalEntryModal } from './components/modals/NewJournalEntryModal';

export type NavigationTab =
  | 'DASHBOARD'
  | 'PROJECTS'
  | 'PROJECT_DETAIL'
  | 'PLANNING'
  | 'FORECAST'
  | 'BUDGETS'
  | 'REVENUES'
  | 'EXPENSES'
  | 'TREASURY'
  | 'INVOICES'
  | 'CLIENTS'
  | 'SUPPLIERS'
  | 'COMMISSIONS'
  | 'PCG_CHART'
  | 'PCG_JOURNAL'
  | 'PCG_LEDGER'
  | 'PCG_BALANCE'
  | 'PCG_INCOME'
  | 'PCG_BILAN'
  | 'FORECAST_VS_REAL'
  | 'REPORTS'
  | 'CLOSING'
  | 'ALERTS'
  | 'AUDIT';

const MainApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('DASHBOARD');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [isNewTransferOpen, setIsNewTransferOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [isNewJournalOpen, setIsNewJournalOpen] = useState(false);
  const [preselectedInvoiceProjectId, setPreselectedInvoiceProjectId] = useState<string | undefined>(undefined);

  const { addTransaction, addTransfer, addProject, addInvoice } = useFinance();

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentTab('PROJECT_DETAIL');
  };

  const handleOpenNewInvoiceWithProject = (projectId?: string) => {
    setPreselectedInvoiceProjectId(projectId);
    setIsNewInvoiceOpen(true);
  };

  const handleCloseProjectDetail = () => {
    setSelectedProjectId(null);
    setCurrentTab('PROJECTS');
  };

  const handleNavigate = (
    tab: NavigationTab,
    metadata?: { projectId?: string; searchQuery?: string; invoiceId?: string }
  ) => {
    if (metadata?.projectId) {
      setSelectedProjectId(metadata.projectId);
      setCurrentTab('PROJECT_DETAIL');
      return;
    }
    if (tab !== 'PROJECT_DETAIL') {
      setSelectedProjectId(null);
    }
    setCurrentTab(tab);
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'PROJECT_DETAIL') {
            setSelectedProjectId(null);
          }
          setCurrentTab(tab);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navigation Bar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenNewTx={() => setIsNewTxOpen(true)}
          onOpenNewTransfer={() => setIsNewTransferOpen(true)}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenNewInvoice={() => handleOpenNewInvoiceWithProject(undefined)}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Page Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Pilotage Stratégique */}
            {currentTab === 'DASHBOARD' && (
              <Dashboard
                onNavigateToProjects={() => setCurrentTab('PROJECTS')}
                onNavigateToTreasury={() => setCurrentTab('TREASURY')}
                onNavigateToForecast={() => setCurrentTab('FORECAST')}
                onNavigateToInvoices={() => setCurrentTab('INVOICES')}
                onNavigateToBilan={() => setCurrentTab('PCG_BILAN')}
                onNavigateToCommissions={() => setCurrentTab('COMMISSIONS')}
                onNavigateToExpenses={() => setCurrentTab('EXPENSES')}
                onSelectProject={handleSelectProject}
              />
            )}

            {currentTab === 'PROJECTS' && (
              <Projects
                onSelectProject={handleSelectProject}
                onOpenNewProject={() => setIsNewProjectOpen(true)}
              />
            )}

            {currentTab === 'PROJECT_DETAIL' && selectedProjectId && (
              <ProjectDetail
                projectId={selectedProjectId}
                onBack={handleCloseProjectDetail}
                onOpenInvoiceModal={handleOpenNewInvoiceWithProject}
              />
            )}

            {currentTab === 'PLANNING' && <PlanningFinancier />}

            {currentTab === 'FORECAST' && <ForecastPlanning />}

            {currentTab === 'BUDGETS' && <BudgetsMensuels />}

            {/* Flux & Opérations */}
            {currentTab === 'REVENUES' && <RevenuesReceipts />}

            {currentTab === 'EXPENSES' && <ExpensesCharges />}

            {currentTab === 'TREASURY' && (
              <Treasury
                onOpenNewTx={() => setIsNewTxOpen(true)}
                onOpenTransfer={() => setIsNewTransferOpen(true)}
              />
            )}

            {currentTab === 'INVOICES' && (
              <InvoicesPDF onOpenNewInvoice={() => handleOpenNewInvoiceWithProject(undefined)} />
            )}

            {currentTab === 'CLIENTS' && <ClientsReceivables />}

            {currentTab === 'SUPPLIERS' && <SuppliersSaaS />}

            {currentTab === 'COMMISSIONS' && <Commissions />}

            {/* PCG Modules */}
            {currentTab === 'PCG_CHART' && <PcgChart />}

            {currentTab === 'PCG_JOURNAL' && <PcgJournal />}

            {currentTab === 'PCG_LEDGER' && <PcgLedger />}

            {currentTab === 'PCG_BALANCE' && <PcgBalance />}

            {currentTab === 'PCG_INCOME' && <PcgIncome />}

            {currentTab === 'PCG_BILAN' && <PcgBilan />}

            {/* Analyse & Gouvernance */}
            {currentTab === 'FORECAST_VS_REAL' && <ForecastVsReal />}

            {currentTab === 'REPORTS' && <ReportsAnalytics />}

            {currentTab === 'CLOSING' && <MonthlyClosing />}

            {currentTab === 'ALERTS' && <RiskAlerts />}

            {currentTab === 'AUDIT' && <AuditLogs />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <NewTransactionModal
        isOpen={isNewTxOpen}
        onClose={() => setIsNewTxOpen(false)}
      />

      <NewTransferModal
        isOpen={isNewTransferOpen}
        onClose={() => setIsNewTransferOpen(false)}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
      />

      <NewInvoiceModal
        isOpen={isNewInvoiceOpen}
        onClose={() => {
          setIsNewInvoiceOpen(false);
          setPreselectedInvoiceProjectId(undefined);
        }}
        preselectedProjectId={preselectedInvoiceProjectId}
        onSubmit={addInvoice}
      />

      <NewJournalEntryModal
        isOpen={isNewJournalOpen}
        onClose={() => setIsNewJournalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
