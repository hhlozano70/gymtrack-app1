import React, { useState } from 'react';
import { WeightEntry, WorkoutSession, UserProfile, Member } from '../types';
import { TrendingDown, Award, Flame, Dumbbell, Calendar, FileDown, CheckCircle2, ChevronUp, Share2 } from 'lucide-react';
import { StrengthProgressChart } from './StrengthProgressChart';
import { CalorieWeightRelationCard } from './CalorieWeightRelationCard';
import { WhatsAppReportModal } from './WhatsAppReportModal';

interface ProgressViewProps {
  member?: Member | null;
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  profile: UserProfile;
  onExportPDF: () => void;
  isExportingPDF: boolean;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  member,
  weightLogs,
  workoutLogs,
  profile,
  onExportPDF,
  isExportingPDF,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<WeightEntry | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Sort weight entries chronologically
  const sortedWeights = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : profile.initialWeight;
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : profile.currentWeight;
  const netWeightLoss = Number((initialWeight - currentWeight).toFixed(1));
  const totalVolumeLifted = workoutLogs.reduce((acc, curr) => acc + (curr.totalVolumeKg || 0), 0);
  const totalCaloriesBurned = workoutLogs.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);

  // SVG Chart Dimensions
  const chartWidth = 700;
  const chartHeight = 240;
  const paddingX = 40;
  const paddingY = 30;

  // Min and Max for scales
  const allWeights = sortedWeights.map((w) => w.weight).concat([profile.targetWeight]);
  const minWeight = Math.min(...allWeights) - 1.5;
  const maxWeight = Math.max(...allWeights) + 1.5;
  const weightRange = maxWeight - minWeight || 1;

  // Calculate coordinates for SVG
  const points = sortedWeights.map((entry, index) => {
    const x =
      sortedWeights.length > 1
        ? paddingX + (index / (sortedWeights.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const y =
      chartHeight -
      paddingY -
      ((entry.weight - minWeight) / weightRange) * (chartHeight - paddingY * 2);
    return { x, y, entry };
  });

  // Target line Y
  const targetY =
    chartHeight -
    paddingY -
    ((profile.targetWeight - minWeight) / weightRange) * (chartHeight - paddingY * 2);

  // Generate SVG path string
  const pathD = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x},${curr.y}` : `${acc} L ${curr.x},${curr.y}`;
  }, '');

  // Fill area under path
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x},${chartHeight - paddingY} L ${points[0].x},${chartHeight - paddingY} Z`
      : '';

  // Calculate muscle group distribution
  const muscleSetsCount: { [key: string]: number } = {
    Piernas: 0,
    Espalda: 0,
    Pecho: 0,
    Hombros: 0,
    Core: 0,
    Cardio: 0,
  };

  workoutLogs.forEach((session) => {
    session.exercises.forEach((ex) => {
      const group = ex.muscleGroup || 'Otros';
      const completedSets = ex.sets.filter((s) => s.completed).length || ex.sets.length;
      muscleSetsCount[group] = (muscleSetsCount[group] || 0) + completedSets;
    });
  });

  const totalSetsLogged = Object.values(muscleSetsCount).reduce((a, b) => a + b, 0) || 1;

  // Motivational Badges status
  const badges = [
    {
      id: 'b1',
      title: 'Rompedor de Inercia',
      desc: 'Completaste tu primera semana de entrenamientos consecutivos.',
      unlocked: workoutLogs.length >= 2,
      icon: '🔥',
    },
    {
      id: 'b2',
      title: 'Club -5 KG',
      desc: 'Has logrado reducir 5 kg o más de grasa corporal.',
      unlocked: netWeightLoss >= 5,
      icon: '🏆',
    },
    {
      id: 'b3',
      title: 'Titán del Acero',
      desc: 'Levantaste más de 15,000 kg de volumen total acumulado.',
      unlocked: totalVolumeLifted >= 15000,
      icon: '🏋️',
    },
    {
      id: 'b4',
      title: 'Máquina Quema Grasa',
      desc: 'Superaste las 2,000 kcal quemadas en sesiones registradas.',
      unlocked: totalCaloriesBurned >= 2000,
      icon: '⚡',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header with PDF Download button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-['Space_Grotesk']">
            Progreso Visual &amp; Rendimiento
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evolución y registros oficiales en <span className="font-semibold text-slate-800">Alfa &amp; Omega Gym</span>. Adherencia y marcas personales serie a serie.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            id="btn-progress-share-whatsapp"
            onClick={() => setIsWhatsAppModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Reporte a WhatsApp</span>
          </button>

          <button
            id="btn-progress-export-pdf"
            onClick={onExportPDF}
            disabled={isExportingPDF}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>{isExportingPDF ? 'Generando PDF...' : 'Descargar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pérdida Neta
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono">
            {netWeightLoss > 0 ? `-${netWeightLoss}` : netWeightLoss} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            De {initialWeight} kg a {currentWeight} kg
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Calorías Quemadas
            </span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            ~{totalCaloriesBurned.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kcal</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            En {workoutLogs.length} entrenamientos
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Volumen Levantado
            </span>
            <Dumbbell className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {totalVolumeLifted.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Carga total acumulada
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Distancia a la Meta
            </span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono">
            {(currentWeight - profile.targetWeight).toFixed(1)} <span className="text-sm font-semibold text-slate-500">kg</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Meta fija: {profile.targetWeight} kg
          </p>
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

      {/* Interactive Weight Progression SVG Curve */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Curva de Evolución de Peso Corporal</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Tendencia a la baja
              </span>
            </h2>
            <p className="text-xs text-slate-500">Pasa el cursor sobre los puntos para ver detalles</p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600">Peso real (kg)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 border-b-2 border-dashed border-rose-400 inline-block" />
              <span className="text-slate-600">Meta ({profile.targetWeight} kg)</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-64 select-none"
          >
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingY + ratio * (chartHeight - paddingY * 2);
              const val = (maxWeight - ratio * weightRange).toFixed(0);
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Target Weight Benchmark Line */}
            <line
              x1={paddingX}
              y1={targetY}
              x2={chartWidth - paddingX}
              y2={targetY}
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text
              x={chartWidth - paddingX}
              y={targetY - 6}
              textAnchor="end"
              className="text-[10px] fill-rose-500 font-semibold"
            >
              Meta: {profile.targetWeight} kg
            </text>

            {/* Gradient Fill under the Curve */}
            {areaD && <path d={areaD} fill="url(#weightGrad)" />}

            {/* Curve Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((pt, index) => {
              const isSelected = hoveredPoint?.id === pt.entry.id;
              return (
                <g key={pt.entry.id}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6 : 4.5}
                    className="fill-white stroke-emerald-600 stroke-2 cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint(pt.entry)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  <text
                    x={pt.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-slate-400"
                  >
                    {new Date(pt.entry.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Card */}
          {hoveredPoint && (
            <div className="p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl border border-slate-800 absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none flex items-center gap-3 animate-in fade-in">
              <div>
                <p className="text-slate-400">{hoveredPoint.date}</p>
                <p className="font-bold text-emerald-400 font-mono text-sm">
                  {hoveredPoint.weight} kg
                </p>
              </div>
              {hoveredPoint.notes && (
                <div className="border-l border-slate-700 pl-3 max-w-xs text-slate-300">
                  {hoveredPoint.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Strength & Progressive Overload Analytics with Recharts */}
      <StrengthProgressChart workoutLogs={workoutLogs} />

      {/* Two column layout: Workout frequency + Muscle Group Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Workout History Sessions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Últimos Entrenamientos Completados</span>
            </h3>
            <span className="text-xs text-slate-400 font-semibold font-mono">
              {workoutLogs.length} sesiones
            </span>
          </div>

          <div className="space-y-3">
            {workoutLogs.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Sin entrenamientos anteriores registrados</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Socio de nuevo ingreso. En cuanto complete su primera sesión de pesas o cardio en el gimnasio, aparecerá aquí el resumen con su volumen de carga y calorías quemadas.
                </p>
              </div>
            ) : (
              [...workoutLogs].reverse().slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{w.routineName}</h4>
                    <div className="flex items-center gap-3 text-slate-500 mt-1">
                      <span>
                        {new Date(w.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <span>• {w.durationMinutes} min</span>
                      <span className="text-emerald-600 font-semibold font-mono">
                        ~{w.caloriesBurned} kcal
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-800 block">
                      {w.totalVolumeKg.toLocaleString()} kg
                    </span>
                    <span className="text-[10px] text-slate-400">Volumen total</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Muscle Group Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-emerald-600" />
              <span>Balance de Grupos Musculares</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{totalSetsLogged} series</span>
          </div>

          <p className="text-xs text-slate-500">
            Un balance armónico previene lesiones y optimiza el estímulo metabólico general.
          </p>

          <div className="space-y-3 pt-1">
            {Object.entries(muscleSetsCount).map(([muscle, sets]) => {
              const pct = Math.round((sets / totalSetsLogged) * 100);
              return (
                <div key={muscle} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{muscle}</span>
                    <span className="text-slate-500 font-mono">
                      {sets} series ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Motivational Badges & Milestones */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Medallas de Constancia & Logros del Gimnasio</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Mantén la disciplina. Cada medalla refleja tu esfuerzo constante contra el hierro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-xl border transition-all ${
                b.unlocked
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-900'
                  : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
              }`}
            >
              <div className="text-2xl mb-2">{b.icon}</div>
              <h4 className="font-bold text-sm mb-1">{b.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold">
                {b.unlocked ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Desbloqueado
                  </span>
                ) : (
                  <span className="text-slate-400">En progreso</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
