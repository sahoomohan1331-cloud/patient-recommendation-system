import os
import sys
import pytest
from fastapi.testclient import TestClient

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE_DIR = os.path.join(ROOT_DIR, "packages", "orchestration-engine")
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

from api import app

client = TestClient(app)

def test_queue_submission_and_retrieval():
    payload = {
        "age_group": "adult",
        "symptom_ids": ["chest_pain", "breathless"],
        "pain_score": 9,
        "triage_color": "red",
        "language": "or",
        "audio_notes": "Chest pain in Odia patient"
    }
    res = client.post("/api/queue/submit", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    token_id = data["token_id"]
    assert token_id.startswith("TK-")
    assert data["triage_color"] == "red"

    # Verify status
    res_status = client.get(f"/api/queue/status/{token_id}")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "waiting"

    # Verify active list
    res_active = client.get("/api/queue/active")
    assert res_active.status_code == 200
    active_data = res_active.json()
    assert active_data["total_active"] >= 1
    assert any(q["token_id"] == token_id for q in active_data["queue"])

    # Doctor calls patient
    res_call = client.post("/api/queue/call", json={"token_id": token_id, "room": "OPD Room 2"})
    assert res_call.status_code == 200
    call_data = res_call.json()
    assert call_data["status"] == "called"
    assert call_data["called_room"] == "OPD Room 2"

    # Verify patient status poll reflects called
    res_status2 = client.get(f"/api/queue/status/{token_id}")
    assert res_status2.json()["status"] == "called"
    assert res_status2.json()["called_room"] == "OPD Room 2"

    # Complete consult
    res_complete = client.post("/api/queue/complete", json={"token_id": token_id})
    assert res_complete.status_code == 200
    assert res_complete.json()["status"] == "completed"
