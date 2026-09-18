import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Member, GymCoach, WeightEntry, WorkoutSession, Routine, CoachConsultation } from '../types';

let app: FirebaseApp;
let db: Firestore;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfigJson);
  } else {
    app = getApp();
  }
  const dbId = (firebaseConfigJson as any).firestoreDatabaseId;
  db = dbId ? getFirestore(app, dbId) : getFirestore(app);
} catch (error) {
  console.warn('Firebase initialization notice (falling back gracefully):', error);
}

export { db };

// Default initial staff coaches of Alfa & Omega Gym
export const INITIAL_GYM_COACHES: GymCoach[] = [
  {
    id: 'coach-carlos',
    coachCode: 'COACH-01',
    password: 'carlos123',
    name: 'Carlos "Titán" Mendoza',
    branch: 'León',
    title: 'Head Coach & Especialista en Fuerza',
    specialty: 'Fuerza Máxima, Powerlifting & Hipertrofia Pesada',
    experience: '12 años de trayectoria en tarima y gimnasio',
    certifications: ['NSCA-CPT', 'Biomecánica de Alta Carga', 'Juez Nacional de Powerlifting'],
    schedule: 'Lunes a Viernes · 06:00 a 14:00 hrs',
    phone: '+52 55 4123 8890',
    whatsappNumber: '525541238890',
    email: 'carlos.mendoza@alfaomegogym.com',
    bio: 'Especialista en técnica estricta de peso muerto, sentadillas pesadas y press de banca. Guiará tu sobrecarga progresiva evitando lesiones articulares.',
    avatarUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
    available: true
  },
  {
    id: 'coach-valeria',
    coachCode: 'COACH-02',
    password: 'valeria123',
    name: 'Valeria Salazar',
    branch: 'San Luis Potosí',
    title: 'Senior Coach & Especialista Femenina',
    specialty: 'Hipertrofia de Tren Inferior, Glúteo & Definición',
    experience: '8 años transformando atletas y socios',
    certifications: ['Master en Biomecánica de Glúteo & Cadera', 'Nutrición Deportiva Avanzada'],
    schedule: 'Lunes a Viernes · 14:00 a 21:00 hrs | Sábados · 08:00 a 13:00 hrs',
    phone: '+52 55 9876 5432',
    whatsappNumber: '525598765432',
    email: 'valeria.salazar@alfaomegogym.com',
    bio: 'Enfocada en el desarrollo atlético, volumen de glúteos, femoral y cuádriceps con técnicas avanzadas de pausa y tensión constante en poleas y barras.',
    avatarUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=400&q=80',
    available: true
  },
  {
    id: 'coach-marcos',
    coachCode: 'COACH-03',
    password: 'marcos123',
    name: 'Marcos Estrada',
    branch: 'Comanjilla',
    title: 'Coach de Acondicionamiento & Quema Calórica',
    specialty: 'Pérdida Acelerada de Grasa, HIIT Metabólico & Core',
    experience: '7 años en preparación funcional',
    certifications: ['Cross-Training Level 2', 'TRX Suspension Master Coach', 'Entrenamiento Funcional'],
    schedule: 'Lunes a Viernes · 07:00 a 13:00 y 17:00 a 21:00 hrs',
    phone: '+52 55 6543 2109',
    whatsappNumber: '525565432109',
    email: 'marcos.estrada@alfaomegogym.com',
    bio: 'Experto en elevar el gasto metabólico (EPOC) para quemar grasa manteniendo firmeza muscular mediante descansos medidos y estaciones intensivas.',
    avatarUrl: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?auto=format&fit=crop&w=400&q=80',
    available: true
  },
  {
    id: 'coach-andrea',
    coachCode: 'COACH-04',
    password: 'andrea123',
    name: 'Dra. Andrea Morales',
    branch: 'Todas las sucursales',
    title: 'Nutrióloga Deportiva & Readaptación Física',
    specialty: 'Nutrición para Composición Corporal & Prevención',
    experience: '10 años en salud integral y rendimiento',
    certifications: ['Lic. en Nutrición Humana y Deporte', 'Diplomado en Lesiones y Readaptación'],
    schedule: 'Martes a Sábados · 09:00 a 17:00 hrs',
    phone: '+52 55 7890 1234',
    whatsappNumber: '525578901234',
    email: 'andrea.morales@alfaomegogym.com',
    bio: 'Alinea tu alimentación con los requerimientos energéticos de tus entrenamientos en Alfa & Omega Gym. Consulta planes de déficit o superávit limpio.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    available: true
  }
];

