import { Routine, WeightEntry, WorkoutSession, UserProfile } from '../types';

const STORAGE_KEYS = {
  ROUTINES: 'gymtrack_routines_v1',
  WEIGHT_LOGS: 'gymtrack_weight_logs_v1',
  WORKOUT_LOGS: 'gymtrack_workout_logs_v1',
  USER_PROFILE: 'gymtrack_profile_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alejandro Ramos',
  heightCm: 178,
  initialWeight: 84.5,
  currentWeight: 79.2,
  targetWeight: 74.0,
  gender: 'Hombre',
  goal: 'Pérdida de grasa & Definición muscular',
  activityLevel: 'Activo',
  dailyCalorieTarget: 2200,
};

export const INITIAL_WEIGHT_LOGS: WeightEntry[] = [
  { id: 'w1', memberId: 'member-ao-1001', date: '2026-08-01', weight: 84.5, bodyFatPercentage: 24.2, waistCm: 94, notes: 'Punto de partida. Inicio de déficit calórico y entrenamiento regular.' },
  { id: 'w2', memberId: 'member-ao-1001', date: '2026-08-08', weight: 83.8, bodyFatPercentage: 23.8, waistCm: 93, notes: 'Buena energía en las sesiones de gimnasio.' },
  { id: 'w3', memberId: 'member-ao-1001', date: '2026-08-15', weight: 82.9, bodyFatPercentage: 23.1, waistCm: 91.5, notes: 'Mayor resistencia en descansos cortos.' },
  { id: 'w4', memberId: 'member-ao-1001', date: '2026-08-22', weight: 82.1, bodyFatPercentage: 22.4, waistCm: 90, notes: 'Subiendo cargas en press banca y sentadillas.' },
  { id: 'w5', memberId: 'member-ao-1001', date: '2026-08-29', weight: 81.3, bodyFatPercentage: 21.8, waistCm: 88.5, notes: 'Primer mes completado: -3.2 kg de grasa corporal.' },
  { id: 'w6', memberId: 'member-ao-1001', date: '2026-09-05', weight: 80.2, bodyFatPercentage: 21.0, waistCm: 87, notes: 'Incremento del NEAT y cardio post-pesas.' },
  { id: 'w7', memberId: 'member-ao-1001', date: '2026-09-11', weight: 79.2, bodyFatPercentage: 20.3, waistCm: 85.5, notes: '¡Rompiendo la barrera de los 80kg! Excelente definición.' },
];

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'r-fullbody-fatburn',
    name: 'Full Body Quema Grasa Metabólica',
    description: 'Circuito multiarticular diseñado para maximizar el gasto calórico y acelerar el metabolismo post-entrenamiento (efecto EPOC).',
    difficulty: 'Intermedio',
    estimatedCalories: 520,
    durationMinutes: 50,
    goal: 'Quema de Grasa',
    exercises: [
      {
        exerciseId: 'e1',
        exerciseName: 'Sentadillas Goblet con Mancuerna',
        muscleGroup: 'Piernas',
        targetSets: 4,
        targetReps: '12-15',
        suggestedRestSeconds: 45,
        notes: 'Profundidad paralela y ritmo constante',
        sets: [
          { id: 's1', setNumber: 1, weight: 20, reps: 15, completed: false },
          { id: 's2', setNumber: 2, weight: 22, reps: 14, completed: false },
          { id: 's3', setNumber: 3, weight: 24, reps: 12, completed: false },
          { id: 's4', setNumber: 4, weight: 24, reps: 12, completed: false },
        ]
      },
      {
        exerciseId: 'e2',
        exerciseName: 'Press de Banca Plano con Mancuernas',
        muscleGroup: 'Pecho',
        targetSets: 4,
        targetReps: '10-12',
        suggestedRestSeconds: 60,
        notes: 'Control excéntrico de 2 segundos',
        sets: [
          { id: 's5', setNumber: 1, weight: 18, reps: 12, completed: false },
          { id: 's6', setNumber: 2, weight: 20, reps: 11, completed: false },
          { id: 's7', setNumber: 3, weight: 22, reps: 10, completed: false },
          { id: 's8', setNumber: 4, weight: 22, reps: 10, completed: false },
        ]
      },
      {
        exerciseId: 'e3',
        exerciseName: 'Remo con Barra o Polea Baja',
        muscleGroup: 'Espalda',
        targetSets: 4,
        targetReps: '12',
        suggestedRestSeconds: 50,
        notes: 'Retracción escapular máxima en cada tirón',
        sets: [
          { id: 's9', setNumber: 1, weight: 45, reps: 12, completed: false },
          { id: 's10', setNumber: 2, weight: 50, reps: 12, completed: false },
          { id: 's11', setNumber: 3, weight: 55, reps: 10, completed: false },
          { id: 's12', setNumber: 4, weight: 55, reps: 10, completed: false },
        ]
      },
      {
        exerciseId: 'e4',
        exerciseName: 'Zancadas Dinámicas Caminando',
        muscleGroup: 'Piernas',
        targetSets: 3,
        targetReps: '12 por pierna',
        suggestedRestSeconds: 45,
        notes: 'Mancuernas en manos, tronco erguido',
        sets: [
          { id: 's13', setNumber: 1, weight: 12, reps: 24, completed: false },
          { id: 's14', setNumber: 2, weight: 14, reps: 24, completed: false },
          { id: 's15', setNumber: 3, weight: 14, reps: 24, completed: false },
        ]
      },
      {
        exerciseId: 'e5',
        exerciseName: 'Kettlebell Swings & Plancha Dinámica',
        muscleGroup: 'Core',
        targetSets: 3,
        targetReps: '20 swings + 45s plancha',
        suggestedRestSeconds: 40,
        notes: 'Explosión desde la cadera',
        sets: [
          { id: 's16', setNumber: 1, weight: 16, reps: 20, completed: false },
          { id: 's17', setNumber: 2, weight: 16, reps: 20, completed: false },
          { id: 's18', setNumber: 3, weight: 20, reps: 20, completed: false },
        ]
      }
    ]
  },
  {
    id: 'r-torso-fuerza',
    name: 'Torso: Fuerza, Hipertrofia & Postura',
    description: 'Enfoque en pecho, espalda superior, deltoides y brazos para moldear una silueta estética mientras preservas masa muscular magra.',
    difficulty: 'Intermedio',
    estimatedCalories: 430,
    durationMinutes: 55,
    goal: 'Hipertrofia',
    exercises: [
      {
        exerciseId: 'e10',
        exerciseName: 'Press Militar de Pie con Barra',
        muscleGroup: 'Hombros',
        targetSets: 4,
        targetReps: '8-10',
        suggestedRestSeconds: 75,
        sets: [
          { id: 's20', setNumber: 1, weight: 35, reps: 10, completed: false },
          { id: 's21', setNumber: 2, weight: 40, reps: 9, completed: false },
          { id: 's22', setNumber: 3, weight: 42.5, reps: 8, completed: false },
          { id: 's23', setNumber: 4, weight: 42.5, reps: 8, completed: false },
        ]
      },
      {
        exerciseId: 'e11',
        exerciseName: 'Dominadas o Jalón al Pecho',
        muscleGroup: 'Espalda',
        targetSets: 4,
        targetReps: '10-12',
        suggestedRestSeconds: 60,
        sets: [
          { id: 's24', setNumber: 1, weight: 60, reps: 12, completed: false },
          { id: 's25', setNumber: 2, weight: 65, reps: 10, completed: false },
          { id: 's26', setNumber: 3, weight: 70, reps: 9, completed: false },
          { id: 's27', setNumber: 4, weight: 70, reps: 8, completed: false },
        ]
      },
      {
        exerciseId: 'e12',
        exerciseName: 'Press Inclinado con Mancuernas',
        muscleGroup: 'Pecho',
        targetSets: 4,
        targetReps: '10-12',
        suggestedRestSeconds: 60,
        sets: [
          { id: 's28', setNumber: 1, weight: 20, reps: 12, completed: false },
          { id: 's29', setNumber: 2, weight: 22, reps: 11, completed: false },
          { id: 's30', setNumber: 3, weight: 24, reps: 9, completed: false },
          { id: 's31', setNumber: 4, weight: 24, reps: 9, completed: false },
        ]
      },
      {
        exerciseId: 'e13',
        exerciseName: 'Elevaciones Laterales en Polea',
        muscleGroup: 'Hombros',
        targetSets: 3,
        targetReps: '15',
        suggestedRestSeconds: 45,
        sets: [
          { id: 's32', setNumber: 1, weight: 7.5, reps: 15, completed: false },
          { id: 's33', setNumber: 2, weight: 9, reps: 14, completed: false },
          { id: 's34', setNumber: 3, weight: 9, reps: 13, completed: false },
        ]
      }
    ]
  },
  {
    id: 'r-hiit-express',
    name: 'HIIT Calorie Inferno (Alta Intensidad)',
    description: 'Intervalos aeróbicos y pliométricos sin pausas largas, ideales para quemar entre 400 y 600 kcal en tiempo récord.',
    difficulty: 'Avanzado',
    estimatedCalories: 480,
    durationMinutes: 35,
    goal: 'Quema de Grasa',
    exercises: [
      {
        exerciseId: 'e20',
        exerciseName: 'Burpees con Salto al Cajón',
        muscleGroup: 'Full Body',
        targetSets: 4,
        targetReps: '15 reps',
        suggestedRestSeconds: 30,
        sets: [
          { id: 's40', setNumber: 1, weight: 0, reps: 15, completed: false },
          { id: 's41', setNumber: 2, weight: 0, reps: 15, completed: false },
          { id: 's42', setNumber: 3, weight: 0, reps: 15, completed: false },
          { id: 's43', setNumber: 4, weight: 0, reps: 15, completed: false },
        ]
      },
      {
        exerciseId: 'e21',
        exerciseName: 'Remo Ergométrico o Air Bike (Intervalos)',
        muscleGroup: 'Cardio',
        targetSets: 6,
        targetReps: '20s All-out / 20s suave',
        suggestedRestSeconds: 30,
        sets: [
          { id: 's44', setNumber: 1, weight: 0, reps: 20, completed: false },
          { id: 's45', setNumber: 2, weight: 0, reps: 20, completed: false },
          { id: 's46', setNumber: 3, weight: 0, reps: 20, completed: false },
          { id: 's47', setNumber: 4, weight: 0, reps: 20, completed: false },
          { id: 's48', setNumber: 5, weight: 0, reps: 20, completed: false },
          { id: 's49', setNumber: 6, weight: 0, reps: 20, completed: false },
        ]
      },
      {
        exerciseId: 'e22',
        exerciseName: 'Mountain Climbers + Escalador Cruzado',
        muscleGroup: 'Core',
        targetSets: 4,
        targetReps: '40 segundos',
        suggestedRestSeconds: 30,
        sets: [
          { id: 's50', setNumber: 1, weight: 0, reps: 40, completed: false },
          { id: 's51', setNumber: 2, weight: 0, reps: 40, completed: false },
          { id: 's52', setNumber: 3, weight: 0, reps: 40, completed: false },
          { id: 's53', setNumber: 4, weight: 0, reps: 40, completed: false },
        ]
      }
    ]
  }
];

