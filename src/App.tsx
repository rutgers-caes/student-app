import { Theme } from '@radix-ui/themes';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CertificateRequestPage from '@/pages/CertificateRequestPage/certificate-request-page';
import FAQPage from '@/pages/FAQPage/faq-page';
import LandingPage from '@/pages/LandingPage/landing-page';
import LoginPage from '@/pages/LoginPage/login-page';
import PasswordResetPage from '@/pages/PasswordResetPage/password-reset-page';
import PortalSurvey from '@/pages/PortalSurvey/portal-survey';
import RegisterPage from '@/pages/RegisterPage/register-page';
import { profilePath } from '@/data/navigation';

function App() {
  return (
    <Theme radius="medium">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/password/reset" element={<PasswordResetPage />} />
          <Route path={profilePath} element={<LandingPage />} />
          <Route path="/edit-profile" element={<LandingPage view="edit" />} />
          <Route path="/center-students" element={<LandingPage view="center-students" />} />
          <Route path="/students/:studentId" element={<LandingPage view="student-profile" />} />
          <Route path="/certificate-request" element={<CertificateRequestPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/portal-survey" element={<PortalSurvey />} />
          <Route path="*" element={<Navigate to={profilePath} replace />} />
        </Routes>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
