# Safety, Limitations & Clinical Governance Notice

> [!CAUTION]
> **DO NOT USE THIS SYSTEM FOR ACTUAL PATIENT TRIAGE.**  
> Triage is an **experimental research and workflow prototype**. It is **not a certified medical device** (Software as a Medical Device / SaMD) and has **not undergone clinical validation or regulatory evaluation** by the FDA, CDSCO, European Medicines Agency (EMA), or any other regulatory authority.  
>  
> This software must **never be deployed in live clinical settings, hospital emergency departments, or outpatient clinics to direct actual patient care**. All clinical decisions, triage assessments, and diagnostic orders must be performed by qualified, licensed healthcare professionals exercising independent clinical judgment.

---

## 1. What the System Does and Does Not Do

### What It Does
- **Intake Workflow Demonstration**: Collects patient-reported symptoms, chief complaints, and vitals through a clinician OPD workstation (`/`) and a multilingual patient kiosk (`/patient`).
- **Heuristic Rule Processing**: Executes deterministic, keyword-based rules to simulate acuity tiers (simulated ESI levels 1–5), ICD-10 code suggestions, and specialist referral routing.
- **Low-Literacy Kiosk Interaction**: Provides an interactive 3D WebGL mannequin (Three.js), a 0–10 Wong-Baker FACES pain scale, and 8 Indian languages with browser-native text-to-speech and speech-to-text.
- **Conservative Patient Directives**: The patient interface outputs only coarse action directives (**RED** for emergency ambulance dispatch, **YELLOW** for doctor visit today, **GREEN** for home care). It intentionally hides diagnostic hypotheses and confidence scores from patients.
- **Draft FHIR R4 Serialization**: Translates triage records into educational HL7 FHIR Release 4 JSON bundles (`Patient`, `Observation`, `Condition`, `ServiceRequest`).
- **Optional Local LLM Assistance**: Connects to an on-device Ollama runtime (`http://127.0.0.1:11434`) to provide contextual summaries for supervising clinicians, with deterministic rule-based fallback when offline.

### What It Does NOT Do
- **Does NOT provide medical diagnoses**: Suggested conditions are keyword-matched text strings, not probabilistic clinical diagnoses.
- **Does NOT perform validated triage**: The scoring system is not equivalent to certified Emergency Severity Index (ESI) algorithms.
- **Does NOT replace clinician judgment**: It is not an autonomous clinical agent. Every output requires human clinician verification.
- **Does NOT handle real-world clinical edge cases**: It does not account for complex multi-morbidity, atypical presentations (e.g., silent MI in elderly or diabetic patients), or subtle deterioration signs.
- **Does NOT provide production security or certified privacy**: Regex scrubbing is not a certified HIPAA Safe Harbor de-identification pipeline.

---

## 2. Acuity Logic is a Heuristic, NOT Validated ESI

The Emergency Severity Index (ESI) is an evidence-based, five-level emergency department triage algorithm established by the Agency for Healthcare Research and Quality (AHRQ) and the Emergency Nurses Association (ENA). Certified ESI triage requires:
1. Identifying patients requiring **immediate, life-saving resuscitation** (Level 1).
2. Identifying **high-risk situations**, altered mental status, severe pain/distress, or vitals in danger zones (Level 2).
3. Estimating the **number of clinical resources** (e.g., blood work, IV fluids, CT scan, specialist consultation) needed to reach a disposition (Levels 3, 4, 5).
4. Applying age-specific vital sign thresholds adjusted for baseline physiology and comorbidities.

### Why the Difference Matters
In Triage, acuity is assigned using **simplified, non-validated threshold rules** in `packages/orchestration-engine/agents/triage_agent.py`:
- `SpO2 < 92%` or `HR > 130` or `RR > 30` → Simulated ESI 1 (Resuscitation)
- `SpO2 < 95%` or `HR > 110` or `RR > 24` or `BP Sys > 180` → Simulated ESI 2 (Emergent)
- Default fallback → Simulated ESI 3 (Urgent) / ESI 4 / ESI 5

**Clinical Danger of Non-Validated Heuristics**:
- **Undertriage**: A patient with normal vital signs but an impending catastrophic condition (e.g., aortic dissection, ectopic pregnancy, acute stroke with subtle symptoms) would be classified as low acuity (ESI 3 or 4) by these simple rules, causing lethal care delays.
- **Overtriage**: A healthy patient with temporary physiological tachycardia from anxiety or exertion could be inappropriately categorized as ESI 1 or 2, misallocating critical emergency department resources.

---

## 3. Known Failure Modes

