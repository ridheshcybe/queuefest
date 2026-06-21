# Queue Cure '26

A modern clinical queue management system built with Next.js, React and NeDB. Designed to streamline patient flow in healthcare facilities with real-time updates, priority-based queuing and dual-display support for reception staff and patient waiting areas.

## Features

* **Priority-Based Queuing**: Emergency, Urgent and Normal priority levels with sorting

* **Dual Display Interface**:

* Receptionist Dashboard for queue management

* Patient Display Screen for viewing

* **Real-Time Updates**: Automatic refresh every 3-5 seconds for live queue status

* **Patient Lookup**: Token-based status checking for patients

* **Audit Trail**: Comprehensive logging of all queue actions

* **Responsive Design**: Works on desktop and tablet devices

* **Authentication**: Secure login system for clinic staff

## Architecture

### Frontend

* **Framework**: Next.js 13. With React 18

* **Styling**: Tailwind CSS + Custom CSS

* **State Management**: React Context API

* **Routing**: Next.js App Router

* **Components**: reusable UI components

### Backend

* **API Routes**: Next.js API routes for functionality

* **Database**: NeDB

* **Authentication**: JWT-based validation

* **Logging**: Custom logger service

### Data Model

* **Patients**: Token, name, priority, status

* **Queue Logs**: Action tracking

* **Users**: Clinic staff authentication

## Screens

### Receptionist Dashboard

* View queue

* Call patient

* Complete/skip current patient

* Add new patients

* Remove patients

* View daily statistics

### Patient Display Screen

* readable display

* Shows currently serving patient token

* Displays estimated wait times

* Patient lookup

* interface

## Installation & Setup

### Prerequisites

* Node.js 16.x or higher

* npm or yarn

### Installation

```bash

# Clone repository

git clone

cd queue

# Install dependencies

npm install

# Set up environment variables

cp.env.example.env.local

# Edit.env.local

# Run development server

npm run dev

```

## Project Structure

```

├── app/

│   ├── api/

│   │   ├── auth/

│   │   ├── queue/

│   │   └── stats/

│   ├── dashboard/

│   ├── display/

│   ├── signup/

│   ├── layout.jsx

│   └── page.jsx

├── components/

│   ├── loginscreen.jsx

│   ├── receptionscreen.jsx

│   ├── patientdisplayscreen.jsx

│   └── signupscreen.jsx

├── contexts/

│   ├── AuthContext.jsx

│   └── ToastContext.jsx

├── lib/

│   ├── api.js

│   ├── auth.js

│   ├── logger.js

│   ├── nedb.js

│   └── validation.js

├── data/

├── public/

├── styles/

└──...

```

## API Endpoints

### Authentication

* `POST /api/auth/

* `POST /api/auth/login`

### Queue Management

* `GET /api/queue`

* `POST /api/queue`

* `GET /api/queue/serving`

* `GET /api/queue/lookup?token=XXX`

* `POST /api/queue/call-next`

* `POST /api/queue/complete/[id]`

* `PUT /api/queue/[id]`

* `/queue/[id]`

### Statistics

* `GET /api/stats`

## Development

### Available Scripts

* `npm run dev`

* `npm run build`

* `npm run start`

* `npm run lint`

* `npm run test`

## Usage Guide

### For Reception Staff

1. Login

2. View dashboard

3. To add patient:

* Click "+ Add Patient"

* Enter name

* Click "Register Patient"

4. To call patient:

* Click "Call Next Patient"

5. To complete patient:

* Click "Complete"

6. To skip patient:

* Click "Skip"

7. To remove patient:

* Click delete

### For Patients

1. Receive

2. Watch display screen

4. Proceed to consultation room

## Security Considerations

### Implementation

* JWT-based authentication

* Input validation

### Recommended for Production

* Use environment variables

* Implement refresh token rotation

* Add rate limiting

* Use cookies

* Implement HTTPS

* Regular database backups

* CORS restrictions

## Contributing

1. Fork

2. Create feature branch

3. Commit

4. Push

5. Open Pull Request

## License

This project is licensed under the MIT License

## Acknowledgments

* Built with [Next.js](https://nextjs.org/)

* Icons from [Material Symbols](https://fonts.google.com/icons)

* Font: [Inter](https://fonts.google.com/specimen/Inter)

* Database: [NeDB](https://github.com/louischatriot/nedb)

* Validation: [Zod](https://zod.dev/)

*Queue Cure '26. Streamlining healthcare delivery one patient, at a time*