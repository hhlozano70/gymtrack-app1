import React from 'react';
import {
  Dumbbell,
  Scale,
  Timer,
  TrendingUp,
  Flame,
  UserCheck,
  FileDown,
  PlayCircle,
  Smartphone,
  Eye,
  User,
  ShieldCheck,
  Lock,
  LogOut,
  Utensils
} from 'lucide-react';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import { Member, GymCoach } from '../types';

export type ActiveTab = 'routines' | 'apparatus' | 'profile' | 'coaches' | 'coach_portal' | 'weight' | 'progress' | 'timer' | 'calorie_recommend' | 'nutrition';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onExportPDF: () => void;
  isExportingPDF: boolean;
  hasActiveWorkout: boolean;
  onOpenActiveWorkout: () => void;
  restTimerSeconds: number;
  onOpenAndroidModal: () => void;
  currentRole: 'member' | 'coach' | 'admin' | null;
  currentMember: Member | null;
  currentCoach: GymCoach | null;
  isAdmin: boolean;
  onOpenAdminPortal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportPDF,
  isExportingPDF,
  hasActiveWorkout,
  onOpenActiveWorkout,
  restTimerSeconds,
  onOpenAndroidModal,
  currentRole,
  currentMember,
  currentCoach,
  isAdmin,
  onOpenAdminPortal,
  onLogout,
}) => {
  const isCoachRole = currentRole === 'coach';

  const navItems = isCoachRole
    ? [
        { id: 'coach_portal' as ActiveTab, label: 'Mi Portal Coach', icon: UserCheck },
        { id: 'routines' as ActiveTab, label: 'Rutinas', icon: Dumbbell },
        { id: 'nutrition' as ActiveTab, label: 'Nutrición Socios', icon: Utensils },
        { id: 'apparatus' as ActiveTab, label: 'Aparatos', icon: Eye },
        { id: 'timer' as ActiveTab, label: 'Cronómetro', icon: Timer, badge: restTimerSeconds > 0 ? `${restTimerSeconds}s` : undefined },
      ]
    : [
        { id: 'routines' as ActiveTab, label: 'Rutinas', icon: Dumbbell },
        { id: 'profile' as ActiveTab, label: 'Datos del Socio', icon: User },
        { id: 'nutrition' as ActiveTab, label: 'Nutrición & Macros', icon: Utensils },
        { id: 'coaches' as ActiveTab, label: 'Coaches del Gym', icon: UserCheck },
        { id: 'apparatus' as ActiveTab, label: 'Aparatos & Guía', icon: Eye },
        { id: 'weight' as ActiveTab, label: 'Peso & Medidas', icon: Scale },
        { id: 'progress' as ActiveTab, label: 'Progreso', icon: TrendingUp },
        { id: 'timer' as ActiveTab, label: 'Cronómetro', icon: Timer, badge: restTimerSeconds > 0 ? `${restTimerSeconds}s` : undefined },
        { id: 'calorie_recommend' as ActiveTab, label: 'Quema Calórica', icon: Flame },
      ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand: Alfa & Omega Gym */}
          <button 
            onClick={() => setActiveTab(isCoachRole ? 'coach_portal' : 'routines')} 
            className="flex items-center text-left focus:outline-hidden group cursor-pointer"
            title="Alfa & Omega Gym - Inicio"
          >
            <AlfaOmegaLogo size="md" variant="compact" showText={true} />
          </button>

          {/* Desktop Navigation links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-slate-800 text-red-400 font-semibold shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action buttons & Session Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {hasActiveWorkout && (
              <button
                id="btn-nav-active-workout"
                onClick={onOpenActiveWorkout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-semibold transition-all animate-pulse cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-red-500" />
                <span className="hidden sm:inline">Entreno en curso</span>
              </button>
            )}

            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                onClick={onOpenAdminPortal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer bg-red-600 text-white border-red-500 shadow-sm shadow-red-600/30"
                title="Panel de control de administrador y base de datos"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin BD</span>
              </button>
            )}

            {/* Coach Role Badge */}
            {isCoachRole && currentCoach && (
              <button
                onClick={() => setActiveTab('coach_portal')}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer group"
                title="Ir a mi portal de Coach"
              >
                <img
                  src={currentCoach.avatarUrl}
                  alt={currentCoach.name}
                  className="w-6 h-6 rounded-md object-cover border border-red-500"
                />
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-white block text-[11px] leading-tight truncate max-w-[90px]">
                    Coach {currentCoach.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-red-400 block leading-tight">
                    {currentCoach.coachCode || 'STAFF'}
                  </span>
                </div>
              </button>
            )}

            {/* Member Profile Badge */}
            {currentRole === 'member' && currentMember && (
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer group"
                title="Ver mis datos y membresía"
              >
                <div className="w-6 h-6 rounded-md bg-red-600 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentMember.name.slice(0, 1)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-bold text-white block text-[11px] leading-tight truncate max-w-[90px]">
                    {currentMember.name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-mono text-red-400 block leading-tight">
                    {currentMember.membershipNumber}
                  </span>
                </div>
              </button>
            )}

            <button
              id="btn-nav-android"
              onClick={onOpenAndroidModal}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              title="Instalar App en Android"
            >
              <Smartphone className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="hidden lg:inline">App</span>
            </button>

            <button
              id="btn-export-pdf"
              onClick={onExportPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold rounded-lg text-xs transition-all cursor-pointer active:scale-95"
              title="Exportar informe de gimnasio en PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {isExportingPDF ? '...' : 'PDF'}
              </span>
            </button>

            {/* Logout Button (Takes user back to Initial Access Panel) */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="Cerrar sesión y volver al Panel Inicial de Acceso"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet sub-navigation bar */}
      <div className="xl:hidden flex items-center justify-between overflow-x-auto no-scrollbar px-2 py-1.5 bg-slate-900 border-t border-slate-800/80 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'text-red-500 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 text-[8px] px-1 rounded-full bg-red-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

