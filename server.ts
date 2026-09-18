import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Lazy-initialized Gemini AI instance
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Coach profiles definitions
const COACH_PROFILES = {
  fatloss: {
    name: "Elena Ramos",
    title: "Especialista en Quema de Grasa & HIIT",
    systemPrompt: `Eres Elena Ramos, entrenadora de élite y especialista en déficit calórico, acondicionamiento metabólico y pérdida acelerada de grasa preservando masa muscular.
Tu tono es motivador, técnico, directo y empático.
Habla en español. Ofrece pautas concretas: densidad del entrenamiento, descansos cortos (30-60s), circuitos metabólicos, cardio en zona 2 y HIIT. Siempre enfatiza la técnica para prevenir lesiones.`
  },
  strength: {
    name: "Carlos 'Titan' Vega",
    title: "Entrenador de Fuerza & Hipertrofia",
    systemPrompt: `Eres Carlos Vega, entrenador de levantamiento de potencia, fuerza funcional e hipertrofia con más de 12 años de experiencia.
Tu tono es enérgico, disciplinado, científico y muy motivador ("¡Vamos con todo!").
Habla en español. Te especializas en sobrecarga progresiva, RPE/RIR, selección óptima de ejercicios compuestos (sentadilla, press banca, peso muerto, dominadas, press militar) y rangos de repeticiones eficaces.`
  },
  nutrition: {
    name: "Dra. Sofía Méndez",
    title: "Nutricionista Deportiva & Recomposición",
    systemPrompt: `Eres la Dra. Sofía Méndez, nutricionista deportiva y especialista en recomposición corporal.
Tu tono es profesional, cercano, basado en evidencia científica y libre de mitos restrictivos.
Habla en español. Ayudas a calcular macros, ajustar la ingesta de proteína (1.6 a 2.2g/kg), hidratación, nutrición peri-entrenamiento y estrategias de déficit calórico sostenible sin pasar hambre ni perder energía en el gimnasio.`
  },
  rehab: {
    name: "Marcos Varela",
    title: "Fisioterapeuta & Movilidad Articular",
    systemPrompt: `Eres Marcos Varela, fisioterapeuta deportivo y coach de movilidad articular y biomecánica en el gimnasio.
Tu tono es prudente, analítico, tranquilizador y educativo.
Habla en español. Ayudas a corregir posturas, adaptar ejercicios si hay molestias en hombros, rodillas o lumbares, y recomiendas calentamientos dinámicos y descargas.`
  }
};

// Helper for timeout
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 8000, fallbackVal: T): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallbackVal), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

// Chat endpoint with expert gym coaches
app.post("/api/ai/coach-chat", async (req: Request, res: Response) => {
  const { messages, coachType = "fatloss", userContext } = req.body;
  const coach = COACH_PROFILES[coachType as keyof typeof COACH_PROFILES] || COACH_PROFILES.fatloss;

  // Smart responsive fallback generator
  const getFallbackReply = () => {
    const lastUserMsg = messages?.[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = `¡Hola! Soy ${coach.name} (${coach.title}). `;
    if (lastUserMsg.includes("grasa") || lastUserMsg.includes("peso") || lastUserMsg.includes("calor")) {
      reply += `Para maximizar la quema de calorías y la pérdida de grasa sin perder masa muscular, la clave es combinar ejercicios multiarticulares con descansos controlados (45-60 seg) y mantener un déficit calórico moderado de 300-500 kcal diarias. ¡Cuéntame tu peso actual y rutina y te diseño la progresión!`;
    } else if (lastUserMsg.includes("hipertrofia") || lastUserMsg.includes("fuerza") || lastUserMsg.includes("musculo")) {
      reply += `Para ganar masa y fuerza, prioriza sobrecarga progresiva: busca acercarte a RIR 1-2 (1 o 2 repeticiones en reserva antes del fallo) en ejercicios base con 3-4 series efectivas. ¿Qué grupo muscular entrenas hoy?`;
    } else if (lastUserMsg.includes("cardio") || lastUserMsg.includes("tiempo")) {
      reply += `El cardio después de las pesas o en días separados optimiza el uso de glucógeno para levantar pesado y usa las grasas como combustible en el cardio. Mantén 20-30 min a intensidad moderada (Zona 2).`;
    } else {
      reply += `Estoy listo para optimizar tu sesión en el gimnasio. ¿Qué objetivo específico tienes hoy o qué duda tienes sobre tu técnica, series, cronómetro o calorías?`;
    }
    return reply;
  };

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ reply: getFallbackReply(), coach: coach.name });
    }

    let contextText = "";
    if (userContext) {
      contextText = `\n[Datos del usuario: Peso actual: ${userContext.currentWeight || "no indicado"} kg, Meta: ${userContext.goal || "Quema de grasa y tonificación"}, Nivel: ${userContext.level || "Intermedio"}, Calorías objetivo: ${userContext.targetCalories || "400-500 kcal/sesión"}]`;
    }

    const historyForGemini = (messages || []).map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const geminiCall = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: historyForGemini,
      config: {
        systemInstruction: `${coach.systemPrompt}\n${contextText}\nDa respuestas concisas (1 a 3 párrafos), directas, prácticas para el gimnasio y altamente motivadoras.`
      }
    });

    const response = await withTimeout<any>(geminiCall, 7000, null);
    const reply = response?.text?.trim() || getFallbackReply();
    res.json({ reply, coach: coach.name });
  } catch (error: any) {
    console.warn("Falling back in coach-chat:", error.message);
    res.json({ reply: getFallbackReply(), coach: coach.name });
  }
});

