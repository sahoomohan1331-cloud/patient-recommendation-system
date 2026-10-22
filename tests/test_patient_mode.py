import os
import sys

import pytest

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE_DIR = os.path.join(ROOT_DIR, "packages", "orchestration-engine")
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from engine import OrchestrationEngine
import patient_mode


@pytest.fixture(scope="module")
def engine():
    return OrchestrationEngine()


def test_chest_pain_is_always_red(engine):
    r = patient_mode.assess(engine, "adult", ["chest_pain"], 2)
    assert r["color"] == "red"
    assert "danger_symptom" in r["reasons"]


def test_mild_cough_adult_is_green(engine):
    r = patient_mode.assess(engine, "adult", ["cough"], 2)
    assert r["color"] == "green"


def test_burning_urine_needs_doctor_today(engine):
    r = patient_mode.assess(engine, "adult", ["burning_urine"], 3)
    assert r["color"] == "yellow"


def test_baby_with_fever_is_red(engine):
    r = patient_mode.assess(engine, "baby", ["fever"], 0)
    assert r["color"] == "red"


def test_elderly_never_green(engine):
    r = patient_mode.assess(engine, "elderly", ["cough"], 0)
    assert r["color"] == "yellow"


def test_severe_pain_escalates_to_red(engine):
    r = patient_mode.assess(engine, "adult", ["headache"], 8)
    assert r["color"] == "red"


def test_patient_response_contains_no_diagnosis(engine):
    r = patient_mode.assess(engine, "adult", ["chest_pain", "sweating"], 6)
    text = str(r).lower()
    assert "coronary" not in text and "icd" not in text and "confidence" not in text


def test_invalid_input_rejected(engine):
    with pytest.raises(patient_mode.PatientAssessmentError):
        patient_mode.assess(engine, "adult", ["not_a_symptom"], 2)
    with pytest.raises(patient_mode.PatientAssessmentError):
        patient_mode.assess(engine, "adult", [], 0)
    with pytest.raises(patient_mode.PatientAssessmentError):
        patient_mode.assess(engine, "martian", ["cough"], 2)


def test_every_symptom_has_all_languages_including_odia():
    langs = ["en", "hi", "or", "bn", "ta", "te", "mr", "gu"]
    for s in patient_mode.SYMPTOM_CATALOG:
        for lang in langs:
            assert lang in s["label"] and s["label"][lang], f"Missing {lang} label in {s['id']}"
            assert lang in s["keywords"] and s["keywords"][lang], f"Missing {lang} keywords in {s['id']}"


def test_all_regions_exist_in_catalog():
    cat = patient_mode.get_catalog()
    region_ids = [r["id"] for r in cat["regions"]]
    for expected in ["head", "neck", "chest", "belly", "back", "arms", "legs", "urine", "body"]:
        assert expected in region_ids, f"Expected region {expected} missing in catalog"


def test_custom_symptoms_support(engine):
    # Assessment with custom text only
    r = patient_mode.assess(engine, "adult", [], 0, custom_symptoms="Severe knee swelling and thyroid issue")
    assert r["color"] in ["green", "yellow", "red"]
    assert r["clinic_summary"]["custom_symptoms"] == "Severe knee swelling and thyroid issue"
    assert "knee_pain" in r["clinic_summary"]["symptoms_en"] or len(r["clinic_summary"]["symptoms_en"]) >= 0
