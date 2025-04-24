import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextObject";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider component. Make sure this hook is called inside the AuthProvider's scope.");
  }

  return context;
};
