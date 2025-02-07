import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInSide from "./pages/SignIn/SignInSide";
import SignUp from "./pages/SignUp/SignUp";
import HomePage from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/CoachDashboard";
import Coach from "./pages/SignUp/Coach";
import Player from "./pages/SignUp/Player";
import Parent from "./pages/SignUp/Parent";
import Statistics from "./pages/Statistics/Statistics";
import Payments from "./pages/Payments/Payments";
import Carpool from "./pages/Carpool/Carpool";
import Feedback from "./pages/Feedback/Feedback";
import TeamRequests from "./pages/Team/TeamRequests";
import Schedule from "./pages/Schedule/Schedule";
import ClubSearch from "./pages/Club/ClubSearch";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signin" element={<SignInSide />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Protected Routes */}
      <Route
        path="/signup/coach"
        element={
          <ProtectedRoute>
            <Coach />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup/player"
        element={
          <ProtectedRoute>
            <Player />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signup/parent"
        element={
          <ProtectedRoute>
            <Parent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carpool"
        element={
          <ProtectedRoute>
            <Carpool />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/requests"
        element={
          <ProtectedRoute>
            <TeamRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <Schedule />
          </ProtectedRoute>
        }
      />
      <Route
        path="/club-search"
        element={
          <ProtectedRoute>
            <ClubSearch />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;