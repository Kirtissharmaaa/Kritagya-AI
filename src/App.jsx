import { useState } from 'react';
// import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==========================================
// CONFIGURATION & GLOBAL STRUCTURAL SCHEMAS
// ==========================================
const analysisSchema = {
  type: "object",
  properties: {
    category: { type: "string", description: "The clear category of the infrastructure issue." },
    severity: { type: "string", description: "High, Medium, or Low" },
    confidence: { type: "string", description: "Percentage confidence e.g., 95%" },
    summary: { type: "string", description: "A comprehensive summary of the problem reported." },
    affectedGroups: { type: "array", items: { type: "string" }, description: "Demographics or groups of citizens directly impacted." },
    essentialServices: { type: "array", items: { type: "string" }, description: "Public services disrupted like water, grid electricity, transport." },
    impactScore: { type: "integer", description: "Calculated community impact scale from 1 to 100." },
    futureRisks: { type: "array", items: { type: "string" }, description: "Cascading consequences if ignored immediately." },
    recommendedActions: { type: "array", items: { type: "string" }, description: "Step-by-step resolution plan for local authorities." }
  },
  required: ["category", "severity", "confidence", "summary", "affectedGroups", "essentialServices", "impactScore", "futureRisks", "recommendedActions"],
};

const initialIncidents = [
  {
    id: '1',
    title: 'Damaged Street Grid Lights',
    category: 'Electrical Grid',
    severity: 'Medium',
    impactScore: 68,
    status: 'Reported',
    location: 'Agra, Uttar Pradesh, India',
    summary: 'Multiple streetlights are non-functional since the heavy storm last Tuesday, posing safety hazards at night.',
    beforeImage: '',
    afterImage: '',
    votesYes: 0,
    votesNo: 0,
    votedUserIds: [],
    affectedGroups: ['Night Commuters', 'Local Residents'],
    essentialServices: ['Public Safety Lighting'],
    futureRisks: ['Increase in nocturnal accidents', 'Security blind spots'],
    recommendedActions: ['Inspect wiring sequence', 'Replace standard bulbs with low-voltage units']
  }
];

function getSeverityStyles(severity) {
  const s = severity?.toLowerCase();
  if (s === 'high') return { bg: '#fee2e2', text: '#991b1b' };
  if (s === 'medium') return { bg: '#fef3c7', text: '#92400e' };
  return { bg: '#dcfce7', text: '#166534' };
}

