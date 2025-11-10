import type { Report, ComparisonReport, Persona, Trait } from '../types';

const generateStyles = () => `
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 2rem; }
  .container { max-width: 800px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 2rem; }
  h1, h2, h3 { color: #1e40af; }
  h1 { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; }
  h2 { border-bottom: 1px solid #dbeafe; padding-bottom: 0.5rem; margin-top: 2rem; }
  details { border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 1rem; }
  summary { cursor: pointer; padding: 1rem; font-weight: 600; color: #1d4ed8; background-color: #eff6ff; border-radius: 6px 6px 0 0; }
  summary:hover { background-color: #dbeafe; }
  details[open] summary { border-bottom: 1px solid #e5e7eb; }
  .content { padding: 1rem; }
  ul { padding-left: 20px; }
  li { margin-bottom: 0.5rem; }
  .severity { font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 12px; color: white; }
  .severity-High { background-color: #ef4444; }
  .severity-Medium { background-color: #f59e0b; }
  .severity-Low { background-color: #22c55e; }
  .persona-card { background-color: #f3f4f6; border: 1px solid #d1d5db; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
</style>
`;

const formatTrait = (trait: Trait, name: string) => 
    (trait.value && trait.value !== 'Prefer not to say') 
    ? `<li><strong>${name}:</strong> ${trait.value} (Significance: ${trait.significance}/10)</li>` 
    : '';

const generatePersonaHtml = (persona: Persona, title: string) => `
<div class="persona-card">
  <h3>${title}</h3>
  <ul>
    ${formatTrait(persona.age, 'Age')}
    ${formatTrait(persona.sex, 'Sex')}
    ${formatTrait(persona.nationality, 'Nationality')}
    ${formatTrait(persona.profession, 'Profession')}
    ${formatTrait(persona.sexuality, 'Sexuality')}
    ${formatTrait(persona.religion, 'Religion/Philosophy')}
    ${formatTrait(persona.politicalView, 'Political View')}
    ${persona.other.value ? formatTrait(persona.other, 'Other Traits') : ''}
  </ul>
</div>`;

const generateReportHtml = (report: Report) => `
  <details>
    <summary>Overall Summary</summary>
    <div class="content"><p>${report.summary}</p></div>
  </details>
  <details>
    <summary>Key Interpretations</summary>
    <div class="content">
      <ul>${report.keyInterpretations.map(item => `<li><strong>Point: "${item.point}"</strong><br/><em>Interpretation:</em> ${item.interpretation}<br/><em>Reasoning:</em> ${item.reasoning}</li>`).join('')}</ul>
    </div>
  </details>
  <details>
    <summary>Potential Sensitivities & Triggers</summary>
    <div class="content">
      <ul>${report.potentialSensitivities.map(item => `<li><span class="severity severity-${item.severity}">${item.severity}</span> <strong>${item.sensitivity}:</strong> ${item.potentialTrigger}</li>`).join('')}</ul>
    </div>
  </details>
  <details>
    <summary>Predicted Emotional Response</summary>
    <div class="content">
      <ul>${report.emotionalResponse.map(item => `<li><strong>${item.emotion} (${item.intensity}):</strong> ${item.explanation}</li>`).join('')}</ul>
    </div>
  </details>
  <details>
    <summary>Positive Aspects</summary>
    <div class="content"><ul>${report.positiveAspects.map(item => `<li>${item}</li>`).join('')}</ul></div>
  </details>
  <details>
    <summary>Critical Questions</summary>
    <div class="content"><ul>${report.criticalQuestions.map(item => `<li>${item}</li>`).join('')}</ul></div>
  </details>
`;

const generateComparisonHtml = (report: ComparisonReport) => `
  <details>
    <summary>Points of Convergence</summary>
    <div class="content">
      <ul>${report.convergencePoints.map(item => `<li><strong>${item.topic}:</strong> ${item.sharedView}</li>`).join('')}</ul>
    </div>
  </details>
  <details>
    <summary>Points of Divergence</summary>
    <div class="content">
      <ul>${report.divergencePoints.map(item => `<li><strong>${item.topic}</strong><br/><em>Perspective 1:</em> ${item.persona1View}<br/><em>Perspective 2:</em> ${item.persona2View}<br/><em>Reason:</em> ${item.underlyingReason}</li>`).join('')}</ul>
    </div>
  </details>
  <details>
    <summary>Guidance for Respectful Dialogue</summary>
    <div class="content">
      <p><strong>Guiding Principle:</strong> ${report.dialogueGuidance.principle}</p>
      <ul>${report.dialogueGuidance.practicalSteps.map(step => `<li>${step}</li>`).join('')}</ul>
    </div>
  </details>
`;

export const generateAndDownloadHtmlReport = (
    title: string,
    text: string,
    persona1: Persona,
    report1: Report,
    persona2: Persona | null,
    report2: Report | null,
    comparisonReport: ComparisonReport | null,
) => {
    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Perspective Shift AI Report</title>
        ${generateStyles()}
      </head>
      <body>
        <div class="container">
          <h1>Perspective Shift AI Report</h1>
          <h2>Analyzed Text</h2>
          <h3>${title || 'Untitled'}</h3>
          <p>${text.replace(/\n/g, '<br>')}</p>

          <h2>Perspective 1</h2>
          ${generatePersonaHtml(persona1, "Perspective 1 Details")}
          ${generateReportHtml(report1)}
    `;

    if (report2 && persona2) {
      html += `
          <h2>Perspective 2</h2>
          ${generatePersonaHtml(persona2, "Perspective 2 Details")}
          ${generateReportHtml(report2)}
      `;
    }

    if (comparisonReport) {
        html += `
            <h2>Comparison & Dialogue</h2>
            ${generateComparisonHtml(comparisonReport)}
        `;
    }

    html += `
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'perspective-report.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};