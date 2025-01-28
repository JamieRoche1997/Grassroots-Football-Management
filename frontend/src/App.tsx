import React from "react";
import { Routes, Route } from "react-router-dom";
import SignInSide from "./pages/SignIn/SignInSide"; 
import SignUp from "./pages/SignUp/SignUp";
import HomePage from "./pages/Home/HomePage";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdditionalInfo from "./pages/SignUp/AdditionalInfo";
import TeamStats from "./pages/Team Stats/TeamStats";
import Payments from "./pages/Payments/Payments";
import Carpool from "./pages/Carpool/Carpool";
import Feedback from "./pages/Feedback/Feedback";
import Players from "./pages/Players/Players";
import Schedule from "./pages/Schedule/Schedule";
import PlayerStats from "./pages/Player Stats/PlayerStats";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/"  element={<HomePage />} />
      <Route path="/signin" element={<SignInSide />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/additional-info" element={<AdditionalInfo/> } />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/team" element={<TeamStats />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/carpool" element={<Carpool />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/player" element={<PlayerStats/>} />
      <Route path="/players" element={<Players />} />
      <Route path="/schedule" element={<Schedule />} />
    </Routes>
  );
};

export default App;