// Initial seeded members in database (20 Demo Members for Alfa & Omega Gym across 4 Branches)
export const INITIAL_MEMBERS: Member[] = [
  // --- SUCURSAL 1: LEÓN (5 Socios) ---
  {
    id: 'member-ao-1001',
    membershipNumber: 'AO-1001',
    password: 'alfa123',
    name: 'Alejandro Ramos',
    email: 'alejandro.ramos@gmail.com',
    phone: '+52 477 334 5566',
    emergencyContact: 'Sofía Ramos (Hermana) - +52 477 112 3344',
    branch: 'León',
    age: 29,
    heightCm: 178,
    initialWeight: 84.5,
    currentWeight: 79.2,
    targetWeight: 74.0,
    gender: 'Hombre',
    goal: 'Pérdida de grasa & Definición muscular',
    assignedCoachId: 'coach-carlos',
    assignedCoachName: 'Carlos "Titán" Mendoza',
    medicalNotes: 'Sensibilidad leve en tendón rotuliano izquierdo con cargas máximas en prensa.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-10',
    nextPaymentDueDate: '2026-09-10', // VENCIDO (7 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-08-01',
    expiresDate: '2027-08-01',
    role: 'member'
  },
  {
    id: 'member-ao-1002',
    membershipNumber: 'AO-1002',
    password: 'omega123',
    name: 'Mariana Gómez',
    email: 'mariana.gomez@gmail.com',
    phone: '+52 477 889 0011',
    emergencyContact: 'Roberto Gómez (Papá) - +52 477 776 5544',
    branch: 'León',
    age: 26,
    heightCm: 165,
    initialWeight: 64.0,
    currentWeight: 59.8,
    targetWeight: 57.0,
    gender: 'Mujer',
    goal: 'Hipertrofia Glúteo & Definición',
    assignedCoachId: 'coach-valeria',
    assignedCoachName: 'Valeria Salazar',
    medicalNotes: 'Sin limitaciones físicas. Buena técnica en peso muerto rumano.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-01',
    nextPaymentDueDate: '2026-10-01', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-07-15',
    expiresDate: '2027-01-15',
    role: 'member'
  },
  {
    id: 'member-ao-1003',
    membershipNumber: 'AO-1003',
    password: 'alfa1003',
    name: 'Carlos Eduardo Ruiz',
    email: 'carlos.ruiz@gmail.com',
    phone: '+52 477 223 4455',
    emergencyContact: 'Elena Ruiz (Esposa) - +52 477 667 8899',
    branch: 'León',
    age: 34,
    heightCm: 182,
    initialWeight: 89.0,
    currentWeight: 86.5,
    targetWeight: 82.0,
    gender: 'Hombre',
    goal: 'Fuerza Máxima & Powerlifting',
    assignedCoachId: 'coach-carlos',
    assignedCoachName: 'Carlos "Titán" Mendoza',
    medicalNotes: 'Uso de cinturón lumbar obligatorio en sentadillas superiores a 120 kg.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-20',
    nextPaymentDueDate: '2026-09-20', // AL CORRIENTE (vence en 3 días)
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-06-01',
    expiresDate: '2027-06-01',
    role: 'member'
  },
  {
    id: 'member-ao-1004',
    membershipNumber: 'AO-1004',
    password: 'alfa1004',
    name: 'Daniela Patricia Soto',
    email: 'daniela.soto@gmail.com',
    phone: '+52 477 445 6677',
    emergencyContact: 'Patricia Soto (Madre) - +52 477 332 1100',
    branch: 'León',
    age: 24,
    heightCm: 160,
    initialWeight: 58.0,
    currentWeight: 54.2,
    targetWeight: 52.0,
    gender: 'Mujer',
    goal: 'Tonificación & Resistencia General',
    assignedCoachId: 'coach-valeria',
    assignedCoachName: 'Valeria Salazar',
    medicalNotes: 'Ligera escoliosis postural; priorizar ejercicios unilaterales.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-12',
    nextPaymentDueDate: '2026-09-12', // VENCIDO (5 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-08-10',
    expiresDate: '2026-11-10',
    role: 'member'
  },
  {
    id: 'member-ao-1005',
    membershipNumber: 'AO-1005',
    password: 'alfa1005',
    name: 'Miguel Ángel Morales',
    email: 'miguel.morales@gmail.com',
    phone: '+52 477 778 9900',
    emergencyContact: 'Carmen Morales (Esposa) - +52 477 998 7766',
    branch: 'León',
    age: 42,
    heightCm: 175,
    initialWeight: 96.0,
    currentWeight: 91.0,
    targetWeight: 82.0,
    gender: 'Hombre',
    goal: 'Acondicionamiento Cardiovascular & Salud',
    assignedCoachId: 'coach-carlos',
    assignedCoachName: 'Carlos "Titán" Mendoza',
    medicalNotes: 'Hipertensión controlada con medicación matutina.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-05',
    nextPaymentDueDate: '2026-10-05', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-09-01',
    expiresDate: '2026-10-01',
    role: 'member'
  },

  // --- SUCURSAL 2: SAN LUIS POTOSÍ (5 Socios) ---
  {
    id: 'member-ao-1006',
    membershipNumber: 'AO-1006',
    password: 'alfa1006',
    name: 'Sofía Hernández Cruz',
    email: 'sofia.hernandez@gmail.com',
    phone: '+52 444 556 7788',
    emergencyContact: 'Luis Hernández (Hermano) - +52 444 443 2211',
    branch: 'San Luis Potosí',
    age: 31,
    heightCm: 168,
    initialWeight: 69.5,
    currentWeight: 63.4,
    targetWeight: 58.0,
    gender: 'Mujer',
    goal: 'Pérdida de Grasa & Quema Calórica',
    assignedCoachId: 'coach-valeria',
    assignedCoachName: 'Valeria Salazar',
    medicalNotes: 'Sin restricciones médicas; excelente respuesta al HIIT en cinta curva.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-15',
    nextPaymentDueDate: '2026-09-15', // VENCIDO (2 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-05-15',
    expiresDate: '2026-11-15',
    role: 'member'
  },
  {
    id: 'member-ao-1007',
    membershipNumber: 'AO-1007',
    password: 'alfa1007',
    name: 'Javier Torres Méndez',
    email: 'javier.torres@gmail.com',
    phone: '+52 444 119 8822',
    emergencyContact: 'Gloria Méndez (Mamá) - +52 444 665 4433',
    branch: 'San Luis Potosí',
    age: 27,
    heightCm: 180,
    initialWeight: 72.0,
    currentWeight: 77.0,
    targetWeight: 80.0,
    gender: 'Hombre',
    goal: 'Hipertrofia Pectoral y Espalda',
    assignedCoachId: 'coach-valeria',
    assignedCoachName: 'Valeria Salazar',
    medicalNotes: 'Cirugía de menisco derecho hace 4 años; rehabilitado.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-25',
    nextPaymentDueDate: '2026-09-25', // AL CORRIENTE (vence en 8 días)
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-03-01',
    expiresDate: '2027-03-01',
    role: 'member'
  },
  {
    id: 'member-ao-1008',
    membershipNumber: 'AO-1008',
    password: 'alfa1008',
    name: 'Laura Elena Navarro',
    email: 'laura.navarro@gmail.com',
    phone: '+52 444 991 2233',
    emergencyContact: 'Andrés Navarro (Hermano) - +52 444 887 6655',
    branch: 'San Luis Potosí',
    age: 38,
    heightCm: 163,
    initialWeight: 73.0,
    currentWeight: 68.5,
    targetWeight: 62.0,
    gender: 'Mujer',
    goal: 'Recomposición Corporal & Salud Articular',
    assignedCoachId: 'coach-andrea',
    assignedCoachName: 'Dra. Andrea Morales',
    medicalNotes: 'Plan nutricional antiinflamatorio en curso supervisado por Dra. Andrea.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-01',
    nextPaymentDueDate: '2026-09-01', // VENCIDO (16 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-04-10',
    expiresDate: '2027-04-10',
    role: 'member'
  },
  {
    id: 'member-ao-1009',
    membershipNumber: 'AO-1009',
    password: 'alfa1009',
    name: 'Rodrigo Vargas Ríos',
    email: 'rodrigo.vargas@gmail.com',
    phone: '+52 444 667 1122',
    emergencyContact: 'Mauricio Vargas (Padre) - +52 444 554 3322',
    branch: 'San Luis Potosí',
    age: 22,
    heightCm: 174,
    initialWeight: 66.0,
    currentWeight: 71.3,
    targetWeight: 76.0,
    gender: 'Hombre',
    goal: 'Volumen Limpio & Ganancia de Masa',
    assignedCoachId: 'coach-valeria',
    assignedCoachName: 'Valeria Salazar',
    medicalNotes: 'Metabolismo acelerado; enfoque en superávit calórico controlado.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-10',
    nextPaymentDueDate: '2026-10-10', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-07-01',
    expiresDate: '2027-01-01',
    role: 'member'
  },
  {
    id: 'member-ao-1010',
    membershipNumber: 'AO-1010',
    password: 'alfa1010',
    name: 'Valeria Paulina Chávez',
    email: 'valeria.chavez@gmail.com',
    phone: '+52 444 776 8899',
    emergencyContact: 'Teresa Chávez (Madre) - +52 444 221 4433',
    branch: 'San Luis Potosí',
    age: 28,
    heightCm: 167,
    initialWeight: 61.5,
    currentWeight: 57.9,
    targetWeight: 56.0,
    gender: 'Mujer',
    goal: 'Fuerza Funcional & Glúteo',
    assignedCoachId: 'coach-valeria',
    assignedCoachName: 'Valeria Salazar',
    medicalNotes: 'Sin antecedentes negativos. Excelente movilidad en cadera y tobillo.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-01',
    nextPaymentDueDate: '2026-10-01', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-08-20',
    expiresDate: '2026-11-20',
    role: 'member'
  },

  // --- SUCURSAL 3: SILAO (5 Socios) ---
  {
    id: 'member-ao-1011',
    membershipNumber: 'AO-1011',
    password: 'alfa1011',
    name: 'Fernando José Castro',
    email: 'fernando.castro@gmail.com',
    phone: '+52 472 332 9988',
    emergencyContact: 'Verónica Castro (Esposa) - +52 472 998 1122',
    branch: 'Silao',
    age: 45,
    heightCm: 176,
    initialWeight: 95.0,
    currentWeight: 88.2,
    targetWeight: 80.0,
    gender: 'Hombre',
    goal: 'Bajar Porcentaje Graso & Salud Cardiaca',
    assignedCoachId: 'coach-andrea',
    assignedCoachName: 'Dra. Andrea Morales',
    medicalNotes: 'Chequeo médico cardiológico anual aprobado. Hidratación constante.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-14',
    nextPaymentDueDate: '2026-09-14', // VENCIDO (3 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-02-15',
    expiresDate: '2027-02-15',
    role: 'member'
  },
  {
    id: 'member-ao-1012',
    membershipNumber: 'AO-1012',
    password: 'alfa1012',
    name: 'Andrea Camila Beltrán',
    email: 'andrea.beltran@gmail.com',
    phone: '+52 472 882 3344',
    emergencyContact: 'Camila Beltrán (Hermana) - +52 472 334 8822',
    branch: 'Silao',
    age: 25,
    heightCm: 162,
    initialWeight: 55.0,
    currentWeight: 52.0,
    targetWeight: 50.0,
    gender: 'Mujer',
    goal: 'Flexibilidad & Tonificación de Pierna',
    assignedCoachId: 'coach-marcos',
    assignedCoachName: 'Marcos Estrada',
    medicalNotes: 'Práctica complementaria de yoga; enfoque en abductores y femoral.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-05',
    nextPaymentDueDate: '2026-10-05', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-09-05',
    expiresDate: '2026-10-05',
    role: 'member'
  },
  {
    id: 'member-ao-1013',
    membershipNumber: 'AO-1013',
    password: 'alfa1013',
    name: 'Gabriel Andrés Paredes',
    email: 'gabriel.paredes@gmail.com',
    phone: '+52 472 441 7788',
    emergencyContact: 'Sara Paredes (Hermana) - +52 472 778 4411',
    branch: 'Silao',
    age: 33,
    heightCm: 185,
    initialWeight: 78.0,
    currentWeight: 82.7,
    targetWeight: 85.0,
    gender: 'Hombre',
    goal: 'Hipertrofia de Brazos y Hombros',
    assignedCoachId: 'coach-carlos',
    assignedCoachName: 'Carlos "Titán" Mendoza',
    medicalNotes: 'Trabajo intenso en poleas y mancuernas. Sin dolor en manguito rotador.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-01',
    nextPaymentDueDate: '2026-10-01', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-01-10',
    expiresDate: '2027-01-10',
    role: 'member'
  },
  {
    id: 'member-ao-1014',
    membershipNumber: 'AO-1014',
    password: 'alfa1014',
    name: 'Claudia Ximena Reyes',
    email: 'claudia.reyes@gmail.com',
    phone: '+52 472 993 6611',
    emergencyContact: 'Jorge Reyes (Esposo) - +52 472 661 9933',
    branch: 'Silao',
    age: 36,
    heightCm: 166,
    initialWeight: 66.0,
    currentWeight: 61.1,
    targetWeight: 57.0,
    gender: 'Mujer',
    goal: 'Acondicionamiento HIIT & Core',
    assignedCoachId: 'coach-marcos',
    assignedCoachName: 'Marcos Estrada',
    medicalNotes: 'Posparto hace 18 meses; suelo pélvico y abdomen recuperados al 100%.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-05',
    nextPaymentDueDate: '2026-09-05', // VENCIDO (12 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-06-20',
    expiresDate: '2026-12-20',
    role: 'member'
  },
  {
    id: 'member-ao-1015',
    membershipNumber: 'AO-1015',
    password: 'alfa1015',
    name: 'Héctor Manuel Lozano',
    email: 'hector.lozano@gmail.com',
    phone: '+52 472 558 2211',
    emergencyContact: 'Marta Lozano (Esposa) - +52 472 221 5588',
    branch: 'Silao',
    age: 39,
    heightCm: 177,
    initialWeight: 87.0,
    currentWeight: 83.5,
    targetWeight: 78.0,
    gender: 'Hombre',
    goal: 'Fuerza General & Masa Magra',
    assignedCoachId: 'coach-carlos',
    assignedCoachName: 'Carlos "Titán" Mendoza',
    medicalNotes: 'Buena técnica de levantamiento olímpico y press militar con barra.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-20',
    nextPaymentDueDate: '2026-09-20', // AL CORRIENTE (vence en 3 días)
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-04-01',
    expiresDate: '2027-04-01',
    role: 'member'
  },

  // --- SUCURSAL 4: COMANJILLA (5 Socios) ---
  {
    id: 'member-ao-1016',
    membershipNumber: 'AO-1016',
    password: 'alfa1016',
    name: 'Natalia Beatriz Ortiz',
    email: 'natalia.ortiz@gmail.com',
    phone: '+52 477 114 7799',
    emergencyContact: 'Raúl Ortiz (Padre) - +52 477 779 1144',
    branch: 'Comanjilla',
    age: 23,
    heightCm: 159,
    initialWeight: 60.5,
    currentWeight: 56.4,
    targetWeight: 53.0,
    gender: 'Mujer',
    goal: 'Definición & Salud Metabólica',
    assignedCoachId: 'coach-andrea',
    assignedCoachName: 'Dra. Andrea Morales',
    medicalNotes: 'Hipotiroidismo controlado médicamente; excelente apego.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-08',
    nextPaymentDueDate: '2026-09-08', // VENCIDO (9 días) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-08-01',
    expiresDate: '2026-11-01',
    role: 'member'
  },
  {
    id: 'member-ao-1017',
    membershipNumber: 'AO-1017',
    password: 'alfa1017',
    name: 'Sebastián Domínguez',
    email: 'sebastian.dominguez@gmail.com',
    phone: '+52 477 337 4488',
    emergencyContact: 'Mariana Domínguez (Hermana) - +52 477 448 3377',
    branch: 'Comanjilla',
    age: 30,
    heightCm: 183,
    initialWeight: 102.0,
    currentWeight: 94.0,
    targetWeight: 86.0,
    gender: 'Hombre',
    goal: 'Déficit Calórico & Fuerza Básica',
    assignedCoachId: 'coach-marcos',
    assignedCoachName: 'Marcos Estrada',
    medicalNotes: 'Cuidado con sobrecarga en tendón de Aquiles; estiramiento asistido.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-01',
    nextPaymentDueDate: '2026-10-01', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-09-01',
    expiresDate: '2026-10-01',
    role: 'member'
  },
  {
    id: 'member-ao-1018',
    membershipNumber: 'AO-1018',
    password: 'alfa1018',
    name: 'Regina Isabel Fuentes',
    email: 'regina.fuentes@gmail.com',
    phone: '+52 477 662 9944',
    emergencyContact: 'Ignacio Fuentes (Papá) - +52 477 994 6622',
    branch: 'Comanjilla',
    age: 27,
    heightCm: 170,
    initialWeight: 64.0,
    currentWeight: 60.2,
    targetWeight: 58.0,
    gender: 'Mujer',
    goal: 'Hipertrofia de Pierna y Espalda',
    assignedCoachId: 'coach-marcos',
    assignedCoachName: 'Marcos Estrada',
    medicalNotes: 'Excelente progreso en hip thrust con 110 kg. Sin quejas de dolor.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-16',
    nextPaymentDueDate: '2026-09-16', // VENCIDO (1 día) -> Acceso Denegado
    paymentStatus: 'overdue',
    monthlyFee: 450,
    joinedDate: '2026-05-10',
    expiresDate: '2026-11-10',
    role: 'member'
  },
  {
    id: 'member-ao-1019',
    membershipNumber: 'AO-1019',
    password: 'alfa1019',
    name: 'Diego Armando Silva',
    email: 'diego.silva@gmail.com',
    phone: '+52 477 883 1177',
    emergencyContact: 'Karla Silva (Esposa) - +52 477 117 8833',
    branch: 'Comanjilla',
    age: 35,
    heightCm: 179,
    initialWeight: 82.0,
    currentWeight: 78.6,
    targetWeight: 75.0,
    gender: 'Hombre',
    goal: 'Resistencia Muscular & Readaptación',
    assignedCoachId: 'coach-andrea',
    assignedCoachName: 'Dra. Andrea Morales',
    medicalNotes: 'Molestia ocasional en zona lumbar baja por trabajo de oficina; descanso activo.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-09-01',
    nextPaymentDueDate: '2026-10-01', // AL CORRIENTE
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-03-15',
    expiresDate: '2027-03-15',
    role: 'member'
  },
  {
    id: 'member-ao-1020',
    membershipNumber: 'AO-1020',
    password: 'alfa1020',
    name: 'Patricia Guadalupe Lara',
    email: 'patricia.lara@gmail.com',
    phone: '+52 477 229 6633',
    emergencyContact: 'Arturo Lara (Hijo) - +52 477 663 2299',
    branch: 'Comanjilla',
    age: 48,
    heightCm: 161,
    initialWeight: 71.0,
    currentWeight: 66.8,
    targetWeight: 62.0,
    gender: 'Mujer',
    goal: 'Movilidad Articular & Densidad Ósea',
    assignedCoachId: 'coach-andrea',
    assignedCoachName: 'Dra. Andrea Morales',
    medicalNotes: 'Prescripción de entrenamiento de fuerza preventiva contra osteopenia.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: '2026-08-28',
    nextPaymentDueDate: '2026-09-28', // AL CORRIENTE (vence en 11 días)
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: '2026-01-20',
    expiresDate: '2027-01-20',
    role: 'member'
  },
  {
    id: 'member-ao-1021',
    membershipNumber: 'AO-1021',
    password: 'alfa1021',
    name: 'Hugo Lozano',
    email: 'hhlozano70@gmail.com',
    phone: '+52 477 555 1021',
    emergencyContact: 'Familia Lozano - +52 477 999 1021',
    branch: 'León',
    age: 32,
    heightCm: 176,
    initialWeight: 82.0,
    currentWeight: 82.0,
    targetWeight: 75.0,
    gender: 'Hombre',
    goal: 'Pérdida de Grasa & Acondicionamiento Físico',
    assignedCoachId: 'coach-carlos',
    assignedCoachName: 'Carlos "Titán" Mendoza',
    medicalNotes: 'Socio de nuevo ingreso. Sin lesiones previas; listo para iniciar plan de adaptación.',
    membershipType: 'Mensual',
    status: 'active',
    lastPaymentDate: new Date().toISOString().split('T')[0],
    nextPaymentDueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    paymentStatus: 'paid',
    monthlyFee: 450,
    joinedDate: new Date().toISOString().split('T')[0],
    expiresDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    role: 'member'
  }
];

