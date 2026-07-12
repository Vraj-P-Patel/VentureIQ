import { useState, useEffect, useRef } from "react";
import { apiService } from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, Building2, TrendingUp, DollarSign,
  Brain, Bell, Calendar, Settings, MessageSquare, Bookmark,
  Rocket, Search, FileText, BarChart3, Activity, ChevronLeft,
  ChevronRight, Menu, X, Plus, Download, Eye, Star, Filter,
  LogOut, User, MoreHorizontal, AlertTriangle, Send, Zap,
  ChevronDown, ArrowUpRight, ArrowDownRight, CheckCircle,
  Clock, Circle, Target, Globe, Shield, Link2,
  Layers, Archive, RefreshCw, ExternalLink, Users,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

// ============================================
// INVESTOR DASHBOARD — VentureIQ
// Premium Enterprise SaaS Design
// VC / PE Investment Platform
// ============================================

// ── Design Tokens ──────────────────────────
const C = {
  primary:       "#2563EB",
  primaryHover:  "#1D4ED8",
  primarySubtle: "rgba(37,99,235,0.1)",
  success:       "#16A34A",
  successSubtle: "rgba(22,163,74,0.1)",
  warning:       "#F59E0B",
  warningSubtle: "rgba(245,158,11,0.1)",
  danger:        "#DC2626",
  dangerSubtle:  "rgba(220,38,38,0.1)",
  purple:        "#7C3AED",
  purpleSubtle:  "rgba(124,58,237,0.1)",
  bg:            "#0F172A",
  card:          "#111827",
  overlay:       "#1A2238",
  border:        "#1F2937",
  text:          "#F9FAFB",
  textSec:       "#D1D5DB",
  muted:         "#6B7280",
  subtle:        "#4B5563",
};

// ── Chart Data ──────────────────────────────
const portfolioGrowthData = [
  { month: "Jan", value: 38 }, { month: "Feb", value: 41 },
  { month: "Mar", value: 39 }, { month: "Apr", value: 44 },
  { month: "May", value: 47 }, { month: "Jun", value: 51.6 },
];
const sectorData = [
  { name: "B2B SaaS",     value: 35, color: "#2563EB" },
  { name: "HealthTech",   value: 22, color: "#16A34A" },
  { name: "Logistics AI", value: 18, color: "#F59E0B" },
  { name: "FinTech",      value: 15, color: "#7C3AED" },
  { name: "AgriTech",     value: 10, color: "#EC4899" },
];
const dealFlowBarData = [
  { month: "Jan", deals: 14 }, { month: "Feb", deals: 18 },
  { month: "Mar", deals: 12 }, { month: "Apr", deals: 21 },
  { month: "May", deals: 19 }, { month: "Jun", deals: 23 },
];
const sparklineData = {
  EduNest:     [20, 25, 28, 32, 36, 38],
  FarmConnect: [6, 7, 7.5, 8, 8.8, 9.4],
  QuickRoom:   [2.5, 3, 3.2, 3.8, 4, 4.2],
};

// ── Shared UI: Badge ────────────────────────
const Badge = ({ children, color = "blue", style = {} }) => {
  const colors = {
    blue:   { bg: "rgba(37,99,235,0.12)",   text: "#60A5FA" },
    green:  { bg: "rgba(22,163,74,0.12)",   text: "#4ADE80" },
    yellow: { bg: "rgba(245,158,11,0.12)",  text: "#FCD34D" },
    red:    { bg: "rgba(220,38,38,0.12)",   text: "#F87171" },
    purple: { bg: "rgba(124,58,237,0.12)",  text: "#A78BFA" },
    gray:   { bg: "rgba(107,114,128,0.12)", text: "#6B7280" },
  };
  const col = colors[color] || colors.gray;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: col.bg, color: col.text, whiteSpace: "nowrap", ...style,
    }}>
      {children}
    </span>
  );
};

// ── Shared UI: Mini Sparkline SVG ───────────
const Sparkline = ({ data, color = "#16A34A" }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5}
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ── Custom Recharts Tooltip ─────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color || C.text, fontWeight: 600 }}>
          {p.name}: {p.value}{p.unit || ""}
        </div>
      ))}
    </div>
  );
};

