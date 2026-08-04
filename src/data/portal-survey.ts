export const surveySections = [
  {
    key: 'socialMedia',
    question: 'To improve communication between IAC students, what Social Media options would you prefer?',
    options: ['LinkedIn', 'Discord', 'Reddit', 'Slack', 'Facebook', 'Twitter'],
  },
  {
    key: 'resourceTypes',
    question: 'What type of tools and resources do you prefer?',
    options: ['Fact Sheets', 'Quizzes', 'Video Tutorials'],
  },
  {
    key: 'interestAreas',
    question: 'What areas are you interested in more tools and resources?',
    options: ['Steam', 'Process Heating', 'Motors', 'Safety', 'Energy Management', 'Cybersecurity'],
  },
] as const;

export type SurveySectionKey = (typeof surveySections)[number]['key'];
