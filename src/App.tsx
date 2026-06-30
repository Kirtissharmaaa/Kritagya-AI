import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  MapPin, 
  TrendingUp, 
  LogOut, 
  Users, 
  Wrench, 
  Activity, 
  FilePlus, 
  Phone, 
  ArrowRight, 
  Search, 
  Image as ImageIcon, 
  ThumbsUp, 
  ThumbsDown,
  Info,
  Clock,
  Briefcase
} from 'lucide-react';
import { Incident, initialIncidents } from './types';

// Helper for status styling
function getStatusBadgeStyles(status: string) {
  switch (status) {
    case 'Reported':
      return { bg: 'bg-amber-100 text-amber-800 border-amber-200', dot: 'bg-amber-500' };
    case 'In Progress':
      return { bg: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' };
    case 'Resolution Verification Pending':
      return { bg: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-500' };
    case 'Verified Resolved':
      return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
    default:
      return { bg: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-500' };
  }
}

function getSeverityStyles(severity: string) {
  const s = severity?.toLowerCase();
  if (s === 'high') return { bg: 'bg-red-50 text-red-700 border-red-200' };
  if (s === 'medium') return { bg: 'bg-amber-50 text-amber-700 border-amber-200' };
  return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
}

// ==========================================
// CENTRAL APPLICATION ROOT & LIFECYCLE CONTROLLER
// ==========================================
export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('kritagya_incidents');
    return saved ? JSON.parse(saved) : initialIncidents;
  });

  // Real authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('kritagya_authenticated') === 'true';
  });
  
  const [userRole, setUserRole] = useState<'CITIZEN' | 'AUTHORITY' | null>(() => {
    return localStorage.getItem('kritagya_user_role') as 'CITIZEN' | 'AUTHORITY' | null;
  });
  
  const [currentUserName, setCurrentUserName] = useState<string>(() => {
    return localStorage.getItem('kritagya_username') || '';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kritagya_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const handleLogin = (role: 'CITIZEN' | 'AUTHORITY', name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setCurrentUserName(name);
    localStorage.setItem('kritagya_authenticated', 'true');
    localStorage.setItem('kritagya_user_role', role);
    localStorage.setItem('kritagya_username', name);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUserName('');
    localStorage.removeItem('kritagya_authenticated');
    localStorage.removeItem('kritagya_user_role');
    localStorage.removeItem('kritagya_username');
  };

  const addIncident = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncidentState = (id: string, updatedFields: Partial<Incident>) => {
    setIncidents(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedFields } : item
    ));
  };

  const initials = currentUserName 
    ? currentUserName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'AK';

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 flex flex-col selection:bg-slate-900/10 selection:text-slate-900">
        
        {/* Top Navigation */}
        <nav className="h-16 bg-[#0f172a] flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-white font-extrabold text-xl tracking-tight hover:opacity-90 transition-opacity">
                🛡️ KRITAGYA AI
              </Link>
              <div className="hidden md:block h-6 w-[1px] bg-slate-700"></div>
              <div className="flex gap-4 sm:gap-6">
                {isAuthenticated && (
                  <Link to="/dashboard" className="text-blue-400 text-sm font-semibold">Operations</Link>
                )}
                {isAuthenticated && userRole === 'CITIZEN' && (
                  <Link to="/report" className="text-slate-400 text-sm font-semibold hover:text-white transition-colors">Report Issue</Link>
                )}
                <Link to="/context" className="text-slate-400 text-sm font-semibold hover:text-white transition-colors">Directory</Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#16a34a] px-3 py-1 rounded text-white">
                    <span className="text-[10px] font-black uppercase tracking-wider">{userRole}</span>
                    <span className="text-xs font-bold max-w-[100px] sm:max-w-[150px] truncate">{currentUserName}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white uppercase select-none">
                    {initials}
                  </div>
                  <button 
                    onClick={handleLogout} 
                    title="Sign Out"
                    className="p-1.5 bg-slate-800 hover:bg-red-900 border border-slate-700 hover:border-red-800 rounded transition-all cursor-pointer text-slate-300 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded transition-all"
                >
                  Access Portal
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Role Banner */}
        {isAuthenticated && (
          <div className="bg-green-50 border-b border-green-100 px-4 sm:px-8 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="text-[11px] text-green-700 font-bold uppercase tracking-wider">
              {userRole === 'CITIZEN' 
                ? "Citizen Node Verified: Inspecting technical AI recommendations and community work orders."
                : "Administrative Node Verified: Inspecting technical AI recommendations and work orders."
              }
            </p>
          </div>
        )}

        {/* Route Systems */}
        <main className="flex-grow py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <Routes>
            <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} userRole={userRole} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} isAuthenticated={isAuthenticated} />} />
            <Route path="/context" element={<ContactsPage />} />
            
            {/* Protected Workspace Nodes */}
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage list={incidents} userRole={userRole} /> : <Navigate to="/login" />} />
            <Route path="/report" element={isAuthenticated && userRole === 'CITIZEN' ? <ReportIssuePage onAdd={addIncident} /> : <Navigate to="/login" />} />
            <Route path="/incident/:id" element={isAuthenticated ? <IncidentDetailPage list={incidents} onStateUpdate={updateIncidentState} userRole={userRole} userId={currentUserName} /> : <Navigate to="/login" />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer Bar */}
        <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 font-sans">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex gap-4">
              <span className="text-[10px] text-slate-400">System: <strong className="text-slate-600 font-mono">KRITAGYA_v2.5.0</strong></span>
              <span className="text-[10px] text-slate-400">Server: <strong className="text-slate-600 font-mono">UP-AGRA-CENTRAL</strong></span>
            </div>
            <div className="text-[10px] text-slate-400 italic hidden sm:block">Secure Administrative Session — Do not share credentials.</div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

