import { Navigate } from "react-router-dom";

const OnboardingGuard = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/welcome" replace />;
  return <Navigate to="/map" replace />;
};

export default OnboardingGuard;