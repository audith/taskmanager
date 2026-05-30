This is Taskmanager 
with that functions:
1.Built REST API using FastAPI
2.Used PostgreSQL with SQLAlchemy ORM
3.Implemented JWT Authentication
4.Password hashing with bcrypt
5.Protected routes using OAuth2
6.CRUD operations for task management

How to start this project:

git clone https://github.com/audith/taskmanager.git
cd taskmanager

# Task Manager

A full-stack Task Manager application built with FastAPI and React.

## Features

- User Registration
- User Login
- Add Tasks
- Update Tasks
- Delete Tasks
- Dashboard

## Project Structure

taskmanager/
│
├── app/           # FastAPI Backend
├── frontend/      # React Frontend
└── README.md

## Requirements

- Python 3.10+
- Node.js 18+
- npm
- Git

## Clone Repository

```bash
git clone https://github.com/audith/taskmanager.git
cd taskmanager
```

## Backend Setup

Create virtual environment:

```bash
python -m venv venv
```

Activate virtual environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux/Mac

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI server:

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install packages:

```bash
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

Create `.env` file:

```env
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

## Running the Project

1. Start FastAPI backend
2. Start React frontend
3. Open:

```text
http://localhost:5173
```

## API Documentation

```text
http://localhost:8000/docs
```
