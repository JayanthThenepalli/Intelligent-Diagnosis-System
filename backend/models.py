from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class SymptomRequest(BaseModel):
    symptoms: List[str]

class DiagnosticResponse(BaseModel):
    prediction: str
    confidence: float
    all_probabilities: dict
    epidemic_alert: Optional[Dict[str, Any]] = None