// ==========================================
// CENTRAL APPLICATION ROUTER & LIFECYCLE CONTROLLER
// ==========================================
export default function App() {
  const [incidents, setIncidents] = useState(initialIncidents);
  
  // Real authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'CITIZEN' or 'AUTHORITY'
  const [currentUserName, setCurrentUserName] = useState(''); // Tracking display name/department smoothly

  const addIncident = (newIncident) => {
    setIncidents(prev => [newIncident, ...prev]);
  };

  const updateIncidentState = (id, updatedFields) => {
    setIncidents(prev => prev.map(item => 
      item.id === id ? { ...item, ...updatedFields } : item
    ));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUserName(''); // ✅ FIXED: Wipes name state correctly on sign out
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif' }}>
        
        {/* Navigation Bar Rebranded to Kritagya AI */}
        <nav style={{ backgroundColor: '#0f172a', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px' }}>🛡️ KRITAGYA AI</Link>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Dashboard</Link>
                {userRole === 'CITIZEN' && (
                  <Link to="/report" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Report Issue</Link>
                )}
              </>
            )}
            <Link to="/context" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Contact</Link>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'white', backgroundColor: userRole === 'CITIZEN' ? '#2563eb' : '#16a34a', padding: '0.3rem 0.6rem', borderRadius: '0.25rem', fontWeight: 'bold' }}>
                  {userRole === 'CITIZEN' ? `👤 ${currentUserName}` : `🏢 ${currentUserName}`}
                </span>
                <button onClick={handleLogout} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
              </div>
            ) : (
              <Link to="/login" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.4rem 0.9rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.85rem' }}>Login</Link>
            )}
          </div>
        </nav>

        {/* Global Banner Notification Context */}
        {isAuthenticated && (
          <div style={{ backgroundColor: userRole === 'CITIZEN' ? '#eff6ff' : '#f0fdf4', borderBottom: `1px solid ${userRole === 'CITIZEN' ? '#bfdbfe' : '#bbf7d0'}`, padding: '0.5rem 2rem', fontSize: '0.8rem', color: userRole === 'CITIZEN' ? '#1e40af' : '#166534', fontWeight: '600' }}>
            {userRole === 'CITIZEN' 
              ? "💡 Citizen Portal Secure Session: Report local issues or log status votes." 
              : "🏢 Administrative Node Verified: Inspect technical AI recommendations and broadcast work orders."
            }
          </div>
        )}

        {/* Route Systems */}
        <div style={{ padding: '2rem 1.5rem' }}>
          <Routes>
            <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} userRole={userRole} />} />
            {/* ✅ FIXED: Passes the identity name to currentUserName handler smoothly */}
            <Route path="/login" element={<LoginPage onLogin={(role, identityName) => { setIsAuthenticated(true); setUserRole(role); setCurrentUserName(identityName); }} />} />
            <Route path="/context" element={<ContactsPage />} />
            
            {/* Protected Workspace Nodes */}
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage list={incidents} userRole={userRole} /> : <Navigate to="/login" />} />
            <Route path="/report" element={isAuthenticated && userRole === 'CITIZEN' ? <ReportIssuePage onAdd={addIncident} /> : <Navigate to="/login" />} />
            {/* ✅ FIXED: userId uses currentUserName token seamlessly to handle identity signatures */}
            <Route path="/incident/:id" element={isAuthenticated ? <IncidentDetailPage list={incidents} onStateUpdate={updateIncidentState} userRole={userRole} userId={currentUserName} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// ==========================================
// 1. LANDING COMPONENT (REBRANDED)
// ==========================================
function LandingPage({ isAuthenticated }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '1rem', fontWeight: '900' }}>🛡️ Kritagya AI</h1>
      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '2.5rem', lineHeight: '1.6' }}>
        The Multimodal Truth Tracking & Verification Protocol for Smart Cities. Connecting real community updates with automated city administration.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <Link to="/dashboard" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Go to Operations Dashboard</Link>
        ) : (
          <Link to="/login" style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Access Secure Portal</Link>
        )}
        <Link to="/context" style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', textDecoration: 'none' }}>Read Documentation</Link>
      </div>
    </div>
  );
}

