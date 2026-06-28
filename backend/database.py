from datetime import datetime

async def save_diagnostic_log(diagnosis_type: str, result: dict):
    """
    Mock save diagnostic log since MongoDB might not be installed locally.
    In production, this connects to MongoDB Atlas or local MongoDB.
    """
    log_entry = {
        "timestamp": datetime.utcnow(),
        "type": diagnosis_type,
        "prediction": result.get("prediction"),
        "confidence": result.get("confidence"),
        "full_results": result
    }
    
    print(f"Mock DB Save: {diagnosis_type} -> {result.get('prediction')} ({result.get('confidence')}%)")
    return log_entry
