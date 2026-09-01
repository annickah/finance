import React, { useState } from 'react';
import {
  Users,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  Briefcase,
  Code2,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Commission } from '../types';
import { formatAriary, formatDate } from '../utils/formatters';

export const Commissions: React.FC = () => {
  const { commissions, updateCommissionStatus, accounts, projects, addCommission } = useFinance();
  const [selectedAccount, setSelectedAccount] = useState(accounts[2]?.id || accounts[0]?.id || ''); // MVola default for devs

  // New Commission modal state
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [role, setRole] = useState<'DEVELOPER' | 'SALES'>('DEVELOPER');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [ruleType, setRuleType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [ruleValue, setRuleValue] = useState<number | ''>(15);

  const totalCommissions = commissions.reduce((sum, c) => sum + c.calculatedAmount, 0);
  const paidCommissions = commissions
    .filter((c) => c.status === 'PAID')
    .reduce((sum, c) => sum + c.calculatedAmount, 0);
  const pendingCommissions = commissions
    .filter((c) => c.status !== 'PAID')
    .reduce((sum, c) => sum + c.calculatedAmount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryName || !ruleValue || !projectId) return;

    const project = projects.find((p) => p.id === projectId);

    addCommission({
      beneficiaryName,
      role,
      projectId,
      projectName: project?.name || 'Projet',
      ruleType,
      ruleValue: Number(ruleValue),
      status: 'DRAFT',
    });

    setIsNewOpen(false);
    setBeneficiaryName('');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Rémunération & Prestataires
            </span>
            <span className="text-xs font-semibold text-slate-400">{commissions.length} règles actives</span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight mt-2 font-mono">
            Commissions & Développeurs
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Gestion des commissions Développeurs (Lead/Fullstack) et Commerciaux (% CA ou Forfait avec paiement MVola/Banque).
          </p>
        </div>

        <button
          onClick={() => setIsNewOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nouvelle Commission</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Commissions Engagées</span>
          <div className="text-xl font-black text-slate-950 font-mono mt-1.5">
            {formatAriary(totalCommissions)}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Commissions Réglées</span>
          <div className="text-xl font-black text-emerald-600 font-mono mt-1.5">
            {formatAriary(paidCommissions)}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">En Attente de Règlement</span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1.5">
            {formatAriary(pendingCommissions)}
          </div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-slate-950">Registre des Commissions par Bénéficiaire</h2>
            <p className="text-xs text-slate-400">Paiement direct depuis le compte sélectionné</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Compte de règlement :</span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl bg-slate-50 font-semibold"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({formatAriary(a.balance, { compact: true })})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-3">Bénéficiaire</th>
                <th className="py-3 px-3">Rôle</th>
                <th className="py-3 px-3">Projet Rattaché</th>
                <th className="py-3 px-3">Règle</th>
                <th className="py-3 px-3 text-right">Montant Calculé</th>
                <th className="py-3 px-3 text-center w-28">Statut</th>
                <th className="py-3 px-3 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {commissions.map((comm) => (
                <tr key={comm.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-extrabold text-slate-950">
                    {comm.beneficiaryName}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        comm.role === 'DEVELOPER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {comm.role === 'DEVELOPER' ? 'DÉVELOPPEUR' : 'COMMERCIAL'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    {comm.projectName}
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 font-mono">
                    {comm.ruleType === 'PERCENTAGE'
                      ? `${comm.ruleValue}% sur CA`
                      : `Forfait ${formatAriary(comm.ruleValue)}`}
                  </td>
                  <td className="py-3.5 px-3 text-right font-mono font-black text-slate-950">
                    {formatAriary(comm.calculatedAmount)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        comm.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : comm.status === 'VALIDATED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {comm.status === 'PAID' ? 'PAYÉ' : comm.status === 'VALIDATED' ? 'VALIDÉ' : 'BROUILLON'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center space-x-1.5">
                    {comm.status === 'DRAFT' && (
                      <button
                        onClick={() => updateCommissionStatus(comm.id, 'VALIDATED')}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Valider
                      </button>
                    )}
                    {comm.status === 'VALIDATED' && (
                      <button
                        onClick={() => updateCommissionStatus(comm.id, 'PAID', selectedAccount)}
                        className="px-3 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-2xs transition-all cursor-pointer"
                      >
                        Payer via Compte
                      </button>
                    )}
                    {comm.status === 'PAID' && (
                      <span className="text-[10px] text-slate-400">
                        Réglé le {formatDate(comm.paidDate, 'short')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Commission Modal */}
      {isNewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <h3 className="font-black text-base text-slate-950">Ajouter une Règle de Commission</h3>
            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nom du Bénéficiaire *</label>
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="ex: Andry R. (Lead Dev)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rôle</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="DEVELOPER">Développeur</option>
                    <option value="SALES">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Type de règle</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED">Forfait Fixe (Ar)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Projet Concerné</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} ({formatAriary(p.sellingPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Valeur ({ruleType === 'PERCENTAGE' ? '%' : 'Ar'}) *
                </label>
                <input
                  type="number"
                  required
                  value={ruleValue}
                  onChange={(e) => setRuleValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