### Missing or Partial Vital Signs
If a clinician or patient inputs only partial vitals (e.g., heart rate without blood pressure or oxygen saturation), the heuristic engine evaluates only the provided values. It does **not** model physiological uncertainty or flag missing critical parameters. A patient in profound shock with unmeasured severe hypotension could be classified as non-urgent based solely on a borderline heart rate.

### Pediatric Inputs (Known Limitation — NOT a Feature)
Pediatric vital signs differ radically from adult physiology. Normal resting heart rates in infants can exceed 140 bpm, while a respiratory rate of 35 breaths/minute is common in neonates.
- **Current Limitation**: The triage agent in this repository evaluates all patients against adult vital sign thresholds, regardless of the age field.
- **Risk**: Applying adult thresholds to pediatric patients will systematically misclassify healthy infants as tachycardic/tachypneic emergency cases, or fail to recognize true pediatric decompensation. **Pediatric-specific clinical thresholds are not implemented in this prototype.**

### De-Identification Gaps
The `ComplianceAgent` in `packages/orchestration-engine/agents/compliance_agent.py` performs basic regular expression matching:
- US Social Security Numbers (`\b\d{3}-\d{2}-\d{4}\b`)
- US-style 10-digit telephone numbers
- Standard email addresses
- Naive first/last initial replacement for the name field

**Gaps**:
- It does **not** recognize patient names embedded in free-text clinical notes or speech transcripts.
- It does **not** detect international phone numbers, national IDs (e.g., Aadhaar, NHS numbers), hospital medical record numbers (MRNs), biometric data, or addresses.
- It does **not** comply with the 18 specific identifiers mandated by HIPAA Safe Harbor (§164.514(b)(2)).

### Local LLM Timeout & Deterministic Fallback
When local Ollama integration is enabled:
- Network calls time out after **12.0 seconds** (`llm_client.py`).
- If Ollama is offline, unreachable, or times out, the system automatically returns a deterministic template string summarizing top keyword diagnoses.
- Clinicians must note that responses generated during fallback contain no semantic natural language reasoning and reflect only static dictionary lookups.

---

## 4. Local LLM Behavior & Offline Guarantees

Triage is architected with a strict **local-first privacy posture**:
- **Zero Cloud Data Transmission**: The application makes no network calls to external commercial LLM APIs (e.g., OpenAI, Anthropic, Google).
- **Offline Fallback Architecture**: If `OLLAMA_HOST` (`http://127.0.0.1:11434`) is unreachable or returns an error, `LocalLLMClient.clinical_copilot()` returns a deterministic string:
  ```python
  f"Clinical Decision Support Summary:\n"
  f"Top Differential: {top_dx}\n"
  f"Acuity Level: {triage_cat}\n"
  f"Key Precautions: Verify airway, breathing, circulation..."
  ```
- **Browser-Only Patient Processing**: The patient self-intake interface (`/patient`) performs all 3D WebGL rendering, text-to-speech synthesis, and speech recognition locally using standard browser APIs (`SpeechSynthesis`, `webkitSpeechRecognition`, and Three.js).

---

## 5. Requirements for a Real Clinical Compliance Program

This prototype implements architectural patterns inspired by healthcare regulations, but it is **not certified compliant**. The following steps have **not been performed** and would be strictly mandatory before any clinical deployment:

| Requirement | Regulatory Framework | Current Prototype Status |
|---|---|---|
| **Clinical Validation Trial** | FDA / CDSCO / Good Clinical Practice (GCP) | **NOT DONE**. No prospective clinical trial or retrospective validation against board-certified emergency physicians has been conducted. |
| **Medical Device Classification** | FDA 21 CFR Part 820 / EU MDR 2017/745 | **NOT DONE**. No formal Software as a Medical Device (SaMD) regulatory filing (510(k), De Novo, or CE Mark) has been submitted. |
| **Quality Management System (QMS)** | ISO 13485:2016 | **NOT DONE**. No certified medical device quality management system or design controls are in place. |
| **Medical Risk Management** | ISO 14971:2019 | **NOT DONE**. No formal hazard identification, fault tree analysis, or risk mitigation matrix has been conducted. |
| **Software Lifecycle Processes** | IEC 62304:2006+AMD1:2015 | **NOT DONE**. Software safety classification, verification, and traceability matrices have not been audited. |
| **HIPAA Security & Privacy Certification** | HIPAA Rules (45 CFR Parts 160 & 164) | **NOT DONE**. No third-party SOC 2 Type II, HITRUST, or HIPAA compliance audit has been performed. |
| **Data Protection Impact Assessment** | GDPR Article 35 | **NOT DONE**. No formal DPIA, lawful basis determination, or Data Protection Officer review has occurred. |
| **Pediatric Physiological Stratification** | PALS / APLS Clinical Guidelines | **NOT DONE**. Pediatric age-adjusted vital sign ranges are not implemented. |
