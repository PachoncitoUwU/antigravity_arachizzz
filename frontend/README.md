# Arachiz Project

## Project Summary
Arachiz is an educational system inspired by Google Classroom, focused on academic attendance management. The platform features user authentication with two roles: **Instructor** and **Aprendiz** (Learner). 

Key features include:
- **Authentication**: Custom login and registration system.
- **Role-based Dashboards**: Different quick-actions and views based on the user's role.
- **Fichas and Materias**: Instructors can create academic groups (Fichas) and associate subjects (Materias). Learners can join a Ficha using a unique code.
- **Asistencias (Attendance)**: Instructors can initiate a class session, and learners can mark their attendance.
- **Excusas (Excuses)**: Learners can submit medical or personal excuses for absences, which can then be reviewed and approved/rejected by instructors.

## Step by Step Setup Instructions

To run the full project locally, you need to start both the backend server and the frontend application.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- Git (optional, for cloning).

### 2. Start the Backend
1. Open a terminal.
2. Navigate to the `backend` directory:
   ```bash
   cd c:/Users/beatr/OneDrive/Escritorio/antigratii_arachiz/backend
   ```
3. Install dependencies (if not done yet):
   ```bash
   npm install
   ```
4. Start the Express server:
   ```bash
   node server.js
   ```
   > The server will start on `http://localhost:3000`. Leave this terminal running.

### 3. Start the Frontend
1. Open a **new** terminal window.
2. Navigate to the `frontend` directory:
   ```bash
   cd c:/Users/beatr/OneDrive/Escritorio/antigratii_arachiz/frontend
   ```
3. Install React dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > The terminal will display a local URL (usually `http://localhost:5173`). Open this link in your browser.

---
You are all set! You can now register a new instructor, create a Ficha, and invite learners.
