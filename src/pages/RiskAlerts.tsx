import React, { useState } from 'react';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  Building,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatAriary, formatDate } from '../utils/formatters';

export const RiskAlerts: React.FC = () => {
  const { alerts, resolveAlert, totalCashBalance, overdueReceivables, pendingDebtsAndCosts } = useFinance();
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const criticalCount = unresolvedAlerts.filter((a) => a.severity === 'CRITICAL' || a.severity === 'WARNING').length;

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-bold flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              Surveillance Proactive & Radar Financier
            </span>
            <span className="text-xs font-semibold text-slate-400">Détection Automatique</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Alertes & Risques
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Surveillance en temps réel des risques de liquidité, des impayés clients, des dépassements budgétaires et des échéances critiques.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold font-mono ${
              criticalCount > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {criticalCount > 0 ? `⚠️ ${criticalCount} Alertes Prioritaires` : '✅ Risques Sous Contrôle'}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Risque d'Impayés Clients
          </span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            {formatAriary(overdueReceivables)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Factures en dépassement de délai</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Dettes & Engagements (30j)
          </span>
          <div className="text-xl font-black text-rose-600 font-mono mt-1">
            {formatAriary(pendingDebtsAndCosts)}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Charges et prestataires à honorer</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Matelas de Sécurité Cash
          </span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1">
            {formatAriary(totalCashBalance)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Liquidité disponible immédiate</span>
        </div>
      </div>

      {/* Filter and Alerts List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Registre des Risques & Alertes Détectées
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Traitez les notifications pour sécuriser la trajectoire de l'entreprise
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-slate-950 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev === 'ALL'
                  ? 'Toutes'
                  : sev === 'CRITICAL'
                  ? 'Critique'
                  : sev === 'WARNING'
                  ? 'Avertissement'
                  : 'Info'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const isHighOrCrit = alert.severity === 'CRITICAL' || alert.severity === 'WARNING';

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  alert.resolved
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isHighOrCrit
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-amber-50/70 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.resolved
                        ? 'bg-slate-200 text-slate-600'
                        : isHighOrCrit
                        ? 'bg-rose-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-xs text-slate-900">{alert.title}</h4>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          isHighOrCrit
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatDate(alert.date, 'short')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  {!alert.resolved ? (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Marquer Résolu
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Résolu
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
