import time
from typing import Tuple, Optional, List
from models import PatientProfile, AgentExecutionTrace

class TriageAgent:
    """
    Evaluates patient vital signs, chief complaint, and signs of distress
    to assign an Emergency Severity Index (ESI 1-5) score according to clinical triage standards.
    ESI 1: Resuscitation (immediate life-saving intervention needed)
    ESI 2: Emergent (high risk, confused/lethargic/severe pain, vital instability)
    ESI 3: Urgent (multiple resources needed, vitals borderline)
    ESI 4: Less Urgent (one resource needed)
    ESI 5: Non-Urgent (no resources needed, clinical consult)
    """

    def __init__(self):
        self.name = "ESI Triage & Acuity Evaluator"
        self.role = "Acuity Assessment & Vital Signs Validation"

    def evaluate(self, patient: PatientProfile) -> Tuple[int, str, Optional[str], AgentExecutionTrace]:
        start_time = time.time()
        v = patient.vitals
        symptoms_lower = [s.lower() for s in patient.symptoms]
        complaint_lower = (patient.chief_complaint or "").lower()

        # Check for life-threatening keywords (ESI 1)
        resuscitation_triggers = [
            "cardiac arrest", "unresponsive", "apnea", "severe anaphylaxis",
            "gasping", "pulseless", "massive bleeding", "cyanosis"
        ]
        for trig in resuscitation_triggers:
            if trig in complaint_lower or any(trig in s for s in symptoms_lower):
                duration = round((time.time() - start_time) * 1000, 2)
                trace = AgentExecutionTrace(
                    agent_name=self.name,
                    role=self.role,
                    execution_time_ms=duration,
                    status="ALERT_ESI_1",
                    key_output_summary="Immediate resuscitation trigger detected. Protocol Alpha."
                )
                return 1, "Resuscitation (ESI 1)", "CRITICAL: Immediate life support intervention required.", trace

        # Check for high risk conditions (ESI 2)
        vitals_alerts: List[str] = []
        is_esi_2 = False

        if v:
            if v.oxygen_saturation is not None and v.oxygen_saturation < 90:
                vitals_alerts.append(f"Severe Hypoxemia (SpO2 {v.oxygen_saturation}%)")
                is_esi_2 = True
            elif v.oxygen_saturation is not None and v.oxygen_saturation < 94:
                vitals_alerts.append(f"Mild Hypoxemia (SpO2 {v.oxygen_saturation}%)")

            if v.heart_rate is not None and (v.heart_rate > 130 or v.heart_rate < 45):
                vitals_alerts.append(f"Dangerous Heart Rate ({v.heart_rate} bpm)")
                is_esi_2 = True
            elif v.heart_rate is not None and (v.heart_rate > 100 or v.heart_rate < 55):
                vitals_alerts.append(f"Abnormal Heart Rate ({v.heart_rate} bpm)")

            if v.blood_pressure_sys is not None and (v.blood_pressure_sys > 180 or v.blood_pressure_sys < 85):
                vitals_alerts.append(f"Critical Blood Pressure ({v.blood_pressure_sys}/{v.blood_pressure_dia or '?'} mmHg)")
                is_esi_2 = True
            elif v.blood_pressure_sys is not None and v.blood_pressure_sys > 140:
                vitals_alerts.append(f"Elevated Blood Pressure ({v.blood_pressure_sys}/{v.blood_pressure_dia or '?'} mmHg)")

            temp_c = v.temperature
            if v.temperature_unit == "F" and temp_c is not None:
                temp_c = (temp_c - 32) * 5 / 9
            if temp_c is not None and (temp_c > 39.5 or temp_c < 35.0):
                vitals_alerts.append(f"Severe Temperature Anomaly ({temp_c:.1f}°C)")
                is_esi_2 = True

        emergent_symptoms = [
            "crushing chest pain", "sudden numbness", "slurred speech", "facial droop",
            "severe shortness of breath", "stabbing chest pain", "worst headache of life",
            "suicidal ideation", "coughing up blood"
        ]
        for es in emergent_symptoms:
            if es in complaint_lower or any(es in s for s in symptoms_lower):
                is_esi_2 = True
                vitals_alerts.append(f"High risk symptom detected: '{es}'")

        if is_esi_2:
            duration = round((time.time() - start_time) * 1000, 2)
            alert_msg = " | ".join(vitals_alerts) if vitals_alerts else "High risk clinical presentation."
            trace = AgentExecutionTrace(
                agent_name=self.name,
                role=self.role,
                execution_time_ms=duration,
                status="ALERT_ESI_2",
                key_output_summary=f"Emergent status assigned. {len(vitals_alerts)} risk indicators flagged."
            )
            return 2, "Emergent (ESI 2)", alert_msg, trace

        # Check for ESI 3 vs 4 vs 5 based on symptom complexity and resources
        symptom_count = len(patient.symptoms)
        if symptom_count >= 3 or len(vitals_alerts) > 0 or len(patient.medical_history) > 1:
            level = 3
            category = "Urgent (ESI 3)"
        elif symptom_count >= 1:
            level = 4
            category = "Less Urgent (ESI 4)"
        else:
            level = 5
            category = "Non-Urgent (ESI 5)"

        duration = round((time.time() - start_time) * 1000, 2)
        alert_msg = " | ".join(vitals_alerts) if vitals_alerts else None
        trace = AgentExecutionTrace(
            agent_name=self.name,
            role=self.role,
            execution_time_ms=duration,
            status="STABLE",
            key_output_summary=f"Assigned {category}. Patient stable, resource estimation completed."
        )
        return level, category, alert_msg, trace
