
import { Category, Persona } from './types';

export const CATEGORIES: Category[] = [
  {
    id: "elabor",
    title: "Élaboration",
    description: "Design pédagogique et conception systémique du cours.",
    color: "bg-amber-500",
    questions: [
      { id: "q1", text: "Quel modèle de design pédagogique utilisez-vous principalement (ADDIE, MISA, etc.) ?", options: [{label: "Aucun, je me base sur mon expérience en présentiel", value: 1}, {label: "Je les connais mais ne les utilise pas systématiquement", value: 2}, {label: "Je les utilise rigoureusement pour chaque conception", value: 3}] },
      { id: "q2", text: "Effectuez-vous des tests systématiques des outils technologiques choisis avant le lancement ?", options: [{label: "Rarement", value: 1}, {label: "Seulement pour les nouveaux outils", value: 2}, {label: "Oui, tests complets sur tous supports", value: 3}] },
      { id: "q3", text: "Réalisez-vous un inventaire des ressources libres (REL) avant de créer du nouveau contenu ?", options: [{label: "Non, je crée tout moi-même", value: 1}, {label: "Parfois pour gagner du temps", value: 2}, {label: "Oui, c'est une étape systématique", value: 3}] },
      { id: "q4", text: "Collaborez-vous avec une équipe multidisciplinaire (technopédagogue, graphiste, etc.) ?", options: [{label: "Non, je travaille seul", value: 1}, {label: "Ponctuellement selon les besoins", value: 2}, {label: "Oui, à chaque étape du projet", value: 3}] },
      { id: "q5", text: "Avez-vous un plan formel d'amélioration continue après chaque diffusion du cours ?", options: [{label: "Non", value: 1}, {label: "Je note les commentaires informels", value: 2}, {label: "Oui, j'ai une grille d'évaluation structurée", value: 3}] },
    ]
  },
  {
    id: "demar",
    title: "Démarche",
    description: "Alignement et variété des stratégies d'apprentissage.",
    color: "bg-sky-500",
    questions: [
      { id: "q6", text: "Comment assurez-vous l'alignement pédagogique (triple concordance) ?", options: [{label: "Je m'y fie intuitivement", value: 1}, {label: "Je vérifie les objectifs principaux", value: 2}, {label: "J'utilise une grille de concordance précise", value: 3}] },
      { id: "q7", text: "Quelle est la variété des activités proposées (lectures, quiz, forums, projets) ?", options: [{label: "Faible (principalement lectures et devoirs)", value: 1}, {label: "Moyenne (quelques activités interactives)", value: 2}, {label: "Élevée (grand éventail de formats adaptés)", value: 3}] },
      { id: "q8", text: "Offrez-vous des choix de parcours d'apprentissage aux étudiants ?", options: [{label: "Non, le parcours est unique et linéaire", value: 1}, {label: "Quelques options optionnelles", value: 2}, {label: "Plusieurs chemins d'apprentissage possibles", value: 3}] },
      { id: "q9", text: "Comment structurez-vous vos contenus numériques ?", options: [{label: "Longs blocs monolithiques", value: 1}, {label: "Découpage par chapitres classiques", value: 2}, {label: "Micro-apprentissage (ciblé et court)", value: 3}] },
      { id: "q10", text: "Les critères d'évaluation sont-ils explicitement communiqués ?", options: [{label: "Seulement pour les travaux finaux", value: 1}, {label: "Souvent, via des consignes texte", value: 2}, {label: "Toujours, via des grilles descriptives détaillées", value: 3}] },
    ]
  },
  {
    id: "organ",
    title: "Organisation",
    description: "Mise en œuvre technique et environnement numérique.",
    color: "bg-emerald-500",
    questions: [
      { id: "q11", text: "Votre plan de cours est-il spécifiquement adapté à la FAD ?", options: [{label: "C'est celui du présentiel légèrement ajusté", value: 1}, {label: "Adapté mais il manque des détails logistiques", value: 2}, {label: "Plan complet incluant délais et canaux de support", value: 3}] },
      { id: "q12", text: "Comment jugez-vous la convivialité de votre interface de cours (LMS) ?", options: [{label: "Minimaliste (liste de fichiers)", value: 1}, {label: "Fonctionnelle mais peu engageante", value: 2}, {label: "Ergonomique, visuelle et intuitive", value: 3}] },
      { id: "q13", text: "Quel est le niveau d'interactivité de vos ressources multimédias ?", options: [{label: "Statique (PDF, vidéos simples)", value: 1}, {label: "Modéré (vidéos avec chapitrage)", value: 2}, {label: "Élevé (vidéos interactives, simulateurs, podcasts)", value: 3}] },
      { id: "q14", text: "Vos choix technologiques sont-ils justifiés pédagogiquement ?", options: [{label: "J'utilise ce que l'institution propose", value: 1}, {label: "Je choisis ce qui est populaire", value: 2}, {label: "Chaque outil répond à un besoin spécifique identifié", value: 3}] },
      { id: "q15", text: "Comment équilibrez-vous le synchrone et l'asynchrone ?", options: [{label: "Principalement asynchrone", value: 1}, {label: "Mélange non planifié", value: 2}, {label: "Équilibre pensé en fonction des objectifs", value: 3}] },
    ]
  },
  {
    id: "encad",
    title: "Encadrement",
    description: "Soutien, présence et relation avec les apprenants.",
    color: "bg-fuchsia-500",
    questions: [
      { id: "q16", text: "Comment accueillez-vous les nouveaux apprenants ?", options: [{label: "Je les laisse se débrouiller avec la plateforme", value: 1}, {label: "J'envoie un courriel de bienvenue", value: 2}, {label: "Je propose une séance d'accueil structurée", value: 3}] },
      { id: "q17", text: "Prévoyez-vous une formation aux outils pour les étudiants ?", options: [{label: "Non, c'est supposé acquis", value: 1}, {label: "Je fournis quelques guides PDF", value: 2}, {label: "Oui, via des tutoriels et une phase d'essai", value: 3}] },
      { id: "q18", text: "Vos règles de nétiquette et délais de réponse sont-ils définis ?", options: [{label: "Non, au cas par cas", value: 1}, {label: "Mentionnés brièvement", value: 2}, {label: "Précisés dès le début du cours", value: 3}] },
      { id: "q19", text: "Comment soutenez-vous l'autonomie des étudiants ?", options: [{label: "Ils sont responsables de leur organisation", value: 1}, {label: "Je donne quelques conseils de gestion du temps", value: 2}, {label: "Je fournis des outils d'auto-gestion dédiés", value: 3}] },
      { id: "q20", text: "Quel est votre niveau de présence active dans le cours ?", options: [{label: "Réactif seulement (réponse aux questions)", value: 1}, {label: "Régulier (forum hebdomadaire)", value: 2}, {label: "Proactif (suivi de progression personnalisé)", value: 3}] },
    ]
  }
];

export const PERSONAS: Record<string, Persona> = {
  stratege: {
    title: "Le Stratège",
    description: "Profil hautement équilibré. Vous maîtrisez aussi bien l'aspect technique que pédagogique et humain.",
    icon: "🎯"
  },
  architecte: {
    title: "L'Architecte",
    description: "Expert en planification. Votre force réside dans le design pédagogique et la structure de vos cours.",
    icon: "🏛️"
  },
  facilitateur: {
    title: "Le Facilitateur",
    description: "L'humain est au cœur. Vous privilégiez un encadrement bienveillant et un soutien constant.",
    icon: "🤝"
  },
  explorateur: {
    title: "L'Explorateur Techno",
    description: "Maître des outils. Vous dynamisez vos cours par l'innovation et les ressources multimédias.",
    icon: "🚀"
  },
  novice: {
    title: "L'Apprenant",
    description: "Vous débutez dans le monde de la FAD. Votre curiosité est votre plus grand atout.",
    icon: "🌱"
  }
};
