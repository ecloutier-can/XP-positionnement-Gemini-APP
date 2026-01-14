
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';

// --- TYPES ---
type Level = 1 | 2 | 3;

interface Question {
  id: string;
  text: string;
  options: { label: string; value: Level }[];
}

interface Category {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  color: string;
}

interface UserAssessment {
  userName: string;
  answers: Record<string, Level>;
  notes: Record<string, string>;
}

interface Persona {
  title: string;
  description: string;
  icon: string;
}

interface RoadmapItem {
  title: string;
  description: string;
  link?: string;
}

// --- CONSTANTS ---
const CATEGORIES: Category[] = [
  {
    id: "elabor",
    title: "Élaboration",
    description: "Design pédagogique et conception systémique du cours.",
    color: "bg-amber-500",
    questions: [
      { id: "q1", text: "Quel modèle de design pédagogique utilisez-vous ?", options: [{label: "Aucun", value: 1}, {label: "Partiellement", value: 2}, {label: "Rigoureusement", value: 3}] },
      { id: "q2", text: "Effectuez-vous des tests systématiques des outils ?", options: [{label: "Rarement", value: 1}, {label: "Ponctuellement", value: 2}, {label: "Toujours", value: 3}] },
      { id: "q3", text: "Utilisez-vous des ressources libres (REL) ?", options: [{label: "Non", value: 1}, {label: "Parfois", value: 2}, {label: "Systématiquement", value: 3}] },
      { id: "q4", text: "Collaborez-vous avec une équipe ?", options: [{label: "Seul", value: 1}, {label: "Ponctuellement", value: 2}, {label: "Toujours", value: 3}] },
      { id: "q5", text: "Avez-vous un plan d'amélioration continue ?", options: [{label: "Non", value: 1}, {label: "Informel", value: 2}, {label: "Structuré", value: 3}] },
    ]
  },
  {
    id: "demar",
    title: "Démarche",
    description: "Alignement et variété des stratégies d'apprentissage.",
    color: "bg-sky-500",
    questions: [
      { id: "q6", text: "Assurez-vous l'alignement pédagogique ?", options: [{label: "Intuitivement", value: 1}, {label: "Vérification globale", value: 2}, {label: "Grille précise", value: 3}] },
      { id: "q7", text: "Quelle est la variété des activités ?", options: [{label: "Faible", value: 1}, {label: "Moyenne", value: 2}, {label: "Élevée", value: 3}] },
      { id: "q8", text: "Offrez-vous des choix de parcours ?", options: [{label: "Parcours unique", value: 1}, {label: "Quelques options", value: 2}, {label: "Plusieurs chemins", value: 3}] },
      { id: "q9", text: "Structurez-vous vos contenus ?", options: [{label: "Monolithiques", value: 1}, {label: "Chapitres", value: 2}, {label: "Micro-apprentissage", value: 3}] },
      { id: "q10", text: "Les critères d'évaluation sont-ils clairs ?", options: [{label: "Peu clairs", value: 1}, {label: "Texte simple", value: 2}, {label: "Grille détaillée", value: 3}] },
    ]
  },
  {
    id: "organ",
    title: "Organisation",
    description: "Mise en œuvre technique et environnement numérique.",
    color: "bg-emerald-500",
    questions: [
      { id: "q11", text: "Plan de cours adapté à la FAD ?", options: [{label: "Peu adapté", value: 1}, {label: "Adapté", value: 2}, {label: "Spécifique FAD", value: 3}] },
      { id: "q12", text: "Convivialité du LMS ?", options: [{label: "Faible", value: 1}, {label: "Fonctionnelle", value: 2}, {label: "Ergonomique", value: 3}] },
      { id: "q13", text: "Interactivité multimédia ?", options: [{label: "Statique", value: 1}, {label: "Modérée", value: 2}, {label: "Élevée", value: 3}] },
      { id: "q14", text: "Choix technologiques justifiés ?", options: [{label: "Par défaut", value: 1}, {label: "Par mode", value: 2}, {label: "Par besoin pédagogique", value: 3}] },
      { id: "q15", text: "Équilibre synchrone/asynchrone ?", options: [{label: "Déséquilibre", value: 1}, {label: "Mélange simple", value: 2}, {label: "Équilibre stratégique", value: 3}] },
    ]
  },
  {
    id: "encad",
    title: "Encadrement",
    description: "Soutien, présence et relation avec les apprenants.",
    color: "bg-fuchsia-500",
    questions: [
      { id: "q16", text: "Accueil des nouveaux ?", options: [{label: "Minimal", value: 1}, {label: "Courriel simple", value: 2}, {label: "Séance structurée", value: 3}] },
      { id: "q17", text: "Formation aux outils ?", options: [{label: "Aucune", value: 1}, {label: "Guides PDF", value: 2}, {label: "Tutos interactifs", value: 3}] },
      { id: "q18", text: "Nétiquette définie ?", options: [{label: "Non", value: 1}, {label: "Brièvement", value: 2}, {label: "Explicitement", value: 3}] },
      { id: "q19", text: "Soutien à l'autonomie ?", options: [{label: "Faible", value: 1}, {label: "Conseils simples", value: 2}, {label: "Outils dédiés", value: 3}] },
      { id: "q20", text: "Présence active ?", options: [{label: "Réactive", value: 1}, {label: "Régulière", value: 2}, {label: "Proactive", value: 3}] },
    ]
  }
];

