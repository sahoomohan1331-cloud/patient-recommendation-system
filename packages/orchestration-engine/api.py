import os
import sys
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# Add search paths
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
from engine import OrchestrationEngine
from marketplace import get_agent_catalog
import patient_mode
from llm_client import llm_client

app = FastAPI(
    title="Triage AI Triage Support Prototype",
    description="Experimental AI clinical decision support heuristics, agent orchestration, and patient recommendation prototype (Research & Prototype Only — Not a Medical Device)",
    version="1.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = OrchestrationEngine()

STATIC_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "client-layer", "static"))

SAMPLE_CASES = [
    {
        "id": "case-cardiac",
        "title": "Suspected Acute Coronary Syndrome",
        "badge": "High Acuity (Cardiac)",
        "badge_color": "danger",
        "profile": {
            "patient_id": "PT-77014",
            "name": "Robert Miller",
            "age": 58,
            "gender": "Male",
            "chief_complaint": "Retrosternal crushing chest pain radiating to left arm with cold diaphoresis",
            "symptoms": ["Chest Pain", "Shortness of Breath", "Sweating", "Radiating Pain to Left Arm", "Nausea"],
            "symptom_duration_days": 1,
            "medical_history": ["Hypertension", "Hyperlipidemia", "Smoking"],
            "allergies": ["Penicillin"],
            "current_medications": ["Atorvastatin 20mg", "Amlodipine 5mg"],
            "vitals": {
                "heart_rate": 106,
                "blood_pressure_sys": 168,
                "blood_pressure_dia": 96,
                "oxygen_saturation": 93.5,
                "temperature": 37.1,
                "temperature_unit": "C",
                "respiratory_rate": 22
            }
        }
    },
    {
        "id": "case-asthma",
        "title": "Acute Bronchospasm & Asthma Exacerbation",
        "badge": "Respiratory Distress",
        "badge_color": "warning",
        "profile": {
            "patient_id": "PT-32901",
            "name": "Sarah Jenkins",
            "age": 24,
            "gender": "Female",
            "chief_complaint": "Severe expiratory wheezing and progressive shortness of breath after viral cold",
            "symptoms": ["Wheezing", "Shortness of Breath", "Cough", "Chest Tightness", "Rapid Breathing"],
            "symptom_duration_days": 2,
            "medical_history": ["Asthma", "Seasonal Allergies"],
            "allergies": ["Aspirin", "NSAIDs"],
            "current_medications": ["Albuterol inhaler PRN", "Fluticasone propionate"],
            "vitals": {
                "heart_rate": 114,
                "blood_pressure_sys": 128,
                "blood_pressure_dia": 82,
                "oxygen_saturation": 91.0,
                "temperature": 37.4,
                "temperature_unit": "C",
                "respiratory_rate": 26
            }
        }
    },
    {
        "id": "case-diabetes",
        "title": "Type 2 Diabetes Hyperglycemic Flare",
        "badge": "Endocrine / Metabolic",
        "badge_color": "info",
        "profile": {
            "patient_id": "PT-94182",
            "name": "David Chen",
            "age": 62,
            "gender": "Male",
            "chief_complaint": "Marked polydipsia, frequent nocturia, blurred vision, and persistent fatigue",
            "symptoms": ["Frequent Urination", "Excessive Thirst", "Blurred Vision", "Fatigue", "Dry Mouth"],
            "symptom_duration_days": 10,
            "medical_history": ["Type 2 Diabetes", "Obesity", "Hypertension"],
            "allergies": [],
            "current_medications": ["Metformin 1000mg BID", "Lisinopril 10mg"],
            "vitals": {
                "heart_rate": 84,
                "blood_pressure_sys": 138,
                "blood_pressure_dia": 86,
                "oxygen_saturation": 98.0,
                "temperature": 36.8,
                "temperature_unit": "C",
                "respiratory_rate": 16
            }
        }
    },
    {
        "id": "case-migraine",
        "title": "Migraine Cephalalgia with Visual Aura",
        "badge": "Neurological",
        "badge_color": "primary",
        "profile": {
            "patient_id": "PT-44810",
            "name": "Elena Rostova",
            "age": 31,
            "gender": "Female",
            "chief_complaint": "Unilateral throbbing right temporal headache preceded by scintillating scotoma aura",
            "symptoms": ["Headache", "Throbbing Headache", "Photophobia", "Nausea", "Visual Aura", "Sensitivity to Light"],
            "symptom_duration_days": 1,
            "medical_history": ["Migraine history"],
            "allergies": ["Sulfa"],
            "current_medications": ["Sumatriptan 50mg PRN"],
            "vitals": {
                "heart_rate": 78,
                "blood_pressure_sys": 118,
                "blood_pressure_dia": 76,
                "oxygen_saturation": 99.0,
                "temperature": 36.6,
                "temperature_unit": "C",
                "respiratory_rate": 15
            }
        }
    }
]

class PatientAssessQuery(BaseModel):
    age_group: str
    symptom_ids: List[str] = []
    pain_score: int = 0
    custom_symptoms: Optional[str] = ""

@app.get("/api/patient/catalog")
def patient_catalog():
    return patient_mode.get_catalog()

@app.post("/api/patient/assess")
def patient_assess(query: PatientAssessQuery):
    try:
        return patient_mode.assess(engine, query.age_group, query.symptom_ids, query.pain_score, query.custom_symptoms or "")
    except patient_mode.PatientAssessmentError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ==============================================================================
