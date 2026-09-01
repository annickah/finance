import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  DollarSign,
  Landmark,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatDate } from '../utils/formatters';

export const PlanningFinancier: React.FC = () => {
  const { dailyForecasts, invoices, transactions, fixedExpenses, totalCashBalance, accounts } = useFinance();
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const [filterType, setFilterType] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');

  // Filter next 30 days of planned events
  const timelineEvents = useMemo(() => {
    const events: {
      date: string;
      title: string;
      category: string;
      amount: number;
      type: 'INFLOW' | 'OUTFLOW';
      status: 'CONFIRMED' | 'EXPECTED' | 'OVERDUE';
      source: string;
    }[] = [];

    // Invoices expected
    invoices.forEach((inv) => {
      if (inv.status !== 'PAID') {
        const isOverdue = new Date(inv.dueDate) < new Date();
        events.push({
          date: inv.dueDate,
          title: `Encaissement Facture ${inv.invoiceNumber} - ${inv.clientCompany}`,
          category: 'Projet Client',
          amount: inv.balanceDue,
          type: 'INFLOW',
          status: isOverdue ? 'OVERDUE' : 'EXPECTED',
          source: inv.clientName,
        });
      }
    });

    // Fixed expenses upcoming
    fixedExpenses.forEach((exp) => {
      const now = new Date();
      const dueDate = new Date(now.getFullYear(), now.getMonth(), exp.dueDay);
      events.push({
        date: dueDate.toISOString(),
        title: `${exp.label} (${exp.category})`,
        category: 'Charges Fixes',
        amount: exp.amount,
        type: 'OUTFLOW',
        status: exp.status === 'ACTIVE' ? 'EXPECTED' : 'CONFIRMED',
        source: exp.assignedTo,
      });
    });

    // Recent Transactions
    transactions.slice(0, 10).forEach((tx) => {
      events.push({
        date: tx.date,
        title: tx.description,
        category: tx.category,
        amount: tx.amount,
        type: tx.type === 'INCOME' ? 'INFLOW' : 'OUTFLOW',
        status: 'CONFIRMED',
        source: accounts.find((a) => a.id === tx.accountId)?.name || 'N/A',
      });
    });

    // Sort by date
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [invoices, fixedExpenses, transactions]);

  const filteredEvents = timelineEvents.filter((ev) => {
    if (filterType === 'INFLOW') return ev.type === 'INFLOW';
    if (filterType === 'OUTFLOW') return ev.type === 'OUTFLOW';
    return true;
  });

  const totalInflowsPlanned = timelineEvents
    .filter((e) => e.type === 'INFLOW')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOutflowsPlanned = timelineEvents
    .filter((e) => e.type === 'OUTFLOW')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Échéancier & Calendrier de Trésorerie
            </span>
            <span className="text-xs font-semibold text-slate-400">Vue Chronologique</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Planning Financier
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Calendrier des échéances d'encaissements clients et de décaissements fournisseurs pour anticiper les besoins de liquidité.
          </p>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Tous les flux
          </button>
          <button
            onClick={() => setFilterType('INFLOW')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'INFLOW' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Entrées ({totalInflowsPlanned > 0 ? '+' : ''}{formatAriary(totalInflowsPlanned)})
          </button>
          <button
            onClick={() => setFilterType('OUTFLOW')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'OUTFLOW' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            Sorties (-{formatAriary(totalOutflowsPlanned)})
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Trésorerie Disponible Immédiate
            </span>
            <div className="text-xl font-black text-slate-900 font-mono mt-1">
              {formatAriary(totalCashBalance)}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Comptes bancaires & Mobile Money</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Entrées Attendues (30j)
            </span>
            <div className="text-xl font-black text-emerald-600 font-mono mt-1">
              +{formatAriary(totalInflowsPlanned)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Factures clients à encaisser</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sorties Programmées (30j)
            </span>
            <div className="text-xl font-black text-rose-600 font-mono mt-1">
              -{formatAriary(totalOutflowsPlanned)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Loyer, salaires & prestataires</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chronological Timeline List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Échéancier Détaillé des Flux Financiers
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi chronologique des encaissements et décaissements avec statuts de règlement
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {filteredEvents.length} flux identifiés
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEvents.map((event, idx) => {
            const isInflow = event.type === 'INFLOW';
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isInflow ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isInflow ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {formatDate(event.date, 'short')}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate">{event.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                        {event.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 mt-0.5 block truncate">
                      Source / Tiers : {event.source}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm font-black font-mono block ${
                        isInflow ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatAriary(event.amount)}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        event.status === 'CONFIRMED'
                          ? 'text-emerald-600'
                          : event.status === 'OVERDUE'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    >
                      {event.status === 'CONFIRMED'
                        ? 'Réalisé'
                        : event.status === 'OVERDUE'
                        ? 'En Retard'
                        : 'Prévu'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