// ==========================================
// 2. DUAL-ROLE AUTHENTICATION CONTROLLER
// ==========================================
function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [role, setRole] = useState('CITIZEN'); 
  const [identityName, setIdentityName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 
  const handleRoleToggle = (targetRole) => {
    setRole(targetRole);
    setIdentityName('');
  };

  const submitAuth = (e) => {
    e.preventDefault();
    
    if (!identityName || !email || !password) {
      alert("Please fill out all identity credentials.");
      return;
    }

    onLogin(role, identityName);
    navigate('/dashboard');
  };

  return (
    <div style={{ maxWidth: '420px', margin: '3rem auto', backgroundColor: 'white', padding: '2.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', textAlign: 'center', margin: '0 0 0.5rem 0', color: '#0f172a' }}>Welcome to Kritagya AI</h2>
      <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: '1.5rem' }}>Select your portal mode to authenticate credentials.</p>
      
      <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        {/* Updated toggles below to execute clean rule mechanics */}
        <button type="button" onClick={() => handleRoleToggle('CITIZEN')} style={{ flex: 1, border: 'none', padding: '0.6rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', backgroundColor: role === 'CITIZEN' ? 'white' : 'transparent', color: role === 'CITIZEN' ? '#2563eb' : '#64748b', boxShadow: role === 'CITIZEN' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>Citizen User</button>
        <button type="button" onClick={() => handleRoleToggle('AUTHORITY')} style={{ flex: 1, border: 'none', padding: '0.6rem', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', backgroundColor: role === 'AUTHORITY' ? 'white' : 'transparent', color: role === 'AUTHORITY' ? '#16a34a' : '#64748b', boxShadow: role === 'AUTHORITY' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none' }}>City Authority</button>
      </div>

      <form onSubmit={submitAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>
            {role === 'CITIZEN' ? 'Full Name' : 'Official Department / Agency Node'}
          </label>
          {role === 'CITIZEN' ? (
            <input type="text" value={identityName} onChange={(e) => setIdentityName(e.target.value)} placeholder="e.g., Ramesh Kumar" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} required />
          ) : (
            <select value={identityName} onChange={(e) => setIdentityName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem', backgroundColor: 'white' }} required>
              <option value="">-- Select Department --</option>
              <option value="Agra Municipal Corporation (AMC)">Agra Municipal Corporation (AMC)</option>
              <option value="Dakshinanchal Vidyut Vitran Nigam (Electrical Grid)">Dakshinanchal Vidyut Vitran Nigam (Electrical Grid)</option>
              <option value="Agra Water Supply Board (Jal Sansthan)">Agra Water Supply Board (Jal Sansthan)</option>
              <option value="Public Works Department (PWD Road Safety)">Public Works Department (PWD Road Safety)</option>
            </select>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>Official Email ID</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'CITIZEN' ? "e.g., xyz@gmail.com" : "e.g., administration@agra.gov.in"} style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} required />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.3rem', color: '#334155' }}>Security Access Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} required />
        </div>

        <button type="submit" style={{ width: '100%', backgroundColor: role === 'CITIZEN' ? '#2563eb' : '#16a34a', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
          Secure Sign In as {role === 'CITIZEN' ? 'Citizen' : 'Authority'}
        </button>
      </form>
    </div>
  );
}







// ==========================================
// 3. PLATFORM CONTACTS & SUPPORT DIRECTORY
// ==========================================
// ==========================================
// 4. PAN-INDIA MUNICIPAL ADMINISTRATIVE DIRECTORY
// ==========================================
function ContactsPage() {
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Scalable, Multi-City Emergency & Administrative Directory Structure
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

  // 2. Multi-Tier Filtering Logic
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
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Informational Header */}
      <div>
        <h2 style={{ fontSize: '1.7rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.3rem 0' }}>🏢 Public Infrastructure Directory</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
          Direct escalations to National Crisis Helplines and Tier-1 Municipal Engineering Desks.
        </p>
      </div>

      {/* Interactive Controls Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Services' },
            { id: 'EMERGENCY', label: '🚨 National Crisis Numbers' },
            { id: 'UP', label: 'Uttar Pradesh Nodes' },
            { id: 'METROS', label: 'Other Indian Metros' }
          ].map((tab) => (
            <button key={tab.id} onClick={() => setRegionFilter(tab.id)} style={{ border: 'none', padding: '0.45rem 0.85rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', backgroundColor: regionFilter === tab.id ? '#0f172a' : '#f1f5f9', color: regionFilter === tab.id ? 'white' : '#475569', transition: 'all 0.15s ease' }}>
              {tab.label}
            </button>
          ))}
        </div>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Filter by city, state, or agency..." style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '280px' }} />
      </div>

      {/* Directory Grid Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
        {filteredContacts.map((node) => (
          <div key={node.id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: node.type === 'EMERGENCY' ? '4px solid #ef4444' : '4px solid #3b82f6', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: node.type === 'EMERGENCY' ? '#ef4444' : '#2563eb' }}>
                  {node.type}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '0.25rem', fontWeight: '600' }}>
                  📍 {node.zone}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.4rem 0', color: '#0f172a', lineHeight: '1.3' }}>
                {node.agency}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 1rem 0', lineHeight: '1.4', fontStyle: 'italic' }}>
                🎯 Operational Scope: {node.scope}
              </p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                📞 <strong>Hotline:</strong> <a href={`tel:${node.contact}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700' }}>{node.contact}</a>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                ✉️ <strong>Official:</strong> {node.email}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Directory Footer Note */}
      <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', lineHeight: '1.4' }}>
        ⚠️ <strong>Notice:</strong> These contacts are meant for institutional escalation pipelines. To log localized everyday service civic complaints, please proceed to file a formal record via the <strong>Report Issue</strong> control terminal.
      </div>

    </div>
  );
}

// ==========================================
// 4. CITIZEN EXCLUSIVE REPORT (REAL LOCATION AUTOCOMPLETE)
// ==========================================
function ReportIssuePage({ onAdd }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  
  // Mapping and Suggestions State Variables
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [beforeImageBase64, setBeforeImageBase64] = useState('');
  const [loading, setLoading] = useState(false);

  // REAL LIVE OPENSTREETMAP NOMINATIM AUTOCOMPLETE FETCH CONTROLLER
  const handleLocationTyping = async (text) => {
    setLocationQuery(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      // Free network geocoding fetch call to Nominatim open-source maps API
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Geocoding connection issue: ", err);
    }
  };

  const selectSuggestion = (place) => {
    setSelectedLocation(place);
    setLocationQuery(place.display_name); // Set full verified string address map description
    setSuggestions([]); // Clear layout dropdown list
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBeforeImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

    try {
      setLoading(true);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json", responseSchema: analysisSchema },
      });

      const prompt = `Analyze: "${description}" at location: "${locationQuery}". Return full context schema analysis logs.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const data = JSON.parse(response.text());

      const newIncident = {
        id: String(Date.now()),
        title: data.category || 'Civic Issue',
        category: data.category || 'Infrastructure Maintenance',
        severity: data.severity || 'Medium',
        impactScore: data.impactScore || 50,
        status: 'Reported',
        location: locationQuery,
        mapUrl: selectedLocation ? `https://www.openstreetmap.org/?mlat=${selectedLocation.lat}&mlon=${selectedLocation.lon}#map=15/${selectedLocation.lat}/${selectedLocation.lon}` : null,
        summary: data.summary || description,
        beforeImage: beforeImageBase64 || '',
        afterImage: '',
        votesYes: 0,
        votesNo: 0,
        votedUserIds: [],
        affectedGroups: data.affectedGroups || [],
        essentialServices: data.essentialServices || [],
        futureRisks: data.futureRisks || [],
        recommendedActions: data.recommendedActions || []
      };

      onAdd(newIncident);
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setLoading(false);
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '1rem auto', backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
      <div style={{ borderBottom: '2px solid #2563eb', pb: '0.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>📢 Citizen Incident Reporting Desk</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Describe the Situation</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide concrete structural or safety hazard indicators..." style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', height: '80px', boxSizing: 'border-box', fontSize: '0.9rem' }} required />
        </div>

        {/* REAL-TIME MAP INTELLIGENT SEARCH INPUT LAYER */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Problem Location (Connected to Live Maps)</label>
          <input type="text" value={locationQuery} onChange={(e) => handleLocationTyping(e.target.value)} placeholder="Type address (e.g., Agra, Taj Nagri...)" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '0.9rem' }} required />
          
          {/* Autocomplete Suggestions Dropdown Panel Overlay */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '0.375rem', zIndex: 10, marginTop: '0.25rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              {suggestions.map((place, idx) => (
                <div key={idx} onClick={() => selectSuggestion(place)} style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem', borderBottom: idx !== suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
                  📍 {place.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.4rem' }}>Upload Proof Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.85rem' }} />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', padding: '0.75rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
          {loading ? "Streaming to Context Framework..." : "File Official Report"}
        </button>
      </form>
    </div>
  );
}
// ==========================================
// 5. DASHBOARD OPERATIONS FEED
// ==========================================

