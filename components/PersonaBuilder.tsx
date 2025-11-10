import React from 'react';
import type { Persona, Trait } from '../types';
import { AGE_OPTIONS, SEX_OPTIONS, NATIONALITY_OPTIONS, PROFESSION_OPTIONS, SEXUALITY_OPTIONS, RELIGION_OPTIONS, POLITICAL_VIEW_OPTIONS, TRAIT_TOOLTIPS } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ShuffleIcon } from './icons/ShuffleIcon';
import { QuestionMarkIcon } from './icons/QuestionMarkIcon';

interface PersonaBuilderProps {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  title: string;
  onRemove?: () => void;
}

const TraitInput: React.FC<{ label: string; trait: Trait; onChange: (trait: Trait) => void; options: string[]; tooltip: string; }> = ({ label, trait, onChange, options, tooltip }) => (
  <div className="flex flex-col space-y-2">
    <div className="flex items-center space-x-1.5">
        <label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span title={tooltip} className="cursor-help">
             <QuestionMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
        </span>
    </div>
    <select id={label} value={trait.value} onChange={(e) => onChange({ ...trait, value: e.target.value })} className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md">
      {options.map(option => <option key={option}>{option}</option>)}
    </select>
    <div className="flex items-center space-x-3 pt-1" title={`How much this trait defines the persona's identity (current: ${trait.significance}/10)`}>
       <span className="text-xs text-gray-500 dark:text-gray-400">Significance</span>
      <input type="range" min="0" max="10" value={trait.significance} onChange={(e) => onChange({ ...trait, significance: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
      <span className="text-sm font-semibold text-brand-primary dark:text-brand-accent w-8 text-center">{trait.significance}</span>
    </div>
  </div>
);

const OtherTraitInput: React.FC<{ label: string; trait: Trait; onChange: (trait: Trait) => void; placeholder: string; tooltip: string; }> = ({ label, trait, onChange, placeholder, tooltip }) => (
     <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-1.5">
          <label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
          <span title={tooltip} className="cursor-help">
               <QuestionMarkIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
          </span>
      </div>
      <input
        type="text"
        id={label}
        value={trait.value}
        onChange={(e) => onChange({ ...trait, value: e.target.value })}
        className="block w-full pl-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm rounded-md"
        placeholder={placeholder}
      />
       <div className="flex items-center space-x-3 pt-1" title={`How much this trait defines the persona's identity (current: ${trait.significance}/10)`}>
       <span className="text-xs text-gray-500 dark:text-gray-400">Significance</span>
      <input type="range" min="0" max="10" value={trait.significance} onChange={(e) => onChange({ ...trait, significance: parseInt(e.target.value, 10) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600" />
      <span className="text-sm font-semibold text-brand-primary dark:text-brand-accent w-8 text-center">{trait.significance}</span>
    </div>
    </div>
);


export const PersonaBuilder: React.FC<PersonaBuilderProps> = ({ persona, setPersona, title, onRemove }) => {
  const handleChange = (field: keyof Persona, value: Trait) => {
    setPersona({ ...persona, [field]: value });
  };

  const handleRandomize = () => {
    const getRandomMeaningful = (arr: string[]) => {
        const filtered = arr.filter(o => o !== 'Prefer not to say');
        return filtered[Math.floor(Math.random() * filtered.length)];
    }
    const getRandomSig = () => Math.floor(Math.random() * 8) + 3; // 3-10 to be more impactful

    setPersona({
      age: { value: getRandomMeaningful(AGE_OPTIONS), significance: getRandomSig() },
      sex: { value: getRandomMeaningful(SEX_OPTIONS), significance: getRandomSig() },
      nationality: { value: getRandomMeaningful(NATIONALITY_OPTIONS), significance: getRandomSig() },
      profession: { value: getRandomMeaningful(PROFESSION_OPTIONS), significance: getRandomSig() },
      sexuality: { value: getRandomMeaningful(SEXUALITY_OPTIONS), significance: getRandomSig() },
      religion: { value: getRandomMeaningful(RELIGION_OPTIONS), significance: getRandomSig() },
      politicalView: { value: getRandomMeaningful(POLITICAL_VIEW_OPTIONS), significance: getRandomSig() },
      other: { value: '', significance: 0 },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-brand-primary dark:text-brand-accent flex items-center">
          <UserIcon className="w-6 h-6 mr-2" />
          {title}
        </h3>
        <div className="flex items-center space-x-2">
            <button onClick={handleRandomize} title="Generate a random persona" className="text-gray-500 hover:text-brand-accent dark:hover:text-brand-accent transition-colors p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                <ShuffleIcon className="w-5 h-5" />
            </button>
            {onRemove && (
            <button onClick={onRemove} title="Remove this persona" className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                <TrashIcon className="w-5 h-5" />
            </button>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        <TraitInput label="Age" trait={persona.age} onChange={(t) => handleChange('age', t)} options={AGE_OPTIONS} tooltip={TRAIT_TOOLTIPS.age} />
        <TraitInput label="Sex" trait={persona.sex} onChange={(t) => handleChange('sex', t)} options={SEX_OPTIONS} tooltip={TRAIT_TOOLTIPS.sex} />
        <TraitInput label="Nationality" trait={persona.nationality} onChange={(t) => handleChange('nationality', t)} options={NATIONALITY_OPTIONS} tooltip={TRAIT_TOOLTIPS.nationality} />
        <TraitInput label="Profession" trait={persona.profession} onChange={(t) => handleChange('profession', t)} options={PROFESSION_OPTIONS} tooltip={TRAIT_TOOLTIPS.profession} />
        <TraitInput label="Sexuality" trait={persona.sexuality} onChange={(t) => handleChange('sexuality', t)} options={SEXUALITY_OPTIONS} tooltip={TRAIT_TOOLTIPS.sexuality} />
        <TraitInput label="Religion/Philosophy" trait={persona.religion} onChange={(t) => handleChange('religion', t)} options={RELIGION_OPTIONS} tooltip={TRAIT_TOOLTIPS.religion} />
        <TraitInput label="Political View" trait={persona.politicalView} onChange={(t) => handleChange('politicalView', t)} options={POLITICAL_VIEW_OPTIONS} tooltip={TRAIT_TOOLTIPS.politicalView} />
        <div className="md:col-span-2 lg:col-span-3">
             <OtherTraitInput label="Other Traits (comma-separated)" trait={persona.other} onChange={(t) => handleChange('other', t)} placeholder="e.g., parent, activist" tooltip={TRAIT_TOOLTIPS.other} />
        </div>
      </div>
    </div>
  );
};