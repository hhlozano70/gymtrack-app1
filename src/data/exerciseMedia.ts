export interface ApparatusDetails {
  name: string;
  aliases: string[];
  imageUrl: string;
  visualIdentification: string;
  howToAdjust: string[];
  difficultyLevel: 'Fácil para principiantes' | 'Intermedio' | 'Requiere técnica';
  category: 'Máquinas Guiadas' | 'Poleas & Cables' | 'Peso Libre & Bancos' | 'Cardio & Funcional' | 'Calistenia';
}

export interface ExerciseMedia {
  id: string;
  exerciseName: string;
  aliases: string[];
  muscleTarget: string;
  secondaryMuscles: string[];
  gifUrl: string;
  executionTips: string[];
  apparatus: ApparatusDetails;
}

export const EXERCISE_MEDIA_DATABASE: ExerciseMedia[] = [
  {
    id: 'sentadillas-goblet',
    exerciseName: 'Sentadillas Goblet con Mancuerna',
    aliases: ['sentadilla goblet', 'goblet squat', 'sentadillas con mancuerna', 'sentadillas'],
    muscleTarget: 'Cuádriceps, Glúteos y Core',
    secondaryMuscles: ['Aductores', 'Zona Lumbar'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/dumbbell-goblet-squat.gif',
    executionTips: [
      'Sostén una mancuerna verticalmente pegada al pecho con ambas manos por la cabeza superior.',
      'Separa los pies al ancho de los hombros con las puntas ligeramente hacia afuera (15-30°).',
      'Desciende empujando las caderas hacia atrás y abriendo las rodillas en la dirección de los pies.',
      'Baja hasta que los codos toquen o pasen cerca de la cara interna de los muslos.',
      'Empuja con toda la planta del pie manteniendo el pecho erguido.'
    ],
    apparatus: {
      name: 'Zona de Mancuernas & Peso Libre',
      aliases: ['Dumbbell Rack', 'Mancuernero', 'Pesa Hexagonal'],
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Estantería metálica escalonada con pares de mancuernas ordenadas de menor a mayor peso (desde 2 kg hasta 40+ kg).',
      howToAdjust: [
        'Elige un peso que te permita completar las repeticiones con buena postura (empieza con 8-12 kg si eres principiante).',
        'Levanta la mancuerna flexionando las rodillas, no curvando la espalda.',
        'Regresa la mancuerna a su ranura correspondiente al terminar la serie.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Peso Libre & Bancos'
    }
  },
  {
    id: 'press-banca-mancuernas',
    exerciseName: 'Press de Banca Plano con Mancuernas',
    aliases: ['press banca plano', 'press de banca', 'bench press', 'press mancuernas pecho', 'press plano'],
    muscleTarget: 'Pectoral Mayor',
    secondaryMuscles: ['Tríceps', 'Deltoides Anterior'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/pectorals/barbell-bench-press.gif',
    executionTips: [
      'Acuéstate sobre el banco plano con la cabeza, espalda alta y glúteos apoyados firmemente.',
      'Mantén los pies planos en el suelo para mayor estabilidad (leg drive).',
      'Baja las mancuernas o barra de forma controlada hasta la altura media del pecho formando un ángulo de ~70° en los codos.',
      'Empuja hacia arriba sin bloquear bruscamente los codos en la parte superior.'
    ],
    apparatus: {
      name: 'Banco Plano de Pesas (Flat Bench)',
      aliases: ['Banco de Press', 'Flat Utility Bench', 'Banco Olímpico'],
      imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Banco horizontal acolchado y tapizado en cuero sintético, de unos 45 cm de altura sobre el suelo. Puede tener o no soporte para barra olímpica.',
      howToAdjust: [
        'Si es banco fijo no requiere ajustes; si es regulable, asegúrate de colocar el pasador en posición horizontal plana (0°).',
        'Verifica que el banco esté estable y nivelado antes de acostarte.',
        'Apoya los pies firmemente en el suelo sin elevar los talones.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Peso Libre & Bancos'
    }
  },
  {
    id: 'remo-polea-baja',
    exerciseName: 'Remo con Barra o Polea Baja',
    aliases: ['remo polea baja', 'remo sentado', 'cable low seated row', 'remo con barra', 'cable row'],
    muscleTarget: 'Dorsal Ancho, Espalda Media y Romboides',
    secondaryMuscles: ['Bíceps', 'Trapecio Medio', 'Deltoides Posterior'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/upper-back/cable-low-seated-row.gif',
    executionTips: [
      'Siéntate con los pies en los reposapiés y las rodillas ligeramente flexionadas (nunca bloqueadas).',
      'Mantén el torso erguido con ligera inclinación natural, sacando pecho.',
      'Inicia la tracción retrayendo las escápulas y llevando los codos hacia atrás pegados a los costados.',
      'Toca suavemente el abdomen bajo con el agarre y aguanta 1 segundo la contracción.',
      'Regresa despacio sintiendo el estiramiento de los dorsales sin encorvar la zona lumbar.'
    ],
    apparatus: {
      name: 'Máquina de Remo en Polea Baja (Low Seated Row)',
      aliases: ['Torre de Remo Sentado', 'Seated Cable Row', 'Polea Baja con Asiento'],
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Máquina con asiento bajo, plataforma o barras para apoyar los pies en ángulo, y un cable bajo conectado a una torre de placas con selector de peso.',
      howToAdjust: [
        'Inserta el pasador metálico (pin) en la placa de peso adecuada en la torre.',
        'Coloca el mosquetón en el agarre deseado (usualmente maneral doble en V o barra recta).',
        'Apoya los pies en los soportes metálicos y empuja suavemente con las piernas para colocarte en posición erguida.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Poleas & Cables'
    }
  },
  {
    id: 'zancadas-dinamicas',
    exerciseName: 'Zancadas Dinámicas Caminando',
    aliases: ['zancadas', 'lunges', 'estocadas', 'zancadas con mancuernas', 'walking lunges'],
    muscleTarget: 'Cuádriceps y Glúteo Mayor',
    secondaryMuscles: ['Isquiotibiales', 'Pantorrillas', 'Core Estabilizador'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/dumbbell-step-up-lunge.gif',
    executionTips: [
      'Da un paso largo hacia adelante flexionando ambas rodillas simultáneamente.',
      'Baja hasta que la rodilla trasera casi roce el suelo (ángulo de 90° en ambas piernas).',
      'Mantén el torso erguido y evita que la rodilla delantera sobrepase excesivamente la punta del pie.',
      'Impúlsate con el talón delantero para avanzar con la pierna contraria de manera fluida.'
    ],
    apparatus: {
      name: 'Mancuernas & Pasillo de Movilidad',
      aliases: ['Pares de Mancuernas', 'Dumbbells', 'Pista de Entrenamiento'],
      imageUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Par de mancuernas de peso moderado y un espacio despejado o pasillo de césped artificial / caucho de 10 a 15 metros.',
      howToAdjust: [
        'Sujeta una mancuerna en cada mano a los costados del cuerpo con los brazos extendidos.',
        'Elige un peso que no te desestabilice el equilibrio ni te haga inclinar el tronco.',
        'Si eres principiante, puedes realizar las primeras series solo con el peso de tu cuerpo.'
      ],
      difficultyLevel: 'Intermedio',
      category: 'Peso Libre & Bancos'
    }
  },
  {
    id: 'kettlebell-swings',
    exerciseName: 'Kettlebell Swings & Plancha Dinámica',
    aliases: ['kettlebell swings', 'swing con pesa rusa', 'balanceo de kettlebell', 'swings'],
    muscleTarget: 'Cadena Posterior: Glúteos, Isquiotibiales y Espalda Baja',
    secondaryMuscles: ['Core / Abdomen', 'Hombros', 'Antebrazos'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/potty-squat.gif',
    executionTips: [
      'No es una sentadilla; es una bisagra de cadera explosiva (hip hinge).',
      'Pies al ancho de hombros, flexiona caderas hacia atrás manteniendo la columna neutra.',
      'Lanza la kettlebell hacia adelante contrayendo con fuerza los glúteos y el abdomen al extender la cadera.',
      'Los brazos actúan únicamente como cuerdas conductoras, la fuerza sale 100% de la cadera.'
    ],
    apparatus: {
      name: 'Pesa Rusa (Kettlebell) & Tapete',
      aliases: ['Kettlebells de Competición', 'Pesa Esférica con Asa'],
      imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Pesa esférica de hierro fundido con una asa superior semicircular, usualmente con código de colores por peso (8kg, 12kg, 16kg, 20kg, 24kg).',
      howToAdjust: [
        'Comienza con 12-16 kg para hombres o 8-12 kg para mujeres para aprender la bisagra de cadera.',
        'Asegúrate de tener al menos 2 metros de espacio libre al frente y atrás.',
        'Usa tiza de magnesio o seca el sudor de las manos para evitar que se resbale.'
      ],
      difficultyLevel: 'Intermedio',
      category: 'Cardio & Funcional'
    }
  },
  {
    id: 'press-militar-barra',
    exerciseName: 'Press Militar de Pie con Barra',
    aliases: ['press militar', 'overhead press', 'press de hombros', 'press de pie', 'press frontal'],
    muscleTarget: 'Deltoides (Hombros)',
    secondaryMuscles: ['Tríceps', 'Trapecio Superior', 'Core Estabilizador'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/barbell-standing-close-grip-military-press.gif',
    executionTips: [
      'Sujeta la barra a la anchura de los hombros con los codos ligeramente adelantados.',
      'Apoya la barra sobre la parte superior de las clavículas con el pecho inflado y core contraído.',
      'Empuja la barra verticalmente en línea recta, inclinando sutilmente la cabeza hacia atrás para dejar pasar la barra.',
      'Al pasar la frente, mete la cabeza ligeramente hacia adelante bloqueando los hombros sobre la coronilla.'
    ],
    apparatus: {
      name: 'Jaula de Potencia / Rack con Barra Olímpica',
      aliases: ['Power Rack', 'Squat Rack', 'Soporte de Barra Olímpica'],
      imageUrl: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Estructura metálica vertical con 4 postes y orificios numerados con soportes en J (J-hooks) para sostener una barra larga de acero de 20 kg (barra olímpica).',
      howToAdjust: [
        'Coloca los soportes (J-hooks) a la altura de tu esternón / clavícula para desenclavar la barra cómodamente.',
        'Coloca los discos del peso deseado y SIEMPRE coloca los collares o seguros de resorte a cada lado.',
        'Si prefieres versión asistida guiada, puedes usar la Máquina Smith.'
      ],
      difficultyLevel: 'Requiere técnica',
      category: 'Peso Libre & Bancos'
    }
  },
  {
    id: 'dominadas-jalon-pecho',
    exerciseName: 'Dominadas o Jalón al Pecho',
    aliases: ['jalón al pecho', 'lat pulldown', 'jalón en polea alta', 'dominadas', 'polea dorsal'],
    muscleTarget: 'Dorsal Ancho (Latissimus Dorsi)',
    secondaryMuscles: ['Bíceps', 'Redondo Mayor', 'Braquial', 'Antebrazos'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/lats/cable-lat-pulldown-full-range-of-motion.gif',
    executionTips: [
      'Sujeta la barra ancha con agarre prono (palmas hacia adelante) un poco más abierto que el ancho de hombros.',
      'Siéntate y ajusta los rodillos acolchados para que presionen tus muslos y no te levantes al tirar.',
      'Inclina levemente el torso hacia atrás (10-15°), saca pecho y tira con los codos hacia las costillas.',
      'Lleva la barra hasta la parte superior del pecho (a la altura de la clavícula), nunca tras la nuca.',
      'Sube con lentitud sintiendo cómo se estira la espalda dorsal.'
    ],
    apparatus: {
      name: 'Máquina de Jalón al Pecho (Lat Pulldown Machine)',
      aliases: ['Torre de Jalón Dorsal', 'Lat Machine', 'Polea Alta Sentada'],
      imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Torre vertical alta con un asiento, dos rodillos acolchados circulares para las piernas, y una barra ancha curvada colgada de un cable superior conectado a placas.',
      howToAdjust: [
        'Tira del perno de los rodillos de las piernas y regúlalos para que queden apretados sobre tus muslos.',
        'Inserta el pasador en las placas de peso deseadas (empieza con el 40-50% de tu peso corporal).',
        'Alcanza la barra mientras estás de pie y luego siéntate bloqueando las rodillas bajo los rodillos.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Poleas & Cables'
    }
  },
  {
    id: 'press-inclinado-mancuernas',
    exerciseName: 'Press Inclinado con Mancuernas',
    aliases: ['press inclinado', 'incline dumbbell press', 'press inclinado mancuernas', 'pecho superior'],
    muscleTarget: 'Haz Clavicular del Pectoral (Pecho Superior)',
    secondaryMuscles: ['Deltoides Anterior', 'Tríceps'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/pectorals/barbell-reverse-grip-incline-bench-press.gif',
    executionTips: [
      'Ajusta el respaldo del banco entre 30° y 45° (nunca más de 45° para no transferir todo el trabajo al hombro).',
      'Apoya las mancuernas en tus rodillas y balancéalas hacia arriba con las piernas al recostarte.',
      'Mantén los codos en ángulo de 60-70° respecto al torso, no abiertos a 90°.',
      'Empuja en un arco natural juntando las mancuernas arriba sin chocarlas con violencia.',
      'Controla la bajada en 2-3 segundos sintiendo el estiramiento en la zona superior del pecho.'
    ],
    apparatus: {
      name: 'Banco Regulable Inclinable (Incline Adjustable Bench)',
      aliases: ['Banco Multiposición', 'Banco Inclinado de Pesas'],
      imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Banco acolchado con dos secciones móviles (asiento y respaldo) y un selector de ángulo con orificios numerados o semicírculo de muescas.',
      howToAdjust: [
        'Tira del pasador amarillo o perno del respaldo y colócalo en el segundo o tercer nivel (30° - 45°).',
        'Inclina también ligeramente el asiento hacia arriba (10-15°) para evitar resbalar hacia adelante.',
        'Asegúrate de que el pasador haya encajado con un "clic" firme antes de sentarte con peso.'
      ],
      difficultyLevel: 'Intermedio',
      category: 'Peso Libre & Bancos'
    }
  },
  {
    id: 'elevaciones-laterales-polea',
    exerciseName: 'Elevaciones Laterales en Polea',
    aliases: ['elevaciones laterales', 'cable lateral raise', 'laterales en polea', 'vuelos laterales'],
    muscleTarget: 'Deltoides Lateral (Hombro en V)',
    secondaryMuscles: ['Trapecio Superior', 'Supraespinoso'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/delts/cable-lateral-raise.gif',
    executionTips: [
      'Coloca la polea en la posición más baja o a la altura de la rodilla.',
      'Colócate de lado o con el cable pasando por detrás de tu cuerpo para tensión continua.',
      'Eleva el brazo hasta la horizontal (nivel del hombro) liderando con el codo.',
      'Mantén el meñique ligeramente más alto que el pulgar ("como vaciando una jarra").',
      'Desciende de forma lenta y pausada resistiendo el peso.'
    ],
    apparatus: {
      name: 'Torre de Polea Regulable (Cable Crossover / Functional Trainer)',
      aliases: ['Torre de Cables', 'Polea Dual Regulable', 'Crossover'],
      imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Estructura con dos columnas de placas y poleas deslizantes con pasadores que se desplazan verticalmente por un riel de acero.',
      howToAdjust: [
        'Tira del pomo retráctil y desliza la polea hasta el nivel más bajo (número 1 o 2).',
        'Coloca un maneral de estribo simple (agarre de mano de nailon o goma).',
        'Selecciona un peso liviano (las poleas tienen tensión constante: 2.5 kg a 7.5 kg es ideal).'
      ],
      difficultyLevel: 'Intermedio',
      category: 'Poleas & Cables'
    }
  },
  {
    id: 'prensa-piernas-inclinada',
    exerciseName: 'Prensa de Piernas en Máquina (Leg Press 45°)',
    aliases: ['prensa de piernas', 'leg press', 'prensa 45', 'prensa inclinada', 'máquina prensa'],
    muscleTarget: 'Cuádriceps, Glúteos y Aductores',
    secondaryMuscles: ['Isquiotibiales', 'Gemelos'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/lever-alternate-leg-press.gif',
    executionTips: [
      'Apoya la espalda y la zona lumbar totalmente pegadas al respaldo sin despegar la pelvis (evita el "buttwink").',
      'Coloca los pies en el centro de la plataforma al ancho de hombros.',
      'Empuja para extender las piernas y gira hacia afuera las palancas laterales de seguridad.',
      'Desciende despacio hasta formar al menos 90° en las rodillas.',
      'Empuja con toda la planta del pie. NUNCA bloquees ni hiperextiendas las rodillas al final.'
    ],
    apparatus: {
      name: 'Máquina Prensa Inclinada a 45° (Leg Press)',
      aliases: ['Prensa Olímpica de Discos', 'Leg Press 45 Grados', 'Prensa Inclinada'],
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Máquina voluminosa e inclinada con asiento reclinado hacia atrás, gran plataforma metálica para los pies que se desliza por dos tubos gruesos, y palancas de seguridad a los lados.',
      howToAdjust: [
        'Ajusta la inclinación del respaldo para que tu espalda baja quede completamente apoyada y cómoda.',
        'Carga los discos en los soportes laterales de la plataforma (empieza ligero para probar el recorrido).',
        'Siéntate, coloca los pies, empuja un poco y gira las palancas de seguridad hacia afuera para desbloquear el trineo.',
        'Al terminar la serie, vuelve a meter las palancas de seguridad antes de soltar la tensión.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Máquinas Guiadas'
    }
  },
  {
    id: 'extension-cuadriceps',
    exerciseName: 'Extensión de Cuádriceps en Máquina',
    aliases: ['extensión de cuádriceps', 'leg extension', 'extensiones de pierna', 'máquina cuádriceps'],
    muscleTarget: 'Cuádriceps (Recto Femoral, Vasto Medial y Lateral)',
    secondaryMuscles: ['Tendón Rotuliano'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/lever-leg-extension.gif',
    executionTips: [
      'Ajusta el respaldo para que la parte trasera de tus rodillas quede justo al borde del asiento.',
      'El rodillo acolchado debe quedar en la parte baja de las espinillas, justo por encima de los tobillos.',
      'Sujeta los manubrios laterales para anclar tus caderas al asiento.',
      'Extiende las piernas hacia arriba de forma explosiva controlada y aprieta los cuádriceps 1 segundo en la cima.',
      'Baja en 2-3 segundos sin dejar que las placas de peso choquen entre sí.'
    ],
    apparatus: {
      name: 'Máquina de Extensión de Piernas (Leg Extension)',
      aliases: ['Sillón de Cuádriceps', 'Máquina Extensiones Sentado', 'Lever Leg Extension'],
      imageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Sillón con respaldo ajustable, manijas laterales, y una palanca con rodillo acolchado cilíndrico que descansa sobre tus espinillas, conectado a una torre de placas.',
      howToAdjust: [
        'Tira del perno del respaldo para que el eje de rotación de la máquina (círculo metálico) coincida exactamente con tu articulación de la rodilla.',
        'Ajusta la altura del rodillo para que apoye en la espinilla baja, no sobre los empeines ni a mitad de la tibia.',
        'Coloca el pasador de peso en una carga moderada para 12-15 repeticiones.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Máquinas Guiadas'
    }
  },
  {
    id: 'burpees-salto',
    exerciseName: 'Burpees con Salto al Cajón',
    aliases: ['burpees', 'burpee con salto', 'salto al cajón', 'box jumps', 'burpee box jump'],
    muscleTarget: 'Cuerpo Completo & Sistema Cardiovascular',
    secondaryMuscles: ['Piernas', 'Pectorales', 'Core'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/cardio/burpee.gif',
    executionTips: [
      'Desde de pie, agáchate colocando las manos en el suelo y lanza los pies hacia atrás a posición de plancha.',
      'Realiza una flexión de pecho rozando el suelo.',
      'Recoge los pies de un salto hacia las manos en posición de cuclillas.',
      'Salta de forma explosiva hacia arriba (o sobre el cajón si está disponible) aterrizando con flexión suave de rodillas.'
    ],
    apparatus: {
      name: 'Cajón Pliométrico & Zona Funcional (Plyo Box)',
      aliases: ['Caja de Crossfit', 'Plyo Box de Madera o Espuma', 'Cajón de Salto'],
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Caja cúbica robusta de madera o espuma de alta densidad antideslizante con 3 alturas diferentes según el lado apoyado (50 cm, 60 cm o 75 cm / 20", 24", 30").',
      howToAdjust: [
        'Gira el cajón según la altura deseada: 50 cm para principiantes, 60 cm intermedio, 75 cm avanzado.',
        'Verifica que el piso no resbale antes de saltar.',
        'Si tienes molestia articular, puedes hacer step-up (subir pisando) en vez de salto.'
      ],
      difficultyLevel: 'Intermedio',
      category: 'Cardio & Funcional'
    }
  },
  {
    id: 'remo-ergometro-airbike',
    exerciseName: 'Remo Ergométrico o Air Bike (Intervalos)',
    aliases: ['remo ergométrico', 'indoor rower', 'concept 2', 'air bike', 'bicicleta de aire', 'cardio intervalos'],
    muscleTarget: 'Capacidad Cardiorrespiratoria, Espalda y Piernas',
    secondaryMuscles: ['Brazos', 'Glúteos', 'Core'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/cardio/astride-jumps-male.gif',
    executionTips: [
      'Secuencia de remada: Piernas -> Torso -> Brazos en el tirón.',
      'Secuencia de recuperación: Brazos -> Torso -> Piernas para volver al inicio.',
      'Empuja con las piernas manteniendo los brazos rectos al inicio del tirón.',
      'Tira de la empuñadura hacia la base de las costillas y extiende las piernas con fuerza.'
    ],
    apparatus: {
      name: 'Máquina de Remo Indoor (Concept2 / WaterRower)',
      aliases: ['Remo de Aire', 'Indoor Rower', 'Ergómetro'],
      imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Máquina larga y baja con un carril central por donde rueda un asiento acolchado, un ventilador/volante delantero circular y un monitor digital PM5.',
      howToAdjust: [
        'Ajusta las correas de los pies (flexfoot) para que la cinta quede sobre la base de los cordones de tus zapatillas.',
        'Regula la palanca de resistencia lateral del ventilador (damper) entre 4 y 6 para un arrastre óptimo.',
        'Presiona "Just Row" en la pantalla para comenzar a registrar metros, tiempo y ritmo de paladas.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Cardio & Funcional'
    }
  },
  {
    id: 'mountain-climbers',
    exerciseName: 'Mountain Climbers + Escalador Cruzado',
    aliases: ['mountain climbers', 'escaladores', 'mountain climber', 'escalador cruzado', 'plancha dinamica'],
    muscleTarget: 'Abdomen, Core y Flexores de Cadera',
    secondaryMuscles: ['Hombros', 'Pecho', 'Pectorales'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/abs/3-4-sit-up.gif',
    executionTips: [
      'Colócate en plancha alta con las manos debajo de los hombros y el cuerpo en línea recta.',
      'Lleva una rodilla hacia el pecho sin elevar las caderas ni redondear en exceso la espalda.',
      'Alterna rápidamente los pies como si estuvieras corriendo en posición horizontal.',
      'Para el escalador cruzado, dirige la rodilla derecha hacia el codo izquierdo y viceversa para activar los oblicuos.'
    ],
    apparatus: {
      name: 'Tapete / Colchoneta de Suelo (Gym Mat)',
      aliases: ['Mat de Yoga', 'Colchoneta de Fitness', 'Piso de Caucho'],
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Tapete acolchado de espuma o goma eva antideslizante enrollable para ejercicios de suelo y estiramientos.',
      howToAdjust: [
        'Desenrolla en una zona despejada del gimnasio lejos del tránsito de mancuernas o poleas.',
        'Úsalo para amortiguar el impacto de muñecas, rodillas y codos.',
        'Limpia la superficie con spray desinfectante al finalizar tu entrenamiento.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Cardio & Funcional'
    }
  },
  {
    id: 'maquina-smith-multipower',
    exerciseName: 'Sentadillas o Press en Máquina Smith',
    aliases: ['máquina smith', 'smith machine', 'multipower', 'barra guiada', 'sentadilla smith'],
    muscleTarget: 'Cuádriceps y Glúteos (o Pectorales/Hombros según el ejercicio)',
    secondaryMuscles: ['Isquiotibiales', 'Estabilizadores'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/quads/smith-chair-squat.gif',
    executionTips: [
      'La barra se mueve sobre rieles verticales o ligeramente inclinados fijos, reduciendo la necesidad de estabilizar el equilibrio.',
      'Gira la barra hacia atrás con las muñecas para desenganchar los pestillos de seguridad de las muescas.',
      'Para volver a bloquearla en cualquier momento, solo gira las muñecas hacia adelante.',
      'Coloca siempre los topes mecánicos de seguridad inferiores a la altura mínima donde puedas bajar seguro.'
    ],
    apparatus: {
      name: 'Máquina Smith (Multipower / Barra Guiada)',
      aliases: ['Smith Machine', 'Jaula Multipower', 'Barra Fija Guiada'],
      imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Estructura vertical metálica alta con una barra olímpica fija sobre dos rieles cilíndricos con ganchos salientes a intervalos regulares de 10-15 cm.',
      howToAdjust: [
        'Desliza los dos topes mecánicos inferiores y fíjalos a la altura del pecho o cadera para que la barra no pueda descender más abajo en caso de fallo.',
        'Carga los discos por igual a ambos extremos de la barra.',
        'Gira la barra para desenganchar antes de comenzar las repeticiones y gira para enganchar al terminar.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Máquinas Guiadas'
    }
  },
  {
    id: 'fondos-paralelas-asistidas',
    exerciseName: 'Fondos en Paralelas Asistidas / Calistenia',
    aliases: ['fondos en paralelas', 'dips', 'assisted dips', 'fondos asistidos', 'fondos de pecho'],
    muscleTarget: 'Tríceps y Pectoral Inferior',
    secondaryMuscles: ['Deltoides Anterior', 'Antebrazos'],
    gifUrl: 'https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@main/pectorals/assisted-chest-dip-kneeling.gif',
    executionTips: [
      'Sube a la plataforma de rodillas y agarra las barras paralelas con un agarre firme.',
      'Inclina levemente el torso hacia adelante para activar más el pecho (o mantén el torso erguido para aislar tríceps).',
      'Baja controlando el movimiento hasta que los codos formen un ángulo de 90°.',
      'Empuja con fuerza hasta extender los brazos sin encoger los hombros hacia las orejas.'
    ],
    apparatus: {
      name: 'Torre de Dominadas y Fondos Asistidos',
      aliases: ['Assisted Dip & Chin Machine', 'Máquina de Dominadas con Contrapeso'],
      imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80',
      visualIdentification: 'Torre alta con escalones metálicos para subir, barras superiores de dominadas, barras paralelas medias, y una almohadilla móvil donde apoyas las rodillas conectada a placas de contrapeso.',
      howToAdjust: [
        '¡REGLA CLAVE!: En esta máquina, MÁS PESO en el pasador significa MÁS AYUDA (es más fácil). Si pones 40 kg, la máquina resta 40 kg a tu peso corporal.',
        'Despliega la almohadilla acolchada para las rodillas si quieres ayuda, o pliégala hacia atrás para fondos libres.',
        'Sube por los peldaños, apoya una rodilla primero y luego la otra con cuidado.'
      ],
      difficultyLevel: 'Fácil para principiantes',
      category: 'Máquinas Guiadas'
    }
  }
];

// Fuzzy search and keyword matching to find exercise media
export function getExerciseMedia(exerciseName: string): ExerciseMedia {
  if (!exerciseName) {
    return EXERCISE_MEDIA_DATABASE[0];
  }

  const query = exerciseName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 1. Direct match or alias match
  for (const item of EXERCISE_MEDIA_DATABASE) {
    if (item.exerciseName.toLowerCase().includes(query) || query.includes(item.exerciseName.toLowerCase())) {
      return item;
    }
    for (const alias of item.aliases) {
      const cleanAlias = alias.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (query.includes(cleanAlias) || cleanAlias.includes(query)) {
        return item;
      }
    }
  }

  // 2. Keyword heuristic matching
  if (query.includes('sentadill') || query.includes('squat')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'sentadillas-goblet') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('prensa') || query.includes('leg press')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'prensa-piernas-inclinada') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('banca') || query.includes('bench') || (query.includes('press') && query.includes('pecho'))) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'press-banca-mancuernas') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('inclinad')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'press-inclinado-mancuernas') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('remo') || query.includes('row')) {
    if (query.includes('ergometr') || query.includes('concept') || query.includes('cardio')) {
      return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'remo-ergometro-airbike') || EXERCISE_MEDIA_DATABASE[0];
    }
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'remo-polea-baja') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('jalon') || query.includes('pulldown') || query.includes('dominada')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'dominadas-jalon-pecho') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('militar') || query.includes('overhead') || (query.includes('press') && query.includes('hombro'))) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'press-militar-barra') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('lateral') || query.includes('deltoides') || query.includes('vuelos')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'elevaciones-laterales-polea') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('zancad') || query.includes('lunge') || query.includes('estocada')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'zancadas-dinamicas') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('kettlebell') || query.includes('swing') || query.includes('rusa')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'kettlebell-swings') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('burpee') || query.includes('box jump') || query.includes('cajon')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'burpees-salto') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('climber') || query.includes('escalador') || query.includes('plancha')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'mountain-climbers') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('extension') && query.includes('pierna')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'extension-cuadriceps') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('smith') || query.includes('multipower')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'maquina-smith-multipower') || EXERCISE_MEDIA_DATABASE[0];
  }
  if (query.includes('fondo') || query.includes('dip') || query.includes('paralela')) {
    return EXERCISE_MEDIA_DATABASE.find(e => e.id === 'fondos-paralelas-asistidas') || EXERCISE_MEDIA_DATABASE[0];
  }

  // Default fallback to first element
  return EXERCISE_MEDIA_DATABASE[0];
}
