import datetime
from typing import Dict, Any, List

def export_to_fhir_r4(
    patient_id: str,
    age: int,
    gender: str,
    diagnoses: List[Any],
    specialist: Any,
    triage_category: str
) -> Dict[str, Any]:
    """
    Transforms clinical decision outputs into an HL7 FHIR Release 4 draft JSON Bundle structure.
    Includes Patient, Observation (Triage), Condition (Differential Diagnoses), and ServiceRequest (Referral).
    """
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    bundle_id = f"bundle-{patient_id.lower()}-{int(datetime.datetime.now().timestamp())}"

    fhir_gender = "unknown"
    if gender.lower() == "male":
        fhir_gender = "male"
    elif gender.lower() == "female":
        fhir_gender = "female"
    elif gender.lower() == "other":
        fhir_gender = "other"

    entries = []

    # 1. Patient Resource
    entries.append({
        "fullUrl": f"urn:uuid:patient-{patient_id}",
        "resource": {
            "resourceType": "Patient",
            "id": patient_id,
            "gender": fhir_gender,
            "extension": [
                {
                    "url": "http://hl7.org/fhir/StructureDefinition/patient-age",
                    "valueInteger": age
                }
            ]
        }
    })

    # 2. Triage Observation Resource
    entries.append({
        "fullUrl": f"urn:uuid:observation-triage-{patient_id}",
        "resource": {
            "resourceType": "Observation",
            "id": f"obs-triage-{patient_id}",
            "status": "final",
            "category": [{
                "coding": [{
                    "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                    "code": "exam",
                    "display": "Exam"
                }]
            }],
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": "75636-1",
                    "display": "Emergency severity index triage category"
                }],
                "text": "Emergency Severity Index Triage"
            },
            "subject": {"reference": f"urn:uuid:patient-{patient_id}"},
            "effectiveDateTime": now_iso,
            "valueString": triage_category
        }
    })

    # 3. Condition Resources (Differential Diagnoses)
    for idx, d in enumerate(diagnoses):
        icd_code = getattr(d, 'icd10', 'R68.89')
        condition_name = getattr(d, 'condition', 'Unspecified')
        conf = getattr(d, 'confidence', 0.0)

        entries.append({
            "fullUrl": f"urn:uuid:condition-{idx}-{patient_id}",
            "resource": {
                "resourceType": "Condition",
                "id": f"cond-{idx}-{patient_id}",
                "clinicalStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                        "code": "active",
                        "display": "Active"
                    }]
                },
                "verificationStatus": {
                    "coding": [{
                        "system": "http://terminology.hl7.org/CodeSystem/condition-ver-status",
                        "code": "differential",
                        "display": "Differential Diagnosis"
                    }]
                },
                "code": {
                    "coding": [{
                        "system": "http://hl7.org/fhir/sid/icd-10-cm",
                        "code": icd_code,
                        "display": condition_name
                    }],
                    "text": condition_name
                },
                "subject": {"reference": f"urn:uuid:patient-{patient_id}"},
                "recordedDate": now_iso,
                "note": [{
                    "text": f"AI Differential Confidence: {conf}%"
                }]
            }
        })

    # 4. ServiceRequest Resource (Specialist Referral)
    if specialist:
        entries.append({
            "fullUrl": f"urn:uuid:servicerequest-{patient_id}",
            "resource": {
                "resourceType": "ServiceRequest",
                "id": f"sr-referral-{patient_id}",
                "status": "active",
                "intent": "proposal",
                "priority": getattr(specialist, 'urgency', 'routine').lower().split()[0],
                "code": {
                    "text": f"Referral to {getattr(specialist, 'specialty', 'Internal Medicine')}"
                },
                "subject": {"reference": f"urn:uuid:patient-{patient_id}"},
                "authoredOn": now_iso,
                "patientInstruction": getattr(specialist, 'rationale', '')
            }
        })

    return {
        "resourceType": "Bundle",
        "id": bundle_id,
        "type": "collection",
        "timestamp": now_iso,
        "total": len(entries),
        "entry": entries
    }
