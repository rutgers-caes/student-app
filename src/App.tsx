import { Theme } from '@radix-ui/themes';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AssessmentMetricsPage from '@/pages/AssessmentMetricsPage/assessment-metrics-page';
import { CenterStudentsRoutePage, PeerStudentProfileRoutePage } from '@/pages/CenterStudentsPage';
import CertificateRequestPage from '@/pages/CertificateRequestPage/certificate-request-page';
import CreatePasswordPage from '@/pages/CreatePasswordPage';
import EditProfilePage from '@/pages/EditProfilePage';
import FAQPage from '@/pages/FAQPage/faq-page';
import LoginPage from '@/pages/LoginPage/login-page';
import PasswordResetPage from '@/pages/PasswordResetPage/password-reset-page';
import ProfilePage from '@/pages/ProfilePage';
import RegisterPage from '@/pages/RegisterPage/register-page';
import StudentSurveyPage from '@/pages/StudentSurvey';
import { profilePath } from '@/data/navigation';
import { queryClient } from '@/services/query-client';
import { ToastViewport } from '@/utils/ToastViewport';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme radius="medium">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/password/reset" element={<PasswordResetPage />} />
            <Route path="/account/password-setup" element={<CreatePasswordPage />} />
            <Route path={profilePath} element={<ProfilePage />} />
            <Route path="/:studentSlug/profile/detail" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/center-students" element={<CenterStudentsRoutePage />} />
            <Route path="/students/:studentId" element={<PeerStudentProfileRoutePage />} />
            <Route path="/assessments/metrics/:mode" element={<AssessmentMetricsPage />} />
            <Route path="/certificate-request" element={<CertificateRequestPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/entry-survey" element={<StudentSurveyPage kind="entry" />} />
            <Route path="/exit-survey" element={<StudentSurveyPage kind="exit" />} />
            <Route path="*" element={<Navigate to={profilePath} replace />} />
          </Routes>
        </BrowserRouter>
        <ToastViewport />
      </Theme>
    </QueryClientProvider>
  );
}

export default App;
