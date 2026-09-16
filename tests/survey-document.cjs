// Usage: pipe a JSON array of DOCX paragraph strings to this regression check.
const fs = require('node:fs');
const ts = require('typescript');
const assert = require('node:assert/strict');
function load(file) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const module = {exports:{}};
  new Function('exports','module',output)(module.exports,module);
  return module.exports;
}
const {entrySurveyQuestions,exitSurveyQuestions}=load('src/data/entry-exit-surveys.ts');
const {surveyChoiceLabel}=load('src/data/survey-choice-labels.ts');
const paragraphs=JSON.parse(fs.readFileSync(0,'utf8')).map(s=>s.trim()).filter(Boolean);
const questions=[...entrySurveyQuestions,...exitSurveyQuestions];
assert.equal(entrySurveyQuestions.length,4);assert.equal(exitSurveyQuestions.length,11);
let choices=0;
for(const q of questions){
 const start=paragraphs.indexOf(q.label);assert(start>=0,`Question not exact: ${q.label}`);
 let end=start+1;
 while(end<paragraphs.length&&!questions.some(n=>n.label===paragraphs[end])&&!['Exit Survey Questions','Old Entry Survey'].includes(paragraphs[end]))end++;
 const section=paragraphs.slice(start+1,end).filter(s=>!s.startsWith('Most of these'));
 if(q.type==='text'){assert(section.includes('Text field for user input response'));continue;}
 const expected=section.filter(s=>!s.startsWith('Other'));
 assert.deepEqual(q.options.map(surveyChoiceLabel),expected,`Options differ: ${q.key}`);
 assert.equal(Boolean(q.allowOther),section.some(s=>s.startsWith('Other')));
 choices+=expected.length;
}
assert.equal(exitSurveyQuestions.find(q=>q.key==='employmentStatus').type,'single');
assert.equal(entrySurveyQuestions.find(q=>q.key==='heardAboutWe2').type,'single');
console.log(`PASS: all 15 question labels and ${choices} answer choices match the DOCX exactly; Other inputs and single-choice types verified.`);
