import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Protected dashboard pages
import { Dashboard } from './pages/Dashboard';
import { Startups } from './pages/Startups';
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

  return (
    <BrowserRouter>
      <Routes>
        {/* Public paths */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Dashboard subpaths */}
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
  );
};