// ── Typing Indicator ────────────────────────
const TypingIndicator = () => (
  <div style={{ display: "flex", gap: 4, padding: "10px 14px", background: C.overlay, borderRadius: 12, borderBottomLeftRadius: 4, width: "fit-content" }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 6, height: 6, borderRadius: "50%", background: C.muted, display: "inline-block",
        animation: `viq-dots 1.4s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </div>
);

// ── Empty State ─────────────────────────────
const EmptyState = ({ icon: Icon, title, description, action, onAction }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", gap: 16, textAlign: "center" }}>
    <div style={{ width: 64, height: 64, borderRadius: 20, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon size={28} color="#60A5FA" />
    </div>
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: C.muted, maxWidth: 280, lineHeight: 1.6 }}>{description}</div>
    </div>
    {action && (
      <button onClick={onAction} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
        <Plus size={13} /> {action}
      </button>
    )}
  </div>
);

// ═══════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════
export default function InvestorDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const rawName = state?.name || "Investor";
  const rawFund = state?.fund || "Your Fund";
  const initials = rawName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isNewInvestor = rawFund === "Your Fund" || rawFund === "Your Investor";

  // ── UI State ──────────────────────────────
  const [dark, setDark] = useState(true);          // kept for compatibility
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredStartups, setDiscoveredStartups] = useState([]);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState("Profile");
  const [aiTyping, setAiTyping] = useState(false);
  const [discoveryFilter, setDiscoveryFilter] = useState("All");
  const [discoverySearch, setDiscoverySearch] = useState("");
  const chatEndRef = useRef(null);
  const aiEndRef = useRef(null);

  // Load real startups from SQLite database on mount
  useEffect(() => {
    async function fetchRealStartups() {
      try {
        const data = await apiService.getStartups({ limit: 20 });
        const mapped = data.map((s, idx) => ({
          id: s.id || idx + 10,
          name: s.startup_name,
          sector: s.industry || "General",
          score: s.investor_interest_score || s.innovation_score || 80,
          stage: s.funding_stage || "Seed",
          ask: s.total_funding_usd ? `$${(s.total_funding_usd / 1000000).toFixed(1)}M` : "Undisclosed",
          founder: "Founder",
          desc: s.startup_description || "No description provided.",
          tags: s.technology_stack ? s.technology_stack.split(",").slice(0, 3).map(t => t.trim()) : ["AI", "Tech"],
          arr: s.arr || "N/A",
          growth: s.growth || "N/A",
          country: s.country || "India",
        }));
        setDiscoveredStartups(mapped);
      } catch (err) {
        console.log("Backend offline or error loading discovery list. Fallback to mock data.");
        setDiscoveredStartups([
          { id: 1, name: "Growbazaar",  sector: "B2B SaaS",     score: 91, stage: "Seed",      ask: "$2M",   founder: "Arjun Sharma",  desc: "AI-powered B2B marketplace for SME procurement. 3,200 active buyers, $120K MRR, growing 28% MoM.", tags: ["AI","Marketplace","SME"],          arr: "$1.4M", growth: "+28%", country: "India" },
          { id: 4, name: "MediSync",    sector: "HealthTech",    score: 88, stage: "Pre-Seed",  ask: "$2.5M", founder: "Ananya Rao",    desc: "Real-time patient data sync for multi-hospital chains. 14 hospitals onboarded, low churn.",          tags: ["HealthTech","SaaS","Data"],        arr: "$800K", growth: "+19%", country: "India" },
          { id: 2, name: "DeliverX",    sector: "Logistics AI",  score: 82, stage: "Series A",  ask: "$3.5M", founder: "Priya Mehta",   desc: "Route optimization AI reducing last-mile delivery costs by 34%. 280 fleet partners.",                tags: ["AI","Logistics","B2B"],            arr: "$2.1M", growth: "+34%", country: "India" },
          { id: 6, name: "FinStack",    sector: "FinTech",       score: 79, stage: "Seed",      ask: "$1.8M", founder: "Karan Bose",    desc: "Embedded finance API for MSME lending. 40+ lender integrations, RBI compliant.",                   tags: ["FinTech","API","MSME"],            arr: "$600K", growth: "+22%", country: "India" },
          { id: 7, name: "AgriLink",    sector: "AgriTech",      score: 76, stage: "Pre-Seed",  ask: "$900K", founder: "Sumit Yadav",   desc: "Farmer-to-market direct platform. 12,000 registered farmers across 8 states.",                     tags: ["AgriTech","D2C","Rural"],          arr: "$200K", growth: "+15%", country: "India" },
          { id: 3, name: "RushFlow AI", sector: "Supply Chain",  score: 78, stage: "Seed",      ask: "$1.5M", founder: "Rahul Joshi",   desc: "Supply chain visibility with predictive demand forecasting. 22 enterprise clients.",                tags: ["AI","Supply Chain","Enterprise"],  arr: "$900K", growth: "+25%", country: "India" },
        ]);
      }
    }
    fetchRealStartups();
  }, []);

  // ── Kanban / Deal Flow State ──────────────
  const [deals, setDeals] = useState([
    { id: 1, name: "Growbazaar",  stage: "Screening",    score: 91, sector: "B2B SaaS",    ask: "$2M",   founder: "Arjun Sharma", lastActivity: "2h ago" },
    { id: 2, name: "DeliverX",    stage: "Due Diligence",score: 82, sector: "Logistics AI", ask: "$3.5M", founder: "Priya Mehta",  lastActivity: "1d ago" },
    { id: 3, name: "RushFlow AI", stage: "Term Sheet",   score: 78, sector: "Supply Chain", ask: "$1.5M", founder: "Rahul Joshi",  lastActivity: "3h ago" },
    { id: 4, name: "MediSync",    stage: "Screening",    score: 88, sector: "HealthTech",   ask: "$2.5M", founder: "Ananya Rao",   lastActivity: "4h ago" },
    { id: 5, name: "EduNest",     stage: "Closed",       score: 95, sector: "EdTech",       ask: "$5M",   founder: "Vikram Singh", lastActivity: "7d ago" },
  ]);
  const kanbanCols = ["Screening", "Due Diligence", "Partner Review", "Investment Committee", "Term Sheet", "Closed"];

  // ── Portfolio ─────────────────────────────
  const portfolio = [
    { name: "EduNest",     invested: "$5M",    valuation: "$38M",  roi: "+660%", irr: "+42%", stage: "Series A", color: "#16A34A", status: "Active" },
    { name: "FarmConnect", invested: "$1.2M",  valuation: "$9.4M", roi: "+683%", irr: "+31%", stage: "Seed",     color: "#2563EB", status: "Active" },
    { name: "QuickRoom",   invested: "$800K",  valuation: "$4.2M", roi: "+425%", irr: "+18%", stage: "Pre-Seed", color: "#7C3AED", status: "Active" },
  ];

  // ── Saved Startups (Bookmarks) ────────────
  const [bookmarked, setBookmarked] = useState([1, 4]);

  // ── Messaging ────────────────────────────
  const chats = [
    { id: 1, name: "Arjun Sharma",      role: "Founder · Growbazaar",  last: "Sent pitch deck",          unread: 2 },
    { id: 2, name: "Priya Mehta",       role: "Founder · DeliverX",    last: "Awaiting your feedback",   unread: 0 },
    { id: 3, name: "VentureIQ Support", role: "Platform",               last: "AI match updated",         unread: 1 },
  ];
  const [activeChatId, setActiveChatId] = useState(1);
  const [messagesLog, setMessagesLog] = useState({
    1: [
      { sender: "them", text: "Hi! I've attached the updated pitch deck with Q2 financials.", time: "10:15 AM" },
      { sender: "me",   text: "Thanks Arjun, reviewing it now. Will share feedback by EOD.",  time: "10:22 AM" },
    ],
    2: [{ sender: "them", text: "Hello, awaiting your feedback on the due diligence documents.", time: "Yesterday" }],
    3: [{ sender: "them", text: "Your AI match score for Growbazaar updated to 91%.",           time: "2 hrs ago" }],
  });
  const [chatInput, setChatInput] = useState("");
  const sendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessagesLog((prev) => ({
      ...prev,
      [activeChatId]: [...prev[activeChatId], { sender: "me", text: chatInput, time }],
    }));
    setChatInput("");
    setTimeout(() => {
      setMessagesLog((prev) => ({
        ...prev,
        [activeChatId]: [...prev[activeChatId], { sender: "them", text: "Got it! I'll get back to you shortly.", time: "Just now" }],
      }));
    }, 1400);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messagesLog, activeChatId]);

  // ── AI Chat ───────────────────────────────
  const [aiLogs, setAiLogs] = useState([
    { role: "ai", text: `Welcome back, ${rawName}! Your deal flow has 2 new matches today. Growbazaar's AI score hit 91% — top of your watch list.` },
  ]);
  const [aiInput, setAiInput] = useState("");
  const sendAiMessage = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const q = aiInput;
    setAiLogs((p) => [...p, { role: "user", text: q }]);
    setAiInput("");
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      setAiLogs((p) => [...p, { role: "ai", text: "Based on your thesis and historical portfolio, I'd recommend prioritizing Growbazaar and MediSync — both show strong unit economics for their stage." }]);
    }, 1600);
  };
  const suggestedPrompts = ["Which deals need attention?", "Summarize portfolio performance", "Top AI matches this week"];
  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [aiLogs, aiTyping]);

  // ── Notifications ─────────────────────────
  const notifications = {
    today: [
      { text: "Growbazaar AI score updated to 91% — top match!", time: "1 hr ago",  unread: true  },
      { text: "Arjun Sharma sent you a new pitch deck",          time: "3 hrs ago", unread: true  },
    ],
    yesterday: [
      { text: "RushFlow AI entered Term Sheet stage", time: "Yesterday", unread: false },
    ],
    thisWeek: [
      { text: "Portfolio review meeting scheduled for Monday", time: "3 days ago", unread: false },
    ],
  };

  // ── Sidebar Menu ──────────────────────────
  const menuItems = [
    { id: "Dashboard",          label: "Dashboard",          icon: LayoutDashboard },
    { id: "Deal Flow",          label: "Deal Flow",          icon: Briefcase        },
    { id: "Startup Discovery",  label: "Startup Discovery",  icon: Rocket           },
    { id: "Portfolio",          label: "Portfolio",          icon: Building2        },
    { id: "AI Insights",        label: "AI Insights",        icon: Brain            },
    { id: "Messages",           label: "Messages",           icon: MessageSquare    },
    { id: "Calendar",           label: "Calendar",           icon: Calendar         },
    { id: "Reports",            label: "Reports",            icon: FileText         },
    { id: "Settings",           label: "Settings",           icon: Settings         },
  ];

  const stageColor = {
    "Screening":            "#2563EB",
    "Due Diligence":        "#F59E0B",
    "Partner Review":       "#7C3AED",
    "Investment Committee": "#EC4899",
    "Term Sheet":           "#16A34A",
    "Closed":               "#6B7280",
  };

  const filteredStartups = discoveredStartups.filter(s => {
    const matchFilter = discoveryFilter === "All" || s.sector === discoveryFilter;
    const matchSearch = s.name.toLowerCase().includes(discoverySearch.toLowerCase()) ||
                        s.sector.toLowerCase().includes(discoverySearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // ── Close dropdowns on outside click ──────
  useEffect(() => {
    const handler = () => {
      setNotificationsOpen(false);
      setQuickActionsOpen(false);
      setProfileMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  const stopProp = (e) => e.stopPropagation();

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter',sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button, input, textarea, select { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(37,99,235,0.3); border-radius: 999px; }
        @keyframes viq-dots { 0%,20%{opacity:0.3} 50%{opacity:1} 80%,100%{opacity:0.3} }
        @keyframes viq-fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .tab-enter { animation: viq-fadeUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .nav-item {
          display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:10px;
          font-size:13px; font-weight:500; color:${C.muted}; cursor:pointer;
          transition:all 0.15s ease; border:none; background:transparent;
          width:100%; text-align:left; position:relative; white-space:nowrap; overflow:hidden;
        }
        .nav-item:hover { background:rgba(255,255,255,0.03); color:${C.textSec}; }
        .nav-item.active { background:rgba(37,99,235,0.1); color:#93C5FD; font-weight:600; }
        .nav-item.active::before { content:''; position:absolute; left:0; top:50%; transform:translateY(-50%); width:3px; height:18px; background:${C.primary}; border-radius:0 3px 3px 0; }
        .viq-card { background:${C.card}; border:1px solid ${C.border}; border-radius:14px; transition:border-color 0.2s; }
        .viq-card-hover:hover { border-color:rgba(37,99,235,0.25); }
        .viq-table { width:100%; border-collapse:collapse; }
        .viq-table th { padding:10px 16px; text-align:left; font-size:11px; font-weight:600; color:${C.muted}; letter-spacing:.05em; text-transform:uppercase; border-bottom:1px solid ${C.border}; background:${C.bg}; }
        .viq-table td { padding:14px 16px; font-size:13px; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        .viq-table tbody tr { transition:background 0.15s; }
        .viq-table tbody tr:hover td { background:rgba(255,255,255,0.02); }
        .viq-table tbody tr:last-child td { border-bottom:none; }
        .viq-input { width:100%; padding:9px 13px; background:${C.bg}; border:1px solid ${C.border}; border-radius:10px; color:${C.text}; font-size:13px; outline:none; transition:border-color 0.15s; }
        .viq-input:focus { border-color:rgba(37,99,235,0.5); box-shadow:0 0 0 3px rgba(37,99,235,0.08); }
        .viq-input::placeholder { color:${C.subtle}; }
        .deal-card { transition:box-shadow 0.15s, transform 0.15s; }
        .deal-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.3); transform:translateY(-2px); }
        @media(max-width:1200px){ .kanban-grid{grid-template-columns:repeat(3,1fr)!important;} }
        @media(max-width:900px){ .kanban-grid{grid-template-columns:repeat(2,1fr)!important;} .kpi-grid{grid-template-columns:1fr!important;} }
        @media(max-width:1100px){ .hero-grid{grid-template-columns:1fr!important;} }
      `}</style>

      {/* ════════════ TOP NAVBAR ════════════ */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50, height: 64,
        background: "rgba(15,23,42,0.96)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", gap: 16, flexShrink: 0,
      }}>
        {/* Left: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{ width: 34, height: 34, borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Menu size={15} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }} onClick={() => setActiveTab("Dashboard")}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={14} color="#fff" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.4px" }}>
              Venture<span style={{ color: "#60A5FA" }}>IQ</span>
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: C.primarySubtle, color: "#60A5FA", letterSpacing: 0.8 }}>
              INVESTOR
            </span>
          </div>
        </div>

        {/* Center: Search */}
        <div style={{ flex: 1, maxWidth: 420, position: "relative" }}>
          <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.subtle }} />
          <input type="text" placeholder="Search startups, founders, deals..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={e => e.target.style.borderColor = "rgba(37,99,235,0.5)"}
            onBlur={e => e.target.style.borderColor = C.border}
            style={{ width: "100%", padding: "9px 14px 9px 36px", background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 10, color: C.text, fontSize: 13, outline: "none", transition: "border-color 0.15s" }} />
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

          {/* Quick Actions */}
          <div style={{ position: "relative" }} onClick={stopProp}>
            <button onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={13} /> Quick Actions <ChevronDown size={12} />
            </button>
            {quickActionsOpen && (
              <div style={{ position: "absolute", top: 44, right: 0, width: 200, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, zIndex: 200, boxShadow: "0 16px 40px rgba(0,0,0,0.6)", animation: "viq-fadeUp 0.15s ease forwards" }}>
                {[
                  { icon: Rocket,       label: "Add Startup",      action: () => setActiveTab("Startup Discovery") },
                  { icon: Calendar,     label: "Schedule Meeting",  action: () => setActiveTab("Calendar") },
                  { icon: FileText,     label: "Export Report",     action: () => setActiveTab("Reports") },
                  { icon: Brain,        label: "AI Analysis",       action: () => setShowAiAssistant(true) },
                ].map((item) => (
                  <button key={item.label} onClick={() => { item.action(); setQuickActionsOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: C.textSec, fontSize: 13, cursor: "pointer", borderRadius: 8, transition: "background 0.12s", textAlign: "left" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.overlay}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <item.icon size={13} color={C.muted} /> {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Copilot toggle */}
          <button onClick={() => setShowAiAssistant(!showAiAssistant)}
            title="AI Copilot"
            style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", background: showAiAssistant ? C.primarySubtle : "transparent", border: `1px solid ${showAiAssistant ? "rgba(37,99,235,0.4)" : C.border}`, color: showAiAssistant ? "#60A5FA" : C.muted, cursor: "pointer" }}>
            <Brain size={15} />
          </button>

          {/* Messages */}
          <button onClick={() => setActiveTab("Messages")} title="Messages"
            style={{ width: 34, height: 34, borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <MessageSquare size={15} />
            <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: C.danger, borderRadius: "50%", fontSize: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, border: `2px solid ${C.bg}` }}>3</span>
          </button>

          {/* Calendar */}
          <button onClick={() => setActiveTab("Calendar")} title="Calendar"
            style={{ width: 34, height: 34, borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={15} />
          </button>

          {/* Notifications */}
          <div style={{ position: "relative" }} onClick={stopProp}>
            <button onClick={() => { setNotificationsOpen(!notificationsOpen); setUnreadCount(0); }}
              style={{ width: 34, height: 34, borderRadius: 9, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <Bell size={15} />
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: -3, right: -3, width: 14, height: 14, background: C.danger, borderRadius: "50%", fontSize: 8, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, border: `2px solid ${C.bg}` }}>
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <div style={{ position: "absolute", top: 44, right: 0, width: 360, background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, zIndex: 200, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.6)", animation: "viq-fadeUp 0.15s ease forwards" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
                  <button onClick={() => setNotificationsOpen(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer" }}><X size={14} /></button>
                </div>
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {Object.entries({ Today: notifications.today, Yesterday: notifications.yesterday, "This Week": notifications.thisWeek }).map(([group, items]) => (
                    <div key={group}>
                      <div style={{ padding: "10px 20px 4px", fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase" }}>{group}</div>
                      {items.map((n, i) => (
                        <div key={i} style={{ padding: "11px 20px", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", transition: "background 0.12s" }}
                          onMouseEnter={e => e.currentTarget.style.background = C.overlay}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <div style={{ marginTop: 4, flexShrink: 0 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: n.unread ? C.primary : C.subtle, display: "block" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: n.unread ? C.text : C.muted, lineHeight: 1.5 }}>{n.text}</div>
                            <div style={{ fontSize: 10, color: C.subtle, marginTop: 2 }}>{n.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div style={{ position: "relative" }} onClick={stopProp}>
            <button onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, cursor: "pointer" }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>{initials}</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.textSec }}>{rawName.split(" ")[0]}</span>
              <ChevronDown size={11} color={C.muted} />
            </button>
            {profileMenuOpen && (
              <div style={{ position: "absolute", top: 44, right: 0, width: 220, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, zIndex: 200, boxShadow: "0 16px 40px rgba(0,0,0,0.6)", animation: "viq-fadeUp 0.15s ease forwards" }}>
                <div style={{ padding: "12px 14px", borderBottom: `1px solid ${C.border}`, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{rawName}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{rawFund}</div>
                </div>
                {[{ icon: User, label: "Profile", action: () => setActiveTab("Settings") }, { icon: Settings, label: "Settings", action: () => setActiveTab("Settings") }].map(item => (
                  <button key={item.label} onClick={() => { item.action(); setProfileMenuOpen(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: C.textSec, fontSize: 13, cursor: "pointer", borderRadius: 8, transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.overlay}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <item.icon size={13} color={C.muted} /> {item.label}
                  </button>
                ))}
                <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 4, paddingTop: 4 }}>
                  <button onClick={() => navigate("/")}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: "transparent", border: "none", color: "#F87171", fontSize: 13, cursor: "pointer", borderRadius: 8, transition: "background 0.12s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.dangerSubtle}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ════════════ AI COPILOT PANEL ════════════ */}
      {showAiAssistant && (
        <div className="viq-card" style={{ position: "fixed", bottom: 28, right: 28, width: 380, height: 520, zIndex: 100, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.7)", border: `1px solid rgba(37,99,235,0.3)`, animation: "viq-fadeUp 0.2s ease forwards" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bg }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Brain size={15} color="#60A5FA" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>VentureIQ Copilot</div>
                <div style={{ fontSize: 10, color: C.success, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.success, display: "inline-block" }} /> Analyzing deal flow
                </div>
              </div>
            </div>
            <button onClick={() => setShowAiAssistant(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4, borderRadius: 6 }}>
              <X size={15} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, background: C.bg }}>
            {aiLogs.map((log, i) => (
              <div key={i} style={{ display: "flex", justifyContent: log.role === "user" ? "flex-end" : "flex-start" }}>
                {log.role === "ai" && (
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, alignSelf: "flex-end" }}>
                    <Brain size={12} color="#60A5FA" />
                  </div>
                )}
                <div style={{ maxWidth: "78%", padding: "10px 13px", borderRadius: 12, fontSize: 12, lineHeight: 1.6, background: log.role === "user" ? C.primary : C.overlay, color: "#fff", borderBottomRightRadius: log.role === "user" ? 4 : 12, borderBottomLeftRadius: log.role === "ai" ? 4 : 12 }}>
                  {log.text}
                </div>
              </div>
            ))}
            {aiTyping && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Brain size={12} color="#60A5FA" />
                </div>
                <TypingIndicator />
              </div>
            )}
            <div ref={aiEndRef} />
          </div>
          {aiLogs.length <= 1 && (
            <div style={{ padding: "8px 16px", display: "flex", gap: 6, flexWrap: "wrap", borderTop: `1px solid ${C.border}`, background: C.bg }}>
              {suggestedPrompts.map(p => (
                <button key={p} onClick={() => setAiInput(p)}
                  style={{ padding: "5px 10px", borderRadius: 999, fontSize: 11, background: C.primarySubtle, color: "#93C5FD", border: `1px solid rgba(37,99,235,0.2)`, cursor: "pointer", fontWeight: 500 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={sendAiMessage} style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, background: C.bg }}>
            <input value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ask about startups, deals, thesis..."
              className="viq-input" style={{ flex: 1, padding: "9px 12px", fontSize: 12 }} />
            <button type="submit" style={{ width: 36, height: 36, background: C.primary, color: "#fff", border: "none", borderRadius: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* ════════════ MAIN BODY ════════════ */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ══════ SIDEBAR ══════ */}
        <nav style={{ width: sidebarCollapsed ? 60 : 228, background: C.bg, borderRight: `1px solid ${C.border}`, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2, transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)", overflowX: "hidden", overflowY: "auto", flexShrink: 0 }}>
          {menuItems.map((item) => {
            const sel = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`nav-item ${sel ? "active" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
                style={{ justifyContent: sidebarCollapsed ? "center" : "flex-start", padding: sidebarCollapsed ? "9px" : "9px 12px" }}>
                <item.icon size={16} style={{ flexShrink: 0 }} />
                {!sidebarCollapsed && <span style={{ flex: 1 }}>{item.label}</span>}
                {!sidebarCollapsed && item.id === "Messages" && (
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: C.danger, color: "#fff", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>3</span>
                )}
              </button>
            );
          })}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
            {!sidebarCollapsed ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.overlay}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initials}</div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rawName}</div>
                  <div style={{ fontSize: 10, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rawFund}</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff" }}>{initials}</div>
              </div>
            )}
          </div>
        </nav>

        {/* ══════ CONTENT ══════ */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ══════════════════════════════════
              DASHBOARD HOME
          ══════════════════════════════════ */}
          {activeTab === "Dashboard" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

              {/* Incomplete banner */}
              {isNewInvestor && (
                <div style={{ padding: "16px 20px", background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <AlertTriangle size={18} color={C.warning} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.warning }}>Investor Profile Incomplete</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Configure your investment thesis in <strong>Settings</strong> to activate AI matching.</div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("Settings")} style={{ padding: "7px 14px", background: C.warning, color: "#000", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                    Configure Settings
                  </button>
                </div>
              )}

              {/* Welcome */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Good evening, {rawName.split(" ")[0]} 👋</h1>
                  <p style={{ fontSize: 13, color: C.muted }}>{rawFund} · {isNewInvestor ? "Set up your profile to get AI-matched deals" : "2 new AI-matched startups waiting for your review"}</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowAiAssistant(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: C.primarySubtle, color: "#93C5FD", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <Brain size={13} /> AI Insights
                  </button>
                  <button onClick={() => setActiveTab("Reports")} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <Download size={13} /> Export
                  </button>
                </div>
              </div>

              {/* 3 KPI Cards */}
              <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "Portfolio Value",  value: isNewInvestor ? "$0.0M"  : "$51.6M", change: "+12.4% YTD",            positive: true,  icon: DollarSign, color: C.primary  },
                  { label: "Active Deals",     value: isNewInvestor ? "0"      : "5",      change: "2 in screening",         positive: null,  icon: Briefcase,  color: C.warning  },
                  { label: "New AI Matches",   value: isNewInvestor ? "0"      : "2",      change: "Growbazaar 91% score",   positive: true,  icon: Brain,      color: C.success  },
                ].map((kpi) => (
                  <div key={kpi.label} className="viq-card viq-card-hover" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${kpi.color}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <kpi.icon size={17} color={kpi.color} />
                      </div>
                      {kpi.positive !== null && (
                        <Badge color={kpi.positive ? "green" : "red"}>
                          {kpi.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {kpi.change.split(" ")[0]}
                        </Badge>
                      )}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: C.text, marginBottom: 4 }}>{kpi.value}</div>
                    <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 2 }}>{kpi.label}</div>
                    <div style={{ fontSize: 11, color: C.subtle }}>{kpi.change}</div>
                  </div>
                ))}
              </div>

              {/* Charts Row 1: Growth + Sector */}
              <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
                <div className="viq-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>Portfolio Growth</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Total portfolio value over time</div>
                    </div>
                    <Badge color="green"><ArrowUpRight size={10} /> +35.8%</Badge>
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={portfolioGrowthData} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.primary} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={C.primary} stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
                      <Tooltip content={<ChartTip />} />
                      <Area type="monotone" dataKey="value" name="Portfolio Value" unit="M" stroke={C.primary} fill="url(#pgGrad)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="viq-card" style={{ padding: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Sector Allocation</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Deal flow by sector</div>
                  </div>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={sectorData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                        {sectorData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} contentStyle={{ background: C.overlay, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                    {sectorData.slice(0, 4).map(s => (
                      <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: C.muted, flex: 1 }}>{s.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts Row 2: Pipeline + Deal Flow Bar */}
              <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="viq-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Investment Pipeline</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 20 }}>Deals by stage</div>
                  {[
                    { stage: "Screening",     count: 8, color: C.primary,  width: "100%" },
                    { stage: "Due Diligence", count: 5, color: C.warning,  width: "62%"  },
                    { stage: "Partner Review",count: 3, color: C.purple,   width: "37%"  },
                    { stage: "Term Sheet",    count: 2, color: C.success,  width: "25%"  },
                    { stage: "Closed",        count: 1, color: C.muted,    width: "12%"  },
                  ].map(item => (
                    <div key={item.stage} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: C.textSec }}>{item.stage}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.count}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: C.overlay, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: item.width, background: item.color, borderRadius: 999, transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="viq-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Monthly Deal Flow</div>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 16 }}>New deals per month</div>
                  <ResponsiveContainer width="100%" height={170}>
                    <BarChart data={dealFlowBarData} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="deals" name="Deals" fill={C.primary} radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
                {/* Top AI Matches */}
                <div className="viq-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>Top AI Matches</div>
                    <button onClick={() => setActiveTab("Startup Discovery")} style={{ fontSize: 11, color: "#60A5FA", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      View all <ArrowUpRight size={11} />
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {discoveredStartups.slice(0, 3).map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, transition: "border-color 0.15s", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(37,99,235,0.25)"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#60A5FA", flexShrink: 0 }}>
                          {s.name.slice(0, 2)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: C.muted }}>{s.sector} · {s.stage}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: s.score >= 88 ? C.success : s.score >= 78 ? C.warning : C.muted }}>{s.score}%</div>
                          <div style={{ fontSize: 10, color: C.muted }}>AI Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meetings + AI Tip */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="viq-card" style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 7 }}>
                      <Calendar size={14} color={C.muted} /> Upcoming Meetings
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { company: "Growbazaar", founder: "Arjun Sharma", time: "Thu 4:00 PM",  type: "Pitch Review",  color: C.primary },
                        { company: "DeliverX",   founder: "Priya Mehta",  time: "Fri 11:00 AM", type: "Due Diligence", color: C.warning },
                      ].map((m, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 4, height: 36, borderRadius: 999, background: m.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.company}</div>
                            <div style={{ fontSize: 10, color: C.muted }}>{m.founder} · {m.time}</div>
                          </div>
                          <Badge color="blue" style={{ fontSize: 9 }}>{m.type}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "16px 18px", borderRadius: 12, background: C.primarySubtle, border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                      <Brain size={13} color="#93C5FD" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#93C5FD" }}>AI Recommendation</span>
                    </div>
                    <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                      MediSync's burn rate dropped 18% MoM — runway extended to 16 months. Consider accelerating due diligence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="viq-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Recent Activity</div>
                {[
                  { group: "Today", items: [
                    { icon: Bookmark, text: "Bookmarked Growbazaar — 91% AI match",       time: "Just now",      color: C.primary },
                    { icon: Send,     text: "Arjun Sharma sent an updated pitch deck",    time: "1 hr ago",      color: C.warning },
                  ]},
                  { group: "Yesterday", items: [
                    { icon: Brain,    text: "AI analysis completed for MediSync",         time: "Yesterday 3 PM",color: C.success },
                    { icon: Calendar, text: "Meeting with DeliverX confirmed for Friday", time: "Yesterday 10 AM",color: C.purple  },
                  ]},
                ].map(group => (
                  <div key={group.group} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10 }}>{group.group}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {group.items.map((act, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${act.color}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <act.icon size={14} color={act.color} />
                          </div>
                          <div style={{ flex: 1, fontSize: 12, fontWeight: 500, color: C.textSec }}>{act.text}</div>
                          <div style={{ fontSize: 10, color: C.subtle, flexShrink: 0 }}>{act.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              DEAL FLOW KANBAN
          ══════════════════════════════════ */}
          {activeTab === "Deal Flow" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Deal Flow Pipeline</h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Track and manage your investment pipeline across stages.</p>
                </div>
                <button onClick={() => setDeals(prev => [...prev, { id: Date.now(), name: "New Startup", stage: "Screening", score: 70, sector: "Tech", ask: "Undisclosed", founder: "Founder", lastActivity: "Just now" }])}
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={13} /> Add Deal
                </button>
              </div>
              <div className="kanban-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14, alignItems: "start", overflowX: "auto" }}>
                {kanbanCols.map((col) => {
                  const colDeals = deals.filter(d => d.stage === col);
                  const colIdx = kanbanCols.indexOf(col);
                  return (
                    <div key={col} style={{ minWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "0 2px" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: stageColor[col], display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: stageColor[col], letterSpacing: 0.4 }}>{col.toUpperCase()}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: `${stageColor[col]}20`, color: stageColor[col], padding: "2px 7px", borderRadius: 999 }}>{colDeals.length}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {colDeals.length === 0 ? (
                          <div style={{ padding: "20px 12px", borderRadius: 10, border: `1.5px dashed ${C.border}`, textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: C.subtle }}>No deals</div>
                          </div>
                        ) : colDeals.map((deal) => (
                          <div key={deal.id} className="deal-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, cursor: "grab" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{deal.name}</div>
                              <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: C.successSubtle, color: "#4ADE80", flexShrink: 0, marginLeft: 6 }}>{deal.score}%</span>
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><User size={10} /><span>{deal.founder}</span></div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Layers size={10} /><span>{deal.sector}</span></div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><DollarSign size={10} /><span>{deal.ask}</span></div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}><Clock size={10} /><span>{deal.lastActivity}</span></div>
                            </div>
                            <div style={{ display: "flex", gap: 6 }}>
                              {colIdx > 0 && (
                                <button onClick={() => setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: kanbanCols[colIdx - 1] } : d))}
                                  style={{ flex: 1, padding: "6px 0", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                                  <ChevronLeft size={10} /> Back
                                </button>
                              )}
                              {colIdx < kanbanCols.length - 1 && (
                                <button onClick={() => setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, stage: kanbanCols[colIdx + 1] } : d))}
                                  style={{ flex: 1, padding: "6px 0", background: stageColor[kanbanCols[colIdx + 1]], border: "none", borderRadius: 7, color: "#fff", fontSize: 10, cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                                  Advance <ChevronRight size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              STARTUP DISCOVERY
          ══════════════════════════════════ */}
          {activeTab === "Startup Discovery" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Startup Discovery</h2>
                <p style={{ fontSize: 13, color: C.muted }}>AI-curated matches based on your investment thesis.</p>
              </div>
              {/* Filters */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
                  <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: C.subtle }} />
                  <input type="text" placeholder="Search startups..." value={discoverySearch} onChange={e => setDiscoverySearch(e.target.value)}
                    className="viq-input" style={{ paddingLeft: 32 }} />
                </div>
                {["All", "B2B SaaS", "HealthTech", "Logistics AI", "FinTech", "AgriTech"].map(f => (
                  <button key={f} onClick={() => setDiscoveryFilter(f)}
                    style={{ padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer", background: discoveryFilter === f ? C.primary : "transparent", color: discoveryFilter === f ? "#fff" : C.muted, border: `1px solid ${discoveryFilter === f ? C.primary : C.border}`, transition: "all 0.15s" }}>
                    {f}
                  </button>
                ))}
              </div>
              {/* Table */}
              <div className="viq-card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table className="viq-table" style={{ minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th>Startup</th><th>Industry</th><th>Stage</th><th>ARR</th><th>Growth</th><th>AI Score</th><th>Fundraising</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStartups.length === 0 ? (
                        <tr><td colSpan={9}><EmptyState icon={Rocket} title="No startups found" description="Try adjusting your filters." action="Clear Filters" onAction={() => { setDiscoveryFilter("All"); setDiscoverySearch(""); }} /></td></tr>
                      ) : filteredStartups.map(s => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#60A5FA", flexShrink: 0 }}>{s.name.slice(0, 2)}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.name}</div>
                                <div style={{ fontSize: 11, color: C.muted }}>{s.founder}</div>
                              </div>
                            </div>
                          </td>
                          <td><Badge color="blue">{s.sector}</Badge></td>
                          <td><Badge color={s.stage === "Series A" ? "purple" : s.stage === "Seed" ? "yellow" : "gray"}>{s.stage}</Badge></td>
                          <td style={{ fontWeight: 600 }}>{s.arr}</td>
                          <td><span style={{ color: C.success, fontWeight: 700, fontSize: 12 }}>{s.growth}</span></td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 4, borderRadius: 999, background: C.overlay, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${s.score}%`, background: s.score >= 88 ? C.success : s.score >= 75 ? C.warning : C.muted, borderRadius: 999 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: s.score >= 88 ? "#4ADE80" : s.score >= 75 ? "#FCD34D" : C.muted, minWidth: 28 }}>{s.score}%</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{s.ask}</td>
                          <td><Badge color={bookmarked.includes(s.id) ? "green" : "gray"}>{bookmarked.includes(s.id) ? "Watchlist" : "Reviewing"}</Badge></td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => setDeals(prev => prev.some(d => d.id === s.id) ? prev : [...prev, { ...s, stage: "Screening", lastActivity: "Just now" }])}
                                style={{ padding: "5px 10px", background: C.primary, color: "#fff", border: "none", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                                + Pipeline
                              </button>
                              <button onClick={() => setBookmarked(prev => prev.includes(s.id) ? prev.filter(b => b !== s.id) : [...prev, s.id])}
                                style={{ width: 28, height: 28, borderRadius: 7, background: bookmarked.includes(s.id) ? C.primarySubtle : "transparent", border: `1px solid ${C.border}`, color: bookmarked.includes(s.id) ? "#60A5FA" : C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Bookmark size={12} />
                              </button>
                              <button onClick={() => { setActiveTab("Messages"); setActiveChatId(1); }}
                                style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <MessageSquare size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              PORTFOLIO
          ══════════════════════════════════ */}
          {activeTab === "Portfolio" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Portfolio Tracker</h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Active investments with live performance telemetry.</p>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "transparent", color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Download size={13} /> Export
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "Total Invested",         value: "$7.0M",  icon: DollarSign, color: C.primary  },
                  { label: "Current Portfolio Value", value: "$51.6M", icon: TrendingUp,  color: C.success  },
                  { label: "Average IRR",             value: "+30.3%", icon: Activity,    color: C.purple   },
                ].map(stat => (
                  <div key={stat.label} className="viq-card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${stat.color}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <stat.icon size={20} color={stat.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</div>
                      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="viq-card" style={{ overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 700 }}>Active Investments</div>
                <table className="viq-table">
                  <thead>
                    <tr>
                      <th>Company</th><th>Investment</th><th>Current Value</th><th>ROI</th><th>IRR</th><th>Performance</th><th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map(co => (
                      <tr key={co.name}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${co.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: co.color, flexShrink: 0 }}>{co.name.slice(0, 2)}</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{co.name}</div>
                              <Badge color={co.stage === "Series A" ? "purple" : co.stage === "Seed" ? "yellow" : "gray"} style={{ marginTop: 2 }}>{co.stage}</Badge>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{co.invested}</td>
                        <td style={{ fontWeight: 700 }}>{co.valuation}</td>
                        <td><span style={{ color: C.success, fontWeight: 700 }}>{co.roi}</span></td>
                        <td><span style={{ color: C.success, fontWeight: 800, fontSize: 14 }}>{co.irr}</span></td>
                        <td><Sparkline data={sparklineData[co.name] || [3, 4, 3.5, 5, 4.8, 6]} color={co.color} /></td>
                        <td><Badge color={co.status === "Active" ? "green" : "gray"}>{co.status}</Badge></td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={12} /></button>
                            <button style={{ width: 28, height: 28, borderRadius: 7, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Download size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              AI INSIGHTS
          ══════════════════════════════════ */}
          {activeTab === "AI Insights" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>AI Deal Intelligence</h2>
                <p style={{ fontSize: 13, color: C.muted }}>Machine learning analysis across your watchlist and deal flow.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 18 }}>
                {[
                  { name: "Growbazaar",  score: 91, confidence: "High",   risk: "Low",    revenueGrowth: "+28% MoM", burnRate: "$45K/mo", runway: "22 months", market: "$8.4B TAM",  sector: "B2B SaaS",    rec: "Strong Buy", recColor: C.success, reason: "Exceptional PMF with 3x YoY ARR growth. Large TAM with experienced founding team and strong unit economics." },
                  { name: "MediSync",    score: 88, confidence: "High",   risk: "Medium", revenueGrowth: "+19% MoM", burnRate: "$62K/mo", runway: "16 months", market: "$12B TAM",   sector: "HealthTech",  rec: "Buy",        recColor: C.primary, reason: "Defensible data moat with recurring hospital contracts. Burn rate dropped 18% MoM showing operational efficiency." },
                  { name: "DeliverX",    score: 82, confidence: "Medium", risk: "Medium", revenueGrowth: "+34% MoM", burnRate: "$88K/mo", runway: "11 months", market: "$3.2B TAM",  sector: "Logistics AI",rec: "Watch",      recColor: C.warning, reason: "Strong unit economics improving. Large fleet network with Series A readiness. Monitor burn rate carefully." },
                  { name: "RushFlow AI", score: 78, confidence: "Medium", risk: "High",   revenueGrowth: "+25% MoM", burnRate: "$72K/mo", runway: "9 months",  market: "$1.8B TAM",  sector: "Supply Chain",rec: "Cautious",   recColor: C.muted,   reason: "Early traction in enterprise with solid ML pipeline. Niche moat but requires strong milestone achievement." },
                ].map((s, i) => (
                  <div key={i} className="viq-card viq-card-hover" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.primarySubtle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#60A5FA" }}>{s.name.slice(0, 2)}</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 3 }}>{s.name}</div>
                          <Badge color="blue">{s.sector}</Badge>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 26, fontWeight: 900, color: s.score >= 88 ? C.success : s.score >= 78 ? C.warning : C.muted }}>{s.score}%</div>
                        <div style={{ fontSize: 10, color: C.muted }}>AI Score</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      {[
                        { label: "Confidence",    value: s.confidence,    color: s.confidence === "High" ? C.success : C.warning },
                        { label: "Risk Level",    value: s.risk,          color: s.risk === "Low" ? C.success : s.risk === "Medium" ? C.warning : C.danger },
                        { label: "Rev. Growth",   value: s.revenueGrowth, color: C.success },
                        { label: "Burn Rate",     value: s.burnRate,      color: C.text },
                        { label: "Runway",        value: s.runway,        color: C.text },
                        { label: "Market Size",   value: s.market,        color: C.text },
                      ].map(m => (
                        <div key={m.label} style={{ padding: "10px 12px", background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 3, fontWeight: 600 }}>{m.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: `${s.recColor}0F`, border: `1px solid ${s.recColor}30`, marginBottom: 14 }}>
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>AI RECOMMENDATION</div>
                      <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>{s.reason}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setActiveTab("Startup Discovery")} style={{ flex: 1, padding: "9px", background: C.primary, color: "#fff", border: "none", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>View Full Analysis</button>
                      <button onClick={() => setDeals(prev => prev.some(d => d.name === s.name) ? prev : [...prev, { id: Date.now(), name: s.name, stage: "Screening", score: s.score, sector: s.sector, ask: "N/A", founder: "Founder", lastActivity: "Just now" }])}
                        style={{ padding: "9px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 9, fontSize: 12, fontWeight: 600, color: C.muted, cursor: "pointer" }}>
                        + Pipeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="viq-card" style={{ padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Deal Flow by Sector</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { sector: "B2B SaaS",    pct: 35, color: C.primary },
                    { sector: "HealthTech",  pct: 22, color: C.success },
                    { sector: "Logistics AI",pct: 18, color: C.warning },
                    { sector: "FinTech",     pct: 15, color: C.purple  },
                    { sector: "AgriTech",    pct: 10, color: "#EC4899" },
                  ].map(s => (
                    <div key={s.sector} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                      <div style={{ width: 110, fontSize: 12, fontWeight: 600, color: C.muted }}>{s.sector}</div>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: C.overlay, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 999 }} />
                      </div>
                      <div style={{ width: 36, fontSize: 12, fontWeight: 800, textAlign: "right", color: s.color }}>{s.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              MESSAGES
          ══════════════════════════════════ */}
          {activeTab === "Messages" && (
            <div className="viq-card tab-enter" style={{ height: 560, display: "flex", overflow: "hidden", padding: 0 }}>
              <div style={{ width: 240, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
                <div style={{ padding: "16px 16px 12px", fontSize: 14, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>Messages</div>
                {chats.map(chat => (
                  <button key={chat.id} onClick={() => setActiveChatId(chat.id)}
                    style={{ padding: "14px 16px", border: "none", cursor: "pointer", textAlign: "left", background: activeChatId === chat.id ? C.primarySubtle : "transparent", borderBottom: `1px solid ${C.border}`, transition: "background 0.12s", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: C.overlay, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.muted, flexShrink: 0 }}>{chat.name.slice(0, 2)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: activeChatId === chat.id ? "#93C5FD" : C.text }}>{chat.name}</div>
                      <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{chat.role}</div>
                      <div style={{ fontSize: 10, color: C.subtle, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.last}</div>
                    </div>
                    {chat.unread > 0 && (
                      <span style={{ width: 16, height: 16, background: C.primary, borderRadius: "50%", fontSize: 9, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>{chat.unread}</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: C.overlay, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.muted }}>
                    {chats.find(c => c.id === activeChatId)?.name.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{chats.find(c => c.id === activeChatId)?.name}</div>
                    <div style={{ fontSize: 10, color: C.muted }}>{chats.find(c => c.id === activeChatId)?.role}</div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12, background: C.bg }}>
                  {(messagesLog[activeChatId] || []).map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.sender === "me" ? "flex-end" : "flex-start" }}>
                      <div style={{ maxWidth: "72%", padding: "10px 14px", borderRadius: 14, fontSize: 12, lineHeight: 1.6, background: msg.sender === "me" ? C.primary : C.overlay, color: "#fff", borderBottomRightRadius: msg.sender === "me" ? 4 : 14, borderBottomLeftRadius: msg.sender === "them" ? 4 : 14 }}>
                        <div>{msg.text}</div>
                        <div style={{ fontSize: 9, marginTop: 4, opacity: 0.6, textAlign: msg.sender === "me" ? "right" : "left" }}>{msg.time}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMessage} style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
                  <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..."
                    className="viq-input" style={{ flex: 1, padding: "9px 13px" }} />
                  <button type="submit" style={{ padding: "0 18px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              CALENDAR
          ══════════════════════════════════ */}
          {activeTab === "Calendar" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Meeting Calendar</h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Upcoming founder calls and investment committee meetings.</p>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={13} /> Schedule Meeting
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
                <div className="viq-card" style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Upcoming Meetings</div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {[
                      { company: "Growbazaar", founder: "Arjun Sharma", date: "Thu Jul 10", time: "4:00 PM",   type: "Pitch Review",  color: C.primary, desc: "Partner demo call — reviewing Q2 pitch deck"     },
                      { company: "DeliverX",   founder: "Priya Mehta",  date: "Fri Jul 11", time: "11:00 AM",  type: "Due Diligence", color: C.warning, desc: "Technical and financial due diligence sync"      },
                      { company: "IC Meeting", founder: "Internal",     date: "Mon Jul 14", time: "2:00 PM",   type: "Internal",      color: C.purple,  desc: "Investment Committee — portfolio Q2 review"     },
                      { company: "MediSync",   founder: "Ananya Rao",   date: "Tue Jul 15", time: "10:30 AM",  type: "Intro Call",    color: C.success, desc: "Initial introductory meeting — new lead"        },
                    ].map((ev, i) => (
                      <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 20, position: "relative" }}>
                        {i < 3 && <div style={{ position: "absolute", left: 19, top: 40, bottom: 0, width: 1, background: C.border }} />}
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${ev.color}1A`, border: `1px solid ${ev.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1 }}>
                          <Calendar size={16} color={ev.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{ev.company}</span>
                            <Badge color={ev.type === "Pitch Review" ? "blue" : ev.type === "Due Diligence" ? "yellow" : ev.type === "Internal" ? "purple" : "green"} style={{ fontSize: 10 }}>{ev.type}</Badge>
                          </div>
                          <div style={{ fontSize: 11, color: C.muted, marginBottom: 3 }}>{ev.founder} · {ev.date} · {ev.time}</div>
                          <div style={{ fontSize: 11, color: C.subtle }}>{ev.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="viq-card" style={{ padding: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>This Week</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[
                        { label: "Scheduled Meetings", value: "4", icon: Calendar, color: C.primary  },
                        { label: "Pitch Reviews",      value: "2", icon: Briefcase, color: C.warning  },
                        { label: "DD Calls",           value: "1", icon: Activity,  color: C.success  },
                      ].map(stat => (
                        <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <stat.icon size={14} color={stat.color} />
                          </div>
                          <div style={{ flex: 1, fontSize: 12, color: C.muted }}>{stat.label}</div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px", borderRadius: 12, background: C.primarySubtle, border: "1px solid rgba(37,99,235,0.2)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#93C5FD", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <Brain size={12} /> AI Scheduling Tip
                    </div>
                    <p style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6, margin: 0 }}>Cluster similar meetings on the same day. You have back-to-back due diligence calls on Friday.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              REPORTS
          ══════════════════════════════════ */}
          {activeTab === "Reports" && (
            <div className="tab-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Fund Reports</h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Download quarterly reports and LP update documents.</p>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={13} /> Generate Report
                </button>
              </div>
              <div className="viq-card" style={{ overflow: "hidden" }}>
                <table className="viq-table">
                  <thead>
                    <tr><th>Document</th><th>Type</th><th>Owner</th><th>Date</th><th>Size</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Q2 2025 Portfolio Performance Report",   type: "PDF",  owner: rawName, date: "Jul 1, 2025",  size: "2.4 MB", color: "#EF4444" },
                      { name: "Growbazaar — Full Due Diligence Deck",   type: "PDF",  owner: rawName, date: "Jun 28, 2025", size: "8.1 MB", color: "#EF4444" },
                      { name: "LP Quarterly Update — June 2025",        type: "DOCX", owner: rawName, date: "Jun 25, 2025", size: "1.2 MB", color: "#2563EB" },
                      { name: "Fund KPIs — H1 2025 Summary",            type: "XLSX", owner: rawName, date: "Jun 10, 2025", size: "540 KB", color: "#16A34A" },
                    ].map((doc, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${doc.color}1A`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <FileText size={14} color={doc.color} />
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.name}</div>
                          </div>
                        </td>
                        <td><Badge color={doc.type === "PDF" ? "red" : doc.type === "DOCX" ? "blue" : "green"}>{doc.type}</Badge></td>
                        <td style={{ fontSize: 12, color: C.muted }}>{doc.owner}</td>
                        <td style={{ fontSize: 12, color: C.muted }}>{doc.date}</td>
                        <td style={{ fontSize: 12, color: C.muted }}>{doc.size}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => alert(`Downloading: ${doc.name}`)}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                              <Download size={11} /> Download
                            </button>
                            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 7, color: C.muted, fontSize: 11, cursor: "pointer" }}>
                              <Eye size={11} /> Preview
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════
              SETTINGS
          ══════════════════════════════════ */}
          {activeTab === "Settings" && (
            <div className="tab-enter" style={{ display: "flex", gap: 24 }}>
              <div style={{ width: 200, flexShrink: 0 }}>
                <div className="viq-card" style={{ padding: 8 }}>
                  {[
                    { id: "Profile",       icon: User,     label: "Profile"           },
                    { id: "Fund",          icon: Building2,label: "Fund Info"          },
                    { id: "Thesis",        icon: Target,   label: "Investment Thesis"  },
                    { id: "Notifications", icon: Bell,     label: "Notifications"      },
                    { id: "Security",      icon: Shield,   label: "Security"           },
                    { id: "Integrations",  icon: Link2,    label: "Integrations"       },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setSettingsTab(tab.id)}
                      className={`nav-item ${settingsTab === tab.id ? "active" : ""}`}>
                      <tab.icon size={15} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {settingsTab === "Profile" && (
                  <div className="viq-card" style={{ padding: 32 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Profile Settings</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Update your investor profile and personal information.</div>
                    <div style={{ display: "flex", gap: 20, marginBottom: 28 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 16, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{initials}</div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{rawName}</div>
                        <div style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>{rawFund}</div>
                        <button style={{ padding: "6px 14px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, cursor: "pointer" }}>Change Photo</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 480 }}>
                      {[
                        { label: "Full Name", value: rawName },
                        { label: "Email",     value: "investor@ventureiq.com" },
                        { label: "Phone",     value: "+91 98765 43210" },
                        { label: "Location",  value: "Mumbai, India" },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{f.label}</label>
                          <input type="text" defaultValue={f.value} className="viq-input" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => alert("Settings saved.")} style={{ marginTop: 24, padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
                  </div>
                )}
                {settingsTab === "Fund" && (
                  <div className="viq-card" style={{ padding: 32 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Fund Information</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Details about your fund or investment vehicle.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 480 }}>
                      {[
                        { label: "Fund / Firm Name", value: rawFund },
                        { label: "Fund Size",        value: "$25M" },
                        { label: "Vintage Year",     value: "2022" },
                        { label: "Fund Type",        value: "Venture Capital" },
                        { label: "Geography",        value: "India, Southeast Asia" },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{f.label}</label>
                          <input type="text" defaultValue={f.value} className="viq-input" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => alert("Fund info saved.")} style={{ marginTop: 24, padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
                  </div>
                )}
                {settingsTab === "Thesis" && (
                  <div className="viq-card" style={{ padding: 32 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Investment Thesis</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Configure your thesis to optimize AI matching algorithms.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 480 }}>
                      {[
                        { label: "Investment Thesis",    value: "B2B SaaS, HealthTech, AI-first startups" },
                        { label: "Ticket Size Range",    value: "$500K – $5M" },
                        { label: "Preferred Stages",     value: "Pre-Seed, Seed, Series A" },
                        { label: "Target Sectors",       value: "B2B SaaS, HealthTech, Logistics AI" },
                        { label: "Target Geographies",   value: "India, Southeast Asia" },
                      ].map(f => (
                        <div key={f.label}>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{f.label}</label>
                          <input type="text" defaultValue={f.value} className="viq-input" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => alert("Thesis saved.")} style={{ marginTop: 24, padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Changes</button>
                  </div>
                )}
                {settingsTab === "Notifications" && (
                  <div className="viq-card" style={{ padding: 32 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Notification Preferences</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Manage how and when you receive alerts.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 480 }}>
                      {[
                        { label: "New AI Startup Matches", desc: "Get notified when new startups match your thesis" },
                        { label: "Deal Flow Updates",      desc: "Alerts for pipeline stage changes" },
                        { label: "Portfolio Alerts",       desc: "Important portfolio company updates" },
                        { label: "Meeting Reminders",      desc: "Reminders 30 minutes before meetings" },
                        { label: "Weekly Digest",          desc: "Weekly summary of your deal flow" },
                      ].map((n, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 10, background: C.bg, border: `1px solid ${C.border}` }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{n.label}</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{n.desc}</div>
                          </div>
                          <label style={{ position: "relative", width: 40, height: 22, cursor: "pointer", flexShrink: 0 }}>
                            <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{ position: "absolute", inset: 0, background: C.primary, borderRadius: 999 }} />
                            <span style={{ position: "absolute", left: 3, top: 3, width: 16, height: 16, background: "#fff", borderRadius: "50%", transform: "translateX(18px)" }} />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {settingsTab === "Security" && (
                  <div className="viq-card" style={{ padding: 32 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Security</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Manage your account security settings.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 480 }}>
                      {["Current Password", "New Password", "Confirm New Password"].map(f => (
                        <div key={f}>
                          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{f}</label>
                          <input type="password" placeholder="••••••••" className="viq-input" />
                        </div>
                      ))}
                    </div>
                    <button onClick={() => alert("Password updated.")} style={{ marginTop: 24, padding: "10px 24px", background: C.primary, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Update Password</button>
                    <div style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Two-Factor Authentication</div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Add an extra layer of security to your account.</div>
                      <button style={{ padding: "9px 18px", background: C.successSubtle, color: "#4ADE80", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Enable 2FA</button>
                    </div>
                  </div>
                )}
                {settingsTab === "Integrations" && (
                  <div className="viq-card" style={{ padding: 32 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>API Integrations</div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 28 }}>Connect third-party tools and data sources.</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {[
                        { name: "Crunchbase",          desc: "Startup data and funding information",  connected: true,  color: "#0284C7" },
                        { name: "LinkedIn Sales Nav",  desc: "Founder and company intelligence",      connected: false, color: "#0A66C2" },
                        { name: "DocuSign",            desc: "Term sheet and document signing",        connected: true,  color: "#FC4C02" },
                        { name: "Slack",               desc: "Team notifications and deal alerts",    connected: false, color: "#4A154B" },
                      ].map((int, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 12, background: C.bg, border: `1px solid ${C.border}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${int.color}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Link2 size={16} color={int.color} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700 }}>{int.name}</div>
                              <div style={{ fontSize: 11, color: C.muted }}>{int.desc}</div>
                            </div>
                          </div>
                          <button style={{ padding: "7px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: int.connected ? C.successSubtle : C.primarySubtle, color: int.connected ? "#4ADE80" : "#93C5FD", border: `1px solid ${int.connected ? "rgba(22,163,74,0.2)" : "rgba(37,99,235,0.2)"}` }}>
                            {int.connected ? "Connected" : "Connect"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
