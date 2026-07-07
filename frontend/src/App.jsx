import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";
import AuthPage from "./pages/Auth/AuthPage";

// ============================================
// APP — Root Router
// All pages of VentureIQ are registered here.
// We will add more routes as we build more pages.
// ============================================

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage defaultMode="login" />} />
        <Route path="/register" element={<AuthPage defaultMode="signup" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;