export const INITIAL_WORKOUT_LOGS: WorkoutSession[] = [
  {
    id: 'log-1',
    memberId: 'member-ao-1001',
    routineName: 'Full Body Quema Grasa Metabólica',
    date: '2026-09-04T18:30:00.000Z',
    durationMinutes: 52,
    caloriesBurned: 535,
    totalVolumeKg: 6420,
    exercises: [
      {
        name: 'Sentadillas Goblet',
        muscleGroup: 'Piernas',
        sets: [{ weight: 22, reps: 15, completed: true }, { weight: 24, reps: 14, completed: true }, { weight: 24, reps: 12, completed: true }]
      },
      {
        name: 'Press de Banca Plano',
        muscleGroup: 'Pecho',
        sets: [{ weight: 20, reps: 12, completed: true }, { weight: 22, reps: 10, completed: true }, { weight: 22, reps: 10, completed: true }]
      },
      {
        name: 'Remo con Barra',
        muscleGroup: 'Espalda',
        sets: [{ weight: 50, reps: 12, completed: true }, { weight: 55, reps: 10, completed: true }]
      }
    ],
    notes: 'Muy buenas sensaciones. Sudoración intensa y excelente recuperación entre series.'
  },
  {
    id: 'log-2',
    memberId: 'member-ao-1001',
    routineName: 'Torso: Fuerza & Hipertrofia',
    date: '2026-09-06T19:00:00.000Z',
    durationMinutes: 48,
    caloriesBurned: 440,
    totalVolumeKg: 7890,
    exercises: [
      {
        name: 'Press Militar de Pie',
        muscleGroup: 'Hombros',
        sets: [{ weight: 40, reps: 10, completed: true }, { weight: 42.5, reps: 8, completed: true }, { weight: 42.5, reps: 8, completed: true }]
      },
      {
        name: 'Jalón al Pecho',
        muscleGroup: 'Espalda',
        sets: [{ weight: 65, reps: 10, completed: true }, { weight: 70, reps: 9, completed: true }, { weight: 70, reps: 8, completed: true }]
      },
      {
        name: 'Press Inclinado',
        muscleGroup: 'Pecho',
        sets: [{ weight: 22, reps: 11, completed: true }, { weight: 24, reps: 9, completed: true }]
      }
    ],
    notes: 'Incremento de peso en press militar. RPE 8 en la última serie.'
  },
  {
    id: 'log-3',
    memberId: 'member-ao-1001',
    routineName: 'HIIT Calorie Inferno',
    date: '2026-09-08T07:15:00.000Z',
    durationMinutes: 36,
    caloriesBurned: 490,
    totalVolumeKg: 2100,
    exercises: [
      {
        name: 'Burpees con Salto al Cajón',
        muscleGroup: 'Full Body',
        sets: [{ weight: 0, reps: 15, completed: true }, { weight: 0, reps: 15, completed: true }, { weight: 0, reps: 15, completed: true }]
      },
      {
        name: 'Remo Ergométrico Sprints',
        muscleGroup: 'Cardio',
        sets: [{ weight: 0, reps: 20, completed: true }, { weight: 0, reps: 20, completed: true }, { weight: 0, reps: 20, completed: true }]
      }
    ],
    notes: 'Sesión matutina en ayunas con electrolitos. Ritmo cardíaco promedio 158 ppm.'
  },
  {
    id: 'log-4',
    memberId: 'member-ao-1001',
    routineName: 'Full Body Quema Grasa Metabólica',
    date: '2026-09-10T18:45:00.000Z',
    durationMinutes: 54,
    caloriesBurned: 545,
    totalVolumeKg: 7120,
    exercises: [
      {
        name: 'Sentadillas Goblet',
        muscleGroup: 'Piernas',
        sets: [{ weight: 24, reps: 15, completed: true }, { weight: 26, reps: 13, completed: true }, { weight: 26, reps: 12, completed: true }]
      },
      {
        name: 'Press de Banca Plano',
        muscleGroup: 'Pecho',
        sets: [{ weight: 22, reps: 12, completed: true }, { weight: 24, reps: 10, completed: true }]
      },
      {
        name: 'Kettlebell Swings',
        muscleGroup: 'Core',
        sets: [{ weight: 20, reps: 20, completed: true }, { weight: 20, reps: 20, completed: true }]
      }
    ],
    notes: 'Excelente sesión. Nueva marca personal en sentadilla goblet con mancuerna de 26kg.'
  }
];

