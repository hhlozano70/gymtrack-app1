import React, { useState } from 'react';
import { Routine, RoutineExercise } from '../types';
import { Play, Plus, Dumbbell, Flame, Clock, Trash2, Filter, Sparkles, ChevronRight, X, Smartphone, Eye } from 'lucide-react';
import { ExerciseVisualBadge } from './ExerciseVisualBadge';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';

interface RoutinesViewProps {
  routines: Routine[];
  onStartWorkout: (routine: Routine) => void;
  onCreateRoutine: (routine: Routine) => void;
  onDeleteRoutine: (id: string) => void;
  onNavigateToAiGenerator: () => void;
  onNavigateToApparatusGuide?: () => void;
  onOpenAndroidModal?: () => void;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  onStartWorkout,
  onCreateRoutine,
  onDeleteRoutine,
  onNavigateToAiGenerator,
  onNavigateToApparatusGuide,
  onOpenAndroidModal,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Routine Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<Routine['goal']>('Quema de Grasa');
  const [difficulty, setDifficulty] = useState<Routine['difficulty']>('Intermedio');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [estimatedCalories, setEstimatedCalories] = useState(450);
  const [exercisesList, setExercisesList] = useState<
    { name: string; muscle: string; sets: number; reps: string; rest: number }[]
  >([
    { name: 'Sentadilla Goblet', muscle: 'Piernas', sets: 4, reps: '12-15', rest: 45 },
    { name: 'Press Banca con Mancuernas', muscle: 'Pecho', sets: 4, reps: '10-12', rest: 60 },
  ]);

  // Temporary exercise adder inside create modal
  const [tempExName, setTempExName] = useState('');
  const [tempMuscle, setTempMuscle] = useState('Piernas');
  const [tempSets, setTempSets] = useState(4);
  const [tempReps, setTempReps] = useState('12');
  const [tempRest, setTempRest] = useState(60);

  const filteredRoutines = routines.filter((r) => {
    if (selectedGoal === 'all') return true;
    return r.goal === selectedGoal;
  });

  const handleAddExerciseToForm = () => {
    if (!tempExName.trim()) return;
    setExercisesList([
      ...exercisesList,
      {
        name: tempExName.trim(),
        muscle: tempMuscle,
        sets: tempSets,
        reps: tempReps,
        rest: tempRest,
      },
    ]);
    setTempExName('');
  };

  const handleRemoveExerciseFromForm = (idx: number) => {
    setExercisesList(exercisesList.filter((_, i) => i !== idx));
  };

  const handleSaveRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || exercisesList.length === 0) return;

    const newRoutine: Routine = {
      id: `custom-r-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Rutina personalizada creada por el usuario.',
      goal,
      difficulty,
      durationMinutes,
      estimatedCalories,
      isCustom: true,
      exercises: exercisesList.map((item, i) => ({
        exerciseId: `ex-${i}-${Date.now()}`,
        exerciseName: item.name,
        muscleGroup: item.muscle,
        targetSets: item.sets,
        targetReps: item.reps,
        suggestedRestSeconds: item.rest,
        sets: Array.from({ length: item.sets }).map((_, sIdx) => ({
          id: `s-${i}-${sIdx}`,
          setNumber: sIdx + 1,
          weight: 20,
          reps: parseInt(item.reps.split('-')[0]) || 12,
          completed: false,
        })),
      })),
    };

    onCreateRoutine(newRoutine);
    setShowCreateModal(false);

    // Reset form
    setName('');
    setDescription('');
    setExercisesList([
      { name: 'Sentadilla Goblet', muscle: 'Piernas', sets: 4, reps: '12-15', rest: 45 },
    ]);
  };

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
                  <Flame className="w-3.5 h-3.5" /> ~{routine.estimatedCalories} kcal
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> {routine.durationMinutes} min
                </span>
                <span>• {routine.exercises.length} ejercicios</span>
              </div>

              {/* Exercises summary list with Visual Badges (GIF & Machine) */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ejercicios (con GIF & Aparato):
                </span>
                {routine.exercises.slice(0, 3).map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-700 bg-slate-50/90 p-2 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-1.5 truncate max-w-[190px]">
                      <span className="truncate font-semibold text-slate-900">• {ex.exerciseName}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        ({ex.targetSets}x{ex.targetReps})
                      </span>
                    </div>
                    <ExerciseVisualBadge exerciseName={ex.exerciseName} variant="compact" />
                  </div>
                ))}
                {routine.exercises.length > 3 && (
                  <span className="text-[11px] text-slate-500 font-medium block pt-0.5">
                    + {routine.exercises.length - 3} ejercicios más con guía visual y GIF
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

      {/* Modal: Create Custom Routine */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-['Space_Grotesk']">
                  Crear Rutina Personalizada
                </h3>
                <p className="text-xs text-slate-500">
                  Configura tus ejercicios, series, repeticiones y descansos.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoutine} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Nombre de la Rutina *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. Pierna & Acondicionamiento Metabólico"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  placeholder="ej. Enfoque en sentadillas, zancadas y quemador con salto de comba"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Objetivo
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Quema de Grasa">Quema Grasa</option>
                    <option value="Hipertrofia">Hipertrofia</option>
                    <option value="Fuerza">Fuerza</option>
                    <option value="Resistencia">Resistencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Nivel
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  >
                    <option value="Principiante">Principiante</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Minutos
                  </label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 45)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Kcal Estimadas
                  </label>
                  <input
                    type="number"
                    value={estimatedCalories}
                    onChange={(e) => setEstimatedCalories(parseInt(e.target.value) || 450)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              {/* Exercises List inside Form */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase text-slate-700">
                    Ejercicios Incluidos ({exercisesList.length})
                  </label>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {exercisesList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{item.name}</span>
                        <span className="text-slate-400 ml-2 font-mono">
                          {item.sets} series x {item.reps} ({item.rest}s descanso)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseFromForm(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sub-form to add exercise */}
                <div className="mt-3 p-3 bg-slate-100/80 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Añadir Ejercicio a la Lista:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Nombre del ejercicio..."
                      value={tempExName}
                      onChange={(e) => setTempExName(e.target.value)}
                      className="col-span-2 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                    />
                    <select
                      value={tempMuscle}
                      onChange={(e) => setTempMuscle(e.target.value)}
                      className="px-2 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                    >
                      <option value="Piernas">Piernas</option>
                      <option value="Pecho">Pecho</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Hombros">Hombros</option>
                      <option value="Brazos">Brazos</option>
                      <option value="Core">Core</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Series:</span>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={tempSets}
                        onChange={(e) => setTempSets(parseInt(e.target.value) || 4)}
                        className="w-12 px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Reps:</span>
                      <input
                        type="text"
                        value={tempReps}
                        onChange={(e) => setTempReps(e.target.value)}
                        className="w-16 px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Descanso:</span>
                      <input
                        type="number"
                        step="5"
                        value={tempRest}
                        onChange={(e) => setTempRest(parseInt(e.target.value) || 45)}
                        className="w-14 px-1.5 py-1 rounded border border-slate-300 text-center font-mono text-xs"
                      />
                      <span className="text-slate-400">s</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddExerciseToForm}
                      className="ml-auto px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-500"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md"
                >
                  Guardar Rutina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
