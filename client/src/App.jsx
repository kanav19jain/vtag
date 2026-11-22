import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PublicContactPage from './pages/PublicContactPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/t/:tagId" element={<PublicContactPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
