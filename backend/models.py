from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SymptomRequest(BaseModel):
    symptoms: List[str]
    patient_name: Optional[str] = "Anonymous"
    age: Optional[int] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    height: Optional[float] = None

class DiagnosticResponse(BaseModel):
    prediction: str
    confidence: float
    all_probabilities: dict
    epidemic_alert: Optional[Dict[str, Any]] = None
    general_triage_routing: Optional[Dict[str, Any]] = None