import { useEffect, useRef } from 'react';

function DashboardPage({ list, userRole }) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const chartRef = useRef(null);

  // 1. Calculate Metrics Dashboard States
  const totalReports = list.length;
  const pendingResolve = list.filter(i => i.status === 'Reported' || i.status === 'In Progress').length;
  const pendingVerification = list.filter(i => i.status === 'Resolution Verification Pending').length;
  const resolved = list.filter(i => i.status === 'Verified Resolved').length;

  // 2. Apply Filtering Logic
  const filteredList = list.filter(item => {
    const matchesFilter = 
      activeFilter === 'ALL' ||
      (activeFilter === 'PENDING' && (item.status === 'Reported' || item.status === 'In Progress')) ||
      (activeFilter === 'VERIFICATION' && item.status === 'Resolution Verification Pending') ||
      (activeFilter === 'RESOLVED' && item.status === 'Verified Resolved');
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
                          
    return matchesFilter && matchesSearch;
  });

  // 3. Dynamic Visual Insights Generation (Bar Chart using native Canvas)
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear previous renders
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dynamic data extraction
    const categories = [...new Set(list.map(i => i.category || 'General'))];
    const counts = categories.map(cat => list.filter(i => i.category === cat).length);
    const maxCount = Math.max(...counts, 1);

    // Layout configuration
    const padding = 40;
    const chartHeight = canvas.height - padding * 2;
    const chartWidth = canvas.width - padding * 2;
    const barWidth = Math.min(50, chartWidth / (categories.length || 1) - 20);

    // Draw Background Grid Lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvas.width - padding, y);
      ctx.stroke();
    }

    // Draw Bars
    categories.forEach((cat, index) => {
      const count = counts[index];
      const barHeight = (count / maxCount) * (chartHeight - 20);
      const x = padding + (index * (chartWidth / categories.length)) + 10;
      const y = canvas.height - padding - barHeight;

      // Draw modern rounded bars
      ctx.fillStyle = userRole === 'AUTHORITY' ? '#4f46e5' : '#2563eb';
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Bar Data Value Labels
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(count, x + barWidth / 2, y - 8);

      // Category X-Axis Labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      const shortLabel = cat.length > 12 ? cat.substring(0, 10) + '..' : cat;
      ctx.fillText(shortLabel, x + barWidth / 2, canvas.height - padding + 18);
    });
  }, [list, userRole]);

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER NODES */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.25rem 0' }}>📈 Kritagya Operations Analytics</h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Real-time systemic processing metrics and verification tracking logs.</p>
      </div>

      {/* METRICS BANNER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', uppercase: 'true' }}>TOTAL REPORTS</span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '0.25rem' }}>{totalReports}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#b45309' }}>PENDING ACTION</span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#b45309', marginTop: '0.25rem' }}>{pendingResolve}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1d4ed8' }}>CONSENSUS AUDIT PENDING</span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#1d4ed8', marginTop: '0.25rem' }}>{pendingVerification}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#047857' }}>PERMANENTLY CLOSED</span>
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#047857', marginTop: '0.25rem' }}>{resolved}</div>
        </div>
      </div>

      {/* GRAPH SPLIT MATRIX PANEL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', margin: '0 0 1rem 0' }}>📊 Vector Distribution by Infrastructure Category</h3>
          <canvas ref={chartRef} width="480" height="220" style={{ width: '100%', height: '220px' }} />
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', margin: '0 0 0.5rem 0' }}>🧠 Intelligent Prioritization Matrix</h3>
          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
            Kritagya AI calculates live community burden allocations. Reports located within critical utility junctions or those displaying automated escalation scores greater than <strong style={{color: '#df2c2c'}}>70 Impact Points</strong> are systematically flagged to the top of city engineering feeds.
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'VERIFICATION', 'RESOLVED'].map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} style={{ border: 'none', padding: '0.4rem 0.8rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', backgroundColor: activeFilter === filter ? (userRole === 'AUTHORITY' ? '#4f46e5' : '#2563eb') : '#f1f5f9', color: activeFilter === filter ? 'white' : '#475569' }}>
              {filter}
            </button>
          ))}
        </div>
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 Search records by area or context..." style={{ padding: '0.45rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.85rem', width: '260px' }} />
      </div>

      {/* INCIDENTS MATRIX GRID CONTAINER */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 1rem 0', color: '#0f172a' }}>📄 System Records Log ({filteredList.length})</h3>
        {filteredList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
            No incident records match the selected operational filters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {filteredList.map((incident) => {
              const badge = getSeverityStyles(incident.severity);
              return (
                <div key={incident.id} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: '600' }}>{incident.category}</span>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: '700', backgroundColor: badge.bg, color: badge.text }}>{incident.status}</span>
                    </div>
                    {incident.beforeImage && <img src={incident.beforeImage} alt="Problem Area" style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '0.375rem', marginBottom: '0.75rem' }} />}
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#0f172a' }}>{incident.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>{incident.summary}</p>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>📍 <strong>Area:</strong> {incident.location}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: '700', color: '#2563eb' }}>📊 Critical Score Index: {incident.impactScore}/100</div>
                  </div>

                  <Link to={`/incident/${incident.id}`} style={{ display: 'block', textAlign: 'center', backgroundColor: userRole === 'AUTHORITY' ? '#f0fdf4' : '#f8fafc', color: userRole === 'AUTHORITY' ? '#166534' : '#334155', padding: '0.55rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '700', fontSize: '0.8rem', marginTop: '1.25rem', border: '1px solid #e2e8f0' }}>
                    {userRole === 'AUTHORITY' ? "⚙️ Open Administration Node" : "Inspect Resolution Status →"}
                  </Link>
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
function IncidentDetailPage({ list, onStateUpdate, userRole, userId }) {
  const { id } = useParams();
  const rawItem = list.find(x => x.id === id) || list[0];
  
  const item = {
    description: rawItem?.summary || "No description provided.",
    futureConsequences: rawItem?.futureRisks && rawItem.futureRisks.length > 0 
      ? rawItem.futureRisks.join(', ') 
      : "Localized system deterioration and escalating safety hazards for area residents.",
    ...rawItem
  };

  const [resolutionText, setResolutionText] = useState('');
  const [afterImageBase64, setAfterImageBase64] = useState(''); 
  const [verifying, setVerifying] = useState(false);

  const userHasVoted = item.votedUserIds?.includes(userId) || false;

  const handleAfterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAfterImageBase64(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAuthoritySubmit = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setTimeout(() => {
      onStateUpdate(item.id, { status: "Resolution Verification Pending", afterImage: afterImageBase64 || '' });
      alert(`📢 Claim Recorded: Moving file instance to neighborhood consensus blocks.`);
      setVerifying(false);
      setResolutionText('');
    }, 800);
  };

  const registerVote = (voteType) => {
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
    if (nextYes >= 3) updatedStatus = "Verified Resolved";
    else if (nextNo >= 3) updatedStatus = "Reported";

    onStateUpdate(item.id, { votesYes: nextYes, votesNo: nextNo, votedUserIds: updatedVoters, status: updatedStatus });
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>RECORD WORKSPACE #{item.id}</span>
          <span style={{ fontSize: '0.75rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.6rem', borderRadius: '0.25rem', fontWeight: '700' }}>{item.status}</span>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>{item.title}</h2>
        <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>📍 <strong>Area:</strong> {item.location}</p>
        {item.mapUrl && (
          <a href={item.mapUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>
            🗺️ View exact location coordinates on Live OpenStreetMap vector network
          </a>
        )}
      </div>

      {(item.beforeImage || item.afterImage) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {item.beforeImage && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontSize: '0.85rem', fontWeight: '700' }}>📸 CITIZEN FILE IMAGE (BEFORE)</h4>
              <img src={item.beforeImage} alt="Before context" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.375rem' }} />
            </div>
          )}
          {item.afterImage && (
            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#16a34a', fontSize: '0.85rem', fontWeight: '700' }}>✅ MUNICIPAL PROOF IMAGE (AFTER)</h4>
              <img src={item.afterImage} alt="After context" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.375rem' }} />
            </div>
          )}
        </div>
      )}

      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ color: '#1e293b', fontSize: '1.1rem', marginTop: 0, fontWeight: '700' }}>Context Assessment</h3>
        <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', margin: 0 }}>{item.summary}</p>
      </div>

      {/* ROLE-BASED INTELLIGENCE CARDS SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {userRole === 'CITIZEN' && (
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '2px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>📑 OFFICIAL CITIZEN REPORT</span>
              <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: '#0f172a' }}>File Instance Summary</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0 }}>
              <strong>Reported Issue:</strong> {item.description}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>COMMUNITY IMPACT</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '900', color: '#2563eb' }}>{item.impactScore}</span>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff1f2', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ffe4e6' }}>
              <strong style={{ fontSize: '0.85rem', color: '#be123c', display: 'block', marginBottom: '0.25rem' }}>⚠️ Projected Risk Forecast (If Unresolved)</strong>
              <p style={{ fontSize: '0.85rem', color: '#9f1239', margin: 0 }}>{item.futureConsequences}</p>
            </div>
          </div>
        )}

        {userRole === 'AUTHORITY' && (
          <div style={{ backgroundColor: '#fafafa', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#4f46e5', backgroundColor: '#f5f3ff', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>⚡ EMERGENCY ACTION BRIEFING</span>
              <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: '#0f172a' }}>AI Operations Dashboard Data</h3>
            </div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: '#4f46e5', display: 'block', marginBottom: '0.35rem' }}>🛠️ Immediate Remediation Protocol</strong>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: '#334155', margin: 0 }}>
                {item.recommendedActions?.map((act, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{act}</li>)}
              </ul>
            </div>
            <div style={{ backgroundColor: '#fff1f2', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ffe4e6' }}>
              <strong style={{ fontSize: '0.85rem', color: '#be123c', display: 'block', marginBottom: '0.25rem' }}>🚨 Liability & Secondary Escalation Risks</strong>
              <p style={{ fontSize: '0.85rem', color: '#9f1239', margin: 0 }}>{item.futureConsequences}</p>
            </div>
          </div>
        )}
      </div>

      {/* AUTHORITY CONTROL ACTIONS BLOCK */}
      {userRole === 'AUTHORITY' && (item.status === "Reported" || item.status === "In Progress") && (
        <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
          <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.75rem 0', color: '#166534' }}>🏢 Administration Clearance Panel</h3>
          <form onSubmit={handleAuthoritySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea value={resolutionText} disabled={verifying} onChange={(e) => setResolutionText(e.target.value)} placeholder="Log materials, contractor ids, or specific parameters cleared..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #86efac', borderRadius: '0.375rem', height: '60px' }} required />
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.25rem' }}>Upload After Condition Photo</label>
              <input type="file" accept="image/*" disabled={verifying} onChange={handleAfterFileChange} />
            </div>
            <button type="submit" disabled={verifying} style={{ backgroundColor: verifying ? '#66bb6a' : '#16a34a', color: 'white', fontWeight: 'bold', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: verifying ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}>
              {verifying ? "Broadcasting..." : "Broadcast Work Logs"}
            </button>
          </form>
        </div>
      )}

      {/* CITIZEN PORTAL REACTION BLOCK */}
      {userRole === 'CITIZEN' && item.status === "Resolution Verification Pending" && (
        <div style={{ backgroundColor: '#fff7ed', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #ffedd5' }}>
          <h3 style={{ fontSize: '1.1rem', marginTop: 0, color: '#c2410c' }}>👥 Hyperlocal Consensus Audit</h3>
          {userHasVoted ? (
            <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #fed7aa', fontSize: '0.85rem', color: '#9a3412', fontWeight: '600', textAlign: 'center' }}>🔒 Verification vote logged.</div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => registerVote('YES')} style={{ backgroundColor: '#166534', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '700', cursor: 'pointer' }}>👍 Verify Repair</button>
              <button onClick={() => registerVote('NO')} style={{ backgroundColor: '#991b1b', color: 'white', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.375rem', fontWeight: '700', cursor: 'pointer' }}>👎 Reject Resolution</button>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', marginTop: '1rem', color: '#7c2d12', fontWeight: '600' }}>
            <div>Confirmations: {item.votesYes} / 3</div>
            <div>Rejections: {item.votesNo} / 3</div>
          </div>
        </div>
      )}

      {item.status === "Verified Resolved" && (
        <div style={{ backgroundColor: '#dcfce7', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #bbf7d0', textAlign: 'center', color: '#166534', fontWeight: 'bold' }}>
          🎯 Report Lifecycle Permanently Closed & Verified.
        </div>
      )}

    </div>
  );
}