// Initial mock consultations
export const INITIAL_CONSULTATIONS: CoachConsultation[] = [
  {
    id: 'cons-1',
    memberId: 'member-ao-1001',
    memberName: 'Alejandro Ramos',
    coachId: 'coach-carlos',
    coachName: 'Carlos "Titán" Mendoza',
    subject: 'Ajuste de descanso en Press de Banca',
    message: 'Coach Carlos, en la última serie de banca plana sentí fatiga muscular al llegar a la rep 8 con 24kg por lado. ¿Debería aumentar a 90 segundos el descanso?',
    reply: '¡Qué tal Alejandro! Excelente pregunta. Sí, para mantener la intensidad sin perder reclutamiento motor, extiende a 75-90 segundos en las 2 últimas series efectivas.',
    status: 'answered',
    createdAt: '2026-09-15T10:30:00.000Z',
    answeredAt: '2026-09-15T14:15:00.000Z'
  },
  {
    id: 'cons-2',
    memberId: 'member-ao-1002',
    memberName: 'Mariana Gómez',
    coachId: 'coach-valeria',
    coachName: 'Valeria Salazar',
    subject: 'Sensación en glúteo mayor con Hip Thrust',
    message: 'Coach Vale, ¿a qué altura del omóplato debo apoyar la espalda en el banco de hip thrust para no hiperextender la zona lumbar?',
    reply: 'Hola Mariana. Justo en el borde inferior de las escápulas. Mantén la barbilla pegada al pecho (mirada al frente) en todo el recorrido para neutralizar la pelvis.',
    status: 'answered',
    createdAt: '2026-09-16T11:20:00.000Z',
    answeredAt: '2026-09-16T12:05:00.000Z'
  },
  {
    id: 'cons-3',
    memberId: 'member-ao-1003',
    memberName: 'Carlos Eduardo Ruiz',
    coachId: 'coach-carlos',
    coachName: 'Carlos "Titán" Mendoza',
    subject: 'Calentamiento antes de Sentadilla pesada',
    message: 'Carlos, hoy me toca serie de aproximación a 140kg. ¿Recomiendas movilidad de tobillo previa o arrancamos con barra vacía?',
    status: 'pending',
    createdAt: '2026-09-17T07:15:00.000Z'
  },
  {
    id: 'cons-4',
    memberId: 'member-ao-1008',
    memberName: 'Laura Elena Navarro',
    coachId: 'coach-andrea',
    coachName: 'Dra. Andrea Morales',
    subject: 'Timing de proteína después de entrenar',
    message: 'Dra. Andrea, si termino de entrenar a las 7:30 pm, ¿es mejor cenar de inmediato o tomar primero el batido?',
    reply: 'Hola Laura. Si vas a cenar antes de los 45-60 min posteriores con suficiente proteína (25-30g de pollo, pescado o claras), la comida sólida es perfecta.',
    status: 'answered',
    createdAt: '2026-09-14T19:40:00.000Z',
    answeredAt: '2026-09-15T09:10:00.000Z'
  }
];

