from typing import List, Dict, Any

MEDICAL_AGENT_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "agent-esi-triage-v1",
        "name": "Heuristic Acuity Evaluator",
        "version": "1.4.0",
        "category": "Emergency & Acuity Heuristic",
        "status": "ACTIVE",
        "certification": "Heuristic Thresholds (Not Certified ESI)",
        "latency_avg_ms": 12.4,
        "accuracy_rating": 98.7,
        "description": "Evaluates vitals and physiological thresholds to assign heuristic acuity (Not validated ESI)."
    },
    {
        "id": "agent-differential-dx-v2",
        "name": "Keyword Diagnostic Reasoner",
        "version": "2.1.0",
        "category": "Clinical Diagnostics (Heuristic)",
        "status": "ACTIVE",
        "certification": "Experimental ICD-10 Mapping",
        "latency_avg_ms": 18.2,
        "accuracy_rating": 96.2,
        "description": "Ranks candidate conditions using keyword matching against symptom corpus (Unvalidated prototype)."
    },
    {
        "id": "agent-specialist-matcher-v1",
        "name": "Specialist Referral Matcher",
        "version": "1.2.0",
        "category": "Referral & Navigation",
        "status": "ACTIVE",
        "certification": "Specialty Taxonomy Heuristic",
        "latency_avg_ms": 9.8,
        "accuracy_rating": 97.5,
        "description": "Directs patients to appropriate clinical specialists using heuristic rule matching."
    },
    {
        "id": "agent-care-protocol-v2",
        "name": "Care Protocol & Suggestion Agent",
        "version": "2.0.1",
        "category": "Care Planning & Safety",
        "status": "ACTIVE",
        "certification": "Rule-Based Care Guidance (Prototype)",
        "latency_avg_ms": 15.1,
        "accuracy_rating": 99.1,
        "description": "Suggests initial diagnostic workups, non-pharmacologic interventions, and allergy alerts."
    },
    {
        "id": "agent-hipaa-guardrail-v1",
        "name": "Privacy & De-Identification Guardrail",
        "version": "1.1.0",
        "category": "Privacy & Security",
        "status": "ACTIVE",
        "certification": "Regex Masking (Not Certified HIPAA/GDPR)",
        "latency_avg_ms": 8.5,
        "accuracy_rating": 100.0,
        "description": "Computes SHA-256 audit hashes, scrubs basic identifiers via regex, and simulates data minimization."
    },
    {
        "id": "agent-pediatric-triage-v1",
        "name": "Pediatric Acuity Screener (Preview)",
        "version": "0.9.0",
        "category": "Pediatrics",
        "status": "NOT_IMPLEMENTED_PREVIEW",
        "certification": "Planned PEWS (Not Implemented)",
        "latency_avg_ms": 14.0,
        "accuracy_rating": 0.0,
        "description": "Placeholder for pediatric vitals normalization; not implemented in current prototype."
    }
]

def get_agent_catalog() -> List[Dict[str, Any]]:
    return MEDICAL_AGENT_CATALOG
