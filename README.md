# Triage — Experimental Clinician-Supervised Triage Support Prototype

> [!CAUTION]
> **NOT A MEDICAL DEVICE • NOT FOR CLINICAL USE • PROTOTYPE ONLY**  
> Triage is an **experimental research prototype**, not a certified medical device (Software as a Medical Device / SaMD). It has **not been clinically validated** and has **not been evaluated or approved by the FDA, CDSCO, CE, or any regulatory body**. This software must **never be used for actual patient care, diagnostic decisions, or autonomous emergency triage**. It requires direct, qualified clinician supervision at all times.

Triage is an open-source, experimental software prototype exploring human-supervised triage workflows, patient self-intake interfaces, and multi-agent clinical decision support heuristics. The project pairs an on-device, low-literacy patient kiosk mode (featuring a 3D anatomical model and 8 Indian languages) with an Outpatient Department (OPD) review dashboard for supervising clinicians.

---

## What This Project Is vs. What This Project Is Not

| What This Project IS | What This Project IS NOT |
|---|---|
| **An experimental software prototype** exploring computer-assisted clinical triage and intake workflows. | **NOT a medical device** or autonomous diagnostic instrument. |
| **A heuristic rule engine** demonstrating how vital signs and reported symptoms can be mapped to acuity categories. | **NOT validated ESI (Emergency Severity Index)**. It uses simplified, non-validated threshold rules. |
| **A patient self-intake concept** with 3D body interaction, Wong-Baker FACES pain scale, and 8 Indian languages. | **NOT a substitute for medical triage**. Patients are directed to call 108 emergency services for red-flag symptoms. |
| **A proof-of-concept multi-agent pipeline** demonstrating modular separation of concerns (triage, ICD-10 attribution, specialty matching). | **NOT an autonomous clinical decision-maker**. Every suggestion requires qualified physician verification. |
| **A prototype data pipeline** generating draft HL7 FHIR Release 4 JSON bundles for educational interoperability testing. | **NOT certified HIPAA or GDPR compliant**. No formal third-party compliance audit has been performed. |

---

## Prototype Features (Reframed to Reality)

- **Heuristic Acuity Scoring (Not Validated ESI)**: Evaluates input vital signs (heart rate, blood pressure, SpO2, respiratory rate, temperature) against basic physiological ranges to assign an experimental acuity indicator (simulated levels 1 through 5).
- **Keyword-Based Differential Suggestions (Not Clinical Diagnoses)**: Matches patient-reported complaints and symptom keywords against an in-memory dictionary to suggest potential ICD-10 code attributions with heuristic confidence scores.
- **Rule-Based Specialty Referral Matching**: Associates suggested condition clusters with relevant hospital specialties (e.g., Cardiology, Pulmonology, Neurology) for clinician review.
- **Workup & Red-Flag Checklist**: Generates a standardized initial care plan draft, diagnostic test suggestions, and acute deterioration warnings based on rule templates.
- **Patient Kiosk Mode (`/patient`)**: A touch-first self-intake interface designed for low-literacy patients:
  - Rotatable 360° 3D anatomical mannequin (Three.js WebGL) for body region selection.
  - Simplified Wong-Baker FACES pain scale (scores 0 to 10).
  - 8 Indian languages (English, Hindi, Odia, Bengali, Tamil, Telugu, Marathi, Gujarati) with browser-based voice synthesis and speech input.
  - Conservative Red / Yellow / Green action directives (patients never see speculative diagnosis names or confidence percentages).
- **Draft HL7 FHIR Release 4 Bundle Export**: Converts triage encounter records into prototype FHIR R4 JSON bundles (`Patient`, `Observation`, `Condition`, `ServiceRequest`).
- **Optional Local LLM Integration**: Connects locally to an Ollama instance (`http://127.0.0.1:11434`) for conversational reasoning, with deterministic rule-based fallback if Ollama is unavailable.
- **Basic De-Identification Heuristics**: Applies regular expression scrubbing for common identifiers (SSN, phone, email) and masks names before internal agent dispatch. *(Note: This is an experimental regex scrubber, not a verified HIPAA Safe Harbor certification).*

