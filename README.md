# MediWise AI: Intelligent Diagnosis System

MediWise AI is a modern, full-stack, deep learning-powered medical diagnostic application. It provides two core intelligent features:
1. **Symptom Checker**: A feedforward Artificial Neural Network (ANN) that processes clinical symptoms and maps them to a highly accurate prognosis from a database of medical conditions.
2. **Skin Lesion Classification**: A convolutional neural network (CNN) leveraging the MobileNetV2 architecture trained on the HAM10000 skin cancer dataset to diagnose dermoscopy scans for melanoma, basal cell carcinoma, and other lesions.

---

## 🛠️ Project Architecture

```
                      +-----------------------------+
                      |     React (Vite) UI         |
                      |   (Port 5173 / Vercel CDN)  |
                      +--------------+--------------+
                                     |
                         JSON / FormData HTTP POST
                                     |
                                     v
                      +-----------------------------+
                      |     FastAPI Backend         |
                      |   (Port 8001 / Render OS)   |
                      +-------+--------------+------+
                              |              |
                    (ANN Model Loaded)  (CNN Model Loaded)
                              |              |
                              v              v
                      +---------------+ +----+--------+
                      | Symptom Model | | Skin Cancer |
                      |    (.keras)   | | Model (.h5) |
                      +---------------+ +-------------+
```

- **Frontend**: Built using React, Vite, and Lucide React icons. Features modern glassmorphic styling, responsive layout, input validation, and asynchronous API integration.
- **Backend**: Built using FastAPI, Pydantic, and Uvicorn. Models are cached in RAM on startup to deliver inference results in sub-100ms.
- **Database**: Integrated with MongoDB for asynchronous medical event logging (equipped with offline fallback resilience).

---

## 📦 Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (version 18+ recommended)
*   [Python](https://www.python.org/) (version 3.10 to 3.13)
*   [PIP](https://pip.pypa.io/en/stable/) (Python package manager)

---

## 🚀 Getting Started

### 1. Backend Setup (FastAPI + Deep Learning)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python dependencies:
   ```bash
   pip install fastapi uvicorn tensorflow pillow pandas motor pydantic python-multipart python-docx
   ```
3. Run the FastAPI development server:
   ```bash
   python -m uvicorn main:app --port 8001 --reload
   ```
   *The backend will boot up and load the machine learning models. You will see `Uvicorn running on http://127.0.0.1:8001` once startup is complete.*

---

### 2. Frontend Setup (React + Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node packages:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will boot on `http://localhost:5173`.*

---

## 🧪 Testing and Input Validation

The system has built-in guards to handle incomplete, invalid, and offline states:
*   **Blank Inputs**: The Symptom Checker requires at least one symptom, showing a friendly warning box instead of crashing.
*   **File Type Guards**: The Skin Lesion analyzer restricts file uploads to valid image types (PNG, JPG) and enforces a 10MB file size limit.
*   **Server Offline Resiliency**: If the FastAPI server is shut down, the UI gracefully informs the user rather than freezing on a loader.
*   **MongoDB Offline Fallback**: If the local database is unreachable, the backend switches to console-logging diagnosis reports to prevent API request hanging.

---

## 📄 License
This project is developed as a Capstone Project for the Intelligent Diagnosis System program.
