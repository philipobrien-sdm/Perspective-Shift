import { GoogleGenAI, Type } from "@google/genai";
import type { Persona, Report, ComparisonReport, Trait } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const reportSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A brief overview of the persona's likely reaction." },
        keyInterpretations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    point: { type: Type.STRING, description: "A specific phrase or part of the text being interpreted." },
                    interpretation: { type: Type.STRING, description: "How the persona interprets this point." },
                    reasoning: { type: Type.STRING, description: "Why they interpret it this way based on their persona." }
                },
                required: ["point", "interpretation", "reasoning"]
            }
        },
        potentialSensitivities: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    sensitivity: { type: Type.STRING, description: "The sensitive topic or phrase." },
                    potentialTrigger: { type: Type.STRING, description: "Why it might be a trigger for this persona." },
                    severity: { type: Type.STRING, enum: ["Low", "Medium", "High"], description: "An estimation of the severity of the sensitivity." }
                },
                required: ["sensitivity", "potentialTrigger", "severity"]
            }
        },
        emotionalResponse: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    emotion: { type: Type.STRING, description: "e.g., Anger, Joy, Confusion, Inspiration" },
                    intensity: { type: Type.STRING, enum: ["Mild", "Moderate", "Strong"], description: "The intensity of the emotional reaction." },
                    explanation: { type: Type.STRING, description: "Explanation for this emotional reaction based on the persona." }
                },
                required: ["emotion", "intensity", "explanation"]
            }
        },
        positiveAspects: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of points the persona would likely agree with or find positive." },
        criticalQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Questions the persona might raise after reading the text." }
    },
    required: ["summary", "keyInterpretations", "potentialSensitivities", "emotionalResponse", "positiveAspects", "criticalQuestions"]
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        convergencePoints: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "Topic or theme of agreement." },
                    sharedView: { type: Type.STRING, description: "Description of the shared perspective between the two personas." }
                },
                required: ["topic", "sharedView"]
            }
        },
        divergencePoints: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING, description: "Topic or theme of disagreement." },
                    persona1View: { type: Type.STRING, description: "Persona 1's perspective on the topic." },
                    persona2View: { type: Type.STRING, description: "Persona 2's perspective on the topic." },
                    underlyingReason: { type: Type.STRING, description: "The core reason for their differing views, based on their backgrounds." }
                },
                required: ["topic", "persona1View", "persona2View", "underlyingReason"]
            }
        },
        dialogueGuidance: {
            type: Type.OBJECT,
            properties: {
                principle: { type: Type.STRING, description: "A core guiding principle for constructive communication between these two personas." },
                practicalSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable advice or steps for a third party to facilitate good dialogue." }
            },
            required: ["principle", "practicalSteps"]
        }
    },
    required: ["convergencePoints", "divergencePoints", "dialogueGuidance"]
};


function formatPersona(persona: Persona): string {
    const formatTrait = (trait: Trait, name: string) => 
        (trait.value && trait.value !== 'Prefer not to say') 
        ? `- ${name}: ${trait.value} (Significance: ${trait.significance}/10)` 
        : '';

    const traits = [
        formatTrait(persona.age, 'Age'),
        formatTrait(persona.sex, 'Sex'),
        formatTrait(persona.nationality, 'Nationality'),
        formatTrait(persona.profession, 'Profession'),
        formatTrait(persona.sexuality, 'Sexuality'),
        formatTrait(persona.religion, 'Religion/Philosophy'),
        formatTrait(persona.politicalView, 'Political View'),
        persona.other.value ? formatTrait(persona.other, 'Other Traits') : ''
    ].filter(Boolean).join('\n');

    return traits || "A general, neutral persona with no specific demographic traits provided.";
}

export const generateSinglePersonaReport = async (title: string, text: string, persona: Persona): Promise<Report> => {
    const prompt = `
You are an expert in sociology, psychology, and communication. Your task is to analyze the provided text from the specific perspective of a person with the following characteristics.

**Persona Details:**
${formatPersona(persona)}

**Important:** Pay close attention to the significance score (0-10) for each trait. A score of 10 means the trait is a core part of their identity and heavily influences their worldview, while a score of 0 means it is not significant at all. Your analysis MUST reflect the varying importance of these traits.

**Text to Analyze:**
Title: "${title}"
Body: "${text}"

Based *only* on the persona provided, generate a detailed report. The report must analyze how this person would likely interpret the text, identify potential sensitivities or triggers, and predict their emotional response. Adhere strictly to the provided JSON schema for your response. Do not add any explanatory text before or after the JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: reportSchema,
        },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Report;
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", response.text);
        throw new Error("The AI returned an invalid report format.");
    }
};

export const generateComparisonReport = async (title: string, text: string, persona1: Persona, persona2: Persona): Promise<ComparisonReport> => {
    const prompt = `
You are an expert in comparative sociology, conflict resolution, and intercultural communication. Your task is to analyze the same text from two different perspectives and then create a comparative report.

**Important:** For each persona, pay close attention to the significance score (0-10) for each trait. A score of 10 means the trait is a core part of their identity and heavily influences their worldview, while a score of 0 means it is not significant at all. Your analysis MUST reflect the varying importance of these traits.

**Text to Analyze:**
Title: "${title}"
Body: "${text}"

**Persona 1 Details:**
${formatPersona(persona1)}

**Persona 2 Details:**
${formatPersona(persona2)}

Your report must identify points of convergence and divergence in their interpretations. Crucially, provide actionable guidance for a third party on how to facilitate a respectful and productive dialogue between these two individuals. Adhere strictly to the provided JSON schema for your response. Do not add any explanatory text before or after the JSON object.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using a more powerful model for comparison
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: comparisonSchema,
        },
    });

     try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ComparisonReport;
    } catch (e)
{
        console.error("Failed to parse Gemini comparison response as JSON:", response.text);
        throw new Error("The AI returned an invalid comparison report format.");
    }
}