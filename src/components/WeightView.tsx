import React, { useState } from 'react';
import { WeightEntry, UserProfile, Member, WorkoutSession } from '../types';
import { Plus, Trash2, TrendingDown, Target, Calendar, Activity, ChevronRight, Check, Share2 } from 'lucide-react';
import { CalorieWeightRelationCard } from './CalorieWeightRelationCard';
import { WhatsAppReportModal } from './WhatsAppReportModal';

interface WeightViewProps {
  member?: Member | null;
  workoutLogs?: WorkoutSession[];
  weightLogs: WeightEntry[];
  onAddWeightLog: (entry: Omit<WeightEntry, 'id'>) => void;
  onDeleteWeightLog: (id: string) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

export const WeightView: React.FC<WeightViewProps> = ({
  member,
  workoutLogs = [],
  weightLogs,
  onAddWeightLog,
  onDeleteWeightLog,
  profile,
  onUpdateProfile,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Form states
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Target Goal Edit State
  const [targetWeightInput, setTargetWeightInput] = useState(profile.targetWeight.toString());
  const [heightInput, setHeightInput] = useState(profile.heightCm.toString());

  // Metrics
  const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const latestWeight = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].weight : profile.currentWeight;
  const initialWeight = sortedLogs.length > 0 ? sortedLogs[0].weight : profile.initialWeight;
  const totalLoss = Number((latestWeight - initialWeight).toFixed(1));
  const remainingToGoal = Number((latestWeight - profile.targetWeight).toFixed(1));

  // BMI = kg / (m^2)
  const heightM = profile.heightCm / 100;
  const bmi = heightM > 0 ? Number((latestWeight / (heightM * heightM)).toFixed(1)) : 0;
  let bmiCategory = 'Normal';
  let bmiColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (bmi < 18.5) {
    bmiCategory = 'Bajo peso';
    bmiColor = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Sobrepeso ligero';
    bmiColor = 'text-amber-700 bg-amber-50 border-amber-200';
  } else if (bmi >= 30) {
    bmiCategory = 'Obesidad';
    bmiColor = 'text-rose-700 bg-rose-50 border-rose-200';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(newWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    onAddWeightLog({
      date: newDate,
      weight: weightNum,
      bodyFatPercentage: newBodyFat ? parseFloat(newBodyFat) : undefined,
      waistCm: newWaist ? parseFloat(newWaist) : undefined,
      notes: newNotes.trim() || undefined,
    });

    // Reset
    setNewWeight('');
    setNewBodyFat('');
    setNewWaist('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleUpdateGoals = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetWeightInput);
    const heightNum = parseFloat(heightInput);
    if (!isNaN(targetNum) && !isNaN(heightNum)) {
      onUpdateProfile({
        ...profile,
        targetWeight: targetNum,
        heightCm: heightNum,
      });
      setShowGoalModal(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Historial de Peso & Composición
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitorea tu evolución en báscula, porcentaje de grasa y progreso hacia tu objetivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-weight-share-whatsapp"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Reporte a WhatsApp</span>
          </button>

          <button
            id="btn-edit-target"
            onClick={() => setShowGoalModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Target className="w-4 h-4 text-slate-500" />
            <span>Configurar Meta</span>
          </button>

          <button
            id="btn-add-weight-entry"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Latest Weight */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Peso Actual
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {latestWeight}
            </span>
            <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            Inicial: {initialWeight} kg
          </span>
        </div>

        {/* Total Weight Change */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Cambio Total
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-3xl font-extrabold font-mono ${
                totalLoss < 0 ? 'text-emerald-600' : totalLoss > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {totalLoss > 0 ? `+${totalLoss}` : totalLoss}
            </span>
            <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Progreso acumulado</span>
          </div>
        </div>

        {/* Target Weight Goal */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Meta Objetivo
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {profile.targetWeight}
            </span>
            <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <span className="text-xs text-slate-500 mt-2 block">
            {remainingToGoal > 0 ? `Faltan ${remainingToGoal} kg` : '¡Objetivo superado!'}
          </span>
        </div>

        {/* BMI & Status */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Índice IMC
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {bmi}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiColor}`}>
              {bmiCategory}
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            Estatura: {profile.heightCm} cm
          </span>
        </div>
      </div>

      {/* Estimador de Relación Kcal vs Peso Perdido */}
      <CalorieWeightRelationCard
        member={member}
        profile={profile}
        weightLogs={weightLogs}
        workoutLogs={workoutLogs}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
      />

      {/* Weight History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Registros Históricos ({sortedLogs.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Orden cronológico más reciente primero</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5">Peso</th>
                <th className="px-6 py-3.5">Diferencia</th>
                <th className="px-6 py-3.5">% Grasa Corp.</th>
                <th className="px-6 py-3.5">Cintura</th>
                <th className="px-6 py-3.5">Notas & Sensaciones</th>
                <th className="px-6 py-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...sortedLogs].reverse().map((entry, revIndex) => {
                // Find previous chronological entry
                const origIndex = sortedLogs.findIndex((l) => l.id === entry.id);
                let diffText = '-';
                let diffClass = 'text-slate-400';
                if (origIndex > 0) {
                  const prevEntry = sortedLogs[origIndex - 1];
                  const diff = Number((entry.weight - prevEntry.weight).toFixed(1));
                  if (diff < 0) {
                    diffText = `${diff} kg`;
                    diffClass = 'text-emerald-600 font-bold';
                  } else if (diff > 0) {
                    diffText = `+${diff} kg`;
                    diffClass = 'text-amber-600 font-bold';
                  } else {
                    diffText = '0.0 kg';
                    diffClass = 'text-slate-400 font-semibold';
                  }
                }

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {entry.weight} kg
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-mono ${diffClass}`}>
                      {diffText}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.bodyFatPercentage ? `${entry.bodyFatPercentage}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.waistCm ? `${entry.waistCm} cm` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {entry.notes || 'Registro regular'}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        id={`btn-delete-weight-${entry.id}`}
                        onClick={() => onDeleteWeightLog(entry.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Weight Entry */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-['Space_Grotesk']">
              Registrar Nuevo Peso
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Recomendación: Pésate en ayunas tras levantarte para mayor precisión.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Peso Corporal (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="ej. 78.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-900 font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-emerald-500 text-slate-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    % Grasa (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="ej. 19.5"
                    value={newBodyFat}
                    onChange={(e) => setNewBodyFat(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Cintura en cm (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="ej. 85.0"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Notas / Sensaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="ej. Más vascularización, buena energía en el entreno..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md"
                >
                  Guardar Peso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configure Goals */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-1 font-['Space_Grotesk']">
              Metas del Atleta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ajusta tu peso objetivo y tu estatura para el cálculo de IMC y gráficos.
            </p>

            <form onSubmit={handleUpdateGoals} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Peso Meta Deseado (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={targetWeightInput}
                  onChange={(e) => setTargetWeightInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Estatura (cm)
                </label>
                <input
                  type="number"
                  required
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md"
                >
                  Actualizar Meta
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
        profile={profile}
        weightLogs={weightLogs}
        workoutLogs={workoutLogs}
      />
    </div>
  );
};
