import React, { useState, useMemo } from 'react';
import { Routine } from '../types';
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
  Play,
  Sliders,
  Zap,
  Info,
  Activity,
  Gauge,
  TrendingUp
} from 'lucide-react';
import { AlfaOmegaLogo } from './AlfaOmegaLogo';

interface CustomRoutineBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRoutine: (routine: Routine, startImmediately?: boolean) => void;
  defaultWeightKg?: number;
  onNavigateToApparatusGuide?: () => void;
}

export type EquipmentType = 'treadmill' | 'stairmaster' | 'elliptical' | 'bike' | 'rower' | 'general';

export interface ConfiguredExercise {
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

  // Equipment categorization
  equipmentType: EquipmentType;

  // Caminadora (Treadmill) settings
  speedKmH?: number;        // 3.0 to 16.0 km/h (default 6.0)
  inclinePercent?: number;  // 0% to 15% (default 2%)
  cardioMinutes?: number;   // 5 to 60 min (default 15)

  // Escaladora (StairMaster / Stepmill) settings
  stairLevel?: number;      // 1 to 15 (default 6)

  // Elíptica settings
  ellipticalResistance?: number; // 1 to 20 (default 8)
  ellipticalIncline?: number;    // 1 to 10 (default 3)

  // Bicicleta Fija / Spinning settings
  bikeResistance?: number;       // 1 to 20 (default 7)
  bikeMode?: 'Paseo Suave (60-70 RPM)' | 'Ritmo Moderado (75-85 RPM)' | 'Spinning Alta Cadencia (90-110 RPM)' | 'Subida de Montaña (Carga Alta)';

  // Remoergómetro / AirBike settings
  rowerResistance?: number;      // 1 to 10 (default 5)
}

// Detect equipment type from media or names
export function detectEquipmentType(mediaId?: string, name?: string, category?: string): EquipmentType {
  const text = ((mediaId || '') + ' ' + (name || '')).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  if (text.includes('caminador') || text.includes('treadmill') || text.includes('cinta') || text.includes('trotador') || (text.includes('caminat') && !text.includes('zancad'))) {
    return 'treadmill';
  }
  if (text.includes('escalador') || text.includes('stair') || text.includes('stepmill') || text.includes('grada')) {
    if (!text.includes('mountain') && !text.includes('plancha')) {
      return 'stairmaster';
    }
  }
  if (text.includes('eliptic') || text.includes('cross trainer')) {
    return 'elliptical';
  }
  if (text.includes('bici') || text.includes('spinning') || text.includes('bike') || text.includes('ciclis') || text.includes('estatic')) {
    if (!text.includes('air') && !text.includes('remo')) {
      return 'bike';
    }
  }
  if (text.includes('remo') || text.includes('airbike') || text.includes('ergometr') || text.includes('concept')) {
    return 'rower';
  }
  return 'general';
}

