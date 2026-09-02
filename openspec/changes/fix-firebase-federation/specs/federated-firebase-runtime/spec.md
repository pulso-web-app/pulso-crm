## Purpose

Ensures Firebase services remain available when Shell and CRM independently bundle different Firebase entry points.

## ADDED Requirements

### Requirement: Shared Firebase service registry

The CRM remote SHALL share the Firebase app registry as a strict singleton so the Shell-created app can resolve services loaded by CRM.

#### Scenario: the remote adds Firestore

- **WHEN** Shell initializes Firebase App and Auth and CRM loads its separately built Firestore entry point
- **THEN** Firestore initializes against the same app without service-unavailable or subsequent dependency-injection errors

#### Scenario: independent application startup

- **WHEN** the application starts independently
- **THEN** its Firebase services initialize and its existing authentication behavior is preserved
