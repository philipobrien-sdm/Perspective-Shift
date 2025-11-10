import React, { useState } from 'react';
import type { Report, ComparisonReport } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface ReportViewProps {
  report1: Report | null;
  report2: Report | null;
  comparisonReport: ComparisonReport | null;
  onExport: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-brand-secondary dark:text-blue-400 border-b-2 border-brand-accent pb-2 mb-3">{title}</h3>
    {children}
  </div>
);

const ReportCard: React.FC<{ report: Report }> = ({ report }) => (
  <div className="space-y-4">
    <Section title="Overall Summary">
      <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
    </Section>

    <Section title="Key Interpretations">
      <ul className="space-y-4">
        {report.keyInterpretations.map((item, index) => (
          <li key={index} className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
            <p className="font-semibold text-gray-800 dark:text-gray-100">Point: "{item.point}"</p>
            <p className="mt-1 text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Interpretation:</strong> {item.interpretation}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400"><strong className="text-gray-600 dark:text-gray-300">Reasoning:</strong> {item.reasoning}</p>
          </li>
        ))}
      </ul>
    </Section>

    <Section title="Potential Sensitivities & Triggers">
      <ul className="space-y-3">
        {report.potentialSensitivities.map((item, index) => (
          <li key={index} className={`p-3 rounded-lg flex items-start ${item.severity === 'High' ? 'bg-red-100 dark:bg-red-900/50' : item.severity === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-800/50' : 'bg-green-100 dark:bg-green-900/50'}`}>
             <span className={`mr-3 mt-1 text-xs font-bold px-2 py-0.5 rounded-full ${item.severity === 'High' ? 'bg-red-500 text-white' : item.severity === 'Medium' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'}`}>{item.severity}</span>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{item.sensitivity}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.potentialTrigger}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
    
    <Section title="Predicted Emotional Response">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.emotionalResponse.map((item, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="font-bold text-lg text-brand-primary dark:text-brand-accent">{item.emotion} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({item.intensity})</span></p>
                    <p className="text-gray-600 dark:text-gray-300">{item.explanation}</p>
                </div>
            ))}
        </div>
    </Section>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Positive Aspects">
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {report.positiveAspects.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
        </Section>

        <Section title="Critical Questions">
        <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            {report.criticalQuestions.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
        </Section>
    </div>
  </div>
);

const ComparisonCard: React.FC<{ report: ComparisonReport }> = ({ report }) => (
    <div className="space-y-4">
        <Section title="Points of Convergence">
            <div className="space-y-4">
                {report.convergencePoints.map((item, index) => (
                    <div key={index} className="p-4 bg-green-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-green-800 dark:text-green-300">{item.topic}</p>
                        <p className="text-gray-700 dark:text-gray-300">{item.sharedView}</p>
                    </div>
                ))}
            </div>
        </Section>
        <Section title="Points of Divergence">
            <div className="space-y-4">
                {report.divergencePoints.map((item, index) => (
                    <div key={index} className="p-4 bg-yellow-50 dark:bg-gray-700 rounded-lg">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-300">{item.topic}</p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400"><strong>Perspective 1:</strong> {item.persona1View}</p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400"><strong>Perspective 2:</strong> {item.persona2View}</p>
                        <p className="mt-2 text-sm font-light text-gray-500 dark:text-gray-300"><strong>Reason:</strong> {item.underlyingReason}</p>
                    </div>
                ))}
            </div>
        </Section>
        <Section title="Guidance for Respectful Dialogue">
            <div className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg">
                <p className="font-semibold text-blue-800 dark:text-blue-300">{report.dialogueGuidance.principle}</p>
                <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {report.dialogueGuidance.practicalSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
            </div>
        </Section>
    </div>
);


export const ReportView: React.FC<ReportViewProps> = ({ report1, report2, comparisonReport, onExport }) => {
  const [activeTab, setActiveTab] = useState('persona1');

  const tabs = [{ id: 'persona1', label: 'Perspective 1', available: !!report1 }];
  if (report2) tabs.push({ id: 'persona2', label: 'Perspective 2', available: true });
  if (comparisonReport) tabs.push({ id: 'comparison', label: 'Comparison & Dialogue', available: true });

  const TabButton: React.FC<{id: string, label: string}> = ({id, label}) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === id ? 'bg-brand-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
        {label}
    </button>
  );

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 dark:border-gray-600 pb-4">
        <nav className="flex space-x-2" aria-label="Tabs">
          {tabs.filter(t => t.available).map(tab => <TabButton key={tab.id} id={tab.id} label={tab.label} />)}
        </nav>
        <button
            onClick={onExport}
            title="Download the full report as an interactive HTML file"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent"
        >
            <DownloadIcon className="w-5 h-5 mr-2" />
            Export Report
        </button>
      </div>
      <div>
        {activeTab === 'persona1' && report1 && <ReportCard report={report1} />}
        {activeTab === 'persona2' && report2 && <ReportCard report={report2} />}
        {activeTab === 'comparison' && comparisonReport && <ComparisonCard report={comparisonReport} />}
      </div>
    </div>
  );
};