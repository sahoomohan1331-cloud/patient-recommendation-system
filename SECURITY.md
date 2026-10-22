# Security Policy

> [!IMPORTANT]
> **Research and Educational Prototype Notice**
> Triage is an experimental software prototype for research and clinical workflow exploration. It is **not** a certified medical device, does **not** provide production-grade security or HIPAA/GDPR certification, and has **not** undergone formal security hardening, third-party penetration testing, or regulatory audits.
>
> For clinical safety boundaries, failure modes, and required compliance steps, see [SAFETY.md](file:///d:/patient%20recommendatin%20system/SAFETY.md).

## Security and Privacy Commitment

At Triage, security and privacy awareness are foundational principles for healthcare exploration. We are committed to:

- Transparently documenting current prototype capabilities and limitations
- Striving toward regulatory alignment (HIPAA, GDPR, SaMD) in future iterations
- Promptly addressing security vulnerabilities in our open-source codebase
- Providing honest, evidence-based disclosures

## Supported Versions

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 1.x.x   | :white_check_mark: | Experimental Prototype |
| < 1.0   | :x:                | Deprecated |

## Reporting a Vulnerability

If you discover a security vulnerability in this prototype:

1. **Do not disclose the vulnerability publicly.**
2. Report the vulnerability via **GitHub Security Advisories** on the official repository:
   `https://github.com/sahoomohan1331-cloud/patient-recommendation-system/security/advisories`
3. Provide:
   - A detailed description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested mitigations
4. Maintainers will review and acknowledge the report in accordance with standard open-source advisory procedures.

## Current Prototype Posture vs. Target Production Architecture

The table below clarifies what is implemented in the current code versus what remains a target for future phases:

| Capability | Current Prototype Status | Future Production Target Requirement |
| :--- | :--- | :--- |
| **Authentication & RBAC** | **NOT IMPLEMENTED**. In-memory mock session only. | JWT/OAuth2/OIDC, Multi-Factor Authentication (MFA), role-based access control. |
| **Data Encryption at Rest** | **NOT IMPLEMENTED**. Data stored in memory / local state. | AES-256 or hardware-encrypted volume storage for all databases. |
| **Data Encryption in Transit**| **NOT CONFIGURED**. Default local HTTP server. | TLS 1.3 enforced across all API endpoints and reverse proxies. |
| **Hardware Secure Enclave** | **NOT IMPLEMENTED**. Pure Python runtime process. | Confidential computing / hardware enclave (e.g. AWS Nitro Enclaves, Intel SGX). |
| **PHI De-Identification** | **EXPERIMENTAL REGEX**. Basic SSN, email, phone scrubbing. | Certified HIPAA Safe Harbor de-identification engine with ML NER & validation. |
| **Audit Logging** | **IN-MEMORY SHA-256 HASH**. Ephemeral session hash. | Immutable, tamper-evident audit logging stored in compliant SIEM / WORM storage. |

## Guidance for Evaluators & Contributors

When evaluating this prototype:

1. **Never input real Patient Health Information (PHI)** into local or shared instances.
2. **Do not expose development instances** (`run.py` on port 8000) directly to the public internet without an authenticating reverse proxy and TLS certificate.
3. **Always review [SAFETY.md](file:///d:/patient%20recommendatin%20system/SAFETY.md)** prior to testing clinical heuristics.

