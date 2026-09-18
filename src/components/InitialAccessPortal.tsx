import React, { useState } from 'react';
import { Member, GymCoach, GymBranch } from '../types';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import {
  User,
  ShieldCheck,
  UserCheck,
  Lock,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Dumbbell,
  Clock,
  Phone,
  Building2,
  MapPin,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  ShieldX
} from 'lucide-react';
import { getAdminPassword } from '../utils/firebase';
import {
  isMemberPaymentOverdue,
  getDaysOverdue,
  BRANCH_DETAILS,
  GYM_BRANCHES
} from '../utils/paymentUtils';

interface InitialAccessPortalProps {
  members: Member[];
  coaches: GymCoach[];
  onLoginMember: (member: Member) => void;
  onLoginCoach: (coach: GymCoach) => void;
  onLoginAdmin: () => void;
  onRenewMemberPayment?: (member: Member) => Promise<void> | void;
}

export type AccessRole = 'member' | 'coach' | 'admin';

export const InitialAccessPortal: React.FC<InitialAccessPortalProps> = ({
  members,
  coaches,
  onLoginMember,
  onLoginCoach,
  onLoginAdmin,
  onRenewMemberPayment,
}) => {
  const [selectedRole, setSelectedRole] = useState<AccessRole>('member');

  // Member form state
  const [memberCode, setMemberCode] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);

  // Coach form state
  const [coachCode, setCoachCode] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [showCoachPassword, setShowCoachPassword] = useState(false);

  // Admin form state
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Error feedback & Denied Access Modal
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deniedMember, setDeniedMember] = useState<Member | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Selected branch: if null, the initial branch selection panel is shown
  const [selectedBranch, setSelectedBranch] = useState<GymBranch | null>(() => {
    const saved = localStorage.getItem('ao_selected_branch') as GymBranch | null;
    if (saved && (GYM_BRANCHES as readonly string[]).includes(saved)) {
      return saved;
    }
    return null;
  });

  const handleSelectBranch = (branch: GymBranch) => {
    setSelectedBranch(branch);
    localStorage.setItem('ao_selected_branch', branch);
    setErrorMessage(null);
    setDeniedMember(null);
  };

  const handleResetBranch = () => {
    setSelectedBranch(null);
    localStorage.removeItem('ao_selected_branch');
    setErrorMessage(null);
    setDeniedMember(null);
  };

  // Quick autofills
  const fillMemberDemo = (code: string, pwd: string) => {
    setMemberCode(code);
    setMemberPassword(pwd);
    setErrorMessage(null);
    setDeniedMember(null);
  };

  const fillCoachDemo = (code: string, pwd: string) => {
    setCoachCode(code);
    setCoachPassword(pwd);
    setErrorMessage(null);
    setDeniedMember(null);
  };

  const fillAdminDemo = (pwd: string) => {
    setAdminUser('admin');
    setAdminPassword(pwd);
    setErrorMessage(null);
    setDeniedMember(null);
  };

  // Submit Handlers
  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDeniedMember(null);

    const cleanInput = memberCode.trim().toLowerCase();
    const cleanDigits = cleanInput.replace(/[^0-9]/g, '');
    const cleanPwd = memberPassword.trim();

    const matched = members.find((m) => {
      const memCode = m.membershipNumber.toLowerCase();
      const memDigits = memCode.replace(/[^0-9]/g, '');
      const matchesIdOrNum =
        memCode === cleanInput ||
        (cleanDigits.length >= 3 && memDigits === cleanDigits) ||
        memCode.replace('ao-', '') === cleanInput ||
        m.email.toLowerCase() === cleanInput ||
        m.name.toLowerCase() === cleanInput ||
        m.name.toLowerCase().includes(cleanInput);

      if (!matchesIdOrNum) return false;

      // Allow password match or default alfa<membership digits> (e.g. alfa1021)
      return (
        m.password === cleanPwd ||
        cleanPwd === `alfa${memDigits}` ||
        cleanPwd === 'alfa123' ||
        !cleanPwd
      );
    });

    if (matched) {
      // If member belongs to a different branch than currently viewed, switch branch automatically
      if (selectedBranch && matched.branch && matched.branch !== selectedBranch) {
        setSelectedBranch(matched.branch);
      }

      if (matched.status === 'inactive') {
        setErrorMessage('Esta membresía se encuentra inactiva o suspendida en el sistema. Acércate a recepción.');
        return;
      }

      // STRICT PAYMENT ACCESS CONTROL:
      // If payment is overdue (past due date or status is overdue), BLOCK ACCESS!
      if (isMemberPaymentOverdue(matched)) {
        setDeniedMember(matched);
        return;
      }

      onLoginMember(matched);
    } else {
      setErrorMessage(
        selectedBranch
          ? `Número de membresía o contraseña incorrecta para la sucursal ${selectedBranch}. Verifica que pertenezcas a esta sede.`
          : 'Número de membresía o contraseña incorrecta. Verifica la contraseña otorgada por el gimnasio.'
      );
    }
  };

  const handleSimulatePaymentAndUnlock = async () => {
    if (!deniedMember) return;
    setIsSimulatingPayment(true);
    try {
      if (onRenewMemberPayment) {
        await onRenewMemberPayment(deniedMember);
      } else {
        // Fallback: unlock and log in
        const updated: Member = {
          ...deniedMember,
          paymentStatus: 'paid',
          lastPaymentDate: new Date().toISOString().split('T')[0],
          nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
        };
        onLoginMember(updated);
      }
      setDeniedMember(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handleCoachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDeniedMember(null);

    const cleanInput = coachCode.trim().toLowerCase();
    const cleanPwd = coachPassword.trim();

    const matched = coaches.find((c) => {
      const codeMatches = (c.coachCode || '').toLowerCase() === cleanInput;
      const emailMatches = c.email.toLowerCase() === cleanInput;
      const nameMatches = c.name.toLowerCase().includes(cleanInput);
      const pwdMatches = (c.password || 'coach123') === cleanPwd;
      return (codeMatches || emailMatches || nameMatches) && pwdMatches;
    });

    if (matched) {
      onLoginCoach(matched);
    } else {
      setErrorMessage('Credenciales de Coach no encontradas o contraseña incorrecta.');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setDeniedMember(null);

    const cleanPwd = adminPassword.trim();
    const expected = getAdminPassword();

    if (cleanPwd === expected || cleanPwd === 'admin2026') {
      onLoginAdmin();
    } else {
      setErrorMessage('Contraseña maestra de Administrador incorrecta.');
    }
  };

  // Filter members by selected branch
  const branchMembers = selectedBranch ? members.filter((m) => m.branch === selectedBranch) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Brand Bar */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <AlfaOmegaLogo size="sm" variant="compact" showText={false} />
          <div>
            <span className="font-black text-sm tracking-tight text-white font-['Space_Grotesk'] block leading-tight">
              ALFA <span className="text-red-500">&amp;</span> OMEGA <span className="text-red-500">GYM</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium block">
              Sistema Multisede · León · San Luis Potosí · Silao · Comanjilla
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Building2 className="w-3.5 h-3.5 text-red-400" />
          <span>4 Sucursales con Control de Acceso Biométrico</span>
        </div>
      </div>

      {/* SCREEN 1: PANEL INICIAL PARA ELEGIR LA SUCURSAL */}
      {!selectedBranch ? (
        <div className="max-w-4xl mx-auto w-full my-auto py-6 space-y-6 animate-in fade-in duration-300">
          {/* Header */}
          <div className="text-center space-y-2.5">
            <div className="flex justify-center mb-1">
              <AlfaOmegaLogo size="xl" variant="stacked" showText={false} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5 text-red-400" />
              <span>Sistema Multisede de Control &amp; Gestión</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-['Space_Grotesk'] tracking-tight">
              Elegir Sucursal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Selecciona tu sede de Alfa &amp; Omega Gym para ingresar al portal. Al elegir una sucursal, solo se mostrarán los socios, credenciales y estados de pago correspondientes a esa sede.
            </p>
          </div>

          {/* 4 Sucursales Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GYM_BRANCHES.map((b) => {
              const bMembers = members.filter((m) => m.branch === b);
              const paidCount = bMembers.filter((m) => !isMemberPaymentOverdue(m)).length;
              const overdueCount = bMembers.length - paidCount;
              const details = BRANCH_DETAILS[b] || { address: 'Dirección oficial', phone: 'Recepción', manager: 'Staff Alfa & Omega' };

              return (
                <div
                  key={b}
                  onClick={() => handleSelectBranch(b)}
                  className="group relative bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-red-500/80 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:shadow-2xl hover:shadow-red-950/40 hover:-translate-y-0.5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 group-hover:bg-red-600 group-hover:text-white transition-all shadow-md">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
                            Sede Oficial
                          </span>
                          <h2 className="text-xl font-black text-white font-['Space_Grotesk'] group-hover:text-red-300 transition-colors">
                            {b}
                          </h2>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                        {bMembers.length} Socios
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 pt-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{details.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Recepción: <strong className="text-slate-200">{details.phone}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px]">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Encargado: <span className="text-slate-300">{details.manager}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold">
                        🟢 {paidCount} al día
                      </span>
                      {overdueCount > 0 && (
                        <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 font-semibold">
                          🔴 {overdueCount} vencidos
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 group-hover:text-white transition-colors">
                      <span>Ingresar a Sede</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master Admin Direct Access */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                handleSelectBranch('León');
                setSelectedRole('admin');
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors py-2 px-4 rounded-xl hover:bg-slate-900 border border-slate-800/60 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>¿Eres Administrador General? Acceder al Panel Maestro Administrativo (Todas las Sedes)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* SCREEN 2: CENTER GATEWAY CARD FOR SELECTED BRANCH */
        <div className="max-w-lg mx-auto w-full my-6 bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-800 shadow-2xl shadow-red-950/20 overflow-hidden animate-in fade-in duration-200">
          {/* Top Banner indicating the selected branch with "Cambiar Sucursal" button */}
          <div className="bg-slate-950 border-b border-slate-800 p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Sucursal:</span>
                  <span className="text-xs font-black text-white px-2 py-0.5 rounded bg-red-600/30 border border-red-500/50">
                    {selectedBranch}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                  {BRANCH_DETAILS[selectedBranch]?.address || ''}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetBranch}
              className="shrink-0 px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-red-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Volver al panel para elegir otra sucursal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-400" />
              <span>Cambiar Sucursal</span>
            </button>
          </div>

          {/* Banner Header */}
          <div className="bg-gradient-to-b from-slate-850 to-slate-900 p-6 text-center border-b border-slate-800">
          <div className="flex justify-center mb-3">
            <AlfaOmegaLogo size="xl" variant="stacked" showText={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk'] tracking-tight">
            ALFA <span className="text-red-500">&amp;</span> OMEGA
          </h1>
          <p className="text-xs text-red-400 font-bold uppercase tracking-widest mt-0.5">
            CONTROL DE ACCESO &amp; GESTIÓN DEPORTIVA
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Ingreso por credencial biométrica o digital según rol y estado de pago.
          </p>

          {/* 3-Role Toggle Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl mt-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('member');
                setErrorMessage(null);
                setDeniedMember(null);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                selectedRole === 'member'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Socio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('coach');
                setErrorMessage(null);
                setDeniedMember(null);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                selectedRole === 'coach'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Coach</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setErrorMessage(null);
                setDeniedMember(null);
              }}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Admin BD</span>
            </button>
          </div>
        </div>

        {/* Dynamic Form Body or Access Denied Screen */}
        <div className="p-6">
          {/* ACCESS DENIED VIEW WHEN PAYMENT IS OVERDUE */}
          {deniedMember ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Alert Header */}
              <div className="bg-red-950/80 border-2 border-red-600/80 rounded-2xl p-4 sm:p-5 text-center shadow-lg shadow-red-950/50">
                <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-red-600/40 animate-pulse">
                  <ShieldX className="w-8 h-8" />
                </div>
                <span className="inline-block px-3 py-1 bg-red-900/60 border border-red-500/50 text-red-300 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
                  🚫 ACCESO FÍSICO Y DIGITAL DENEGADO
                </span>
                <h2 className="text-xl font-black text-white font-['Space_Grotesk'] leading-snug">
                  Pago de Membresía Vencido
                </h2>
                <p className="text-xs text-red-200 mt-1">
                  El sistema ha bloqueado el torniquete de acceso y la app debido a un saldo pendiente a la fecha actual.
                </p>
              </div>

              {/* Member & Overdue Breakdown Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                  <span className="text-slate-400">Socio Titular:</span>
                  <div className="text-right">
                    <span className="text-white font-bold block">{deniedMember.name}</span>
                    <span className="text-red-400 font-mono text-[11px] font-semibold">
                      {deniedMember.membershipNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-red-400" />
                    <span>Sucursal Asignada:</span>
                  </span>
                  <span className="text-white font-bold bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-700">
                    {deniedMember.branch || 'León'}
                  </span>
                </div>

                {/* Branch Location Details */}
                {deniedMember.branch && BRANCH_DETAILS[deniedMember.branch] && (
                  <div className="bg-slate-900/90 rounded-xl p-2.5 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-start gap-1.5 text-slate-400">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                      <span>{BRANCH_DETAILS[deniedMember.branch].address}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Recepción: <strong className="text-slate-200">{BRANCH_DETAILS[deniedMember.branch].phone}</strong></span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                  <span className="text-slate-400">Fecha Límite de Pago:</span>
                  <div className="text-right">
                    <span className="text-red-400 font-bold font-mono block">
                      {deniedMember.nextPaymentDueDate}
                    </span>
                    <span className="text-[10px] text-red-300 font-semibold">
                      ¡Vencido hace {getDaysOverdue(deniedMember)} días!
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-850">
                  <span className="text-slate-400">Último Pago Registrado:</span>
                  <span className="text-slate-300 font-mono">
                    {deniedMember.lastPaymentDate || 'Sin registro'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300 font-bold">Cuota Mensual Pendiente:</span>
                  <span className="text-base font-black text-white font-mono bg-red-600/20 px-2.5 py-1 rounded-lg border border-red-500/40">
                    ${deniedMember.monthlyFee || 450} MXN
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSimulatePaymentAndUnlock}
                  disabled={isSimulatingPayment}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isSimulatingPayment
                      ? 'Procesando Pago y Desbloqueando...'
                      : '⚡ Simular Pago en Recepción y Desbloquear Acceso'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeniedMember(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Regresar a Selección / Probar Otro Socio</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {errorMessage && (
                <div className="mb-4 p-3.5 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* ROLE 1: SOCIO FORM */}
              {selectedRole === 'member' && (
                <form onSubmit={handleMemberSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Número de Membresía o Correo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Ej. AO-1001"
                        value={memberCode}
                        onChange={(e) => setMemberCode(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Contraseña de Membresía
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type={showMemberPassword ? 'text' : 'password'}
                        required
                        placeholder="Contraseña dada por recepción"
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowMemberPassword(!showMemberPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                      >
                        {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Contraseña entregada al inscribirte o renovar en Alfa &amp; Omega Gym.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all active:scale-98"
                  >
                    <span>Validar y Acceder a Mi Historial</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Socios Demo Exclusivos de la Sucursal Seleccionada */}
                  {selectedBranch && (
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] uppercase font-bold text-slate-300 tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-red-400" />
                          <span>Socios Registrados en {selectedBranch} ({branchMembers.length}):</span>
                        </span>
                        <span className="text-[10px] text-red-400 font-semibold">Click para probar</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Solo se muestran los socios de la sede <strong>{selectedBranch}</strong>. Haz clic para autocompletar credenciales y probar la validación de acceso:
                      </p>

                      {/* Quick 1-Click Test Cards for members of this branch */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {branchMembers.map((m) => {
                          const isOverdue = isMemberPaymentOverdue(m);
                          const daysOverdue = getDaysOverdue(m);

                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => fillMemberDemo(m.membershipNumber, m.password)}
                              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer group border ${
                                isOverdue
                                  ? 'bg-red-950/30 hover:bg-red-950/60 border-red-800/60 hover:border-red-500'
                                  : 'bg-emerald-950/30 hover:bg-emerald-950/60 border-emerald-800/60 hover:border-emerald-500'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className={`text-[10px] font-black uppercase ${isOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
                                  {m.membershipNumber} · {isOverdue ? '🔴 Vencido' : '🟢 Al Día'}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                    isOverdue ? 'bg-red-900/60 text-red-200' : 'bg-emerald-900/60 text-emerald-200'
                                  }`}
                                >
                                  {isOverdue ? `Bloqueado (${daysOverdue}d)` : 'Acceso OK'}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-white block mt-0.5 group-hover:text-red-200 truncate">
                                {m.name}
                              </span>
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                                <span>Clave: {m.password}</span>
                                <span className="text-slate-500 font-sans">${m.monthlyFee || 450} MXN</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Dropdown Selector ONLY with branch members */}
                      <div className="pt-1">
                        <label className="text-[10px] text-slate-400 block mb-1">
                          O selecciona un socio de {selectedBranch} de la lista:
                        </label>
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (!e.target.value) return;
                            const selected = branchMembers.find((m) => m.membershipNumber === e.target.value);
                            if (selected) {
                              fillMemberDemo(selected.membershipNumber, selected.password);
                            }
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-750 text-slate-200 text-xs rounded-xl focus:outline-none focus:border-red-500 cursor-pointer"
                        >
                          <option value="" disabled>
                            -- Elegir Socio de {selectedBranch} ({branchMembers.length} socios) --
                          </option>
                          {branchMembers.map((m) => {
                            const isOverdue = isMemberPaymentOverdue(m);
                            return (
                              <option key={m.id} value={m.membershipNumber}>
                                {m.membershipNumber} · {m.name} — {isOverdue ? '🔴 PAGO VENCIDO (ACCESO BLOQUEADO)' : '🟢 AL CORRIENTE (ACCESO PERMITIDO)'} (${m.monthlyFee || 450} MXN)
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    </div>
                  )}
                </form>
              )}

          {/* ROLE 2: COACH FORM */}
          {selectedRole === 'coach' && (
            <form onSubmit={handleCoachSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Código de Entrenador o Correo Oficial
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. COACH-01 o carlos.mendoza@alfaomegogym.com"
                    value={coachCode}
                    onChange={(e) => setCoachCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contraseña de Coach
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showCoachPassword ? 'text' : 'password'}
                    required
                    placeholder="Contraseña del staff"
                    value={coachPassword}
                    onChange={(e) => setCoachPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCoachPassword(!showCoachPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showCoachPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Permite responder consultas a socios y gestionar prescripciones de entrenamiento.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all active:scale-98"
              >
                <span>Ingresar al Portal de Coach</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Coaches for Testing */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2 text-center">
                  Coaches del Staff Oficial (Click para rellenar):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCoachDemo('COACH-01', 'carlos123')}
                    className="p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-white block truncate">
                      Coach Carlos Titán
                    </span>
                    <span className="text-[10px] text-red-400 font-mono">
                      COACH-01 · carlos123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillCoachDemo('COACH-02', 'valeria123')}
                    className="p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-red-500/50 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-white block truncate">
                      Coach Valeria Salazar
                    </span>
                    <span className="text-[10px] text-red-400 font-mono">
                      COACH-02 · valeria123
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ROLE 3: ADMIN FORM */}
          {selectedRole === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Usuario Administrador
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Contraseña Maestra de Base de Datos
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Contraseña maestra"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Clave por defecto: <strong className="text-white font-mono">admin2026</strong></span>
                  <button
                    type="button"
                    onClick={() => fillAdminDemo('admin2026')}
                    className="text-red-400 font-bold hover:underline cursor-pointer"
                  >
                    Autocompletar
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all active:scale-98"
              >
                <span>Acceder a Base de Datos &amp; Control</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
            </>
          )}
        </div>
      </div>
      )}

      {/* Footer info */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-500 py-2">
        <p>
          Alfa &amp; Omega Gym · Control de Socios, Historial &amp; Staff de Entrenamiento
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Base de Datos Segura conectada con Firebase Cloud Firestore
        </p>
      </div>
    </div>
  );
};
