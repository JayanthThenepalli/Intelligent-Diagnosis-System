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

const ALL_SYMPTOMS = [
  'itching', 'skin_rash', 'nodal_skin_eruptions', 'continuous_sneezing', 'shivering', 'chills', 'joint_pain', 
  'stomach_pain', 'acidity', 'ulcers_on_tongue', 'muscle_wasting', 'vomiting', 'burning_micturition', 
  'spotting__urination', 'fatigue', 'weight_gain', 'anxiety', 'cold_hands_and_feets', 'mood_swings', 
  'weight_loss', 'restlessness', 'lethargy', 'patches_in_throat', 'irregular_sugar_level', 'cough', 
  'high_fever', 'sunken_eyes', 'breathlessness', 'sweating', 'dehydration', 'indigestion', 'headache', 
  'yellowish_skin', 'dark_urine', 'nausea', 'loss_of_appetite', 'pain_behind_the_eyes', 'back_pain', 
  'constipation', 'abdominal_pain', 'diarrhoea', 'mild_fever', 'yellow_urine', 'yellowing_of_eyes', 
  'acute_liver_failure', 'fluid_overload', 'swelling_of_stomach', 'swelled_lymph_nodes', 'malaise', 
  'blurred_and_distorted_vision', 'phlegm', 'throat_irritation', 'redness_of_eyes', 'sinus_pressure', 
  'runny_nose', 'congestion', 'chest_pain', 'weakness_in_limbs', 'fast_heart_rate', 'pain_during_bowel_movements', 
  'pain_in_anal_region', 'bloody_stool', 'irritation_in_anus', 'neck_pain', 'dizziness', 'cramps', 
  'bruising', 'obesity', 'swollen_legs', 'swollen_blood_vessels', 'puffy_face_and_eyes', 'enlarged_thyroid', 
  'brittle_nails', 'swollen_extremeties', 'excessive_hunger', 'extra_marital_contacts', 'drying_and_tingling_lips', 
  'slurred_speech', 'knee_pain', 'hip_joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 
  'movement_stiffness', 'spinning_movements', 'loss_of_balance', 'unsteadiness', 'weakness_of_one_body_side', 
  'loss_of_smell', 'bladder_discomfort', 'foul_smell_of_urine', 'continuous_feel_of_urine', 'passage_of_gases', 
  'internal_itching', 'toxic_look_(typhos)', 'depression', 'irritability', 'muscle_pain', 'altered_sensorium', 
  'red_spots_over_body', 'belly_pain', 'abnormal_menstruation', 'dischromic__patches', 'watering_from_eyes', 
  'increased_appetite', 'polyuria', 'family_history', 'mucoid_sputum', 'rusty_sputum', 'lack_of_concentration', 
  'visual_disturbances', 'receiving_blood_transfusion', 'receiving_unsterile_injections', 'coma', 
  'stomach_bleeding', 'distention_of_abdomen', 'history_of_alcohol_consumption', 'fluid_overload', 
  'blood_in_sputum', 'prominent_veins_on_calf', 'palpitations', 'painful_walking', 'pus_filled_pimples', 
  'blackheads', 'scurring', 'skin_peeling', 'silver_like_dusting', 'small_dents_in_nails', 'inflammatory_nails', 
  'blister', 'red_sore_around_nose', 'yellow_crust_ooze', 'nose_bleeding', 'ear_bleeding'
];

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
  const [selectedSymptoms, setSelectedSymptoms] = useState(["skin_rash", "itching", "nodal_skin_eruptions", "nose_bleeding"]);
  const [symptomSearch, setSymptomSearch] = useState("");
  const [showSymptomDropdown, setShowSymptomDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [epidemicAlert, setEpidemicAlert] = useState(null);
  const [generalTriage, setGeneralTriage] = useState(null);
  
  // Patient Demographics Profile States
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [patientBloodGroup, setPatientBloodGroup] = useState("");
  const [patientHeight, setPatientHeight] = useState("");
  const [patientWeight, setPatientWeight] = useState("");
  const [patientAllergies, setPatientAllergies] = useState("");
  const [patientMedicalHistory, setPatientMedicalHistory] = useState("");
  const [savedPatientsList, setSavedPatientsList] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");

  const fetchSavedPatients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`);
      if (response.ok) {
        const data = await response.json();
        setSavedPatientsList(data.data || []);
      }
    } catch (e) {
      console.error("Failed to load patient profiles:", e);
    }
  };

  useEffect(() => {
    fetchSavedPatients();
  }, []);

  const saveProfileToDatabase = async () => {
    if (!patientName) {
      setErrorMessage("Patient Name / ID is required to create a profile.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName,
          age: patientAge ? parseInt(patientAge) : 0,
          gender: patientGender || "Other",
          blood_group: patientBloodGroup || "O+",
          height: patientHeight ? parseFloat(patientHeight) : 0.0,
          weight: patientWeight ? parseFloat(patientWeight) : null,
          allergies: patientAllergies || "",
          medical_history: patientMedicalHistory || ""
        })
      });
      if (response.ok) {
        await fetchSavedPatients();
        const newPatient = {
          patient_name: patientName,
          age: patientAge,
          gender: patientGender,
          blood_group: patientBloodGroup,
          height: patientHeight,
          weight: patientWeight,
          allergies: patientAllergies,
          medical_history: patientMedicalHistory
        };
        setActivePatient(newPatient);
        setPatientName("");
        setPatientAge("");
        setPatientGender("");
        setPatientBloodGroup("");
        setPatientHeight("");
        setPatientWeight("");
        setPatientAllergies("");
        setPatientMedicalHistory("");
        alert("Patient profile saved successfully!");
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to write patient profile to remote database.");
    }
  };

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
    setEpidemicAlert(null);
    setGeneralTriage(null);
    
    if (activeTab === 'symptoms') {
      if (selectedSymptoms.length === 0) {
        setErrorMessage("Please select at least one symptom to run the diagnostics.");
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
        const response = await fetch(`${API_BASE_URL}/api/diagnose/symptoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            symptoms: selectedSymptoms,
            patient_name: activePatient ? activePatient.patient_name : "Anonymous",
            age: activePatient && activePatient.age ? parseInt(activePatient.age) : null,
            gender: activePatient ? activePatient.gender : null,
            blood_group: activePatient ? activePatient.blood_group : null,
            height: activePatient && activePatient.height ? parseFloat(activePatient.height) : null
          })
        });
        
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        
        const probs = Object.entries(data.all_probabilities)
            .map(([name, prob]) => ({ name, prob: parseFloat((prob * 100).toFixed(2)) }))
            .sort((a, b) => b.prob - a.prob)
            .slice(0, 3);
            
        setResults(probs);
        setEpidemicAlert(data.epidemic_alert);
        setGeneralTriage(data.general_triage_routing);
      } else {
        if (skinImages.length === 0) return;
        
        const formData = new FormData();
        formData.append('file', skinImages[0]);
        formData.append('symptoms', selectedSymptoms.join(', '));
        formData.append('patient_name', activePatient ? activePatient.patient_name : "Anonymous");
        if (activePatient && activePatient.age) formData.append('age', activePatient.age);
        if (activePatient && activePatient.gender) formData.append('gender', activePatient.gender);
        if (activePatient && activePatient.blood_group) formData.append('blood_group', activePatient.blood_group);
        if (activePatient && activePatient.height) formData.append('height', activePatient.height);
        
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
        setEpidemicAlert(null);
        setGeneralTriage(null);
      }
    } catch (error) {
      console.error("Diagnosis Error:", error);
      setErrorMessage("Connection to the diagnosis server failed. Please ensure the Python backend is running on port 8001.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRecommendedSpecialist = (disease) => {
    const lower = disease.toLowerCase();
    if (lower.includes('dengue') || lower.includes('malaria') || lower.includes('typhoid')) return 'Infectious Disease Specialist';
    if (lower.includes('hypertension') || lower.includes('heart') || lower.includes('varicose')) return 'Cardiologist / Vascular Specialist';
    if (lower.includes('fungal') || lower.includes('skin') || lower.includes('acne') || lower.includes('psoriasis') || lower.includes('impestigo') || lower.includes('scabies') || lower.includes('lesion') || lower.includes('melanoma') || lower.includes('carcinoma') || lower.includes('actonic') || lower.includes('keratosis') || lower.includes('nevi')) return 'Dermatologist';
    if (lower.includes('gerd') || lower.includes('peptic') || lower.includes('gastro') || lower.includes('hepatitis') || lower.includes('jaundice')) return 'Gastroenterologist';
    if (lower.includes('migraine') || lower.includes('paralysis') || lower.includes('cervical') || lower.includes('brain')) return 'Neurologist';
    if (lower.includes('diabetes') || lower.includes('thyroid')) return 'Endocrinologist';
    if (lower.includes('bronchial') || lower.includes('pneumonia') || lower.includes('tuberculosis') || lower.includes('cold')) return 'Pulmonologist';
    if (lower.includes('arthritis') || lower.includes('osteoarthristis')) return 'Rheumatologist / Orthopedic';
    if (lower.includes('urinary') || lower.includes('renal')) return 'Urologist / Nephrologist';
    return 'General Physician';
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
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {setActiveTab('profile'); setResults(null); setErrorMessage(null);}}
          >
            <User size={18} />
            Patient Profile
          </button>

          {activePatient && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              boxSizing: 'border-box'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Patient
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activePatient.patient_name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                {activePatient.age} yrs • {activePatient.gender} • {activePatient.blood_group}
              </div>
            </div>
          )}

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
        

      </aside>

      {/* Main Dashboard Workspace */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Intelligent Diagnosis Suite</h1>
            <p>Evaluating clinical parameters and dermoscopy scans.</p>
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
              {activeTab === 'profile' && (
                <div>
                  <h2 className="card-title">
                    <User className="logo-icon" size={20} color="var(--primary)" />
                    Patient Profile Registry
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Patient Name / ID</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. PT-88102 (John Doe)"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Age (Years)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="e.g. 45"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Gender</label>
                        <select 
                          className="form-input" 
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          style={{ appearance: 'auto', backgroundColor: 'var(--input-bg)' }}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Blood Group</label>
                        <select 
                          className="form-input" 
                          value={patientBloodGroup}
                          onChange={(e) => setPatientBloodGroup(e.target.value)}
                          style={{ appearance: 'auto', backgroundColor: 'var(--input-bg)' }}
                        >
                          <option value="">Select Blood</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Height (cm)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="e.g. 175"
                          value={patientHeight}
                          onChange={(e) => setPatientHeight(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                        <label className="form-label">Weight (kg)</label>
                        <input 
                          type="number" 
                          className="form-input" 
                          placeholder="e.g. 70"
                          value={patientWeight}
                          onChange={(e) => setPatientWeight(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Allergies</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Penicillin, Peanuts"
                        value={patientAllergies}
                        onChange={(e) => setPatientAllergies(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Medical History Notes</label>
                      <textarea 
                        className="form-input" 
                        placeholder="e.g. Type-2 Diabetes, Asthma exacerbation history"
                        value={patientMedicalHistory}
                        onChange={(e) => setPatientMedicalHistory(e.target.value)}
                        style={{ height: '80px', resize: 'none', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    onClick={saveProfileToDatabase}
                    style={{ width: '100%' }}
                  >
                    <span>Save Patient Profile</span>
                    <CheckCircle2 size={18} />
                  </button>
                </div>
              )}

              {activeTab === 'symptoms' && (
                <div>
                  <h2 className="card-title">
                    <FileText className="logo-icon" size={20} />
                    Symptom Triage Checker
                  </h2>
                  
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Select Patient Symptoms</label>
                    
                    {/* Selected Tags container */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      backgroundColor: 'var(--input-bg)',
                      minHeight: '48px',
                      boxSizing: 'border-box',
                      cursor: 'text'
                    }} onClick={() => document.getElementById('symptom-search-input').focus()}>
                      {selectedSymptoms.map((sym, idx) => (
                        <span key={idx} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}>
                          {sym.replace(/_/g, ' ')}
                          <button 
                            type="button" 
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(255,255,255,0.8)',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSymptoms(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      
                      <input 
                        id="symptom-search-input"
                        type="text"
                        placeholder={selectedSymptoms.length === 0 ? "Search and select symptoms..." : "Add symptom..."}
                        value={symptomSearch}
                        onChange={(e) => {
                          setSymptomSearch(e.target.value);
                          setShowSymptomDropdown(true);
                        }}
                        onFocus={() => setShowSymptomDropdown(true)}
                        style={{
                          border: 'none',
                          outline: 'none',
                          background: 'transparent',
                          color: 'var(--text)',
                          fontSize: '0.85rem',
                          flex: 1,
                          minWidth: '120px'
                        }}
                      />
                    </div>

                    {/* Dropdown list */}
                    {showSymptomDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        marginTop: '0.35rem',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        zIndex: 50,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        {ALL_SYMPTOMS.filter(sym => 
                          sym.replace(/_/g, ' ').toLowerCase().includes(symptomSearch.toLowerCase()) &&
                          !selectedSymptoms.includes(sym)
                        ).length > 0 ? (
                          ALL_SYMPTOMS.filter(sym => 
                            sym.replace(/_/g, ' ').toLowerCase().includes(symptomSearch.toLowerCase()) &&
                            !selectedSymptoms.includes(sym)
                          ).map((sym, idx) => (
                            <div 
                              key={idx}
                              onClick={() => {
                                setSelectedSymptoms(prev => [...prev, sym]);
                                setSymptomSearch("");
                                setShowSymptomDropdown(false);
                              }}
                              style={{
                                padding: '0.65rem 0.85rem',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                color: 'var(--text)',
                                borderBottom: '1px solid var(--border)',
                                transition: 'background-color 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {sym.replace(/_/g, ' ')}
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '0.85rem', fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center' }}>
                            No symptoms match search query
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Click outside to close dropdown */}
                    {showSymptomDropdown && (
                      <div 
                        onClick={() => setShowSymptomDropdown(false)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 40
                        }}
                      />
                    )}
                    
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
            <div className="results-panel" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'profile' ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className="results-header-text" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                    <User size={20} color="var(--primary)" />
                    Patient Registry & Integrations
                  </h3>
                  
                  {/* Active Patient Details */}
                  {activePatient ? (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1.5px solid var(--success)',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Linked Diagnosis Profile
                        </span>
                        <button 
                          onClick={() => setActivePatient(null)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                        >
                          Unlink
                        </button>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
                        {activePatient.patient_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
                        <strong>Age:</strong> {activePatient.age} yrs &nbsp;|&nbsp; <strong>Gender:</strong> {activePatient.gender} &nbsp;|&nbsp; <strong>Blood Group:</strong> {activePatient.blood_group}<br />
                        <strong>Height:</strong> {activePatient.height} cm &nbsp;|&nbsp; <strong>Weight:</strong> {activePatient.weight ? `${activePatient.weight} kg` : 'N/A'}<br />
                        <strong>Allergies:</strong> {activePatient.allergies || "None declared"}<br />
                        <strong>Medical History:</strong> {activePatient.medical_history || "No historical notes"}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px dashed var(--border)',
                      marginBottom: '1.25rem',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      color: 'var(--text-light)',
                      boxSizing: 'border-box'
                    }}>
                      No active patient linked. Select a patient card below to run diagnostics.
                    </div>
                  )}

                  {/* Patient Search & Directory list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="🔍 Search patient directory..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    />

                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.25rem' }}>
                      {savedPatientsList
                        .filter(p => p.patient_name.toLowerCase().includes(patientSearchQuery.toLowerCase()))
                        .map((pat, idx) => (
                          <div 
                            key={idx}
                            style={{
                              padding: '0.85rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid var(--border)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {pat.patient_name}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                                {pat.age} yrs • {pat.gender} • {pat.blood_group}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button 
                                onClick={() => {
                                  setPatientName(pat.patient_name);
                                  setPatientAge(pat.age);
                                  setPatientGender(pat.gender);
                                  setPatientBloodGroup(pat.blood_group);
                                  setPatientHeight(pat.height);
                                  setPatientWeight(pat.weight || "");
                                  setPatientAllergies(pat.allergies || "");
                                  setPatientMedicalHistory(pat.medical_history || "");
                                }}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--text)',
                                  cursor: 'pointer'
                                }}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => {
                                  setActivePatient(pat);
                                  alert(`Loaded ${pat.patient_name} as active diagnostics profile!`);
                                }}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  borderRadius: '6px',
                                  backgroundColor: 'var(--primary)',
                                  border: 'none',
                                  color: '#fff',
                                  cursor: 'pointer'
                                }}
                              >
                                Link
                              </button>
                            </div>
                          </div>
                      ))}
                      {savedPatientsList.filter(p => p.patient_name.toLowerCase().includes(patientSearchQuery.toLowerCase())).length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', padding: '1rem' }}>
                          No patient profiles match query
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Future Purposes Integration Options */}
                  <div style={{
                    marginTop: 'auto',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      🔌 FUTURE EHR INTEGRATION GATEWAYS
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button 
                        onClick={() => alert("HL7 FHIR Integration: Connecting to EHR server gateway... Metadata sync initialized.")}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          color: 'var(--text)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Cpu size={12} color="var(--secondary)" />
                        Sync FHIR EHR
                      </button>
                      <button 
                        onClick={() => alert("IoT Telemetry Integration: Scanning for BLE Smart Wearable diagnostic feeds... Bluetooth paired.")}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          color: 'var(--text)',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Activity size={12} color="var(--success)" />
                        Pair IoT Wearables
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="results-header-text" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                    <CheckCircle2 color={results ? 'var(--success)' : 'var(--text-light)'} size={20} />
                    Live Diagnostic Metrics
                  </h3>

              {/* Epidemic Alert Notification Banner */}
              {epidemicAlert && epidemicAlert.matched && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1.5px solid #ef4444',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  boxSizing: 'border-box'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    <AlertTriangle size={18} />
                    High-Priority Epidemic Alert
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                    {epidemicAlert.disease}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                    <strong>Protocol:</strong> {epidemicAlert.protocol}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginRight: '0.25rem' }}>Matching symptoms:</span>
                    {epidemicAlert.symptoms_matched.map((s, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', backgroundColor: '#ef4444', color: '#fff', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                        {s.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {isAnalyzing ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', color: 'var(--text-light)' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--primary)',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>Analyzing Diagnostic Parameters...</div>
                  <div style={{ fontSize: '0.75rem', textAlign: 'center', maxWidth: '240px' }}>Extracting features and executing Keras neural network weights.</div>
                  
                  {/* CSS inline trick for spin animation */}
                  <style>{`
                    @keyframes spin {
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : results ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Top Result - Radial Dial */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <svg style={{ transform: 'rotate(-90deg)', width: '130px', height: '130px' }}>
                        <circle cx="65" cy="65" r="54" fill="transparent" stroke="var(--border)" strokeWidth="8" />
                        <circle cx="65" cy="65" r="54" fill="transparent" stroke="var(--success)" strokeWidth="8"
                          strokeDasharray="339.29"
                          strokeDashoffset={339.29 - (339.29 * results[0].prob) / 100}
                          strokeLinecap="round"
                          style={{
                            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.1, 0.8, 0.25, 1)',
                            filter: 'drop-shadow(0 0 6px var(--success))'
                          }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
                        {results[0].prob}%
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-light)', marginBottom: '0.25rem' }}>Primary Diagnosis</div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>{results[0].name}</h2>
                  </div>

                  {/* Differential Probabilities */}
                  {results.slice(1).map((res, i) => (
                    <div key={i} className="result-card" style={{ marginBottom: '1rem' }}>
                      <div className="result-meta" style={{ marginBottom: '0.5rem' }}>
                        <span className="res-name" style={{ fontSize: '0.85rem' }}>{res.name}</span>
                        <span className="res-prob" style={{ fontSize: '0.85rem', color: i === 0 ? 'var(--primary)' : 'var(--secondary)' }}>{res.prob}%</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{
                            width: `${res.prob}%`, 
                            backgroundColor: i === 0 ? 'var(--primary)' : 'var(--secondary)',
                            boxShadow: 'none'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}

                  {/* Specialist Referral Route */}
                  <div style={{
                    marginTop: 'auto',
                    padding: '1.15rem',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(14, 165, 233, 0.05) 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--success)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
                      Recommended Referral Routing
                    </div>
                    {generalTriage ? (
                      <>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                          System Match: <span style={{ color: 'var(--secondary)' }}>{generalTriage.system}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', margin: '0.15rem 0' }}>
                          Refer to: <span style={{ color: 'var(--primary)' }}>{generalTriage.specialty}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
                          {generalTriage.notes}
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>
                          Schedule consultation: <span style={{ color: 'var(--secondary)' }}>{getRecommendedSpecialist(results[0].name)}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
                          Based on deep learning probability mappings, the patient referral route is directed to this clinical specialty.
                        </div>
                      </>
                    )}
                  </div>

                  {/* Action Print Button */}
                  <button 
                    onClick={handlePrint}
                    style={{
                      marginTop: '1.25rem',
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border)',
                      padding: '0.85rem',
                      borderRadius: '10px',
                      color: 'var(--text)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <FileText size={15} color="var(--primary)" />
                    Export Referrals Diagnostic Report (PDF)
                  </button>
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', boxSizing: 'border-box' }}>
                  {/* ECG Heartbeat Wave SVG */}
                  <svg viewBox="0 0 300 100" style={{ width: '100%', maxWidth: '240px', height: 'auto', marginBottom: '1.75rem', overflow: 'visible' }}>
                    <path 
                      d="M0,50 L80,50 L90,30 L100,70 L110,50 L140,50 L150,15 L160,85 L170,50 L190,50 L200,42 L210,58 L220,50 L300,50" 
                      fill="none" 
                      stroke="var(--primary)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="1000"
                      strokeDashoffset="1000"
                      style={{
                        animation: 'ecg-dash 3.5s linear infinite'
                      }}
                    />
                  </svg>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text)', fontSize: '1rem', fontWeight: 700 }}>Diagnostic Monitor Offline</h3>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-light)', textAlign: 'center', maxWidth: '260px', lineHeight: '1.5' }}>
                    Awaiting clinical input to execute diagnostics. Enter triage parameters or upload scan images to begin evaluation.
                  </p>
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