// STORAGE FALLBACK KEYS
const LS_MEMBERS_KEY = 'ao_gym_members_db';
const LS_COACHES_KEY = 'ao_gym_coaches_db';
const LS_CONSULTATIONS_KEY = 'ao_gym_consultations_db';
const LS_ADMIN_PASSWORD_KEY = 'ao_gym_admin_pwd';

// --- FIRESTORE / HYBRID REPOSITORIES ---

// Helper to normalize payment and branch data (Standardized to single Monthly plan of 450 MXN)
export function normalizeMemberPaymentAndBranch(m: Member): Member {
  const demoMatch = INITIAL_MEMBERS.find((d) => d.membershipNumber === m.membershipNumber || d.id === m.id);
  const branch = m.branch || (demoMatch ? demoMatch.branch : 'León');
  const lastPaymentDate = m.lastPaymentDate || (demoMatch ? demoMatch.lastPaymentDate : '2026-08-15');
  const nextPaymentDueDate = m.nextPaymentDueDate || (demoMatch ? demoMatch.nextPaymentDueDate : '2026-09-15');
  const monthlyFee = 450; // Cuota fija de 450 MXN para todos los socios
  const membershipType = 'Mensual'; // Plan único mensual para todos los socios

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const isOverdue = nextPaymentDueDate < todayStr || m.paymentStatus === 'overdue';
  const paymentStatus = isOverdue ? 'overdue' : (m.paymentStatus || 'paid');

  return {
    ...m,
    branch,
    lastPaymentDate,
    nextPaymentDueDate,
    paymentStatus,
    membershipType,
    monthlyFee
  };
}

