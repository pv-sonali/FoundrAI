import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuthStore } from './store/authStore';

// Router components
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsConditions } from './pages/TermsConditions';

// Protected dashboard pages
import { Dashboard } from './pages/Dashboard';
import { Startups } from './pages/Startups';
import { Onboarding } from './pages/Onboarding';
import { IdeaValidator } from './pages/IdeaValidator';
import { MarketResearch } from './pages/MarketResearch';
import { CompetitorIntelligence } from './pages/CompetitorIntelligence';
import { BusinessModelCanvas } from './pages/BusinessModelCanvas';
import { MVPPlanner } from './pages/MVPPlanner';
import { PitchDeckGenerator } from './pages/PitchDeckGenerator';
import { FundingHub } from './pages/FundingHub';
import { AIMentor } from './pages/AIMentor';
import { RiskAnalyzer } from './pages/RiskAnalyzer';
import { Settings } from './pages/Settings';
import { AdminPanel } from './pages/AdminPanel';

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      '/': 'FoundrAI | Build Your Startup with AI',
      '/login': 'Login | FoundrAI',
      '/register': 'Register | FoundrAI',
      '/forgot-password': 'Reset Password | FoundrAI',
      '/verify-email': 'Verify Email | FoundrAI',
      '/privacy': 'Privacy Policy | FoundrAI',
      '/terms': 'Terms & Conditions | FoundrAI',
      '/dashboard': 'Dashboard | FoundrAI',
      '/onboarding': 'Onboarding | FoundrAI',
      '/startups': 'My Startups | FoundrAI',
      '/idea-validator': 'Idea Validator | FoundrAI',
      '/market-research': 'Market Research | FoundrAI',
      '/competitor-intelligence': 'Competitor Grid | FoundrAI',
      '/business-model': 'Business Canvas | FoundrAI',
      '/mvp-planner': 'MVP Planner | FoundrAI',
      '/pitch-deck': 'Pitch Deck Generator | FoundrAI',
      '/funding-hub': 'Funding Hub | FoundrAI',
      '/ai-mentor': 'AI Mentor | FoundrAI',
      '/risk-analyzer': 'Risk Analyzer | FoundrAI',
      '/settings': 'Settings | FoundrAI',
      '/admin-panel': 'Admin Cockpit | FoundrAI',
    };

    const title = routeTitles[location.pathname] || 'FoundrAI | Build Your Startup with AI';
    document.title = title;
  }, [location.pathname]);

  return null;
};

export const App: React.FC = () => {
  const { initAuth, loading } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-gold">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent border-gold"></div>
      </div>
    );
  }

const FallbackComponent = ({ error, resetErrorBoundary }: any) => (
  <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white p-4">
    <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
    <pre className="text-xs bg-red-950/20 text-red-400 p-4 rounded-custom border border-red-900 max-w-2xl overflow-auto mb-6">
      {error.message}
    </pre>
    <button
      onClick={resetErrorBoundary}
      className="px-6 py-2 bg-gold text-black font-bold rounded-custom hover:bg-gold-hover transition-colors"
    >
      Try Again
    </button>
  </div>
);

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <BrowserRouter>
        <PageTitleUpdater />
        <Routes>
          {/* Public paths */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />

          {/* Dashboard subpaths */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/startups"
            element={
              <ProtectedRoute>
                <Layout>
                  <Startups />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/idea-validator"
            element={
              <ProtectedRoute>
                <Layout>
                  <IdeaValidator />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/market-research"
            element={
              <ProtectedRoute>
                <Layout>
                  <MarketResearch />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/competitor-intelligence"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompetitorIntelligence />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-model"
            element={
              <ProtectedRoute>
                <Layout>
                  <BusinessModelCanvas />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mvp-planner"
            element={
              <ProtectedRoute>
                <Layout>
                  <MVPPlanner />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/pitch-deck"
            element={
              <ProtectedRoute>
                <Layout>
                  <PitchDeckGenerator />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/funding-hub"
            element={
              <ProtectedRoute>
                <Layout>
                  <FundingHub />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-mentor"
            element={
              <ProtectedRoute>
                <Layout>
                  <AIMentor />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/risk-analyzer"
            element={
              <ProtectedRoute>
                <Layout>
                  <RiskAnalyzer />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Administrator cockpit */}
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Layout>
                    <AdminPanel />
                  </Layout>
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          {/* Catchall redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
