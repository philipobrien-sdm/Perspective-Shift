export interface Trait {
  value: string;
  significance: number; // 0-10
}

export interface Persona {
  age: Trait;
  sex: Trait;
  nationality: Trait;
  profession: Trait;
  sexuality: Trait;
  religion: Trait;
  politicalView: Trait;
  other: Trait; // value is a comma-separated string
}

export interface Report {
  summary: string;
  keyInterpretations: {
    point: string;
    interpretation: string;
    reasoning: string;
  }[];
  potentialSensitivities: {
    sensitivity: string;
    potentialTrigger: string;
    severity: 'Low' | 'Medium' | 'High';
  }[];
  emotionalResponse: {
    emotion: string;
    intensity: 'Mild' | 'Moderate' | 'Strong';
    explanation: string;
  }[];
  positiveAspects: string[];
  criticalQuestions: string[];
}

export interface ComparisonReport {
  convergencePoints: {
    topic: string;
    sharedView: string;
  }[];
  divergencePoints: {
    topic: string;
    persona1View: string;
    persona2View: string;
    underlyingReason: string;
  }[];
  dialogueGuidance: {
    principle: string;
    practicalSteps: string[];
  };
}
