from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class VitalSigns(BaseModel):
    heart_rate: Optional[int] = Field(None, description="Beats per minute (bpm)")
    blood_pressure_sys: Optional[int] = Field(None, description="Systolic blood pressure (mmHg)")
    blood_pressure_dia: Optional[int] = Field(None, description="Diastolic blood pressure (mmHg)")
    oxygen_saturation: Optional[float] = Field(None, description="SpO2 percentage (e.g. 98.0)")
    temperature: Optional[float] = Field(None, description="Temperature in Celsius or Fahrenheit")
    temperature_unit: str = Field("C", description="C or F")
    respiratory_rate: Optional[int] = Field(None, description="Breaths per minute")

class PatientProfile(BaseModel):
    patient_id: Optional[str] = "PT-88219"
    name: Optional[str] = "Anonymous Patient"
    age: int = Field(..., ge=0, le=120)
    gender: str = Field("Other", description="Male, Female, Non-binary, or Other")
    symptoms: List[str] = Field(default_factory=list, description="List of reported symptoms")
    symptom_duration_days: Optional[int] = 1
    medical_history: List[str] = Field(default_factory=list, description="Pre-existing conditions")
    allergies: List[str] = Field(default_factory=list, description="Known drug/food allergies")
    current_medications: List[str] = Field(default_factory=list, description="Active medications")
    vitals: Optional[VitalSigns] = None
    chief_complaint: Optional[str] = ""

class DiagnosisMatch(BaseModel):
    condition: str
    icd10: str
    confidence: float
    description: str
    severity: str
    matching_symptoms: List[str]

class SpecialistRecommendation(BaseModel):
    specialty: str
    urgency: str # "Emergency (Immediate)", "Urgent (Within 24h)", "Priority (2-3 days)", "Routine"
    rationale: str
    recommended_facility: str

class CarePlan(BaseModel):
    initial_actions: List[str]
    recommended_tests: List[str]
    non_pharmacological: List[str]
    medication_cautions: List[str]
    red_flag_warnings: List[str]

class AgentExecutionTrace(BaseModel):
    agent_name: str
    role: str
    execution_time_ms: float
    status: str
    key_output_summary: str

class RecommendationResult(BaseModel):
    patient_id: str
    triage_level: int # ESI 1 to 5
    triage_category: str # Resuscitation, Emergent, Urgent, Less Urgent, Non-Urgent
    vitals_alert: Optional[str] = None
    differential_diagnoses: List[DiagnosisMatch]
    specialist: SpecialistRecommendation
    care_plan: CarePlan
    hipaa_compliance: Dict[str, Any]
    orchestration_traces: List[AgentExecutionTrace]
    fhir_bundle: Dict[str, Any]
