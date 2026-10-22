import pytest
import os
import sys

# Add orchestration engine path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE_DIR = os.path.join(ROOT_DIR, "packages", "orchestration-engine")
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from models import PatientProfile, VitalSigns
from engine import OrchestrationEngine

@pytest.fixture
def engine():
    return OrchestrationEngine()

def test_cardiac_case_triage_and_specialist(engine):
    patient = PatientProfile(
        patient_id="TEST-001",
        name="John Doe",
        age=60,
        gender="Male",
        chief_complaint="Crushing chest pain radiating to left arm",
        symptoms=["chest pain", "shortness of breath", "sweating"],
        vitals=VitalSigns(heart_rate=110, blood_pressure_sys=170, blood_pressure_dia=100, oxygen_saturation=92.5)
    )
    result = engine.process_patient(patient)
    
    assert result.triage_level in [1, 2]
    assert "Cardiology" in result.specialist.specialty
    assert len(result.differential_diagnoses) > 0
    assert result.differential_diagnoses[0].icd10 == "I20.9"
    assert result.fhir_bundle["resourceType"] == "Bundle"

def test_asthma_case_and_safeguards(engine):
    patient = PatientProfile(
        patient_id="TEST-002",
        name="Jane Smith",
        age=28,
        gender="Female",
        chief_complaint="Severe expiratory wheezing",
        symptoms=["wheezing", "cough", "shortness of breath"],
        allergies=["Aspirin"],
        vitals=VitalSigns(heart_rate=105, oxygen_saturation=91.0)
    )
    result = engine.process_patient(patient)
    
    assert "Pulmonology" in result.specialist.specialty
    assert any("Aspirin" in c or "NSAID" in c for c in result.care_plan.medication_cautions)
    assert result.hipaa_compliance["hipaa_safe_harbor_applied"] is True

def test_phi_sanitization(engine):
    patient = PatientProfile(
        patient_id="TEST-003",
        name="Marcus Aurelius",
        age=45,
        gender="Male",
        chief_complaint="Contact me at 555-123-4567 or ssn 000-12-3456",
        symptoms=["headache"]
    )
    result = engine.process_patient(patient)
    
    assert result.hipaa_compliance["masked_patient_identity"].startswith("M. A***")
    assert result.hipaa_compliance["phi_tokens_scrubbed"] >= 2