export function getStoredRoutines(): Routine[] {
  if (typeof window === 'undefined') return INITIAL_ROUTINES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (!data) return INITIAL_ROUTINES;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_ROUTINES;
    return parsed.map((r: any) => ({
      ...r,
      exercises: Array.isArray(r.exercises)
        ? r.exercises.map((e: any) => ({
            ...e,
            sets: Array.isArray(e.sets) ? e.sets : [],
          }))
        : [],
    }));
  } catch {
    return INITIAL_ROUTINES;
  }
}

export function saveStoredRoutines(routines: Routine[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines to storage', e);
  }
}

// MEMBER-ISOLATED WEIGHT LOGS
export function getMemberWeightLogs(
  memberId?: string | null,
  defaultWeight?: number,
  joinedDate?: string
): WeightEntry[] {
  if (typeof window === 'undefined') return [];

  // No specific member: return stored or demo logs
  if (!memberId) {
    return getStoredWeightLogs();
  }

  const memberKey = `gymtrack_weight_logs_${memberId}`;
  try {
    const raw = localStorage.getItem(memberKey);
    if (raw !== null) {
      return JSON.parse(raw);
    }

    // Only demo member 'member-ao-1001' (Alejandro Ramos) has historical demo logs
    if (memberId === 'member-ao-1001') {
      const globalData = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
      return globalData ? JSON.parse(globalData) : INITIAL_WEIGHT_LOGS;
    }

    // For any newly enrolled member (e.g. Hugo AO-1021), provide baseline entry if weight exists, else []
    if (defaultWeight && defaultWeight > 0) {
      const initialEntry: WeightEntry = {
        id: `w-${memberId}-init`,
        memberId,
        date: joinedDate || new Date().toISOString().split('T')[0],
        weight: defaultWeight,
        notes: 'Registro inicial al inscribirse en Alfa & Omega Gym',
      };
      return [initialEntry];
    }

    return [];
  } catch {
    return memberId === 'member-ao-1001' ? INITIAL_WEIGHT_LOGS : [];
  }
}

