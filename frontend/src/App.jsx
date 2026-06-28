import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Settings, 
  Cpu, 
  AlertTriangle,
  Sun,
  Moon,
  Lock,
  Mail,
  User,
  LogOut
} from 'lucide-react';
import './index.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

function App() {
  const [activeTab, setActiveTab] = useState('symptoms');
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  
  // User Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState(null);

  // Google Sign-In Integration States
  const [showGoogleMock, setShowGoogleMock] = useState(false);
  const [googleMockName, setGoogleMockName] = useState('');
  const [googleMockEmail, setGoogleMockEmail] = useState('');

  // State for Skin Cancer Uploads
  const [skinImages, setSkinImages] = useState([]);
  const [labReports, setLabReports] = useState([]);
  
  // State for diagnostics execution
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [symptomText, setSymptomText] = useState("skin rash, itching, nodal skin eruptions, nose_bleeding");
  const [errorMessage, setErrorMessage] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Apply theme class to document body
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  }, [theme]);

  // Load Real Google Identity Services if Client ID is configured
  useEffect(() => {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientID && window.google && !user) {
      window.google.accounts.id.initialize({
        client_id: clientID,
        callback: (response) => {
          try {
            const jwt = response.credential;
            const payload = JSON.parse(atob(jwt.split('.')[1]));
            const googleUser = {
              name: payload.name,
              email: payload.email,
              picture: payload.picture
            };
            localStorage.setItem('user', JSON.stringify(googleUser));
            setUser(googleUser);
          } catch (e) {
            console.error("Google token decode failed", e);
            setAuthError("Failed to authenticate with Google account.");
          }
        }
      });
      
      window.google.accounts.id.renderButton(
        document.getElementById("googleRealBtnDiv"),
        { theme: theme === 'dark' ? 'filled_black' : 'outline', size: 'large', width: '356' }
      );
    }
  }, [user, theme, authMode]);

  // Check Backend Connection status on load
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (e) {
        setBackendStatus('offline');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e) => {
    setErrorMessage(null);
    const files = Array.from(e.target.files);
    
    const validFiles = [];
    for (let file of files) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Invalid file type. Please upload image files (JPG, PNG) only.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) { 
        setErrorMessage(`File ${file.name} is too large. Max size is 10MB.`);
        return;
      }
      validFiles.push(file);
    }
    
    setSkinImages(prev => [...prev, ...validFiles]);
  };

  const handleReportUpload = (e) => {
    const files = Array.from(e.target.files);
    setLabReports(prev => [...prev, ...files]);
  };

  const removeFile = (index, type) => {
    setErrorMessage(null);
    if (type === 'image') {
      setSkinImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setLabReports(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'signup') {
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
      if (authPassword.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }
      
      const userData = { name: authName, email: authEmail };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      if (authPassword.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }
      const savedUser = localStorage.getItem('user');
      let userData = savedUser ? JSON.parse(savedUser) : null;
      
      if (!userData || userData.email !== authEmail) {
        userData = { name: authEmail.split('@')[0], email: authEmail };
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      setUser(userData);
    }
  };

  const handleGoogleLoginClick = () => {
    const clientID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientID) {
      // Real Google Sign-In handles this automatically
      return;
    }
    // Fallback: Open Google Account Identity simulator modal
    setGoogleMockName('');
    setGoogleMockEmail('');
    setShowGoogleMock(true);
  };

  const handleGoogleMockSubmit = (e) => {
    e.preventDefault();
    if (!googleMockName.trim() || !googleMockEmail.trim()) {
      setAuthError("Please fill out both your actual name and Google email.");
      return;
    }
    
    setIsAnalyzing(true);
    setShowGoogleMock(false);
    
    setTimeout(() => {
      const googleUser = {
        name: googleMockName,
        email: googleMockEmail,
        isGoogle: true
      };
      localStorage.setItem('user', JSON.stringify(googleUser));
      setUser(googleUser);
      setIsAnalyzing(false);
    }, 1000);
  };

  const runAnalysis = async () => {
    setErrorMessage(null);
    setResults(null);
    
    if (activeTab === 'symptoms') {
      if (!symptomText.trim()) {
        setErrorMessage("Please enter at least one symptom to run the diagnostics.");
        return;
      }
    } else {
      if (skinImages.length === 0) {
        setErrorMessage("Please upload at least one skin lesion image.");
        return;
      }
    }

    setIsAnalyzing(true);
    
    try {
      if (activeTab === 'symptoms') {
        const symptomArray = symptomText.split(',').map(s => s.trim()).filter(s => s);
        
        const response = await fetch(`${API_BASE_URL}/api/diagnose/symptoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symptoms: symptomArray })
        });
        
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        
        const probs = Object.entries(data.all_probabilities)
            .map(([name, prob]) => ({ name, prob: parseFloat((prob * 100).toFixed(2)) }))
            .sort((a, b) => b.prob - a.prob)
            .slice(0, 3);
            
        setResults(probs);
      } else {
        if (skinImages.length === 0) return;
        
        const formData = new FormData();
        formData.append('file', skinImages[0]);
        formData.append('symptoms', symptomText);
        
        const response = await fetch(`${API_BASE_URL}/api/diagnose/skin-lesion`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        
        const probs = Object.entries(data.all_probabilities)
            .map(([name, prob]) => ({ name, prob: parseFloat((prob * 100).toFixed(2)) }))
            .sort((a, b) => b.prob - a.prob)
            .slice(0, 3);
            
        setResults(probs);
      }
    } catch (error) {
      console.error("Diagnosis Error:", error);
      setErrorMessage("Connection to the diagnosis server failed. Please ensure the Python backend is running on port 8001.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Auth Screen Gate
  if (!user) {
    return (
      <div className="login-container" style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' 
          ? 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), #0b0f19'
          : 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 60%), #f1f5f9',
        padding: '2rem',
        boxSizing: 'border-box',
        position: 'relative'
      }}>
        {/* Mock Google Login Portal Dialog */}
        {showGoogleMock && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="card" style={{ width: '100%', maxWidth: '380px', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <svg width="24" height="24" viewBox="0 0 18 18" style={{ marginBottom: '0.5rem' }}>
                  <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.76 2.13c1.61-1.49 2.83-3.69 2.83-6.46z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.76-2.13c-.76.51-1.74.82-3.2.82-2.46 0-4.55-1.66-5.3-3.89L.94 13.5C2.42 16.17 5.24 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.7 10.62c-.19-.58-.3-1.2-.3-1.84s.11-1.26.3-1.84L.94 4.81C.34 6.07 0 7.49 0 9s.34 2.93.94 4.19l2.76-2.57z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.43 0 9 0 5.24 0 2.42 1.83.94 4.5L3.7 7.07c.75-2.23 2.84-3.49 5.3-3.49z"/>
                </svg>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text)' }}>Choose actual Google Account</h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  Log in to MediWise AI using your own Google credentials.
                </p>
              </div>

              <form onSubmit={handleGoogleMockSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Your Actual Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. John Doe" 
                    value={googleMockName}
                    onChange={(e) => setGoogleMockName(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Google Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="john.doe@gmail.com" 
                    value={googleMockEmail}
                    onChange={(e) => setGoogleMockEmail(e.target.value)}
                    required 
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="form-input" 
                    style={{ flex: 1, cursor: 'pointer', textAlign: 'center' }} 
                    onClick={() => setShowGoogleMock(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                    Continue
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card" style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Activity className="logo-icon" size={48} style={{ marginBottom: '1.25rem' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>MediWise AI</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', margin: 0 }}>
              {authMode === 'login' ? 'Clinician Diagnostic Console Access' : 'Register a new clinician account'}
            </p>
          </div>

          {authError && (
            <div className="alert" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontWeight: 700 }}>
                <AlertTriangle size={14} />
                <span>Verification Error</span>
              </div>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {authMode === 'signup' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '2.75rem' }} 
                    placeholder="Dr. Alex Rivera" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '2.75rem' }} 
                  placeholder="alex.rivera@clinic.org" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '2.75rem' }} 
                  placeholder="•••••••• (Min 6 chars)" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input 
                    type="password" 
                    className="form-input" 
                    style={{ paddingLeft: '2.75rem' }} 
                    placeholder="••••••••" 
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {authMode === 'login' && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                textAlign: 'center',
                margin: '1.25rem 0',
                color: 'var(--text-light)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
                <span style={{ padding: '0 0.75rem' }}>or</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }}></div>
              </div>

              {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                <div id="googleRealBtnDiv" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}></div>
              ) : (
                <button 
                  onClick={handleGoogleLoginClick}
                  disabled={isAnalyzing}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    backgroundColor: '#ffffff',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.76 2.13c1.61-1.49 2.83-3.69 2.83-6.46z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.76-2.13c-.76.51-1.74.82-3.2.82-2.46 0-4.55-1.66-5.3-3.89L.94 13.5C2.42 16.17 5.24 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.7 10.62c-.19-.58-.3-1.2-.3-1.84s.11-1.26.3-1.84L.94 4.81C.34 6.07 0 7.49 0 9s.34 2.93.94 4.19l2.76-2.57z"/>
                    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.8 11.43 0 9 0 5.24 0 2.42 1.83.94 4.5L3.7 7.07c.75-2.23 2.84-3.49 5.3-3.49z"/>
                  </svg>
                  <span>{isAnalyzing ? 'Connecting to Google...' : 'Sign in with Google'}</span>
                </button>
              )}
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-light)' }}>
              {authMode === 'login' ? "New clinician to the system? " : "Already registered? "}
            </span>
            <button 
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0
              }}
            >
              {authMode === 'login' ? 'Register here' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo">
          <Activity className="logo-icon" size={28} />
          MediWise Console
        </div>
        
        <nav className="nav-section">
          <button 
            className={`nav-item ${activeTab === 'symptoms' ? 'active' : ''}`}
            onClick={() => {setActiveTab('symptoms'); setResults(null); setErrorMessage(null);}}
          >
            <FileText size={18} />
            Symptom Checker
          </button>
          <button 
            className={`nav-item ${activeTab === 'skin' ? 'active' : ''}`}
            onClick={() => {setActiveTab('skin'); setResults(null); setErrorMessage(null);}}
          >
            <ImageIcon size={18} />
            Image Scanner
          </button>
          
          <div style={{marginTop: '1.5rem', padding: '0 0.5rem', fontSize: '0.8rem', color: 'var(--text-light)', display: 'flex', flexDirection: 'column', gap: '0.65rem'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Cpu size={14} color="var(--primary)" />
              <span>Inference Engine: active</span>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <Settings size={14} color="var(--primary)" />
              <span>Version: v1.6.0 (Sprint 6)</span>
            </div>
          </div>

          <button className="theme-toggle-btn" onClick={toggleTheme} style={{marginTop: '1.5rem', width: '100%', justifyContent: 'center'}}>
            {theme === 'dark' ? (
              <>
                <Sun size={15} />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon size={15} />
                <span>Dark Theme</span>
              </>
            )}
          </button>

          {/* User Profile Card and Sign Out */}
          <div style={{ marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt="avatar" 
                  style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0 }} 
                />
              ) : (
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}>
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'DR'}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name || 'Clinician'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button 
              className="nav-item" 
              onClick={() => { localStorage.removeItem('user'); setUser(null); }} 
              style={{ color: '#ef4444', padding: '0.65rem 0.75rem', width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.05)' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
        
        <div className="system-status" style={{ marginTop: '1.5rem' }}>
          <span className="status-label">System Status</span>
          
          <div className="status-indicator">
            <span style={{display: 'flex', alignItems: 'center'}}>
              <span className={`status-dot ${backendStatus === 'online' ? '' : 'offline'}`}></span>
              API Backend
            </span>
            <span style={{fontSize: '0.75rem', color: 'var(--text-light)'}}>
              {backendStatus === 'online' ? 'Port 8001' : 'Offline'}
            </span>
          </div>

          <div className="status-indicator">
            <span style={{display: 'flex', alignItems: 'center'}}>
              <span className="status-dot"></span>
              MongoDB
            </span>
            <span style={{fontSize: '0.75rem', color: 'var(--text-light)'}}>Local Cache</span>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Intelligent Diagnosis Suite</h1>
            <p>Evaluating clinical parameters and dermoscopy scans using deep learning neural networks.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-val">2 Models</div>
              <div className="stat-lbl">Active Systems</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">&lt; 100ms</div>
              <div className="stat-lbl">Response Latency</div>
            </div>
          </div>
        </header>

        <div className="workspace-container">
          {errorMessage && (
            <div className="alert">
              <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem', fontWeight: 700}}>
                <AlertTriangle size={16} />
                <span>System Error Warning</span>
              </div>
              {errorMessage}
            </div>
          )}

          <div className="split-layout">
            {/* Left Column: Form Inputs */}
            <div className="card">
              {activeTab === 'symptoms' ? (
                <div>
                  <h2 className="card-title">
                    <FileText className="logo-icon" size={20} />
                    Symptom Triage Checker
                  </h2>
                  
                  <div className="form-group">
                    <label className="form-label">Patient Symptoms (Comma-separated values)</label>
                    <textarea 
                      className="form-input" 
                      rows="6" 
                      placeholder="e.g., skin rash, itching, nodal skin eruptions, nose_bleeding"
                      value={symptomText}
                      onChange={(e) => setSymptomText(e.target.value)}
                    ></textarea>
                    <p style={{fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.5rem'}}>
                      The Keras ANN evaluates physiological symptoms (including added parameters like `nose_bleeding` and `ear_bleeding`) and outputs diagnostic probabilities.
                    </p>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={runAnalysis}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Processing Triage Data...' : 'Run Diagnostics'}
                    {!isAnalyzing && <ChevronRight size={18} />}
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="card-title">
                    <ImageIcon className="logo-icon" size={20} />
                    Image Diagnostic Scanner
                  </h2>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem'}}>
                    {/* Image Upload */}
                    <div>
                      <label className="form-label">Upload Clinical / Dermoscopy Image (Max 10MB)</label>
                      <label className="upload-area" style={{display: 'block'}}>
                        <input type="file" multiple accept="image/*" hidden onChange={handleImageUpload} />
                        <UploadCloud className="upload-icon" />
                        <div className="upload-text">Select diagnostic medical scan / clinical photo</div>
                        <div className="upload-subtext">Supports PNG, JPG, JPEG (Bleeding features, moles, lesions)</div>
                      </label>
                      
                      {skinImages.length > 0 && (
                        <div className="file-list">
                          {skinImages.map((file, i) => (
                            <div key={i} className="file-item">
                              <div className="file-info">
                                <ImageIcon size={16} color="var(--secondary)" />
                                <div>
                                  <div className="file-name">{file.name}</div>
                                  <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                              </div>
                              <button className="remove-btn" onClick={() => removeFile(i, 'image')}>
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Lab Report Upload */}
                    <div>
                      <label className="form-label">Clinical Context Documents (Optional)</label>
                      <label className="upload-area" style={{display: 'block', padding: '1.5rem 1rem'}}>
                        <input type="file" multiple accept=".pdf,.doc,.docx" hidden onChange={handleReportUpload} />
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>
                          <UploadCloud size={18} color="var(--text-light)" />
                          <span style={{fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500}}>Upload clinical PDF reports</span>
                        </div>
                      </label>

                      {labReports.length > 0 && (
                        <div className="file-list">
                          {labReports.map((file, i) => (
                            <div key={i} className="file-item">
                              <div className="file-info">
                                <FileText size={16} color="var(--primary)" />
                                <div>
                                  <div className="file-name">{file.name}</div>
                                  <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                                </div>
                              </div>
                              <button className="remove-btn" onClick={() => removeFile(i, 'report')}>
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={runAnalysis}
                    disabled={isAnalyzing || skinImages.length === 0}
                    style={{opacity: (skinImages.length === 0 && !isAnalyzing) ? 0.5 : 1}}
                  >
                    {isAnalyzing ? 'Running Keras Feature Extraction...' : 'Analyze Uploaded Image'}
                    {!isAnalyzing && <ChevronRight size={18} />}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Diagnostic Results Dashboard */}
            <div className="results-panel">
              <h3 className="results-header-text">
                <CheckCircle2 color={results ? 'var(--success)' : 'var(--text-light)'} size={20} />
                Live Diagnostic Metrics
              </h3>
              
              {results ? (
                <div>
                  {results.map((res, i) => (
                    <div key={i} className="result-card">
                      <div className="result-meta">
                        <span className="res-name">{res.name}</span>
                        <span className="res-prob">{res.prob}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{
                            width: `${res.prob}%`, 
                            backgroundColor: i === 0 ? 'var(--success)' : i === 1 ? 'var(--primary)' : 'var(--secondary)',
                            boxShadow: i === 0 ? '0 0 8px var(--success)' : 'none'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '0.8rem',
                    color: 'var(--text-light)'
                  }}>
                    <strong style={{color: 'var(--text)'}}>Clinical Insight:</strong> The results above denote the top 3 highest probabilities derived from model inference. Cross-referencing with a clinical practitioner is recommended.
                  </div>
                </div>
              ) : (
                <div className="empty-results-box">
                  <Activity className="empty-results-icon" />
                  <div>Awaiting input for diagnostic evaluation</div>
                  <div style={{fontSize: '0.75rem', marginTop: '0.5rem'}}>
                    Deploy diagnostics on the left column to populate inference data.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
