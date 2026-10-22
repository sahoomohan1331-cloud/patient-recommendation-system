"""
Local & Extensible LLM Integration Module for Triage Clinical AI.
Connects locally to Ollama (http://127.0.0.1:11434) with zero cloud dependencies,
with graceful deterministic fallback to the expert knowledge engine.
"""

import os
import json
import logging
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List

logger = logging.getLogger("triage.llm")

OLLAMA_BASE_URL = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434")

class LocalLLMClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL):
        self.base_url = base_url.rstrip("/")
        self.default_model = None
        self._refresh_model()

    def _refresh_model(self) -> Optional[str]:
        """Detect installed models in Ollama."""
        try:
            req = urllib.request.Request(f"{self.base_url}/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=2.5) as res:
                if res.status == 200:
                    data = json.loads(res.read().decode())
                    models = [m["name"] for m in data.get("models", [])]
                    if models:
                        self.default_model = models[0]
                        return self.default_model
        except Exception:
            pass
        return None

    def is_available(self) -> bool:
        return self.default_model is not None or self._refresh_model() is not None

    def get_info(self) -> Dict[str, Any]:
        available = self.is_available()
        return {
            "provider": "Ollama (Local LLM)",
            "available": available,
            "host": self.base_url,
            "active_model": self.default_model or "None (Offline rule-based fallback active)",
            "privacy": "100% On-Device / Zero Cloud Data Transmission",
        }

    def generate(self, prompt: str, system: Optional[str] = None, timeout: float = 12.0) -> Optional[str]:
        """Send generation request to Ollama with timeout."""
        model = self.default_model or self._refresh_model()
        if not model:
            return None

        payload: Dict[str, Any] = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.2,
                "top_p": 0.9,
                "num_predict": 350
            }
        }
        if system:
            payload["system"] = system

        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                f"{self.base_url}/api/generate",
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=timeout) as res:
                if res.status == 200:
                    result = json.loads(res.read().decode())
                    return result.get("response", "").strip()
        except Exception as e:
            logger.warning(f"Ollama generation fallback triggered: {e}")
            return None

    def clinical_copilot(self, user_message: str, patient_context: Optional[Dict[str, Any]] = None, orchestration_result: Optional[Dict[str, Any]] = None) -> str:
        """
        Generate clinical reasoning or answer clinician questions using local LLM,
        or fall back to deterministic clinical knowledge if Ollama is busy/offline.
        """
        top_dx = "Under evaluation"
        triage_cat = "ESI Acuity"
        allergies = []
        vitals = {}

        if orchestration_result:
            dxs = orchestration_result.get("differential_diagnoses", [])
            if dxs:
                top_dx = f"{dxs[0].get('condition')} ({dxs[0].get('icd10', '')})"
            triage_cat = orchestration_result.get("triage_category", "Standard")

        if patient_context:
            allergies = patient_context.get("allergies", [])
            vitals = patient_context.get("vitals", {})

        system_prompt = (
            "You are Triage Clinical Co-Pilot, an advanced clinical AI assistant designed to aid licensed physicians.\n"
            "Provide concise, evidence-based, clinically accurate answers.\n"
            "Active Patient Summary:\n"
            f"- Primary Working Diagnosis: {top_dx}\n"
            f"- Acuity: {triage_cat}\n"
            f"- Documented Allergies: {', '.join(allergies) if allergies else 'None'}\n"
            f"- Vitals: HR={vitals.get('heart_rate', 'N/A')}, BP={vitals.get('blood_pressure_sys', 'N/A')}/{vitals.get('blood_pressure_dia', 'N/A')}, SpO2={vitals.get('oxygen_saturation', 'N/A')}%\n"
            "Format your reply using clear markdown bullet points."
        )

        llm_reply = self.generate(prompt=user_message, system=system_prompt, timeout=10.0)
        if llm_reply:
            return llm_reply

        # Deterministic Expert Fallback (Safe & Instant)
        msg = user_message.lower().strip()
        if "allergy" in msg or "contraindication" in msg or "penicillin" in msg:
            if allergies:
                return (
                    f"**Clinical Safeguard Alert:**\n"
                    f"Documented patient allergies: **{', '.join(allergies)}**.\n"
                    f"• Beta-lactams or cross-reacting antibiotics must be avoided.\n"
                    f"• Macrolides (Azithromycin) or Fluoroquinolones may be considered for bacterial indications under physician discretion.\n"
                    f"• Strict renal and hepatic function monitoring is advised."
                )
            return "No drug allergies recorded in the current patient intake profile."

        if "triage" in msg or "why" in msg or "esi" in msg:
            return (
                f"**Triage Rationale ({triage_cat}):**\n"
                f"The patient was assigned this acuity based on hemodynamic vital signs and symptom severity. "
                f"Primary working diagnosis: **{top_dx}**."
            )

        return (
            f"**Clinical Co-Pilot Insight:**\n"
            f"Regarding '{user_message}': For a patient with suspected **{top_dx}** (Triage: {triage_cat}), "
            f"standard clinical protocols recommend immediate diagnostic stabilization, serial ECG/cardiac markers or relevant labs, "
            f"and close monitoring of oxygen saturation."
        )

# Global singleton
llm_client = LocalLLMClient()
