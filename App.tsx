
import React, { useState, useCallback } from 'react';
import type { Persona, Report, ComparisonReport } from './types';
import { PersonaBuilder } from './components/PersonaBuilder';
import { ReportView } from './components/ReportView';
import { generateSinglePersonaReport, generateComparisonReport } from './services/geminiService';
import { generateAndDownloadHtmlReport } from './utils/exportUtils';
import { PlusIcon } from './components/icons/PlusIcon';
import { InfoIcon } from './components/icons/InfoIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { ExclamationIcon } from './components/icons/ExclamationIcon';
import {
  AGE_OPTIONS,
  SEX_OPTIONS,
  NATIONALITY_OPTIONS,
  PROFESSION_OPTIONS,
  SEXUALITY_OPTIONS,
  RELIGION_OPTIONS,
  POLITICAL_VIEW_OPTIONS,
} from './constants';

const initialPersona: Persona = {
  age: { value: 'Prefer not to say', significance: 1 },
  sex: { value: 'Prefer not to say', significance: 1 },
  nationality: { value: 'Prefer not to say', significance: 1 },
  profession: { value: 'Prefer not to say', significance: 1 },
  sexuality: { value: 'Prefer not to say', significance: 1 },
  religion: { value: 'Prefer not to say', significance: 1 },
  politicalView: { value: 'Prefer not to say', significance: 1 },
  other: { value: '', significance: 0 },
};

const exampleTitle = "Pineapple on Pizza?";
const exampleText = `In recent years, a small but enthusiastic culinary community has been forming in kitchens, restaurants, and online forums around the world. Calling themselves The Pineapple Pizza Appreciation Society, they are united by one simple belief: pineapple not only belongs on pizza, it improves it.

Members of the group argue that pineapple’s sweetness, when paired with the saltiness of cheese and the savory depth of tomato sauce, creates a flavor balance known as harmonious contrast. They cite similar flavor pairings in traditional cuisines, such as fruit in Moroccan tagines or apples served with pork dishes. To them, pineapple pizza is not a joke or novelty, but a genuinely enjoyable flavor profile that has been unfairly dismissed due to cultural pizza purism.

The group hosts monthly “flavor exploration nights” where participants try variations such as pineapple with smoked ham, roasted chili, or even balsamic glaze. They also share stories of how their unusual topping preference led to debates, mockery, or even friendly rivalries at family gatherings. Many see embracing pineapple pizza as an expression of individuality, playfulness, and open-mindedness.

Critics of pineapple pizza argue that fruit simply has no place on a dish rooted in Italian culinary tradition. The Society responds that cuisine has always evolved, and that creativity in food should be encouraged rather than constrained by heritage.

Whether one agrees or not, the Pineapple Pizza Appreciation Society continues to grow, fueled by curiosity, defiance of convention, and the simple joy of eating what tastes good to them.`;

