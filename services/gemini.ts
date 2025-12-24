
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCoachFeedback = async (name: string, rating: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un entrenador de élite muy motivador. El atleta ${name} ha obtenido una puntuación de ${rating} sobre 100. Dame un comentario corto (máximo 15 palabras) con un tono deportivo y profesional sobre este resultado.`,
      config: {
        temperature: 0.8,
        maxOutputTokens: 50,
      }
    });
    return response.text || "¡Buen trabajo, sigue entrenando!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "¡A tope! Sigue dándolo todo.";
  }
};