// Personalized Routine & Calorie Recommendation endpoint
app.post("/api/ai/recommend-routine", async (req: Request, res: Response) => {
  const { targetCalories, goal, level, durationMinutes, equipment, injuries } = req.body;

  // Smart deterministic fallback routine
  const getSmartFallbackRoutine = () => ({
    title: `Circuito Quema Grasa & Definición (${targetCalories || 450} kcal)`,
    targetCalories: targetCalories || 450,
    estimatedDurationMinutes: durationMinutes || 45,
    goal: goal || "Baja de peso y definición",
    warmup: "5 min de movilidad articular (brazos, caderas, tobillos) + 3 min trote o elíptica suave.",
    exercises: [
      {
        name: "Sentadillas Goblet o con Barra",
        category: "Piernas & Quema Calórica",
        sets: 4,
        reps: "12-15",
        restSeconds: 45,
        techniqueTip: "Mantén el pecho erguido y baja hasta 90 grados controlando la fase excéntrica.",
        estimatedCaloriesBurned: 95
      },
      {
        name: "Press Militar con Mancuernas + Saltos a la Cuerda",
        category: "Empuje & Metabólico",
        sets: 4,
        reps: "12 reps + 40 saltos",
        restSeconds: 50,
        techniqueTip: "Contrae el abdomen sin arquear la zona lumbar al empujar hacia arriba.",
        estimatedCaloriesBurned: 110
      },
      {
        name: "Remo con Mancuerna o Polea Baja",
        category: "Espalda & Postura",
        sets: 4,
        reps: "12 por lado",
        restSeconds: 45,
        techniqueTip: "Lleva el codo hacia la cadera y aprieta el dorsal durante 1 segundo.",
        estimatedCaloriesBurned: 85
      },
      {
        name: "Peso Muerto Rumano con Mancuernas",
        category: "Cadena Posterior",
        sets: 3,
        reps: "12-15",
        restSeconds: 50,
        techniqueTip: "Empuja la cadera hacia atrás manteniendo las rodillas con ligera flexión fija.",
        estimatedCaloriesBurned: 90
      },
      {
        name: "Finisher: Intervalos en Caminadora o Remo Ergométrico",
        category: "Cardio Alta Intensidad",
        sets: 6,
        reps: "30s sprint / 30s suave",
        restSeconds: 30,
        techniqueTip: "Da el 85-90% de esfuerzo en los 30s de aceleración.",
        estimatedCaloriesBurned: 100
      }
    ],
    nutritionAdvice: "Para un objetivo de baja de peso, mantén una hidratación de al menos 500ml durante este entreno y consume proteína magra (pollo, atún o batido) dentro de las 2 horas posteriores.",
    cooldown: "5 min de estiramientos estáticos de cuádriceps, isquiotibiales y pectorales."
  });

  try {
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({ routine: getSmartFallbackRoutine() });
    }

    const prompt = `Genera una rutina de gimnasio altamente efectiva optimizada para:
- Objetivo principal: ${goal || "Quema de grasa y baja de peso corporal"}
- Objetivo calórico de la sesión: ${targetCalories || 450} kcal
- Nivel de condición física: ${level || "Intermedio"}
- Tiempo disponible: ${durationMinutes || 45} minutos
- Equipamiento disponible: ${equipment || "Gimnasio completo (pesas, máquinas y cardio)"}
- Consideraciones o limitaciones: ${injuries || "Ninguna"}

Devuelve EXCLUSIVAMENTE un JSON válido con la siguiente estructura:
{
  "title": "string (nombre atractivo de la rutina)",
  "targetCalories": number,
  "estimatedDurationMinutes": number,
  "goal": "string",
  "warmup": "string (instrucciones de calentamiento)",
  "exercises": [
    {
      "name": "string",
      "category": "string",
      "sets": number,
      "reps": "string",
      "restSeconds": number,
      "techniqueTip": "string",
      "estimatedCaloriesBurned": number
    }
  ],
  "nutritionAdvice": "string",
  "cooldown": "string"
}`;

    const geminiCall = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const response = await withTimeout<any>(geminiCall, 7500, null);
    if (!response || !response.text) {
      return res.json({ routine: getSmartFallbackRoutine() });
    }

    const jsonText = response.text.trim();
    const routine = JSON.parse(jsonText);
    res.json({ routine });
  } catch (error: any) {
    console.warn("Falling back in recommend-routine:", error.message);
    res.json({ routine: getSmartFallbackRoutine() });
  }
});

async function startServer() {
  const distPath = path.join(process.cwd(), "dist");
  const hasDist = fs.existsSync(path.join(distPath, "index.html"));

  if (!hasDist || process.env.NODE_ENV === "development") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
