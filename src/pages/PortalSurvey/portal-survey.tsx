import { FormEvent, useState } from 'react';
import { Button, Checkbox, TextArea, TextField } from '@radix-ui/themes';
import { ClipboardCheck, Send } from 'lucide-react';
import { AppNavbar } from '@/components/AppNavbar';
import { surveySections, type SurveySectionKey } from '@/data/portal-survey';

type SurveyAnswers = Record<SurveySectionKey, string[]> & {
  other: Record<SurveySectionKey, string>;
  additionalTools: string;
};

const emptyAnswers: SurveyAnswers = {
  socialMedia: [],
  resourceTypes: [],
  interestAreas: [],
  other: {
    socialMedia: '',
    resourceTypes: '',
    interestAreas: '',
  },
  additionalTools: '',
};

export default function PortalSurvey() {
  const [answers, setAnswers] = useState<SurveyAnswers>(emptyAnswers);
  const [submitted, setSubmitted] = useState(false);

  function toggleOption(section: SurveySectionKey, option: string, checked: boolean) {
    setSubmitted(false);
    setAnswers((current) => ({
      ...current,
      [section]: checked ? [...current[section], option] : current[section].filter((item) => item !== option),
    }));
  }

  function updateOther(section: SurveySectionKey, value: string) {
    setSubmitted(false);
    setAnswers((current) => ({
      ...current,
      other: {
        ...current.other,
        [section]: value,
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log('Portal Survey Answers', answers);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <AppNavbar />
      <main className="mx-auto w-full max-w-[1180px] px-5 py-8">
        <form className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm" onSubmit={handleSubmit}>
          <header className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-doe-blue">
                <ClipboardCheck aria-hidden="true" size={22} />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Student Portal</p>
                <h1 className="text-2xl font-semibold text-slate-950">Portal Survey</h1>
              </div>
            </div>
          </header>

          <div className="divide-y divide-slate-200">
            {surveySections.map((section) => (
              <section className="grid min-h-[150px] grid-cols-1 md:grid-cols-[minmax(320px,48%)_minmax(0,1fr)]" key={section.key}>
                <div className="border-b border-slate-200 px-6 py-5 md:border-b-0 md:border-r">
                  <h2 className="text-xl font-medium leading-relaxed text-slate-950">{section.question}</h2>
                </div>
                <div className="grid content-start gap-3 px-6 py-5">
                  <div className="grid gap-x-7 gap-y-2 sm:grid-cols-2">
                    {section.options.map((option) => (
                      <label
                        className="flex min-h-8 cursor-pointer items-center gap-3 text-xl font-normal text-slate-800"
                        key={option}
                      >
                        <Checkbox
                          checked={answers[section.key].includes(option)}
                          onCheckedChange={(checked) => toggleOption(section.key, option, checked === true)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

                  <label className="grid items-center gap-3 sm:grid-cols-[80px_minmax(0,1fr)]">
                    <span className="text-xl font-normal text-slate-800">Other</span>
                    <TextField.Root size="2" value={answers.other[section.key]} onChange={(event) => updateOther(section.key, event.target.value)} />
                  </label>
                </div>
              </section>
            ))}

            <section className="px-6 py-5">
              <label className="block">
                <span className="mb-3 block text-lg font-semibold text-slate-950">
                  What additional tools and/or resources would you like have in the IAC Student Portal?
                </span>
                <TextArea
                  className="min-h-[110px]"
                  value={answers.additionalTools}
                  onChange={(event) => {
                    setSubmitted(false);
                    setAnswers((current) => ({ ...current, additionalTools: event.target.value }));
                  }}
                />
              </label>
            </section>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4">
            <p className={submitted ? 'text-sm font-semibold text-green-700' : 'text-sm font-medium text-slate-500'}>
              {submitted ? 'Survey answers logged in the console.' : 'Select every option that applies.'}
            </p>
            <Button color="blue" size="3" type="submit">
              <Send aria-hidden="true" size={18} />
              Submit Portal Survey
            </Button>
          </footer>
        </form>
      </main>
    </div>
  );
}
