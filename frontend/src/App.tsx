import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignInSide from "./pages/SignIn/SignInSide";
import SignUp from "./pages/SignUp/SignUp";
import HomePage from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/Dashboard";
import Coach from "./pages/SignUp/Coach";
import Player from "./pages/SignUp/Player";
import Parent from "./pages/SignUp/Parent";
import PermissionsPage from "./pages/Permissions/Permissions";
import PaymentsOverview from "./pages/Payments/PaymentsOverview";
import AddProduct from "./pages/Payments/Product";
import Shop from "./pages/Payments/Shop";
import Success from "./pages/Payments/Success";
import Cancel from "./pages/Payments/Cancel";
import Transactions from "./pages/Payments/Transactions";
import CarpoolOverview from "./pages/Carpool/Carpool";
import Drivers from "./pages/Carpool/Drivers";
import PlayerRatings from "./pages/Ratings/PlayerRatings";
import PlayerStats from "./pages/Ratings/PlayerStats";
import TeamRequests from "./pages/Team/TeamRequests";
import TeamResults from "./pages/Team/TeamResults";
import ResultProfile from "./pages/Team/ResultProfile";
import Schedule from "./pages/Schedule/Schedule";
import ClubSearch from "./pages/Club/ClubSearch";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import TeamSquad from "./pages/Team/TeamSquad";
import TeamLineups from "./pages/Team/TeamLineups";
import MatchesCalendar from "./pages/Schedule/MatchesCalendar";
import MatchDetails from "./pages/Schedule/MatchDetails";
import TrainingDetails from "./pages/Schedule/TrainingDetails";
import TrainingCalendar from "./pages/Schedule/TrainingCalendar";
import Account from "./pages/Account/Account";
import Profile from "./pages/Account/Profile";
import Settings from "./pages/Account/Settings";
import { useNotification } from "./hooks/useNotification";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, loading, role } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" />; // Redirect unauthorized users
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  useNotification();
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
        path="/club-search"
        element={
          <ProtectedRoute>
            <ClubSearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permissions"
        element={
          <ProtectedRoute>
            <PermissionsPage />
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
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <PaymentsOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/products"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/shop"
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/success"
        element={
          <ProtectedRoute>
            <Success />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/cancel"
        element={
          <ProtectedRoute>
            <Cancel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carpool"
        element={
          <ProtectedRoute>
            <CarpoolOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/carpool/drivers"
        element={
          <ProtectedRoute>
            <Drivers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ratings/players"
        element={
          <ProtectedRoute>
            <PlayerRatings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ratings/players/:playerUid"
        element={
          <ProtectedRoute>
            <PlayerStats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/requests"
        element={
          <ProtectedRoute allowedRoles={["coach"]}>
            <TeamRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/squad"
        element={
          <ProtectedRoute>
            <TeamSquad />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/lineups"
        element={
          <ProtectedRoute>
            <TeamLineups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/results"
        element={
          <ProtectedRoute>
            <TeamResults />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team/results/:matchId"
        element={
          <ProtectedRoute>
            <ResultProfile />
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
        path="/schedule/matches"
        element={
          <ProtectedRoute>
            <MatchesCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule/matches/:matchId"
        element={
          <ProtectedRoute>
            <MatchDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule/training/:trainingId"
        element={
          <ProtectedRoute>
            <TrainingDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule/training"
        element={
          <ProtectedRoute>
            <TrainingCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
