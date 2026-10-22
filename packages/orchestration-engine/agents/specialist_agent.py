import time
from typing import List, Tuple
from models import DiagnosisMatch, SpecialistRecommendation, AgentExecutionTrace

SPECIALTY_MAPPING = {
    "Acute Coronary": ("Cardiology & Interventional Cardiac Care", "Emergency Cardiac Care Unit / Cath Lab"),
    "Hypertensive": ("Cardiology / Internal Medicine", "Hypertension & Vascular Clinic"),
    "Asthma": ("Pulmonology & Respiratory Medicine", "Respiratory / Allergy Care Center"),
    "Pneumonia": ("Pulmonology & Infectious Disease", "Pulmonary Medicine & Acute Respiratory Unit"),
    "Diabetes": ("Endocrinology & Metabolic Disorders", "Diabetes Education & Endocrinology Clinic"),
    "Migraine": ("Neurology & Headache Center", "Neuro-specialty Ambulatory Care"),
    "GERD": ("Gastroenterology & Digestive Health", "Digestive Health Center"),
    "Gastroenteritis": ("Gastroenterology / Acute Internal Medicine", "Outpatient Ambulatory Clinic"),
    "Urinary": ("Urology / Nephrology", "Urological Care & Renal Diagnostic Center"),
    "Anxiety": ("Psychiatry & Behavioral Health", "Outpatient Behavioral Health Center")
}

class SpecialistAgent:
    """
    Analyzes differential diagnoses and triage level to recommend the optimal medical specialist,
    referral facility type, and triage-calibrated consultation urgency.
    """

    def __init__(self):
        self.name = "Specialist Referral Matching Agent"
        self.role = "Clinical Specialty Selection & Urgency Prioritization"

    def recommend(self, triage_level: int, diagnoses: List[DiagnosisMatch]) -> Tuple[SpecialistRecommendation, AgentExecutionTrace]:
        start_time = time.time()
        top_diagnosis = diagnoses[0] if diagnoses else None

        specialty = "Internal Medicine / General Practice"
        facility = "Primary Care Clinic & Diagnostic Center"

        if top_diagnosis:
            for key, (spec, fac) in SPECIALTY_MAPPING.items():
                if key.lower() in top_diagnosis.condition.lower():
                    specialty = spec
                    facility = fac
                    break

        if triage_level == 1:
            urgency = "Emergency (Immediate Resuscitation)"
            rationale = "Immediate life support and emergency medicine resuscitation team required."
        elif triage_level == 2:
            urgency = "Emergent (Within 1-2 Hours)"
            rationale = f"High clinical acuity for {top_diagnosis.condition if top_diagnosis else 'presentation'}; prompt specialist assessment required."
        elif triage_level == 3:
            urgency = "Urgent (Same-Day / Within 24 Hours)"
            rationale = f"Active symptoms warrant prompt evaluation by {specialty} to avoid clinical escalation."
        elif triage_level == 4:
            urgency = "Priority Consultation (Within 3-5 Days)"
            rationale = f"Stable presentation suitable for scheduled consultation with {specialty}."
        else:
            urgency = "Routine Outpatient (Scheduled)"
            rationale = f"Non-urgent symptom profile. Elective outpatient assessment with {specialty}."

        recommendation = SpecialistRecommendation(
            specialty=specialty,
            urgency=urgency,
            rationale=rationale,
            recommended_facility=facility
        )

        duration = round((time.time() - start_time) * 1000, 2)
        summary = f"Selected {specialty} with priority: {urgency}."
        trace = AgentExecutionTrace(
            agent_name=self.name,
            role=self.role,
            execution_time_ms=duration,
            status="SUCCESS",
            key_output_summary=summary
        )

        return recommendation, trace
