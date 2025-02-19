import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInSide from "./pages/SignIn/SignInSide";
import SignUp from "./pages/SignUp/SignUp";
import HomePage from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/CoachDashboard";
import Coach from "./pages/SignUp/Coach";
import Player from "./pages/SignUp/Player";
import Parent from "./pages/SignUp/Parent";
import TeamOverview from "./pages/Team/TeamOverview";
import Payments from "./pages/Payments/Payments";
import CarpoolOverview from "./pages/Carpool/Carpool";
import Drivers from "./pages/Carpool/Drivers";
import PlayerRatings from "./pages/Ratings/PlayerRatings";
import MatchRatings from "./pages/Ratings/MatchRatings";
import TeamRequests from "./pages/Team/TeamRequests";
import TeamResults from "./pages/Team/TeamResults";
import ResultProfile from "./pages/Team/ResultProfile";
import Schedule from "./pages/Schedule/Schedule";
import ClubSearch from "./pages/Club/ClubSearch";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import TeamSquad from "./pages/Team/TeamSquad";
import PlayerProfile from "./pages/Team/PlayerProfile";
import TeamLineups from "./pages/Team/TeamLineups";
import MatchesCalendar from "./pages/Schedule/MatchesCalendar";
import TrainingCalendar from "./pages/Schedule/TrainingCalendar";

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
      <Route path="/signup/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
      <Route path="/signup/player" element={<ProtectedRoute><Player /></ProtectedRoute>} />
      <Route path="/signup/parent" element={<ProtectedRoute><Parent /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/carpool" element={<ProtectedRoute><CarpoolOverview /></ProtectedRoute>} />
      <Route path="/carpool/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
      <Route path="/ratings/players" element={<ProtectedRoute><PlayerRatings /></ProtectedRoute>} />
      <Route path="/ratings/matches" element={<ProtectedRoute><MatchRatings /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute> <TeamOverview /></ProtectedRoute>} />
      <Route path="/team/requests" element={<ProtectedRoute><TeamRequests /></ProtectedRoute>} />
      <Route path="/team/squad" element={<ProtectedRoute><TeamSquad /></ProtectedRoute>} />
      <Route path="/team/squad/:playerUid" element={<ProtectedRoute><PlayerProfile /></ProtectedRoute>} />
      <Route path="/team/lineups" element={<ProtectedRoute><TeamLineups /></ProtectedRoute>} />
      <Route path="/team/results" element={<ProtectedRoute><TeamResults /></ProtectedRoute>} />
      <Route path="/team/results/:matchId" element={<ProtectedRoute><ResultProfile /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
      <Route path="/schedule/matches" element={<ProtectedRoute><MatchesCalendar /></ProtectedRoute>} />
      <Route path="/schedule/training" element={<ProtectedRoute><TrainingCalendar /></ProtectedRoute>} />
      <Route path="/club-search" element={<ProtectedRoute><ClubSearch /></ProtectedRoute>} />
    </Routes>
  );
};

export default App;