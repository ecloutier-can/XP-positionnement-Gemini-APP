
import React, { useState, useEffect, useMemo } from 'react';
import { UserAssessment, Level, Persona, RoadmapItem } from './types';
import { CATEGORIES, PERSONAS } from './constants';
import { generatePersonalizedRoadmap } from './services/gemini';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [assessment, setAssessment] = useState<UserAssessment>(() => {
    const saved = localStorage.getItem('fad_pro_assessment');
    return saved ? JSON.parse(saved) : { userName: '', answers: {}, notes: {} };
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('fad_pro_assessment', JSON.stringify(assessment));
  }, [assessment]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const scores = useMemo(() => {
    return CATEGORIES.map(cat => {
      const qIds = cat.questions.map(q => q.id);
      const answered = qIds.filter(id => assessment.answers[id] !== undefined);
      const sum = answered.reduce((acc, id) => acc + (assessment.answers[id] || 0), 0);
      const avg = answered.length > 0 ? sum / answered.length : 0;
      return {
        name: cat.title,
        value: Number(avg.toFixed(2)),
        color: cat.color.replace('bg-', ''),
        total: answered.length,
        max: cat.questions.length
      };
    });
  }, [assessment.answers]);

  const globalAvg = useMemo(() => {
    const values = scores.filter(s => s.total > 0).map(s => s.value);
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  }, [scores]);

  const persona: Persona = useMemo(() => {
    if (globalAvg === 0) return PERSONAS.novice;
    const maxScore = Math.max(...scores.map(s => s.value));
    const maxCat = scores.find(s => s.value === maxScore);
    
    if (globalAvg > 2.5) return PERSONAS.stratege;
    if (maxCat?.name === "Élaboration") return PERSONAS.architecte;
    if (maxCat?.name === "Encadrement") return PERSONAS.facilitateur;
    if (maxCat?.name === "Organisation") return PERSONAS.explorateur;
    return PERSONAS.novice;
  }, [globalAvg, scores]);

  const handleAnswerChange = (qId: string, value: Level) => {
    setAssessment(prev => ({
      ...prev,
      answers: { ...prev.answers, [qId]: value }
    }));
  };

  const handleNoteChange = (catId: string, value: string) => {
    setAssessment(prev => ({
      ...prev,
      notes: { ...prev.notes, [catId]: value }
    }));
  };

  const handleFetchRoadmap = async () => {
    setIsLoadingRoadmap(true);
    try {
      const result = await generatePersonalizedRoadmap(assessment);
      setRoadmap(result);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const totalProgress = useMemo(() => {
    const answered = Object.keys(assessment.answers).length;
    const total = CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);
    return Math.round((answered / total) * 100);
  }, [assessment.answers]);

  const handleResetAnswers = () => {
    if (confirm('Réinitialiser toutes vos réponses et notes ? Votre nom sera conservé.')) {
      setAssessment(prev => ({
        ...prev,
        answers: {},
        notes: {}
      }));
      setCurrentStep(0);
      setRoadmap([]);
    }
  };

  const handleSavePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Titre
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("Bilan Technopedagogique FAD", margin, yPos);
    yPos += 15;

    // Infos utilisateur
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Enseignant(e) : ${assessment.userName || 'Anonyme'}`, margin, yPos);
    doc.text(`Date : ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - margin - 40, yPos);
    yPos += 20;

    // Bilan Global
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Resultat Global", margin, yPos);
    yPos += 10;
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text(`${globalAvg.toFixed(2)} / 3.00`, margin, yPos);
    yPos += 15;

    // Profil
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Profil : ${persona.title}`, margin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(80);
    const descLines = doc.splitTextToSize(persona.description, doc.internal.pageSize.getWidth() - 2 * margin);
    doc.text(descLines, margin, yPos);
    yPos += descLines.length * 5 + 15;

    // Scores par catégorie
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Details par Categorie", margin, yPos);
    yPos += 10;
    doc.setFontSize(11);
    scores.forEach(score => {
      doc.setTextColor(0);
      doc.text(`${score.name}:`, margin, yPos);
      doc.setTextColor(37, 99, 235);
      doc.text(`${score.value} / 3.00`, margin + 60, yPos);
      yPos += 8;
    });

    // Roadmap si présente
    if (roadmap.length > 0) {
      yPos += 15;
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Plan d'action personnalise", margin, yPos);
      yPos += 10;
      doc.setFontSize(10);
      roadmap.forEach((item, idx) => {
        doc.setTextColor(37, 99, 235);
        doc.text(`${idx + 1}. ${item.title}`, margin, yPos);
        yPos += 5;
        doc.setTextColor(80);
        const text = `${item.description}${item.link ? ` (Lien: ${item.link})` : ''}`;
        const itemDesc = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - 2 * margin);
        doc.text(itemDesc, margin + 5, yPos);
        yPos += itemDesc.length * 5 + 5;
      });
    }

    doc.save(`Bilan_FAD_${assessment.userName || 'Enseignant'}.pdf`);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass-morphism border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold text-xl shadow-lg shadow-blue-500/30">
            FAD
          </div>
          <h1 className="font-bold text-lg md:text-xl hidden sm:block">
            Positionnement Technopédagogique
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
             <input 
                type="text" 
                value={assessment.userName} 
                onChange={(e) => setAssessment({...assessment, userName: e.target.value})}
                placeholder="Votre nom..."
                className="bg-transparent border-b border-slate-300 dark:border-slate-700 focus:border-blue-500 outline-none text-right px-2 py-1 text-sm font-semibold"
              />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Enseignant(e)</span>
          </div>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Assessment Form */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
            {/* Stepper Header */}
            <div className="flex justify-between mb-8 overflow-x-auto pb-2 no-print">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex flex-col items-center gap-2 min-w-[80px] transition-all duration-300 ${
                    currentStep === idx ? 'scale-110 opacity-100' : 'opacity-40 grayscale'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${cat.color}`}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tighter">{cat.title}</span>
                </button>
              ))}
            </div>

            {/* Questions area */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="border-l-4 pl-4 border-blue-500">
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                  {CATEGORIES[currentStep].title}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                  {CATEGORIES[currentStep].description}
                </p>
              </div>

              <div className="space-y-8">
                {CATEGORIES[currentStep].questions.map((q) => (
                  <div key={q.id} className="space-y-3">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{q.text}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {q.options.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => handleAnswerChange(q.id, opt.value)}
                          className={`p-3 rounded-xl border-2 text-xs font-medium transition-all text-left flex items-start gap-2 ${
                            assessment.answers[q.id] === opt.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md ring-2 ring-blue-500/20'
                              : 'border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800'
                          }`}
                        >
                          <div className={`mt-0.5 w-3 h-3 rounded-full border-2 border-current flex-shrink-0 ${
                            assessment.answers[q.id] === opt.value ? 'bg-current' : ''
                          }`} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 no-print">
                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Réflexions personnelles</label>
                <textarea
                  value={assessment.notes[CATEGORIES[currentStep].id] || ''}
                  onChange={(e) => handleNoteChange(CATEGORIES[currentStep].id, e.target.value)}
                  placeholder="Notes, doutes ou objectifs spécifiques pour ce domaine..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-between pt-6 border-t dark:border-slate-800 no-print">
                <button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className="px-6 py-2 rounded-xl font-bold text-slate-400 disabled:opacity-20 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Précédent
                </button>
                <button
                  disabled={currentStep === CATEGORIES.length - 1}
                  onClick={() => setCurrentStep(Math.min(CATEGORIES.length - 1, currentStep + 1))}
                  className="px-8 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold shadow-lg disabled:opacity-20 transition-transform active:scale-95"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Analytics Dashboard */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 sticky top-24">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Bilan Global</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-blue-600">{globalAvg.toFixed(2)}</span>
                  <span className="text-slate-400 font-medium">/ 3.00</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-1">{persona.icon}</div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest text-center">
                  {persona.title}
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">
              "{persona.description}"
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scores} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis domain={[0, 3]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {scores.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`#${entry.color}`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 space-y-4 no-print">
               <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Progression</span>
                <span>{totalProgress}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-1000 ease-out"
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>

            {/* AI Roadmap Trigger */}
            <div className="mt-8 pt-8 border-t dark:border-slate-800 no-print">
              <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-4">
                <span>🪄</span> IA Coach Roadmap
              </h4>
              
              {roadmap.length === 0 ? (
                <button
                  onClick={handleFetchRoadmap}
                  disabled={isLoadingRoadmap || totalProgress < 10}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {isLoadingRoadmap ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Génération en cours...
                    </span>
                  ) : 'Générer mon plan d\'action personnalisé'}
                </button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  {roadmap.map((item, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <h5 className="font-bold text-sm text-blue-600 dark:text-blue-400 mb-1">{item.title}</h5>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-[10px] font-black uppercase text-blue-500 hover:underline">
                          Consulter la ressource →
                        </a>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setRoadmap([])} className="text-xs text-slate-400 hover:text-slate-600 w-full text-center">Recommencer la génération</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Persistent Footer Actions */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t dark:border-slate-800 z-40 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={handleResetAnswers}
              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              title="Réinitialiser les réponses"
            >
              🔄
            </button>
            <button 
              onClick={() => window.print()}
              className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
              title="Imprimer le bilan"
            >
              🖨️
            </button>
          </div>
          
          <button 
             onClick={handleSavePDF}
             className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95"
          >
            <span>📄</span>
            Sauvegarder mon bilan (PDF)
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
