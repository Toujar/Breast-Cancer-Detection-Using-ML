# 🩺 AI-Powered Breast Cancer Detection System

A machine learning platform for breast cancer detection with 94.6% accuracy, featuring role-based dashboards for patients, doctors, and administrators.

## 🌟 Features

- **94.6% Accuracy** - Advanced ML models (XGBoost + CNN)
- **Dual Analysis** - Image and tabular data processing
- **Role-based Access** - Patient, Doctor, and Admin dashboards
- **Appointment System** - AI-powered doctor recommendations
- **Real-time Processing** - Instant predictions with confidence scores

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk Auth
- **ML**: XGBoost, Scikit-learn, NumPy, Pandas

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| Accuracy | 94.6% |
| Precision | 95.0% |
| Recall | 95.0% |
| F1-Score | 95.0% |

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd breast-cancer-detection
   npm install
   ```

2. **Setup Python Environment**
   ```bash
   python -m venv project/.venv
   source project/.venv/bin/activate  # Linux/Mac
   # OR project\.venv\Scripts\activate.bat  # Windows
   pip install -r requirements.txt
   ```

3. **Environment Variables**
   ```bash
   cp .env.example .env.local
   # Add your MongoDB URI and Clerk keys
   ```

4. **Run Application**
   ```bash
   npm run dev  # Frontend (port 3000)
   cd project && python main.py  # Backend (port 8000)
   ```

## 👥 Team

- **Swati** - Lead Data Scientist
- **Toujar** - Full-Stack Developer  
- **SudhRani** - Medical Advisor

---

**⚠️ Medical Disclaimer**: This system assists medical professionals and should not replace professional medical advice.