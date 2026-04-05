import { GoogleGenerativeAI } from "@google/generative-ai";
import { type SQLiteDatabase } from 'expo-sqlite';
import * as Location from 'expo-location';
import { PreferencesRepository } from '../repositories/extra-repositories';
import { SessionRepository } from '../repositories/session-repository';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export class AICoachService {
  constructor(private db: SQLiteDatabase, private apiKey: string) {}

  private async buildSystemInstruction(): Promise<string> {
    const prefsRepo = new PreferencesRepository(this.db);
    const prefs = await prefsRepo.getPreferences();
    const userName = prefs?.user_name || "Atleta";

    // Try to get location
    let weatherInfo = "Desconocido";
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        // In a real prod environment we would call an OpenWeather API here.
        // For now, we will simulate passing the coords to the AI, or just skip weather
        // to avoid storing another API key or exposing secret tokens on client side.
        weatherInfo = `Lat: ${location.coords.latitude.toFixed(2)}, Lon: ${location.coords.longitude.toFixed(2)}`;
      }
    } catch (e) {
      // Ignored
    }

    return `Eres el "Coach AI", un entrenador personal de élite, experto certificado en fuerza, hipertrofia y nutrición, integrado dentro de la app Gym Tracker.
    Tu cliente se llama ${userName}.
    
    Reglas de comportamiento:
    1. Tus respuestas deben ser motivadoras, energéticas, empáticas y muy directas (cortas para una UI móvil).
    2. Utiliza un tono amigable, como un entrenador que realmente se preocupa por ${userName}, utilizando su nombre a menudo.
    3. Si te preguntan por ejercicios, recomienda basados en biomecánica moderna y evidencia científica.
    4. Usa emojis para darle vida al texto (💪, 🔥, 🏆).
    5. Nunca inventes información riesgosa médicamente; si es un tema médico derivar a un doctor.

    Datos del entorno de tu alumno:
    - Ubicación actual (si disponible): ${weatherInfo}
    `;
  }

  async generateResponse(query: string, pastMessages: ChatMessage[]): Promise<string> {
    try {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const instruction = await this.buildSystemInstruction();
      
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: instruction
      });

      // Convert local state to Gemini API history
      const history = pastMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(query);
      return result.response.text();
    } catch (error: any) {
      console.error(error);
      return `Lo siento ${query ? 'Atleta' : ''}, tuve un problema conectando con el servidor (Revisa que tu API Key esté bien pegada en Ajustes y que tengas internet). [Error: ${error?.message}]`;
    }
  }
}
