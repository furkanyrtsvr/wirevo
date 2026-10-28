# Wirevo v0.98.1 — exclusive Windows SDK helper listener

Windows can permit two SO_REUSEADDR listeners on one port, sending automatic pairing to an older helper with a different secret. The helper now binds exclusively and disables address reuse; an already occupied default port correctly selects a free port. Existing old helper sessions continue working.

Validation: only the new automatic-pairing/helper checks were run, including a real socket test that a second helper cannot bind an occupied listener. No earlier suites were rerun.
