import { Theme } from '@radix-ui/themes';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import FAQPage from '@/pages/FAQPage/faq-page';
import LandingPage from '@/pages/LandingPage/landing-page';
import LoginPage from '@/pages/LoginPage/login-page';
import PortalSurvey from '@/pages/PortalSurvey/portal-survey';
import { profilePath } from '@/data/navigation';

function App() {
  return (
    <Theme radius="medium">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path={profilePath} element={<LandingPage />} />
          <Route path="/edit-profile" element={<LandingPage view="edit" />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/portal-survey" element={<PortalSurvey />} />
          <Route path="*" element={<Navigate to={profilePath} replace />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
