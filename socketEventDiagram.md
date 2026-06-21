┌──────────────┐          ┌─────────────────┐          ┌──────────────┐
│ Receptionist  │          │    Server       │          │   Patient    │
│   Client      │          │   (state)       │          │   Client     │
└──────┬───────┘          └────────┬────────┘          └──────┬───────┘
       │                           │                          │
       │  connect                  │                          │
       │──────────────────────────>│                          │
       │                           │                          │
       │                           │  join (implicit)         │
       │                           │<─────────────────────────│
       │                           │                          │
       │                           │  emit 'update'           │
       │<──────────────────────────│─────────────────────────>│
       │                           │                          │
       │  emit 'add-patient'       │                          │
       │──────────────────────────>│                          │
       │   {name: "Raj"}           │                          │
       │                           │  update state            │
       │                           │  broadcast 'update'      │
       │<──────────────────────────│─────────────────────────>│
       │                           │                          │
       │  emit 'call-next'         │                          │
       │──────────────────────────>│                          │
       │                           │  shift queue, set curr   │
       │                           │  broadcast 'update'      │
       │<──────────────────────────│─────────────────────────>│
       │                           │                          │
       │  emit 'set-avg-time'      │                          │
       │──────────────────────────>│                          │
       │   {time: 15}              │                          │
       │                           │  update avgTime          │
       │                           │  broadcast 'update'      │
       │<──────────────────────────│─────────────────────────>│
       │                           │                          │
    Receptionist          Server (state)          Patient
    |                      |                     |
    |  'call-next'         |                     |
    |─────────────────────>|                     |
    |                      | set currentToken    |
    |                      | record startTime    |
    |                      | broadcast 'update'  |
    |<─────────────────────|────────────────────>|
    |                      |                     |
    |  'complete-cons'     |                     |
    |─────────────────────>|                     |
    |                      | compute duration    |
    |                      | push to history     |
    |                      | update avgTime      |
    |                      | clear currentToken  |
    |                      | broadcast 'update'  |
    |<─────────────────────|────────────────────>|
    Events (Client → Server)

'add-patient' – payload: { name }

'call-next' – no payload

'set-avg-time' – payload: { time } (number in minutes)

Events (Server → Client)

'update' – payload: { queue, currentToken, avgTime, nextToken } (full state)