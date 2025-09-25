# EventHive - University Event Management Platform

## Overview
EventHive is a comprehensive event management platform designed specifically for universities. It provides a centralized system for end-to-end event management including creation, eligibility-based registrations, ticketing, volunteer allocation, notifications, media sharing, and automated reports.

## Features
- **Unified Event Management**: Complete lifecycle from creation to reporting
- **Role-based Access**: Admin, Organization, and User (Volunteer/Participant) roles
- **Eligibility Filters**: Department/year/program based event access
- **Volunteer Management**: Registration and role allocation system
- **QR-based Ticketing**: Secure access validation
- **Real-time Notifications**: Email and in-app notifications
- **Media Management**: Post-event photo and document sharing
- **Analytics & Reports**: Comprehensive event analytics

## Tech Stack
- **Frontend**: React.js + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Authentication**: JWT + OTP Verification
- **Email Service**: Nodemailer
- **File Upload**: Multer
- **Styling**: Tailwind CSS with corporate theme

## Project Structure
```
eventhive/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Utility functions
│   │   ├── context/       # React context
│   │   └── assets/        # Static assets
├── server/                # Node.js backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── uploads/          # File uploads
└── docs/                 # Documentation
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Quick Start
1. Clone the repository
2. Install dependencies: `npm run install-all`
3. Set up environment variables (see .env.example)
4. Start development servers: `npm run dev`

### Environment Variables
Create `.env` files in both client and server directories with required configurations.

## User Roles & Permissions

### Admin
- Manage organizations and users
- Oversee all events
- Send global notifications
- Generate system reports

### Organization
- Create and manage events
- Handle participant/volunteer registrations
- Send event-specific notifications
- Upload event media

### Users (Volunteers/Participants)
- Register for events
- Apply for volunteer positions
- Receive notifications
- Access event materials

## API Documentation
Detailed API documentation will be available at `/api/docs` when the server is running.

## Contributing
Please read our contributing guidelines before submitting pull requests.

## License
This project is licensed under the MIT License.
