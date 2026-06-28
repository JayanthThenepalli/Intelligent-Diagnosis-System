from pydantic import BaseModel
from typing import List

class SymptomRequest(BaseModel):
    symptoms: List[str]

class DiagnosticResponse(BaseModel):
    prediction: str
    confidence: float
    all_probabilities: dict