export function saveMemberWeightLogs(logs: WeightEntry[], memberId?: string | null) {
  if (typeof window === 'undefined') return;
  if (!memberId) {
    saveStoredWeightLogs(logs);
    return;
  }
  try {
    const memberKey = `gymtrack_weight_logs_${memberId}`;
    localStorage.setItem(memberKey, JSON.stringify(logs));
    if (memberId === 'member-ao-1001') {
      localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
    }
  } catch (e) {
    console.error('Failed to save member weight logs', e);
  }
}

export function getStoredWeightLogs(): WeightEntry[] {
  if (typeof window === 'undefined') return INITIAL_WEIGHT_LOGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEIGHT_LOGS);
    return data ? JSON.parse(data) : INITIAL_WEIGHT_LOGS;
  } catch {
    return INITIAL_WEIGHT_LOGS;
  }
}

export function saveStoredWeightLogs(logs: WeightEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save weight logs', e);
  }
}

// MEMBER-ISOLATED WORKOUT LOGS
export function getMemberWorkoutLogs(memberId?: string | null): WorkoutSession[] {
  if (typeof window === 'undefined') return [];

  if (!memberId) {
    return getStoredWorkoutLogs();
  }

  const memberKey = `gymtrack_workout_logs_${memberId}`;
  try {
    const raw = localStorage.getItem(memberKey);
    if (raw !== null) {
      return JSON.parse(raw);
    }

    // Only legacy demo member 'member-ao-1001' (Alejandro Ramos) has historical demo logs
    if (memberId === 'member-ao-1001') {
      const globalData = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
      return globalData ? JSON.parse(globalData) : INITIAL_WORKOUT_LOGS;
    }

    // Any newly enrolled member (such as Hugo AO-1021 or new sign-ups) starts with ZERO previous sessions
    return [];
  } catch {
    return memberId === 'member-ao-1001' ? INITIAL_WORKOUT_LOGS : [];
  }
}