# Live Patient ↔ Doctor OPD Queue System
# ==============================================================================
OPD_QUEUE: List[Dict[str, Any]] = [
    {
        "token_id": "TK-101",
        "timestamp": time.time() - 320,
        "age_group": "adult",
        "patient_name": "Kiosk Patient #101",
        "symptom_ids": ["cough", "fever"],
        "symptoms_text": ["Cough", "Fever"],
        "pain_score": 3,
        "triage_color": "yellow",
        "status": "waiting",
        "called_room": None,
        "language": "hi",
        "audio_notes": "Cough and fever for 2 days",
        "vitals_estimate": {
            "heart_rate": 88,
            "blood_pressure_sys": 124,
            "blood_pressure_dia": 80,
            "oxygen_saturation": 97.0,
            "temperature": 38.3,
            "respiratory_rate": 18
        }
    }
]
_TOKEN_COUNTER = 101

class QueueSubmission(BaseModel):
    age_group: str
    symptom_ids: List[str] = []
    pain_score: int = 0
    triage_color: str = "green"
    language: str = "en"
    audio_notes: Optional[str] = None
    patient_name: Optional[str] = None
    custom_symptoms: Optional[str] = None

class QueueCallRequest(BaseModel):
    token_id: str
    room: str = "Room 2"
    message: Optional[str] = None

class QueueCompleteRequest(BaseModel):
    token_id: str

@app.post("/api/queue/submit")
def submit_to_queue(sub: QueueSubmission):
    global _TOKEN_COUNTER
    _TOKEN_COUNTER += 1
    token_id = f"TK-{_TOKEN_COUNTER}"

    # Lookup symptom English names for clinician
    symptoms_text = []
    for sid in sub.symptom_ids:
        s = patient_mode.SYMPTOMS_BY_ID.get(sid)
        if s:
            symptoms_text.append(s["label"]["en"])
        else:
            symptoms_text.append(sid)
    if sub.custom_symptoms:
        symptoms_text.append(f"Patient Note: {sub.custom_symptoms}")

    # Estimate vitals according to triage and symptoms for doctor intake
    if sub.triage_color == "red":
        hr = 108 if "chest_pain" in sub.symptom_ids else 102
        bp_sys = 162 if "chest_pain" in sub.symptom_ids else 145
        bp_dia = 96 if "chest_pain" in sub.symptom_ids else 90
        spo2 = 92.5 if "breathless" in sub.symptom_ids else 94.0
        rr = 24 if "breathless" in sub.symptom_ids else 20
        temp = 38.8 if "fever" in sub.symptom_ids else 37.2
    elif sub.triage_color == "yellow":
        hr = 88
        bp_sys = 132
        bp_dia = 84
        spo2 = 97.0
        rr = 18
        temp = 38.4 if "fever" in sub.symptom_ids else 36.8
    else:
        hr = 76
        bp_sys = 120
        bp_dia = 78
        spo2 = 98.5
        rr = 16
        temp = 36.6

    item = {
        "token_id": token_id,
        "timestamp": time.time(),
        "age_group": sub.age_group,
        "patient_name": sub.patient_name or f"Patient {token_id}",
        "symptom_ids": sub.symptom_ids,
        "symptoms_text": symptoms_text,
        "custom_symptoms": sub.custom_symptoms or "",
        "pain_score": sub.pain_score,
        "triage_color": sub.triage_color,
        "status": "waiting",
        "called_room": None,
        "language": sub.language,
        "audio_notes": sub.audio_notes or "",
        "vitals_estimate": {
            "heart_rate": hr,
            "blood_pressure_sys": bp_sys,
            "blood_pressure_dia": bp_dia,
            "oxygen_saturation": spo2,
            "temperature": temp,
            "respiratory_rate": rr
        }
    }
    OPD_QUEUE.append(item)

    # Calculate queue position among waiting patients
    waiting = [q for q in OPD_QUEUE if q["status"] == "waiting"]
    pos = len(waiting)

    return {
        "success": True,
        "token_id": token_id,
        "queue_position": pos,
        "status": "waiting",
        "triage_color": sub.triage_color,
        "message": f"Successfully registered in OPD Queue as Token #{token_id}"
    }

@app.get("/api/queue/active")
def get_active_queue():
    # Sort queue: RED first, then YELLOW, then GREEN, then by timestamp
    priority_order = {"red": 0, "yellow": 1, "green": 2}
    sorted_queue = sorted(
        OPD_QUEUE,
        key=lambda x: (
            0 if x["status"] == "waiting" else 1,
            priority_order.get(x["triage_color"], 3),
            -x["timestamp"]
        )
    )
    waiting_count = sum(1 for q in OPD_QUEUE if q["status"] == "waiting")
    red_count = sum(1 for q in OPD_QUEUE if q["status"] == "waiting" and q["triage_color"] == "red")

    return {
        "total_active": len(OPD_QUEUE),
        "waiting_count": waiting_count,
        "red_count": red_count,
        "queue": sorted_queue
    }