---

## Quickstart

Follow these exact steps from a clean clone to run the project locally:

```bash
# 1. Clone the repository
git clone https://github.com/sahoomohan1331-cloud/patient-recommendation-system.git

# 2. Navigate to the project directory
cd patient-recommendation-system

# 3. Install pinned Python dependencies
pip install -r requirements.txt

# 4. Start the application
python run.py
```

Once started, open your web browser:
- **Clinician OPD Dashboard**: [http://localhost:8000](http://localhost:8000)
- **Patient Kiosk Easy Mode**: [http://localhost:8000/patient](http://localhost:8000/patient)
- **Interactive OpenAPI Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)

*(Optional npm convenience: If Node.js is installed, `npm run dev` and `npm test` can also be run. These invoke `python run.py` and `pytest` under the hood).*

---

## Running the Automated Test Suite

The test suite validates queue state transitions, rule evaluations, boundary cases, and patient mode multilingual catalogs:

```bash
pytest
```

---

## Repository Architecture

```
patient-recommendation-system/
├── run.py                             # Server bootstrap (Uvicorn on port 8000)
├── requirements.txt                   # Pinned Python runtime & test dependencies
├── package.json                       # Optional npm script wrappers
├── SAFETY.md                          # Clinical limitations, failure modes & safety posture
├── model_capabilities.yaml            # Specification of agent contracts
├── packages/
│   ├── client-layer/                  # Frontend UI (Vanilla HTML5 / CSS3 / ES6 JS)
│   │   └── static/
│   │       ├── index.html             # Clinician OPD dashboard
│   │       ├── style.css              # Dashboard styles (light & dark modes)
│   │       ├── app.js                 # Dashboard logic & queue handling
│   │       ├── patient.html           # Patient self-intake kiosk interface
│   │       ├── patient.css            # Patient mode styles
│   │       ├── patient.js             # Patient mode logic, 3D mannequin, TTS/STT
│   │       └── three.min.js           # Three.js WebGL graphics library
│   ├── orchestration-engine/          # Core Python logic & REST API
│   │   ├── api.py                     # FastAPI routes & endpoints
│   │   ├── engine.py                  # Multi-agent coordination pipeline
│   │   ├── models.py                  # Pydantic data schemas
│   │   ├── patient_mode.py            # Multilingual catalogs & rule-based triage
│   │   ├── llm_client.py              # Local Ollama client with deterministic fallback
│   │   └── agents/                    # Modular rule-based agent implementations
│   │       ├── compliance_agent.py    # De-identification regex & audit hash
│   │       ├── triage_agent.py        # Heuristic acuity scoring (simulated ESI)
│   │       ├── diagnosis_agent.py     # Keyword-based differential diagnosis mapping
│   │       ├── specialist_agent.py    # Specialty referral heuristics
│   │       └── treatment_agent.py     # Care plan & workup checklist templates
│   ├── agent-marketplace/             # Agent registration & discovery prototype
│   │   └── marketplace.py             # In-memory catalog of agents
│   ├── integration-layer/             # Interoperability prototype
│   │   └── fhir_converter.py          # HL7 FHIR R4 JSON bundle generator
│   └── security-compliance/           # Architectural security notes
└── tests/
    ├── test_opd_queue.py              # OPD queue endpoints and status polling tests
    ├── test_orchestration.py          # Orchestration pipeline and vital sign tests
    └── test_patient_mode.py           # Patient mode, languages & emergency rule tests
```

---

## Safety & Clinical Limitations

For a detailed analysis of known failure modes, missing pediatric thresholds, local LLM fallback behaviors, and regulatory prerequisites, please read [SAFETY.md](SAFETY.md).

---

## License

This project is licensed under the [Apache License 2.0](LICENSE).
