import { useState, useEffect } from "react";
import { apiService } from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";

function GrowthChartCard({ label, val, trend, values, months, color, dark, mutedCol, textCol, border, type = "line" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // SVG dimensions
  const width = 380;
  const height = 120;
  const paddingX = 20;
  const paddingY = 15;

  const minVal = type === "bar" ? 0 : Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;

  // Compute points
  const colWidth = (width - 2 * paddingX) / values.length;
  const barWidth = 22;

  const points = values.map((v, i) => {
    let x;
    if (type === "bar") {
      x = paddingX + i * colWidth + (colWidth - barWidth) / 2 + barWidth / 2;
    } else {
      x = paddingX + (i / (values.length - 1)) * (width - 2 * paddingX);
    }
    const y = height - paddingY - ((v - minVal) / valRange) * (height - 2 * paddingY);
    return { x, y, value: v, month: months[i] };
  });

  // Create smooth bezier curve path for line chart
  let linePath = "";
  if (type === "line" && points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2.5;
      const cp1y = p0.y;
      const cp2x = p1.x - (p1.x - p0.x) / 2.5;
      const cp2y = p1.y;
      linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
  }

  // Create area path data
  const areaPath = linePath ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z` : "";

  return (
    <div className="fdp" style={{ padding: 22, background: dark ? "rgba(255,255,255,0.01)" : "#fff", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: 12, color: mutedCol, fontWeight: 700, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: textCol }}>
            {hoveredIdx !== null ? ((label.includes("Revenue") || label.includes("Cost") || label.includes("CAC")) ? `$${points[hoveredIdx].value.toLocaleString()}` : (points[hoveredIdx].value.toLocaleString() + (label.includes("Retention") || label.includes("NRR") ? "%" : ""))) : val}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>
            {hoveredIdx !== null ? points[hoveredIdx].month : trend}
          </span>
          {hoveredIdx !== null && (
            <span style={{ fontSize: 9, color: mutedCol, marginTop: 2 }}>
              {label}
            </span>
          )}
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: "relative", height: height, marginTop: 12 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
          <defs>
            {/* Gradient Fill */}
            <linearGradient id={`grad-${label.replace(/[^a-zA-Z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            {/* Filter for line glow */}
            <filter id={`glow-${label.replace(/[^a-zA-Z]/g, '')}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={color} floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke={border} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke={border} strokeWidth="1" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke={border} strokeWidth="1" strokeDasharray="3 3" />

          {/* Render bar charts */}
          {type === "bar" && points.map((p, i) => {
            const rectX = p.x - barWidth / 2;
            const rectY = p.y;
            const rectW = barWidth;
            const rectH = (height - paddingY) - p.y;
            const isHovered = hoveredIdx === i;

            return (
              <g key={i}>
                <rect
                  x={rectX}
                  y={rectY}
                  width={rectW}
                  height={rectH}
                  rx={5}
                  fill={color}
                  opacity={hoveredIdx === null ? 0.75 : (isHovered ? 1.0 : 0.4)}
                  style={{ transition: "all 0.2s ease" }}
                />
                {rectH > 5 && (
                  <rect
                    x={rectX}
                    y={height - paddingY - 5}
                    width={rectW}
                    height={5}
                    fill={color}
                    opacity={hoveredIdx === null ? 0.75 : (isHovered ? 1.0 : 0.4)}
                    style={{ transition: "all 0.2s ease" }}
                  />
                )}
                {/* Invisible hover trigger */}
                <rect
                  x={rectX - (colWidth - barWidth) / 2}
                  y={0}
                  width={colWidth}
                  height={height}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}

          {/* Render spline line charts */}
          {type === "line" && (
            <>
              {/* Area Path */}
              {areaPath && (
                <path d={areaPath} fill={`url(#grad-${label.replace(/[^a-zA-Z]/g, '')})`} />
              )}

              {/* Line Path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#glow-${label.replace(/[^a-zA-Z]/g, '')})`}
                />
              )}

              {/* Data Points */}
              {points.map((p, i) => (
                <g key={i}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredIdx === i ? 5 : 3.5}
                    fill={hoveredIdx === i ? color : (dark ? "#080C19" : "#fff")}
                    stroke={color}
                    strokeWidth={hoveredIdx === i ? 2 : 1.8}
                    style={{ transition: "all 0.15s ease" }}
                  />
                  {/* Invisible interactive hover rects */}
                  <rect
                    x={p.x - (width - 2 * paddingX) / (values.length - 1) / 2}
                    y={0}
                    width={(width - 2 * paddingX) / (values.length - 1)}
                    height={height}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                </g>
              ))}
            </>
          )}

          {/* Dotted indicator line on hover */}
          {hoveredIdx !== null && (
            <line
              x1={points[hoveredIdx].x}
              y1={paddingY}
              x2={points[hoveredIdx].x}
              y2={height - paddingY}
              stroke={color}
              strokeWidth="1.2"
              strokeDasharray="2 2"
              opacity="0.8"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

function ProfileCompletionCard({ startup, dark, mutedCol, textCol, border, onComplete }) {
  const fields = [
    { key: "name",     label: "Startup name",         icon: "🏢" },
    { key: "stage",    label: "Funding stage",         icon: "📈" },
    { key: "sector",   label: "Industry / sector",    icon: "🏭" },
    { key: "location", label: "HQ location",           icon: "📍" },
    { key: "teamSize", label: "Team size",              icon: "👥" },
    { key: "mrr",      label: "Monthly revenue (MRR)", icon: "💰" },
    { key: "runway",   label: "Runway",                icon: "⏱️" },
    { key: "tagline",  label: "One-line pitch",         icon: "💡" },
    { key: "founded",  label: "Founded year",          icon: "📅" },
  ];

  const filled  = fields.filter(f => startup[f.key] && String(startup[f.key]).trim() !== "");
  const missing = fields.filter(f => !startup[f.key] || String(startup[f.key]).trim() === "");
  const pct     = Math.round((filled.length / fields.length) * 100);

  const R    = 44;
  const circ = 2 * Math.PI * R;
  const dash = (pct / 100) * circ;
  const ringColor = pct >= 80 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="fdp" style={{ padding: 28, display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <svg width="110" height="110" viewBox="0 0 110 110">
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={ringColor} stopOpacity="1" />
              <stop offset="100%" stopColor={ringColor} stopOpacity="0.5" />
            </linearGradient>
            <filter id="ring-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor={ringColor} floodOpacity="0.4" />
            </filter>
          </defs>
          <circle cx="55" cy="55" r={R} fill="none" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)"} strokeWidth="9" />
          <circle
            cx="55" cy="55" r={R}
            fill="none"
            stroke="url(#ring-grad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={circ / 4}
            transform="rotate(-90 55 55)"
            filter="url(#ring-glow)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
          <text x="55" y="50" textAnchor="middle" fill={ringColor} fontSize="18" fontWeight="900" fontFamily="'Space Grotesk',sans-serif">{pct}%</text>
          <text x="55" y="66" textAnchor="middle" fill={mutedCol} fontSize="9" fontWeight="700">COMPLETE</text>
        </svg>
        {missing.length === 0 ? (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "3px 10px", borderRadius: 100 }}>✓ Profile complete</span>
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, color: ringColor, background: `${ringColor}18`, padding: "3px 10px", borderRadius: 100 }}>{missing.length} item{missing.length > 1 ? "s" : ""} missing</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 220 }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 4px" }}>Profile Completion</h3>
          <p style={{ fontSize: 12, color: mutedCol, margin: 0 }}>A complete profile improves your AI match score and visibility to investors.</p>
        </div>
        <div style={{ height: 6, borderRadius: 100, background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)", marginBottom: 18, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${ringColor}90, ${ringColor})`, borderRadius: 100, transition: "width 0.6s ease" }} />
        </div>
        {missing.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: mutedCol, letterSpacing: 1, marginBottom: 2 }}>MISSING INFORMATION</div>
            {missing.map(f => (
              <div
                key={f.key}
                onClick={onComplete}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: `1px dashed ${border}`, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>{f.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: textCol }}>{f.label}</span>
                <span style={{ fontSize: 10, color: "#6366F1", fontWeight: 700 }}>Add →</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: mutedCol, letterSpacing: 1, marginBottom: 2 }}>ALL FIELDS COMPLETED</div>
            {filled.slice(0, 5).map(f => (
              <div key={f.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, border: `1px solid ${border}` }}>
                <span style={{ fontSize: 14 }}>{f.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1, color: textCol }}>{f.label}</span>
                <span style={{ fontSize: 10, color: "#10B981", fontWeight: 700 }}>✓</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FounderDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const rawName = state?.name || "Founder";
  const rawCompany = state?.company || "Your Startup";
  const initials = rawName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const [dark, setDark] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const [startup, setStartup] = useState({
    name: rawCompany,
    tagline: "Building the future of procurement",
    industry: "B2B SaaS",
    stage: "Seed",
    description: "An innovative visual logistics dashboard that streamlines operations and decreases transaction latency.",
    problem: "Remote teams struggle with tracking project velocity across siloed communication channels.",
    solution: "A unified digital nerve center showing real-time metrics, automated task delegation, and AI prediction.",
    logoUrl: "",
    founded: "2024",
    teamSize: "12",
    location: "Bangalore, India",
    mrr: "42000",
    burn: "18000",
    runway: "14",
    valuation: "4500000",
    fundingRaised: "1040000",
    activeUsers: "3200",
    growthRate: "28",
    targetAudience: "Mid-market enterprise managers",
    techStack: "React, Node.js, Express, SQLite",
    website: "https://ventureiq.io",
    linkedin: "https://linkedin.com/company/ventureiq",
    twitter: "https://twitter.com/ventureiq",
    totalFunding: 0,
    aiScore: 0,
    isNew: true,
    startupStage: "Early Traction",
    businessModel: "B2B",
    marketSize: "10000000",
    marketGrowthRate: "15",
    competitorsCount: "5",
    founderExperience: "3",
    previousStartups: "0"
  });

  const [editStartup, setEditStartup] = useState({ ...startup });

  const [analysisStatus, setAnalysisStatus] = useState({
    has_history: false,
    latest_prediction: null,
    checklist: [],
    is_valid: false,
    is_outdated: false
  });
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const fetchAnalysisStatus = async () => {
    try {
      setLoadingAnalysis(true);
      const data = await apiService.getPredictionStatus(rawCompany);
      setAnalysisStatus(data);
      setLoadingAnalysis(false);
    } catch (err) {
      console.error("Failed to load prediction status", err);
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    if (activeTab === "AI Analysis") {
      fetchAnalysisStatus();
    }
  }, [activeTab, rawCompany]);

  const handleRunAnalysis = async () => {
    try {
      setPredicting(true);
      const res = await apiService.predictSuccess(rawCompany, {});
      
      setAnalysisStatus({
        has_history: true,
        latest_prediction: res.prediction,
        checklist: analysisStatus.checklist.map(c => ({ ...c, status: 'valid' })),
        is_valid: true,
        is_outdated: false
      });
      
      setStartup(prev => ({
        ...prev,
        aiScore: res.prediction.success_score,
        isNew: false
      }));
      setPredicting(false);
    } catch (err) {
      alert("Failed to run AI Analysis. Please complete missing Startup Profile information first.");
      setPredicting(false);
    }
  };

  // Load startup data from SQLite database on mount
  useEffect(() => {
    async function fetchStartup() {
      try {
        const data = await apiService.getStartup(rawCompany);
        const isNew = (!data.total_funding_usd && !data.monthly_revenue_usd && !data.valuation_usd);
        const fetched = {
          name: data.startup_name || rawCompany,
          tagline: data.unique_selling_proposition || "Building the future of B2B SaaS",
          industry: data.industry || "B2B SaaS",
          stage: data.funding_stage || "Seed",
          description: data.startup_description || "An innovative visual logistics dashboard that streamlines operations and decreases transaction latency.",
          problem: data.competitor_3 || "Remote teams struggle with tracking project velocity across siloed communication channels.",
          solution: data.startup_stage_description || "A unified digital nerve center showing real-time metrics, automated task delegation, and AI prediction.",
          logoUrl: data.logo_url || "",
          founded: data.founded_year ? String(data.founded_year) : "2024",
          teamSize: data.team_size ? String(data.team_size) : "12",
          location: data.headquarters_city ? `${data.headquarters_city}, ${data.headquarters_country || "India"}` : "Bangalore, India",
          mrr: data.monthly_revenue_usd ? String(data.monthly_revenue_usd) : "42000",
          burn: data.burn_rate ? String(data.burn_rate) : "18000",
          runway: data.runway_months ? String(data.runway_months) : "14",
          valuation: data.valuation_usd ? String(data.valuation_usd) : "4500000",
          fundingRaised: data.total_funding_usd ? String(data.total_funding_usd) : "1040000",
          activeUsers: data.active_users ? String(data.active_users) : "3200",
          growthRate: data.customer_growth_rate ? String(data.customer_growth_rate * 100) : "28",
          targetAudience: data.target_audience || "Mid-market enterprise managers",
          techStack: data.technology_stack || "React, Node.js, Express, SQLite",
          website: data.website || "https://ventureiq.io",
          linkedin: data.competitor_1 || "https://linkedin.com/company/ventureiq",
          twitter: data.competitor_2 || "https://twitter.com/ventureiq",
          totalFunding: data.total_funding_usd || 0,
          aiScore: data.investor_interest_score || 0,
          isNew: isNew,
          startupStage: data.startup_stage || "Early Traction",
          businessModel: data.business_model || "B2B",
          marketSize: data.market_size_usd ? String(data.market_size_usd) : "10000000",
          marketGrowthRate: data.market_growth_rate ? String(data.market_growth_rate * 100) : "15",
          competitorsCount: data.number_of_competitors ? String(data.number_of_competitors) : "5",
          founderExperience: data.founder_experience_years ? String(data.founder_experience_years) : "3",
          previousStartups: data.previous_startups ? String(data.previous_startups) : "0"
        };
        setStartup(fetched);
        setEditStartup(fetched);
      } catch (err) {
        console.log("No existing startup profile found in DB or server offline.");
      }
    }
    fetchStartup();
  }, [rawCompany]);

  const handleFieldChange = (key, value) => {
    setEditStartup(prev => {
      const next = { ...prev, [key]: value };
      // Check if actually modified from original startup state
      const modified = Object.keys(next).some(k => next[k] !== startup[k]);
      setUnsavedChanges(modified);
      return next;
    });
  };

  const handleSaveChanges = async () => {
    try {
      setSaveStatus("Saving...");
      const cleanMRR = parseFloat(editStartup.mrr) || 0;
      const cleanBurn = parseFloat(editStartup.burn) || 0;
      const cleanRunway = parseFloat(editStartup.runway) || 0;
      const cleanValuation = parseFloat(editStartup.valuation) || 0;
      const cleanFunding = parseFloat(editStartup.fundingRaised) || 0;
      const cleanUsers = parseInt(editStartup.activeUsers) || 0;
      const cleanGrowth = parseFloat(editStartup.growthRate) / 100 || 0;

      const cleanMarketSize = parseFloat(editStartup.marketSize) || 0;
      const cleanMarketGrowth = parseFloat(editStartup.marketGrowthRate) / 100 || 0;
      const cleanCompetitors = parseInt(editStartup.competitorsCount) || 0;
      const cleanExperience = parseInt(editStartup.founderExperience) || 0;
      const cleanPrevious = parseInt(editStartup.previousStartups) || 0;

      await apiService.updateStartup(rawCompany, {
        industry: editStartup.industry,
        funding_stage: editStartup.stage,
        startup_description: editStartup.description,
        unique_selling_proposition: editStartup.tagline,
        competitor_3: editStartup.problem,
        startup_stage_description: editStartup.solution,
        logo_url: editStartup.logoUrl,
        founded_year: parseInt(editStartup.founded) || 2024,
        team_size: parseInt(editStartup.teamSize) || 1,
        headquarters_city: editStartup.location.split(",")[0]?.trim() || editStartup.location,
        monthly_revenue_usd: cleanMRR,
        burn_rate: cleanBurn,
        runway_months: cleanRunway,
        valuation_usd: cleanValuation,
        total_funding_usd: cleanFunding,
        active_users: cleanUsers,
        customer_growth_rate: cleanGrowth,
        target_audience: editStartup.targetAudience,
        technology_stack: editStartup.techStack,
        website: editStartup.website,
        competitor_1: editStartup.linkedin,
        competitor_2: editStartup.twitter,
        startup_stage: editStartup.startupStage,
        business_model: editStartup.businessModel,
        market_size_usd: cleanMarketSize,
        market_growth_rate: cleanMarketGrowth,
        number_of_competitors: cleanCompetitors,
        founder_experience_years: cleanExperience,
        previous_startups: cleanPrevious
      });

      const updated = {
        ...editStartup,
        totalFunding: cleanFunding,
        isNew: false
      };
      setStartup(updated);
      setUnsavedChanges(false);
      setSaveStatus("✓ Profile Updated Successfully");
      setTimeout(() => setSaveStatus(""), 4000);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save changes. Make sure backend Django server is running.");
      setSaveStatus("");
    }
  };

  const handleCancelChanges = () => {
    setEditStartup({ ...startup });
    setUnsavedChanges(false);
    setIsEditing(false);
    setSaveStatus("");
  };

  const [tasks, setTasks] = useState([
    { id: 1, text: "Upload updated pitch deck", due: "Jul 10", priority: "High", done: false },
    { id: 2, text: "Complete financial projections for Q3", due: "Jul 12", priority: "High", done: false },
    { id: 3, text: "Schedule call with Sequoia India", due: "Jul 13", priority: "Medium", done: true },
    { id: 4, text: "Update cap table with new ESOP pool", due: "Jul 15", priority: "Medium", done: false },
    { id: 5, text: "Publish team page on VentureIQ profile", due: "Jul 16", priority: "Low", done: true },
  ]);
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const [documents, setDocuments] = useState([
    { name: "Pitch_Deck_2025.pdf", type: "PDF", size: "3.2 MB", date: "Jul 1, 2025", status: "Verified" },
    { name: "Financials_Q2.xlsx", type: "XLSX", size: "1.1 MB", date: "Jun 28, 2025", status: "Verified" },
    { name: "Cap_Table.pdf", type: "PDF", size: "540 KB", date: "Jun 20, 2025", status: "Pending" },
  ]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingName, setUploadingName] = useState("");
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingName(file.name);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDocuments(d => [...d, { name: file.name, type: file.name.split(".").pop().toUpperCase(), size: `${(file.size / 1024).toFixed(0)} KB`, date: "Just now", status: "Pending" }]);
          setUploadingName(""); return 0;
        }
        return prev + 20;
      });
    }, 300);
  };

  const chats = [
    { id: 1, name: "Sequoia India", role: "Investor \u00b7 Seed/Series A", last: "Interested in your deck" },
    { id: 2, name: "Blume Ventures", role: "Investor \u00b7 Pre-Seed/Seed", last: "Let's schedule a call" },
    { id: 3, name: "VentureIQ Support", role: "Platform", last: "Your AI score updated" },
  ];
  const [activeChatId, setActiveChatId] = useState(1);
  const [messagesLog, setMessagesLog] = useState({
    1: [
      { sender: "them", text: "Hi! We reviewed your pitch deck and are very impressed. Would love to connect.", time: "10:30 AM" },
      { sender: "me", text: "Thank you! I'd love to discuss further. When works for you?", time: "10:45 AM" },
    ],
    2: [{ sender: "them", text: "Hello, your traction metrics look strong. Let's schedule an intro call.", time: "Yesterday" }],
    3: [{ sender: "them", text: "Your AI attractiveness score has been updated to 91%.", time: "2 hrs ago" }],
  });
  const [chatInput, setChatInput] = useState("");
  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessagesLog(prev => ({ ...prev, [activeChatId]: [...prev[activeChatId], { sender: "me", text: chatInput, time }] }));
    setChatInput("");
    setTimeout(() => {
      setMessagesLog(prev => ({ ...prev, [activeChatId]: [...prev[activeChatId], { sender: "them", text: "Got it! I'll get back to you shortly.", time: "Just now" }] }));
    }, 1400);
  };

  const [aiLogs, setAiLogs] = useState([
    { role: "ai", text: `Welcome back, ${rawName}! ${rawCompany}'s AI attractiveness score is 91% — you're in the top 8% of seed-stage startups on VentureIQ.` },
  ]);
  const [aiInput, setAiInput] = useState("");
  const sendAiMessage = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const q = aiInput;
    setAiLogs(p => [...p, { role: "user", text: q }]);
    setAiInput("");
    setTimeout(() => {
      setAiLogs(p => [...p, { role: "ai", text: "Based on your traction metrics and sector, I recommend updating your pricing model to a tiered SaaS structure — this could improve your valuation by up to 14%." }]);
    }, 1000);
  };

  const [pitchPrompt, setPitchPrompt] = useState("");
  const [pitchOutput, setPitchOutput] = useState("");
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const generatePitch = () => {
    if (!pitchPrompt.trim()) return;
    setGeneratingPitch(true); setPitchOutput("");
    setTimeout(() => {
      setPitchOutput(`HOOK\n"What if every B2B buyer could access enterprise procurement at SME prices?"\n\nPROBLEM\n${pitchPrompt.trim()}\n\nSOLUTION\n${rawCompany}'s AI-powered platform bridges this gap.\n\nTRACTION\n$42K MRR | 28% MoM growth | 3,200 active buyers\n\nASK\nRaising $2M Seed round to expand to 3 new cities.`);
      setGeneratingPitch(false);
    }, 2000);
  };

  const bg = dark ? "#080C19" : "#F3F4F6";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textCol = dark ? "#F3F4F6" : "#111827";
  const mutedCol = dark ? "#9CA3AF" : "#4B5563";
  const cardBg = dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.7)";
  const priorityColor = { High: "#EF4444", Medium: "#F59E0B", Low: "#10B981" };

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: "DB" },
    { id: "My Startup", label: "My Startup", icon: "MS" },
    { id: "AI Analysis", label: "AI Analysis", icon: "AA" },
    { id: "Investor Matches", label: "Investor Matches", icon: "IM" },
    { id: "Funding", label: "Funding", icon: "FD" },
    { id: "AI Pitch Video", label: "AI Pitch Video", icon: "AV" },
    { id: "Comparison", label: "Startup Comparison", icon: "SC" },
    { id: "Messages", label: "Messages", icon: "MG" },
    { id: "Calendar", label: "Calendar", icon: "CL" },
    { id: "Tasks", label: "Tasks", icon: "TS" },
    { id: "Settings", label: "Settings", icon: "ST" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: bg, color: textCol, fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", transition: "background 0.3s,color 0.3s", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@600;700;800;900&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.35);border-radius:10px;}
        .fdp{background:${cardBg};border:1px solid ${border};border-radius:18px;backdrop-filter:blur(12px);box-shadow:${dark?"0 8px 32px rgba(0,0,0,0.3)":"0 8px 32px rgba(31,41,55,0.06)"};transition:all 0.25s ease;}
        .fdph:hover{border-color:rgba(99,102,241,0.35);transform:translateY(-2px);box-shadow:${dark?"0 12px 40px rgba(99,102,241,0.1)":"0 12px 40px rgba(31,41,55,0.08)"};}
        .fdsb{transition:all 0.18s ease;}
        .fdsb:hover{background:${dark?"rgba(99,102,241,0.1)":"rgba(99,102,241,0.06)"} !important;}
        @keyframes fdUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        .fdin{animation:fdUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards;}
        .gfd1{position:fixed;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%);top:-100px;left:-100px;pointer-events:none;z-index:0;}
        .gfd2{position:fixed;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,0.06) 0%,transparent 70%);bottom:-80px;right:-80px;pointer-events:none;z-index:0;}
        .fdi{width:100%;padding:12px 14px;background:${dark?"rgba(255,255,255,0.03)":"#fff"};border:1px solid ${border};border-radius:10px;color:${textCol};font-size:13px;outline:none;font-family:'Inter',sans-serif;transition:border-color 0.2s;}
        .fdi:focus{border-color:rgba(99,102,241,0.5);}
      `}</style>
      <div className="gfd1"/><div className="gfd2"/>

      <header style={{ position:"sticky",top:0,zIndex:50,height:68,background:dark?"rgba(8,12,25,0.82)":"rgba(243,244,246,0.82)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px" }}>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <button onClick={()=>setSidebarCollapsed(!sidebarCollapsed)} style={{ background:"none",border:"none",color:textCol,cursor:"pointer",fontSize:18,padding:4 }}>☰</button>
          <div style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer" }} onClick={()=>setActiveTab("Dashboard")}>
            <div style={{ width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#6366F1,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:"#fff" }}>V</div>
            <span style={{ fontSize:18,fontWeight:900,letterSpacing:"-0.5px" }}>Venture<span style={{ color:"#6366F1" }}>IQ</span></span>
            <span style={{ fontSize:9,fontWeight:800,padding:"2px 8px",borderRadius:100,background:"rgba(99,102,241,0.15)",color:"#6366F1",letterSpacing:1,marginLeft:2 }}>FOUNDER</span>
          </div>
        </div>
        <div style={{ flex:1,maxWidth:450,margin:"0 24px",position:"relative" }}>
          <span style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:mutedCol,fontSize:13 }}>🔍</span>
          <input type="text" placeholder="Search metrics, investors, pitch decks..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
            style={{ width:"100%",padding:"10px 14px 10px 38px",background:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)",border:`1.5px solid ${border}`,borderRadius:12,color:textCol,fontSize:13,outline:"none" }}/>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <button onClick={()=>setShowAiAssistant(!showAiAssistant)}
            style={{ padding:"8px 16px",borderRadius:12,background:"linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))",border:"1.5px solid rgba(99,102,241,0.4)",color:"#a855f7",fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"}>
            🧠 AI Assistant
          </button>
          <button onClick={()=>setDark(!dark)} style={{ width:38,height:38,borderRadius:12,border:"none",cursor:"pointer",background:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.04)",color:dark?"#F59E0B":"#6366F1",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center" }}>
            {dark?"☀️":"🌙"}
          </button>
          <div style={{ position:"relative" }}>
            <button onClick={()=>{setNotificationsOpen(!notificationsOpen);setUnreadCount(0);}}
              style={{ width:38,height:38,borderRadius:12,border:"none",cursor:"pointer",background:dark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.04)",color:textCol,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>🔔</button>
            {unreadCount>0&&<span style={{ position:"absolute",top:-2,right:-2,background:"#EF4444",color:"#fff",fontSize:9,fontWeight:900,padding:"2px 5px",borderRadius:100,border:`2px solid ${bg}` }}>{unreadCount}</span>}
            {notificationsOpen&&(
              <div className="fdp" style={{ position:"absolute",top:48,right:0,width:340,zIndex:100,padding:20,boxShadow:"0 20px 50px rgba(0,0,0,0.5)" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
                  <h4 style={{ margin:0,fontSize:14,fontWeight:800 }}>Notifications</h4>
                  <button onClick={()=>setNotificationsOpen(false)} style={{ background:"none",border:"none",color:mutedCol,cursor:"pointer" }}>✕</button>
                </div>
                {[
                  { text:"Sequoia India downloaded your Pitch Deck",time:"2 hrs ago",unread:true },
                  { text:`AI Analysis for ${rawCompany} updated to 91%`,time:"5 hrs ago",unread:true },
                  { text:"VentureIQ matching index updated",time:"1 day ago",unread:false },
                ].map((n,i)=>(
                  <div key={i} style={{ paddingBottom:10,borderBottom:i<2?`1px solid ${border}`:"none",marginBottom:i<2?10:0,fontSize:12,color:n.unread?textCol:mutedCol }}>
                    <div style={{ display:"flex",gap:6,alignItems:"flex-start" }}>
                      {n.unread&&<span style={{ width:6,height:6,background:"#6366F1",borderRadius:"50%",marginTop:4,flexShrink:0 }}/>}
                      <div><div>{n.text}</div><div style={{ fontSize:10,color:mutedCol,marginTop:3 }}>{n.time}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ width:38,height:38,borderRadius:12,background:"linear-gradient(135deg,#6366F1,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#fff",cursor:"pointer" }}>{initials}</div>
          <button
            onClick={() => navigate("/")}
            onMouseEnter={e => { e.currentTarget.style.background="rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.5)"; e.currentTarget.style.transform="translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.25)"; e.currentTarget.style.transform="none"; }}
            style={{
              padding: "8px 16px", borderRadius: 10,
              border: "1.5px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.06)",
              color: "#EF4444", fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s ease"
            }}
          >
            &#8594; Logout
          </button>
        </div>
      </header>

      {showAiAssistant&&(
        <div className="fdp" style={{ position:"fixed",bottom:30,right:30,width:380,height:500,zIndex:90,display:"flex",flexDirection:"column",padding:20,boxShadow:"0 24px 60px rgba(168,85,247,0.18)",border:"1.5px solid rgba(168,85,247,0.3)" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:18 }}>🧠</span>
              <div><h4 style={{ margin:0,fontSize:14,fontWeight:800 }}>VentureIQ AI Copilot</h4><span style={{ fontSize:10,color:"#10B981" }}>● Analyzing your startup</span></div>
            </div>
            <button onClick={()=>setShowAiAssistant(false)} style={{ background:"none",border:"none",color:mutedCol,cursor:"pointer",fontSize:16 }}>✕</button>
          </div>
          <div style={{ flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:12 }}>
            {aiLogs.map((log,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:log.role==="user"?"flex-end":"flex-start" }}>
                <div style={{ maxWidth:"80%",padding:"10px 14px",borderRadius:12,fontSize:12,lineHeight:1.5,background:log.role==="user"?"linear-gradient(135deg,#6366F1,#A855F7)":(dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"),color:log.role==="user"?"#fff":textCol,borderBottomRightRadius:log.role==="user"?4:12,borderBottomLeftRadius:log.role==="ai"?4:12 }}>{log.text}</div>
              </div>
            ))}
          </div>
          <form onSubmit={sendAiMessage} style={{ display:"flex",gap:8 }}>
            <input value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Ask about investors, pitch, metrics..."
              style={{ flex:1,padding:"10px 14px",borderRadius:10,fontSize:12,background:dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)",border:`1px solid ${border}`,color:textCol,outline:"none" }}/>
            <button type="submit" style={{ padding:"0 16px",background:"#6366F1",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer" }}>Send</button>
          </form>
        </div>
      )}

      <div style={{ display:"flex",flex:1,overflow:"hidden",position:"relative",zIndex:1 }}>
        <nav style={{ width:sidebarCollapsed?72:240,background:dark?"rgba(8,12,25,0.6)":"rgba(255,255,255,0.6)",borderRight:`1px solid ${border}`,padding:"16px 12px",display:"flex",flexDirection:"column",gap:4,transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)",overflowX:"hidden",overflowY:"auto",flexShrink:0 }}>
          {menuItems.map(item=>{
            const sel=activeTab===item.id;
            return(
              <button key={item.id} onClick={()=>setActiveTab(item.id)} className="fdsb"
                style={{ display:"flex",alignItems:"center",justifyContent:sidebarCollapsed?"center":"flex-start",gap:12,padding:"11px 14px",borderRadius:12,background:sel?(dark?"rgba(99,102,241,0.12)":"rgba(99,102,241,0.08)"):"transparent",border:"none",cursor:"pointer",color:sel?"#6366F1":textCol,fontWeight:sel?700:500,fontSize:13,textAlign:"left",width:"100%" }}>
                <span style={{ fontSize:10,fontWeight:800,opacity:0.8,width:22,textAlign:"center" }}>{item.icon}</span>
                {!sidebarCollapsed&&<span style={{ flex:1 }}>{item.label}</span>}
              </button>
            );
          })}
          {!sidebarCollapsed&&(
            <div style={{ marginTop:"auto",paddingTop:16,borderTop:`1px solid ${border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px" }}>
                <div style={{ width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#6366F1,#A855F7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0 }}>{initials}</div>
                <div><div style={{ fontSize:12,fontWeight:700 }}>{rawName}</div><div style={{ fontSize:10,color:mutedCol }}>{rawCompany}</div></div>
              </div>
            </div>
          )}
        </nav>

        <main style={{ flex:1,overflowY:"auto",padding:"32px 28px",display:"flex",flexDirection:"column",gap:28 }}>

          {activeTab==="Dashboard"&&(
            <div className="fdin" style={{ display:"flex",flexDirection:"column",gap:28 }}>
              <ProfileCompletionCard
                startup={startup}
                dark={dark}
                mutedCol={mutedCol}
                textCol={textCol}
                border={border}
                onComplete={() => setActiveTab("My Startup")}
              />
              <div style={{ display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:24 }} id="fdh">
                <div className="fdp" style={{ padding:32,display:"flex",flexDirection:"column",justifyContent:"space-between" }}>
                  <div>
                    <span style={{ fontSize:12,fontWeight:700,color:"#6366F1",letterSpacing:1 }}>FOUNDER CONSOLE</span>
                    <h1 style={{ fontSize:28,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",margin:"8px 0 12px" }}>Welcome back, {rawName} 👋</h1>
                    <p style={{ fontSize:14,color:mutedCol,lineHeight:1.6 }}>Startup: <strong style={{ color:textCol }}>{rawCompany}</strong>. Your AI attractiveness score is <strong style={{ color:"#6366F1" }}>{startup.isNew ? "N/A" : (startup.aiScore ? `${startup.aiScore}%` : "91%")}</strong> — placing you in {startup.isNew ? "a pending status" : "the top 8% of seed-stage startups"} on VentureIQ.</p>
                  </div>
                  <div style={{ marginTop:24,padding:16,borderRadius:12,background:dark?"rgba(99,102,241,0.06)":"rgba(99,102,241,0.04)",borderLeft:"4px solid #6366F1",fontSize:13,lineHeight:1.5 }}>
                    <strong style={{ color:"#6366F1",display:"block",marginBottom:4 }}>💡 AI Recommendation of the Day</strong>
                    "Adding a tiered pricing model could improve your valuation by up to 14%. Sequoia India views startups with structured ARR tiers more favourably."
                  </div>
                </div>
                <div className="fdp" style={{ padding:28,display:"flex",flexDirection:"column",gap:18 }}>
                  <h3 style={{ fontSize:15,fontWeight:800,margin:0 }}>Startup Snapshot</h3>
                  {[{label:"Stage",val:startup.stage},{label:"MRR",val:startup.mrr ? `$${parseFloat(startup.mrr).toLocaleString()} MRR` : "$0 MRR"},{label:"Runway",val:startup.runway ? `${startup.runway} months` : "12 months"},{label:"Team Size",val:`${startup.teamSize} people`}].map((s,i)=>(
                    <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:i<3?14:0,borderBottom:i<3?`1px solid ${border}`:"none" }}>
                      <div style={{ fontSize:12,color:mutedCol,fontWeight:600 }}>{s.label}</div>
                      <div style={{ fontSize:15,fontWeight:800,color:"#6366F1" }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:20 }}>
                {[
                  {label:"Profile Views",val:"14.2k",inc:"+12.4% this month",icon:"👁️",color:"#3B82F6"},
                  {label:"Investor Visits",val:"328",inc:"+18.2% this week",icon:"💼",color:"#8B5CF6"},
                  {label:"Investor Matches",val:"14",inc:"+6 new matches",icon:"🤝",color:"#EC4899"},
                  {label:"Messages",val:"92",inc:"+14 unread",icon:"💬",color:"#10B981"},
                  {label:"AI Success Score",val:"91%",inc:"+4.1% vs last week",icon:"📈",color:"#F59E0B"},
                  {label:"Funding Raised",val:"$520K",inc:"+$50K this month",icon:"💰",color:"#06B6D4"},
                ].map(card=>(
                  <div key={card.label} className="fdp fdph" style={{ padding:20,display:"flex",flexDirection:"column",gap:10 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <span style={{ fontSize:12,fontWeight:700,color:mutedCol }}>{card.label}</span>
                      <span style={{ fontSize:16 }} dangerouslySetInnerHTML={{__html:card.icon}}/>
                    </div>
                    <div>
                      <h2 style={{ fontSize:26,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",margin:0,color:card.color }}>{card.val}</h2>
                      <span style={{ fontSize:10,color:mutedCol,marginTop:2,display:"block" }}>{card.inc}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="fdp" style={{ padding:28 }}>
                <h3 style={{ fontSize:16,fontWeight:800,margin:"0 0 8px" }}>Growth Metrics</h3>
                <p style={{ fontSize:13,color:mutedCol,margin:"0 0 24px" }}>Real-time telemetry tracking revenue and user growth.</p>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }} id="anlg-dash">
                  {[
                    {label:"Monthly Recurring Revenue",val:"$42,000",trend:"+28% MoM",values:[30000, 32000, 35000, 38000, 40000, 42000],months:["Jan", "Feb", "Mar", "Apr", "May", "Jun"],color:"#6366F1",type:"bar"},
                    {label:"Active Users",val:"3,200",trend:"+18% MoM",values:[1200, 1600, 2000, 2400, 2800, 3200],months:["Jan", "Feb", "Mar", "Apr", "May", "Jun"],color:"#A855F7",type:"bar"},
                    {label:"Customer Acquisition Cost (CAC)",val:"$120",trend:"-14.2% (Improved)",values:[150, 142, 135, 128, 122, 120],months:["Jan", "Feb", "Mar", "Apr", "May", "Jun"],color:"#3B82F6",type:"line"},
                    {label:"Net Revenue Retention (NRR)",val:"118%",trend:"+2.4% MoM",values:[110, 112, 114, 115, 117, 118],months:["Jan", "Feb", "Mar", "Apr", "May", "Jun"],color:"#10B981",type:"line"},
                  ].map(m=>(
                    <GrowthChartCard
                      key={m.label}
                      label={m.label}
                      val={m.val}
                      trend={m.trend}
                      values={m.values}
                      months={m.months}
                      color={m.color}
                      dark={dark}
                      mutedCol={mutedCol}
                      textCol={textCol}
                      border={border}
                      type={m.type}
                    />
                  ))}
                </div>
              </div>

              <div className="fdp" style={{ padding:28 }}>
                <h3 style={{ fontSize:16,fontWeight:800,margin:"0 0 20px" }}>Investor Activity Feed</h3>
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  {[
                    {icon:"🔖",text:"Blume Ventures bookmarked your startup profile",time:"Just now"},
                    {icon:"📅",text:"Sequoia India requested a meeting for Seed extension details",time:"2 hrs ago"},
                    {icon:"📄",text:"Elevation Capital downloaded your Pitch Deck",time:"5 hrs ago"},
                    {icon:"👁️",text:"Nexus Venture Partners viewed your Monthly Revenue metrics",time:"1 day ago"},
                  ].map((act,i)=>(
                    <div key={i} style={{ display:"flex",gap:14,alignItems:"center" }}>
                      <div style={{ width:34,height:34,borderRadius:10,background:"rgba(99,102,241,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0 }} dangerouslySetInnerHTML={{__html:act.icon}}/>
                      <div><div style={{ fontSize:12,fontWeight:600 }}>{act.text}</div><div style={{ fontSize:10,color:mutedCol,marginTop:2 }}>{act.time}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <style>{`
                @media(max-width:1024px){#fdh{grid-template-columns:1fr!important}}
                @media(max-width:768px){#anlg-dash{grid-template-columns:1fr!important}}
              `}</style>
            </div>
          )}


          {activeTab==="My Startup"&&(
            <div className="fdin" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Header Action Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: dark ? "rgba(255,255,255,0.01)" : "#fff", border: `1px solid ${border}`, borderRadius: 16, padding: "16px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", margin: 0, color: textCol }}>Startup Profile</h2>
                  {isEditing && unsavedChanges && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", background: "rgba(245,158,11,0.1)", padding: "4px 10px", borderRadius: 100, display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} /> Unsaved Changes
                    </span>
                  )}
                  {saveStatus && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: saveStatus.includes("✓") ? "#10B981" : "#6366F1", background: saveStatus.includes("✓") ? "rgba(16,185,129,0.1)" : "rgba(99,102,241,0.1)", padding: "4px 10px", borderRadius: 100 }}>
                      {saveStatus}
                    </span>
                  )}
                </div>
                <div>
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditStartup({ ...startup });
                        setIsEditing(true);
                      }}
                      style={{
                        padding: "8px 18px", borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#A855F7)",
                        color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "none"}
                    >
                      ✍️ Edit Profile
                    </button>
                  ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={handleCancelChanges}
                        style={{
                          padding: "8px 16px", borderRadius: 10, background: "none",
                          border: `1.5px solid ${border}`, color: mutedCol, fontSize: 12, fontWeight: 700, cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        style={{
                          padding: "8px 18px", borderRadius: 10, background: "#10B981",
                          color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "transform 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "none"}
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {!isEditing ? (
                /* ───────────────────────────────────
                   VIEW MODE (Default PitchBook style)
                   ─────────────────────────────────── */
                <div className="fdin" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  {/* Cover Banner Card */}
                  <div className="fdp" style={{ padding: 0, overflow: "hidden", position: "relative", border: `1px solid ${border}`, borderRadius: 18 }}>
                    <div style={{ height: 160, background: "linear-gradient(135deg, #1E1B4B 0%, #311042 50%, #0F172A 100%)", position: "relative" }}>
                      <div style={{ position: "absolute", bottom: -40, left: 32, display: "flex", alignItems: "flex-end", gap: 20 }}>
                        {/* Logo Circle */}
                        <div style={{
                          width: 90, height: 90, borderRadius: 24,
                          background: startup.logoUrl ? `url(${startup.logoUrl}) center/cover no-repeat` : "linear-gradient(135deg,#6366F1,#A855F7)",
                          border: `4px solid ${dark ? "#080C19" : "#F3F4F6"}`,
                          display: "flex", alignItems: "center", justifyItems: "center",
                          justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#fff",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                          flexShrink: 0
                        }}>
                          {!startup.logoUrl && (startup.name ? startup.name.charAt(0).toUpperCase() : "S")}
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "54px 32px 28px", display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", margin: 0, color: textCol }}>{startup.name}</h1>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 100, background: "rgba(99,102,241,0.15)", color: "#6366F1" }}>
                          {startup.industry}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 100, background: "rgba(16,185,129,0.15)", color: "#10B981" }}>
                          {startup.stage} Stage
                        </span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: mutedCol, margin: "4px 0 10px" }}>{startup.tagline}</p>
                      
                      {/* Social Clickable Icon Buttons */}
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <a href={startup.website} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, color: textCol, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                          🌐 Website
                        </a>
                        <a href={startup.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, color: textCol, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                          💼 LinkedIn
                        </a>
                        <a href={startup.twitter} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", border: `1px solid ${border}`, color: textCol, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
                          🐦 Twitter
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Growth Metrics Row (KPI Cards) */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
                    {[
                      { label: "Valuation", val: startup.valuation && startup.valuation !== "0" ? `$${(parseFloat(startup.valuation)/1000000).toFixed(1)}M` : "Undisclosed", icon: "💎", color: "#6366F1" },
                      { label: "Total Funding", val: startup.fundingRaised && startup.fundingRaised !== "0" ? `$${(parseFloat(startup.fundingRaised)/1000000).toFixed(1)}M` : "$0", icon: "💰", color: "#EC4899" },
                      { label: "Monthly Revenue", val: startup.mrr && startup.mrr !== "0" ? `$${(parseFloat(startup.mrr)/1000).toFixed(0)}K MRR` : "$0 MRR", icon: "📈", color: "#10B981" },
                      { label: "Runway", val: startup.runway && startup.runway !== "0" ? `${startup.runway} months` : "N/A", icon: "⏱️", color: "#F59E0B" },
                      { label: "Active Users", val: startup.activeUsers && startup.activeUsers !== "0" ? parseInt(startup.activeUsers).toLocaleString() : "0", icon: "👥", color: "#3B82F6" },
                    ].map(card => (
                      <div key={card.label} className="fdp" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: mutedCol }}>{card.label}</span>
                          <span style={{ fontSize: 15 }}>{card.icon}</span>
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", margin: 0, color: card.color }}>
                          {card.val}
                        </h2>
                      </div>
                    ))}
                  </div>

                  {/* Two Column Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 24 }} id="sg-view-grid">
                    {/* Left Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {/* Overview */}
                      <div className="fdp" style={{ padding: 28 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", color: textCol }}>Company Overview</h3>
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: mutedCol, margin: 0 }}>{startup.description}</p>
                      </div>

                      {/* Problem & Solution Narrative */}
                      <div className="fdp" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 8px", color: "#EF4444" }}>The Problem Statement</h4>
                          <p style={{ fontSize: 13, lineHeight: 1.6, color: mutedCol, margin: 0 }}>{startup.problem}</p>
                        </div>
                        <div style={{ height: 1, background: border }} />
                        <div>
                          <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 8px", color: "#10B981" }}>VentureIQ Solution</h4>
                          <p style={{ fontSize: 13, lineHeight: 1.6, color: mutedCol, margin: 0 }}>{startup.solution}</p>
                        </div>
                      </div>

                      {/* Moat & USP / Target Audience */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} id="narrative-split">
                        <div className="fdp" style={{ padding: 20 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 800, margin: "0 0 10px", color: textCol }}>Unique Value Prop</h4>
                          <p style={{ fontSize: 12, lineHeight: 1.5, color: mutedCol, margin: 0 }}>{startup.tagline}</p>
                        </div>
                        <div className="fdp" style={{ padding: 20 }}>
                          <h4 style={{ fontSize: 12, fontWeight: 800, margin: "0 0 10px", color: textCol }}>Target Audience</h4>
                          <p style={{ fontSize: 12, lineHeight: 1.5, color: mutedCol, margin: 0 }}>{startup.targetAudience}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {/* Business Information Card */}
                      <div className="fdp" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px", color: textCol }}>Company Details</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {[
                            { label: "Founded Year", val: startup.founded, icon: "📅" },
                            { label: "HQ Location", val: startup.location, icon: "📍" },
                            { label: "Team Size", val: `${startup.teamSize} employees`, icon: "👥" },
                            { label: "Customer Growth Rate", val: `${startup.growthRate}% MoM`, icon: "📈" },
                            { label: "Business Model", val: startup.businessModel, icon: "🏢" },
                            { label: "Startup Stage", val: startup.startupStage, icon: "🚀" },
                            { label: "Market Size", val: startup.marketSize && startup.marketSize !== "0" ? `$${(parseFloat(startup.marketSize)/1000000000).toFixed(2)}B` : "N/A", icon: "🌐" },
                            { label: "Market Growth Rate", val: `${startup.marketGrowthRate}%`, icon: "📊" },
                            { label: "Number of Competitors", val: startup.competitorsCount, icon: "🏁" },
                            { label: "Founder Experience", val: `${startup.founderExperience} years`, icon: "🎓" },
                            { label: "Previous Startups", val: startup.previousStartups, icon: "💼" }
                          ].map((item, idx) => (
                            <div key={idx} style={{ display: "flex", justifyItems: "center", justifyContent: "space-between", fontSize: 12, paddingBottom: idx < 10 ? 12 : 0, borderBottom: idx < 10 ? `1px solid ${border}` : "none" }}>
                              <span style={{ color: mutedCol, display: "flex", alignItems: "center", gap: 6 }}>
                                <span>{item.icon}</span> {item.label}
                              </span>
                              <strong style={{ color: textCol }}>{item.val}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Technology Stack Card */}
                      <div className="fdp" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 14px", color: textCol }}>Technology Pipeline</h3>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {startup.techStack.split(",").map(t => (
                            <span key={t} style={{
                              fontSize: 10, fontWeight: 700, padding: "5px 12px", borderRadius: 100,
                              background: dark ? "rgba(99,102,241,0.08)" : "rgba(99,102,241,0.05)",
                              border: `1px solid ${dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}`,
                              color: "#6366F1"
                            }}>
                              {t.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Founder Profile Card */}
                      <div className="fdp" style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: "linear-gradient(135deg, #0EA5E9, #6366F1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14, fontWeight: 800, color: "#fff"
                        }}>
                          {initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: textCol }}>{rawName}</div>
                          <div style={{ fontSize: 11, color: mutedCol, marginTop: 2 }}>Founder & CEO</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <style>{`
                    @media(max-width:968px){
                      #sg-view-grid { grid-template-columns: 1fr !important; }
                    }
                    @media(max-width:480px){
                      #narrative-split { grid-template-columns: 1fr !important; }
                    }
                  `}</style>
                </div>
              ) : (
                /* ───────────────────────────────────
                   EDIT MODE (Interactive inputs)
                   ─────────────────────────────────── */
                <div className="fdp fdin" style={{ padding: 32, background: dark ? "rgba(255,255,255,0.01)" : "#fff", border: `1px solid ${border}`, borderRadius: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} id="sg-edit-grid">
                    {/* Logo & Cover Image Branding Section */}
                    <div style={{ gridColumn: "1/-1", display: "flex", gap: 20, alignItems: "center", padding: 20, borderRadius: 14, border: `1.5px dashed ${border}`, background: dark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)", marginBottom: 8 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: 16,
                        background: editStartup.logoUrl ? `url(${editStartup.logoUrl}) center/cover no-repeat` : "linear-gradient(135deg,#6366F1,#A855F7)",
                        border: `2px solid ${border}`,
                        display: "flex", alignItems: "center", justifyItems: "center",
                        justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff",
                        flexShrink: 0
                      }}>
                        {!editStartup.logoUrl && (editStartup.name ? editStartup.name.charAt(0).toUpperCase() : "S")}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 6px", color: textCol }}>Company Branding</h4>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <label style={{ padding: "6px 14px", background: "#6366F1", color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 8, cursor: "pointer", display: "inline-block" }}>
                            Upload Logo
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  handleFieldChange("logoUrl", reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }} />
                          </label>
                          {editStartup.logoUrl && (
                            <button onClick={() => handleFieldChange("logoUrl", "")} style={{ background: "none", border: `1px solid ${border}`, color: "#EF4444", fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}>
                              Reset Logo
                            </button>
                          )}
                          <span style={{ fontSize: 11, color: mutedCol }}>
                            {editStartup.logoUrl ? "Custom logo applied" : "Default letter avatar will be used"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Startup Name */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>STARTUP NAME</label>
                      <input className="fdi" value={editStartup.name} onChange={e => handleFieldChange("name", e.target.value)} />
                    </div>

                    {/* Tagline / USP */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>TAGLINE / ONE-LINE PITCH</label>
                      <input className="fdi" value={editStartup.tagline} onChange={e => handleFieldChange("tagline", e.target.value)} />
                    </div>

                    {/* Industry */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>INDUSTRY / SECTOR</label>
                      <select className="fdi" value={editStartup.industry} onChange={e => handleFieldChange("industry", e.target.value)} style={{ width: "100%", background: dark ? "#0A0F1E" : "#fff" }}>
                        <option value="B2B SaaS">B2B SaaS</option>
                        <option value="CleanTech">CleanTech</option>
                        <option value="FinTech">FinTech</option>
                        <option value="HealthTech">HealthTech</option>
                        <option value="AgriTech">AgriTech</option>
                        <option value="Logistics AI">Logistics AI</option>
                        <option value="AI & Machine Learning">AI & Machine Learning</option>
                        <option value="Proptech">Proptech</option>
                      </select>
                    </div>

                    {/* Funding Stage */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>FUNDING STAGE</label>
                      <select className="fdi" value={editStartup.stage} onChange={e => handleFieldChange("stage", e.target.value)} style={{ width: "100%", background: dark ? "#0A0F1E" : "#fff" }}>
                        <option value="Pre-Seed">Pre-Seed</option>
                        <option value="Seed">Seed</option>
                        <option value="Series A">Series A</option>
                        <option value="Series B">Series B</option>
                        <option value="Late Stage">Late Stage</option>
                      </select>
                    </div>

                    {/* Valuation */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>VALUATION (USD)</label>
                      <input type="number" className="fdi" value={editStartup.valuation} onChange={e => handleFieldChange("valuation", e.target.value)} />
                    </div>

                    {/* Total Funding Raised */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>TOTAL FUNDING RAISED (USD)</label>
                      <input type="number" className="fdi" value={editStartup.fundingRaised} onChange={e => handleFieldChange("fundingRaised", e.target.value)} />
                    </div>

                    {/* MRR */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>MONTHLY REVENUE (MRR USD)</label>
                      <input type="number" className="fdi" value={editStartup.mrr} onChange={e => handleFieldChange("mrr", e.target.value)} />
                    </div>

                    {/* Burn Rate */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>MONTHLY BURN RATE (USD)</label>
                      <input type="number" className="fdi" value={editStartup.burn} onChange={e => handleFieldChange("burn", e.target.value)} />
                    </div>

                    {/* Runway */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>RUNWAY (MONTHS)</label>
                      <input type="number" className="fdi" value={editStartup.runway} onChange={e => handleFieldChange("runway", e.target.value)} />
                    </div>

                    {/* Active Users */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>ACTIVE USERS</label>
                      <input type="number" className="fdi" value={editStartup.activeUsers} onChange={e => handleFieldChange("activeUsers", e.target.value)} />
                    </div>

                    {/* Growth Rate */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>CUSTOMER GROWTH RATE (% MoM)</label>
                      <input type="number" className="fdi" value={editStartup.growthRate} onChange={e => handleFieldChange("growthRate", e.target.value)} />
                    </div>

                    {/* Team Size */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>TEAM SIZE (EMPLOYEES)</label>
                      <input type="number" className="fdi" value={editStartup.teamSize} onChange={e => handleFieldChange("teamSize", e.target.value)} />
                    </div>

                    {/* Location */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>HEADQUARTERS LOCATION</label>
                      <input className="fdi" value={editStartup.location} onChange={e => handleFieldChange("location", e.target.value)} />
                    </div>

                    {/* Founded Year */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>FOUNDED YEAR</label>
                      <input type="number" className="fdi" value={editStartup.founded} onChange={e => handleFieldChange("founded", e.target.value)} />
                    </div>

                    {/* Website */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>WEBSITE URL</label>
                      <input className="fdi" value={editStartup.website} onChange={e => handleFieldChange("website", e.target.value)} />
                    </div>

                    {/* Startup Stage */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>STARTUP STAGE</label>
                      <select className="fdi" value={editStartup.startupStage} onChange={e => handleFieldChange("startupStage", e.target.value)} style={{ width: "100%", background: dark ? "#0A0F1E" : "#fff" }}>
                        <option value="Idea Phase">Idea Phase</option>
                        <option value="Prototype/MVP">Prototype/MVP</option>
                        <option value="Early Traction">Early Traction</option>
                        <option value="Growth Stage">Growth Stage</option>
                        <option value="Expansion">Expansion</option>
                      </select>
                    </div>

                    {/* Business Model */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>BUSINESS MODEL</label>
                      <input className="fdi" value={editStartup.businessModel} onChange={e => handleFieldChange("businessModel", e.target.value)} />
                    </div>

                    {/* Market Size */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>MARKET SIZE (USD)</label>
                      <input type="number" className="fdi" value={editStartup.marketSize} onChange={e => handleFieldChange("marketSize", e.target.value)} />
                    </div>

                    {/* Market Growth Rate */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>MARKET GROWTH RATE (% YoY)</label>
                      <input type="number" className="fdi" value={editStartup.marketGrowthRate} onChange={e => handleFieldChange("marketGrowthRate", e.target.value)} />
                    </div>

                    {/* Number of Competitors */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>NUMBER OF COMPETITORS</label>
                      <input type="number" className="fdi" value={editStartup.competitorsCount} onChange={e => handleFieldChange("competitorsCount", e.target.value)} />
                    </div>

                    {/* Founder Experience */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>FOUNDER EXPERIENCE (YEARS)</label>
                      <input type="number" className="fdi" value={editStartup.founderExperience} onChange={e => handleFieldChange("founderExperience", e.target.value)} />
                    </div>

                    {/* Previous Startups */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>PREVIOUS STARTUPS LAUNCHED</label>
                      <input type="number" className="fdi" value={editStartup.previousStartups} onChange={e => handleFieldChange("previousStartups", e.target.value)} />
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>LINKEDIN PAGE URL</label>
                      <input className="fdi" value={editStartup.linkedin} onChange={e => handleFieldChange("linkedin", e.target.value)} />
                    </div>

                    {/* Twitter */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>TWITTER URL</label>
                      <input className="fdi" value={editStartup.twitter} onChange={e => handleFieldChange("twitter", e.target.value)} />
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>TECHNOLOGY STACK (COMMA-SEPARATED)</label>
                      <input className="fdi" value={editStartup.techStack} onChange={e => handleFieldChange("techStack", e.target.value)} />
                    </div>

                    {/* Target Audience */}
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>TARGET AUDIENCE</label>
                      <input className="fdi" value={editStartup.targetAudience} onChange={e => handleFieldChange("targetAudience", e.target.value)} />
                    </div>

                    {/* Company Description */}
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>COMPANY DESCRIPTION</label>
                      <textarea className="fdi" rows={4} value={editStartup.description} onChange={e => handleFieldChange("description", e.target.value)} style={{ resize: "vertical" }} />
                    </div>

                    {/* Problem Statement */}
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>THE PROBLEM STATEMENT</label>
                      <textarea className="fdi" rows={3} value={editStartup.problem} onChange={e => handleFieldChange("problem", e.target.value)} style={{ resize: "vertical" }} />
                    </div>

                    {/* Solution Statement */}
                    <div style={{ gridColumn: "1/-1" }}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: mutedCol, marginBottom: 8, letterSpacing: "0.5px" }}>VENTUREIQ SOLUTION STATEMENT</label>
                      <textarea className="fdi" rows={3} value={editStartup.solution} onChange={e => handleFieldChange("solution", e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                  </div>
                  <style>{`
                    @media(max-width:768px){
                      #sg-edit-grid { grid-template-columns: 1fr !important; }
                    }
                  `}</style>
                </div>
              )}
            </div>
          )}

          {activeTab==="AI Analysis"&&(
            <div className="fdin" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Premium Header Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: dark ? "rgba(255,255,255,0.01)" : "#fff", border: `1px solid ${border}`, borderRadius: 18, padding: "20px 28px" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", margin: 0, color: textCol }}>🤖 Startup Analysis</h2>
                  {analysisStatus.has_history && !loadingAnalysis && (
                    <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: mutedCol }}>
                      <span>Last Analysis: <strong>{analysisStatus.latest_prediction.prediction_date}</strong></span>
                      <span>Model Version: <strong>{analysisStatus.latest_prediction.model_version}</strong></span>
                      <span>Prediction ID: <strong style={{ color: "#6366F1" }}>{analysisStatus.latest_prediction.prediction_id}</strong></span>
                    </div>
                  )}
                </div>
                {analysisStatus.is_valid && analysisStatus.has_history && !loadingAnalysis && (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={predicting}
                    style={{
                      padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg,#6366F1,#A855F7)",
                      color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: predicting ? "default" : "pointer", transition: "all 0.2s"
                    }}
                  >
                    {predicting ? "Running..." : "Run New Analysis"}
                  </button>
                )}
              </div>

              {/* Outdated Profile Notification Banner */}
              {analysisStatus.has_history && analysisStatus.is_outdated && !loadingAnalysis && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderRadius: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#F59E0B" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                    ⚠️ Your startup profile has changed since your last AI analysis. Run a new analysis to refresh your AI insights.
                  </span>
                  <button onClick={handleRunAnalysis} disabled={predicting} style={{ background: "#F59E0B", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Run New Analysis
                  </button>
                </div>
              )}

              {loadingAnalysis ? (
                /* LOADING SHIMMER STATE */
                <div className="fdp" style={{ padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid rgba(99,102,241,0.1)", borderTopColor: "#6366F1", animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: 13, color: mutedCol, fontWeight: 600 }}>Loading AI due diligence report...</span>
                  <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
                </div>
              ) : !analysisStatus.is_valid ? (
                /* ───────────────────────────────────
                   MISSING DATA STATE (Validation checklist error)
                   ─────────────────────────────────── */
                <div className="fdp fdin" style={{ padding: 36, display: "flex", flexDirection: "column", gap: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, margin: "0 0 6px", color: textCol }}>Analysis Requirements</h3>
                    <p style={{ fontSize: 12, color: mutedCol, margin: 0 }}>Complete all required startup profile fields to unlock AI success analysis and due diligence reporting.</p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                    {analysisStatus.checklist.map(item => (
                      <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 10, border: `1.5px solid ${item.status === 'valid' ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`, background: item.status === 'valid' ? "rgba(16,185,129,0.02)" : "rgba(239,68,68,0.02)" }}>
                        <span style={{ fontSize: 14, color: item.status === 'valid' ? "#10B981" : "#EF4444", fontWeight: 900 }}>
                          {item.status === 'valid' ? "✓" : "✗"}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: textCol }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab("My Startup")}
                    style={{
                      padding: "12px 24px", background: "#6366F1", color: "#fff", border: "none",
                      borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", marginTop: 10
                    }}
                  >
                    Complete Startup Profile
                  </button>
                </div>
              ) : !analysisStatus.has_history ? (
                /* ───────────────────────────────────
                   FIRST-TIME USER ONBOARDING STATE
                   ─────────────────────────────────── */
                <div className="fdp fdin" style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                  <div style={{ fontSize: 54 }}>🤖</div>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", margin: "0 0 6px", color: textCol }}>Run Your First Analysis</h3>
                    <p style={{ fontSize: 13, color: mutedCol, maxWidth: 500, margin: "0 auto", lineHeight: 1.6 }}>
                      Generate an AI-powered due diligence report utilizing our Random Forest model to discover:
                    </p>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 460, textAlign: "left", fontSize: 12, color: mutedCol, margin: "10px 0" }}>
                    {["Success Probability", "Risk Assessment", "AI Recommendations", "Startup Health", "Investment Readiness", "Executive Summary"].map(benefit => (
                      <div key={benefit} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "#6366F1" }}>•</span> {benefit}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={predicting}
                    style={{
                      padding: "12px 32px", background: "linear-gradient(135deg,#6366F1,#A855F7)",
                      color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: predicting ? "default" : "pointer"
                    }}
                  >
                    {predicting ? "Generating Report..." : "Analyze Startup"}
                  </button>
                </div>
              ) : (
                /* ───────────────────────────────────
                   REPORT PRESENTATION MODE
                   ─────────────────────────────────── */
                <div className="fdin" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  
                  {/* Executive Summary Card */}
                  <div className="fdp" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", color: textCol }}>Executive Summary</h3>
                    <p style={{ fontSize: 13, lineHeight: 1.7, color: mutedCol, margin: 0 }}>
                      {analysisStatus.latest_prediction.executive_summary}
                    </p>
                  </div>

                  {/* Main Grid: Success Probability & Health scores */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 24 }} id="prediction-results-grid">
                    
                    {/* Success Probability */}
                    <div className="fdp" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", justifyContent: "center" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 16px", alignSelf: "flex-start", color: textCol }}>Success Probability</h3>
                      <div style={{ position: "relative", width: 190, height: 190, marginBottom: 18 }}>
                        <svg width="190" height="190" style={{ transform: "rotate(-90deg)" }}>
                          <circle cx="95" cy="95" r="82" fill="none" stroke={dark ? "rgba(255,255,255,0.04)" : "#E5E7EB"} strokeWidth="12" />
                          <circle cx="95" cy="95" r="82" fill="none" stroke="url(#predGrad)" strokeWidth="12" strokeLinecap="round" strokeDasharray={2 * Math.PI * 82} strokeDashoffset={(2 * Math.PI * 82) * (1 - (analysisStatus.latest_prediction.success_score) / 100)} />
                          <defs>
                            <linearGradient id="predGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#6366F1" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyitems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 44, fontWeight: 900, fontFamily: "'Space Grotesk',sans-serif", color: "#10B981" }}>
                            {analysisStatus.latest_prediction.success_score}%
                          </span>
                          <span style={{ fontSize: 9, color: mutedCol, letterSpacing: 0.5 }}>CLASSIFIER RATIO</span>
                        </div>
                      </div>
                      <span style={{
                        padding: "5px 14px", borderRadius: 100,
                        background: (analysisStatus.latest_prediction.success_score >= 60) ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                        color: (analysisStatus.latest_prediction.success_score >= 60) ? "#10B981" : "#EF4444",
                        fontSize: 10, fontWeight: 800, textTransform: "uppercase"
                      }}>
                        ● Model label: {analysisStatus.latest_prediction.success_score >= 60 ? "Successful Outbreak" : "High Risk Warning"}
                      </span>
                      <div style={{ fontSize: 11, color: mutedCol, marginTop: 14 }}>
                        Confidence Score: <strong>{analysisStatus.latest_prediction.success_score >= 60 ? 88 : 74}%</strong>
                      </div>
                    </div>

                    {/* Startup Health Score */}
                    <div className="fdp" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: textCol }}>Startup Health Index</h3>
                        <span style={{ fontSize: 18, fontWeight: 900, color: "#6366F1", fontFamily: "'Space Grotesk',sans-serif" }}>
                          {analysisStatus.latest_prediction.startup_health}/100
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { label: "Growth Health Index", val: analysisStatus.latest_prediction.health_growth, color: "#10B981" },
                          { label: "Financial runway Health", val: analysisStatus.latest_prediction.health_financial, color: "#3B82F6" },
                          { label: "Market Competitiveness Index", val: analysisStatus.latest_prediction.health_market, color: "#EC4899" },
                          { label: "Team Structure Health", val: analysisStatus.latest_prediction.health_team, color: "#F59E0B" },
                          { label: "Product & Tech stack health", val: analysisStatus.latest_prediction.health_product, color: "#6366F1" }
                        ].map(metric => (
                          <div key={metric.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                              <span style={{ color: mutedCol, fontWeight: 600 }}>{metric.label}</span>
                              <strong style={{ color: metric.color }}>{metric.val}%</strong>
                            </div>
                            <div style={{ height: 6, borderRadius: 100, background: dark ? "rgba(255,255,255,0.04)" : "#E5E7EB" }}>
                              <div style={{ height: "100%", width: `${metric.val}%`, background: metric.color, borderRadius: 100 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mid Row: Risk & Investment Readiness */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} id="pred-mid-grid">
                    {/* Risk Assessment */}
                    <div className="fdp" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: textCol }}>Risk Assessment</h3>
                        <span style={{
                          padding: "4px 10px", borderRadius: 100,
                          background: analysisStatus.latest_prediction.risk_level === "High" ? "rgba(239,68,68,0.15)" : analysisStatus.latest_prediction.risk_level === "Medium" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)",
                          color: analysisStatus.latest_prediction.risk_level === "High" ? "#EF4444" : analysisStatus.latest_prediction.risk_level === "Medium" ? "#F59E0B" : "#10B981",
                          fontSize: 11, fontWeight: 800
                        }}>
                          {analysisStatus.latest_prediction.risk_level} Risk
                        </span>
                      </div>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: mutedCol, margin: 0 }}>
                        The startup runway capacity and competitive density parameter returns a <strong>{analysisStatus.latest_prediction.risk_level.toLowerCase()} risk profile</strong> rating. Operational burn rates are actively tracked against historical benchmarks.
                      </p>
                    </div>

                    {/* Investment Readiness */}
                    <div className="fdp" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: textCol }}>Investment Readiness</h3>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#10B981", fontFamily: "'Space Grotesk',sans-serif" }}>
                          {analysisStatus.latest_prediction.investment_readiness}% Ready
                        </span>
                      </div>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: mutedCol, margin: 0 }}>
                        Calculated directly from profile completeness, recurring MRR levels, presence of documents (deck, financials), team size metrics, and site configurations.
                      </p>
                    </div>
                  </div>

                  {/* Two Column details: Strengths / Weaknesses & Feature importance */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }} id="pred-bottom-grid">
                    
                    {/* Strengths & Weaknesses */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {/* Strengths */}
                      <div className="fdp" style={{ padding: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 12px", color: "#10B981" }}>Key Strengths</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {analysisStatus.latest_prediction.strengths.map((str, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: mutedCol, display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ color: "#10B981" }}>✓</span> {str}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Weaknesses */}
                      <div className="fdp" style={{ padding: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 12px", color: "#EF4444" }}>Areas to Improve</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {analysisStatus.latest_prediction.weaknesses.map((weak, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: mutedCol, display: "flex", gap: 6, alignItems: "center" }}>
                              <span style={{ color: "#EF4444" }}>✗</span> {weak}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Feature Importance & Recommendations */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      
                      {/* Feature Importance */}
                      <div className="fdp" style={{ padding: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 16px", color: textCol }}>Model Feature Importance</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                          {Object.entries(analysisStatus.latest_prediction.feature_importance).map(([feat, imp]) => (
                            <div key={feat}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: mutedCol }}>{feat}</span>
                                <strong>{imp}%</strong>
                              </div>
                              <div style={{ height: 4, borderRadius: 100, background: dark ? "rgba(255,255,255,0.04)" : "#E5E7EB" }}>
                                <div style={{ height: "100%", width: `${imp}%`, background: "#6366F1", borderRadius: 100 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="fdp" style={{ padding: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 12px", color: "#6366F1" }}>Consultant Recommendations</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {analysisStatus.latest_prediction.recommendations.map((rec, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: mutedCol, lineHeight: 1.5, background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)", padding: 12, borderRadius: 8, borderLeft: "3.5px solid #6366F1" }}>
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  <style>{`
                    @media(max-width:968px){
                      #pred-mid-grid, #pred-bottom-grid { grid-template-columns: 1fr !important; }
                    }
                  `}</style>
                </div>
              )}
            </div>
          )}


          {activeTab==="Investor Matches"&&(
            <div className="fdin" style={{ display:"flex",flexDirection:"column",gap:24 }}>
              <div>
                <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4 }}>Investor Matching Platform</h2>
                <p style={{ fontSize:13,color:mutedCol }}>AI-matched investors based on your stage, sector, and thesis alignment.</p>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20 }}>
                {[
                  {name:"Sequoia India",fit:"98%",stage:"Seed / Series A",ticket:"$1M \u2013 $5M",location:"Bangalore",focus:"B2B SaaS, AI"},
                  {name:"Nexus Venture Partners",fit:"94%",stage:"Early / Growth",ticket:"$2M \u2013 $8M",location:"Mumbai",focus:"Enterprise, SaaS"},
                  {name:"Blume Ventures",fit:"91%",stage:"Pre-Seed / Seed",ticket:"$300K \u2013 $1.5M",location:"Mumbai",focus:"Deeptech, B2B"},
                  {name:"Elevation Capital",fit:"88%",stage:"Seed / Series A",ticket:"$1M \u2013 $4M",location:"Gurugram",focus:"Consumer, Fintech"},
                  {name:"Accel India",fit:"84%",stage:"Seed / Series A+",ticket:"$1M \u2013 $10M",location:"Bangalore",focus:"SaaS, B2B"},
                  {name:"Matrix Partners",fit:"79%",stage:"Series A / B",ticket:"$3M \u2013 $15M",location:"Mumbai",focus:"Growth Stage"},
                ].map(inv=>(
                  <div key={inv.name} className="fdp fdph" style={{ padding:22 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                      <div><div style={{ fontSize:15,fontWeight:800,marginBottom:2 }}>{inv.name}</div><div style={{ fontSize:10,color:mutedCol }}>{inv.location}</div></div>
                      <span style={{ fontSize:12,fontWeight:900,color:"#10B981" }}>{inv.fit}</span>
                    </div>
                    <div style={{ fontSize:11,display:"flex",flexDirection:"column",gap:5,marginBottom:16,color:mutedCol }}>
                      <div>Stage: <strong style={{ color:textCol }}>{inv.stage}</strong></div>
                      <div>Ticket: <strong style={{ color:textCol }}>{inv.ticket}</strong></div>
                      <div>Focus: <strong style={{ color:textCol }}>{inv.focus}</strong></div>
                    </div>
                    <div style={{ display:"flex",gap:8 }}>
                      <button onClick={()=>alert(`Connect request sent to ${inv.name}`)} style={{ flex:1,padding:"9px 0",background:"#6366F1",color:"#fff",border:"none",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer" }}>Connect</button>
                      <button onClick={()=>{setActiveTab("Messages");setActiveChatId(1);}} style={{ padding:"9px 14px",border:`1.5px solid ${border}`,background:"none",color:mutedCol,borderRadius:9,fontSize:11,cursor:"pointer" }}>Chat</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="Analytics"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Growth Metrics</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:28 }}>Real-time telemetry tracking revenue and user growth.</p>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24 }} id="anlg">
                {[
                  {label:"Monthly Recurring Revenue",val:"$42,000",trend:"+28% MoM",bars:[30,36,42,51,60,72],color:"#6366F1"},
                  {label:"Active Users",val:"3,200",trend:"+18% MoM",bars:[40,48,56,62,74,88],color:"#A855F7"},
                  {label:"Investor Profile Views",val:"14,200",trend:"+12.4% MoM",bars:[50,55,62,70,80,91],color:"#3B82F6"},
                  {label:"Pitch Deck Downloads",val:"128",trend:"+31 this week",bars:[20,35,45,60,80,95],color:"#10B981"},
                ].map(m=>(
                  <div key={m.label} className="fdp" style={{ padding:22 }}>
                    <div style={{ fontSize:12,color:mutedCol,fontWeight:700,marginBottom:6 }}>{m.label}</div>
                    <div style={{ fontSize:24,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4 }}>{m.val}</div>
                    <div style={{ fontSize:10,color:"#10B981",fontWeight:700,marginBottom:16 }}>{m.trend}</div>
                    <div style={{ height:60,display:"flex",alignItems:"flex-end",gap:6 }}>
                      {m.bars.map((h,i)=><div key={i} style={{ flex:1,height:`${h}%`,background:m.color,borderRadius:4,opacity:0.7+i*0.05 }}/>)}
                    </div>
                  </div>
                ))}
              </div>
              <style>{`@media(max-width:768px){#anlg{grid-template-columns:1fr!important}}`}</style>
            </div>
          )}

          {activeTab==="Funding"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Funding Tracker</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:28 }}>Track your active round and cap table metrics.</p>
              <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:520 }}>
                {[
                  {label:"Round raised progress",pct:52,val:"$1.04M / $2M",color:"#6366F1"},
                  {label:"Lead investor commitment",pct:75,val:"$750K committed",color:"#A855F7"},
                  {label:"Runway remaining",pct:68,val:"14 months",color:"#10B981"},
                ].map(r=>(
                  <div key={r.label}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:700,marginBottom:8 }}>
                      <span>{r.label}</span><span style={{ color:r.color }}>{r.val}</span>
                    </div>
                    <div style={{ height:10,borderRadius:100,background:dark?"rgba(255,255,255,0.04)":"#E5E7EB" }}>
                      <div style={{ height:"100%",width:`${r.pct}%`,background:r.color,borderRadius:100 }}/>
                    </div>
                  </div>
                ))}
                <div style={{ padding:20,borderRadius:14,border:`1px solid ${border}`,background:dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)",marginTop:8 }}>
                  <h4 style={{ fontSize:13,fontWeight:800,marginBottom:12 }}>Round Details</h4>
                  <ul style={{ paddingLeft:16,margin:0,fontSize:12,display:"flex",flexDirection:"column",gap:8,color:mutedCol }}>
                    <li>Lead Investor: <strong style={{ color:textCol }}>Sequoia India</strong></li>
                    <li>Round Valuation: <strong style={{ color:textCol }}>$4.5M Pre-Money</strong></li>
                    <li>Instrument: <strong style={{ color:textCol }}>Equity (Seed)</strong></li>
                    <li>Close Target: <strong style={{ color:textCol }}>August 31, 2025</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab==="Pitch Deck"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Pitch Deck Optimizer</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:28 }}>Generate AI-optimized pitch hooks based on your startup thesis.</p>
              <div style={{ maxWidth:600,display:"flex",flexDirection:"column",gap:16 }}>
                <div>
                  <label style={{ display:"block",fontSize:11,fontWeight:700,color:mutedCol,marginBottom:6 }}>PITCH OBJECTIVE</label>
                  <textarea className="fdi" rows={4} value={pitchPrompt} onChange={e=>setPitchPrompt(e.target.value)} placeholder="Describe the problem your startup solves..." style={{ resize:"none",lineHeight:1.5 }}/>
                </div>
                <button onClick={generatePitch} disabled={generatingPitch||!pitchPrompt.trim()} style={{ padding:"12px 24px",background:generatingPitch?mutedCol:"#6366F1",color:"#fff",border:"none",borderRadius:10,cursor:generatingPitch?"default":"pointer",fontWeight:700,fontSize:12,alignSelf:"flex-start" }}>
                  {generatingPitch?"Generating...":"Generate AI Pitch Hook"}
                </button>
                {pitchOutput&&<pre style={{ padding:20,borderRadius:12,background:dark?"rgba(99,102,241,0.05)":"rgba(99,102,241,0.03)",border:`1px solid rgba(99,102,241,0.2)`,fontSize:12,color:textCol,whiteSpace:"pre-wrap",lineHeight:1.7 }}>{pitchOutput}</pre>}
              </div>
            </div>
          )}

          {activeTab==="AI Pitch Video"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>AI Pitch Video Studio</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:28 }}>Generate digital avatar pitch videos for your investor meetings.</p>
              <div style={{ display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:28 }} id="vg">
                <div>
                  <h4 style={{ fontSize:14,fontWeight:800,marginBottom:12 }}>Script Builder</h4>
                  <textarea className="fdi" rows={7} placeholder={`Hi, I'm ${rawName}, founder of ${rawCompany}. We're building the future of B2B procurement...`} style={{ resize:"none",lineHeight:1.6 }}/>
                  <div style={{ display:"flex",gap:10,marginTop:14 }}>
                    <button onClick={()=>alert("Avatar synthesis queued. Video will be ready in ~2 minutes.")} style={{ padding:"10px 20px",background:"#6366F1",color:"#fff",border:"none",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer" }}>Synthesize Video</button>
                    <button style={{ padding:"10px 16px",background:"none",border:`1.5px solid ${border}`,borderRadius:9,color:mutedCol,fontSize:12,cursor:"pointer" }}>Upload Script</button>
                  </div>
                </div>
                <div style={{ padding:24,borderRadius:14,border:`1.5px dashed ${border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:220,textAlign:"center",gap:10 }}>
                  <span style={{ fontSize:36 }}>🎥</span>
                  <div style={{ fontSize:14,fontWeight:700 }}>Preview Frame</div>
                  <span style={{ fontSize:12,color:mutedCol }}>Complete the script and synthesize your AI avatar video.</span>
                </div>
              </div>
              <style>{`@media(max-width:768px){#vg{grid-template-columns:1fr!important}}`}</style>
            </div>
          )}

          {activeTab==="Comparison"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Competitor Analysis</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:28 }}>Benchmark your startup against industry competitors.</p>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ borderBottom:`2px solid ${border}` }}>
                      <th style={{ padding:14,color:mutedCol,textAlign:"left",fontWeight:700 }}>Metric</th>
                      <th style={{ padding:14,color:"#6366F1",textAlign:"left",fontWeight:900 }}>{rawCompany} (You)</th>
                      <th style={{ padding:14,color:mutedCol,textAlign:"left",fontWeight:700 }}>DeliverX</th>
                      <th style={{ padding:14,color:mutedCol,textAlign:"left",fontWeight:700 }}>RushFlow AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {metric:"AI Attractiveness Score",you:"91%",c1:"82%",c2:"78%"},
                      {metric:"MRR",you:"$42K",c1:"$38K",c2:"$29K"},
                      {metric:"MoM Growth",you:"28%",c1:"22%",c2:"18%"},
                      {metric:"Active Users",you:"3,200",c1:"2,800",c2:"1,900"},
                      {metric:"Funding Stage",you:"Seed",c1:"Series A",c2:"Seed"},
                      {metric:"Team Size",you:"8",c1:"14",c2:"6"},
                      {metric:"Investor Matches",you:"14",c1:"9",c2:"7"},
                    ].map((row,i)=>(
                      <tr key={i} style={{ borderBottom:`1px solid ${border}` }}>
                        <td style={{ padding:14,fontWeight:600,color:mutedCol }}>{row.metric}</td>
                        <td style={{ padding:14,fontWeight:800,color:"#6366F1" }}>{row.you}</td>
                        <td style={{ padding:14,color:mutedCol }}>{row.c1}</td>
                        <td style={{ padding:14,color:mutedCol }}>{row.c2}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab==="Documents"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12 }}>
                <div>
                  <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4 }}>Documents</h2>
                  <p style={{ fontSize:13,color:mutedCol }}>Upload and manage pitch decks, financials, and legal documents.</p>
                </div>
                <label style={{ padding:"10px 18px",background:"#6366F1",color:"#fff",fontSize:12,fontWeight:700,borderRadius:10,cursor:"pointer" }}>
                  Upload File <input type="file" onChange={handleUpload} style={{ display:"none" }}/>
                </label>
              </div>
              {uploadingName&&(
                <div style={{ padding:16,borderRadius:12,background:"rgba(99,102,241,0.06)",border:`1px solid ${border}`,marginBottom:20 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6 }}>
                    <span style={{ fontWeight:600 }}>Uploading: {uploadingName}</span><span>{uploadProgress}%</span>
                  </div>
                  <div style={{ height:6,background:border,borderRadius:100,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${uploadProgress}%`,background:"#6366F1",borderRadius:100 }}/>
                  </div>
                </div>
              )}
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                {documents.map((doc,i)=>(
                  <div key={i} style={{ padding:16,borderRadius:12,border:`1px solid ${border}`,background:dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13,fontWeight:700 }}>📄 {doc.name}</div>
                      <div style={{ fontSize:10,color:mutedCol,marginTop:4 }}>{doc.type} · {doc.size} · {doc.date}</div>
                    </div>
                    <span style={{ fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:100,background:doc.status==="Verified"?"rgba(16,185,129,0.1)":"rgba(245,158,11,0.1)",color:doc.status==="Verified"?"#10B981":"#F59E0B" }}>{doc.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="Messages"&&(
            <div className="fdp fdin" style={{ padding:0,height:520,display:"flex",overflow:"hidden" }}>
              <div style={{ width:220,borderRight:`1px solid ${border}`,display:"flex",flexDirection:"column",flexShrink:0 }}>
                <div style={{ padding:"16px 16px 12px",fontSize:13,fontWeight:800,borderBottom:`1px solid ${border}` }}>Messages</div>
                {chats.map(chat=>(
                  <button key={chat.id} onClick={()=>setActiveChatId(chat.id)} style={{ padding:"14px 16px",border:"none",cursor:"pointer",textAlign:"left",background:activeChatId===chat.id?(dark?"rgba(99,102,241,0.1)":"rgba(99,102,241,0.05)"):"transparent",color:activeChatId===chat.id?"#6366F1":textCol,borderBottom:`1px solid ${border}`,display:"flex",flexDirection:"column",gap:3 }}>
                    <strong style={{ fontSize:12 }}>{chat.name}</strong>
                    <span style={{ fontSize:10,color:mutedCol }}>{chat.role}</span>
                    <span style={{ fontSize:10,color:mutedCol,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",width:180 }}>{chat.last}</span>
                  </button>
                ))}
              </div>
              <div style={{ flex:1,display:"flex",flexDirection:"column" }}>
                <div style={{ padding:"14px 20px",borderBottom:`1px solid ${border}`,fontSize:13,fontWeight:700 }}>
                  {chats.find(c=>c.id===activeChatId)?.name}
                  <span style={{ fontSize:10,color:mutedCol,marginLeft:8 }}>{chats.find(c=>c.id===activeChatId)?.role}</span>
                </div>
                <div style={{ flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12 }}>
                  {(messagesLog[activeChatId]||[]).map((msg,i)=>(
                    <div key={i} style={{ display:"flex",justifyContent:msg.sender==="me"?"flex-end":"flex-start" }}>
                      <div style={{ maxWidth:"72%",padding:"10px 14px",borderRadius:14,fontSize:12,lineHeight:1.5,background:msg.sender==="me"?"linear-gradient(135deg,#6366F1,#A855F7)":(dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.04)"),color:msg.sender==="me"?"#fff":textCol,borderBottomRightRadius:msg.sender==="me"?4:14,borderBottomLeftRadius:msg.sender==="them"?4:14 }}>
                        <div>{msg.text}</div>
                        <div style={{ fontSize:9,marginTop:4,opacity:0.65,textAlign:msg.sender==="me"?"right":"left" }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} style={{ padding:"12px 20px",borderTop:`1px solid ${border}`,display:"flex",gap:10 }}>
                  <input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Type a message..."
                    style={{ flex:1,padding:"10px 14px",borderRadius:10,fontSize:12,background:dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)",border:`1px solid ${border}`,color:textCol,outline:"none" }}/>
                  <button type="submit" style={{ padding:"0 18px",background:"#6366F1",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer" }}>Send</button>
                </form>
              </div>
            </div>
          )}

          {activeTab==="Calendar"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Investor Meetings</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:24 }}>Scheduled calls and upcoming investor touchpoints.</p>
              <div style={{ display:"flex",flexDirection:"column",gap:14,maxWidth:560 }}>
                {[
                  {title:"Demo Call with Sequoia India",date:"Thursday, July 10 \u00b7 4:00 PM",badge:"Pitch Review",color:"#6366F1"},
                  {title:"Blume Ventures Intro Chat",date:"Monday, July 14 \u00b7 11:30 AM",badge:"Intro Call",color:"#A855F7"},
                  {title:"Elevation Capital Follow-up",date:"Wednesday, July 16 \u00b7 3:00 PM",badge:"Follow-up",color:"#3B82F6"},
                  {title:"VentureIQ Pitch Day",date:"Friday, July 18 \u00b7 10:00 AM",badge:"Event",color:"#10B981"},
                ].map((ev,i)=>(
                  <div key={i} style={{ padding:18,borderRadius:14,border:`1px solid ${border}`,background:dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)",display:"flex",gap:16,alignItems:"center" }}>
                    <div style={{ width:4,height:48,borderRadius:100,background:ev.color,flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <strong style={{ fontSize:13 }}>{ev.title}</strong>
                      <div style={{ fontSize:11,color:mutedCol,marginTop:3 }}>{ev.date}</div>
                    </div>
                    <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:100,background:`${ev.color}18`,color:ev.color }}>{ev.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="Tasks"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Tasks Checklist</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:24 }}>{tasks.filter(t=>t.done).length} of {tasks.length} tasks completed.</p>
              <div style={{ display:"flex",flexDirection:"column",gap:12,maxWidth:600 }}>
                {tasks.map(t=>(
                  <label key={t.id} style={{ padding:16,borderRadius:12,border:`1px solid ${border}`,background:dark?"rgba(255,255,255,0.01)":"rgba(0,0,0,0.01)",display:"flex",alignItems:"center",gap:12,cursor:"pointer",userSelect:"none" }}>
                    <input type="checkbox" checked={t.done} onChange={()=>toggleTask(t.id)} style={{ accentColor:"#6366F1",cursor:"pointer",width:16,height:16 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13,fontWeight:600,textDecoration:t.done?"line-through":"none",color:t.done?mutedCol:textCol }}>{t.text}</div>
                      <div style={{ fontSize:10,color:mutedCol,marginTop:3 }}>Due {t.due}</div>
                    </div>
                    <span style={{ fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:100,background:`${priorityColor[t.priority]}18`,color:priorityColor[t.priority] }}>{t.priority}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab==="Settings"&&(
            <div className="fdp fdin" style={{ padding:32 }}>
              <h2 style={{ fontSize:22,fontWeight:900,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8 }}>Account Settings</h2>
              <p style={{ fontSize:13,color:mutedCol,marginBottom:28 }}>Manage your founder profile and notification preferences.</p>
              <div style={{ display:"flex",flexDirection:"column",gap:20,maxWidth:500 }}>
                {[{label:"FULL NAME",val:rawName},{label:"STARTUP NAME",val:rawCompany},{label:"EMAIL",val:"founder@ventureiq.io"},{label:"LINKEDIN PROFILE",val:"https://linkedin.com/in/yourprofile"}].map(f=>(
                  <div key={f.label}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:mutedCol,marginBottom:6 }}>{f.label}</label>
                    <input className="fdi" defaultValue={f.val}/>
                  </div>
                ))}
                <div>
                  <label style={{ display:"block",fontSize:11,fontWeight:700,color:mutedCol,marginBottom:8 }}>NOTIFICATIONS</label>
                  {["Receive alerts when an investor views your profile","Notify me when AI match score changes","Email updates for new investor matches"].map(opt=>(
                    <label key={opt} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,cursor:"pointer",marginBottom:8 }}>
                      <input type="checkbox" defaultChecked style={{ accentColor:"#6366F1" }}/>{opt}
                    </label>
                  ))}
                </div>
                <button onClick={()=>alert("Settings saved!")} style={{ padding:"11px 22px",background:"#6366F1",color:"#fff",border:"none",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",alignSelf:"flex-start" }}>Save Settings</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
