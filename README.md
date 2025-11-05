# Projektovanje Informacionih Sistema i Baze Podataka - Projekat

> 🌐 **Language / Jezik**: [🇷🇸 Srpski](./frontend/README.md) | [🇬🇧 English](./README.en.md)

Sistem za kreiranje i upravljanje formama - web aplikacija koja omogućava korisnicima da kreiraju, dele, popunjavaju i analiziraju forme sa različitim tipovima pitanja.

*Form creation and management system - a web application that enables users to create, share, fill out, and analyze forms with various question types.*

---

## 📋 Sadržaj / Table of Contents

- [Opis Projekta](#opis-projekta)
- [Funkcionalnosti](#funkcionalnosti)
- [Tehnologije](#tehnologije)
- [Instalacija i Pokretanje](#instalacija-i-pokretanje)
- [Struktura Projekta](#struktura-projekta)
- [Testiranje](#testiranje)
- [API Dokumentacija](#api-dokumentacija)
- [Autori](#autori)

## 📖 Opis Projekta

Aplikacija omogućava:
- Registraciju i autentifikaciju korisnika
- Kreiranje formi sa različitim tipovima pitanja
- Deljenje formi sa drugim korisnicima (javno/privatno)
- Saradnju na formama (viewer/editor uloge)
- Popunjavanje formi i pregled rezultata
- Administrativni panel za superadmina

## ✨ Funkcionalnosti

### Korisničke Funkcionalnosti
- **Autentifikacija**: Registracija, prijava sa JWT tokenom
- **Upravljanje Formama**: 
  - Kreiranje formi sa opisom
  - Podržani tipovi pitanja: single choice, multiple choice, short text, long text, number, numeric choice
  - Dodavanje slika u pitanja i opcije (Cloudinary integracija)
  - Obavezna/opciona pitanja
  - Zaključavanje formi
- **Deljenje i Saradnja**:
  - Javne/privatne forme
  - Dodavanje saradnika (viewer/editor)
  - Generisanje linkova za deljenje
- **Popunjavanje i Rezultati**:
  - Popunjavanje formi
  - Pregled odgovora i statistike

### Admin Funkcionalnosti
- Pregled svih korisnika
- Upravljanje korisničkim nalozima
- Pregled formi svih korisnika
- Brisanje korisnika i njihovih podataka

## 🛠 Tehnologije

### Backend
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM za rad sa bazom podataka
- **PostgreSQL** - relaciona baza podataka
- **Pydantic** - validacija podataka
- **JWT** - autentifikacija
- **Cloudinary** - skladištenje slika
- **Pytest** - testiranje

### Frontend
- **React 19** - JavaScript library
- **React Router** - routing
- **Axios** - HTTP klijent
- **JWT Decode** - dekodiranje tokena
- **CSS3** - stilizovanje

## 🚀 Instalacija i Pokretanje

### Preduslovi
- Python 3.8+
- Node.js 14+
- PostgreSQL
- Cloudinary nalog (za skladištenje slika)

### Backend Setup

1. Kreirajte virtuelno okruženje i instalirajte zavisnosti:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Na Windows
# source venv/bin/activate  # Na Linux/Mac
pip install -r requirements.txt
```

2. Kreirajte `.env` fajl u `backend` folderu:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=2880
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Pokrenite server:
```bash
cd backend
python -m uvicorn auth_api:app --reload
```

Backend će biti dostupan na `http://localhost:8000`

### Frontend Setup

1. Instalirajte zavisnosti:
```bash
cd frontend
npm install
```

2. Pokrenite aplikaciju:
```bash
npm start
```

Frontend će biti dostupan na `http://localhost:3000`

## 📁 Struktura Projekta

```
projektovanje-informacionih-sistema-i-baze-podataka-projekat/
│
├── backend/
│   ├── auth_api.py              # Glavni FastAPI aplikacija
│   ├── database.py              # Konfiguracija baze podataka
│   ├── models.py                # SQLAlchemy modeli
│   ├── schemas.py               # Pydantic šeme
│   ├── form.py                  # Forme endpoints
│   ├── cloudinary_utils.py      # Cloudinary integracija
│   ├── pytest.ini               # Pytest konfiguracija
│   └── tests/                   # Testovi
│       ├── conftest.py
│       ├── test_users_crud.py
│       ├── test_forms_crud.py
│       ├── test_answers.py
│       └── test_superadmin.py
│
└── frontend/
    ├── public/                  # Statički fajlovi
    └── src/
        ├── components/          # React komponente
        │   ├── FormBuilder.jsx
        │   ├── QuestionField.jsx
        │   ├── CollaboratorsPanel.jsx
        │   └── ...
        ├── pages/               # Stranice
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
        ├── services/            # API servisi
        │   └── api.js
        ├── utils/               # Utility funkcije
        └── styles/              # CSS stilovi
```

## 🧪 Testiranje

### Backend Testovi

Pokrenite testove korišćenjem pytest:

```bash
cd backend
pytest
```

Pokrivenost testova:
- `test_users_crud.py` - CRUD operacije za korisnike
- `test_forms_crud.py` - CRUD operacije za forme
- `test_answers.py` - Odgovori na forme
- `test_superadmin.py` - Admin funkcionalnosti

### Frontend Testovi

```bash
cd frontend
npm test
```

## 📚 API Dokumentacija

FastAPI automatski generiše interaktivnu API dokumentaciju:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Glavni Endpoints

#### Autentifikacija
- `POST /register` - Registracija korisnika
- `POST /token` - Prijava
- `GET /users/me` - Trenutni korisnik

#### Forme
- `GET /forms` - Lista svih formi
- `GET /forms/my` - Moje forme
- `GET /forms/public` - Javne forme
- `POST /forms` - Kreiranje forme
- `GET /forms/{id}` - Detalji forme
- `PUT /forms/{id}` - Ažuriranje forme
- `DELETE /forms/{id}` - Brisanje forme
- `POST /forms/{id}/lock` - Zaključavanje forme

#### Pitanja
- `POST /forms/{id}/questions` - Dodavanje pitanja
- `PUT /questions/{id}` - Ažuriranje pitanja
- `DELETE /questions/{id}` - Brisanje pitanja

#### Saradnici
- `POST /forms/{id}/collaborators` - Dodavanje saradnika
- `DELETE /forms/{id}/collaborators/{user_id}` - Uklanjanje saradnika

#### Odgovori
- `POST /forms/{id}/submit` - Slanje odgovora
- `GET /forms/{id}/answers` - Pregled odgovora

#### Admin
- `GET /admin/users` - Lista svih korisnika
- `DELETE /admin/users/{id}` - Brisanje korisnika
- `GET /admin/forms` - Sve forme

## 👥 Autori

Projekat iz kursa **Projektovanje Informacionih Sistema i Baze Podataka**

## 📄 Licenca

Ovaj projekat je kreiran u obrazovne svrhe.
