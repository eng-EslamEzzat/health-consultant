<h1 align="center">AI Health Consultant API</h1>

<div align="center">
  <p><strong>Intelligent AI-powered Health Consultations Platform</strong></p>
  
  [![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
  [![Django](https://img.shields.io/badge/Django-5.2-092E20.svg?style=for-the-badge&logo=django&logoColor=white)](https://djangoproject.com/)
  [![DRF](https://img.shields.io/badge/DRF-3.15-red.svg?style=for-the-badge&logo=django&logoColor=white)](https://www.django-rest-framework.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
  [![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
  [![OpenAI](https://img.shields.io/badge/OpenAI-Powered-412991.svg?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
</div>

<hr/>

## 📖 Overview

The **Health Consultant API** is a robust, scalable backend system designed to provide intelligent health consultations. By leveraging **Django REST Framework** and the **OpenAI API**, it intelligently processes user health inquiries, manages consultation lifecycles, and maintains an efficient, containerized PostgreSQL database backend. 

## ✨ Key Features

- **AI-Driven Consultations**: Integrates with OpenAI models to process user symptoms and inquiries and generate professional insights.
- **RESTful API Architecture**: Built with Django REST Framework (DRF) following best practices for robust API design.
- **Database Reliability**: Uses PostgreSQL for secure and scalable structured data storage.
- **Containerized Environment**: Full Docker and Docker Compose support, allowing for out-of-the-box development and production readiness.
- **Secure Configuration**: Uses environment variables (`python-decouple`) to manage secrets, API keys, and configurations.
- **Production-Ready**: Configured with `Gunicorn` and `Whitenoise` for optimized static file serving and reliable WSGI processing.

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Framework** | Django 5.2.x, Django REST Framework 3.15.x |
| **Database** | PostgreSQL 16 (psycopg 3.x) |
| **AI Integration** | OpenAI Python SDK |
| **Infrastructure** | Docker, Docker Compose |
| **Server** | Gunicorn, Whitenoise |

## ⚙️ Prerequisites

To run this project, make sure you have the following installed on your machine:

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- *Optional (for local development without Docker)*: Python 3.11+ & PostgreSQL

## 🚀 Environment Setup

The application relies on environment variables for database connections, Django settings, and the OpenAI API. 

1. Create a `.env` file inside the `backend/` directory by copying the example file:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Update the `.env` file with your specific credentials, particularly your `OPENAI_API_KEY` and database configuration.

## 🐳 Quick Start (Docker)

The recommended way to run the application is using Docker. It will automatically build the web service and provision the PostgreSQL database.

1. **Build and start the containers** in detached mode:
   ```bash
   docker compose up -d --build
   ```
2. The API will now be accessible at `http://localhost:8000`.

*Note: The first time you bring up the containers, `entrypoint.sh` will automatically handle database migrations and static file collection.*

## 💻 Local Development (Without Docker)

If you prefer to run the application locally without Docker:

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Apply database migrations**:
   ```bash
   python manage.py migrate
   ```
5. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

## 🏗️ Project Structure

```text
health-consultant/
├── backend/
│   ├── core/              # Main Django project settings and routing
│   ├── consultations/     # App handling AI consultation logic & API endpoints
│   ├── Dockerfile         # Docker definition for the Django backend
│   ├── entrypoint.sh      # Docker entrypoint script (migrations, setup)
│   ├── manage.py          # Django management script
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml     # Multi-container orchestration (Web + DB)
└── README.md              # Project documentation
```
