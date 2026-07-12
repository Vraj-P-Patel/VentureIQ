import { useState, useEffect, useRef } from "react";

/* ── Scroll-reveal hook ── */
function useSR(threshold = 0.12) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("on"); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

/* ── Animated counter ── */
function useCounter(target, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let cur = 0; const step = Math.ceil(target / 60);
    const id = setInterval(() => {
      cur += step; if (cur >= target) { setVal(target); clearInterval(id); } else setVal(cur);
    }, 20);
    return () => clearInterval(id);
  }, [start, target]);
  return val;
}

/* ─────────────────────────────────────
   NAVBAR
───────────────────────────────────── */
const NAV = [
  { id: "home",     label: "Home"     },
  { id: "about",    label: "About"    },
  { id: "features", label: "Features" },
  { id: "contact",  label: "Contact"  },
];

function Navbar({ dark, setDark }) {
  const [scrolled, setScrolled] = useState(false);
  const [active,   setActive]   = useState("home");
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      const ids = ["home","about","features","contact"];
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= 100) { setActive(ids[i]); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled ? (dark ? "rgba(10,15,30,0.85)" : "rgba(248,250,252,0.85)") : "transparent",
      backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
      borderBottom: scrolled ? `1px solid ${dark ? "#1E293B" : "#E2E8F0"}` : "1px solid transparent",
      transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <div className="wrap" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <a href="#home" onClick={e => go(e,"home")} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: "var(--grad)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "Space Grotesk",
            boxShadow: "0 4px 20px var(--glow-blue)",
          }}>V</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", fontFamily: "Space Grotesk, sans-serif", letterSpacing: -0.5 }}>
            Venture<span style={{ color: "#60A5FA" }}>IQ</span>
          </span>
        </a>

        {/* Links */}
        <ul style={{ display: "flex", gap: 2, listStyle: "none", padding: 0 }} id="nav-links">
          {NAV.map(n => {
            const isActive = active === n.id;
            return (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={e => go(e, n.id)} style={{
                  display: "block", padding: "7px 14px",
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#60A5FA" : "var(--text-2)",
                  textDecoration: "none", borderRadius: 8,
                  background: isActive ? "rgba(96,165,250,0.10)" : "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = "var(--text-2)"; }}>
                  {n.label}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setDark(!dark)} style={{
            width: 36, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
            background: dark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)",
            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>{dark ? "☀️" : "🌙"}</button>

          <a href="/login" style={{
            padding: "9px 16px", color: "var(--text-2)",
            fontSize: 13, fontWeight: 600, borderRadius: 9, textDecoration: "none",
            transition: "all 0.22s ease",
            fontFamily: "Inter, sans-serif",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; }}>
            Login
          </a>

          <a href="/register" style={{
            padding: "9px 22px", background: "var(--grad)", color: "#fff",
            fontSize: 13, fontWeight: 600, borderRadius: 9, textDecoration: "none",
            boxShadow: "0 4px 16px var(--glow-blue)", transition: "all 0.22s ease",
            fontFamily: "Inter, sans-serif", letterSpacing: 0.2,
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px var(--glow-blue)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 16px var(--glow-blue)"; e.currentTarget.style.transform = "none"; }}>
            Register
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) { #nav-links { display: none !important; } }
      `}</style>
    </nav>
  );
}

/* ─────────────────────────────────────
   HERO
───────────────────────────────────── */
function Hero({ dark }) {
  const r1 = useSR(0.01);
  const r2 = useSR(0.01);
  const r3 = useSR(0.01);
  const bg = dark ? "#0A0F1E" : "#F8FAFC";

  return (
    <section id="home" style={{
      minHeight: "100dvh", background: bg,
      display: "flex", alignItems: "center",
      position: "relative", overflow: "hidden",
      paddingTop: 64, transition: "background 0.4s ease",
    }}>
      {/* Blobs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="interactive-blob" style={{
          position: "absolute", top: "8%", left: "-12%",
          width: 680, height: 680,
          background: dark
            ? "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 60%)",
          animation: "blob1 18s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
        <div className="interactive-blob" style={{
          position: "absolute", bottom: "5%", right: "-10%",
          width: 560, height: 560,
          background: dark
            ? "radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 60%)",
          animation: "blob2 22s ease-in-out infinite",
          filter: "blur(50px)",
        }} />
        <div className="interactive-blob" style={{
          position: "absolute", top: "55%", left: "45%",
          width: 300, height: 300,
          background: dark
            ? "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 60%)"
            : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)",
          animation: "blob3 12s ease-in-out infinite",
          filter: "blur(30px)",
        }} />
        {/* Top-centered soft gradient aura */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: "100%", maxWidth: "1200px", height: "60%",
          background: dark
            ? "radial-gradient(ellipse at top, rgba(37,99,235,0.38) 0%, rgba(99,102,241,0.20) 45%, transparent 75%)"
            : "radial-gradient(ellipse at top, rgba(37,99,235,0.48) 0%, rgba(99,102,241,0.28) 45%, transparent 75%)",
          pointerEvents: "none",
          filter: "blur(20px)",
        }} />
        {/* Dotted Matrix Grid Pattern */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: dark
            ? "radial-gradient(rgba(96,165,250,0.12) 1.2px, transparent 1.2px)"
            : "radial-gradient(rgba(37,99,235,0.07) 1.2px, transparent 1.2px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(circle 800px at center, black, transparent)",
          WebkitMaskImage: "radial-gradient(circle 800px at center, black, transparent)",
          opacity: 0.85,
          pointerEvents: "none",
        }} />
      </div>

      <div className="wrap" style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "80px clamp(20px,5vw,60px)" }}>

        {/* Badge */}
        <div ref={r1} className="sr" style={{ marginBottom: 28, display: "inline-block", animation: "floatBadge 3s ease-in-out infinite" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 18px", borderRadius: 100,
            background: dark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.06)",
            border: "1px solid rgba(37,99,235,0.30)",
            fontSize: 12, fontWeight: 700, color: "#60A5FA",
            letterSpacing: "1.5px", textTransform: "uppercase",
            backdropFilter: "blur(8px)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60A5FA", boxShadow: "0 0 8px #60A5FA", display: "block" }} />
            AI-Powered Startup Intelligence · India
          </span>
        </div>

        {/* Headline */}
        <div ref={r2} className="sr sr-d1">
          <h1 style={{
            fontSize: "clamp(44px, 7.5vw, 96px)",
            fontWeight: 900,
            fontFamily: "Space Grotesk, sans-serif",
            lineHeight: 0.98,
            letterSpacing: "-3px",
            color: "var(--text)",
            margin: "0 auto 28px",
            maxWidth: 860,
            transition: "color 0.4s",
          }}>
            Where India's best<br />
            startups meet<br />
            <span className="grad-text" style={{ display: "inline-block" }}>
              the right capital.
            </span>
          </h1>
        </div>

        {/* Sub */}
        <div ref={r3} className="sr sr-d2">
          <p style={{
            fontSize: "clamp(16px, 1.8vw, 20px)",
            color: "var(--text-2)", lineHeight: 1.75,
            maxWidth: 520, margin: "0 auto 52px",
            fontWeight: 400, transition: "color 0.4s",
          }}>
            VentureIQ scores your startup with AI trained on 8,000 real Indian startups — and connects you with the investors who will actually fund you.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
            <a href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "16px 36px",
              background: "var(--grad)", color: "#fff",
              fontSize: 15, fontWeight: 700, borderRadius: 12,
              textDecoration: "none", letterSpacing: 0.2,
              boxShadow: "0 8px 32px var(--glow-blue)",
              transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              fontFamily: "Inter, sans-serif",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.02)"; e.currentTarget.style.boxShadow = "0 16px 48px var(--glow-blue)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 32px var(--glow-blue)"; }}>
              Get your AI score free
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#about" onClick={e => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "15px 30px",
              background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
              border: dark ? "1px solid rgba(255,255,255,0.10)" : "1px solid rgba(0,0,0,0.10)",
              backdropFilter: "blur(10px)", color: "var(--text-2)",
              fontSize: 15, fontWeight: 600, borderRadius: 12, textDecoration: "none",
              transition: "all 0.22s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-2)"; e.currentTarget.style.borderColor = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"; }}>
              See how it works
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "var(--text-muted)" }}>
        <div style={{ width: 24, height: 40, borderRadius: 12, border: "1.5px solid currentColor", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "6px 0" }}>
          <div style={{ width: 4, height: 8, borderRadius: 2, background: "#60A5FA", animation: "scrollDot 1.6s ease-in-out infinite" }} />
        </div>
      </div>

      <style>{`
        @keyframes scrollDot {
          0%,100% { transform: translateY(0); opacity: 1; }
          50%      { transform: translateY(12px); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────
   ABOUT
───────────────────────────────────── */
function StatCard({ value, rawNum, label, dark, delay }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const count = useCounter(rawNum || 0, started && !!rawNum);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("on"); setStarted(true); obs.unobserve(el); }
    }, { threshold: 0.3 });
    obs.observe(el); return () => obs.disconnect();
  }, []);

  const display = rawNum ? (value.includes("$") ? `$${count}B` : count.toLocaleString()) : value;

  return (
    <div ref={ref} className="sr" style={{ transitionDelay: delay, textAlign: "center" }}>
      <div style={{
        fontSize: "clamp(34px,4.5vw,56px)", fontWeight: 900,
        fontFamily: "Space Grotesk", letterSpacing: -2, lineHeight: 1,
        background: "var(--grad)", WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent", backgroundClip: "text",
        marginBottom: 6,
      }}>
        {display}
      </div>
      <div style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
    </div>
  );
}


function About({ dark }) {
  const rHead = useSR();
  const bg = dark ? "#0D1526" : "#EFF2F8";

  const cards = [
    { icon: "⚡", color: "#60A5FA", title: "What is VentureIQ?",
      text: "An AI platform that scores Indian startups across market fit, team strength, traction, and financials — predicting funding success before investors even see your pitch." },
    { icon: "🎯", color: "#818CF8", title: "Why we built it",
      text: "India has 100,000+ startups but most die without ever meeting the right investor. We analyzed 8,000 real journeys to build a model that changes that." },
    { icon: "🔬", color: "#34D399", title: "What makes us different",
      text: "We don't guess. Our ML model was trained on 8,000 startups across 10 industries. Every score comes with a breakdown you can act on immediately." },
  ];

  return (
    <section id="about" style={{
      background: bg, padding: "140px 0", transition: "background 0.4s ease",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs for premium depth */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="interactive-blob" style={{
          position: "absolute", top: "15%", left: "-10%",
          width: 500, height: 500,
          background: dark ? "radial-gradient(circle, rgba(37,99,235,0.38) 0%, transparent 60%)" : "radial-gradient(circle, rgba(37,99,235,0.48) 0%, transparent 60%)",
          animation: "blob1 20s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
        <div className="interactive-blob" style={{
          position: "absolute", bottom: "10%", right: "-10%",
          width: 500, height: 500,
          background: dark ? "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 60%)" : "radial-gradient(circle, rgba(99,102,241,0.28) 0%, transparent 60%)",
          animation: "blob2 25s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
      </div>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div ref={rHead} className="sr" style={{ marginBottom: 72 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 2, background: "var(--grad)", borderRadius: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#60A5FA" }}>About VentureIQ</span>
          </div>
          <h2 style={{
            fontSize: "clamp(32px,5vw,60px)", fontWeight: 900,
            fontFamily: "Space Grotesk", letterSpacing: -2.5, lineHeight: 1.05,
            color: "var(--text)", maxWidth: 620, transition: "color 0.4s",
          }}>
            Built on data.<br />
            <span className="grad-text">Not guesswork.</span>
          </h2>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginBottom: 80 }}>
          {cards.map((c, i) => (
            <AboutCard key={c.title} c={c} dark={dark} delay={`${i * 0.12}s`} />
          ))}
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 0, background: dark ? "#1E293B22" : "rgba(0,0,0,0.04)",
          border: dark ? "1px solid #1E293B" : "1px solid #E2E8F0",
          borderRadius: 20, overflow: "hidden",
        }}>
          {[
            { value: "8,000",  rawNum: 8000,  label: "Startups Analyzed" },
            { value: "5,143",  rawNum: 5143,  label: "Successful Outcomes" },
            { value: "10",     rawNum: 10,    label: "Industries Covered" },
            { value: "$286B",  rawNum: 286,   label: "Funding Tracked" },
          ].map((s, i) => (
            <div key={s.label} style={{
              background: dark ? "#0D1526" : "#fff",
              padding: "36px 24px",
              borderRight: i < 3 ? (dark ? "1px solid #1E293B" : "1px solid #E2E8F0") : "none",
            }}>
              <StatCard {...s} dark={dark} delay={`${i * 0.1}s`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCard({ c, dark, delay }) {
  const ref = useSR();
  const [hov, setHov] = useState(false);
  return (
    <div ref={ref} className="sr grad-border" style={{
      transitionDelay: delay, padding: 28,
      background: dark ? "#111827" : "#fff",
      border: `1px solid ${dark ? "#1E293B" : "#E2E8F0"}`,
      borderRadius: 20, cursor: "default",
      transform: hov ? "translateY(-4px)" : "none",
      boxShadow: hov ? (dark ? `0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(37,99,235,0.3)` : `0 20px 48px rgba(37,99,235,0.08)`) : "none",
      transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease",
    }}
    onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: `${c.color}18`, border: `1px solid ${c.color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, marginBottom: 20,
        transition: "transform 0.3s ease",
        transform: hov ? "scale(1.1)" : "none",
      }}>{c.icon}</div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 10, fontFamily: "Space Grotesk", transition: "color 0.4s" }}>{c.title}</h3>
      <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.72, transition: "color 0.4s" }}>{c.text}</p>
      {/* Shimmer on hover */}
      {hov && <div style={{
        position: "absolute", inset: 0, borderRadius: 20, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          animation: "shimmer 0.8s ease forwards",
        }} />
      </div>}
    </div>
  );
}

/* ─────────────────────────────────────
   FEATURES / ROADMAP
───────────────────────────────────── */
const FOUNDER_STEPS = [
  { icon: "👤", title: "Register as a Founder",    desc: "Create your account and choose your startup stage. Takes under 2 minutes." },
  { icon: "📝", title: "Build Your Profile",         desc: "Add team, traction, product, and financials. The more complete, the higher your score." },
  { icon: "🤖", title: "Receive Your AI Score",      desc: "Our ML model analyzes your startup across 4 dimensions and outputs a score out of 100 with a full breakdown." },
  { icon: "🔍", title: "Browse Matched Investors",   desc: "See a ranked list of investors who match your sector, stage, and current score." },
  { icon: "🤝", title: "Connect & Pitch",            desc: "Send connection requests, share your VentureIQ URL, and start real conversations." },
];

const INVESTOR_STEPS = [
  { icon: "💼", title: "Register as an Investor",   desc: "Create your account and define your investment thesis — sector, stage, ticket size." },
  { icon: "⚙️", title: "Configure Your Filters",    desc: "Set minimum score thresholds, industries, and funding stages for your discovery feed." },
  { icon: "📊", title: "Browse Scored Startups",    desc: "Explore AI-scored startups — each with a score, breakdown, and traction summary." },
  { icon: "🔬", title: "Deep Dive on Any Startup",  desc: "View the full profile: score breakdown, team, metrics, pitch materials." },
  { icon: "📞", title: "Connect & Invest",           desc: "Reach out directly or follow a startup to track its score progress over time." },
];

function Features({ dark }) {
  const [tab, setTab] = useState("founder");
  const rHead = useSR();
  const bg = dark ? "#0A0F1E" : "#F8FAFC";
  const accent = tab === "founder" ? "#2563EB" : "#0EA5E9";
  const steps = tab === "founder" ? FOUNDER_STEPS : INVESTOR_STEPS;

  return (
    <section id="features" style={{
      background: bg, padding: "140px 0", transition: "background 0.4s ease",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="interactive-blob" style={{
          position: "absolute", top: "10%", right: "-12%",
          width: 550, height: 550,
          background: dark ? "radial-gradient(circle, rgba(37,99,235,0.38) 0%, transparent 60%)" : "radial-gradient(circle, rgba(37,99,235,0.48) 0%, transparent 60%)",
          animation: "blob2 18s ease-in-out infinite",
          filter: "blur(45px)",
        }} />
        <div className="interactive-blob" style={{
          position: "absolute", bottom: "10%", left: "-10%",
          width: 450, height: 450,
          background: dark ? "radial-gradient(circle, rgba(14,165,233,0.20) 0%, transparent 60%)" : "radial-gradient(circle, rgba(14,165,233,0.28) 0%, transparent 60%)",
          animation: "blob3 15s ease-in-out infinite",
          filter: "blur(40px)",
        }} />
      </div>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div ref={rHead} className="sr" style={{ marginBottom: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 2, background: "var(--grad)", borderRadius: 1 }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#60A5FA" }}>How It Works</span>
          </div>
          <h2 style={{
            fontSize: "clamp(30px,4.5vw,56px)", fontWeight: 900,
            fontFamily: "Space Grotesk", letterSpacing: -2.5, lineHeight: 1.05,
            color: "var(--text)", transition: "color 0.4s",
          }}>
            Your roadmap,<br />
            <span className="grad-text">step by step.</span>
          </h2>
        </div>

        {/* Centered glass tab switcher */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 60 }}>
          <div style={{
            display: "inline-flex", padding: 5, gap: 4,
            background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
            border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
            borderRadius: 16,
          }}>
            {[
              { id: "founder",  label: "For Founders",  color: "#2563EB" },
              { id: "investor", label: "For Investors", color: "#0EA5E9" },
            ].map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "12px 32px", borderRadius: 12, border: "none",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                  fontSize: 14, fontWeight: 600,
                  background: active ? t.color : "transparent",
                  color: active ? "#fff" : "var(--text-muted)",
                  boxShadow: active ? `0 6px 20px rgba(37,99,235,0.35)` : "none",
                  transition: "all 0.30s cubic-bezier(0.16,1,0.3,1)",
                  letterSpacing: 0.2,
                  transform: active ? "scale(1.01)" : "scale(1)",
                }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step list */}
        <div style={{
          maxWidth: 620, margin: "0 auto",
          position: "relative",
        }}>
          {steps.map((s, i) => (
            <StepRow key={s.title} step={s} i={i} total={steps.length} dark={dark} accent={accent} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepRow({ step, i, total, dark, accent }) {
  const ref = useSR(0.1);
  const [hov, setHov] = useState(false);
  const isLast = i === total - 1;

  return (
    <div ref={ref} className="sr" style={{
      transitionDelay: `${i * 0.08}s`,
      display: "flex", gap: 20, position: "relative", marginBottom: isLast ? 0 : 8,
    }}
    onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {/* Left: number + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: hov ? accent : (dark ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.07)"),
          border: `1.5px solid ${hov ? accent : "rgba(37,99,235,0.25)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, transition: "all 0.25s ease",
          boxShadow: hov ? `0 0 20px rgba(37,99,235,0.35)` : "none",
        }}>{step.icon}</div>
        {!isLast && <div style={{
          flex: 1, width: 2, minHeight: 36, marginTop: 6,
          background: hov
            ? `linear-gradient(to bottom, ${accent}88, transparent)`
            : (dark ? "rgba(30,41,59,0.8)" : "rgba(0,0,0,0.08)"),
          transition: "background 0.3s ease",
        }} />}
      </div>

      {/* Card */}
      <div style={{
        flex: 1, marginBottom: isLast ? 0 : 20,
        background: dark
          ? (hov ? "#1A2540" : "#111827")
          : (hov ? "#F0F5FF" : "#fff"),
        border: `1px solid ${hov ? `${accent}44` : (dark ? "#1E293B" : "#E2E8F0")}`,
        borderRadius: 16, padding: "18px 22px",
        transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
        boxShadow: hov ? (dark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 24px rgba(37,99,235,0.08)") : "none",
        transform: hov ? "translateX(4px)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: accent, letterSpacing: "1px" }}>STEP {String(i+1).padStart(2,"0")}</span>
        </div>
        <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 6, fontFamily: "Space Grotesk", transition: "color 0.4s" }}>{step.title}</h4>
        <p style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.65, transition: "color 0.4s" }}>{step.desc}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   CONTACT + FOOTER
───────────────────────────────────── */
function Contact({ dark }) {
  const rLeft = useSR();
  const rRight = useSR();
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(null);
  const bg = dark ? "#0D1526" : "#EFF2F8";
  const cardBg = dark ? "#111827" : "#fff";
  const border = dark ? "#1E293B" : "#E2E8F0";
  const focusBorder = "#2563EB";

  const inp = (name) => ({
    width: "100%", padding: "13px 16px",
    background: dark ? "#0A0F1E" : "#F8FAFC",
    border: `1.5px solid ${focused === name ? focusBorder : border}`,
    borderRadius: 10, color: "var(--text)",
    fontFamily: "Inter, sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s ease",
    boxShadow: focused === name ? `0 0 0 3px rgba(37,99,235,0.12)` : "none",
  });

  return (
    <section id="contact" style={{
      background: bg, padding: "140px 0 0", transition: "background 0.4s ease",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div className="interactive-blob" style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          background: dark ? "radial-gradient(circle, rgba(99,102,241,0.38) 0%, transparent 60%)" : "radial-gradient(circle, rgba(99,102,241,0.48) 0%, transparent 60%)",
          animation: "blob1 22s ease-in-out infinite",
          filter: "blur(50px)",
        }} />
      </div>
      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, marginBottom: 100, alignItems: "start" }} className="contact-grid">

          {/* Left */}
          <div ref={rLeft} className="sr">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 32, height: 2, background: "var(--grad)", borderRadius: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#60A5FA" }}>Contact Us</span>
            </div>
            <h2 style={{
              fontSize: "clamp(30px,4vw,52px)", fontWeight: 900,
              fontFamily: "Space Grotesk", letterSpacing: -2, lineHeight: 1.05,
              color: "var(--text)", marginBottom: 18, transition: "color 0.4s",
            }}>
              Let's build<br />
              <span className="grad-text">something great.</span>
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 40, transition: "color 0.4s" }}>
              Whether you're a founder ready to get scored, an investor looking for deal flow, or a potential partner — we want to hear from you.
            </p>

            {[
              { icon: "✉️", val: "hello@ventureiq.in",     href: "mailto:hello@ventureiq.in" },
              { icon: "📍", val: "Bengaluru, Karnataka",    href: "#" },
              { icon: "🐦", val: "@VentureIQ_in",           href: "#" },
            ].map(c => (
              <a key={c.val} href={c.href} style={{
                display: "flex", alignItems: "center", gap: 14, marginBottom: 16,
                textDecoration: "none", transition: "opacity 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                  background: "rgba(37,99,235,0.10)", border: "1px solid rgba(37,99,235,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
                }}>{c.icon}</div>
                <span style={{ fontSize: 14, color: "var(--text-2)", fontWeight: 500, transition: "color 0.4s" }}>{c.val}</span>
              </a>
            ))}
          </div>

          {/* Form card */}
          <div ref={rRight} className="sr sr-d2">
            <div style={{
              background: cardBg, border: `1px solid ${border}`,
              borderRadius: 24, padding: "36px",
              boxShadow: dark ? "0 24px 80px rgba(0,0,0,0.4)" : "0 24px 80px rgba(37,99,235,0.07)",
              transition: "background 0.4s, border-color 0.4s",
            }}>
              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 10, fontFamily: "Space Grotesk" }}>Message sent!</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: 14 }}>We'll respond within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {["First name","Last name"].map((pl, i) => {
                      const key = i === 0 ? "first" : "last";
                      return (
                        <div key={pl}>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.8px", textTransform: "uppercase" }}>{pl}</label>
                          <input required placeholder={i === 0 ? "Arjun" : "Sharma"} style={inp(key)}
                            onFocus={() => setFocused(key)} onBlur={() => setFocused(null)} />
                        </div>
                      );
                    })}
                  </div>
                  {[
                    { key: "email",   label: "Email address",  type: "email",  ph: "arjun@startup.in" },
                    { key: "role",    label: "I am a",          type: "select", opts: ["Founder","Investor","Partner","Other"] },
                    { key: "message", label: "Message",         type: "textarea", ph: "Tell us what you're working on..." },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.8px", textTransform: "uppercase" }}>{f.label}</label>
                      {f.type === "select" ? (
                        <select required style={{ ...inp(f.key), appearance: "none", cursor: "pointer" }}
                          onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)}>
                          <option value="">Choose...</option>
                          {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      ) : f.type === "textarea" ? (
                        <textarea required rows={4} placeholder={f.ph} style={{ ...inp(f.key), resize: "vertical", lineHeight: 1.6 }}
                          onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)} />
                      ) : (
                        <input required type={f.type} placeholder={f.ph} style={inp(f.key)}
                          onFocus={() => setFocused(f.key)} onBlur={() => setFocused(null)} />
                      )}
                    </div>
                  ))}
                  <button type="submit" style={{
                    width: "100%", padding: "15px", background: "var(--grad)",
                    color: "#fff", fontSize: 15, fontWeight: 700, borderRadius: 12, border: "none",
                    cursor: "pointer", fontFamily: "Inter", letterSpacing: 0.2,
                    boxShadow: "0 6px 24px var(--glow-blue)",
                    transition: "all 0.22s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 36px var(--glow-blue)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 24px var(--glow-blue)"; }}>
                    Send message →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: dark ? "#060B18" : "#0F172A",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        padding: "40px 0",
      }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--grad)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: "#fff", fontFamily: "Space Grotesk" }}>V</div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#F8FAFC", fontFamily: "Space Grotesk", letterSpacing: -0.3 }}>Venture<span style={{ color: "#60A5FA" }}>IQ</span></span>
          </div>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {["Privacy","Terms","About","Careers","Blog"].map(l => (
              <a key={l} href="#" style={{ fontSize: 13, color: "#475569", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#94A3B8"}
                onMouseLeave={e => e.currentTarget.style.color = "#475569"}>{l}</a>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#334155" }}>© 2025 VentureIQ · Made in India 🇮🇳</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 780px) {
          .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}

/* ─────────────────────────────────────
   ROOT
───────────────────────────────────── */
export default function LandingPage() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 45; // max 22.5px
      const y = (e.clientY / window.innerHeight - 0.5) * 45;
      document.documentElement.style.setProperty("--mx", `${x}px`);
      document.documentElement.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={{ minHeight: "100dvh" }}>
      <Navbar dark={dark} setDark={setDark} />
      <Hero     dark={dark} />
      <About    dark={dark} />
      <Features dark={dark} />
      <Contact  dark={dark} />
    </div>
  );
}
