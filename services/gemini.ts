
import { GoogleGenAI, Type } from "@google/genai";
import { UserAssessment, RoadmapItem } from "../types";
import { CATEGORIES } from "../constants";

export async function generatePersonalizedRoadmap(assessment: UserAssessment): Promise<RoadmapItem[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const scoreBreakdown = CATEGORIES.map(cat => {
    const catAnswers = cat.questions.map(q => assessment.answers[q.id] || 0);
    const avg = catAnswers.reduce((a, b) => a + b, 0) / catAnswers.length;
    return `${cat.title}: ${avg.toFixed(1)}/3.0`;
  }).join(", ");

  const prompt = `
    En tant qu'expert en technopédagogie FAD (Formation à distance), analyse les résultats de cet enseignant :
    Nom : ${assessment.userName}
    Scores par catégorie : ${scoreBreakdown}
    Notes personnelles de l'enseignant : ${JSON.stringify(assessment.notes)}
    
    Génère un plan de formation personnalisé sous forme de 5 recommandations concrètes et stratégiques.
    Chaque recommandation doit inclure un titre et une description courte.
    Sois encourageant et précis. Priorise les zones où le score est le plus bas.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              link: { type: Type.STRING, description: "Un lien optionnel vers une ressource pertinente (ex: CADRE21, FADIO, etc.)" }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Gemini Roadmap generation error:", error);
  }

  return [
    { title: "Explorer CADRE21", description: "Consultez les formations sur la scénarisation pédagogique." },
    { title: "Rejoindre FADIO", description: "Participez aux communautés de pratique interordres." }
  ];
}