export async function seed20DemoMembers(overwrite = false): Promise<Member[]> {
  const currentList = await fetchMembersFromDb();
  let updatedList: Member[] = overwrite ? [...INITIAL_MEMBERS] : [...currentList];

  if (!overwrite) {
    for (const demo of INITIAL_MEMBERS) {
      if (!updatedList.some((m) => m.membershipNumber === demo.membershipNumber || m.id === demo.id)) {
        updatedList.push(demo);
      }
    }
  }

  updatedList = updatedList.map(normalizeMemberPaymentAndBranch);

  // Persist to local cache
  try {
    localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(updatedList));
  } catch (e) {
    console.error(e);
  }

  // Persist to Firestore if available
  if (db) {
    try {
      for (const m of updatedList) {
        await setDoc(doc(db, 'members', m.id), m, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore bulk seed notice:', err);
    }
  }

  return updatedList;
}

export async function fetchMembersFromDb(): Promise<Member[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'members'));
      if (!snap.empty) {
        let list: Member[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Member));
        
        // Ensure all 20 demo members are available in database
        if (list.length < INITIAL_MEMBERS.length) {
          for (const demo of INITIAL_MEMBERS) {
            if (!list.some((m) => m.membershipNumber === demo.membershipNumber || m.id === demo.id)) {
              list.push(demo);
              setDoc(doc(db, 'members', demo.id), demo).catch(console.error);
            }
          }
        }

        list = list.map(normalizeMemberPaymentAndBranch);
        localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(list));
        return list;
      } else {
        // Seed initial 20 members to Firestore
        for (const m of INITIAL_MEMBERS) {
          await setDoc(doc(db, 'members', m.id), m);
        }
        const normalized = INITIAL_MEMBERS.map(normalizeMemberPaymentAndBranch);
        localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(normalized));
        return normalized;
      }
    } catch (err) {
      console.warn('Firestore fetch members notice, using local cache:', err);
    }
  }

  // Fallback to localStorage
  try {
    const cached = localStorage.getItem(LS_MEMBERS_KEY);
    if (cached) {
      let parsed: Member[] = JSON.parse(cached);
      for (const demo of INITIAL_MEMBERS) {
        if (!parsed.some((m) => m.membershipNumber === demo.membershipNumber || m.id === demo.id)) {
          parsed.push(demo);
        }
      }
      parsed = parsed.map(normalizeMemberPaymentAndBranch);
      localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(parsed));
      return parsed;
    }
    const normalized = INITIAL_MEMBERS.map(normalizeMemberPaymentAndBranch);
    localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(normalized));
    return normalized;
  } catch {
    return INITIAL_MEMBERS.map(normalizeMemberPaymentAndBranch);
  }
}

