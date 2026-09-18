import React, { useState } from 'react';
import { Routine, RoutineExercise } from '../types';
import { Play, Plus, Dumbbell, Flame, Clock, Trash2, Filter, Sparkles, ChevronRight, X, Smartphone, Eye, Sliders } from 'lucide-react';
import { ExerciseVisualBadge } from './ExerciseVisualBadge';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';
import { CustomRoutineBuilderModal } from './CustomRoutineBuilderModal';

interface RoutinesViewProps {
  routines: Routine[];
  onStartWorkout: (routine: Routine) => void;
  onCreateRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onNavigateToAiGenerator: () => void;
  onNavigateToApparatusGuide?: () => void;
  onOpenAndroidModal?: () => void;
  defaultWeightKg?: number;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  onStartWorkout,
  onCreateRoutine,
  onDeleteRoutine,
  onNavigateToAiGenerator,
  onNavigateToApparatusGuide,
  onOpenAndroidModal,
  defaultWeightKg = 75,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRoutines = routines.filter((r) => {
    if (selectedGoal === 'all') return true;
    return r.goal === selectedGoal;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Alfa & Omega Gym Official Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-200 shrink-0">
            <AlfaOmegaLogo size="lg" variant="icon" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Space_Grotesk']">
                ALFA <span className="text-red-500">&amp;</span> OMEGA <span className="text-red-500 font-extrabold">GYM</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-500/30">
                Oficial
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Bienvenido a tu panel de entrenamiento. Elige tu rutina de hoy, consulta fotos y guías de aparatos de nuestro gimnasio y registra cada serie.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="btn-ai-generator-shortcut"
            onClick={onNavigateToAiGenerator}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Generar por Calorías</span>
            <span className="sm:hidden">Quema IA</span>
          </button>

          <button
            id="btn-create-routine-modal"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Rutina</span>
          </button>
        </div>
      </div>

      {/* Android PWA Quick Banner */}
      {onOpenAndroidModal && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-750 rounded-2xl p-4 sm:p-4.5 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">¿Entrenas con tu móvil Android?</h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  App PWA / APK
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Instala Alfa &amp; Omega Gym en tu teléfono para usarla a pantalla completa con cronómetro sin bloqueos y acceso offline.
              </p>
            </div>
          </div>
          <button
            id="btn-banner-open-android"
            onClick={onOpenAndroidModal}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Ver cómo instalar en Android</span>
          </button>
        </div>
      )}

      {/* Machine & Apparatus Visual Guide Banner */}
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-800/50 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3" /> Guía Visual de Gimnasio
            </span>
            <span className="text-[11px] text-emerald-300 font-semibold">
              Fotos de Aparatos & GIFs de Ejercicios
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white">
            ¿No conoces las máquinas por su nombre en el gimnasio?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hemos añadido fotos reales de cada máquina (prensa, smith, poleas, bancos) y animaciones GIF para que sepas exactamente qué aparato buscar y cómo ejecutar el movimiento.
          </p>
        </div>
        {onNavigateToApparatusGuide && (
          <button
            onClick={onNavigateToApparatusGuide}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Explorar Fotos & GIFs</span>
          </button>
        )}
      </div>

      {/* Goal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filtrar:
        </span>
        {[
          { id: 'all', label: 'Todas las Rutinas' },
          { id: 'Quema de Grasa', label: 'Quema de Grasa' },
          { id: 'Hipertrofia', label: 'Hipertrofia' },
          { id: 'Fuerza', label: 'Fuerza' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedGoal(f.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              selectedGoal === f.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Routines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoutines.map((routine) => (
          <div
            key={routine.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
          >
            <div>
              {/* Goal & Difficulty Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    routine.goal === 'Quema de Grasa'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {routine.goal}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {routine.difficulty}
                  </span>
                  {routine.isCustom && (
                    <button
                      onClick={() => onDeleteRoutine(routine.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Eliminar rutina creada"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk'] group-hover:text-emerald-700 transition-colors">
                {routine.name}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {routine.description}
              </p>

              {/* Metrics Pills */}
              <div className="flex items-center gap-4 text-xs font-mono text-slate-600 my-4 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="flex items-center gap-1 font-bold text-emerald-600">
                  <Flame className="w-3.5 h-3.5" /> ~{routine.estimatedCalories || 450} kcal
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {routine.durationMinutes || 45} min
                </span>
                <span>• {(routine.exercises || []).length} ejercicios</span>
              </div>

              {/* Exercises summary list with Visual Badges (GIF & Machine) */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ejercicios (con GIF & Aparato):
                </span>
                {(routine.exercises || []).slice(0, 3).map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-700 bg-slate-50/90 p-2 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-1.5 truncate max-w-[190px]">
                      <span className="truncate font-semibold text-slate-900">• {ex.exerciseName || 'Ejercicio'}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        ({ex.targetSets || 3}x{ex.targetReps || '12'})
                      </span>
                    </div>
                    <ExerciseVisualBadge exerciseName={ex.exerciseName || ''} variant="compact" />
                  </div>
                ))}
                {(routine.exercises || []).length > 3 && (
                  <span className="text-[11px] text-slate-500 font-medium block pt-0.5">
                    + {(routine.exercises || []).length - 3} ejercicios más con guía visual y GIF
                  </span>
                )}
              </div>
            </div>

            {/* Start Button */}
            <button
              id={`btn-start-routine-${routine.id}`}
              onClick={() => onStartWorkout(routine)}
              className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Iniciar Entrenamiento</span>
            </button>
          </div>
        ))}
      </div>

      {/* Custom Routine Builder with Apparatus and Real-Time Calorie Calculation */}
      <CustomRoutineBuilderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSaveRoutine={(routine, startImmediately) => {
          onCreateRoutine(routine);
          if (startImmediately) {
            onStartWorkout(routine);
          }
        }}
        defaultWeightKg={defaultWeightKg}
        onNavigateToApparatusGuide={onNavigateToApparatusGuide}
      />
    </div>
  );
};
