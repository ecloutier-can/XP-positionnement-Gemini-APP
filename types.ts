
export type Level = 1 | 2 | 3;

export interface Question {
  id: string;
  text: string;
  options: {
    label: string;
    value: Level;
  }[];
}

export interface Category {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  color: string;
}

export interface UserAssessment {
  userName: string;
  answers: Record<string, Level>;
  notes: Record<string, string>;
}

export interface Persona {
  title: string;
  description: string;
  icon: string;
}

export interface RoadmapItem {
  title: string;
  description: string;
  link?: string;
}