export async function saveMemberToDb(member: Member): Promise<void> {
  const normalizedMember = normalizeMemberPaymentAndBranch(member);
  // Update local cache
  try {
    const list = await fetchMembersFromDb();
    const idx = list.findIndex((m) => m.id === normalizedMember.id || m.membershipNumber === normalizedMember.membershipNumber);
    if (idx >= 0) {
      list[idx] = normalizedMember;
    } else {
      list.push(normalizedMember);
    }
    localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Local cache error:', e);
  }

  // Persist to Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'members', normalizedMember.id), normalizedMember, { merge: true });
    } catch (err) {
      console.warn('Firestore write member notice:', err);
    }
  }
}

export async function deleteMemberFromDb(memberId: string): Promise<void> {
  try {
    const list = await fetchMembersFromDb();
    const filtered = list.filter((m) => m.id !== memberId);
    localStorage.setItem(LS_MEMBERS_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error(e);
  }

  if (db) {
    try {
      await deleteDoc(doc(db, 'members', memberId));
    } catch (err) {
      console.warn('Firestore delete member notice:', err);
    }
  }
}

export async function fetchCoachesFromDb(): Promise<GymCoach[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'coaches'));
      if (!snap.empty) {
        const list: GymCoach[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as GymCoach));
        localStorage.setItem(LS_COACHES_KEY, JSON.stringify(list));
        return list;
      } else {
        // Seed coaches to Firestore
        for (const c of INITIAL_GYM_COACHES) {
          await setDoc(doc(db, 'coaches', c.id), c);
        }
        return INITIAL_GYM_COACHES;
      }
    } catch (err) {
      console.warn('Firestore coaches fetch notice, using fallback:', err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_COACHES_KEY);
    return cached ? JSON.parse(cached) : INITIAL_GYM_COACHES;
  } catch {
    return INITIAL_GYM_COACHES;
  }
}