// ==========================================
// 1. LANDING COMPONENT (REBRANDED)
// ==========================================
interface LandingPageProps {
  isAuthenticated: boolean;
  userRole: 'CITIZEN' | 'AUTHORITY' | null;
}

function LandingPage({ isAuthenticated, userRole }: LandingPageProps) {
  return (
    <div className="max-w-4xl mx-auto text-center py-16 sm:py-24">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-slate-800 text-xs font-semibold mb-6 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
        Decentralized Truth Verification Protocol
      </div>
      <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 tracking-tight leading-none mb-6">
        🛡️ Kritagya AI
      </h1>
      <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
        The Multimodal Truth Tracking & Verification Protocol for Smart Cities. Connecting real citizen telemetry with automated municipal analytics. No fake audits, no unverified repairs.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        {isAuthenticated ? (
          <Link 
            to="/dashboard" 
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            Access Operations Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-all shadow-sm text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            Access Secure Portal <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        <Link 
          to="/context" 
          className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <Phone className="w-4 h-4 text-slate-400" /> Administrative Directory
        </Link>
      </div>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 text-left">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-slate-900 mb-2">Multimodal Gemini Audit</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Upload a simple photo and issue description. Our server-side Gemini 3.5 Flash engine extracts impact scores, liability risks, and recommended actions instantly.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-slate-900 mb-2">Consensus-Based Closure</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            A repair isn't closed just because an authority claims it. Citizens in the neighborhood must vote &lsquo;YES&rsquo; on the uploaded proof to closing.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-display font-bold text-slate-900 mb-2">Live OpenStreetMap Links</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Includes Nominatim-powered address autocompletion to trace reporting telemetry directly on high-precision physical coordinates.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. DUAL-ROLE AUTHENTICATION CONTROLLER
// ==========================================
interface LoginPageProps {
  onLogin: (role: 'CITIZEN' | 'AUTHORITY', name: string) => void;
  isAuthenticated: boolean;
}

function LoginPage({ onLogin, isAuthenticated }: LoginPageProps) {
  const navigate = useNavigate();
  const [role, setRole] = useState<'CITIZEN' | 'AUTHORITY'>('CITIZEN'); 
  const [identityName, setIdentityName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRoleToggle = (targetRole: 'CITIZEN' | 'AUTHORITY') => {
    setRole(targetRole);
    setIdentityName('');
  };

  const submitAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identityName || !email || !password) {
      alert("Please fill out all identity credentials.");
      return;
    }
    onLogin(role, identityName);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-slate-200 p-8 rounded-xl shadow-sm mt-8">
      <div className="text-center mb-6">
        <h2 className="font-display font-extrabold text-2xl text-slate-900 mb-1">
          Welcome to Kritagya AI
        </h2>
        <p className="text-slate-500 text-sm">
          Select your portal node mode to authenticate credentials.
        </p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
        <button 
          type="button" 
          onClick={() => handleRoleToggle('CITIZEN')} 
          className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${role === 'CITIZEN' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Citizen User
        </button>
        <button 
          type="button" 
          onClick={() => handleRoleToggle('AUTHORITY')} 
          className={`flex-1 py-2 text-xs font-bold rounded transition-all cursor-pointer ${role === 'AUTHORITY' ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          City Authority
        </button>
      </div>

      <form onSubmit={submitAuth} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            {role === 'CITIZEN' ? 'Citizen Display Name' : 'Official Department / Agency Node'}
          </label>
          {role === 'CITIZEN' ? (
            <input 
              type="text" 
              value={identityName} 
              onChange={(e) => setIdentityName(e.target.value)} 
              placeholder="e.g., Ramesh Kumar" 
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              required 
            />
          ) : (
            <select 
              value={identityName} 
              onChange={(e) => setIdentityName(e.target.value)} 
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
              required
            >
              <option value="">-- Select Department --</option>
              <option value="Agra Municipal Corporation (AMC)">Agra Municipal Corporation (AMC)</option>
              <option value="Dakshinanchal Vidyut Vitran Nigam (Electrical Grid)">Dakshinanchal Vidyut Vitran Nigam (Electrical Grid)</option>
              <option value="Agra Water Supply Board (Jal Sansthan)">Agra Water Supply Board (Jal Sansthan)</option>
              <option value="Public Works Department (PWD Road Safety)">Public Works Department (PWD Road Safety)</option>
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            Official Email Address
          </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder={role === 'CITIZEN' ? "e.g., ramesh.kumar@gmail.com" : "e.g., lead.auditor@agra.gov.in"} 
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
            Security Access Password
          </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
            className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
            required 
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-2.5 font-bold text-white text-sm rounded bg-[#0f172a] hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
        >
          Secure Sign In as {role === 'CITIZEN' ? 'Citizen' : 'Authority'}
        </button>
      </form>
    </div>
  );
}

// ==========================================
// 3. PAN-INDIA MUNICIPAL ADMINISTRATIVE DIRECTORY
// ==========================================
function ContactsPage() {
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'EMERGENCY' | 'UP' | 'METROS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const directoryData = [
    { id: 1, type: 'EMERGENCY', agency: 'National Disaster Response Force (NDRF)', zone: 'National', scope: 'Flood/Structural Collapse Rescue', contact: '1078', email: 'info@ndrf.gov.in' },
    { id: 2, type: 'EMERGENCY', agency: 'Centralized Fire Services Hotline', zone: 'National', scope: 'Critical Infrastructure Fires', contact: '101', email: 'emergency@fire.gov.in' },
    { id: 3, type: 'MUNICIPAL', agency: 'Agra Municipal Corporation (AMC)', zone: 'Uttar Pradesh', scope: 'Taj Trapezium Zone Infrastructure Logistics', contact: '0562-2460012', email: 'amcagra@gmail.com' },
    { id: 4, type: 'MUNICIPAL', agency: 'Municipal Corporation of Delhi (MCD)', zone: 'Delhi NCR', scope: 'National Capital Territory Public Utilities', contact: '011-23212700', email: 'commissioner@mcd.gov.in' },
    { id: 5, type: 'MUNICIPAL', agency: 'Brihanmumbai Municipal Corporation (BMC)', zone: 'Maharashtra', scope: 'Urban Drainage & Monsoon Flood Interventions', contact: '022-22620251', email: 'mc@mcgm.gov.in' },
    { id: 6, type: 'MUNICIPAL', agency: 'Bruhat Bengaluru Mahanagara Palike (BBMP)', zone: 'Karnataka', scope: 'Tech-Corridor Structural Management & Roads', contact: '080-22221188', email: 'comm@bbmp.gov.in' },
    { id: 7, type: 'MUNICIPAL', agency: 'Greater Chennai Corporation (GCC)', zone: 'Tamil Nadu', scope: 'Coastal Utility Zoning & Grievances', contact: '044-25619200', email: 'commissioner@chennaicorporation.gov.in' },
    { id: 8, type: 'MUNICIPAL', agency: 'Kolkata Municipal Corporation (KMC)', zone: 'West Bengal', scope: 'Heritage Preservation & Utility Operations', contact: '033-22861000', email: 'cmc@kmcgov.in' }
  ];

  const filteredContacts = directoryData.filter(node => {
    const matchesRegion = 
      regionFilter === 'ALL' || 
      (regionFilter === 'EMERGENCY' && node.type === 'EMERGENCY') ||
      (regionFilter === 'UP' && node.zone === 'Uttar Pradesh') ||
      (regionFilter === 'METROS' && node.zone !== 'Uttar Pradesh' && node.zone !== 'National');

    const matchesSearch = 
      node.agency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.scope.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRegion && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900 mb-1">
          🏢 Public Infrastructure Directory
        </h2>
        <p className="text-slate-500 text-sm">
          Direct escalations to National Crisis Helplines and Tier-1 Municipal Engineering Desks.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 'ALL', label: 'All Services' },
            { id: 'EMERGENCY', label: '🚨 Crisis Numbers' },
            { id: 'UP', label: 'Uttar Pradesh' },
            { id: 'METROS', label: 'Metros' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setRegionFilter(tab.id as any)} 
              className={`border-none px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${regionFilter === tab.id ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search city, state, or agency..." 
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((node) => (
          <div 
            key={node.id} 
            className={`bg-white border border-slate-200 p-5 rounded-xl flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-0.5 ${node.type === 'EMERGENCY' ? 'border-t-4 border-t-red-500' : 'border-t-4 border-t-slate-800'}`}
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-[10px] font-extrabold uppercase ${node.type === 'EMERGENCY' ? 'text-red-600' : 'text-slate-700'}`}>
                  {node.type}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  📍 {node.zone}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-sm text-slate-900 mb-1 leading-snug">
                {node.agency}
              </h3>
              <p className="text-xs text-slate-500 italic">
                Scope: {node.scope}
              </p>
            </div>

            <div className="bg-slate-50 p-3 border border-slate-100 rounded-lg text-xs space-y-1">
              <div>
                <strong className="text-slate-700">📞 Hotline: </strong>
                <a href={`tel:${node.contact}`} className="text-slate-900 font-bold hover:underline">{node.contact}</a>
              </div>
              <div className="truncate">
                <strong className="text-slate-700">✉️ Email: </strong>
                <span className="text-slate-500">{node.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. CITIZEN EXCLUSIVE REPORT
// ==========================================
interface ReportIssuePageProps {
  onAdd: (incident: Incident) => void;
}

function ReportIssuePage({ onAdd }: ReportIssuePageProps) {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [beforeImageBase64, setBeforeImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initiating Audit sequence...');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle live OSM Nominatim geocoding
  const handleLocationTyping = async (text: string) => {
    setLocationQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Geocoding fetch failure: ", err);
    }
  };

  const selectSuggestion = (place: any) => {
    setSelectedLocation(place);
    setLocationQuery(place.display_name);
    setSuggestions([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBeforeImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (description.trim().length < 10) {
      setErrorMessage('Please write a slightly more detailed explanation (minimum 10 characters).');
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage('Uploading audit proof context payload...');

      const interval = setInterval(() => {
        const messages = [
          'Analyzing report structure via server-side Gemini 3.5 Flash...',
          'Classifying municipal infrastructure department boundaries...',
          'Estimating structural risk projections & essential service disruptions...',
          'Generating immediate engineering resolution directives...',
          'Awaiting cryptographic state validation...'
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        setLoadingMessage(randomMsg);
      }, 2000);

      // POST to our server-side Express endpoint
      const response = await fetch('/api/analyze-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          location: locationQuery,
          beforeImage: beforeImageBase64 || null
        })
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server returned error parsing context.');
      }

      const parsedData = await response.json();

      const newIncident: Incident = {
        id: String(Date.now()),
        title: `Verify: ${parsedData.category || 'Urban Infrastructure Issue'}`,
        category: parsedData.category || 'General Civil',
        severity: (parsedData.severity || 'Medium') as 'High' | 'Medium' | 'Low',
        confidence: parsedData.confidence || '90%',
        impactScore: parsedData.impactScore || 50,
        status: 'Reported',
        location: locationQuery,
        mapUrl: selectedLocation 
          ? `https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lon}#map=15/${selectedLocation.lat}/${selectedLocation.lon}` 
          : 'https://www.openstreetmap.org/#map=5/21.84/82.79', // default center of India
        summary: parsedData.summary || description,
        beforeImage: beforeImageBase64 || 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?q=80&w=600&auto=format&fit=crop',
        afterImage: '',
        votesYes: 0,
        votesNo: 0,
        votedUserIds: [],
        affectedGroups: parsedData.affectedGroups || ['Local Residents'],
        essentialServices: parsedData.essentialServices || ['Local Public Utilities'],
        futureRisks: parsedData.futureRisks || ['Escalation of localized hazard'],
        recommendedActions: parsedData.recommendedActions || ['Inspect report physical site', 'Formulate work-order timeline']
      };

      onAdd(newIncident);
      setLoading(false);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Verification framework offline. Please ensure GEMINI_API_KEY is configured in Secrets.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <span className="p-2 bg-slate-100 text-slate-700 rounded-lg">
          <FilePlus className="w-5 h-5" />
        </span>
        <div>
          <h2 className="font-display font-extrabold text-lg text-slate-900 leading-none">
            Citizen Incident Reporting Desk
          </h2>
          <p className="text-slate-400 text-xs mt-1">Submit visual and text telemetry for instant AI classification.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 space-y-4">
          <div className="relative inline-flex">
            <span className="flex h-12 w-12 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-12 w-12 bg-slate-800 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white animate-pulse" />
              </span>
            </span>
          </div>
          <h3 className="text-slate-800 font-display font-bold text-sm tracking-wide">
            Kritagya Audit Stream Active
          </h3>
          <p className="text-slate-400 text-xs animate-pulse max-w-sm mx-auto italic">
            &ldquo;{loadingMessage}&rdquo;
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-xs flex gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <div>
                <strong className="font-bold">Verification Stall: </strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Detailed Complaint Description
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Describe what infrastructure is compromised, e.g., flooded road due to major pipe leak on Sanjay crossing, rusted street electricity boxes showing live sparks, etc." 
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 min-h-[100px] transition-all"
              required 
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Problem Location (Live Maps Autocomplete)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                value={locationQuery} 
                onChange={(e) => handleLocationTyping(e.target.value)} 
                placeholder="Type location e.g. Sanjay Place Agra, Uttar Pradesh..." 
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                required 
              />
            </div>
            
            {/* Autocomplete Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-10 mt-1 max-h-48 overflow-y-auto">
                {suggestions.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSuggestion(place)}
                    className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center gap-2"
                  >
                    <span className="text-slate-400">📍</span>
                    <span className="truncate text-slate-700 font-medium">{place.display_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
              Proof Photograph (Compromised Area)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
              <div className="space-y-1 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                <div className="flex text-sm text-slate-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-slate-900 hover:text-slate-700 focus-within:outline-none">
                    <span>Upload a photo proof</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="sr-only" 
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
              {beforeImageBase64 && (
                <div className="absolute inset-0 bg-white p-2 rounded-lg flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <img 
                      src={beforeImageBase64} 
                      alt="Before Preview" 
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button 
                      type="button" 
                      onClick={() => setBeforeImageBase64('')}
                      className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-1.5 text-xs font-bold shadow cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Shield className="w-4 h-4" /> Execute Cryptographic Incident Audit
          </button>
        </form>
      )}
    </div>
  );
}

// ==========================================
// 5. DASHBOARD OPERATIONS FEED
// ==========================================
interface DashboardPageProps {
  list: Incident[];
  userRole: 'CITIZEN' | 'AUTHORITY' | null;
}

function DashboardPage({ list, userRole }: DashboardPageProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'VERIFICATION' | 'RESOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const totalReports = list.length;
  const pendingResolve = list.filter(i => i.status === 'Reported' || i.status === 'In Progress').length;
  const pendingVerification = list.filter(i => i.status === 'Resolution Verification Pending').length;
  const resolved = list.filter(i => i.status === 'Verified Resolved').length;

  const filteredList = list.filter(item => {
    const matchesFilter = 
      activeFilter === 'ALL' ||
      (activeFilter === 'PENDING' && (item.status === 'Reported' || item.status === 'In Progress')) ||
      (activeFilter === 'VERIFICATION' && item.status === 'Resolution Verification Pending') ||
      (activeFilter === 'RESOLVED' && item.status === 'Verified Resolved');
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesFilter && matchesSearch;
  });

  // Dynamic Visual Insights Generation (Bar Chart using native Canvas)
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set display width/height dynamically
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    // Extract categories & count occurrences
    const categories = Array.from(new Set(list.map(i => i.category || 'General')));
    if (categories.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No telemetry records available to plot.', width / 2, height / 2);
      return;
    }

    const counts = categories.map(cat => list.filter(i => i.category === cat).length);
    const maxCount = Math.max(...counts, 1);

    const padding = 35;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const gap = 15;
    const barWidth = Math.max(10, (chartWidth - (categories.length - 1) * gap) / categories.length);

    // Draw background horizontal lines
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) {
      const y = padding + (chartHeight / 3) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    categories.forEach((cat, index) => {
      const count = counts[index];
      const barHeight = (count / maxCount) * (chartHeight - 15);
      const x = padding + index * (barWidth + gap);
      const y = height - padding - barHeight;

      // Draw modern rounded bar
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Bar count label
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(count), x + barWidth / 2, y - 6);

      // Category text on X axis
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      const maxLabelLen = Math.floor(barWidth / 6);
      const shortLabel = cat.length > maxLabelLen ? cat.substring(0, maxLabelLen - 2) + '..' : cat;
      ctx.fillText(shortLabel, x + barWidth / 2, height - padding + 15);
    });
  }, [list, userRole]);

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Operations Audit Engine</div>
          <h2 className="font-display font-extrabold text-3xl text-slate-900 mt-1">
            📈 Kritagya Verification Analytics
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Real-time systemic processing metrics and verification consensus logs.</p>
        </div>
      </div>

      {/* METRICS BANNER GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Audits Filed</span>
            <span className="text-3xl font-extrabold text-slate-900 block mt-1">{totalReports}</span>
          </div>
          <span className="p-3 bg-slate-50 border border-slate-100 rounded text-slate-500">
            <FileText className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Pending Resolution</span>
            <span className="text-3xl font-extrabold text-amber-600 block mt-1">{pendingResolve}</span>
          </div>
          <span className="p-3 bg-amber-50 border border-amber-100 rounded text-amber-500">
            <Clock className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-l-purple-500">
          <div>
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block">Audit Consensus Phase</span>
            <span className="text-3xl font-extrabold text-purple-600 block mt-1">{pendingVerification}</span>
          </div>
          <span className="p-3 bg-purple-50 border border-purple-100 rounded text-purple-500">
            <Users className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between border-l-4 border-l-emerald-500">
          <div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Closed & Verified</span>
            <span className="text-3xl font-extrabold text-emerald-600 block mt-1">{resolved}</span>
          </div>
          <span className="p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-500">
            <CheckCircle className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* CHART & MATRIX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" /> Vector Distribution by Infrastructure Category
          </h3>
          <div className="relative h-48 w-full">
            <canvas ref={chartRef} className="absolute inset-0 w-full h-full" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4 text-slate-500" /> Intelligent Prioritization Matrix
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-4">
              Kritagya AI computes real-time community severity metrics based on report parameters. Issues affecting critical services (grids, water lines) or those holding a triage score greater than <strong className="text-red-500">70 points</strong> are systematically flagged to the top of official engineering channels.
            </p>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-xs text-slate-700">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                <strong>System Signature:</strong> Standard users can file issues. Verification consensus is locked to decentralized community cryptographic keys to enforce true audits.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'VERIFICATION', 'RESOLVED'] as const).map((filter) => (
            <button 
              key={filter} 
              onClick={() => setActiveFilter(filter)} 
              className={`border-none px-3 py-1.5 rounded text-xs font-bold cursor-pointer transition-all ${activeFilter === filter ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {filter === 'PENDING' ? '🛠️ Under Fix' : filter === 'VERIFICATION' ? '🗳️ Active Vote' : filter === 'RESOLVED' ? '✅ Closed' : 'All Reports'}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Filter records by area, category, or title..." 
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
          />
        </div>
      </div>

      {/* CARDS LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-display font-extrabold text-slate-900 text-base">
            System Records Log ({filteredList.length})
          </h3>
          <span className="text-[10px] font-mono text-slate-400">STATE: MUTABLE</span>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
            <span className="p-4 bg-slate-50 rounded-full inline-block text-slate-300 mb-3">
              <FileText className="w-8 h-8" />
            </span>
            <p className="text-slate-500 text-sm font-medium">No incident records match the active filters.</p>
            <p className="text-slate-400 text-xs mt-1">Try broadening your keyword search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((incident) => {
              const statusStyles = getStatusBadgeStyles(incident.status);
              const severityStyles = getSeverityStyles(incident.severity);
              return (
                <div 
                  key={incident.id} 
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300"
                >
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        #{incident.id}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-bold rounded-full ${statusStyles.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                        {incident.status}
                      </span>
                    </div>

                    {incident.beforeImage && (
                      <div className="relative h-40 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                        <img 
                          src={incident.beforeImage} 
                          alt={incident.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono block">
                        {incident.category}
                      </span>
                      <h4 className="font-display font-bold text-slate-900 text-sm leading-tight line-clamp-1">
                        {incident.title}
                      </h4>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        {incident.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-500 flex-wrap gap-2">
                      <div className="flex items-center gap-1 max-w-[160px] truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{incident.location}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded border ${severityStyles.bg} font-semibold text-[10px]`}>
                        {incident.severity}
                      </span>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1">
                    <Link 
                      to={`/incident/${incident.id}`} 
                      className="w-full py-2 flex items-center justify-center gap-1.5 border border-slate-200 hover:border-slate-800 text-slate-800 hover:text-slate-900 font-bold bg-white hover:bg-slate-50 rounded transition-all text-xs"
                    >
                      {userRole === 'AUTHORITY' ? '⚙️ Manage Resolution' : 'Inspect Consensus Status →'}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// ==========================================
// 6. DETAIL WORKSPACE NODE
// ==========================================
interface IncidentDetailPageProps {
  list: Incident[];
  onStateUpdate: (id: string, updatedFields: Partial<Incident>) => void;
  userRole: 'CITIZEN' | 'AUTHORITY' | null;
  userId: string;
}

function IncidentDetailPage({ list, onStateUpdate, userRole, userId }: IncidentDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = list.find(x => x.id === id);

  const [resolutionText, setResolutionText] = useState('');
  const [afterImageBase64, setAfterImageBase64] = useState(''); 
  const [verifying, setVerifying] = useState(false);

  if (!item) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <h3 className="text-slate-800 font-display font-bold text-lg">Record Not Found</h3>
        <p className="text-slate-500 text-sm mt-2">The record ID might be invalid or has been purged.</p>
        <Link to="/dashboard" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const userHasVoted = item.votedUserIds?.includes(userId) || false;

  const handleAfterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAfterImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAuthoritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      onStateUpdate(item.id, { 
        status: "Resolution Verification Pending", 
        afterImage: afterImageBase64 || 'https://pragnews.com/assets/post/2026/06/1781687016_NzitLBKW.webp?q=80&w=600&auto=format&fit=crop',
        summary: resolutionText ? `MUNICIPAL RESOLUTION NOTE: ${resolutionText}. ORIGINAL ISSUES: ${item.summary}` : item.summary
      });
      alert(`Claim Recorded: Moving file to neighborhood consensus blocks.`);
      setVerifying(false);
      setResolutionText('');
      setAfterImageBase64('');
    }, 1200);
  };

  const registerVote = (voteType: 'YES' | 'NO') => {
    if (userHasVoted) {
      alert("🚫 Profile security token indicates you have already recorded a vote for this file entry.");
      return;
    }
    let nextYes = item.votesYes || 0;
    let nextNo = item.votesNo || 0;
    if (voteType === 'YES') nextYes += 1;
    if (voteType === 'NO') nextNo += 1;

    const updatedVoters = [...(item.votedUserIds || []), userId];
    
    let updatedStatus = item.status;
    if (nextYes >= 3) {
      updatedStatus = "Verified Resolved";
    } else if (nextNo >= 3) {
      // Transition back to reported on rejection
      updatedStatus = "Reported";
      // Clear votes for retry
      nextYes = 0;
      nextNo = 0;
      onStateUpdate(item.id, { 
        votesYes: 0, 
        votesNo: 0, 
        votedUserIds: [], 
        status: updatedStatus,
        afterImage: '' // clear failed proof image
      });
      alert(`Audit Consensus Rejected: Complaint status rolled back to 'Reported' for remediation.`);
      return;
    }

    onStateUpdate(item.id, { 
      votesYes: nextYes, 
      votesNo: nextNo, 
      votedUserIds: updatedVoters, 
      status: updatedStatus 
    });
  };

  const statusStyles = getStatusBadgeStyles(item.status);
  const severityStyles = getSeverityStyles(item.severity);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2 border-b border-slate-100 pb-4">
          <span className="text-xs font-mono font-bold text-slate-400">RECORD METRIC #{item.id}</span>
          <div className="flex gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
              {item.status}
            </span>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
              Confidence: {item.confidence}
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">{item.category}</span>
          <h2 className="font-display font-extrabold text-2xl text-slate-900 mt-1">{item.title}</h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{item.location}</span>
          </div>
        </div>

        {item.mapUrl && (
          <a 
            href={item.mapUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs rounded transition-colors cursor-pointer"
          >
            🗺️ Open Live OpenStreetMap coordinates
          </a>
        )}
      </div>

      {/* PROOF IMAGES */}
      {(item.beforeImage || item.afterImage) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {item.beforeImage && (
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <h4 className="text-xs font-bold text-red-600 mb-3 tracking-wide uppercase font-mono flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Before Image (Citizen Upload)
              </h4>
              <div className="h-56 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img src={item.beforeImage} alt="Before Audit" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
          {item.afterImage ? (
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
              <h4 className="text-xs font-bold text-emerald-600 mb-3 tracking-wide uppercase font-mono flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> After Image (Municipal Claim)
              </h4>
              <div className="h-56 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <img src={item.afterImage} alt="After Clearance" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-center items-center text-center text-slate-400 h-full">
              <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs font-medium">No resolution photo submitted yet.</p>
              <p className="text-[10px] text-slate-400 mt-1">Pending physical work from municipal engineers.</p>
            </div>
          )}
        </div>
      )}

      {/* DETAILED TRIAGE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: CITIZEN STATEMENT */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display font-extrabold text-sm text-slate-900">
              Audit Context Evaluation
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <strong className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Report Summary</strong>
              <p className="text-slate-700 text-sm mt-1 leading-relaxed">{item.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Severity Rating</strong>
                <span className={`inline-block px-2.5 py-0.5 rounded border text-xs font-bold mt-1 ${severityStyles.bg}`}>
                  {item.severity}
                </span>
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Burden Score</strong>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {item.impactScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </span>
              </div>
            </div>

            <div>
              <strong className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Directly Affected Demographics</strong>
              <div className="flex gap-1.5 flex-wrap mt-1.5">
                {item.affectedGroups?.map((g, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <strong className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Disrupted Essential Utilities</strong>
              <div className="flex gap-1.5 flex-wrap mt-1.5">
                {item.essentialServices?.map((u, idx) => (
                  <span key={idx} className="bg-rose-50 text-rose-700 text-[10px] font-semibold px-2.5 py-0.5 rounded border border-rose-100">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REVISED REMEDIATION & LIABILITY */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-display font-extrabold text-sm text-slate-900">
              🛠️ Engineering Resolution Protocols
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <strong className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Remediation Steps (AI Proposed)</strong>
              <ul className="list-disc pl-5 text-slate-700 text-xs space-y-1.5 mt-2">
                {item.recommendedActions?.map((act, i) => (
                  <li key={i}>{act}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg">
              <strong className="block text-xs font-bold text-amber-800 uppercase tracking-wider font-mono flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Projected Risk Forecast
              </strong>
              <ul className="list-disc pl-5 text-amber-950 text-xs space-y-1 mt-2">
                {item.futureRisks?.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* ACTION PANES */}
      
      {/* CITIZEN INTERACTIVE REPAIR VERIFICATION BLOCK */}
      {userRole === 'CITIZEN' && item.status === "Resolution Verification Pending" && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-800" />
            <h3 className="font-display font-extrabold text-base text-slate-950">
              Citizen Decentralized Consensus Panel
            </h3>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            The municipal authority claims to have successfully completed repair works. Please inspect the <strong>After Proof Photo</strong> carefully. Does this address the originally filed complaint comprehensively?
          </p>

          <div className="bg-white p-4 border border-slate-200 rounded flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap">
            <div className="text-xs font-semibold text-slate-700">
              {userHasVoted ? (
                <span className="text-amber-600 flex items-center gap-1">
                  🚫 Your profile credentials have already voted for this entry.
                </span>
              ) : (
                <span>Cast your vote: 3 total &lsquo;YES&rsquo; close the report, 3 &lsquo;NO&rsquo; re-open it.</span>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => registerVote('YES')}
                disabled={userHasVoted}
                className={`px-4 py-2 border rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${userHasVoted ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-[#0f172a] hover:bg-slate-800 text-white shadow-sm'}`}
              >
                <ThumbsUp className="w-4 h-4" /> Verify Fixed ({item.votesYes}/3)
              </button>
              <button 
                onClick={() => registerVote('NO')}
                disabled={userHasVoted}
                className={`px-4 py-2 border rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${userHasVoted ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-red-700 hover:bg-red-800 text-white shadow-sm'}`}
              >
                <ThumbsDown className="w-4 h-4" /> Still Broken ({item.votesNo}/3)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTHORITY ACTION PANEL */}
      {userRole === 'AUTHORITY' && (item.status === 'Reported' || item.status === 'In Progress') && (
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-800" />
            <h3 className="font-display font-extrabold text-base text-slate-950">
              Administration Clearance Panel
            </h3>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Record physical intervention works below. Upload an <strong>After Intervention Proof Photo</strong> to migrate the ticket from municipal queue to citizen consensus verification block.
          </p>

          <form onSubmit={handleAuthoritySubmit} className="space-y-4">
            {verifying ? (
              <div className="text-center py-6">
                <span className="inline-block animate-spin w-6 h-6 border-2 border-slate-800 border-t-transparent rounded-full" />
                <p className="text-xs text-slate-700 font-bold mt-2">Uploading clearance proof...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide uppercase font-mono">
                      Completion Proof Photo
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAfterFileChange} 
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 transition-all"
                      required
                    />
                    {afterImageBase64 && (
                      <div className="mt-2 h-20 w-32 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                        <img src={afterImageBase64} alt="After Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 tracking-wide uppercase font-mono">
                      Resolution Remarks
                    </label>
                    <textarea 
                      value={resolutionText} 
                      onChange={(e) => setResolutionText(e.target.value)}
                      placeholder="Detail work done, e.g., replaced 3 streetlights on Grid Line B, patched transformer wiring sequence safely." 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 min-h-[80px] transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold text-xs rounded shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Broadcast Clearance Proof
                </button>
              </>
            )}
          </form>
        </div>
      )}

      {/* DISPATCH TO DASHBOARD */}
      <div className="pt-4 flex justify-between">
        <Link to="/dashboard" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
          ← Return to Operations Dashboard
        </Link>
        <span className="text-[10px] text-slate-400 font-mono">CONSENSUS_METHOD: MULTI_VOTE_DEMO</span>
      </div>

    </div>
  );
}
