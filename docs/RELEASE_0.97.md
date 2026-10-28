# Wirevo v0.97.0 — direct SDK pairing and permission diagnostics

Direct SDK connection is the first action in the panel and selected-file instructions. A successful authenticated direct connection discards a stale popup transport record and closes the previously owned companion window. Failed pairing preserves an existing working companion session.

Empty pairing codes, wrong project/config JSON and invalid ports are reported before a network call. Brave network failure and timeout messages explain the per-site Localhost / Local Network Access permission and page refresh, with official Brave documentation in the panel. Authentication errors remain distinct. The application cannot grant browser permissions itself.

Validation: six new tests cover direct handoff/cleanup, failed-pair preservation, Brave/other-browser guidance, timeout and empty/wrong file handling. Old test suites were not run. Hosted in-app background loopback requests remain unverified; user-assisted normal-Brave validation is pending site permission and a valid connection file. The already accepted 0.96 companion-based Compile → load → Run path remains available. No full direct live acceptance is claimed.
