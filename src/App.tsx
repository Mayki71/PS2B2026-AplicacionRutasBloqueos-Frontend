import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/auth/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import WelcomePage from "./pages/auth/WelcomePage";
import ProfilePage from "./modules/auth/components/profile/ProfilePage";
import EditProfilePage from "./modules/auth/components/profile/EditProfilePage";
import EmailVerifiedPage from "./pages/auth/EmailVerifiedPage";
import CheckEmailPage from "./pages/auth/CheckEmailPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/welcome" element={<WelcomePage />} />

        <Route path="/revisar-correo" element={<CheckEmailPage />} />
        <Route path="/verificado" element={<EmailVerifiedPage />} />

        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/perfil/editar" element={<EditProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
