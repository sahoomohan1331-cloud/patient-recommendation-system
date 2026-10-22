import time
from typing import List, Tuple
from models import PatientProfile, DiagnosisMatch, CarePlan, AgentExecutionTrace

class TreatmentAgent:
    """
    Formulates clinical protocol suggestions, diagnostic test recommendations,
    lifestyle modifications, and contraindication checks against patient allergies & medications.
    """

    def __init__(self):
        self.name = "Clinical Protocol & Care Plan Agent"
        self.role = "Evidence-Based Guidance & Contraindication Safeguards"

    def formulate(self, patient: PatientProfile, diagnoses: List[DiagnosisMatch], triage_level: int) -> Tuple[CarePlan, AgentExecutionTrace]:
        start_time = time.time()
        top_name = diagnoses[0].condition.lower() if diagnoses else ""

        initial_actions = []
        tests = []
        non_pharm = []
        cautions = []
        red_flags = []

        # Common contraindication and allergy alerts
        allergy_set = {a.strip().lower() for a in patient.allergies if a.strip()}
        med_set = {m.strip().lower() for m in patient.current_medications if m.strip()}

        if "penicillin" in allergy_set:
            cautions.append("WARNING: Penicillin allergy noted. Avoid Beta-lactam antibiotics (Amoxicillin, Augmentin, Ampicillin).")
        if "nsaid" in allergy_set or "aspirin" in allergy_set:
            cautions.append("WARNING: NSAID/Aspirin allergy noted. Avoid Ibuprofen, Naproxen, Ketorolac, and high-dose Aspirin.")
        if "sulfa" in allergy_set:
            cautions.append("WARNING: Sulfonamide allergy noted. Avoid Bactrim/TMP-SMX and sulfonylureas.")

        if "warfarin" in med_set or "eliquis" in med_set or "xarelto" in med_set:
            cautions.append("ALERT: Patient on active anticoagulant therapy. High risk of bleeding with invasive procedures or NSAIDs.")

        # Disease-specific evidence-based care protocols
        if "coronary" in top_name or triage_level <= 2:
            initial_actions.extend([
                "Maintain patient in semi-Fowler position with continuous cardiac telemetry",
                "Ensure intravenous access (18-20 gauge) in upper extremity",
                "Administer supplemental oxygen if SpO2 falls below 90%",
                "Perform STAT 12-lead Electrocardiogram (ECG) within 10 minutes of arrival"
            ])
            tests.extend([
                "12-Lead Electrocardiogram (ECG / EKG)",
                "High-Sensitivity Cardiac Troponin I/T (Serial at 0h, 2h)",
                "Complete Blood Count (CBC) with differential",
                "Basic Metabolic Panel (BMP) including electrolytes & serum creatinine",
                "Coagulation Profile (PT/INR, aPTT)"
            ])
            non_pharm.extend([
                "Strict physical rest and avoidance of exertion",
                "Continuous cardiac rhythm monitoring",
                "Calm, quiet clinical environment to reduce sympathetic tone"
            ])
            red_flags.extend([
                "Worsening retrosternal crushing pain radiating to neck or left arm",
                "Sudden diaphoresis, syncope, or profound hypotension (SBP < 90)",
                "Ventricular arrhythmias or acute respiratory distress"
            ])

        elif "asthma" in top_name or "pneumonia" in top_name:
            initial_actions.extend([
                "Evaluate peak expiratory flow (PEF) and pulse oximetry continuous monitoring",
                "Administer inhaled short-acting beta-2 agonist (Albuterol) via nebulizer / spacer",
                "Elevate head of bed to optimize diaphragmatic excursion",
                "Initiate humidified supplemental oxygen targeting SpO2 94-98%"
            ])
            tests.extend([
                "Pulse Oximetry continuous monitoring & Arterial Blood Gas (ABG) if severe",
                "Chest Radiography (PA & Lateral X-Ray)",
                "Complete Blood Count (CBC) for leukocytosis",
                "Sputum culture and viral respiratory panel (influenza/COVID-19/RSV)"
            ])
            non_pharm.extend([
                "Upright orthopneic positioning",
                "Avoidance of known environmental triggers (dust, cold air, smoke)",
                "Controlled pursed-lip breathing coaching"
            ])
            red_flags.extend([
                "Silent chest on auscultation (diminished air movement)",
                "Cyanosis, confusion, or inability to speak in full sentences",
                "SpO2 persistently below 92% despite supplemental oxygen"
            ])

        elif "diabetes" in top_name:
            initial_actions.extend([
                "Check point-of-care capillary blood glucose immediately",
                "Assess hydration status, skin turgor, and orthostatic vital signs",
                "Screen for ketone presence (urine dipstick or blood beta-hydroxybutyrate)"
            ])
            tests.extend([
                "Random / Fasting Plasma Glucose & Glycated Hemoglobin (HbA1c)",
                "Comprehensive Metabolic Panel (CMP) including eGFR, BUN, and electrolytes",
                "Urinalysis with Microalbumin-to-Creatinine Ratio",
                "Serum Osmolality and Ketone screen"
            ])
            non_pharm.extend([
                "Oral rehydration with non-caloric fluids",
                "Diabetic nutritional counseling: low glycemic index complex carbohydrates",
                "Structured physical activity after glycemic stabilization"
            ])
            red_flags.extend([
                "Kussmaul breathing or fruity breath odor (DKA warning)",
                "Altered mental status, severe lethargy, or repeated vomiting",
                "Serum glucose > 300 mg/dL with positive ketones"
            ])

        elif "migraine" in top_name:
            initial_actions.extend([
                "Place patient in darkened, low-stimulus, quiet recovery room",
                "Evaluate for neurological focal deficits (cranial nerves, motor, sensory)",
                "Hydration assessment and oral/IV fluid support"
            ])
            tests.extend([
                "Neurological comprehensive exam with fundoscopy",
                "Non-contrast Head CT / Brain MRI if 'worst headache of life' (thunderclap) or focal signs"
            ])
            non_pharm.extend([
                "Cold compress applied to forehead or occiput",
                "Elimination of sensory triggers (lights, loud noise, odors)",
                "Headache diary maintenance for trigger tracking"
            ])
            red_flags.extend([
                "Sudden peak intensity within seconds ('thunderclap' headache)",
                "Fever, neck stiffness (nuchal rigidity), or altered sensorium",
                "Focal neurological deficits (weakness, hemiparesis, dysphasia)"
            ])

        else:
            initial_actions.extend([
                "Complete baseline vital signs and comprehensive clinical history",
                "Review active medications and verify symptom onset trajectory",
                "Establish baseline pain and distress scoring (0-10 scale)"
            ])
            tests.extend([
                "Complete Blood Count (CBC) with Differential",
                "Comprehensive Metabolic Panel (CMP)",
                "Routine Urinalysis"
            ])
            non_pharm.extend([
                "Adequate rest, hydration, and nutritional balance",
                "Symptom log recording frequency and severity triggers"
            ])
            red_flags.extend([
                "Sudden worsening or change in clinical presentation",
                "Persistent high fever (>39°C) unresponsive to antipyretics",
                "Difficulty breathing, dizziness, or syncope"
            ])

        care_plan = CarePlan(
            initial_actions=initial_actions,
            recommended_tests=tests,
            non_pharmacological=non_pharm,
            medication_cautions=cautions if cautions else ["No immediate drug contraindications detected based on provided profile."],
            red_flag_warnings=red_flags
        )

        duration = round((time.time() - start_time) * 1000, 2)
        summary = f"Synthesized care plan with {len(tests)} recommended diagnostic tests and {len(red_flags)} clinical safeguards."
        trace = AgentExecutionTrace(
            agent_name=self.name,
            role=self.role,
            execution_time_ms=duration,
            status="SUCCESS",
            key_output_summary=summary
        )

        return care_plan, trace