// MET values for scientific calorie burn calculation
const EXERCISE_MET_LOOKUP: Record<string, number> = {
  'Cardio': 9.0,
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
}) => {
  if (!isOpen) return null;

  // General Routine Info
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState<Routine['goal']>('Quema de Grasa');
  const [difficulty, setDifficulty] = useState<Routine['difficulty']>('Intermedio');
  const [userWeightKg, setUserWeightKg] = useState<number>(defaultWeightKg || 75);

  const [configuredExercises, setConfiguredExercises] = useState<ConfiguredExercise[]>([
    {
      id: 'init-cardio-1',
      mediaId: 'caminadora-inclinada',
      name: 'Caminata / Carrera en Caminadora (Velocidad e Inclinación)',
      muscleGroup: 'Cardio',
      apparatusName: 'Caminadora Eléctrica Comercial con Inclinación',
      apparatusCategory: 'Cardio & Funcional',
      apparatusImage: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
      gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/cardio/treadmill.gif',
      sets: 1,
      reps: '15 min',
      workSecondsPerSet: 900,
      restSeconds: 0,
      equipmentType: 'treadmill',
      speedKmH: 6.0,
      inclinePercent: 5,
      cardioMinutes: 15,
      techniqueTip: 'Mantén la vista al frente y el abdomen contraído. No te sostengas fuertemente de los pasamanos.',
    },
    {
      id: 'init-strength-1',
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
      equipmentType: 'general',
      techniqueTip: 'Desciende empujando las caderas hacia atrás manteniendo el pecho erguido.',
    },
    {
      id: 'init-strength-2',
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
      equipmentType: 'general',
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
        (selectedMuscleFilter === 'Brazos' && (item.muscleTarget.includes('Bíceps') || item.muscleTarget.includes('Tríceps') || item.muscleTarget.includes('Antebrazos'))) ||
        (selectedMuscleFilter === 'Cardio' && (item.apparatus.category === 'Cardio & Funcional' || item.muscleTarget.includes('Cardio') || item.muscleTarget.includes('Cardiovascular')));

      const matchesApparatus =
        selectedApparatusFilter === 'all' ||
        item.apparatus.category === selectedApparatusFilter;

      return matchesSearch && matchesMuscle && matchesApparatus;
    });
  }, [searchQuery, selectedMuscleFilter, selectedApparatusFilter]);

  // CALORIE AND TIME CALCULATION ENGINE (Scientific ACSM & Compendium Formulas)
  const calculationSummary = useMemo(() => {
    const weight = Math.max(40, Math.min(180, userWeightKg || 75));
    let totalEstimatedSeconds = 0;
    let totalKcal = 0;

    const breakdown = configuredExercises.map((ex) => {
      let exerciseKcal = 0;
      let exerciseDurationSec = 0;
      let metValue = 5.0;

      if (ex.equipmentType === 'treadmill') {
        // Caminadora: ACSM Metabolic Equation
        const speed = ex.speedKmH || 6.0;
        const incline = ex.inclinePercent || 0;
        const durationMin = ex.cardioMinutes || 15;
        exerciseDurationSec = durationMin * 60;

        const speedMPerMin = speed * 16.6667;
        const grade = incline / 100;
        let vo2 = 0;

        if (speed <= 6.0) {
          // Walking equation: VO2 = (0.1 * S) + (1.8 * S * G) + 3.5
          vo2 = (0.1 * speedMPerMin) + (1.8 * speedMPerMin * grade) + 3.5;
        } else {
          // Running equation: VO2 = (0.2 * S) + (0.9 * S * G) + 3.5
          vo2 = (0.2 * speedMPerMin) + (0.9 * speedMPerMin * grade) + 3.5;
        }

        metValue = vo2 / 3.5;
        const kcalPerMin = (vo2 * weight) / 200;
        exerciseKcal = Math.round(kcalPerMin * durationMin);
      } else if (ex.equipmentType === 'stairmaster') {
        // Escaladora Sinfín (StairMaster)
        const level = ex.stairLevel || 6;
        const durationMin = ex.cardioMinutes || 15;
        exerciseDurationSec = durationMin * 60;

        metValue = 6.5 + (level * 0.55);
        const kcalPerMin = (metValue * 3.5 * weight) / 200;
        exerciseKcal = Math.round(kcalPerMin * durationMin);
      } else if (ex.equipmentType === 'elliptical') {
        // Máquina Elíptica
        const resistance = ex.ellipticalResistance || 8;
        const incline = ex.ellipticalIncline || 3;
        const durationMin = ex.cardioMinutes || 15;
        exerciseDurationSec = durationMin * 60;

        metValue = 5.0 + (resistance * 0.28) + (incline * 0.15);
        const kcalPerMin = (metValue * 3.5 * weight) / 200;
        exerciseKcal = Math.round(kcalPerMin * durationMin);
      } else if (ex.equipmentType === 'bike') {
        // Bicicleta Fija & Spinning
        const resistance = ex.bikeResistance || 7;
        const mode = ex.bikeMode || 'Ritmo Moderado (75-85 RPM)';
        const durationMin = ex.cardioMinutes || 15;
        exerciseDurationSec = durationMin * 60;

        let baseMet = 6.0;
        let resistanceFactor = 0.28;
        if (mode.includes('Paseo')) {
          baseMet = 4.5;
          resistanceFactor = 0.22;
        } else if (mode.includes('Spinning')) {
          baseMet = 8.0;
          resistanceFactor = 0.32;
        } else if (mode.includes('Montaña')) {
          baseMet = 7.5;
          resistanceFactor = 0.38;
        }

        metValue = baseMet + (resistance * resistanceFactor);
        const kcalPerMin = (metValue * 3.5 * weight) / 200;
        exerciseKcal = Math.round(kcalPerMin * durationMin);
      } else if (ex.equipmentType === 'rower') {
        // Remoergómetro & AirBike
        const resistance = ex.rowerResistance || 5;
        const durationMin = ex.cardioMinutes || 12;
        exerciseDurationSec = durationMin * 60;

        metValue = 6.5 + (resistance * 0.45);
        const kcalPerMin = (metValue * 3.5 * weight) / 200;
        exerciseKcal = Math.round(kcalPerMin * durationMin);
      } else {
        // General / Resistance Training
        const baseMet = EXERCISE_MET_LOOKUP[ex.muscleGroup] || 5.5;
        let adjustedMet = baseMet;
        if (goal === 'Quema de Grasa') adjustedMet += 0.6;
        if (goal === 'Fuerza') adjustedMet += 0.3;

        const workMinutesPerSet = (ex.workSecondsPerSet || 35) / 60;
        const restMinutesPerSet = (ex.restSeconds || 45) / 60;
        exerciseDurationSec = ex.sets * (ex.workSecondsPerSet + ex.restSeconds);

        const workKcalPerMinute = (adjustedMet * 3.5 * weight) / 200;
        const workKcal = workKcalPerMinute * (workMinutesPerSet * ex.sets);

        const restKcalPerMinute = (2.2 * 3.5 * weight) / 200;
        const restKcal = restKcalPerMinute * (restMinutesPerSet * ex.sets);

        metValue = adjustedMet;
        exerciseKcal = Math.round(workKcal + restKcal);
      }

      totalEstimatedSeconds += exerciseDurationSec;
      totalKcal += exerciseKcal;

      return {
        exerciseId: ex.id,
        name: ex.name,
        muscle: ex.muscleGroup,
        apparatus: ex.apparatusName,
        equipmentType: ex.equipmentType,
        totalSeconds: exerciseDurationSec,
        kcal: exerciseKcal,
        met: metValue.toFixed(1),
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

    let equivalenceText = 'Déficit calórico suficiente para acelerar la definición muscular diaria.';
    if (totalKcal > 450) {
      equivalenceText = '¡Quema equivalente a una comida completa de 450-600 kcal con alto impacto en grasa corporal!';
    }

    return {
      totalMinutes,
      totalKcal: Math.max(30, totalKcal),
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

    let muscle = 'Full Body';
    const target = item.muscleTarget.toLowerCase();
    if (target.includes('cuádriceps') || target.includes('glúteo') || target.includes('pierna') || target.includes('isquio')) muscle = 'Piernas';
    else if (target.includes('pectoral') || target.includes('pecho')) muscle = 'Pecho';
    else if (target.includes('dorsal') || target.includes('espalda') || target.includes('remo')) muscle = 'Espalda';
    else if (target.includes('deltoides') || target.includes('hombro')) muscle = 'Hombros';
    else if (target.includes('bíceps') || target.includes('tríceps') || target.includes('brazo')) muscle = 'Brazos';
    else if (target.includes('abdomen') || target.includes('core')) muscle = 'Core';
    else if (item.apparatus.category === 'Cardio & Funcional' || target.includes('cardio')) muscle = 'Cardio';

    const eqType = detectEquipmentType(item.id, item.exerciseName, item.apparatus.category);
    const isCardio = eqType !== 'general';

    const newEx: ConfiguredExercise = {
      id: 'ex-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      mediaId: item.id,
      name: item.exerciseName,
      muscleGroup: muscle,
      apparatusName: item.apparatus.name,
      apparatusCategory: item.apparatus.category,
      apparatusImage: item.apparatus.imageUrl,
      gifUrl: item.gifUrl,
      equipmentType: eqType,
      sets: isCardio ? 1 : 4,
      reps: isCardio ? '15 min' : '12',
      workSecondsPerSet: isCardio ? 900 : 35,
      restSeconds: isCardio ? 0 : 45,
      techniqueTip: item.executionTips[0] || 'Mantén postura controlada y respira con ritmo.',

      // Cardio Defaults
      speedKmH: eqType === 'treadmill' ? 6.0 : undefined,
      inclinePercent: eqType === 'treadmill' ? 3 : undefined,
      cardioMinutes: isCardio ? 15 : undefined,
      stairLevel: eqType === 'stairmaster' ? 6 : undefined,
      ellipticalResistance: eqType === 'elliptical' ? 8 : undefined,
      ellipticalIncline: eqType === 'elliptical' ? 3 : undefined,
      bikeResistance: eqType === 'bike' ? 7 : undefined,
      bikeMode: eqType === 'bike' ? 'Ritmo Moderado (75-85 RPM)' : undefined,
      rowerResistance: eqType === 'rower' ? 5 : undefined,
    };

    setConfiguredExercises([...configuredExercises, newEx]);
  };

  const handleAddManualExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const eqType = detectEquipmentType(undefined, customName + ' ' + customApparatus);
    const isCardio = eqType !== 'general' || customMuscle === 'Cardio';

    const newEx: ConfiguredExercise = {
      id: 'custom-ex-' + Date.now(),
      name: customName.trim(),
      muscleGroup: customMuscle,
      apparatusName: customApparatus,
      apparatusCategory: isCardio ? 'Cardio & Funcional' : 'Máquinas Guiadas',
      equipmentType: eqType,
      sets: isCardio ? 1 : customSets,
      reps: isCardio ? '15 min' : customReps,
      workSecondsPerSet: isCardio ? 900 : 35,
      restSeconds: isCardio ? 0 : customRest,
      techniqueTip: 'Controla el movimiento y mantén una respiración uniforme.',
      cardioMinutes: isCardio ? 15 : undefined,
      speedKmH: eqType === 'treadmill' ? 6.0 : undefined,
      inclinePercent: eqType === 'treadmill' ? 3 : undefined,
      stairLevel: eqType === 'stairmaster' ? 6 : undefined,
      ellipticalResistance: eqType === 'elliptical' ? 8 : undefined,
      bikeResistance: eqType === 'bike' ? 7 : undefined,
      bikeMode: eqType === 'bike' ? 'Ritmo Moderado (75-85 RPM)' : undefined,
    };

    setConfiguredExercises([...configuredExercises, newEx]);
    setCustomName('');
  };

  const handleRemoveExercise = (id: string) => {
    setConfiguredExercises(configuredExercises.filter((e) => e.id !== id));
  };

  const handleUpdateExercise = (id: string, updates: Partial<ConfiguredExercise>) => {
    setConfiguredExercises(
      configuredExercises.map((e) => {
        if (e.id !== id) return e;
        const updated = { ...e, ...updates };

        // Sync cardio duration with workSecondsPerSet and reps label
        if (updates.cardioMinutes !== undefined) {
          updated.workSecondsPerSet = updates.cardioMinutes * 60;
          updated.reps = updates.cardioMinutes + ' min';
        }
        return updated;
      })
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
      exercises: configuredExercises.map((item, i) => {
        // Detailed apparatus configuration note
        let configNote = 'Aparato: ' + item.apparatusName + '. ';
        if (item.equipmentType === 'treadmill') {
          configNote += `[Caminadora: Velocidad ${item.speedKmH || 6.0} km/h, Inclinación ${item.inclinePercent || 0}%, Tiempo ${item.cardioMinutes || 15} min]. `;
        } else if (item.equipmentType === 'stairmaster') {
          configNote += `[Escaladora Sinfín: Nivel ${item.stairLevel || 6}, Tiempo ${item.cardioMinutes || 15} min]. `;
        } else if (item.equipmentType === 'elliptical') {
          configNote += `[Elíptica: Resistencia Nivel ${item.ellipticalResistance || 8}, Inclinación ${item.ellipticalIncline || 3}, Tiempo ${item.cardioMinutes || 15} min]. `;
        } else if (item.equipmentType === 'bike') {
          configNote += `[Bicicleta Fija / Spinning: Resistencia Nivel ${item.bikeResistance || 7}, Modo ${item.bikeMode || 'Moderado'}, Tiempo ${item.cardioMinutes || 15} min]. `;
        } else if (item.equipmentType === 'rower') {
          configNote += `[Remoergómetro: Resistencia ${item.rowerResistance || 5}, Tiempo ${item.cardioMinutes || 12} min]. `;
        }
        configNote += item.techniqueTip || '';

        const isCardio = item.equipmentType !== 'general';
        const numSets = isCardio ? 1 : item.sets;
        const repsVal = isCardio ? (item.cardioMinutes || 15) : (parseInt(item.reps.split('-')[0]) || 12);

        return {
          exerciseId: 'ex-' + i + '-' + Date.now(),
          exerciseName: item.name,
          muscleGroup: item.muscleGroup,
          targetSets: numSets,
          targetReps: isCardio ? (item.cardioMinutes + ' min') : item.reps,
          suggestedRestSeconds: isCardio ? 0 : item.restSeconds,
          notes: configNote,
          sets: Array.from({ length: numSets }).map((_, sIdx) => ({
            id: 's-' + i + '-' + sIdx,
            setNumber: sIdx + 1,
            weight: isCardio ? 0 : 20,
            reps: repsVal,
            completed: false,
          })),
        };
      }),
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
                <AlfaOmegaLogo size={14} /> 1. Datos Generales de tu Rutina
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
                    placeholder="Ej. Cardio &amp; Fuerza Quema Grasa / Piernas &amp; Escaladora"
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
                    <option value="Quema de Grasa">Quema de Grasa (Déficit Calórico)</option>
                    <option value="Hipertrofia">Hipertrofia (Masa Muscular)</option>
                    <option value="Fuerza">Fuerza &amp; Potencia</option>
                    <option value="Resistencia">Resistencia Cardiovascular &amp; Tono</option>
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
                    <option value="Avanzado">Avanzado (Alto Rendimiento)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-red-400" />
                      Tu Peso Corporal para el Cálculo Calórico:
                    </label>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {userWeightKg} kg ({Math.round(userWeightKg * 2.20462)} lbs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="140"
                    step="0.5"
                    value={userWeightKg}
                    onChange={(e) => setUserWeightKg(parseFloat(e.target.value) || 75)}
                    className="w-full accent-red-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>45 kg</span>
                    <span>70 kg (Promedio)</span>
                    <span>100 kg</span>
                    <span>140 kg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Real-Time Metabolic & Calorie Meter (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-red-950/40 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-red-500 animate-pulse" /> Medidor Metabólico ACSM
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${calculationSummary.intensityColor}`}>
                  {calculationSummary.intensityLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 block font-semibold">Gasto Estimado</span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <Flame className="w-5 h-5 text-red-500 fill-red-500" />
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {calculationSummary.totalKcal}
                    </span>
                    <span className="text-xs text-red-400 font-extrabold">kcal</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="text-xs text-slate-400 block font-semibold">Tiempo Total</span>
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
                  <span>Ritmo de quema promedio:</span>
                  <span className="font-bold text-white">{calculationSummary.kcalPerMinute} kcal/min</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Aparatos configurados:</span>
                  <span className="font-bold text-white">{configuredExercises.length} ejercicios</span>
                </div>
                <p className="text-[10px] text-red-300/90 italic pt-1 border-t border-slate-800/80">
                  💡 {calculationSummary.equivalenceText}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Selected Exercises Builder List with Equipment Specific Controls */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-red-500" /> 2. Aparatos y Ejercicios en tu Rutina ({configuredExercises.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Ajusta la velocidad, inclinación o resistencia de cada equipo para calibrar la dificultad y las kcalorías.
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
                  Selecciona caminadoras, escaladoras, bicicletas o pesas del catálogo abajo para agregarlos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {configuredExercises.map((ex, idx) => {
                  const exSummary = calculationSummary.breakdown.find(b => b.exerciseId === ex.id);

                  return (
                    <div
                      key={ex.id}
                      className="bg-slate-900 border border-slate-750 hover:border-slate-650 rounded-2xl p-3.5 sm:p-4 transition-all space-y-3"
                    >
                      {/* Top Header of the Exercise Card */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                ex.equipmentType !== 'general'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border-red-500/30'
                              }`}>
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

                        {/* Individual Card Calorie & Delete */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          {exSummary && (
                            <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-500/20 px-2.5 py-1 rounded-xl text-xs">
                              <Flame className="w-3.5 h-3.5 text-red-400" />
                              <span className="font-extrabold text-white">{exSummary.kcal} kcal</span>
                              <span className="text-[10px] text-slate-400 font-mono">({Math.round(exSummary.totalSeconds / 60)} min)</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                            title="Eliminar de la rutina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Equipment-Specific Detailed Difficulty Controls */}
                      {ex.equipmentType === 'treadmill' && (
                        /* Caminadora: Velocidad & Inclinación */
                        <div className="bg-slate-850/90 border border-slate-750 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-750 pb-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <Gauge className="w-4 h-4" /> Controles de Caminadora Eléctrica (Treadmill)
                            </span>
                            <span className="text-[11px] text-slate-300 font-semibold">
                              { (ex.speedKmH || 6.0) <= 6.0 ? '🚶 Caminata' : (ex.speedKmH || 6.0) <= 10.0 ? '🏃 Trote' : '⚡ Carrera / Sprint' }
                              { (ex.inclinePercent || 0) >= 8 ? ' (Inclinación Alta - Quema Acelerada)' : '' }
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Velocidad */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Velocidad</span>
                                <span className="text-sm font-black text-white">{ex.speedKmH || 6.0} km/h</span>
                              </div>
                              <input
                                type="range"
                                min="3.0"
                                max="16.0"
                                step="0.2"
                                value={ex.speedKmH || 6.0}
                                onChange={(e) => handleUpdateExercise(ex.id, { speedKmH: parseFloat(e.target.value) })}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>3.0 (Paseo)</span>
                                <span>6.0 (Caminata Rápida)</span>
                                <span>16.0 (Sprint)</span>
                              </div>
                            </div>

                            {/* Inclinación */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-red-400" /> Inclinación (%)
                                </span>
                                <span className="text-sm font-black text-white">{ex.inclinePercent || 0} %</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="15"
                                step="1"
                                value={ex.inclinePercent || 0}
                                onChange={(e) => handleUpdateExercise(ex.id, { inclinePercent: parseInt(e.target.value) })}
                                className="w-full accent-red-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>0% (Plano)</span>
                                <span>6% (Colina)</span>
                                <span>15% (Extrema)</span>
                              </div>
                            </div>

                            {/* Duración */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-400" /> Tiempo de Cardio
                                </span>
                                <span className="text-sm font-black text-amber-400">{ex.cardioMinutes || 15} min</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={ex.cardioMinutes || 15}
                                onChange={(e) => handleUpdateExercise(ex.id, { cardioMinutes: parseInt(e.target.value) })}
                                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>5 min</span>
                                <span>20 min</span>
                                <span>60 min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {ex.equipmentType === 'stairmaster' && (
                        /* Escaladora Sinfín (StairMaster) */
                        <div className="bg-slate-850/90 border border-slate-750 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-750 pb-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <TrendingUp className="w-4 h-4" /> Dificultad de Escaladora Sinfín (StairMaster / Stepmill)
                            </span>
                            <span className="text-[11px] text-slate-300 font-semibold">
                              { (ex.stairLevel || 6) <= 4 ? 'Nivel Inicial (40 escalones/min)' : (ex.stairLevel || 6) <= 8 ? 'Nivel Intermedio (70 escalones/min)' : 'Nivel Élite / Quema Máxima (100+ escalones/min)' }
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Nivel de Velocidad */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Nivel de Velocidad</span>
                                <span className="text-sm font-black text-white">Nivel {ex.stairLevel || 6} (de 15)</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="15"
                                step="1"
                                value={ex.stairLevel || 6}
                                onChange={(e) => handleUpdateExercise(ex.id, { stairLevel: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>Nivel 1 (Suave)</span>
                                <span>Nivel 7 (Quemador)</span>
                                <span>Nivel 15 (Máximo)</span>
                              </div>
                            </div>

                            {/* Tiempo */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-400" /> Tiempo de Escalada
                                </span>
                                <span className="text-sm font-black text-amber-400">{ex.cardioMinutes || 15} min</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="45"
                                step="5"
                                value={ex.cardioMinutes || 15}
                                onChange={(e) => handleUpdateExercise(ex.id, { cardioMinutes: parseInt(e.target.value) })}
                                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>5 min</span>
                                <span>15 min</span>
                                <span>45 min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {ex.equipmentType === 'elliptical' && (
                        /* Máquina Elíptica */
                        <div className="bg-slate-850/90 border border-slate-750 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-750 pb-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <Gauge className="w-4 h-4" /> Ajustes de Resistencia Elíptica (Cross Trainer)
                            </span>
                            <span className="text-[11px] text-slate-300 font-semibold">
                              { (ex.ellipticalResistance || 8) <= 5 ? 'Resistencia Suave' : (ex.ellipticalResistance || 8) <= 12 ? 'Resistencia Media Aeróbica' : 'Resistencia Alta (Fuerza & Quema)' }
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Resistencia */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Resistencia Magnética</span>
                                <span className="text-sm font-black text-white">Nivel {ex.ellipticalResistance || 8} / 20</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={ex.ellipticalResistance || 8}
                                onChange={(e) => handleUpdateExercise(ex.id, { ellipticalResistance: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>Nivel 1</span>
                                <span>Nivel 10</span>
                                <span>Nivel 20</span>
                              </div>
                            </div>

                            {/* Inclinación / Rampa */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Inclinación Rampa</span>
                                <span className="text-sm font-black text-white">Nivel {ex.ellipticalIncline || 3} / 10</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={ex.ellipticalIncline || 3}
                                onChange={(e) => handleUpdateExercise(ex.id, { ellipticalIncline: parseInt(e.target.value) })}
                                className="w-full accent-red-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>Nivel 1</span>
                                <span>Nivel 5</span>
                                <span>Nivel 10</span>
                              </div>
                            </div>

                            {/* Tiempo */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-400" /> Tiempo
                                </span>
                                <span className="text-sm font-black text-amber-400">{ex.cardioMinutes || 15} min</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={ex.cardioMinutes || 15}
                                onChange={(e) => handleUpdateExercise(ex.id, { cardioMinutes: parseInt(e.target.value) })}
                                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>5 min</span>
                                <span>20 min</span>
                                <span>60 min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {ex.equipmentType === 'bike' && (
                        /* Bicicleta Fija / Spinning */
                        <div className="bg-slate-850/90 border border-slate-750 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-750 pb-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <Activity className="w-4 h-4" /> Parámetros de Bicicleta Fija &amp; Spinning
                            </span>
                            <span className="text-[11px] text-slate-300 font-semibold">
                              {ex.bikeMode}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Modo de Ciclismo */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1">
                              <label className="text-slate-400 text-xs font-medium block">Modo de Pedaleo</label>
                              <select
                                value={ex.bikeMode || 'Ritmo Moderado (75-85 RPM)'}
                                onChange={(e) => handleUpdateExercise(ex.id, { bikeMode: e.target.value as any })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                              >
                                <option value="Paseo Suave (60-70 RPM)">Paseo Suave (60-70 RPM)</option>
                                <option value="Ritmo Moderado (75-85 RPM)">Ritmo Moderado (75-85 RPM)</option>
                                <option value="Spinning Alta Cadencia (90-110 RPM)">Spinning Alta Cadencia (90-110 RPM)</option>
                                <option value="Subida de Montaña (Carga Alta)">Subida de Montaña (Carga Alta)</option>
                              </select>
                            </div>

                            {/* Resistencia */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Resistencia Magnética</span>
                                <span className="text-sm font-black text-white">Nivel {ex.bikeResistance || 7} / 20</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={ex.bikeResistance || 7}
                                onChange={(e) => handleUpdateExercise(ex.id, { bikeResistance: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>Nivel 1</span>
                                <span>Nivel 10</span>
                                <span>Nivel 20</span>
                              </div>
                            </div>

                            {/* Tiempo */}
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-400" /> Tiempo de Pedaleo
                                </span>
                                <span className="text-sm font-black text-amber-400">{ex.cardioMinutes || 15} min</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="60"
                                step="5"
                                value={ex.cardioMinutes || 15}
                                onChange={(e) => handleUpdateExercise(ex.id, { cardioMinutes: parseInt(e.target.value) })}
                                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span>5 min</span>
                                <span>20 min</span>
                                <span>60 min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {ex.equipmentType === 'rower' && (
                        /* Remoergómetro */
                        <div className="bg-slate-850/90 border border-slate-750 rounded-xl p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs border-b border-slate-750 pb-2">
                            <span className="font-bold text-amber-400 flex items-center gap-1.5">
                              <Zap className="w-4 h-4" /> Resistencia del Ventilador (Damper Concept2)
                            </span>
                            <span className="text-[11px] text-slate-300 font-semibold">
                              Arrastre Damper {ex.rowerResistance || 5} / 10
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">Palanca de Resistencia (Damper)</span>
                                <span className="text-sm font-black text-white">Nivel {ex.rowerResistance || 5}</span>
                              </div>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={ex.rowerResistance || 5}
                                onChange={(e) => handleUpdateExercise(ex.id, { rowerResistance: parseInt(e.target.value) })}
                                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                            </div>

                            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-400" /> Tiempo de Remada
                                </span>
                                <span className="text-sm font-black text-amber-400">{ex.cardioMinutes || 12} min</span>
                              </div>
                              <input
                                type="range"
                                min="5"
                                max="45"
                                step="1"
                                value={ex.cardioMinutes || 12}
                                onChange={(e) => handleUpdateExercise(ex.id, { cardioMinutes: parseInt(e.target.value) })}
                                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {ex.equipmentType === 'general' && (
                        /* Standard Weight / Reps / Sets Controls */
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between sm:justify-start bg-slate-850/60 p-2.5 rounded-xl border border-slate-750">
                          {/* Sets */}
                          <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Series</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateExercise(ex.id, { sets: Math.max(1, ex.sets - 1) })}
                                className="w-5 h-5 rounded bg-slate-700 text-white text-xs font-bold hover:bg-slate-600 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-white px-1.5">{ex.sets}</span>
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
                          <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Repeticiones</span>
                            <input
                              type="text"
                              value={ex.reps}
                              onChange={(e) => handleUpdateExercise(ex.id, { reps: e.target.value })}
                              className="w-16 bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-center font-bold text-white mt-0.5"
                            />
                          </div>

                          {/* Rest Time */}
                          <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1 text-center">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Descanso</span>
                            <select
                              value={ex.restSeconds}
                              onChange={(e) => handleUpdateExercise(ex.id, { restSeconds: parseInt(e.target.value) || 45 })}
                              className="bg-slate-800 border border-slate-600 rounded px-1.5 py-0.5 text-xs font-bold text-amber-300 mt-0.5"
                            >
                              <option value="30">30 seg</option>
                              <option value="45">45 seg</option>
                              <option value="60">60 seg</option>
                              <option value="90">90 seg</option>
                              <option value="120">2 min</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  Explora las máquinas de cardio, poleas, barras y pesas de Alfa &amp; Omega Gym.
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
                      placeholder="Buscar caminadora, bici, prensa..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <select
                      value={selectedMuscleFilter}
                      onChange={(e) => setSelectedMuscleFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="all">Todos los Grupos Musculares</option>
                      <option value="Cardio">🔥 Cardio (Caminadora, Bici, Escaladora, Elíptica)</option>
                      <option value="Piernas">Piernas (Cuádriceps, Glúteo, Isquios)</option>
                      <option value="Pecho">Pecho (Pectorales)</option>
                      <option value="Espalda">Espalda (Dorsales, Romboides)</option>
                      <option value="Hombros">Hombros (Deltoides)</option>
                      <option value="Brazos">Brazos (Bíceps, Tríceps)</option>
                      <option value="Core">Core &amp; Abdomen</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={selectedApparatusFilter}
                      onChange={(e) => setSelectedApparatusFilter(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="all">Todas las Categorías de Aparatos</option>
                      <option value="Cardio & Funcional">Cardio &amp; Funcional (Caminadora, Escaladora, Bici)</option>
                      <option value="Máquinas Guiadas">Máquinas Guiadas (Prensa, Smith, etc.)</option>
                      <option value="Poleas & Cables">Poleas &amp; Cables (Torres cruzadas)</option>
                      <option value="Peso Libre & Bancos">Peso Libre &amp; Bancos</option>
                    </select>
                  </div>
                </div>

                {/* Catalog Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredCatalog.map((item) => {
                    const isAdded = configuredExercises.some((e) => e.mediaId === item.id);
                    const isExpanded = expandedExerciseId === item.id;
                    const isCardio = item.apparatus.category === 'Cardio & Funcional';

                    return (
                      <div
                        key={item.id}
                        className={`bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all ${
                          isAdded
                            ? 'border-emerald-500/50 bg-emerald-950/20'
                            : isCardio
                            ? 'border-amber-500/30 hover:border-amber-400'
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
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block truncate max-w-[130px] ${
                                isCardio ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                                {isCardio ? 'Cardio & Máquina' : item.muscleTarget.split(',')[0]}
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
                              <p className="font-bold text-white">Consejo de técnica &amp; ajuste:</p>
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
                            <span>{isExpanded ? 'Ocultar' : 'Ver ajuste'}</span>
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
                      Nombre del Ejercicio o Aparato
                    </label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Ej. Caminata Rápida Inclinada / Sentadilla Smith"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Músculo / Tipo
                    </label>
                    <select
                      value={customMuscle}
                      onChange={(e) => setCustomMuscle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Cardio">Cardio &amp; Quema Calórica</option>
                      <option value="Piernas">Piernas</option>
                      <option value="Pecho">Pecho</option>
                      <option value="Espalda">Espalda</option>
                      <option value="Hombros">Hombros</option>
                      <option value="Brazos">Brazos</option>
                      <option value="Core">Core</option>
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
                      placeholder="Ej. Caminadora Eléctrica / Banco Inclinado"
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
