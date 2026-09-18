export interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'Pecho' | 'Espalda' | 'Piernas' | 'Hombros' | 'Brazos' | 'Core' | 'Cardio' | 'Full Body';
  equipment: string;
  description?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number; // in kg
  reps: number;
  completed: boolean;
  rpe?: number; // Rate of Perceived Exertion (1-10)
}

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  suggestedRestSeconds: number;
  notes?: string;
  sets: WorkoutSet[];
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  estimatedCalories: number;
  durationMinutes: number;
  goal: 'Quema de Grasa' | 'Hipertrofia' | 'Fuerza' | 'Resistencia';
  exercises: RoutineExercise[];
  isCustom?: boolean;
}

export interface WorkoutSession {
  id: string;
  memberId?: string;
  routineId?: string;
  routineName: string;
  date: string; // ISO string
  durationMinutes: number;
  caloriesBurned: number;
  totalVolumeKg: number; // Sum of (weight * reps)
  exercises: {
    name: string;
    muscleGroup: string;
    sets: { weight: number; reps: number; completed: boolean }[];
  }[];
  notes?: string;
}

export interface WeightEntry {
  id: string;
  memberId?: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  bodyFatPercentage?: number;
  waistCm?: number;
  notes?: string;
}

export type GymBranch = 'León' | 'San Luis Potosí' | 'Silao' | 'Comanjilla';
export type PaymentStatus = 'paid' | 'overdue' | 'pending';

export interface UserProfile {
  name: string;
  initialWeight: number; // kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  heightCm: number;
  gender: 'Hombre' | 'Mujer' | 'Otro';
  goal: string;
  activityLevel: 'Sedentario' | 'Moderado' | 'Activo' | 'Muy Activo';
  dailyCalorieTarget: number;
}

export interface Member {
  id: string;
  membershipNumber: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  branch: GymBranch;
  age: number;
  heightCm: number;
  initialWeight: number;
  currentWeight: number;
  targetWeight: number;
  gender: 'Hombre' | 'Mujer' | 'Otro';
  goal: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  medicalNotes?: string;
  membershipType: 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual' | 'VIP';
  status: 'active' | 'inactive' | 'expired';
  lastPaymentDate: string; // YYYY-MM-DD
  nextPaymentDueDate: string; // YYYY-MM-DD
  paymentStatus: PaymentStatus;
  monthlyFee: number; // in MXN
  joinedDate: string;
  expiresDate: string;
  role: 'member' | 'admin';
}

export interface GymCoach {
  id: string;
  coachCode: string;
  password?: string;
  name: string;
  branch?: GymBranch | 'Todas las sucursales';
  title: string;
  specialty: string;
  experience: string;
  certifications: string[];
  schedule: string;
  phone: string;
  whatsappNumber?: string;
  email: string;
  bio: string;
  avatarUrl: string;
  available: boolean;
}

export interface CoachConsultation {
  id: string;
  memberId: string;
  memberName: string;
  coachId: string;
  coachName: string;
  subject: string;
  message: string;
  reply?: string;
  status: 'pending' | 'answered';
  createdAt: string;
  answeredAt?: string;
}


export interface RecommendedRoutine {
  title: string;
  targetCalories: number;
  estimatedDurationMinutes: number;
  goal: string;
  warmup: string;
  exercises: {
    name: string;
    category: string;
    sets: number;
    reps: string;
    restSeconds: number;
    techniqueTip: string;
    estimatedCaloriesBurned: number;
  }[];
  nutritionAdvice: string;
  cooldown: string;
}
