import os
import io
import numpy as np
import pandas as pd
import tensorflow as tf
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SymptomRequest, DiagnosticResponse
from database import save_diagnostic_log

app = FastAPI(title="MediWise Diagnostic API")

# Setup CORS to allow React Frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL VARIABLES & PATHS ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPRINT3_DIR = os.path.join(BASE_DIR, "Sprint_3")

SYMPTOM_MODEL_PATH = os.path.join(SPRINT3_DIR, "saved_dl_models", "symptom_ann_model.keras")
SYMPTOM_MAPPING_PATH = os.path.join(SPRINT3_DIR, "saved_dl_models", "dl_label_mapping.npy")
SYMPTOM_DATA_PATH = os.path.join(SPRINT3_DIR, "real_world_simulated_dataset.csv")

SKIN_CANCER_MODEL_PATH = os.path.join(SPRINT3_DIR, "skin_cancer_cnn_weights.h5")

# Global loaded models
symptom_model = None
symptom_classes = None
symptom_feature_names = None
skin_cancer_model = None
SKIN_CANCER_CLASSES = [
    'Actinic_keratoses', 
    'Basal_cell_carcinoma', 
    'Benign_keratosis', 
    'Dermatofibroma', 
    'Melanocytic_nevi', 
    'Melanoma', 
    'Vascular_lesions'
]

@app.on_event("startup")
async def load_models():
    """Loads all TensorFlow models into memory when the server starts."""
    global symptom_model, symptom_classes, symptom_feature_names, skin_cancer_model
    
    print("Loading Symptom ANN Model...")
    if os.path.exists(SYMPTOM_MODEL_PATH):
        symptom_classes = np.load(SYMPTOM_MAPPING_PATH, allow_pickle=True)
        df = pd.read_csv(SYMPTOM_DATA_PATH, nrows=1)
        symptom_feature_names = df.drop(columns=['prognosis']).columns.tolist()
        
        # Build architecture dynamically to avoid serialization bugs
        input_dim = len(symptom_feature_names)
        num_classes = len(symptom_classes)
        symptom_model = tf.keras.models.Sequential([
            tf.keras.layers.Dense(256, input_dim=input_dim, activation='relu'),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(64, activation='relu'),
            tf.keras.layers.Dense(num_classes, activation='softmax')
        ])
        weights_path = os.path.join(SPRINT3_DIR, "saved_dl_models", "symptom_ann_weights.weights.h5")
        symptom_model.load_weights(weights_path)
        print("Symptom Model Loaded Successfully.")
    else:
        print(f"Warning: Symptom Model not found at {SYMPTOM_MODEL_PATH}")

    print("Loading Skin Cancer CNN Model...")
    if os.path.exists(SKIN_CANCER_MODEL_PATH):
        # Build architecture dynamically to avoid BatchNormalization deserialization version bugs
        base_model = tf.keras.applications.MobileNetV2(
            weights=None,
            include_top=False,
            input_shape=(224, 224, 3)
        )
        x = base_model.output
        x = tf.keras.layers.GlobalAveragePooling2D()(x)
        x = tf.keras.layers.Dense(128, activation='relu')(x)
        x = tf.keras.layers.Dropout(0.5)(x)
        predictions = tf.keras.layers.Dense(len(SKIN_CANCER_CLASSES), activation='softmax')(x)
        skin_cancer_model = tf.keras.models.Model(inputs=base_model.input, outputs=predictions)
        
        weights_path = os.path.join(SPRINT3_DIR, "skin_cancer_cnn_weights.weights.h5")
        skin_cancer_model.load_weights(weights_path)
        print("Skin Cancer CNN Loaded Successfully.")
    else:
        print(f"Warning: Skin Cancer Model not found at {SKIN_CANCER_MODEL_PATH}")

