import React, { useState, useMemo } from 'react';
import { Routine, RoutineExercise } from '../types';
import { EXERCISE_MEDIA_DATABASE, ExerciseMedia } from '../data/exerciseMedia';
import {
  X,
  Plus,
  Trash2,
  Flame,
  Clock,
  Dumbbell,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Play,
  Share2,
  Sliders,
  Award,
  Zap,
  HelpCircle,
  Eye,
  Info
} from 'lucide-react';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';

interface CustomRoutineBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (routine: Routine, startImmediately?: boolean) => void;
  defaultWeightKg?: number;
  onNavigateToApparatusGuide?: () => void;
}

// MET values for scientific calorie burn calculation
const EXERCISE_MET_LOOKUP: Record<string, number> = {
  'Cardio': 9.5,
  'Piernas': 6.8,
  'Espalda': 6.0,
  'Pecho': 5.8,
  'Hombros': 5.2,
  'Brazos': 4.8,
  'Core': 5.0,
  'Full Body': 7.2,
};

export const CustomRoutineBuilderModal: React.FC<CustomRoutineBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveRoutine,
  defaultWeightKg = 75,
  onNavigateToApparatusGuide,
}) => {
  if (!isOpen) return null;

  // General Routine Info
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<Routine['goal']>('Quema de Grasa');
  const [difficulty, setDifficulty] = useState<Routine['difficulty']>('Intermedio');
  const [userWeightKg, setUserWeightKg] = useState<number>(defaultWeightKg || 75);

  // Selected Exercises List
  interface ConfiguredExercise {
    id: string;
    mediaId?: string;
    name: string;
    muscleGroup: string;
    apparatusName: string;
    apparatusCategory: string;
    apparatusImage?: string;
    gifUrl?: string;
    sets: number;
    reps: string;
    workSecondsPerSet: number;
    restSeconds: number;
    techniqueTip?: string;
  }

  const [configuredExercises, setConfiguredExercises] = useState<ConfiguredExercise[]>([
    {
      id: 'init-1',
      mediaId: 'sentadillas-goblet',
      name: 'Sentadillas Goblet con Mancuerna',
      muscleGroup: 'Piernas',
      apparatusName: 'Zona de Mancuernas & Peso Libre',
      apparatusCategory: 'Peso Libre & Bancos',
      apparatusImage: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/dumbbell-goblet-squat.gif',
      sets: 4,
      reps: '12-15',
      workSecondsPerSet: 40,
      restSeconds: 45,
      techniqueTip: 'Desciende empujando las caderas hacia atrás manteniendo el pecho erguido.',
    },
    {
      id: 'init-2',
      mediaId: 'press-banca-mancuernas',
      name: 'Press de Banca Plano con Mancuernas',
      muscleGroup: 'Pecho',
      apparatusName: 'Banco Plano de Pesas (Flat Bench)',
      apparatusCategory: 'Peso Libre & Bancos',
      apparatusImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/pectorals/barbell-bench-press.gif',
      sets: 4,
      reps: '10-12',
      workSecondsPerSet: 35,
      restSeconds: 60,
      techniqueTip: 'Baja las mancuernas de forma controlada formando un ángulo de 70° en los codos.',
    }
  ]);

  // Catalog Browser State
  const [activeCatalogTab, setActiveCatalogTab] = useState<'catalog' | 'custom'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('all');
  const [selectedApparatusFilter, setSelectedApparatusFilter] = useState<string>('all');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  // Custom Manual Exercise Adder
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState('Piernas');
  const [customApparatus, setCustomApparatus] = useState('Máquinas Guiadas');
  const [customSets, setCustomSets] = useState(4);
  const [customReps, setCustomReps] = useState('12');
  const [customRest, setCustomRest] = useState(60);

  // Filter exercises catalog
  const filteredCatalog = useMemo(() => {
    return EXERCISE_MEDIA_DATABASE.filter((item) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.exerciseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.apparatus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.muscleTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMuscle =
        selectedMuscleFilter === 'all' ||
        item.muscleTarget.toLowerCase().includes(selectedMuscleFilter.toLowerCase()) ||
        (selectedMuscleFilter === 'Piernas' && (item.muscleTarget.includes('Cuádriceps') || item.muscleTarget.includes('Glúteos') || item.muscleTarget.includes('Isquiotibiales') || item.muscleTarget.includes('Pantorrillas'))) ||
        (selectedMuscleFilter === 'Espalda' && (item.muscleTarget.includes('Dorsal') || item.muscleTarget.includes('Espalda') || item.muscleTarget.includes('Trapecio'))) ||
        (selectedMuscleFilter === 'Brazos' && (item.muscleTarget.includes('Bíceps') || item.muscleTarget.includes('Tríceps') || item.muscleTarget.includes('Antebrazos')));

      const matchesApparatus =
        selectedApparatusFilter === 'all' ||
        item.apparatus.category === selectedApparatusFilter;

      return matchesSearch && matchesMuscle && matchesApparatus;
    });
  }, [searchQuery, selectedMuscleFilter, selectedApparatusFilter]);

  // CALORIE AND TIME CALCULATION ENGINE (Real-Time Scientific Formula)
  const calculationSummary = useMemo(() => {
    const weight = Math.max(40, Math.min(180, userWeightKg || 75));
    let totalEstimatedSeconds = 0;
    let totalKcal = 0;

    const breakdown = configuredExercises.map((ex) => {
      const baseMet = EXERCISE_MET_LOOKUP[ex.muscleGroup] || 5.5;
      
      // Additional MET modifier based on goal and apparatus
      let adjustedMet = baseMet;
      if (ex.apparatusCategory === 'Cardio & Funcional') adjustedMet += 3.0;
      if (goal === 'Quema de Grasa') adjustedMet += 0.8;
      if (goal === 'Fuerza') adjustedMet += 0.4;

      // Work time vs Rest time in minutes
      const workMinutesPerSet = (ex.workSecondsPerSet || 35) / 60;
      const restMinutesPerSet = (ex.restSeconds || 60) / 60;
      
      const totalExerciseSeconds = ex.sets * (ex.workSecondsPerSet + ex.restSeconds);
      totalEstimatedSeconds += totalExerciseSeconds;

      // Calories during work: (MET * 3.5 * weightKg / 200) * workMinutes
      const workKcalPerMinute = (adjustedMet * 3.5 * weight) / 200;
      const workKcal = workKcalPerMinute * (workMinutesPerSet * ex.sets);

      // Calories during rest (active recovery MET ~ 2.2):
      const restKcalPerMinute = (2.2 * 3.5 * weight) / 200;
      const restKcal = restKcalPerMinute * (restMinutesPerSet * ex.sets);

      const exerciseTotalKcal = Math.round(workKcal + restKcal);
      totalKcal += exerciseTotalKcal;

      return {
        exerciseId: ex.id,
        name: ex.name,
        muscle: ex.muscleGroup,
        apparatus: ex.apparatusName,
        totalSeconds: totalExerciseSeconds,
        kcal: exerciseTotalKcal,
      };
    });

    const totalMinutes = Math.round(totalEstimatedSeconds / 60);
    const kcalPerMinute = totalMinutes > 0 ? (totalKcal / totalMinutes).toFixed(1) : '0';

    // Intensity classification
    let intensityLevel = 'Moderada';
    let intensityColor = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    if (totalKcal >= 550 || totalMinutes >= 60) {
      intensityLevel = 'Élite / Quema Máxima';
      intensityColor = 'text-red-500 bg-red-500/10 border-red-500/30';
    } else if (totalKcal >= 380 || totalMinutes >= 40) {
      intensityLevel = 'Alta Intensidad';
      intensityColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    } else {
      intensityLevel = 'Moderada / Tonificación';
      intensityColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    }

    // Equivalent metabolic comparison
    let equivalenceText = 'Déficit equivalente a una caminata metabólica o el 25% de tu consumo energético diario.';
    if (totalKcal > 450) {
      equivalenceText = '¡Equivale a quemar una comida completa de 450-550 kcal y acelerar la pérdida de grasa!';
    }

    return {
      totalMinutes,
      totalKcal: Math.max(50, totalKcal),
      kcalPerMinute,
      intensityLevel,
      intensityColor,
      equivalenceText,
      breakdown,
    };
  }, [configuredExercises, userWeightKg, goal]);

  // Handlers for managing exercises in the custom routine
  const handleAddFromCatalog = (item: ExerciseMedia) => {
    const isAlreadyAdded = configuredExercises.some((e) => e.mediaId === item.id);
    if (isAlreadyAdded) return;

    // Detect primary muscle group
    let muscle = 'Full Body';
    const target = item.muscleTarget.toLowerCase();
    if (target.includes('cuádriceps') || target.includes('glúteo') || target.includes('pierna') || target.includes('isquio')) muscle = 'Piernas';
    else if (target.includes('pectoral') || target.includes('pecho')) muscle = 'Pecho';
    else if (target.includes('dorsal') || target.includes('espalda') || target.includes('remo')) muscle = 'Espalda';
    else if (target.includes('deltoides') || target.includes('hombro')) muscle = 'Hombros';
    else if (target.includes('bíceps') || target.includes('tríceps') || target.includes('brazo')) muscle = 'Brazos';
    else if (target.includes('abdomen') || target.includes('core')) muscle = 'Core';
    else if (item.apparatus.category === 'Cardio & Funcional') muscle = 'Cardio';

    const newEx: ConfiguredExercise = {
      id: 'ex-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      mediaId: item.id,
      name: item.exerciseName,
      muscleGroup: muscle,
      apparatusName: item.apparatus.name,
      apparatusCategory: item.apparatus.category,
      apparatusImage: item.apparatus.imageUrl,
      gifUrl: item.gifUrl,
      sets: 4,
      reps: '12',
      workSecondsPerSet: item.apparatus.category === 'Cardio & Funcional' ? 60 : 35,
      restSeconds: 45,
      techniqueTip: item.executionTips[0] || 'Mantén postura controlada y respira con ritmo.',
    };

    setConfiguredExercises([...configuredExercises, newEx]);
  };

  const handleAddManualExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newEx: ConfiguredExercise = {
      id: 'custom-ex-' + Date.now(),
      name: customName.trim(),
      muscleGroup: customMuscle,
      apparatusName: customApparatus,
      apparatusCategory: 'Máquinas Guiadas',
      sets: customSets,
      reps: customReps,
      workSecondsPerSet: 35,
      restSeconds: customRest,
      techniqueTip: 'Controla el movimiento en la fase excéntrica.',
    };

    setConfiguredExercises([...configuredExercises, newEx]);
    setCustomName('');
  };

  const handleRemoveExercise = (id: string) => {
    setConfiguredExercises(configuredExercises.filter((e) => e.id !== id));
  };

  const handleUpdateExercise = (id: string, updates: Partial<ConfiguredExercise>) => {
    setConfiguredExercises(
      configuredExercises.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const handleMoveExercise = (idx: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && idx === 0) ||
      (direction === 'down' && idx === configuredExercises.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...configuredExercises];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setConfiguredExercises(updated);
  };

  const handleSubmit = (startImmediately = false) => {
    if (configuredExercises.length === 0) {
      alert('Por favor selecciona al menos 1 ejercicio o aparato para tu rutina.');
      return;
    }

    const finalName =
      routineName.trim() ||
      ('Mi Rutina ' + goal + ' (' + configuredExercises.length + ' Ejercicios)');

    const routineToSave: Routine = {
      id: 'custom-' + Date.now(),
      name: finalName,
      description:
        description.trim() ||
        ('Rutina personalizada con ' + configuredExercises.length + ' ejercicios y máquinas. Quema de ' + calculationSummary.totalKcal + ' kcal.'),
      goal,
      difficulty,
      durationMinutes: calculationSummary.totalMinutes || 45,
      estimatedCalories: calculationSummary.totalKcal || 450,
      isCustom: true,
      exercises: configuredExercises.map((item, i) => ({
        exerciseId: 'ex-' + i + '-' + Date.now(),
        exerciseName: item.name,
        muscleGroup: item.muscleGroup,
        targetSets: item.sets,
        targetReps: item.reps,
        suggestedRestSeconds: item.restSeconds,
        notes: 'Aparato: ' + item.apparatusName + '. ' + (item.techniqueTip || ''),
        sets: Array.from({ length: item.sets }).map((_, sIdx) => ({
          id: 's-' + i + '-' + sIdx,
          setNumber: sIdx + 1,
          weight: 20,
          reps: parseInt(item.reps.split('-')[0]) || 12,
          completed: false,
        })),
      })),
    };

    onSaveRoutine(routineToSave, startImmediately);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-5xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-850 border-b border-slate-750 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Creador de Rutina Personalizada
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase">
                  Con Aparatos &amp; Kcal en Vivo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Selecciona tus ejercicios, máquinas, series y tiempos para calcular las calorías quemadas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-750 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Bar: General Settings + Real-Time Metabolic Meter */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: General Settings (7 cols) */}
            <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <AlfaOmegaLogo size={14} /> 1. Datos Generales de la Rutina
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombre de la Rutina
                  </label>
                  <input
                    type="text"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    placeholder="Ej. Pierna &amp; Glúteo Intenso / Torso Quema Grasa"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Objetivo Principal
                  </label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Quema de Grasa">Quema de Grasa (Déficit)</option>
                    <option value="Hipertrofia">Hipertrofia (Masa Muscular)</option>
                    <option value="Fuerza">Fuerza Máxima</option>
                    <option value="Resistencia">Resistencia &amp; Tono</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nivel de Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Principiante">Principiante (Adaptación)</option>
                    <option value="Intermedio">Intermedio (Regular)</option>
                    <option value="Avanzado">Avanzado (Alta Carga)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tu Peso Actual (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="40"
                      max="200"
                      value={userWeightKg}
                      onChange={(e) => setUserWeightKg(parseFloat(e.target.value) || 75)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 pr-10"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">
                      kg
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Permite calcular exactamente tus calorías quemadas.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descripción Opcional
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej. Para los lunes y jueves"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Right: Real-time Calorie Burn Gauge (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-red-950/70 via-slate-900 to-amber-950/40 border border-red-800/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-red-400" /> Cálculo Metabólico en Vivo
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${calculationSummary.intensityColor}`}>
                  {calculationSummary.intensityLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-1">
                <div className="bg-slate-900/90 border border-red-900/30 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 block font-semibold">Gasto Total Estimado</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Flame className="w-5 h-5 text-red-500 animate-pulse" />
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {calculationSummary.totalKcal}
                    </span>
                    <span className="text-xs text-red-400 font-extrabold">kcal</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 block font-semibold">Tiempo Estimado</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {calculationSummary.totalMinutes}
                    </span>
                    <span className="text-xs text-amber-400 font-extrabold">min</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/70 rounded-xl p-2.5 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Ritmo metabólico promedio:</span>
                  <span className="font-bold text-white">{calculationSummary.kcalPerMinute} kcal/min</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Ejercicios configurados:</span>
                  <span className="font-bold text-white">{configuredExercises.length} ejercicios</span>
                </div>
                <p className="text-[10px] text-red-300/90 italic pt-1 border-t border-slate-800/80">
                  💡 {calculationSummary.equivalenceText}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Exercises Builder List */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-red-500" /> 2. Ejercicios y Tiempos de tu Rutina ({configuredExercises.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Ajusta las series, repeticiones, tiempo de trabajo y descanso para cada máquina.
                </p>
              </div>
              <span className="text-xs text-slate-400">
                Usa las flechas para ordenar
              </span>
            </div>

            {configuredExercises.length === 0 ? (
              <div className="bg-slate-900/60 border border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-3">
                <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Tu rutina aún no tiene ejercicios</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Selecciona ejercicios y aparatos del catálogo abajo para agregarlos a tu rutina personalizada.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {configuredExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="bg-slate-900 border border-slate-750 hover:border-slate-650 rounded-2xl p-3.5 sm:p-4 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Exercise Name, Apparatus, Image thumbnail */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveExercise(idx, 'down')}
                            disabled={idx === configuredExercises.length - 1}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-20 transition-all cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {ex.apparatusImage ? (
                          <img
                            src={ex.apparatusImage}
                            alt={ex.apparatusName}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                            <Dumbbell className="w-5 h-5 text-red-400" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              {ex.muscleGroup}
                            </span>
                            <span className="text-[10px] text-amber-300/90 font-semibold truncate">
                              📍 {ex.apparatusName}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white truncate mt-0.5">
                            {ex.name}
                          </h4>
                        </div>
                      </div>

                      {/* Right: Controls for Sets, Reps, Work Time, Rest Time */}
                      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-end shrink-0">
                        {/* Sets */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Series</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateExercise(ex.id, { sets: Math.max(1, ex.sets - 1) })}
                              className="w-5 h-5 rounded bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-black text-white px-1">{ex.sets}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateExercise(ex.id, { sets: Math.min(8, ex.sets + 1) })}
                              className="w-5 h-5 rounded bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Reps */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Reps</span>
                          <input
                            type="text"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(ex.id, { reps: e.target.value })}
                            className="w-14 bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-center font-bold text-white mt-0.5"
                          />
                        </div>

                        {/* Rest Time */}
                        <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-2.5 py-1 text-center">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Descanso</span>
                          <select
                            value={ex.restSeconds}
                            onChange={(e) => handleUpdateExercise(ex.id, { restSeconds: parseInt(e.target.value) || 45 })}
                            className="bg-slate-900 border border-slate-600 rounded px-1.5 py-0.5 text-xs font-bold text-amber-300 mt-0.5"
                          >
                            <option value="30">30 seg</option>
                            <option value="45">45 seg</option>
                            <option value="60">60 seg</option>
                            <option value="90">90 seg</option>
                            <option value="120">2 min</option>
                          </select>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(ex.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer ml-1"
                          title="Eliminar de la rutina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Add Exercises & Gym Machines Catalog */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-400" /> 3. Añadir Ejercicios y Aparatos a tu Rutina
                </h3>
                <p className="text-xs text-slate-400">
                  Explora el catálogo con fotos de máquinas de Alfa &amp; Omega Gym o añade un ejercicio libre.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-750 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('catalog')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCatalogTab === 'catalog'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Catálogo de Máquinas ({EXERCISE_MEDIA_DATABASE.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCatalogTab('custom')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeCatalogTab === 'custom'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  + Ejercicio Manual
                </button>
              </div>
            </div>

            {activeCatalogTab === 'catalog' ? (
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="relative sm:col-span-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar por ejercicio o máquina..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedMuscleFilter}
                      onChange={(e) => setSelectedMuscleFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="all">Todos los Músculos</option>
                      <option value="Piernas">Piernas (Cuádriceps, Glúteo, Isquios)</option>
                      <option value="Pecho">Pecho (Pectorales)</option>
                      <option value="Espalda">Espalda (Dorsales, Romboides)</option>
                      <option value="Hombros">Hombros (Deltoides)</option>
                      <option value="Brazos">Brazos (Bíceps, Tríceps)</option>
                      <option value="Core">Core &amp; Abdomen</option>
                      <option value="Cardio">Cardio &amp; Quema Acelerada</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedApparatusFilter}
                      onChange={(e) => setSelectedApparatusFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="all">Todas las Categorías de Aparatos</option>
                      <option value="Máquinas Guiadas">Máquinas Guiadas (Prensa, Smith, etc.)</option>
                      <option value="Poleas & Cables">Poleas &amp; Cables (Torres cruzadas)</option>
                      <option value="Peso Libre & Bancos">Peso Libre &amp; Mancuernas</option>
                      <option value="Cardio & Funcional">Cardio &amp; Funcional</option>
                    </select>
                  </div>
                </div>

                {/* Catalog Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => {
                    const isAdded = configuredExercises.some((e) => e.mediaId === item.id);
                    const isExpanded = expandedExerciseId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                          isAdded
                            ? 'border-emerald-500/50 bg-emerald-950/20'
                            : 'border-slate-750 hover:border-slate-650'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.apparatus.imageUrl}
                              alt={item.apparatus.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 inline-block truncate max-w-[130px]">
                                {item.muscleTarget.split(',')[0]}
                              </span>
                              <h5 className="text-xs font-bold text-white truncate mt-0.5">
                                {item.exerciseName}
                              </h5>
                              <p className="text-[10px] text-amber-400/90 truncate">
                                📍 {item.apparatus.name}
                              </p>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-slate-850 p-2.5 rounded-xl border border-slate-700 text-[10px] text-slate-300 space-y-1 mt-2">
                              <p className="font-bold text-white">Consejo de técnica:</p>
                              <p className="text-slate-300">{item.executionTips[0]}</p>
                              <p className="text-slate-400 italic">Músculos: {item.muscleTarget}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => setExpandedExerciseId(isExpanded ? null : item.id)}
                            className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Info className="w-3 h-3" />
                            <span>{isExpanded ? 'Ocultar' : 'Ver técnica'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddFromCatalog(item)}
                            disabled={isAdded}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/30 active:scale-95'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Añadido</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Añadir</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Custom Manual Exercise Form */
              <form onSubmit={handleAddManualExercise} className="space-y-3 bg-slate-900 p-4 rounded-2xl border border-slate-750">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Nombre del Ejercicio
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ej. Fondos en Paralelas / Sprints"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Músculo Principal
                    </label>
                    <select
                      value={customMuscle}
                      onChange={(e) => setCustomMuscle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Pecho">Pecho</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Piernas">Piernas</option>
                      <option value="Hombros">Hombros</option>
                      <option value="Brazos">Brazos</option>
                      <option value="Core">Core</option>
                      <option value="Cardio">Cardio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Aparato o Máquina
                    </label>
                    <input
                      type="text"
                      value={customApparatus}
                      onChange={(e) => setCustomApparatus(e.target.value)}
                      placeholder="Ej. Barras Paralelas / Torre Smith"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir a la Rutina</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer: Summary & Actions */}
        <div className="p-4 sm:p-6 bg-slate-850 border-t border-slate-750 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              <span>
                Total: <strong className="text-white text-sm">{calculationSummary.totalKcal} kcal</strong>
              </span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>
                Duración: <strong className="text-white text-sm">{calculationSummary.totalMinutes} min</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-700 hover:bg-slate-650 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Guardar Rutina</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Guardar &amp; Iniciar Ahora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