export async function saveCoachToDb(coach: GymCoach): Promise<void> {
  try {
    const list = await fetchCoachesFromDb();
    const idx = list.findIndex((c) => c.id === coach.id);
    if (idx >= 0) {
      list[idx] = coach;
    } else {
      list.push(coach);
    }
    localStorage.setItem(LS_COACHES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }

  if (db) {
    try {
      await setDoc(doc(db, 'coaches', coach.id), coach, { merge: true });
    } catch (err) {
      console.warn('Firestore save coach notice:', err);
    }
  }
}

export async function fetchConsultationsFromDb(): Promise<CoachConsultation[]> {
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'consultations'));
      if (!snap.empty) {
        const list: CoachConsultation[] = [];
        snap.forEach((d) => list.push({ ...d.data(), id: d.id } as CoachConsultation));
        return list;
      }
    } catch (err) {
      console.warn('Consultations firestore notice:', err);
    }
  }

  try {
    const cached = localStorage.getItem(LS_CONSULTATIONS_KEY);
    return cached ? JSON.parse(cached) : INITIAL_CONSULTATIONS;
  } catch {
    return INITIAL_CONSULTATIONS;
  }
}

export async function saveConsultationToDb(cons: CoachConsultation): Promise<void> {
  try {
    const list = await fetchConsultationsFromDb();
    const idx = list.findIndex((c) => c.id === cons.id);
    if (idx >= 0) {
      list[idx] = cons;
    } else {
      list.unshift(cons);
    }
    localStorage.setItem(LS_CONSULTATIONS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error(e);
  }

  if (db) {
    try {
      await setDoc(doc(db, 'consultations', cons.id), cons, { merge: true });
    } catch (err) {
      console.warn('Firestore consultation save notice:', err);
    }
  }
}

export function getAdminPassword(): string {
  try {
    return localStorage.getItem(LS_ADMIN_PASSWORD_KEY) || 'admin2026';
  } catch {
    return 'admin2026';
  }
}

export function setAdminPassword(newPwd: string): void {
  try {
    localStorage.setItem(LS_ADMIN_PASSWORD_KEY, newPwd);
  } catch (e) {
    console.error(e);
  }
}
