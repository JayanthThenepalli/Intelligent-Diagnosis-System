from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Connect to MongoDB Atlas (if MONGODB_URI is provided in environment variables)
MONGODB_URI = os.getenv("MONGODB_URI")
db_client = None
db = None

if MONGODB_URI:
    try:
        db_client = AsyncIOMotorClient(MONGODB_URI)
        db = db_client["mediwise_db"]
        print("Connected to MongoDB Cloud Database.")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")

async def save_diagnostic_log(diagnosis_type: str, result: dict, patient_metadata: dict = None):
    """
    Saves diagnostic logs to MongoDB Atlas if available, or prints local fallback.
    """
    log_entry = {
        "timestamp": datetime.utcnow(),
        "type": diagnosis_type,
        "prediction": result.get("prediction"),
        "confidence": result.get("confidence"),
        "full_results": result
    }
    if patient_metadata:
        log_entry["patient_details"] = patient_metadata
    
    if db is not None:
        try:
            collection = db["diagnostic_logs"]
            await collection.insert_one(log_entry)
            print(f"Database Save: Logged {diagnosis_type} result to MongoDB Atlas.")
        except Exception as e:
            print(f"Failed to save log to MongoDB: {e}")
    else:
        print(f"Mock DB Save (Local Fallback): {diagnosis_type} -> {result.get('prediction')} ({result.get('confidence')}%)")
        
    return log_entry

# Mock in-memory patient list fallback
mock_patients = [
    {
        "email": "uiufds@gmail.com",
        "patient_name": "PT-88105 (Sarah Smith)",
        "age": 29,
        "gender": "Female",
        "blood_group": "A-",
        "height": 164.0,
        "weight": 58.0,
        "allergies": "None",
        "medical_history": "Asthma"
    }
]

async def save_patient_profile(patient: dict):
    global mock_patients
    if db is not None:
        try:
            collection = db["patient_profiles"]
            email = patient.get("email")
            await collection.replace_one({"email": email}, patient, upsert=True)
            return True
        except Exception as e:
            print(f"Failed to save patient to MongoDB: {e}")
    
    # In-memory fallback
    email = patient.get("email")
    mock_patients = [p for p in mock_patients if p.get("email") != email]
    mock_patients.append(patient)
    return True

async def get_patient_profile(email: str):
    if db is not None:
        try:
            collection = db["patient_profiles"]
            profile = await collection.find_one({"email": email}, {"_id": 0})
            if profile:
                return profile
        except Exception as e:
            print(f"Failed to fetch patient profile: {e}")
    for p in mock_patients:
        if p.get("email") == email:
            return p
    return None
