# AI Content Generator

A modern AI-powered content generation platform built with **React (frontend)**, **FastAPI (backend)**, and **Supabase/PostgreSQL (database)**.  
Deployed seamlessly on **Fly.io** for production-ready performance.  

---

## 📖 Overview

The AI Content Generator allows users to generate high-quality, structured content based on prompts.  
It combines a **clean React UI** with a **FastAPI backend** powered by AI models, storing user data in **Supabase (Postgres)**.  

This project was built to showcase a **full-stack AI workflow**:  
- 🔹 Frontend → React + Vite (fast, modern, responsive UI).  
- 🔹 Backend → FastAPI (REST API with async endpoints).  
- 🔹 Database → Supabase (PostgreSQL).  
- 🔹 Deployment → Fly.io (scalable cloud hosting).  

---

## ✨ Features

- ✅ Generate AI-powered content instantly  
- ✅ Modern & responsive React frontend  
- ✅ FastAPI backend with async routes  
- ✅ Supabase integration (user data & content storage)  
- ✅ Authentication-ready structure  
- ✅ Fully deployed on **Fly.io**  

---

## 🛠️ Tech Stack

- **Frontend** → React + Vite + TailwindCSS  
- **Backend** → FastAPI + Python  
- **Database** → Supabase (PostgreSQL)  
- **Deployment** → Fly.io  
- **Version Control** → Git + GitHub  

---

## ⚡ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/ai-content-generator.git
cd ai-content-generator
````

### 2️⃣ Backend Setup (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

* Configure `.env` with your **Supabase URL + API key**.
* Ensure PostgreSQL tables are initialized.

### 3️⃣ Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Environment Variables

Create a `.env` file in both `frontend/` and `backend/` with:

```
# Frontend
VITE_API_URL=http://localhost:8000

# Backend
DATABASE_URL=your_supabase_postgres_url
SUPABASE_KEY=your_supabase_api_key
```

---

## 🚀 Deployment (Fly.io)

### Deploy Backend

```bash
cd backend
fly launch
fly deploy
```

### Deploy Frontend

```bash
cd frontend
fly launch
fly deploy
```

---

## 🔮 Future Improvements

* Add authentication (Supabase Auth or JWT)
* Export generated content (PDF/CSV)
* Dashboard with analytics
* Multi-language support

---

## 📜 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

Built with ❤️ by **Yazide Salhi**
👉 Portfolio: https://yadsashel.github.io/My-Portfolio/
👉 LinkedIn: https://www.linkedin.com/in/elyazid-salhi-8a57a42b4/