export function saveMemberWorkoutLogs(logs: WorkoutSession[], memberId?: string | null) {
  if (typeof window === 'undefined') return;
  if (!memberId) {
    saveStoredWorkoutLogs(logs);
    return;
  }
  try {
    const memberKey = `gymtrack_workout_logs_${memberId}`;
    localStorage.setItem(memberKey, JSON.stringify(logs));
    if (memberId === 'member-ao-1001') {
      localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
    }
  } catch (e) {
    console.error('Failed to save member workout logs', e);
  }
}

export function getStoredWorkoutLogs(): WorkoutSession[] {
  if (typeof window === 'undefined') return INITIAL_WORKOUT_LOGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WORKOUT_LOGS);
    return data ? JSON.parse(data) : INITIAL_WORKOUT_LOGS;
  } catch {
    return INITIAL_WORKOUT_LOGS;
  }
}

export function saveStoredWorkoutLogs(logs: WorkoutSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.WORKOUT_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save workout logs', e);
  }
}

export function getStoredProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveStoredProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

// ACTIVE WORKOUT DRAFT AUTO-SAVE (RESUME WHERE YOU LEFT OFF)
export interface ActiveWorkoutDraft {
  routineId: string;
  routine: Routine;
  elapsedSeconds: number;
  workoutExercises: any[];
  sessionNotes: string;
  lastUpdated: string;
  memberId?: string;
}

export const ACTIVE_WORKOUT_STORAGE_KEY = 'gymtrack_active_workout_draft_v1';

export function getActiveWorkoutDraft(memberId?: string | null): ActiveWorkoutDraft | null {
  if (typeof window === 'undefined') return null;
  const key = memberId ? `${ACTIVE_WORKOUT_STORAGE_KEY}_${memberId}` : ACTIVE_WORKOUT_STORAGE_KEY;
  try {
    const raw = localStorage.getItem(key) || localStorage.getItem(ACTIVE_WORKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveWorkoutDraft(draft: ActiveWorkoutDraft, memberId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = memberId ? `${ACTIVE_WORKOUT_STORAGE_KEY}_${memberId}` : ACTIVE_WORKOUT_STORAGE_KEY;
  try {
    const serialized = JSON.stringify(draft);
    localStorage.setItem(key, serialized);
    localStorage.setItem(ACTIVE_WORKOUT_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save active workout draft', e);
  }
}

export function clearActiveWorkoutDraft(memberId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = memberId ? `${ACTIVE_WORKOUT_STORAGE_KEY}_${memberId}` : ACTIVE_WORKOUT_STORAGE_KEY;
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(ACTIVE_WORKOUT_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear active workout draft', e);
  }
}

