Concurrency & Edge Cases
Concurrency

Since Node.js is single‑threaded, all socket events are processed sequentially – no two 'call-next' events can mutate the queue simultaneously.

For multiple receptionist clients, the server state remains the single source of truth. All updates are broadcast immediately, so every client sees the same data.

No explicit locking is required; the event‑loop ensures atomicity per event.

Edge Cases Handled

Scenario	Behaviour
Queue is empty and receptionist clicks “Call Next”	Button is disabled (or shows “No patients”), and server ignores the request.
Adding a patient when queue already has tokens	New token number = nextTokenCounter (incremented each time), appended to the end.
Average consultation time = 0 or negative	Input validation: default to 10 minutes if invalid.
Patient screen before any patient is added	Shows “No patients” state; wait time = 0.
Token numbers reset after server restart	In‑memory state resets – acceptable for MVP; could be persisted later.
Multiple patients with same name	Not an issue – each is identified by unique token number.
Rapid “Add” clicks	Each adds a new patient; the counter increments atomically.
Receptionist sets avg time while patients waiting	Wait time recalculates instantly for all connected patient screens.
Data Flow

All state mutations happen on the server, and the server emits a single 'update' event containing the entire state (queue, currentToken, avgTime, nextToken).

Clients re‑render using this snapshot – no complex diffing, making the system fast and mistake‑proof.