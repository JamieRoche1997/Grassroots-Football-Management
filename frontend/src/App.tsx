import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInSide from "./pages/SignIn/SignInSide";
import SignUp from "./pages/SignUp/SignUp";
import HomePage from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/CoachDashboard";
import Coach from "./pages/SignUp/Coach";
import Player from "./pages/SignUp/Player";
import Parent from "./pages/SignUp/Parent";
import TeamStats from "./pages/Team Stats/TeamStats";
import Payments from "./pages/Payments/Payments";
import Carpool from "./pages/Carpool/Carpool";
import Feedback from "./pages/Feedback/Feedback";
import Players from "./pages/Players/Players";
import Schedule from "./pages/Schedule/Schedule";
import PlayerStats from "./pages/Player Stats/PlayerStats";
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
      <Route path="/signup/coach" element={<Coach />} />
      <Route path="/signup/player" element={<Player />} />
      <Route path="/signup/parent" element={<Parent />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamStats />
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
        path="/player"
        element={
          <ProtectedRoute>
            <PlayerStats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/players"
        element={
          <ProtectedRoute>
            <Players />
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
    </Routes>
  );
};

export default App;