const generateRandomPersona = (): Persona => {
    const getRandomMeaningful = (arr: string[]) => {
        const filtered = arr.filter(o => o !== 'Prefer not to say');
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
    const getRandomSig = () => Math.floor(Math.random() * 8) + 3; // 3-10 to be more impactful

    return {
      age: { value: getRandomMeaningful(AGE_OPTIONS), significance: getRandomSig() },
      sex: { value: getRandomMeaningful(SEX_OPTIONS), significance: getRandomSig() },
      nationality: { value: getRandomMeaningful(NATIONALITY_OPTIONS), significance: getRandomSig() },
      profession: { value: getRandomMeaningful(PROFESSION_OPTIONS), significance: getRandomSig() },
      sexuality: { value: getRandomMeaningful(SEXUALITY_OPTIONS), significance: getRandomSig() },
      religion: { value: getRandomMeaningful(RELIGION_OPTIONS), significance: getRandomSig() },
      politicalView: { value: getRandomMeaningful(POLITICAL_VIEW_OPTIONS), significance: getRandomSig() },
      other: { value: '', significance: 0 },
    };
};


const App: React.FC = () => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [persona1, setPersona1] = useState<Persona>({ ...initialPersona });
  const [persona2, setPersona2] = useState<Persona | null>(null);

  const [report1, setReport1] = useState<Report | null>(null);
  const [report2, setReport2] = useState<Report | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPersona2 = () => {
    setPersona2({ ...initialPersona });
  };

  const handleRemovePersona2 = () => {
    setPersona2(null);
    setReport2(null);
    setComparisonReport(null);
  };
  
  const setPersona2Callback = useCallback((p: Persona) => setPersona2(p), []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport1(null);
    setReport2(null);
    setComparisonReport(null);

    try {
      if (persona2) {
        const [res1, res2, compRes] = await Promise.all([
          generateSinglePersonaReport(title, text, persona1),
          generateSinglePersonaReport(title, text, persona2),
          generateComparisonReport(title, text, persona1, persona2)
        ]);
        setReport1(res1);
        setReport2(res2);
        setComparisonReport(compRes);
      } else {
        const res1 = await generateSinglePersonaReport(title, text, persona1);
        setReport1(res1);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadExample = () => {
    setTitle(exampleTitle);
    setText(exampleText);
    setPersona1(generateRandomPersona());
    setPersona2(generateRandomPersona());
  };

  const handleExport = () => {
    if (!report1 || !persona1) return;
    generateAndDownloadHtmlReport(title, text, persona1, report1, persona2, report2, comparisonReport);
  };

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark text-gray-900 dark:text-gray-100 font-sans">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-brand-primary dark:text-white">Perspective Shift</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Leveraging AI to see through someone else's eyes</p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <details className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 open:ring-2 open:ring-brand-accent transition-shadow">
          <summary className="cursor-pointer p-4 font-semibold text-lg text-brand-dark dark:text-white flex items-center justify-between list-none">
            <div className="flex items-center">
              <InfoIcon className="w-6 h-6 mr-3 text-brand-accent" />
              About This App & How to Use
            </div>
            <span className="text-sm text-gray-500 transform transition-transform duration-300 details-arrow">&#9662;</span>
          </summary>
          <div className="p-6 border-t border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            <h3 className="font-semibold text-xl mb-2 text-brand-dark dark:text-white">What is this?</h3>
            <p className="mb-4">
              Perspective Shift AI is a tool designed to help you understand how different people might interpret the same piece of text. By defining a specific persona—combining traits like nationality, profession, and political views—you can ask the Gemini AI to generate a detailed analysis from that unique point of view. It's an exercise in empathy, designed to highlight potential sensitivities, reveal different interpretations, and ultimately foster better communication.
            </p>
            <h3 className="font-semibold text-xl mb-2 text-brand-dark dark:text-white">How to use it:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Provide Content:</strong> Enter a title and the text you want to analyze in the "Content to Analyze" section. You can also click "Load Example" to start with a pre-filled text about the great pineapple-on-pizza debate.</li>
              <li><strong>Build a Persona:</strong> Use the dropdown menus and sliders to create "Perspective 1". The <strong>Significance slider</strong> (from 0 to 10) is crucial—it tells the AI how important that trait is to the person's identity. A higher number means it will more heavily influence their viewpoint.</li>
              <li><strong>(Optional) Add a Second Perspective:</strong> Click the "Add a second perspective" button to create a second persona. This will enable a comparative analysis, highlighting where the two viewpoints might converge or diverge.</li>
              <li><strong>Generate Analysis:</strong> Click the big "Generate Analysis" button. The app will send your text and persona(s) to the Gemini API and generate a detailed report. This may take a few moments.</li>
              <li><strong>Review & Export:</strong> The report will appear below. You can switch between different tabs to see the individual analyses and the comparison. If you're happy with the result, click "Export Report" to download a self-contained, interactive HTML file of the analysis.</li>
            </ol>
          </div>
        </details>
        <style>{`.details-arrow { transition: transform 0.2s; } details[open] .details-arrow { transform: rotate(180deg); }`}</style>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-brand-dark dark:text-white">Content to Analyze</h2>
                <button onClick={handleLoadExample} title="Load a sample text to try out the app" className="text-sm text-brand-accent hover:underline">Load Example</button>
             </div>
             <div className="grid grid-cols-1 gap-4">
               <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title (Optional)</label>
                  <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., A Proposal for a New Community Park" className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent"/>
               </div>
               <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Text to Analyze</label>
                  <textarea id="text" value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Paste or write the text you want to analyze here..." className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-brand-accent focus:border-brand-accent"></textarea>
               </div>
             </div>
          </div>

          <PersonaBuilder persona={persona1} setPersona={setPersona1} title="Perspective 1" />

          {persona2 ? (
            <PersonaBuilder persona={persona2} setPersona={setPersona2Callback} title="Perspective 2" onRemove={handleRemovePersona2} />
          ) : (
            <div className="text-center">
              <button onClick={handleAddPersona2} title="Add a second persona for a comparative analysis" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-brand-primary dark:text-brand-light bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-colors">
                <PlusIcon className="w-5 h-5 mr-2"/>
                Add a second perspective
              </button>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !text.trim()}
              title={!text.trim() ? "Please enter some text to analyze first" : "Generate the AI-powered analysis"}
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-full shadow-lg text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon className="w-6 h-6 mr-3" />
                  Analyzing...
                </>
              ) : (
                'Generate Analysis'
              )}
            </button>
          </div>

           {error && (
             <div className="mt-6 flex items-center justify-center bg-red-100 dark:bg-red-900/40 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md shadow-md animate-fade-in" role="alert">
                <ExclamationIcon className="w-6 h-6 mr-3 text-red-500" />
                <div>
                    <p className="font-bold">An error occurred</p>
                    <p>{error}</p>
                </div>
             </div>
            )}

          {(report1 || report2 || comparisonReport) && !isLoading && (
            <ReportView report1={report1} report2={report2} comparisonReport={comparisonReport} onExport={handleExport} />
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
