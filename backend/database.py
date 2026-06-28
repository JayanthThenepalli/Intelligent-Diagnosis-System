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

async def save_diagnostic_log(diagnosis_type: str, result: dict):
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
