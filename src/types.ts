export interface GlossaryItem {
  id: string;
  term: string;
  englishTerm?: string;
  definition: string;
  douyinContext: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface CapabilityDimension {
  id: string;
  name: string;
  direction: "选对问题" | "把 AI 用出来" | "让能力扩散";
  definition: string;
  scenario: string;
  levels: {
    l1: string; // Entry (1-3)
    l2: string; // Intermediate (4-6)
    l3: string; // Master (7-9)
  };
}

export interface CaseStudy {
  level: "入门级" | "进阶级" | "精通级";
  scenario: string;
  action: string;
  highlight: string;
  takeaway: string;
}

export interface RolePathway {
  role: string;
  userStory: string;
  advantages: string[];
  shortcomings: string[];
  steps: string[];
  milestones: string[];
}

export interface DriArchetype {
  name: string;
  abilities: string;
  scenarios: string;
  description: string;
}

export interface OperationalStage {
  phase: string;
  time: string;
  objective: string;
  actions: string[];
  output: string;
  lever?: string;
}

export interface OperationalEvent {
  name: string;
  frequency: string;
  desc: string;
  details: string[];
  outcome: string;
}

// Interactive quiz types
export interface QuizQuestion {
  id: string;
  text: string;
  category: string;
  options: {
    label: string;
    score: number;
    description: string;
  }[];
}

export interface QuizResults {
  role: string;
  experience: "novice" | "intermediate" | "expert";
  scores: {
    define: number;      // 业务定义力 / 价值闭环力
    execute: number;     // 动手能力 / AI理解力
    influence: number;   // 开拓创新力 / 协作方影响力
  };
}

export interface GeneratedPath {
  summary: string;
  currentLevel: string;
  suggestedFocus: string[];
  actionItems: string[];
  recommendedResources: { title: string; type: string; link?: string }[];
}
