import React, { useState } from 'react';
import { Member, WorkoutSession, WeightEntry, GymCoach } from '../types';
import {
  User,
  Shield,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  Award,
  TrendingDown,
  TrendingUp,
  Activity,
  Dumbbell,
  Clock,
  Edit3,
  CheckCircle2,
  FileDown,
  LogOut,
  Save,
  X,
  HeartPulse,
  Share2,
  Utensils
} from 'lucide-react';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import { CalorieWeightRelationCard } from './CalorieWeightRelationCard';
import { WhatsAppReportModal } from './WhatsAppReportModal';

interface MemberProfileViewProps {
  member: Member;
  coaches: GymCoach[];
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  onUpdateMember: (updated: Member) => Promise<void>;
  onLogout: () => void;
  onExportPDF: () => void;
  onNavigateToCoaches: () => void;
  onNavigateToNutrition?: () => void;
  onNavigateToRoutines?: () => void;
}

export const MemberProfileView: React.FC<MemberProfileViewProps> = ({
  member,
  coaches,
  weightLogs,
  workoutLogs,
  onUpdateMember,
  onLogout,
  onExportPDF,
  onNavigateToCoaches,
  onNavigateToNutrition,
  onNavigateToRoutines,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [formData, setFormData] = useState<Member>({ ...member });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate BMI
  const heightM = (member.heightCm || 170) / 100;
  const bmi = member.currentWeight ? (member.currentWeight / (heightM * heightM)).toFixed(1) : '23.5';
  const getBmiCategory = (val: number) => {
    if (val < 18.5) return { label: 'Bajo Peso', color: 'text-amber-500' };
    if (val < 25) return { label: 'Peso Saludable', color: 'text-emerald-500' };
    if (val < 30) return { label: 'Sobrepeso Leve', color: 'text-amber-500' };
    return { label: 'Obesidad', color: 'text-red-500' };
  };
  const bmiInfo = getBmiCategory(parseFloat(bmi));

  // Progress calculations
  const weightChange = (member.currentWeight - member.initialWeight).toFixed(1);
  const totalVolumeKg = workoutLogs.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalCalories = workoutLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

  // Membership expiry check
  const expireDate = new Date(member.expiresDate);
  const now = new Date();
  const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
  const isExpiringSoon = diffDays > 0 && diffDays <= 15;
  const isExpired = diffDays <= 0;

  const assignedCoach = coaches.find((c) => c.id === member.assignedCoachId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateMember(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Official Member Card Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-5 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-red-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-full text-white shadow-xs" title="Socio Verificado">
              <Shield className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-['Space_Grotesk']">
                {member.name}
              </h1>
              <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-red-600/20 text-red-300 border border-red-500/30 font-bold">
                {member.membershipNumber}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Membresía <strong className="text-white">{member.membershipType || 'Mensual'}</strong> ($450 MXN / mes) · Sucursal <strong className="text-white">{member.branch || 'León'}</strong> · Socio activo desde {new Date(member.joinedDate).toLocaleDateString()}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {member.phone || 'Sin registrar'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {member.email || 'Sin registrar'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 w-full md:w-auto">
          {onNavigateToNutrition && (
            <button
              id="btn-profile-nutrition"
              onClick={onNavigateToNutrition}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Plan Nutricional</span>
            </button>
          )}

          <button
            id="btn-profile-whatsapp"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Enviar a WhatsApp</span>
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
          >
            <Edit3 className="w-3.5 h-3.5 text-red-400" />
            <span>Editar Mis Datos</span>
          </button>

          <button
            onClick={onExportPDF}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Descargar Ficha</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cerrar sesión de socio"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>¡Datos de membresía actualizados correctamente en la base de datos!</span>
        </div>
      )}

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Peso Actual
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {member.currentWeight}
            </span>
            <span className="text-xs text-slate-500 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Meta: <strong className="text-slate-800">{member.targetWeight} kg</strong>
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Evolución Total
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl sm:text-3xl font-black ${
                Number(weightChange) <= 0 ? 'text-emerald-600' : 'text-blue-600'
              }`}
            >
              {Number(weightChange) > 0 ? `+${weightChange}` : weightChange}
            </span>
            <span className="text-xs text-slate-500 font-bold">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            Desde inicio ({member.initialWeight} kg)
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Índice de Masa (IMC)
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{bmi}</span>
          </div>
          <span className={`text-[11px] font-bold block mt-1 ${bmiInfo.color}`}>
            {bmiInfo.label}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Estado de Membresía
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-lg sm:text-xl font-black ${
                isExpired ? 'text-red-600' : isExpiringSoon ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {isExpired ? 'Vencida' : 'Activa'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">
            {isExpired
              ? 'Renueva en recepción'
              : `Vence: ${expireDate.toLocaleDateString()} (${diffDays} días)`}
          </span>
        </div>
      </div>

      {/* Estimador de Relación Kcal vs Peso Perdido */}
      <CalorieWeightRelationCard
        member={member}
        weightLogs={weightLogs}
        workoutLogs={workoutLogs}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
      />

      {/* Main Dossier Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Personal Dossier & Health */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Datos Antropométricos y Objetivos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Ficha Médica &amp; Parámetros Físicos
                </h3>
              </div>
              <span className="text-xs text-slate-400">Alfa &amp; Omega Gym</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Edad:</span>
                <span className="text-sm font-bold text-slate-900">{member.age || '--'} años</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Estatura:</span>
                <span className="text-sm font-bold text-slate-900">{member.heightCm || '--'} cm</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Género:</span>
                <span className="text-sm font-bold text-slate-900">{member.gender || 'Hombre'}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-3">
                <span className="text-slate-500 block">Objetivo Principal:</span>
                <span className="text-sm font-bold text-red-600">{member.goal}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 col-span-2 sm:col-span-3">
                <span className="text-slate-500 block">Contacto de Emergencia:</span>
                <span className="text-xs font-semibold text-slate-800">
                  {member.emergencyContact || 'No especificado'}
                </span>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 col-span-2 sm:col-span-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Notas Médicas &amp; Precauciones de Entrenamiento:</span>
                </div>
                <p className="text-xs text-amber-950/80 leading-relaxed">
                  {member.medicalNotes || 'Sin limitaciones ni lesiones registradas por el entrenador.'}
                </p>
              </div>
            </div>
          </div>

          {/* Card: Historial de Entrenamientos en el Gym */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Resumen de Entrenamientos en Alfa &amp; Omega
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-700">
                {workoutLogs.length} sesiones completadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Volumen Total Movido</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">
                  {totalVolumeKg.toLocaleString()} kg
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Calorías Quemadas</span>
                <span className="text-lg font-black text-red-600 mt-0.5 block">
                  {totalCalories.toLocaleString()} kcal
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Registros de Peso</span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block">
                  {weightLogs.length} mediciones
                </span>
              </div>
            </div>

            {workoutLogs.length === 0 ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 font-black flex items-center justify-center mx-auto text-base shadow-xs">
                  ⭐
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">
                    Socio de Nuevo Ingreso · Sin Entrenamientos Previos
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    ¡Bienvenido a Alfa &amp; Omega Gym, <strong>{member.name}</strong>! Tu historial de levantamientos, kilocalorías quemadas y sobrecarga progresiva comenzará a acumularse automáticamente en cuanto registres tu primera sesión en el gimnasio.
                  </p>
                </div>
                {onNavigateToRoutines && (
                  <button
                    onClick={onNavigateToRoutines}
                    className="mt-1 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ir a Rutinas y Comenzar Primer Entrenamiento</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block">Últimas sesiones:</span>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {workoutLogs.slice(0, 3).map((w) => (
                    <div key={w.id} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block">{w.routineName}</strong>
                        <span className="text-[11px] text-slate-400">
                          {new Date(w.date).toLocaleDateString()} · {w.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-600 block">{w.caloriesBurned} kcal</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {w.totalVolumeKg?.toLocaleString()} kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Assigned Coach & Membership Badge */}
        <div className="space-y-6">
          {/* Card: Tu Entrenador en Alfa & Omega */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Coach Asignado</h3>
              <button
                onClick={onNavigateToCoaches}
                className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                Ver todos
              </button>
            </div>

            {assignedCoach ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={assignedCoach.avatarUrl}
                    alt={assignedCoach.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{assignedCoach.name}</h4>
                    <p className="text-[11px] font-medium text-red-600">{assignedCoach.title}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {assignedCoach.schedule}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {assignedCoach.specialty}
                </p>

                <div className="flex items-center gap-2 pt-1">
                  {assignedCoach.whatsappNumber && (
                    <a
                      href={`https://wa.me/${assignedCoach.whatsappNumber}?text=Hola%20Coach%20${encodeURIComponent(assignedCoach.name)},%20soy%20tu%20socio%20${encodeURIComponent(member.name)}%20(${member.membershipNumber})`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button
                    onClick={onNavigateToCoaches}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                  >
                    Consultar
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <User className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">Aún no tienes un coach oficial asignado.</p>
                <button
                  onClick={onNavigateToCoaches}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg"
                >
                  Elegir Coach
                </button>
              </div>
            )}
          </div>

          {/* Membership Guarantee & Rules */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <AlfaOmegaLogo size="sm" variant="icon" />
              <h4 className="font-bold text-white text-sm">Beneficios de tu Membresía</h4>
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold">•</span>
                <span>Acceso ilimitado a zona de peso libre, máquinas de polea y cardio.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold">•</span>
                <span>Asesoría de técnica directa con los coaches de sala de Alfa &amp; Omega.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-400 font-bold">•</span>
                <span>Registro de peso, marcas serie a serie y generación de reportes PDF oficiales.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Editar Datos de la Ficha del Socio
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contacto de Emergencia</label>
                  <input
                    type="text"
                    placeholder="Nombre y teléfono"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Edad (años)</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estatura (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso Actual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.currentWeight}
                    onChange={(e) => setFormData({ ...formData, currentWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso Objetivo (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.targetWeight}
                    onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Objetivo de Entrenamiento</label>
                <input
                  type="text"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas Médicas o Lesiones</label>
                <textarea
                  rows={3}
                  value={formData.medicalNotes || ''}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Guardando en BD...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Report Modal */}
      <WhatsAppReportModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        member={member}
        weightLogs={weightLogs}
        workoutLogs={workoutLogs}
      />
    </div>
  );
};
