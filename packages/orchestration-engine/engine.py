import sys
import os
from typing import Dict, Any

# Ensure proper package paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

INTEGRATION_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "integration-layer"))
if INTEGRATION_DIR not in sys.path:
    sys.path.insert(0, INTEGRATION_DIR)

MARKETPLACE_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "agent-marketplace"))
if MARKETPLACE_DIR not in sys.path:
    sys.path.insert(0, MARKETPLACE_DIR)

from models import PatientProfile, RecommendationResult
from agents.triage_agent import TriageAgent
from agents.diagnosis_agent import DiagnosisAgent
from agents.specialist_agent import SpecialistAgent
from agents.treatment_agent import TreatmentAgent
from agents.compliance_agent import ComplianceAgent
from fhir_converter import export_to_fhir_r4

class OrchestrationEngine:
    """
    Core Triage Medical Orchestration Engine.
    Executes multi-agent consensus pipeline:
    1. HIPAA/Compliance De-Identification
    2. Vital Signs & Triage Acuity Assessment (ESI)
    3. Differential Diagnostic Reasoning & ICD-10 attribution
    4. Specialist Referral & Priority Routing
    5. Evidence-based Clinical Protocol & Contraindication Guardrail
    6. HL7 FHIR R4 Bundle Synthesizer
    """

    def __init__(self):
        self.compliance_agent = ComplianceAgent()
        self.triage_agent = TriageAgent()
        self.diagnosis_agent = DiagnosisAgent()
        self.specialist_agent = SpecialistAgent()
        self.treatment_agent = TreatmentAgent()

    def process_patient(self, patient: PatientProfile) -> RecommendationResult:
        traces = []

        # 1. Compliance & PHI De-identification Guardrail
        compliance_meta, c_trace = self.compliance_agent.verify_and_sanitize(patient)
        traces.append(c_trace)

        # 2. Triage & Acuity Evaluation
        triage_lvl, triage_cat, vitals_alert, t_trace = self.triage_agent.evaluate(patient)
        traces.append(t_trace)

        # 3. Differential Diagnostic Reasoning
        diagnoses, d_trace = self.diagnosis_agent.analyze(patient)
        traces.append(d_trace)

        # 4. Specialist Referral Selection
        specialist, s_trace = self.specialist_agent.recommend(triage_lvl, diagnoses)
        traces.append(s_trace)

        # 5. Treatment Plan & Contraindications
        care_plan, p_trace = self.treatment_agent.formulate(patient, diagnoses, triage_lvl)
        traces.append(p_trace)

        # 6. HL7 FHIR R4 Interoperability Conversion
        fhir_bundle = export_to_fhir_r4(
            patient_id=patient.patient_id or "PT-UNKNOWN",
            age=patient.age,
            gender=patient.gender,
            diagnoses=diagnoses,
            specialist=specialist,
            triage_category=triage_cat
        )

        return RecommendationResult(
            patient_id=patient.patient_id or "PT-UNKNOWN",
            triage_level=triage_lvl,
            triage_category=triage_cat,
            vitals_alert=vitals_alert,
            differential_diagnoses=diagnoses,
            specialist=specialist,
            care_plan=care_plan,
            hipaa_compliance=compliance_meta,
            orchestration_traces=traces,
            fhir_bundle=fhir_bundle
        )
