// Preserve stored answer values. Only presentation changes to match the approved
// Entry and Exit Survey Questions.docx; no database rewrite is required.
const labels: Record<string, string> = {
  'Friend/classmate/fellow student': 'Friend/classmate/fellow Student',
  'External job board, such as Indeed': 'External job board (e.g. Indeed)',
  'Online search, such as Google': 'Online search (e.g. Google)',
  'Preliminary analysis of data in preparation for site visit': 'Preliminary analysis of data (in preparation for site visit)',
  'Analysis and documentation of assessment recommendations': "Analysis and documentation of assessment recommendations (AR's)",
  'ITAC Lead Student': 'IAC Lead Student',
  'Solving problems within constraints of time, money, and human resources': 'Solving problems within the constraints of time, money and human resources',
  'Ability to transfer outside technology to the current or future employer': 'Ability to transfer outside technology to the current (soon to be) employer',
  'Graduated - currently employed, including self-employed': 'Graduated - currently employed (including self-employed)',
  'Still working towards a degree, but accepted different position, such as a co-op position': 'Still working towards a degree, but accepted different position (e.g. a Co-Op position)',
  'Yes, received a reference from ITAC program client': 'Yes, received a reference from IAC program client',
  'Government (federal, state, or local)': 'Government (federal, state, local)',
  'Self-employed, such as consultant': 'Self-employed (e.g. as a consultant)',
};

export const surveyChoiceLabel = (value: string): string => labels[value] ?? value;
