# Information Systems Design and Database - Project

> 🌐 [Serbian version / Srpska verzija](./README.md)

Form creation and management system - a web application that enables users to create, share, fill out, and analyze forms with various question types.

## 📋 Table of Contents

- [Project Description](#project-description)
- [Features](#features)
- [Technologies](#technologies)
- [Installation and Setup](#installation-and-setup)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Authors](#authors)

## 📖 Project Description

The application enables:
- User registration and authentication
- Creating forms with different question types
- Sharing forms with other users (public/private)
- Collaboration on forms (viewer/editor roles)
- Filling out forms and viewing results
- Admin panel for superadmin

## ✨ Features

### User Features
- **Authentication**: Registration, login with JWT token
- **Form Management**: 
  - Creating forms with descriptions
  - Supported question types: single choice, multiple choice, short text, long text, number, numeric choice
  - Adding images to questions and options (Cloudinary integration)
  - Required/optional questions
  - Locking forms
- **Sharing and Collaboration**:
  - Public/private forms
  - Adding collaborators (viewer/editor)
  - Generating share links
- **Filling and Results**:
  - Filling out forms
  - Viewing answers and statistics

### Admin Features
- View all users
- Manage user accounts
- View all users' forms
- Delete users and their data

## 🛠 Technologies

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM for database operations
- **PostgreSQL** - relational database
- **Pydantic** - data validation
- **JWT** - authentication
- **Cloudinary** - image storage
- **Pytest** - testing

### Frontend
- **React 19** - JavaScript library
- **React Router** - routing
- **Axios** - HTTP client
- **JWT Decode** - token decoding
- **CSS3** - styling

## 🚀 Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- PostgreSQL
- Cloudinary account (for image storage)

### Backend Setup

1. Create a virtual environment and install dependencies:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac
pip install -r requirements.txt
```

2. Create a `.env` file in the `backend` folder:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=2880
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Run the server:
```bash
cd backend
python -m uvicorn auth_api:app --reload
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run the application:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
projektovanje-informacionih-sistema-i-baze-podataka-projekat/
│
├── backend/
│   ├── auth_api.py              # Main FastAPI application
│   ├── database.py              # Database configuration
│   ├── models.py                # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   ├── form.py                  # Forms endpoints
│   ├── cloudinary_utils.py      # Cloudinary integration
│   ├── pytest.ini               # Pytest configuration
│   └── tests/                   # Tests
│       ├── conftest.py
│       ├── test_users_crud.py
│       ├── test_forms_crud.py
│       ├── test_answers.py
│       └── test_superadmin.py
│
└── frontend/
    ├── public/                  # Static files
    └── src/
        ├── components/          # React components
        │   ├── FormBuilder.jsx
        │   ├── QuestionField.jsx
        │   ├── CollaboratorsPanel.jsx
        │   └── ...
        ├── pages/               # Pages
        │   ├── LoginPage.js
        │   ├── RegisterPage.js
        │   ├── DashboardPage.js
        │   ├── CreateFormPage.jsx
        │   ├── EditFormPage.jsx
        │   ├── FillFormPage.jsx
        │   ├── ViewResultsPage.jsx
        │   ├── MyFormsPage.jsx
        │   ├── PublicFormsPage.jsx
        │   └── Admin...
        ├── services/            # API services
        │   └── api.js
        ├── utils/               # Utility functions
        └── styles/              # CSS styles
```

## 🧪 Testing

### Backend Tests

Run tests using pytest:

```bash
cd backend
pytest
```

Test coverage:
- `test_users_crud.py` - CRUD operations for users
- `test_forms_crud.py` - CRUD operations for forms
- `test_answers.py` - Form answers
- `test_superadmin.py` - Admin functionalities

### Frontend Tests

```bash
cd frontend
npm test
```

## 📚 API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Main Endpoints

#### Authentication
- `POST /register` - User registration
- `POST /token` - Login
- `GET /users/me` - Current user

#### Forms
- `GET /forms` - List all forms
- `GET /forms/my` - My forms
- `GET /forms/public` - Public forms
- `POST /forms` - Create form
- `GET /forms/{id}` - Form details
- `PUT /forms/{id}` - Update form
- `DELETE /forms/{id}` - Delete form
- `POST /forms/{id}/lock` - Lock form

#### Questions
- `POST /forms/{id}/questions` - Add question
- `PUT /questions/{id}` - Update question
- `DELETE /questions/{id}` - Delete question

#### Collaborators
- `POST /forms/{id}/collaborators` - Add collaborator
- `DELETE /forms/{id}/collaborators/{user_id}` - Remove collaborator

#### Answers
- `POST /forms/{id}/submit` - Submit answers
- `GET /forms/{id}/answers` - View answers

#### Admin
- `GET /admin/users` - List all users
- `DELETE /admin/users/{id}` - Delete user
- `GET /admin/forms` - All forms

## 👥 Authors

Project for the course **Information Systems Design and Database**

## 📄 License

This project was created for educational purposes.
