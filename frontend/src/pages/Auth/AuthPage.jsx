import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ============================================
// AUTH PAGE — Login & Registration
// Modern off-axis design, interactive role toggles,
// glassmorphism card, glowing parallax background,
// dark/light mode responsive.
// ============================================

export default function AuthPage({ defaultMode = "login" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(defaultMode); // "login" or "signup"
  const [role, setRole] = useState("founder");    // "founder" or "investor"
  const [dark, setDark] = useState(true);

  // Sync theme status
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark") || !document.documentElement.classList.contains("light"));
    const obs = new MutationObserver(() => {
      setDark(!document.documentElement.classList.contains("light"));
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // Form states
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");

  const handleAuth = (e) => {
    e.preventDefault();

    if (mode === "signup") {
      // 1. Full name taken check
      if (name.toLowerCase().trim() === "arjun sharma") {
        setError("Full name 'Arjun Sharma' is already taken.");
        return;
      }

      // 2. Company / Fund name taken check
      const takenCompanies = ["growbazaar", "dhanmetrics", "quickroom"];
      const takenFunds = ["elevation partners", "sequoia india"];
      const companyClean = company.toLowerCase().trim();

      if (role === "founder" && takenCompanies.includes(companyClean)) {
        setError(`Startup name '${company}' is already registered on VentureIQ.`);
        return;
      }
      if (role === "investor" && takenFunds.includes(companyClean)) {
        setError(`Investment Fund '${company}' is already registered.`);
        return;
      }

      // 3. Password length check
      if (pass.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      // 4. Password contains number check
      if (!/\d/.test(pass)) {
        setError("Password must contain at least one number.");
        return;
      }

      // 5. Password contains special character check
      if (/^[a-zA-Z0-9]*$/.test(pass)) {
        setError("Password must contain at least one special character.");
        return;
      }

      // 6. Password match check
      if (pass !== confirmPass) {
        setError("Passwords do not match!");
        return;
      }
    }

    setError("");
    // Redirect to respective dashboard mock-up based on role choice
    if (role === "founder") {
      navigate("/founder-dashboard");
    } else {
      navigate("/investor-dashboard");
    }
  };

  const bg = dark ? "#0A0F1E" : "#F8FAFC";
  const cardBg = dark ? "rgba(255, 255, 255, 0.01)" : "rgba(255, 255, 255, 0.20)";
  const border = dark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)";
  const textCol = dark ? "#F8FAFC" : "#0F172A";
  const mutedCol = dark ? "#94A3B8" : "#64748B";
  const inputBg = dark ? "#0A0F1E" : "#F8FAFC";
  const activeColor = role === "founder" ? "#2563EB" : "#0EA5E9";

  const inpStyle = (name) => ({
    width: "100%", padding: "13px 16px",
    background: inputBg,
    border: `1.5px solid ${focused === name ? activeColor : border}`,
    borderRadius: 10, color: textCol,
    fontFamily: "Inter, sans-serif", fontSize: 14,
    outline: "none", transition: "all 0.22s ease",
    boxShadow: focused === name ? `0 0 0 3px ${activeColor}22` : "none",
  });

  return (
    <div style={{
      minHeight: "100vh", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
      padding: "40px 20px", transition: "background 0.4s ease",
    }}>
      {/* Background blobs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-10%",
          width: 500, height: 500,
          background: dark ? "radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 60%)" : "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 60%)",
          animation: "blob1 20s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", right: "-10%",
          width: 500, height: 500,
          background: dark ? "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 60%)" : "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 60%)",
          animation: "blob2 25s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
      </div>

      {/* Floating Logo Link */}
      <a href="/" style={{
        position: "absolute", top: 24, left: 24, zIndex: 10,
        display: "flex", alignItems: "center", gap: 9, textDecoration: "none",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: "var(--grad)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 15, fontWeight: 900, color: "#fff", fontFamily: "Space Grotesk",
        }}>V</div>
        <span style={{ fontSize: 17, fontWeight: 800, color: textCol, fontFamily: "Space Grotesk", letterSpacing: -0.5 }}>VentureIQ</span>
      </a>

      {/* Main card wrapper */}
      <div style={{
        width: "100%", maxWidth: "460px", background: cardBg,
        border: `1px solid ${border}`, borderRadius: 24,
        padding: "44px 36px", zIndex: 5,
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.4)" : "0 24px 80px rgba(37,99,235,0.07)",
        transition: "all 0.4s ease",
      }}>
        {/* Toggle Mode */}
        <div style={{ display: "flex", gap: 20, marginBottom: 32, borderBottom: `1px solid ${border}`, paddingBottom: 12 }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "4px 0", fontSize: 16, fontWeight: 700,
                color: mode === m ? textCol : mutedCol,
                position: "relative", transition: "color 0.2s",
                fontFamily: "Space Grotesk",
              }}
            >
              {m === "login" ? "Login" : "Register"}
              {mode === m && (
                <div style={{
                  position: "absolute", bottom: -13, left: 0, right: 0,
                  height: 2, background: activeColor, borderRadius: 100,
                  transition: "background 0.2s",
                }} />
              )}
            </button>
          ))}
        </div>

        {/* Form header */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: textCol, marginBottom: 8, fontFamily: "Space Grotesk" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ fontSize: 13, color: mutedCol, marginBottom: 28 }}>
          {mode === "login"
            ? "Enter your credentials to access your intelligence dashboard."
            : "Choose your role below and complete the setup parameters."}
        </p>

        {error && (
          <div style={{
            padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444",
            fontSize: 12, fontWeight: 600, marginBottom: 20,
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Role selector for Registration */}
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.8px" }}>SELECT ROLE</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {["founder", "investor"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    style={{
                      padding: "12px", borderRadius: 10, cursor: "pointer",
                      border: `1.5px solid ${role === r ? (r === "founder" ? "#2563EB" : "#0EA5E9") : border}`,
                      background: role === r ? (r === "founder" ? "rgba(37,99,235,0.08)" : "rgba(14,165,233,0.08)") : "transparent",
                      color: role === r ? textCol : mutedCol,
                      fontWeight: 600, fontSize: 13,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {r === "founder" ? "Founder" : "Investor"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 6, letterSpacing: "0.8px" }}>FULL NAME</label>
              <input required type="text" placeholder="Arjun Sharma" style={inpStyle("name")} value={name} onChange={e => setName(e.target.value)}
                onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 6, letterSpacing: "0.8px" }}>EMAIL ADDRESS</label>
            <input required type="email" placeholder="arjun@startup.in" style={inpStyle("email")} value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused("email")} onBlur={() => setFocused("")} />
          </div>

          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 6, letterSpacing: "0.8px" }}>
                {role === "founder" ? "STARTUP NAME" : "FUND NAME"}
              </label>
              <input required type="text" placeholder={role === "founder" ? "LogiSense AI" : "Elevation Partners"} style={inpStyle("company")} value={company} onChange={e => setCompany(e.target.value)}
                onFocus={() => setFocused("company")} onBlur={() => setFocused("")} />
            </div>
          )}

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, letterSpacing: "0.8px" }}>PASSWORD</label>
              {mode === "login" && (
                <a href="#" style={{ fontSize: 11, color: activeColor, textDecoration: "none", fontWeight: 600 }}>Forgot?</a>
              )}
            </div>
            <input required type="password" placeholder="••••••••" style={inpStyle("pass")} value={pass} onChange={e => setPass(e.target.value)}
              onFocus={() => setFocused("pass")} onBlur={() => setFocused("")} />
          </div>

          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 6, letterSpacing: "0.8px" }}>CONFIRM PASSWORD</label>
              <input required type="password" placeholder="••••••••" style={inpStyle("confirmPass")} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                onFocus={() => setFocused("confirmPass")} onBlur={() => setFocused("")} />
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%", padding: "14px", background: activeColor,
              color: "#fff", fontSize: 14, fontWeight: 700, borderRadius: 12, border: "none",
              cursor: "pointer", fontFamily: "Inter", letterSpacing: 0.2,
              boxShadow: `0 6px 20px ${activeColor}33`,
              transition: "all 0.22s ease",
              marginTop: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 30px ${activeColor}44`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 6px 20px ${activeColor}33`; }}
          >
            {mode === "login" ? "Login" : "Register"}
          </button>
        </form>

        {/* Toggle Mode footer */}
        <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: mutedCol }}>
          {mode === "login" ? (
            <span>Don't have an account? <button onClick={() => setMode("signup")} style={{ background: "none", border: "none", cursor: "pointer", color: activeColor, fontWeight: 600, padding: 0 }}>Register</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: activeColor, fontWeight: 600, padding: 0 }}>Login</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
