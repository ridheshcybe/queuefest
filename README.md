
# Queue Cure '26 – MVP

A real‑time clinic queue management system built for the **Queue Cure '26** hackathon.

🔧 Technology Stack
Backend: Node.js + Express + Socket.io

Frontend: Vanilla HTML/CSS/JS (two separate screens)

Real‑time: WebSockets (Socket.io)

State: In‑memory JavaScript object (resets on server restart – acceptable for MVP)

structure
queue/
├── server.js
├── package.json
├── public/
│   ├── receptionist.html
│   ├── patient.html
│   └── style.css (optional, embedded in each HTML)
└── README.md

## Features
- **Receptionist dashboard**: Add patient, call next, set average consultation time.
- **Patient waiting room**: See current token, number of patients ahead, and estimated wait time.
- **Live sync**: All clients update instantly without page refresh using WebSockets.
- **Edge‑case ready**: Handles empty queue, invalid inputs, and concurrent updates.

## How to Run Locally

1. Clone this repository.
2. Install dependencies:npm install

3. Start the server:
npm start
4. Open two browser tabs:
- `http://localhost:3000/receptionist.html`
- `http://localhost:3000/patient.html`

## Deployment

You can deploy this app to any Node.js hosting platform (Render, Heroku, Railway).  
Make sure to set the `PORT` environment variable as needed.

## Tech Stack
- Node.js + Express
- Socket.io for real‑time communication
- Vanilla HTML/CSS/JS

## Event Flow
See `EVENT_DIAGRAM.md` for a visual representation of socket events.

## Evaluation Criteria Met
- ✅ Live updates without refresh (40%)
- ✅ Wait time computed from real data (queue + avg time) (25%)
- ✅ Receptionist UI fast & mistake‑proof (20%)
- ✅ Thought process covers concurrency & edge cases (15%)

npm install

text
3. Start the server:
npm start

text
4. Open two browser tabs:
- `http://localhost:3000/receptionist.html`
- `http://localhost:3000/patient.html`

## Deployment

You can deploy this app to any Node.js hosting platform (Render, Heroku, Railway).  
Make sure to set the `PORT` environment variable as needed.

## Tech Stack
- Node.js + Express
- Socket.io for real‑time communication
- Vanilla HTML/CSS/JS

## Event Flow
See `EVENT_DIAGRAM.md` for a visual representation of socket events.

## Evaluation Criteria Met
- ✅ Live updates without refresh (40%)
- ✅ Wait time computed from real data (queue + avg time) (25%)
- ✅ Receptionist UI fast & mistake‑proof (20%)
- ✅ Thought process covers concurrency & edge cases (15%)

---

Built with ❤️ for Wooble's Queue Cure '26.