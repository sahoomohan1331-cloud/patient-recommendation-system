import sys
import os
import uvicorn

# Ensure packages directory is on the path
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
ENGINE_DIR = os.path.join(ROOT_DIR, "packages", "orchestration-engine")
if ENGINE_DIR not in sys.path:
    sys.path.insert(0, ENGINE_DIR)

if __name__ == "__main__":
    banner = """
    ========================================================================
     TRIAGE | Medical-Grade AI Assistant & Patient Recommendation Platform
    ========================================================================
     [+] Orchestration Engine: ACTIVE
     [+] Medical Agent Marketplace: READY (5 core agents, 1 preview)
     [+] Interoperability: HL7 FHIR Release 4
     [+] Privacy & Security: HIPAA Safe Harbor & GDPR Guardrails Active
    ------------------------------------------------------------------------
     -> Local Access URL: http://localhost:8000
     -> Swagger API Docs: http://localhost:8000/docs
    ========================================================================
    """
    print(banner)
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
