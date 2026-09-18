import React, { useState } from 'react';
import { Member } from '../types';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import {
  Lock,
  User,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { getAdminPassword } from '../utils/firebase';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  members: Member[];
  onLoginMember: (member: Member) => void;
  onLoginAdmin: () => void;
  currentMember: Member | null;
  isAdmin: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  members,
  onLoginMember,
  onLoginAdmin,
  currentMember,
  isAdmin
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [membershipInput, setMembershipInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCode = membershipInput.trim().toUpperCase();
    const cleanPwd = passwordInput.trim();

    const matched = members.find(
      (m) =>
        (m.membershipNumber.toUpperCase() === cleanCode ||
          m.email.toLowerCase() === cleanCode.toLowerCase()) &&
        m.password === cleanPwd
    );

    if (matched) {
      if (matched.status === 'inactive') {
        setErrorMessage('Esta membresía está inactiva o suspendida. Acude a recepción del gimnasio.');
        return;
      }
      onLoginMember(matched);
      if (onClose) onClose();
    } else {
      setErrorMessage(
        'Número de membresía o contraseña incorrecta. Verifica los datos que te entregó el gimnasio.'
      );
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const expected = getAdminPassword();
    if (adminPasswordInput.trim() === expected || adminPasswordInput.trim() === 'admin2026') {
      onLoginAdmin();
      if (onClose) onClose();
    } else {
      setErrorMessage('Contraseña de administrador incorrecta.');
    }
  };

  const fillQuickDemo = (memberNum: string, pwd: string) => {
    setMembershipInput(memberNum);
    setPasswordInput(pwd);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with Alfa & Omega Logo */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white text-center relative border-b border-slate-800">
          <div className="flex justify-center mb-2">
            <AlfaOmegaLogo size="lg" variant="compact" showText={false} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white font-['Space_Grotesk']">
            ALFA <span className="text-red-500">&amp;</span> OMEGA <span className="text-red-500">GYM</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Portal Oficial de Acceso a Membresías &amp; Historial
          </p>

          {/* Mode Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl mt-4 border border-slate-700/60">
            <button
              onClick={() => {
                setActiveTab('member');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'member'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Acceso Socio</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('admin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
              <span>Administrador</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'member' ? (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Número de Membresía
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. AO-1001"
                    value={membershipInput}
                    onChange={(e) => setMembershipInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contraseña de Membresía
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Contraseña dada por el gym"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tu contraseña fue emitida al inscribirte en recepción.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer transition-all active:scale-98"
              >
                <span>Ingresar a Mi Historial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Access Badges */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 block mb-2 text-center">
                  Cuentas de Socio Registradas para Pruebas:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('AO-1001', 'alfa123')}
                    className="p-2 bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-200 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-slate-900 block truncate">
                      Alejandro Ramos
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      AO-1001 · alfa123
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fillQuickDemo('AO-1002', 'omega123')}
                    className="p-2 bg-slate-50 hover:bg-red-50/50 border border-slate-200 hover:border-red-200 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-bold text-slate-900 block truncate">
                      Mariana Gómez
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      AO-1002 · omega123
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong className="text-slate-900 block mb-0.5">Control de Base de Datos</strong>
                Permite al administrador del gimnasio registrar nuevos socios, resetear contraseñas, controlar vigencias y gestionar a los entrenadores.
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Contraseña Maestra de Administrador
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    placeholder="Contraseña de admin"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Clave por defecto: <strong className="text-slate-700 font-mono">admin2026</strong></span>
                  <button
                    type="button"
                    onClick={() => setAdminPasswordInput('admin2026')}
                    className="text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    Autocompletar
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98"
              >
                <ShieldCheck className="w-4 h-4 text-red-500" />
                <span>Ingresar al Panel de Administrador</span>
              </button>
            </form>
          )}

          {onClose && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Continuar explorando sin iniciar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