const PERSONAS: Record<string, Persona> = {
  stratege: { title: "Le Stratège", description: "Profil hautement équilibré. Maîtrise technique et pédagogique.", icon: "🎯" },
  architecte: { title: "L'Architecte", description: "Expert en planification et design pédagogique.", icon: "🏛️" },
  facilitateur: { title: "Le Facilitateur", description: "L'humain est au cœur de votre approche.", icon: "🤝" },
  explorateur: { title: "L'Explorateur", description: "Innovateur passionné par les outils technologiques.", icon: "🚀" },
  novice: { title: "L'Apprenant", description: "Vous débutez dans le monde de la FAD.", icon: "🌱" }
};

// --- AI SERVICE ---
async function generateRoadmap(assessment: UserAssessment): Promise<RoadmapItem[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Génère 5 conseils stratégiques et concrets pour un enseignant en FAD avec ces scores (1-3): ${JSON.stringify(assessment.answers)}. Notes: ${JSON.stringify(assessment.notes)}. Format JSON: [{title, description, link}]. Ajoute un champ 'link' pointant vers une ressource externe pertinente comme CADRE21, FADIO, RÉCIT ou des guides pédagogiques universitaires québécois si possible.`;
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
              link: { type: Type.STRING, description: "URL vers une ressource pédagogique pertinente" }
            },
            required: ["title", "description"]
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : [];
  } catch {
    return [{ title: "Focus CADRE21", description: "Explorez les formations sur la scénarisation pédagogique.", link: "https://www.cadre21.org/" }];
  }
}

// --- MAIN APP ---
const App: React.FC = () => {
  const [assessment, setAssessment] = useState<UserAssessment>(() => {
    const saved = localStorage.getItem('fad_pro_assessment');
    return saved ? JSON.parse(saved) : { userName: '', answers: {}, notes: {} };
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('fad_pro_assessment', JSON.stringify(assessment));
  }, [assessment]);

  const scores = useMemo(() => {
    return CATEGORIES.map(cat => {
      const qIds = cat.questions.map(q => q.id);
      const answered = qIds.filter(id => assessment.answers[id] !== undefined);
      const avg = answered.length > 0 ? answered.reduce((a, id) => a + assessment.answers[id], 0) / answered.length : 0;
      return { name: cat.title, value: Number(avg.toFixed(2)), color: cat.color.replace('bg-', '') };
    });
  }, [assessment.answers]);

  const globalAvg = useMemo(() => {
    const vals = scores.filter(s => s.value > 0).map(s => s.value);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [scores]);

  const persona = useMemo(() => {
    if (globalAvg === 0) return PERSONAS.novice;
    if (globalAvg > 2.5) return PERSONAS.stratege;
    const max = scores.reduce((prev, curr) => (prev.value > curr.value) ? prev : curr);
    if (max.name === "Élaboration") return PERSONAS.architecte;
    if (max.name === "Encadrement") return PERSONAS.facilitateur;
    return PERSONAS.explorateur;
  }, [globalAvg, scores]);

  const handleReset = () => {
    if (confirm("Réinitialiser vos réponses ? (Le nom sera conservé)")) {
      setAssessment(prev => ({ ...prev, answers: {}, notes: {} }));
      setRoadmap([]);
      setCurrentStep(0);
    }
  };

  const handleSavePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Bilan Technopédagogique FAD", 20, 20);
    doc.setFontSize(12);
    doc.text(`Enseignant: ${assessment.userName || "Anonyme"}`, 20, 30);
    doc.text(`Profil: ${persona.title}`, 20, 40);
    doc.text(`Score Global: ${globalAvg.toFixed(2)} / 3.00`, 20, 50);
    
    doc.text("Scores par catégorie:", 20, 70);
    scores.forEach((s, i) => {
      doc.text(`- ${s.name}: ${s.value}`, 20, 80 + (i * 10));
    });

    if (roadmap.length > 0) {
      doc.text("Conseils personnalisés:", 20, 130);
      let yOffset = 140;
      roadmap.forEach((r, i) => {
        const text = `${r.title}: ${r.description}${r.link ? ` (Lien: ${r.link})` : ''}`;
        const lines = doc.splitTextToSize(text, 170);
        doc.text(lines, 20, yOffset);
        yOffset += (lines.length * 7) + 5;
      });
    }

    doc.save(`Bilan_FAD_${assessment.userName || 'Enseignant'}.pdf`);
  };

  return (
    <div className={`min-h-screen pb-20 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50'}`}>
      <header className="sticky top-0 z-50 glass-morphism border-b p-4 flex justify-between items-center no-print">
        <h1 className="font-bold text-xl text-blue-600">FAD Tech Skills Pro</h1>
        <div className="flex gap-4 items-center">
          <input 
            type="text" value={assessment.userName} 
            onChange={e => setAssessment({...assessment, userName: e.target.value})}
            placeholder="Nom..." className="bg-transparent border-b p-1 text-sm outline-none"
          />
          <button onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? '🌞' : '🌙'}</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="flex gap-2 mb-8 no-print overflow-x-auto">
              {CATEGORIES.map((c, i) => (
                <button key={c.id} onClick={() => setCurrentStep(i)} className={`p-2 rounded-lg text-xs font-bold ${currentStep === i ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                  {c.title}
                </button>
              ))}
            </div>

            <div className="space-y-8">
              <h2 className="text-2xl font-bold border-l-4 border-blue-600 pl-4">{CATEGORIES[currentStep].title}</h2>
              {CATEGORIES[currentStep].questions.map(q => (
                <div key={q.id} className="space-y-3">
                  <p className="font-medium">{q.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q.options.map(o => (
                      <button 
                        key={o.label} onClick={() => setAssessment(p => ({...p, answers: {...p.answers, [q.id]: o.value}}))}
                        className={`p-3 rounded-xl border-2 text-xs transition-all ${assessment.answers[q.id] === o.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea 
                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-sm no-print" placeholder="Vos notes..."
                value={assessment.notes[CATEGORIES[currentStep].id] || ''}
                onChange={e => setAssessment(p => ({...p, notes: {...p.notes, [CATEGORIES[currentStep].id]: e.target.value}}))}
              />
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-4xl font-black text-blue-600">{globalAvg.toFixed(2)}</span>
                <p className="text-xs font-bold text-slate-400">Score Moyen / 3.00</p>
              </div>
              <div className="text-center">
                <div className="text-4xl">{persona.icon}</div>
                <p className="text-[10px] font-black uppercase text-blue-500">{persona.title}</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores}>
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis domain={[0, 3]} hide />
                  <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                    {scores.map((e, i) => <Cell key={i} fill={`#${e.color}`} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <button 
              onClick={async () => { setIsLoading(true); setRoadmap(await generateRoadmap(assessment)); setIsLoading(false); }}
              className="w-full mt-6 py-3 bg-blue-600 text-white rounded-xl font-bold no-print"
            >
              {isLoading ? "Chargement..." : "Générer conseils IA"}
            </button>

            {roadmap.length > 0 && (
              <div className="mt-6 space-y-3">
                {roadmap.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
                    <p className="font-bold text-blue-600">{r.title}</p>
                    <p className="text-slate-500">{r.description}</p>
                    {r.link && (
                      <a href={r.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[10px] font-black uppercase text-blue-500 hover:underline">
                        Consulter la ressource →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 w-full p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t flex justify-between items-center z-50 no-print">
        <div className="flex gap-2">
          <button onClick={handleReset} className="p-3 bg-red-50 text-red-500 rounded-xl" title="Réinitialiser">🔄</button>
          <button onClick={() => window.print()} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl" title="Imprimer">🖨️</button>
        </div>
        <button onClick={handleSavePDF} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">
          📄 Sauvegarder mon bilan (PDF)
        </button>
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
