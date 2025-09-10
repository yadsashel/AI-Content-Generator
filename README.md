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

## 🚀 Deployment (Render + Netlify)

### Backend Deployment (Render)

1. Go to [Render](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repo (or upload your backend folder).
3. Select the `backend/` directory as the root.
4. Configure:
   - **Environment**: Python 3.x
   - **Build Command**:
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     gunicorn main:app
     ```
     > Replace `main:app` with your FastAPI entrypoint if different.
5. Add your environment variables in the **Render Dashboard** (`.env` values).
6. Deploy 🎉  
   Render will give you a backend URL like:
https://your-backend.onrender.com

---

### Frontend Deployment (Netlify)

1. Go to [Netlify](https://netlify.com) and create a **New Site from Git**.
2. Select the repo and choose the `frontend/` folder as your project root.
3. Configure build settings:
- **Build Command**:
  ```bash
  npm run build
  ```
- **Publish Directory**:
  ```
  dist
  ```
  > If you’re using Vite. If Create React App, use `build` instead.
4. Add your **backend API URL** from Render into Netlify Environment Variables, e.g.:
VITE_API_URL=https://your-backend.onrender.com



5. Deploy 🎉  
Netlify will give you a frontend URL like:
https://your-frontend.netlify.app

---

✅ Now your frontend (Netlify) will talk to your backend (Render).


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