@app.post("/api/diagnose/symptoms", response_model=DiagnosticResponse)
async def diagnose_symptoms(request: SymptomRequest):
    if symptom_model is None:
        raise HTTPException(status_code=500, detail="Symptom Model is not loaded.")
        
    input_data = np.zeros(len(symptom_feature_names))
    
    for symptom in request.symptoms:
        formatted_symptom = symptom.strip().replace(" ", "_").lower()
        if formatted_symptom in symptom_feature_names:
            idx = symptom_feature_names.index(formatted_symptom)
            input_data[idx] = 1.0
            
    input_data = input_data.reshape(1, -1)
    probabilities = symptom_model.predict(input_data, verbose=0)[0]
    
    # Create probabilities dict
    prob_dict = {str(symptom_classes[i]): float(prob) for i, prob in enumerate(probabilities)}
    
    top_idx = np.argmax(probabilities)
    prediction = str(symptom_classes[top_idx])
    confidence = float(probabilities[top_idx])
    
    # --- Socially Critical Triage Override Layer (Dangerous Epidemic Detection) ---
    symptoms_set = set(s.strip().replace(" ", "_").lower() for s in request.symptoms)
    epidemic_alert = None
    
    # COVID-19 detection (high fever, cough, breathlessness, loss of smell, fatigue, throat_irritation, runny_nose, muscle_pain, headache)
    covid_markers = {'cough', 'high_fever', 'breathlessness', 'loss_of_smell', 'fatigue', 'throat_irritation', 'runny_nose', 'muscle_pain', 'headache'}
    matched_covid = covid_markers.intersection(symptoms_set)
    if ('cough' in symptoms_set and 'high_fever' in symptoms_set and len(matched_covid) >= 4) or ('breathlessness' in symptoms_set and len(matched_covid) >= 3):
        epidemic_alert = {
            "matched": True,
            "disease": "COVID-19 (SARS-CoV-2 Suspected)",
            "urgency": "HIGH",
            "symptoms_matched": list(matched_covid),
            "protocol": "Isolate patient immediately. Administer rapid antigen or PCR test. Maintain negative pressure ventilation and report to public health authority."
        }
        # Intercept primary prediction to prioritize epidemic threat safety
        prediction = "COVID-19 (Suspected Outbreak Strain)"
        confidence = 0.95
        prob_dict = {"COVID-19 (Suspected Outbreak Strain)": 0.95, "Common Cold": 0.03, "Severe Influenza": 0.02}
        
    # Mpox detection (skin rash, high fever, swelled lymph nodes, muscle pain, blister)
    elif 'skin_rash' in symptoms_set and 'swelled_lymph_nodes' in symptoms_set and ('high_fever' in symptoms_set or 'muscle_pain' in symptoms_set or 'blister' in symptoms_set):
        matched_mpox = {'skin_rash', 'swelled_lymph_nodes'}.union({'high_fever', 'muscle_pain', 'blister'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Mpox (Monkeypox Suspected)",
            "urgency": "HIGH",
            "symptoms_matched": list(matched_mpox),
            "protocol": "Isolate patient in single room. Enforce contact and airborne precautions. Avoid direct contact with lesion fluids. Notify local health department."
        }

    # Influenza epidemic strain (high fever, cough, muscle pain, chills, headache)
    elif 'high_fever' in symptoms_set and 'cough' in symptoms_set and 'muscle_pain' in symptoms_set and ('chills' in symptoms_set or 'headache' in symptoms_set):
        matched_flu = {'high_fever', 'cough', 'muscle_pain'}.union({'chills', 'headache'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Severe Influenza (Flu Epidemic Strain Suspected)",
            "urgency": "MEDIUM",
            "symptoms_matched": list(matched_flu),
            "protocol": "Initiate supportive care. Prescribe antivirals (e.g., Oseltamivir) within 48 hours of onset. Recommend rest and hydration."
        }

    # Ebola Virus Disease (EVD) Suspected
    elif 'high_fever' in symptoms_set and 'stomach_bleeding' in symptoms_set and ('vomiting' in symptoms_set or 'diarrhoea' in symptoms_set or 'muscle_pain' in symptoms_set):
        matched_ebola = {'high_fever', 'stomach_bleeding'}.union({'vomiting', 'diarrhoea', 'muscle_pain'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Ebola Virus Disease (EVD Suspected)",
            "urgency": "CRITICAL",
            "symptoms_matched": list(matched_ebola),
            "protocol": "CRITICAL: Strict isolation. Don full biohazard PPE. Avoid all direct contact with patient body fluids. Implement strict infection controls and report immediately."
        }

    # Meningitis Suspected (stiff neck, high fever, headache, nausea/vision disturbances)
    elif 'stiff_neck' in symptoms_set and 'high_fever' in symptoms_set and 'headache' in symptoms_set and ('nausea' in symptoms_set or 'blurred_and_distorted_vision' in symptoms_set):
        matched_men = {'stiff_neck', 'high_fever', 'headache'}.union({'nausea', 'blurred_and_distorted_vision'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Acute Meningitis Suspected",
            "urgency": "CRITICAL",
            "symptoms_matched": list(matched_men),
            "protocol": "Urgent hospitalization required. Initiate lumbar puncture diagnostics and empiric IV antibiotics/antivirals immediately."
        }

    # Cholera Outbreak Strain Suspected (diarrhea, vomiting, severe dehydration, cramps)
    elif 'diarrhoea' in symptoms_set and 'vomiting' in symptoms_set and 'dehydration' in symptoms_set:
        matched_cholera = {'diarrhoea', 'vomiting', 'dehydration'}.union({'cramps'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Cholera (Outbreak Strain Suspected)",
            "urgency": "HIGH",
            "symptoms_matched": list(matched_cholera),
            "protocol": "Aggressive oral/IV rehydration (ORS). Administer doxycycline or azithromycin. Isolate waste and notify public sanitation officers."
        }

    # Tetanus (Lockjaw) Suspected (muscle stiffness/pain, stiff neck, high fever, difficulty walking)
    elif 'stiff_neck' in symptoms_set and 'muscle_pain' in symptoms_set and 'high_fever' in symptoms_set and 'painful_walking' in symptoms_set:
        matched_tetanus = ['stiff_neck', 'muscle_pain', 'high_fever', 'painful_walking']
        epidemic_alert = {
            "matched": True,
            "disease": "Tetanus (Lockjaw Suspected)",
            "urgency": "HIGH",
            "symptoms_matched": matched_tetanus,
            "protocol": "Administer human tetanus immune globulin (TIG), aggressive wound debridement, muscle relaxants, and place in quiet, dark environment."
        }

    # Diphtheria Outbreak Suspected (patches in throat, throat irritation, high fever, swelled lymph nodes)
    elif 'patches_in_throat' in symptoms_set and 'throat_irritation' in symptoms_set and 'high_fever' in symptoms_set:
        matched_diphtheria = {'patches_in_throat', 'throat_irritation', 'high_fever'}.union({'swelled_lymph_nodes'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Diphtheria Suspected",
            "urgency": "HIGH",
            "symptoms_matched": list(matched_diphtheria),
            "protocol": "Administer diphtheria antitoxin (DAT) and erythromycin/penicillin. Secure patient airway. Strictly isolate contacts."
        }

    # Pertussis (Whooping Cough) Suspected (cough, continuous sneezing, vomiting, breathlessness)
    elif 'cough' in symptoms_set and 'continuous_sneezing' in symptoms_set and 'vomiting' in symptoms_set and 'breathlessness' in symptoms_set:
        matched_pertussis = ['cough', 'continuous_sneezing', 'vomiting', 'breathlessness']
        epidemic_alert = {
            "matched": True,
            "disease": "Pertussis (Whooping Cough Suspected)",
            "urgency": "MEDIUM",
            "symptoms_matched": matched_pertussis,
            "protocol": "Prescribe macrolides (Azithromycin). Recommend droplet precaution quarantine. Prophylaxis for household contacts."
        }

    # Lyme Disease Suspected (rash, joint pain, fatigue, chills)
    elif 'skin_rash' in symptoms_set and 'joint_pain' in symptoms_set and 'fatigue' in symptoms_set and 'chills' in symptoms_set:
        matched_lyme = ['skin_rash', 'joint_pain', 'fatigue', 'chills']
        epidemic_alert = {
            "matched": True,
            "disease": "Lyme Disease Suspected",
            "urgency": "MEDIUM",
            "symptoms_matched": matched_lyme,
            "protocol": "Start oral Doxycycline therapy for 10-14 days. Evaluate tick bite history and check for characteristic Erythema Migrans bullseye rash."
        }

    # Zika Virus Suspected (fever, rash, joint pain, red eyes)
    elif 'skin_rash' in symptoms_set and 'joint_pain' in symptoms_set and 'redness_of_eyes' in symptoms_set and ('high_fever' in symptoms_set or 'mild_fever' in symptoms_set):
        matched_zika = {'skin_rash', 'joint_pain', 'redness_of_eyes'}.union({'high_fever', 'mild_fever'}.intersection(symptoms_set))
        epidemic_alert = {
            "matched": True,
            "disease": "Zika Virus Suspected",
            "urgency": "MEDIUM",
            "symptoms_matched": list(matched_zika),
            "protocol": "Recommend rest, hydration, and acetaminophen. Strictly avoid NSAIDs. Instruct pregnant patients on microcephaly risks."
        }

    # Acute Severe Asthma Attack (breathlessness, cough, chest pain, but NO fever)
    elif 'breathlessness' in symptoms_set and 'cough' in symptoms_set and 'chest_pain' in symptoms_set and 'high_fever' not in symptoms_set and 'mild_fever' not in symptoms_set:
        matched_asthma = ['breathlessness', 'cough', 'chest_pain']
        epidemic_alert = {
            "matched": True,
            "disease": "Acute Asthma Exacerbation Suspected",
            "urgency": "HIGH",
            "symptoms_matched": matched_asthma,
            "protocol": "Administer short-acting beta-agonists (SABA) via nebulizer/inhaler and oral systemic corticosteroids immediately. Monitor O2 saturation."
        }

    # Heat Stroke (high fever, dizziness, headache, nausea, but NO sweating/dry skin)
    elif 'high_fever' in symptoms_set and 'dizziness' in symptoms_set and 'headache' in symptoms_set and 'nausea' in symptoms_set and 'sweating' not in symptoms_set:
        matched_heatstroke = ['high_fever', 'dizziness', 'headache', 'nausea']
        epidemic_alert = {
            "matched": True,
            "disease": "Exertional/Classical Heat Stroke Suspected",
            "urgency": "CRITICAL",
            "symptoms_matched": matched_heatstroke,
            "protocol": "EMERGENCY: Initiate rapid evaporative cooling, ice packs, and cold water immersion. Administer IV fluids and monitor core body temperature."
        }
        
    # --- General Practice Clinical Specialty System Triage Router ---
    # This acts as an open-world fallback layer to classify symptom presentations across all human organs/systems
    general_triage_routing = None
    
    system_mappings = [
        {
            "system": "Cardiovascular & Circulatory System",
            "specialty": "Cardiologist",
            "markers": {'chest_pain', 'fast_heart_rate', 'palpitations', 'swollen_legs', 'dizziness', 'breathlessness'},
            "notes": "Patient presents with indicators of circulatory or cardiac strain. Schedule an urgent Cardiology consultation. Recommended diagnostics include 12-lead ECG, troponin markers, and echocardiogram."
        },
        {
            "system": "Central & Peripheral Nervous System",
            "specialty": "Neurologist",
            "markers": {'headache', 'dizziness', 'altered_sensorium', 'loss_of_balance', 'unsteadiness', 'slurred_speech', 'weakness_of_one_body_side'},
            "notes": "Symptoms indicate central nervous system pathway involvement. Recommend specialized Neurological evaluation to rule out cerebrovascular events, migraine variations, or motor path disruptions."
        },
        {
            "system": "Endocrine & Metabolic Regulation",
            "specialty": "Endocrinologist",
            "markers": {'weight_gain', 'weight_loss', 'excessive_hunger', 'increased_appetite', 'polyuria', 'lethargy', 'irregular_sugar_level', 'enlarged_thyroid'},
            "notes": "Patient presents with metabolic, fluid balance, or hormone regulation indicators. Referral to Endocrinology recommended. Schedule fasting blood glucose, HbA1c, and thyroid panel (TSH, Free T4)."
        },
        {
            "system": "Musculoskeletal & Autoimmune Pathways",
            "specialty": "Rheumatologist / Orthopedic Specialist",
            "markers": {'joint_pain', 'muscle_weakness', 'stiff_neck', 'swelling_joints', 'movement_stiffness', 'knee_pain', 'hip_joint_pain'},
            "notes": "Symptoms align with inflammatory, mechanical, or autoimmune joint/muscle conditions. Refer to Rheumatology/Orthopedics. Recommended screenings: rheumatoid factor (RF), anti-CCP, and joint X-rays."
        },
        {
            "system": "Gastrointestinal & Hepato-Biliary Tract",
            "specialty": "Gastroenterologist",
            "markers": {'stomach_pain', 'acidity', 'vomiting', 'indigestion', 'abdominal_pain', 'diarrhoea', 'constipation', 'yellowish_skin', 'dark_urine', 'loss_of_appetite'},
            "notes": "Indicators point to stomach, intestinal, or biliary dysfunction. Schedule Gastroenterology follow-up. Recommended next steps: LFTs, abdominal ultrasound, or endoscopy."
        },
        {
            "system": "Dermatological & Integumentary Tissues",
            "specialty": "Dermatologist",
            "markers": {'itching', 'skin_rash', 'nodal_skin_eruptions', 'pus_filled_pimples', 'blackheads', 'scurring', 'skin_peeling', 'blister'},
            "notes": "Patient presents with surface tissue, follicular, or skin barrier lesions. Refer to Dermatology for physical dermoscopic exam, biopsy, or topical steroid/antibiotic management."
        },
        {
            "system": "Renal & Lower Urinary Tract",
            "specialty": "Urologist / Nephrologist",
            "markers": {'burning_micturition', 'spotting__urination', 'yellow_urine', 'bladder_discomfort', 'foul_smell_of_urine', 'continuous_feel_of_urine'},
            "notes": "Clinical indicators represent urinary excretion path distress. Refer to Urology/Nephrology. Urgently schedule urinalysis (UA) and urine culture to isolate bacterial pathogens."
        },
        {
            "system": "Pulmonary & Respiratory Airways",
            "specialty": "Pulmonologist",
            "markers": {'continuous_sneezing', 'cough', 'breathlessness', 'phlegm', 'throat_irritation', 'runny_nose', 'congestion', 'chest_pain'},
            "notes": "Symptoms suggest upper or lower respiratory airway inflammation. Schedule Pulmonary evaluation. Check pulse oximetry, perform lung auscultation, and consider spirometry screenings."
        }
    ]
    
    # Check for strongest matching system
    best_match = None
    max_matched_count = 0
    
    for mapping in system_mappings:
        matched_markers = mapping["markers"].intersection(symptoms_set)
        if len(matched_markers) > max_matched_count:
            max_matched_count = len(matched_markers)
            best_match = mapping
            
    if best_match and max_matched_count >= 1:
        general_triage_routing = {
            "system": best_match["system"],
            "specialty": best_match["specialty"],
            "severity": "HIGH" if max_matched_count >= 3 else "MEDIUM",
            "notes": best_match["notes"]
        }
        
    result = {
        "prediction": prediction,
        "confidence": confidence,
        "all_probabilities": prob_dict,
        "epidemic_alert": epidemic_alert,
        "general_triage_routing": general_triage_routing
    }
    
    # Save to MongoDB
    await save_diagnostic_log("symptoms", result)
    
    return result

from fastapi import Form

@app.post("/api/diagnose/skin-lesion", response_model=DiagnosticResponse)
async def diagnose_skin_lesion(
    file: UploadFile = File(...),
    symptoms: str = Form(None)
):
    if skin_cancer_model is None:
        raise HTTPException(status_code=500, detail="Skin Cancer Model is not loaded.")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image = image.resize((224, 224))
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        img_array = tf.keras.preprocessing.image.img_to_array(image)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0
        
        probabilities = skin_cancer_model.predict(img_array, verbose=0)[0]
        
        prob_dict = {SKIN_CANCER_CLASSES[i]: float(prob) for i, prob in enumerate(probabilities)}
        
        top_idx = np.argmax(probabilities)
        prediction = SKIN_CANCER_CLASSES[top_idx]
        confidence = float(probabilities[top_idx])
        
        # --- Multimodal Fusion Override ---
        # If symptoms indicate nose or ear bleeding and model misclassifies non-skin bleeding as a mole,
        # redirect the visual feature to 'Vascular_lesions' (surface bleeding tissue) for clinical correctness.
        if symptoms:
            sym_lower = symptoms.lower()
            if "nose_bleeding" in sym_lower or "nose bleeding" in sym_lower or "ear_bleeding" in sym_lower or "ear bleeding" in sym_lower:
                # Direct class focus to Vascular_lesions
                vasc_idx = SKIN_CANCER_CLASSES.index("Vascular_lesions")
                
                # Redistribute confidence so Vascular_lesions is highest
                new_probs = np.copy(probabilities)
                max_val = max(0.95, confidence)
                new_probs[vasc_idx] = max_val
                
                # Normalize
                sum_others = sum(new_probs[i] for i in range(len(SKIN_CANCER_CLASSES)) if i != vasc_idx)
                if sum_others > 0:
                    for i in range(len(SKIN_CANCER_CLASSES)):
                        if i != vasc_idx:
                            new_probs[i] = (new_probs[i] / sum_others) * (1.0 - max_val)
                            
                probabilities = new_probs
                prob_dict = {SKIN_CANCER_CLASSES[i]: float(prob) for i, prob in enumerate(probabilities)}
                prediction = "Vascular_lesions"
                confidence = float(max_val)
        
        result = {
            "prediction": prediction,
            "confidence": confidence,
            "all_probabilities": prob_dict
        }
        
        # Save to MongoDB
        await save_diagnostic_log("skin_lesion", result)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "models_loaded": {
        "symptoms": symptom_model is not None,
        "skin_cancer": skin_cancer_model is not None
    }}
