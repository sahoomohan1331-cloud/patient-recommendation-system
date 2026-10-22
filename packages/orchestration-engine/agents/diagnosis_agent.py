import time
from typing import List, Tuple
from models import PatientProfile, DiagnosisMatch, AgentExecutionTrace

# Medical Knowledge Base
DISEASE_KNOWLEDGE_BASE = [
    {
        "condition": "Acute Coronary Syndrome (Suspected Angina / NSTEMI)",
        "icd10": "I20.9",
        "severity": "Critical",
        "description": "Ischemic chest discomfort characterized by pressure, tightness, or burning, potentially radiating to arm, neck, or jaw.",
        "symptoms": ["chest pain", "shortness of breath", "sweating", "radiating pain to left arm", "nausea", "dizziness", "chest pressure", "palpitations"],
        "history_risk": ["hypertension", "diabetes", "smoking", "hyperlipidemia", "family history of cad"],
        "specialty": "Cardiology",
        "weight": 1.4
    },
    {
        "condition": "Acute Asthma Exacerbation",
        "icd10": "J45.901",
        "severity": "High",
        "description": "Acute episode of worsening shortness of breath, wheezing, coughing, and chest tightness due to airway bronchospasm.",
        "symptoms": ["wheezing", "shortness of breath", "cough", "chest tightness", "difficulty breathing", "rapid breathing"],
        "history_risk": ["asthma", "allergies", "eczema", "copd"],
        "specialty": "Pulmonology",
        "weight": 1.2
    },
    {
        "condition": "Community-Acquired Pneumonia",
        "icd10": "J18.9",
        "severity": "Moderate-High",
        "description": "Infection of lung parenchyma manifesting with productive cough, fever, chills, and pleuritic discomfort.",
        "symptoms": ["fever", "cough", "productive cough", "chills", "shortness of breath", "fatigue", "pleuritic chest pain"],
        "history_risk": ["copd", "immunocompromised", "smoking", "diabetes"],
        "specialty": "Pulmonology",
        "weight": 1.2
    },
    {
        "condition": "Type 2 Diabetes with Hyperglycemia",
        "icd10": "E11.65",
        "severity": "Moderate",
        "description": "Metabolic dysregulation leading to elevated serum glucose, osmotic diuresis, and dehydration symptoms.",
        "symptoms": ["frequent urination", "excessive thirst", "increased hunger", "blurred vision", "fatigue", "dry mouth", "unexplained weight loss"],
        "history_risk": ["type 2 diabetes", "obesity", "sedentary lifestyle", "metabolic syndrome"],
        "specialty": "Endocrinology",
        "weight": 1.1
    },
    {
        "condition": "Hypertensive Urgency / Stage 2 Hypertension",
        "icd10": "I10 / I16.0",
        "severity": "High",
        "description": "Significantly elevated arterial pressure requiring prompt clinical evaluation to prevent end-organ damage.",
        "symptoms": ["headache", "dizziness", "blurred vision", "shortness of breath", "epistaxis (nosebleed)", "chest tightness"],
        "history_risk": ["hypertension", "renal disease", "high sodium diet"],
        "specialty": "Cardiology / Internal Medicine",
        "weight": 1.2
    },
    {
        "condition": "Migraine with Aura",
        "icd10": "G43.109",
        "severity": "Moderate",
        "description": "Neurovascular recurrent cephalalgia often unilateral, pulsating, accompanied by photophobia, phonophobia, or visual aura.",
        "symptoms": ["headache", "throbbing headache", "nausea", "photophobia", "sensitivity to light", "visual aura", "dizziness", "vomiting"],
        "history_risk": ["migraine history", "stress", "sleep deprivation"],
        "specialty": "Neurology",
        "weight": 1.0
    },
    {
        "condition": "Gastroesophageal Reflux Disease (GERD) with Esophagitis",
        "icd10": "K21.9",
        "severity": "Low-Moderate",
        "description": "Retrograde flow of gastric contents into esophagus producing retrosternal pyrosis and acid regurgitation.",
        "symptoms": ["heartburn", "acid reflux", "chest burning", "regurgitation", "difficulty swallowing", "chronic cough", "sour taste"],
        "history_risk": ["hiatal hernia", "obesity", "nsaid use"],
        "specialty": "Gastroenterology",
        "weight": 1.0
    },
    {
        "condition": "Acute Gastroenteritis",
        "icd10": "A09",
        "severity": "Moderate",
        "description": "Inflammation of gastrointestinal tract lining causing acute onset watery diarrhea, cramping, and emesis.",
        "symptoms": ["diarrhea", "nausea", "vomiting", "abdominal cramps", "fever", "dehydration", "weakness"],
        "history_risk": ["recent contaminated food", "travel history"],
        "specialty": "Internal Medicine / Gastroenterology",
        "weight": 1.0
    },
    {
        "condition": "Urinary Tract Infection (Cystitis / Pyelonephritis)",
        "icd10": "N39.0",
        "severity": "Moderate",
        "description": "Bacterial colonization of urinary epithelium resulting in dysuria, urinary frequency, and suprapubic pain.",
        "symptoms": ["painful urination", "urinary frequency", "urgency", "cloudy urine", "lower abdominal pain", "fever", "back pain"],
        "history_risk": ["recurrent uti", "diabetes", "catheterization"],
        "specialty": "Urology / Nephrology",
        "weight": 1.1
    },
    {
        "condition": "Generalized Anxiety Disorder with Panic Features",
        "icd10": "F41.0",
        "severity": "Low-Moderate",
        "description": "Acute sympathetic surge manifesting as palpitations, hyperventilation, tremor, and apprehension in absence of organic etiology.",
        "symptoms": ["palpitations", "racing heart", "trembling", "hyperventilation", "anxiety", "feeling of doom", "sweating", "dizziness"],
        "history_risk": ["anxiety history", "chronic stress", "caffeine excess"],
        "specialty": "Psychiatry / Clinical Psychology",
        "weight": 0.95
    }
]

