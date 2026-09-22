import React, { useState, useRef } from 'react';
import { Member, GymCoach, GymBranch, PaymentStatus } from '../types';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import {
  GYM_BRANCHES,
  isMemberPaymentOverdue,
  renewMemberPaymentRecord,
  getPaymentDaysDifference,
} from '../utils/paymentUtils';
import {
  Users,
  KeyRound,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Database,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  AlertTriangle,
  X,
  Plus,
  Building2,
  CreditCard,
  Ban,
  Check,
  Archive,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  FileJson,
  History,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  setAdminPassword,
  getAdminPassword,
  exportFullGymBackup,
  downloadBackupAsJsonFile,
  importFullGymBackup,
  getSafetySnapshot,
  restoreSafetySnapshot,
  resetMemberHistoryInDb,
  deleteMemberCompletelyFromDb,
  SafetySnapshotData,
} from '../utils/firebase';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  coaches: GymCoach[];
  onSaveMember: (member: Member) => Promise<void>;
  onDeleteMember: (memberId: string) => Promise<void>;
  onResetMemberHistory?: (memberId: string) => Promise<void>;
  onSaveCoach: (coach: GymCoach) => Promise<void>;
  onSelectMemberToView: (member: Member) => void;
  onLogoutAdmin: () => void;
  onResetDemoMembers?: () => Promise<void>;
  onReloadDatabase?: () => Promise<void>;
}

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  members,
  coaches,
  onSaveMember,
  onDeleteMember,
  onResetMemberHistory,
  onSaveCoach,
  onSelectMemberToView,
  onLogoutAdmin,
  onResetDemoMembers,
  onReloadDatabase,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'members' | 'coaches' | 'backup_restore' | 'security'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [branchFilter, setBranchFilter] = useState<'ALL' | GymBranch>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'PAID' | 'OVERDUE'>('ALL');

  // Member editing / creating state
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isCreatingNewMember, setIsCreatingNewMember] = useState(false);
  const [showPasswordsMap, setShowPasswordsMap] = useState<{ [id: string]: boolean }>({});
  const [adminNotice, setAdminNotice] = useState<string | null>(null);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  // Backup & Reset state
  const [memberToReset, setMemberToReset] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isPerformingDestructiveAction, setIsPerformingDestructiveAction] = useState(false);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [safetySnapshot, setSafetySnapshot] = useState<SafetySnapshotData | null>(() => getSafetySnapshot());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coach editing
  const [editingCoach, setEditingCoach] = useState<GymCoach | null>(null);
  const [isCreatingCoach, setIsCreatingCoach] = useState(false);

  // Security password change
  const [newAdminPwd, setNewAdminPwd] = useState('');

  const handleTriggerResetDemo = async () => {
    if (!onResetDemoMembers) return;
    setIsResettingDemo(true);
    try {
      await onResetDemoMembers();
      setAdminNotice('¡Base de 20 Socios Demo de Alfa & Omega Gym (4 sucursales) cargada y sincronizada exitosamente!');
      setTimeout(() => setAdminNotice(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResettingDemo(false);
    }
  };

  // Metrics
  const overdueMembersCount = members.filter((m) => isMemberPaymentOverdue(m)).length;
  const paidMembersCount = members.length - overdueMembersCount;
  const branchCounts: Record<GymBranch, number> = {
    'León': members.filter((m) => m.branch === 'León').length,
    'San Luis Potosí': members.filter((m) => m.branch === 'San Luis Potosí').length,
    'Silao': members.filter((m) => m.branch === 'Silao').length,
    'Comanjilla': members.filter((m) => m.branch === 'Comanjilla').length,
  };

  // Filtered members
  const filteredMembers = members.filter((m) => {
    const isOverdue = isMemberPaymentOverdue(m);

    const matchesQuery =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.membershipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.branch && m.branch.toLowerCase().includes(searchTerm.toLowerCase())) ||
      m.phone.includes(searchTerm) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesQuery) return false;

    if (statusFilter !== 'all' && m.status !== statusFilter) {
      return false;
    }

    if (branchFilter !== 'ALL' && m.branch !== branchFilter) {
      return false;
    }

    if (paymentFilter === 'PAID' && isOverdue) {
      return false;
    }

    if (paymentFilter === 'OVERDUE' && !isOverdue) {
      return false;
    }

    return true;
  });

  const generateNextMembershipCode = () => {
    const numbers = members
      .map((m) => {
        const match = m.membershipNumber.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 1000;
    return `AO-${max + 1}`;
  };

  const handleStartNewMember = () => {
    const nextCode = generateNextMembershipCode();
    const today = new Date();
    const expiry = new Date(today);
    expiry.setMonth(expiry.getMonth() + 1); // 1 month default

    setEditingMember({
      id: `member-${Date.now()}`,
      membershipNumber: nextCode,
      password: `alfa${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      email: '',
      phone: '',
      emergencyContact: '',
      age: 25,
      heightCm: 175,
      initialWeight: 75,
      currentWeight: 75,
      targetWeight: 70,
      gender: 'Hombre',
      goal: 'Pérdida de Grasa & Tonificación',
      assignedCoachId: coaches[0]?.id || '',
      assignedCoachName: coaches[0]?.name || '',
      medicalNotes: '',
      membershipType: 'Mensual',
      status: 'active',
      branch: branchFilter !== 'ALL' ? branchFilter : 'León',
      monthlyFee: 450,
      paymentStatus: 'paid',
      lastPaymentDate: today.toISOString().split('T')[0],
      nextPaymentDueDate: expiry.toISOString().split('T')[0],
      joinedDate: today.toISOString().split('T')[0],
      expiresDate: expiry.toISOString().split('T')[0],
      role: 'member'
    });
    setIsCreatingNewMember(true);
  };

  const handleSaveMemberForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      await onSaveMember(editingMember);
      setAdminNotice(`Socio ${editingMember.name} (${editingMember.membershipNumber}) guardado en la base de datos con éxito.`);
      setEditingMember(null);
      setIsCreatingNewMember(false);
      setTimeout(() => setAdminNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickResetPassword = async (member: Member) => {
    const newPwd = prompt(
      `Ingresa la nueva contraseña de membresía para ${member.name} (${member.membershipNumber}):`,
      `alfa${Math.floor(1000 + Math.random() * 9000)}`
    );
    if (!newPwd || !newPwd.trim()) return;

    const updated = { ...member, password: newPwd.trim() };
    await onSaveMember(updated);
    setAdminNotice(`Contraseña de ${member.name} actualizada a "${newPwd.trim()}".`);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleQuickRenew = async (member: Member, months: number = 1) => {
    const updated = renewMemberPaymentRecord(member, months);
    await onSaveMember(updated);
    setAdminNotice(`Pago registrado con éxito para ${member.name} (${member.membershipNumber}, ${member.branch}). Acceso habilitado hasta ${updated.nextPaymentDueDate}.`);
    setTimeout(() => setAdminNotice(null), 4000);
  };

  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    const updated = { ...member, status: newStatus as 'active' | 'inactive' };
    await onSaveMember(updated);
    setAdminNotice(`Estado de ${member.name} cambiado a ${newStatus === 'active' ? 'ACTIVO' : 'INACTIVO'}.`);
    setTimeout(() => setAdminNotice(null), 3000);
  };

  const handleSaveCoachForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoach) return;

    try {
      await onSaveCoach(editingCoach);
      setAdminNotice(`Coach ${editingCoach.name} actualizado con éxito.`);
      setEditingCoach(null);
      setIsCreatingCoach(false);
      setTimeout(() => setAdminNotice(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPwd.trim().length < 4) {
      alert('La contraseña debe tener al menos 4 caracteres.');
      return;
    }
    setAdminPassword(newAdminPwd.trim());
    setAdminNotice('Contraseña maestra de administrador actualizada con éxito.');
    setNewAdminPwd('');
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleExportBackup = async () => {
    setIsExportingBackup(true);
    try {
      const backup = await exportFullGymBackup();
      downloadBackupAsJsonFile(backup);
      setAdminNotice(`¡Respaldo descargado con éxito! Contiene ${backup.members.length} socios, ${backup.coaches.length} coaches y todas las rutinas.`);
      setSafetySnapshot(getSafetySnapshot());
      setTimeout(() => setAdminNotice(null), 5000);
    } catch (err: any) {
      alert('Error al exportar respaldo: ' + err.message);
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleImportBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingBackup(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = await importFullGymBackup(parsed);
      if (result.success) {
        setAdminNotice(result.message);
        setSafetySnapshot(getSafetySnapshot());
        if (onReloadDatabase) {
          await onReloadDatabase();
        }
        setTimeout(() => setAdminNotice(null), 5000);
      } else {
        alert(result.message);
      }
    } catch (err: any) {
      alert('Error al procesar archivo JSON: ' + err.message);
    } finally {
      setIsImportingBackup(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRestoreSafetyPoint = async () => {
    if (!confirm('¿Deseas restaurar la base de datos al estado anterior al último borrado?')) return;
    setIsImportingBackup(true);
    try {
      const result = await restoreSafetySnapshot();
      if (result.success) {
        setAdminNotice('¡Base de datos restaurada al punto de seguridad previo exitosamente!');
        setSafetySnapshot(getSafetySnapshot());
        if (onReloadDatabase) {
          await onReloadDatabase();
        }
        setTimeout(() => setAdminNotice(null), 5000);
      } else {
        alert(result.message);
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsImportingBackup(false);
    }
  };

  const executeResetMemberHistory = async () => {
    if (!memberToReset) return;
    setIsPerformingDestructiveAction(true);
    try {
      await resetMemberHistoryInDb(memberToReset.id);
      if (onResetMemberHistory) {
        await onResetMemberHistory(memberToReset.id);
      }
      setSafetySnapshot(getSafetySnapshot());
      setAdminNotice(`Historial de entrenamientos y pesajes de ${memberToReset.name} (${memberToReset.membershipNumber}) reiniciado a 0 en Firebase. (Se creó respaldo de seguridad automático).`);
      setMemberToReset(null);
      setTimeout(() => setAdminNotice(null), 5000);
    } catch (err: any) {
      alert('Error al reiniciar historial: ' + err.message);
    } finally {
      setIsPerformingDestructiveAction(false);
    }
  };

  const executeDeleteMemberCompletely = async () => {
    if (!memberToDelete) return;
    setIsPerformingDestructiveAction(true);
    try {
      await deleteMemberCompletelyFromDb(memberToDelete.id);
      await onDeleteMember(memberToDelete.id);
      setSafetySnapshot(getSafetySnapshot());
      setAdminNotice(`Socio ${memberToDelete.name} (${memberToDelete.membershipNumber}) y su historial eliminados definitivamente de Firebase. (Se creó respaldo de seguridad automático).`);
      setMemberToDelete(null);
      setTimeout(() => setAdminNotice(null), 5000);
    } catch (err: any) {
      alert('Error al eliminar socio: ' + err.message);
    } finally {
      setIsPerformingDestructiveAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-xl">
              <AlfaOmegaLogo size="sm" variant="icon" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight font-['Space_Grotesk']">
                  PANEL DE ADMINISTRACIÓN · <span className="text-red-500">BASE DE DATOS</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/30">
                  Master
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Control de membresías, contraseñas, respaldos y seguridad de socios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogoutAdmin}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cerrar Modo Admin
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Navigation Tabs */}
        <div className="px-6 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'members'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Control de Socios ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('coaches')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'coaches'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff de Coaches ({coaches.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('backup_restore')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'backup_restore'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-400" />
              <span>Respaldos &amp; Backups</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'security'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Seguridad &amp; BD</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline font-mono">Firestore Conectado</span>
          </div>
        </div>

        {/* Global Notice Banner */}
        {adminNotice && (
          <div className="px-6 py-2.5 bg-red-950/60 border-b border-red-800/60 text-red-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{adminNotice}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Payment & Branch Overview Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Total Socios
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-white">{members.length}</span>
                    <span className="text-[10px] text-slate-500">4 sucursales</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-emerald-900/40 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                      Al Corriente
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-emerald-300">{paidMembersCount}</span>
                    <span className="text-[10px] text-emerald-400/80">Acceso Permitido</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-red-900/50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">
                      Pago Vencido
                    </span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-red-300">{overdueMembersCount}</span>
                    <span className="text-[10px] text-red-400/90 font-bold">Acceso Denegado</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Sucursales Activas
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-red-400" />
                    <span>León, SLP, Silao, Com.</span>
                  </div>
                </div>
              </div>

              {/* Branch Quick Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Sucursal:</span>
                <button
                  type="button"
                  onClick={() => setBranchFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    branchFilter === 'ALL'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Todas ({members.length})
                </button>
                {GYM_BRANCHES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBranchFilter(b)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      branchFilter === b
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b} ({branchCounts[b] || 0})
                  </button>
                ))}
              </div>

              {/* Search & Action Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Buscar socio, AO-..., sucursal, tel..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                    />
                  </div>

                  {/* Payment Filter */}
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Pagos: Todos ({members.length})</option>
                    <option value="PAID">🟢 Al Corriente ({paidMembersCount})</option>
                    <option value="OVERDUE">🔴 Pago Vencido / Denegados ({overdueMembersCount})</option>
                  </select>

                  {/* Membership Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all">Estado: Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onResetDemoMembers && (
                    <button
                      type="button"
                      onClick={handleTriggerResetDemo}
                      disabled={isResettingDemo}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                      title="Restaurar o actualizar la base completa de los 20 socios demo en las 4 sucursales"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-red-400 ${isResettingDemo ? 'animate-spin' : ''}`} />
                      <span>{isResettingDemo ? 'Cargando...' : 'Recargar 20 Demo'}</span>
                    </button>
                  )}

                  <button
                    onClick={handleStartNewMember}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-red-600/20 cursor-pointer active:scale-95 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Registrar Nuevo Socio</span>
                  </button>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-700/80">
                      <tr>
                        <th className="px-4 py-3">Código &amp; Sucursal</th>
                        <th className="px-4 py-3">Socio</th>
                        <th className="px-4 py-3">Contraseña</th>
                        <th className="px-4 py-3">Control de Pago &amp; Acceso</th>
                        <th className="px-4 py-3">Cuota / Plan</th>
                        <th className="px-4 py-3">Coach</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3 text-right">Acciones de Cobro &amp; Perfil</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredMembers.map((member) => {
                        const isVisible = !!showPasswordsMap[member.id];
                        const isOverdue = isMemberPaymentOverdue(member);
                        const daysDiff = getPaymentDaysDifference(member.nextPaymentDueDate);

                        const branchBadgeColor =
                          member.branch === 'León'
                            ? 'bg-red-500/20 text-red-300 border-red-500/30'
                            : member.branch === 'San Luis Potosí'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : member.branch === 'Silao'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

                        return (
                          <tr key={member.id} className="hover:bg-slate-850/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono font-black text-white text-xs block">
                                {member.membershipNumber}
                              </span>
                              <span
                                className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded border ${branchBadgeColor}`}
                              >
                                {member.branch}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-bold text-white block">{member.name}</span>
                              <span className="text-[11px] text-slate-400">
                                {member.phone || member.email || 'Sin contacto'}
                              </span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono bg-slate-800 px-2 py-1 rounded text-white border border-slate-700 text-xs">
                                  {isVisible ? member.password : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowPasswordsMap((prev) => ({
                                      ...prev,
                                      [member.id]: !prev[member.id]
                                    }))
                                  }
                                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                                  title={isVisible ? 'Ocultar' : 'Ver contraseña'}
                                >
                                  {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-red-400" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickResetPassword(member)}
                                  className="text-[10px] font-bold text-red-400 hover:text-red-300 underline cursor-pointer ml-1"
                                  title="Cambiar contraseña de membresía"
                                >
                                  Cambiar
                                </button>
                              </div>
                            </td>

                            {/* Payment Status & Access column */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              {isOverdue ? (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/40">
                                    <Ban className="w-3 h-3 text-red-400" />
                                    <span>ACCESO DENEGADO</span>
                                  </span>
                                  <span className="block text-[11px] text-red-400 font-bold mt-0.5">
                                    Vencido hace {Math.abs(daysDiff)} día{Math.abs(daysDiff) === 1 ? '' : 's'} ({member.nextPaymentDueDate})
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>ACCESO PERMITIDO</span>
                                  </span>
                                  <span className="block text-[11px] text-slate-400 mt-0.5">
                                    Vence: {member.nextPaymentDueDate} ({daysDiff} días)
                                  </span>
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="block text-white font-bold">
                                ${member.monthlyFee || 450} MXN
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Plan {member.membershipType || 'Mensual'}
                              </span>
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                              {member.assignedCoachName || 'Sin asignar'}
                            </td>

                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleStatus(member)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                                  member.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                }`}
                                title="Click para activar/desactivar"
                              >
                                {member.status === 'active' ? '● Activo' : '○ Inactivo'}
                              </button>
                            </td>

                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {isOverdue ? (
                                  <button
                                    onClick={() => handleQuickRenew(member, 1)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-sm active:scale-95"
                                    title="Registrar cobro de mensualidad y desbloquear acceso"
                                  >
                                    <CreditCard className="w-3 h-3" />
                                    <span>Cobrar &amp; Desbloquear</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleQuickRenew(member, 1)}
                                    className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 rounded-lg text-[11px] font-semibold cursor-pointer"
                                    title="Renovar mensualidad por 1 mes adicional"
                                  >
                                    +1 Mes
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    onSelectMemberToView(member);
                                    onClose();
                                  }}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] font-semibold cursor-pointer"
                                  title="Ingresar a la app simulando ser este socio"
                                >
                                  Ver Perfil
                                </button>

                                <button
                                  onClick={() => {
                                    setEditingMember(member);
                                    setIsCreatingNewMember(false);
                                  }}
                                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                                  title="Editar datos del socio"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setMemberToReset(member)}
                                  className="p-1.5 hover:bg-amber-950/60 text-slate-500 hover:text-amber-400 rounded-lg cursor-pointer transition-colors"
                                  title="Reiniciar historial de entrenamientos y pesajes a 0"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setMemberToDelete(member)}
                                  className="p-1.5 hover:bg-red-950 text-slate-500 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                                  title="Eliminar socio de la base de datos"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredMembers.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No se encontraron socios con ese criterio de búsqueda en la sucursal o estado seleccionado.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'coaches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Staff de Coaches Oficiales</h3>
                  <p className="text-xs text-slate-400">
                    Administra los perfiles de los entrenadores presenciales del gimnasio.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const nextNum = coaches.length + 1;
                    const code = `COACH-0${nextNum}`;
                    setEditingCoach({
                      id: `coach-${Date.now()}`,
                      coachCode: code,
                      password: `coach${nextNum}23`,
                      name: '',
                      title: 'Coach de Sala',
                      specialty: '',
                      experience: '5 años',
                      certifications: ['Certificación Fitness'],
                      schedule: 'Lunes a Viernes · 06:00 a 14:00',
                      phone: '+52 55 ',
                      whatsappNumber: '',
                      email: '',
                      bio: '',
                      avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
                      available: true
                    });
                    setIsCreatingCoach(true);
                  }}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Coach</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex gap-4 items-start"
                  >
                    <img
                      src={coach.avatarUrl}
                      alt={coach.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white text-sm truncate">{coach.name}</h4>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-600/20 text-red-300 font-bold border border-red-500/30">
                              {coach.coachCode || 'COACH'}
                            </span>
                          </div>
                          <span className="text-xs text-red-400 font-medium block">
                            {coach.title}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setEditingCoach(coach);
                            setIsCreatingCoach(false);
                          }}
                          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                        <p className="truncate">Esp: {coach.specialty}</p>
                        <p>Horario: {coach.schedule}</p>
                        <p>
                          Contraseña de Acceso: <span className="font-mono text-white font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-750">{coach.password || 'coach123'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'backup_restore' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Archive className="w-5 h-5 text-amber-400" />
                  <span>Sistema de Respaldos y Protección contra Pérdida de Datos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Exporta e importa copias de seguridad de todos los socios, historiales y rutinas, o restaura la base de datos al estado previo al último borrado.
                </p>
              </div>

              {/* Hidden file input for import */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportBackupFile}
                className="hidden"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Export Backup Card */}
                <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Exportar Respaldo (.JSON)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Descarga una copia completa en archivo JSON con los {members.length} socios de las 4 sucursales, staff de coaches, rutinas completas y todos los historiales de entrenamientos y pesajes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    disabled={isExportingBackup}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20 active:scale-98 transition-all"
                  >
                    <Download className={`w-4 h-4 ${isExportingBackup ? 'animate-bounce' : ''}`} />
                    <span>{isExportingBackup ? 'Generando Respaldo...' : 'Descargar Copia JSON'}</span>
                  </button>
                </div>

                {/* 2. Import Backup Card */}
                <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Restaurar desde Respaldo</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Sube un archivo <code className="text-emerald-400 font-mono text-[11px]">.json</code> previamente exportado. El sistema sincronizará Firestore y creará un snapshot previo de seguridad.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImportingBackup}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                  >
                    <Upload className={`w-4 h-4 ${isImportingBackup ? 'animate-bounce' : ''}`} />
                    <span>{isImportingBackup ? 'Restaurando...' : 'Subir Archivo de Respaldo'}</span>
                  </button>
                </div>

                {/* 3. Safety Snapshot Undo Card */}
                <div className="bg-slate-950/70 border border-amber-900/40 hover:border-amber-700/60 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm">Punto de Recuperación Pre-Borrado</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Snapshot automático capturado antes de cualquier eliminación o reinicio de historial para deshacer accidentes.
                    </p>
                    
                    {safetySnapshot ? (
                      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-amber-500/30 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-amber-300 font-bold">
                          <span>Último Punto Disponible:</span>
                          <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">Activo</span>
                        </div>
                        <p className="text-slate-300 font-mono truncate">{safetySnapshot.actionName}</p>
                        <p className="text-slate-400 text-[10px]">
                          {new Date(safetySnapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {safetySnapshot.members.length} socios guardados
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-500">
                        Sin punto de seguridad reciente. Se generará automáticamente al eliminar o resetear datos.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleRestoreSafetyPoint}
                    disabled={!safetySnapshot || isImportingBackup}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-30 disabled:hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-600/20 active:scale-98 transition-all"
                  >
                    <RotateCcw className={`w-4 h-4 ${isImportingBackup ? 'animate-spin' : ''}`} />
                    <span>Deshacer Borrado / Restaurar</span>
                  </button>
                </div>
              </div>

              {/* Information / Safety Details Banner */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-300">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white">Garantía Anti-Pérdida de Datos:</span>
                  <p className="text-slate-400 leading-relaxed">
                    Cada vez que un administrador usa la opción de <strong className="text-amber-400">Reiniciar Historial</strong> o <strong className="text-red-400">Eliminar Socio</strong>, el sistema captura automáticamente un snapshot de seguridad en el dispositivo. Si se cometió un error, puedes presionar el botón <em>"Deshacer Borrado"</em> para recuperar al socio y sus historiales inmediatamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="max-w-xl space-y-6">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-white">
                  <KeyRound className="w-5 h-5 text-red-500" />
                  <h3 className="font-bold text-sm">Cambiar Contraseña de Administrador</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Esta clave protege el acceso a la base de datos de miembros y control de contraseñas.
                </p>

                <form onSubmit={handleUpdateAdminPassword} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      Nueva Contraseña Maestra
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={newAdminPwd}
                      onChange={(e) => setNewAdminPwd(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Actualizar Clave Maestra
                  </button>
                </form>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm">Estado de la Base de Datos Firestore</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Colección de Socios:</span>
                    <span className="font-mono text-white font-bold">{members.length} registros</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Colección de Coaches:</span>
                    <span className="font-mono text-white font-bold">{coaches.length} registros</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Sincronización en Tiempo Real:</span>
                    <span className="text-emerald-400 font-bold">Activa (Cloud Firestore)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Member Edit / Create Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {isCreatingNewMember ? 'Registrar Nuevo Socio en el Gimnasio' : `Editar Socio: ${editingMember.name}`}
              </h3>
              <button
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMemberForm} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Número de Membresía (Código)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingMember.membershipNumber}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, membershipNumber: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Contraseña de Membresía
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={editingMember.password}
                      onChange={(e) => setEditingMember({ ...editingMember, password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-red-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingMember({
                          ...editingMember,
                          password: `alfa${Math.floor(100 + Math.random() * 900)}`
                        })
                      }
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold shrink-0 cursor-pointer"
                    >
                      Aleatoria
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Socio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Valdés"
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+52 55..."
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contacto de Emergencia</label>
                  <input
                    type="text"
                    placeholder="Nombre y teléfono"
                    value={editingMember.emergencyContact}
                    onChange={(e) => setEditingMember({ ...editingMember, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Plan</label>
                  <select
                    value="Mensual"
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-semibold cursor-not-allowed"
                  >
                    <option value="Mensual">Plan Mensual Único ($450 MXN)</option>
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Plan unificado para todos los socios del gimnasio Alfa &amp; Omega.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={editingMember.expiresDate}
                    onChange={(e) => setEditingMember({ ...editingMember, expiresDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Asignar Coach del Staff</label>
                  <select
                    value={editingMember.assignedCoachId || ''}
                    onChange={(e) => {
                      const sel = coaches.find((c) => c.id === e.target.value);
                      setEditingMember({
                        ...editingMember,
                        assignedCoachId: sel?.id,
                        assignedCoachName: sel?.name
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">-- Sin asignar --</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.title})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado de Membresía</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, status: e.target.value as any })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva / Suspendida</option>
                  </select>
                </div>

                {/* SUCURSAL DEL GIMNASIO */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Sucursal Asignada</span>
                  </label>
                  <select
                    value={editingMember.branch || 'León'}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, branch: e.target.value as GymBranch })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  >
                    {GYM_BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        Sucursal {b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CUOTA MENSUAL */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-red-500" />
                    <span>Cuota Mensual ($ MXN)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={editingMember.monthlyFee || 450}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        monthlyFee: parseFloat(e.target.value) || 450
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tarifa estándar de $450 MXN mensuales.
                  </span>
                </div>

                {/* ESTADO DE PAGO & ACCESO */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Control de Pago &amp; Acceso
                  </label>
                  <select
                    value={editingMember.paymentStatus || 'paid'}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        paymentStatus: e.target.value as PaymentStatus
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-xl font-bold ${
                      editingMember.paymentStatus === 'overdue'
                        ? 'bg-red-50 border-red-300 text-red-700'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    }`}
                  >
                    <option value="paid">🟢 Al Corriente (Acceso Permitido)</option>
                    <option value="overdue">🔴 Pago Vencido (Acceso Denegado)</option>
                  </select>
                </div>

                {/* PRÓXIMA FECHA DE PAGO */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Próxima Fecha de Pago (Vence Acceso)
                  </label>
                  <input
                    type="date"
                    required
                    value={editingMember.nextPaymentDueDate || editingMember.expiresDate}
                    onChange={(e) =>
                      setEditingMember({
                        ...editingMember,
                        nextPaymentDueDate: e.target.value,
                        // If user sets a future date, optionally ensure status is paid
                        paymentStatus:
                          new Date(e.target.value) < new Date() ? 'overdue' : 'paid'
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Objetivo de Entrenamiento</label>
                <input
                  type="text"
                  value={editingMember.goal}
                  onChange={(e) => setEditingMember({ ...editingMember, goal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas Médicas o Lesiones</label>
                <textarea
                  rows={2}
                  value={editingMember.medicalNotes || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-600/20 cursor-pointer"
                >
                  Guardar en Base de Datos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coach Edit Modal */}
      {editingCoach && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {isCreatingCoach ? 'Agregar Nuevo Coach al Staff' : `Editar Coach: ${editingCoach.name}`}
              </h3>
              <button
                onClick={() => setEditingCoach(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoachForm} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editingCoach.name}
                  onChange={(e) => setEditingCoach({ ...editingCoach, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código de Coach</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. COACH-01"
                    value={editingCoach.coachCode || ''}
                    onChange={(e) => setEditingCoach({ ...editingCoach, coachCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contraseña de Coach</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. coach123"
                    value={editingCoach.password || ''}
                    onChange={(e) => setEditingCoach({ ...editingCoach, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.title}
                    onChange={(e) => setEditingCoach({ ...editingCoach, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Especialidad</label>
                  <input
                    type="text"
                    required
                    value={editingCoach.specialty}
                    onChange={(e) => setEditingCoach({ ...editingCoach, specialty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Horario en Sala</label>
                <input
                  type="text"
                  required
                  value={editingCoach.schedule}
                  onChange={(e) => setEditingCoach({ ...editingCoach, schedule: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editingCoach.phone}
                    onChange={(e) => setEditingCoach({ ...editingCoach, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp (con código país)</label>
                  <input
                    type="text"
                    placeholder="Ej. 525541238890"
                    value={editingCoach.whatsappNumber || ''}
                    onChange={(e) => setEditingCoach({ ...editingCoach, whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Biografía / Mensaje</label>
                <textarea
                  rows={3}
                  value={editingCoach.bio}
                  onChange={(e) => setEditingCoach({ ...editingCoach, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCoach(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Guardar Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Member History */}
      {memberToReset && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">¿Reiniciar Historial a 0?</h3>
                <p className="text-xs text-slate-400">
                  Socio: <strong className="text-white">{memberToReset.name}</strong> ({memberToReset.membershipNumber})
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Esta acción eliminará <strong className="text-amber-400">todos los entrenamientos completados y registros de pesaje</strong> de este socio en Firebase Firestore y el dispositivo.
              </p>
              <div className="p-2 bg-emerald-950/50 border border-emerald-800/40 rounded-lg text-[11px] text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Se guardará un punto de restauración automático para poder deshacer si es necesario.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isPerformingDestructiveAction}
                onClick={() => setMemberToReset(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPerformingDestructiveAction}
                onClick={executeResetMemberHistory}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20 active:scale-95 transition-all"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isPerformingDestructiveAction ? 'animate-spin' : ''}`} />
                <span>{isPerformingDestructiveAction ? 'Reiniciando...' : 'Sí, Reiniciar a Cero'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting Member Completely */}
      {memberToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/30">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">¿Eliminar Socio Definitivamente?</h3>
                <p className="text-xs text-slate-400">
                  Socio: <strong className="text-white">{memberToDelete.name}</strong> ({memberToDelete.membershipNumber})
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Se borrará permanentemente la membresía, perfil, contraseñas, entrenamientos y pesajes de <strong className="text-red-400">{memberToDelete.name}</strong> en la base de datos de Firebase.
              </p>
              <div className="p-2 bg-emerald-950/50 border border-emerald-800/40 rounded-lg text-[11px] text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Se creará un respaldo de seguridad instantáneo antes de la eliminación.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isPerformingDestructiveAction}
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPerformingDestructiveAction}
                onClick={executeDeleteMemberCompletely}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20 active:scale-95 transition-all"
              >
                <Trash2 className={`w-3.5 h-3.5 ${isPerformingDestructiveAction ? 'animate-spin' : ''}`} />
                <span>{isPerformingDestructiveAction ? 'Eliminando...' : 'Sí, Eliminar Socio'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
