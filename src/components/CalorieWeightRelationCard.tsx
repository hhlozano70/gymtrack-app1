import React, { useState } from 'react';
import { WeightEntry, WorkoutSession, Member, UserProfile } from '../types';
import { calculateCalorieWeightRelation, KCAL_PER_KG_FAT } from '../utils/whatsappReport';
import { Flame, Scale, Target, Sparkles, TrendingDown, ArrowRight, Share2, Info, Dumbbell } from 'lucide-react';

interface CalorieWeightRelationCardProps {
  member?: Member | null;
  profile?: UserProfile;
  weightLogs: WeightEntry[];
  workoutLogs: WorkoutSession[];
  onOpenWhatsAppModal: () => void;
}

export const CalorieWeightRelationCard: React.FC<CalorieWeightRelationCardProps> = ({
  member,
  profile,
  weightLogs,
  workoutLogs,
  onOpenWhatsAppModal,
}) => {
  const [avgKcalPerWorkout, setAvgKcalPerWorkout] = useState(450);
  const [dailyDeficit, setDailyDeficit] = useState(500);
  const [showExplanation, setShowExplanation] = useState(false);

  const sortedWeights = [...weightLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const initialWeight = sortedWeights.length > 0 ? sortedWeights[0].weight : (member?.initialWeight || profile?.initialWeight || 80);
  const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : (member?.currentWeight || profile?.currentWeight || 80);
  const targetWeight = member?.targetWeight || profile?.targetWeight || 75;

  const relation = calculateCalorieWeightRelation(
    initialWeight,
    currentWeight,
    targetWeight,
    workoutLogs,
    avgKcalPerWorkout,
    dailyDeficit
  );

  // Total weight to lose from start to target
  const totalWeightGoalDiff = Math.max(0.1, Number((initialWeight - targetWeight).toFixed(2)));
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((relation.netWeightLoss / totalWeightGoalDiff) * 100))
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-5 sm:p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight font-['Space_Grotesk'] text-white">
                  Estimador Kcal vs. Peso Perdido
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Ciencia Fisiológica
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Relación metabólica: <strong className="text-white">1 kg de grasa ≈ 7,700 kcal</strong> de déficit calórico acumulado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showExplanation ? 'Ocultar Base' : '¿Cómo funciona?'}</span>
            </button>

            <button
              onClick={onOpenWhatsAppModal}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer active:scale-95"
              id="btn-open-whatsapp-modal"
            >
              <Share2 className="w-4 h-4" />
              <span>Reporte a WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Collapsible Scientific Explanation */}
        {showExplanation && (
          <div className="mt-4 p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 leading-relaxed space-y-2">
            <p>
              🧬 <strong className="text-white">Principio Biomecánico:</strong> Un kilogramo de tejido adiposo humano almacena aproximadamente <strong>7,700 kcal</strong> de energía metabólica utilizable.
            </p>
            <p>
              🔥 <strong className="text-white">Gasto por Entrenamientos:</strong> Las sesiones en Alfa &amp; Omega Gym queman glucógeno y lípidos. Tus <strong>{relation.totalCaloriesBurned.toLocaleString()} kcal</strong> quemadas en sesiones equivalen a <strong>~{relation.estimatedKgLostFromGym} kg</strong> de grasa pura consumida directamente por esfuerzo muscular.
            </p>
            <p>
              🥗 <strong className="text-white">Déficit Integral:</strong> La pérdida registrada en báscula ({relation.netWeightLoss} kg) representa un déficit metabólico total acumulado de <strong>~{relation.totalCaloricEquivalent.toLocaleString()} kcal</strong> combinando nutrición, metabolismo basal y entrenamientos.
            </p>
          </div>
        )}
      </div>

      {/* Main Analysis Body */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* Comparison Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Báscula */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold uppercase tracking-wider">Pérdida en Báscula</span>
              <Scale className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                {relation.netWeightLoss > 0 ? `-${relation.netWeightLoss}` : relation.netWeightLoss}
              </span>
              <span className="text-xs font-bold text-slate-600">kg reales</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Equivalente a <strong className="text-slate-800">~{relation.totalCaloricEquivalent.toLocaleString()} kcal</strong> de déficit corporal total.
            </p>
          </div>

          {/* Metric 2: Gimnasio */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
              <span className="font-bold uppercase tracking-wider">Gasto en Gym</span>
              <Flame className="w-4 h-4 text-amber-600" />
            </div>
            {workoutLogs.length > 0 ? (
              <>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                    ~{relation.estimatedKgLostFromGym}
                  </span>
                  <span className="text-xs font-bold text-amber-800">kg de grasa</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-2">
                  Producido por <strong className="text-amber-900">{relation.totalCaloriesBurned.toLocaleString()} kcal</strong> quemadas en {workoutLogs.length} entrenamientos.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl sm:text-2xl font-black text-amber-800 font-mono">
                    Fase de Inicio
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-2 leading-relaxed">
                  ⭐ <strong className="text-amber-950">Nuevo socio:</strong> Tu gasto calórico y grasa quemada comenzarán a registrarse con tu primer entrenamiento en el gimnasio.
                </p>
              </>
            )}
          </div>

          {/* Metric 3: Faltante para la Meta */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
            <div className="flex items-center justify-between text-xs text-indigo-800 mb-1">
              <span className="font-bold uppercase tracking-wider">Para Alcanzar Meta</span>
              <Target className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-indigo-700 font-mono">
                {relation.remainingWeightToGoal > 0 ? `${relation.remainingWeightToGoal}` : '0'}
              </span>
              <span className="text-xs font-bold text-indigo-800">kg restantes</span>
            </div>
            <p className="text-[11px] text-indigo-700 mt-2">
              Faltan <strong className="text-indigo-900">~{relation.remainingCaloriesToGoal.toLocaleString()} kcal</strong> de déficit calórico.
            </p>
          </div>
        </div>

        {/* Visual Progress toward Goal */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-slate-300">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              Progreso hacia la Meta ({targetWeight} kg)
            </span>
            <span className="text-emerald-400 font-mono font-bold">
              {progressPercent}% completado
            </span>
          </div>

          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
            <span>Inicio: {initialWeight} kg</span>
            <span className="text-white font-bold">Actual: {currentWeight} kg</span>
            <span className="text-emerald-300">Meta: {targetWeight} kg</span>
          </div>
        </div>

        {/* Projection Simulator with interactive sliders */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Simulador de Proyección para tu Meta
              </h4>
              <p className="text-xs text-slate-500">
                Ajusta las variables de tu estilo de vida para proyectar el tiempo y entrenamientos necesarios:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Slider 1: Déficit diario */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Déficit Diario (Dieta + Cardio):</span>
                <span className="text-red-600 font-mono">{dailyDeficit} kcal/día</span>
              </div>
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={dailyDeficit}
                onChange={(e) => setDailyDeficit(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>200 kcal (suave)</span>
                <span>500 kcal (óptimo ~0.5kg/sem)</span>
                <span>1000 kcal (intenso)</span>
              </div>
            </div>

            {/* Slider 2: Promedio de Kcal por sesión de gym */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Kcal quemadas por sesión de Gym:</span>
                <span className="text-amber-600 font-mono">{avgKcalPerWorkout} kcal/sesión</span>
              </div>
              <input
                type="range"
                min="250"
                max="800"
                step="25"
                value={avgKcalPerWorkout}
                onChange={(e) => setAvgKcalPerWorkout(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>250 kcal (ligero)</span>
                <span>450 kcal (estándar)</span>
                <span>800 kcal (HIIT + Fuerza)</span>
              </div>
            </div>
          </div>

          {/* Results of simulation */}
          {relation.remainingWeightToGoal > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200">
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Déficit Restante</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  ~{relation.remainingCaloriesToGoal.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block">kcal totales</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sesiones de Gym</span>
                <span className="text-lg font-black text-amber-600 font-mono">
                  ~{relation.estimatedWorkoutsNeeded}
                </span>
                <span className="text-[10px] text-slate-500 block">entrenamientos</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo Estimado</span>
                <span className="text-lg font-black text-indigo-600 font-mono">
                  ~{relation.estimatedWeeksToGoal}
                </span>
                <span className="text-[10px] text-slate-500 block">semanas</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ritmo Recomendado</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  ~{((dailyDeficit * 7) / KCAL_PER_KG_FAT).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">kg / semana</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-100/70 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>¡Felicitaciones! Has alcanzado tu meta de peso objetivo ({targetWeight} kg). Mantén tu constancia con entrenamientos de fuerza para preservar la composición muscular.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