class DiagnosisAgent:
    """
    Evaluates patient symptoms, duration, vitals, and medical history against
    a medical diagnostic ontology to calculate differential diagnoses with confidence scoring.
    """

    def __init__(self):
        self.name = "Differential Diagnostic Reasoner"
        self.role = "Clinical Pattern Matching & ICD-10 Attribution"

    def analyze(self, patient: PatientProfile) -> Tuple[List[DiagnosisMatch], AgentExecutionTrace]:
        start_time = time.time()
        patient_symptoms = [s.strip().lower() for s in patient.symptoms if s.strip()]
        if patient.chief_complaint:
            patient_symptoms.append(patient.chief_complaint.strip().lower())

        patient_history = [h.strip().lower() for h in patient.medical_history if h.strip()]

        scored_diagnoses = []

        for disease in DISEASE_KNOWLEDGE_BASE:
            matched_symptoms = []
            score = 0.0

            # Match symptoms
            for ds in disease["symptoms"]:
                for ps in patient_symptoms:
                    if ds in ps or ps in ds:
                        matched_symptoms.append(ds)
                        score += 1.0
                        break

            # Deduplicate matched symptoms
            matched_symptoms = list(set(matched_symptoms))

            if matched_symptoms:
                # History risk modifier
                history_matches = 0
                for hr in disease["history_risk"]:
                    for ph in patient_history:
                        if hr in ph or ph in hr:
                            history_matches += 1
                            score += 0.6
                            break

                # Vital sign modifiers
                if patient.vitals:
                    v = patient.vitals
                    if "Coronary" in disease["condition"] or "Hypertensive" in disease["condition"]:
                        if v.blood_pressure_sys and v.blood_pressure_sys >= 140:
                            score += 0.5
                        if v.heart_rate and v.heart_rate >= 100:
                            score += 0.4
                    if "Pneumonia" in disease["condition"] or "Asthma" in disease["condition"]:
                        if v.oxygen_saturation and v.oxygen_saturation < 95:
                            score += 0.8

                # Calculate confidence percentage
                total_disease_symptoms = len(disease["symptoms"])
                raw_confidence = (len(matched_symptoms) / max(total_disease_symptoms, 4)) * disease["weight"] * 100
                if history_matches > 0:
                    raw_confidence += 15.0

                confidence = min(96.5, max(18.0, round(raw_confidence, 1)))

                scored_diagnoses.append(DiagnosisMatch(
                    condition=disease["condition"],
                    icd10=disease["icd10"],
                    confidence=confidence,
                    description=disease["description"],
                    severity=disease["severity"],
                    matching_symptoms=matched_symptoms
                ))

        # Sort descending by confidence
        scored_diagnoses.sort(key=lambda d: d.confidence, reverse=True)
        top_diagnoses = scored_diagnoses[:4]

        # Fallback if no specific matches
        if not top_diagnoses:
            top_diagnoses.append(DiagnosisMatch(
                condition="Unspecified Clinical Symptom Presentation",
                icd10="R68.89",
                confidence=40.0,
                description="General physiological or systemic complaint requiring comprehensive clinical intake.",
                severity="Low",
                matching_symptoms=patient_symptoms[:2]
            ))

        duration = round((time.time() - start_time) * 1000, 2)
        summary = f"Identified {len(top_diagnoses)} differential diagnoses. Top candidate: {top_diagnoses[0].condition} ({top_diagnoses[0].confidence}% confidence)."
        trace = AgentExecutionTrace(
            agent_name=self.name,
            role=self.role,
            execution_time_ms=duration,
            status="SUCCESS",
            key_output_summary=summary
        )

        return top_diagnoses, trace
