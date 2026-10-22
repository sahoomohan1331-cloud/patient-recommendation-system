from typing import List, Dict, Any

MEDICAL_AGENT_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "agent-esi-triage-v1",
        "name": "ESI Triage & Acuity Evaluator",
        "version": "1.4.0",
        "category": "Emergency & Acuity",
        "status": "ACTIVE",
        "certification": "HIPAA Tier-1 / ESI Five-Level Standard",
        "latency_avg_ms": 12.4,
        "accuracy_rating": 98.7,
        "description": "Validates vitals, hemodynamics, and critical alerts to stratify patient risk."
    },
    {
        "id": "agent-differential-dx-v2",
        "name": "Differential Diagnostic Reasoner",
        "version": "2.1.0",
        "category": "Clinical Diagnostics",
        "status": "ACTIVE",
        "certification": "ICD-10-CM / SNOMED CT Ontology",
        "latency_avg_ms": 18.2,
        "accuracy_rating": 96.2,
        "description": "Ranks differential diagnoses with confidence scores using multi-symptom correlation."
    },
    {
        "id": "agent-specialist-matcher-v1",
        "name": "Specialist Referral Matcher",
        "version": "1.2.0",
        "category": "Referral & Navigation",
        "status": "ACTIVE",
        "certification": "ABMS Specialty Taxonomy",
        "latency_avg_ms": 9.8,
        "accuracy_rating": 97.5,
        "description": "Directs patients to appropriate clinical specialists with urgency stratification."
    },
    {
        "id": "agent-care-protocol-v2",
        "name": "Clinical Protocol & Care Plan Agent",
        "version": "2.0.1",
        "category": "Care Planning & Safety",
        "status": "ACTIVE",
        "certification": "Evidence-Based Clinical Guidelines (AHA/ADA/GINA)",
        "latency_avg_ms": 15.1,
        "accuracy_rating": 99.1,
        "description": "Synthesizes diagnostic workups, non-pharmacologic interventions, and allergy alerts."
    },
    {
        "id": "agent-hipaa-guardrail-v1",
        "name": "HIPAA & GDPR Compliance Guardrail",
        "version": "1.1.0",
        "category": "Privacy & Security",
        "status": "ACTIVE",
        "certification": "HIPAA Safe Harbor / GDPR Article 9",
        "latency_avg_ms": 8.5,
        "accuracy_rating": 100.0,
        "description": "Cryptographically audits transactions, masks 18 PHI identifiers, and enforces data minimization."
    },
    {
        "id": "agent-pediatric-triage-v1",
        "name": "Pediatric Acuity Screener",
        "version": "0.9.0",
        "category": "Pediatrics",
        "status": "LABS_PREVIEW",
        "certification": "PEWS (Pediatric Early Warning Score)",
        "latency_avg_ms": 14.0,
        "accuracy_rating": 95.0,
        "description": "Specialized vital signs normalization calibrated for neonatal and adolescent demographics."
    }
]

def get_agent_catalog() -> List[Dict[str, Any]]:
    return MEDICAL_AGENT_CATALOG