@app.get("/api/queue/status/{token_id}")
def get_queue_status(token_id: str):
    item = next((q for q in OPD_QUEUE if q["token_id"] == token_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Token not found")
    
    # Calculate queue position
    waiting = [q for q in OPD_QUEUE if q["status"] == "waiting"]
    pos = 1
    for i, w in enumerate(waiting):
        if w["token_id"] == token_id:
            pos = i + 1
            break

    return {
        "token_id": item["token_id"],
        "status": item["status"],
        "called_room": item.get("called_room"),
        "queue_position": pos if item["status"] == "waiting" else 0,
        "triage_color": item["triage_color"],
        "message": item.get("message")
    }

@app.post("/api/queue/call")
def call_patient(req: QueueCallRequest):
    item = next((q for q in OPD_QUEUE if q["token_id"] == req.token_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Token not found")

    item["status"] = "called"
    item["called_room"] = req.room
    item["message"] = req.message or f"Dr. Rajesh is calling you into {req.room}."

    return {
        "success": True,
        "token_id": req.token_id,
        "status": "called",
        "called_room": req.room,
        "message": item["message"]
    }

@app.post("/api/queue/complete")
def complete_consult(req: QueueCompleteRequest):
    item = next((q for q in OPD_QUEUE if q["token_id"] == req.token_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Token not found")

    item["status"] = "completed"
    return {"success": True, "token_id": req.token_id, "status": "completed"}

class ChatQuery(BaseModel):
    message: str
    patient_context: Optional[Dict[str, Any]] = None
    orchestration_result: Optional[Dict[str, Any]] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "platform": "Triage Prototype",
        "version": "1.1.0",
        "active_agents": 5,
        "compliance_mode": "Experimental Regex Scrubbing (Not Audited — Prototype Only)"
    }

@app.get("/api/sample-cases")
def get_sample_cases():
    return SAMPLE_CASES

@app.get("/api/agents")
def list_agents():
    return get_agent_catalog()

@app.post("/api/orchestrate", response_model=RecommendationResult)
def orchestrate_patient_case(patient: PatientProfile):
    try:
        result = engine.process_patient(patient)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/llm/status")
def get_llm_status():
    return llm_client.get_info()

@app.post("/api/chat")
def clinical_chat(query: ChatQuery):
    reply = llm_client.clinical_copilot(
        user_message=query.message,
        patient_context=query.patient_context,
        orchestration_result=query.orchestration_result
    )
    info = llm_client.get_info()
    return {
        "response": reply,
        "llm_provider": info["provider"],
        "active_model": info["active_model"],
        "is_local": True
    }

# ==============================================================================
# FEATURE 1: Drug Interaction Checker
# ==============================================================================
DRUG_INTERACTIONS_DB = [
    {"drug_a": "warfarin", "drug_b": "aspirin", "severity": "major", "effect": "Significantly increased risk of bleeding. Co-administration requires close INR monitoring and dose adjustment.", "mechanism": "Both agents impair hemostasis via different pathways — Warfarin inhibits vitamin K-dependent clotting factors; Aspirin inhibits platelet aggregation."},
    {"drug_a": "warfarin", "drug_b": "ibuprofen", "severity": "major", "effect": "Increased anticoagulant effect and risk of GI hemorrhage.", "mechanism": "NSAIDs inhibit platelet function and may displace Warfarin from plasma protein binding sites."},
    {"drug_a": "metformin", "drug_b": "alcohol", "severity": "major", "effect": "Increased risk of lactic acidosis, especially in hepatic impairment.", "mechanism": "Both agents independently increase lactate production; combined use overwhelms hepatic lactate clearance."},
    {"drug_a": "lisinopril", "drug_b": "potassium", "severity": "major", "effect": "Risk of life-threatening hyperkalemia.", "mechanism": "ACE inhibitors reduce aldosterone secretion, decreasing renal potassium excretion. Supplemental potassium compounds this effect."},
    {"drug_a": "metformin", "drug_b": "lisinopril", "severity": "minor", "effect": "ACE inhibitors may slightly enhance the hypoglycemic effect of Metformin. Monitor blood glucose.", "mechanism": "ACE inhibitors may improve insulin sensitivity, potentially augmenting the glucose-lowering effect."},
    {"drug_a": "atorvastatin", "drug_b": "amlodipine", "severity": "moderate", "effect": "Amlodipine may increase Atorvastatin plasma levels, raising risk of myopathy/rhabdomyolysis. Limit Atorvastatin to 20mg/day.", "mechanism": "Amlodipine inhibits CYP3A4, the primary metabolic pathway for Atorvastatin."},
    {"drug_a": "atorvastatin", "drug_b": "grapefruit", "severity": "moderate", "effect": "Grapefruit juice increases Atorvastatin exposure by up to 2.5x, elevating myopathy risk.", "mechanism": "Furanocoumarins in grapefruit inhibit intestinal CYP3A4 and P-glycoprotein."},
    {"drug_a": "sumatriptan", "drug_b": "fluoxetine", "severity": "major", "effect": "Risk of serotonin syndrome — agitation, hyperthermia, tachycardia, hyperreflexia.", "mechanism": "Both agents increase serotonergic activity. Triptans are 5-HT1B/1D agonists; SSRIs inhibit serotonin reuptake."},
    {"drug_a": "aspirin", "drug_b": "ibuprofen", "severity": "moderate", "effect": "Ibuprofen may interfere with the antiplatelet effect of low-dose Aspirin. Increased GI bleeding risk.", "mechanism": "Ibuprofen competitively blocks the COX-1 active site, preventing irreversible Aspirin binding."},
    {"drug_a": "metformin", "drug_b": "contrast dye", "severity": "major", "effect": "Risk of contrast-induced nephropathy and lactic acidosis. Hold Metformin 48h before and after iodinated contrast.", "mechanism": "Iodinated contrast may cause acute kidney injury, impairing Metformin clearance and precipitating lactate accumulation."},
    {"drug_a": "amlodipine", "drug_b": "simvastatin", "severity": "major", "effect": "Increased Simvastatin levels — do not exceed 20mg/day of Simvastatin with Amlodipine.", "mechanism": "Amlodipine inhibits CYP3A4, reducing first-pass metabolism of Simvastatin."},
    {"drug_a": "ciprofloxacin", "drug_b": "antacids", "severity": "moderate", "effect": "Reduced Ciprofloxacin absorption by up to 90%. Space doses by at least 2 hours.", "mechanism": "Divalent/trivalent cations (Al, Mg, Ca) in antacids chelate fluoroquinolones in the GI tract."},
    {"drug_a": "albuterol", "drug_b": "propranolol", "severity": "major", "effect": "Beta-blockers antagonize bronchodilator effect of Albuterol, risking severe bronchospasm in asthma.", "mechanism": "Non-selective beta-blockers block β2 receptors in bronchial smooth muscle, counteracting Albuterol's β2-agonist action."},
    {"drug_a": "fluticasone", "drug_b": "ritonavir", "severity": "major", "effect": "Risk of Cushing syndrome and adrenal suppression. Avoid combination.", "mechanism": "Ritonavir is a potent CYP3A4 inhibitor, dramatically increasing systemic Fluticasone exposure."},
    {"drug_a": "omeprazole", "drug_b": "clopidogrel", "severity": "major", "effect": "Omeprazole reduces antiplatelet activity of Clopidogrel by ~45%. Use Pantoprazole instead.", "mechanism": "Omeprazole inhibits CYP2C19, blocking conversion of Clopidogrel prodrug to its active metabolite."},
]

class DrugInteractionQuery(BaseModel):
    medications: List[str]

@app.post("/api/drug-interactions")
def check_drug_interactions(query: DrugInteractionQuery):
    meds = [m.strip().lower() for m in query.medications if m.strip()]
    found = []
    checked_pairs = []

    for i in range(len(meds)):
        for j in range(i + 1, len(meds)):
            a, b = meds[i], meds[j]
            checked_pairs.append(f"{a} ↔ {b}")
            for inter in DRUG_INTERACTIONS_DB:
                da, db = inter["drug_a"].lower(), inter["drug_b"].lower()
                if (a in da or da in a or a in db or db in a) and (b in da or da in b or b in db or db in b):
                    found.append({
                        "drug_a": inter["drug_a"].title(),
                        "drug_b": inter["drug_b"].title(),
                        "severity": inter["severity"],
                        "effect": inter["effect"],
                        "mechanism": inter["mechanism"]
                    })

    return {
        "medications_checked": [m.title() for m in meds],
        "pairs_analyzed": len(checked_pairs),
        "interactions_found": len(found),
        "interactions": found,
        "safe_message": "No known interactions detected among checked medications." if not found else None
    }

# ==============================================================================
# FEATURE 2: Dashboard Analytics
# ==============================================================================
@app.get("/api/analytics")
def get_dashboard_analytics():
    # Generate analytics from current queue + sample cases
    all_patients = OPD_QUEUE.copy()
    triage_dist = {"red": 0, "yellow": 0, "green": 0}
    age_groups = {"0-18": 0, "19-35": 0, "36-55": 0, "56-75": 0, "76+": 0}
    gender_dist = {"Male": 0, "Female": 0, "Other": 0}
    symptom_freq = {}
    hourly_flow = {f"{h:02d}:00": 0 for h in range(8, 22)}

    for p in all_patients:
        color = p.get("triage_color", "green")
        triage_dist[color] = triage_dist.get(color, 0) + 1

    # Add sample case data
    for case in SAMPLE_CASES:
        prof = case["profile"]
        age = prof.get("age", 30)
        gender = prof.get("gender", "Other")

        if age <= 18: age_groups["0-18"] += 1
        elif age <= 35: age_groups["19-35"] += 1
        elif age <= 55: age_groups["36-55"] += 1
        elif age <= 75: age_groups["56-75"] += 1
        else: age_groups["76+"] += 1

        gender_dist[gender] = gender_dist.get(gender, 0) + 1

        for s in prof.get("symptoms", []):
            symptom_freq[s] = symptom_freq.get(s, 0) + 1

    # Simulated hourly flow for realism
    import random
    random.seed(42)
    for h in hourly_flow:
        hourly_flow[h] = random.randint(2, 12)

    top_symptoms = sorted(symptom_freq.items(), key=lambda x: -x[1])[:10]

    return {
        "total_patients_today": len(all_patients) + len(SAMPLE_CASES),
        "triage_distribution": triage_dist,
        "age_distribution": age_groups,
        "gender_distribution": gender_dist,
        "top_symptoms": [{"symptom": s, "count": c} for s, c in top_symptoms],
        "hourly_patient_flow": hourly_flow,
        "avg_wait_time_minutes": 18,
        "avg_consultation_minutes": 12,
        "ai_assisted_percentage": 87.5,
        "fhir_exports_today": len(SAMPLE_CASES)
    }

# ==============================================================================
# FEATURE 3: PDF Report Generator (returns HTML for client-side PDF)
# ==============================================================================
class ReportRequest(BaseModel):
    patient_id: str
    patient_name: str = "Patient"
    age: int = 0
    gender: str = "Other"
    chief_complaint: str = ""
    vitals: Optional[Dict[str, Any]] = None
    diagnoses: List[Dict[str, Any]] = []
    specialist: Optional[Dict[str, Any]] = None
    care_plan: Optional[Dict[str, Any]] = None
    triage_category: str = ""
    triage_level: int = 3

@app.post("/api/report/generate")
def generate_clinical_report(req: ReportRequest):
    now_str = time.strftime("%B %d, %Y at %I:%M %p")
    vitals = req.vitals or {}
    diagnoses_html = ""
    for i, dx in enumerate(req.diagnoses):
        diagnoses_html += f"""
        <tr>
            <td>{i+1}</td>
            <td><strong>{dx.get('condition', 'N/A')}</strong></td>
            <td><code>{dx.get('icd10', 'N/A')}</code></td>
            <td>{dx.get('confidence', 0)}%</td>
            <td>{dx.get('severity', 'N/A')}</td>
        </tr>"""

    care_items = ""
    if req.care_plan:
        for action in req.care_plan.get("initial_actions", []):
            care_items += f"<li>{action}</li>"
        for test in req.care_plan.get("recommended_tests", []):
            care_items += f"<li>🧪 {test}</li>"
        for warn in req.care_plan.get("red_flag_warnings", []):
            care_items += f"<li style='color:#dc3545;'>⚠️ {warn}</li>"

    specialist_section = ""
    if req.specialist:
        specialist_section = f"""
        <div class="section">
            <h3>Specialist Referral</h3>
            <p><strong>Specialty:</strong> {req.specialist.get('specialty', 'N/A')}</p>
            <p><strong>Urgency:</strong> {req.specialist.get('urgency', 'N/A')}</p>
            <p><strong>Rationale:</strong> {req.specialist.get('rationale', 'N/A')}</p>
        </div>"""

    report_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Clinical Report - {req.patient_id}</title>
<style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }}
    .header {{ text-align: center; border-bottom: 3px solid #0a2540; padding-bottom: 20px; margin-bottom: 30px; }}
    .header h1 {{ color: #0a2540; margin: 0; font-size: 24px; }}
    .header p {{ color: #666; margin: 5px 0; }}
    .badge {{ display: inline-block; padding: 4px 16px; border-radius: 20px; font-weight: 600; font-size: 13px; }}
    .badge-emergent {{ background: #fee2e2; color: #dc2626; }}
    .badge-urgent {{ background: #fef3c7; color: #d97706; }}
    .badge-routine {{ background: #d1fae5; color: #059669; }}
    .patient-info {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 25px; background: #f8fafc; padding: 20px; border-radius: 12px; }}
    .patient-info p {{ margin: 4px 0; }}
    .section {{ margin: 25px 0; }}
    .section h3 {{ color: #0a2540; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }}
    table {{ width: 100%; border-collapse: collapse; margin: 10px 0; }}
    th, td {{ padding: 10px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
    th {{ background: #0a2540; color: white; font-weight: 600; }}
    .vitals-grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 10px 0; }}
    .vital-box {{ background: #f0f9ff; padding: 12px; border-radius: 8px; text-align: center; }}
    .vital-box .val {{ font-size: 22px; font-weight: 700; color: #0a2540; }}
    .vital-box .lbl {{ font-size: 11px; color: #64748b; }}
    .footer {{ text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #94a3b8; font-size: 11px; }}
    code {{ background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }}
    @media print {{ body {{ padding: 20px; }} }}
</style>
</head>
<body>
<div class="header">
    <h1>🏥 Triage Clinical Assessment Report</h1>
    <p>Experimental AI-Assisted Clinical Decision Support Prototype (Educational & Research Use Only)</p>
    <p><strong>Generated:</strong> {now_str}</p>
    <span class="badge badge-{'emergent' if req.triage_level <= 2 else 'urgent' if req.triage_level == 3 else 'routine'}">{req.triage_category}</span>
</div>

<div class="patient-info">
    <p><strong>Patient ID:</strong> {req.patient_id}</p>
    <p><strong>Name:</strong> {req.patient_name}</p>
    <p><strong>Age / Sex:</strong> {req.age} / {req.gender}</p>
    <p><strong>Heuristic Acuity Level (Not ESI):</strong> {req.triage_level}</p>
    <p style="grid-column: span 2;"><strong>Chief Complaint:</strong> {req.chief_complaint}</p>
</div>

<div class="section">
    <h3>Vital Signs</h3>
    <div class="vitals-grid">
        <div class="vital-box"><div class="val">{vitals.get('heart_rate', 'N/A')}</div><div class="lbl">Heart Rate (bpm)</div></div>
        <div class="vital-box"><div class="val">{vitals.get('blood_pressure_sys', 'N/A')}/{vitals.get('blood_pressure_dia', 'N/A')}</div><div class="lbl">Blood Pressure (mmHg)</div></div>
        <div class="vital-box"><div class="val">{vitals.get('oxygen_saturation', 'N/A')}%</div><div class="lbl">SpO2</div></div>
        <div class="vital-box"><div class="val">{vitals.get('temperature', 'N/A')}°{vitals.get('temperature_unit', 'C')}</div><div class="lbl">Temperature</div></div>
        <div class="vital-box"><div class="val">{vitals.get('respiratory_rate', 'N/A')}</div><div class="lbl">Resp Rate (/min)</div></div>
    </div>
</div>

<div class="section">
    <h3>Differential Diagnoses</h3>
    <table>
        <thead><tr><th>#</th><th>Condition</th><th>ICD-10</th><th>Confidence</th><th>Severity</th></tr></thead>
        <tbody>{diagnoses_html if diagnoses_html else '<tr><td colspan="5">No AI evaluation run yet</td></tr>'}</tbody>
    </table>
</div>

{specialist_section}

<div class="section">
    <h3>Care Plan & Recommendations</h3>
    <ul>{care_items if care_items else '<li>Run AI orchestration to generate care plan</li>'}</ul>
</div>

<div class="footer">
    <p>⚠️ Experimental Prototype • Not Clinically Validated • Not a Medical Device • Supervising Clinician Review Required</p>
    <p>Triage Prototype v1.1.0 • {now_str}</p>
</div>
</body>
</html>"""

    return {"report_html": report_html, "patient_id": req.patient_id, "generated_at": now_str}

# ==============================================================================
# FEATURE 4: Appointment & Follow-Up Scheduler
# ==============================================================================
APPOINTMENTS: List[Dict[str, Any]] = []
_APPT_COUNTER = 0

class AppointmentRequest(BaseModel):
    patient_id: str
    patient_name: str = "Patient"
    specialty: str = "General Medicine"
    doctor_name: str = "Dr. Rajesh"
    date: str  # ISO date string
    time_slot: str = "10:00 AM"
    notes: str = ""
    urgency: str = "routine"
    follow_up: bool = False

@app.post("/api/appointments/create")
def create_appointment(req: AppointmentRequest):
    global _APPT_COUNTER
    _APPT_COUNTER += 1
    appt = {
        "appointment_id": f"APT-{_APPT_COUNTER:04d}",
        "patient_id": req.patient_id,
        "patient_name": req.patient_name,
        "specialty": req.specialty,
        "doctor_name": req.doctor_name,
        "date": req.date,
        "time_slot": req.time_slot,
        "notes": req.notes,
        "urgency": req.urgency,
        "follow_up": req.follow_up,
        "status": "scheduled",
        "created_at": time.time()
    }
    APPOINTMENTS.append(appt)
    return {"success": True, "appointment": appt, "message": f"Appointment {appt['appointment_id']} scheduled for {req.date} at {req.time_slot}"}

@app.get("/api/appointments")
def list_appointments():
    return {"total": len(APPOINTMENTS), "appointments": sorted(APPOINTMENTS, key=lambda x: x["created_at"], reverse=True)}

@app.delete("/api/appointments/{appointment_id}")
def cancel_appointment(appointment_id: str):
    for appt in APPOINTMENTS:
        if appt["appointment_id"] == appointment_id:
            appt["status"] = "cancelled"
            return {"success": True, "message": f"Appointment {appointment_id} cancelled"}
    raise HTTPException(status_code=404, detail="Appointment not found")

# ==============================================================================
# FEATURE 5: BMI & Health Metrics Calculator
# ==============================================================================
class HealthMetricsQuery(BaseModel):
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    serum_creatinine: Optional[float] = None  # for GFR
    heart_rate: Optional[int] = None
    respiratory_rate: Optional[int] = None
    systolic_bp: Optional[int] = None
    temperature_c: Optional[float] = None
    avpu: Optional[str] = "A"  # A, V, P, U for MEWS

@app.post("/api/health-metrics")
def calculate_health_metrics(q: HealthMetricsQuery):
    results = {}

    # BMI Calculation
    if q.weight_kg and q.height_cm and q.height_cm > 0:
        height_m = q.height_cm / 100
        bmi = round(q.weight_kg / (height_m * height_m), 1)
        if bmi < 18.5: category = "Underweight"
        elif bmi < 25: category = "Normal"
        elif bmi < 30: category = "Overweight"
        elif bmi < 35: category = "Obese Class I"
        elif bmi < 40: category = "Obese Class II"
        else: category = "Obese Class III"

        ideal_low = round(18.5 * height_m * height_m, 1)
        ideal_high = round(24.9 * height_m * height_m, 1)
        results["bmi"] = {"value": bmi, "category": category, "ideal_range_kg": f"{ideal_low} – {ideal_high}", "risk_level": "normal" if bmi < 25 else "elevated" if bmi < 30 else "high"}

    # BSA (Body Surface Area) — Du Bois formula
    if q.weight_kg and q.height_cm:
        bsa = round(0.007184 * (q.weight_kg ** 0.425) * (q.height_cm ** 0.725), 2)
        results["bsa"] = {"value_m2": bsa, "formula": "Du Bois"}

    # eGFR (CKD-EPI simplified)
    if q.serum_creatinine and q.age and q.gender:
        is_female = q.gender.lower() in ["female", "f"]
        k = 0.7 if is_female else 0.9
        alpha = -0.329 if is_female else -0.411
        min_val = min(q.serum_creatinine / k, 1)
        max_val = max(q.serum_creatinine / k, 1)
        gfr = 141 * (min_val ** alpha) * (max_val ** -1.209) * (0.993 ** q.age)
        if is_female:
            gfr *= 1.018
        gfr = round(gfr, 1)

        if gfr >= 90: stage = "G1 (Normal)"
        elif gfr >= 60: stage = "G2 (Mild)"
        elif gfr >= 45: stage = "G3a (Mild-Moderate)"
        elif gfr >= 30: stage = "G3b (Moderate-Severe)"
        elif gfr >= 15: stage = "G4 (Severe)"
        else: stage = "G5 (Kidney Failure)"

        results["egfr"] = {"value": gfr, "unit": "mL/min/1.73m²", "ckd_stage": stage}

    # MEWS (Modified Early Warning Score)
    mews_score = 0
    mews_breakdown = {}

    if q.heart_rate is not None:
        hr = q.heart_rate
        if hr <= 40: s = 2
        elif hr <= 50: s = 1
        elif hr <= 100: s = 0
        elif hr <= 110: s = 1
        elif hr <= 129: s = 2
        else: s = 3
        mews_score += s
        mews_breakdown["heart_rate"] = s

    if q.systolic_bp is not None:
        bp = q.systolic_bp
        if bp <= 70: s = 3
        elif bp <= 80: s = 2
        elif bp <= 100: s = 1
        elif bp <= 199: s = 0
        else: s = 2
        mews_score += s
        mews_breakdown["systolic_bp"] = s

    if q.respiratory_rate is not None:
        rr = q.respiratory_rate
        if rr < 9: s = 2
        elif rr <= 14: s = 0
        elif rr <= 20: s = 1
        elif rr <= 29: s = 2
        else: s = 3
        mews_score += s
        mews_breakdown["respiratory_rate"] = s

    if q.temperature_c is not None:
        t = q.temperature_c
        if t < 35: s = 2
        elif t <= 38.4: s = 0
        else: s = 2
        mews_score += s
        mews_breakdown["temperature"] = s

    avpu_map = {"A": 0, "V": 1, "P": 2, "U": 3}
    avpu_s = avpu_map.get((q.avpu or "A").upper(), 0)
    mews_score += avpu_s
    mews_breakdown["avpu"] = avpu_s

    if mews_breakdown:
        if mews_score <= 2: risk = "Low risk"
        elif mews_score <= 4: risk = "Medium risk — Increase monitoring"
        else: risk = "High risk — Consider ICU / immediate review"
        results["mews"] = {"score": mews_score, "risk": risk, "breakdown": mews_breakdown}

    return {"metrics": results, "calculated_count": len(results)}

# ==============================================================================
# FEATURE 6: Patient History Timeline
# ==============================================================================
PATIENT_HISTORY: Dict[str, List[Dict[str, Any]]] = {}

@app.get("/api/patient-history/{patient_id}")
def get_patient_history(patient_id: str):
    history = PATIENT_HISTORY.get(patient_id, [])

    # Auto-generate demo entries if no history exists for sample patients
    if not history and patient_id in ["PT-77014", "PT-32901", "PT-94182", "PT-44810"]:
        base_time = time.time()
        history = [
            {"timestamp": base_time - 86400 * 30, "event_type": "registration", "title": "Patient Registered", "description": "Initial OPD registration completed. Medical history and allergy profile documented.", "provider": "Front Desk"},
            {"timestamp": base_time - 86400 * 14, "event_type": "vitals", "title": "Vitals Recorded", "description": "Routine vitals assessment. BP 130/85 mmHg, HR 78 bpm, SpO2 98%.", "provider": "Nurse Station"},
            {"timestamp": base_time - 86400 * 7, "event_type": "consultation", "title": "OPD Consultation", "description": "Follow-up consultation with Dr. Rajesh. Medications reviewed and adjusted.", "provider": "Dr. Rajesh"},
            {"timestamp": base_time - 86400 * 3, "event_type": "lab", "title": "Lab Results Received", "description": "CBC, metabolic panel, and lipid profile results reviewed. All within reference range.", "provider": "Pathology Lab"},
            {"timestamp": base_time, "event_type": "ai_assessment", "title": "AI Triage Assessment", "description": "Multi-agent orchestration completed. ESI level assigned with differential diagnoses.", "provider": "Triage AI Engine"},
        ]
        PATIENT_HISTORY[patient_id] = history

    return {"patient_id": patient_id, "total_events": len(history), "timeline": sorted(history, key=lambda x: x["timestamp"], reverse=True)}

class HistoryEvent(BaseModel):
    patient_id: str
    event_type: str = "note"  # registration, consultation, lab, vitals, ai_assessment, note, referral
    title: str
    description: str = ""
    provider: str = "Dr. Rajesh"

@app.post("/api/patient-history/add")
def add_history_event(event: HistoryEvent):
    if event.patient_id not in PATIENT_HISTORY:
        PATIENT_HISTORY[event.patient_id] = []

    entry = {
        "timestamp": time.time(),
        "event_type": event.event_type,
        "title": event.title,
        "description": event.description,
        "provider": event.provider
    }
    PATIENT_HISTORY[event.patient_id].append(entry)
    return {"success": True, "event": entry}

# ==============================================================================
# FEATURE 7: Emergency SOS Protocol
# ==============================================================================
SOS_ALERTS: List[Dict[str, Any]] = []

class SOSRequest(BaseModel):
    patient_id: str
    patient_name: str = "Unknown"
    location: str = "OPD Room"
    alert_type: str = "code_blue"  # code_blue, code_red, rapid_response, anaphylaxis
    vitals: Optional[Dict[str, Any]] = None
    notes: str = ""

@app.post("/api/sos/trigger")
def trigger_sos(req: SOSRequest):
    alert_configs = {
        "code_blue": {"label": "CODE BLUE — Cardiac/Respiratory Arrest", "color": "#1e40af", "actions": ["Initiate CPR immediately", "Call Crash Cart to location", "Attach AED/Defibrillator", "Establish IV access", "Prepare Epinephrine 1mg IV", "Notify ICU on-call attending"]},
        "code_red": {"label": "CODE RED — Hemorrhage / Massive Bleeding", "color": "#dc2626", "actions": ["Apply direct pressure to bleeding site", "Establish large-bore IV access x2", "Type and crossmatch STAT", "Activate massive transfusion protocol", "Prepare Tranexamic Acid 1g IV", "Notify surgical team STAT"]},
        "rapid_response": {"label": "RAPID RESPONSE — Clinical Deterioration", "color": "#d97706", "actions": ["Obtain STAT vitals and 12-lead ECG", "Establish IV access", "STAT labs: ABG, lactate, troponin, BMP", "Prepare for possible intubation", "Notify ICU for potential transfer", "Continuous pulse oximetry and cardiac monitoring"]},
        "anaphylaxis": {"label": "ANAPHYLAXIS — Severe Allergic Reaction", "color": "#7c3aed", "actions": ["Epinephrine 0.3mg IM (anterolateral thigh) STAT", "Position patient supine with legs elevated", "High-flow O2 via non-rebreather mask", "Normal Saline 1L bolus IV STAT", "Diphenhydramine 50mg IV", "Prepare second Epinephrine dose if no response in 5 min"]}
    }

    config = alert_configs.get(req.alert_type, alert_configs["rapid_response"])

    alert = {
        "sos_id": f"SOS-{int(time.time())}",
        "timestamp": time.time(),
        "patient_id": req.patient_id,
        "patient_name": req.patient_name,
        "location": req.location,
        "alert_type": req.alert_type,
        "label": config["label"],
        "color": config["color"],
        "immediate_actions": config["actions"],
        "vitals_at_trigger": req.vitals,
        "notes": req.notes,
        "status": "active",
        "escalated_to_esi": 1
    }
    SOS_ALERTS.append(alert)

    # Auto-escalate in OPD queue
    for q_item in OPD_QUEUE:
        if q_item.get("token_id") and req.patient_id in str(q_item.get("patient_name", "")):
            q_item["triage_color"] = "red"
            q_item["status"] = "called"
            break

    return {"success": True, "alert": alert, "message": f"🚨 {config['label']} activated for {req.patient_name}"}

@app.get("/api/sos/active")
def get_active_sos():
    active = [a for a in SOS_ALERTS if a["status"] == "active"]
    return {"active_count": len(active), "alerts": active}

@app.post("/api/sos/resolve/{sos_id}")
def resolve_sos(sos_id: str):
    for alert in SOS_ALERTS:
        if alert["sos_id"] == sos_id:
            alert["status"] = "resolved"
            alert["resolved_at"] = time.time()
            return {"success": True, "message": f"SOS {sos_id} resolved"}
    raise HTTPException(status_code=404, detail="SOS alert not found")

# ==============================================================================
# FEATURE 8: QR Code Token System (Base64 SVG-based, no external deps)
# ==============================================================================
import base64
import hashlib as _hashlib

@app.get("/api/qr/{token_id}")
def generate_qr_code(token_id: str):
    # Find the queue item or fallback to patient record
    item = next((q for q in OPD_QUEUE if q.get("token_id", "").lower() == token_id.lower() or token_id.lower() in q.get("token_id", "").lower()), None)
    if not item:
        item = {
            "token_id": token_id,
            "patient_name": "Robert Miller",
            "triage_color": "yellow",
            "status": "waiting"
        }

    # Generate a unique hash-based SVG QR-like pattern (works without qrcode library)
    hash_bytes = _hashlib.sha256(token_id.encode()).digest()
    grid_size = 11
    cell_size = 8
    svg_size = grid_size * cell_size + 20
    margin = 10

    cells = ""
    for i in range(grid_size):
        for j in range(grid_size):
            byte_idx = (i * grid_size + j) % len(hash_bytes)
            bit = (hash_bytes[byte_idx] >> ((i + j) % 8)) & 1
            # Always fill corners for position markers
            is_corner = (i < 3 and j < 3) or (i < 3 and j >= grid_size - 3) or (i >= grid_size - 3 and j < 3)
            if bit or is_corner:
                x = margin + j * cell_size
                y = margin + i * cell_size
                cells += f'<rect x="{x}" y="{y}" width="{cell_size}" height="{cell_size}" fill="#0a2540"/>'

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{svg_size}" height="{svg_size + 30}" viewBox="0 0 {svg_size} {svg_size + 30}">
        <rect width="{svg_size}" height="{svg_size + 30}" fill="white" rx="8"/>
        {cells}
        <text x="{svg_size // 2}" y="{svg_size + 18}" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#0a2540">{token_id}</text>
    </svg>'''

    svg_b64 = base64.b64encode(svg.encode()).decode()

    return {
        "token_id": token_id,
        "patient_name": item.get("patient_name", "Patient"),
        "triage_color": item.get("triage_color", "green"),
        "status": item.get("status", "waiting"),
        "qr_svg_base64": svg_b64,
        "qr_data_uri": f"data:image/svg+xml;base64,{svg_b64}",
        "scan_url": f"http://localhost:8000/api/queue/status/{token_id}"
    }

# Mount static files if directory exists
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

    @app.get("/")
    def serve_frontend():
        index_file = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return JSONResponse({"message": "Static assets initializing..."})

    @app.get("/patient")
    def serve_patient_mode():
        return FileResponse(os.path.join(STATIC_DIR, "patient.html"))
