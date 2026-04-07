# Nature's Event - Disaster Monitor System
Designed specifically to address the severe flash flooding issues in Malaysia during the Monsoon (Timur Laut) seasons, this advanced full-stack disaster monitoring system provides hyper-localized early warnings.

Built with React (Vite) and FastAPI, the system leverages AI (Groq API using LLaMA models) not merely as chat wrappers, but as **Automated Triaging Agents**. By combining real-time meteorological telemetry, unstructured image analysis from panicking users, and geospatial logic, the system autonomously orchestrates context-aware emergency guidance and proximity-based push notifications.

## 🌟 Key Features

### 1. Interactive Real-Time Dashboard (Frontend)
- **Map View:** Interactive map integration using React Leaflet to visualize active incidents and spatial data.
- **Sensor Grid & Risk Gauges:** Real-time visualization of environmental metrics and automated risk level gauges.
- **Location Data Analytics:** Dynamic charting via Plotly.js for deep-diving into historical or forecast metrics.
- **Global AI News Feed:** Direct API integration with the **United Nations ReliefWeb API** to stream real-time, global disaster and humanitarian alerts directly to the dashboard alongside community events.

*(Recommendation for frontend developers: Insert GIF of the Interactive Dashboard mapping here)*
`[INSERT DASHBOARD UI GIF HERE]`

### 2. AI-Powered Emergency Services (Agentic Backend)
- **Hazard Risk Checker (`/api/risk`):** 
  - Acts as a rules-engine processing live meteorological telemetry (temperature, wind, humidity via WeatherAPI) against local thresholds (e.g. MET Malaysia FDRS) to autonomously grade risks. 
- **Retrieval-Augmented Generation (RAG) Chatbot (`/api/chat`):**
  - An emergency assistant grounded entirely in official Malaysian disaster protocols (NADMA). It reads from a localized `knowledge_base.txt` to eliminate hallucinations. 
  - **Live Sensor Fusion:** If a user asks about a specific location, the Chatbot intercepts the query, pulls real-time weather telemetry for that specific city via API, and injects the live radar data into its neural prompt to give accurate, hyper-localized safety verdicts.
  - **Auto-Bilingual:** Flawlessly mirrors the user's language (English or Bahasa Melayu) dynamically without forcing translations.
- **Hazard Image Triaging (`/api/report`):** 
  - LLaMA 3.2 Vision acts as an automated triaging agent parsing unstructured image data from panicking users to instantaneously categorize hazard types, extract severity logic, and assign a calculated **Confidence Interval (%)**.
- **Autonomous Agentic Workflow (Overpass API Integration):**
  - If the Vision model detects a "High" severity hazard, it triggers a multi-step agentic loop. The backend autonomously queries the OpenStreetMap Overpass API for the nearest hospital or police station using the user's coordinates, and uses LLaMA to draft a hyper-localized escape route instruction.

### 3. Enterprise-Grade System Reliability
- **The Intelligence Failsafe:** Before pushing alerts, the system validates the AI's confidence score. If the Vision AI is less than 70% confident, the backend explicitly downgrades the emergency severity, acting as a crucial fail-safe against AI hallucinations and preventing false 10km warning alarms.
- **Resilient AI Orchestration:** All external Groq/LLaMA calls are wrapped in Exponential Backoff Retry Loops, guaranteeing backend stability and self-healing behaviors during live network drops.
- **Professional Observability:** System operations use standard Python logging modules rather than standard outputs for clear, timestamped production observability.

### 4. Real-Time Proximity Alerts & Firebase Integration
- **Community Incident Reporting:** If the Image Triaging detects a "High" severity hazard, the backend calculates the distance to all registered users.
- **Smart Push Notifications (FCM):** Using Firebase Cloud Messaging, the system instantly pushes the Agent-generated evacuation route to the mobile devices of users living within a 10km danger zone.
- **Authentication & Database:** Firebase Authentication handles secure user sign-ups and logins, while Firestore persists user profiles, locations, and hazard reports.

*(Recommendation for frontend developers: Insert GIF of Smart Push Notification triggering on mobile/desktop)*
`[INSERT PUSH NOTIFICATION ALERT GIF HERE]`

## 🏗️ System Architecture

- **Frontend:** React 19, Vite, React-Leaflet, Plotly.js, Firebase Client SDK.
- **Backend:** Python, FastAPI, Groq Async Client, WeatherAPI, Firebase Admin SDK.
- **AI Models:** `llama-3.3-70b-versatile` (Text & Chat), `llama-3.2-11b-vision-preview` (Vision).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Firebase Project (with Firestore, Authentication, and Cloud Messaging enabled)
- API Keys: [Groq API Key](https://console.groq.com/keys) and [WeatherAPI Key](https://www.weatherapi.com/)

### 1. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements.txt
```
Create a `.env` file in the `backend` directory:
```env
GROQ_API_KEY=your_groq_api_key
WEATHER_API_KEY=your_weather_api_key
```
Ensure your Firebase Admin service account key is saved as `firebase-service-account.json` in the `backend` directory.

Run the development server:
```bash
fastapi dev main.py
```
*(The API will run at `http://localhost:8000`)*

### 2. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
*(The dashboard will be available at `http://localhost:5173`)*

### 3. Production Deployment (Vercel + Render)
For hackathon deployment:
1. **Backend (Render):** Deploy the FastAPI backend on Render.com as a Web Service. Add your `.env` variables and upload the `firebase-service-account.json` file securely via Render's "Secret Files" functionality.
2. **Frontend (Vercel):** Deploy the Vite React app on Vercel. In the Vercel dashboard, add an Environment Variable named `VITE_API_BASE_URL` pointing strictly to your live Render backend URL.

## 💡 How It Works
1. **User Flow:** A user registers via the frontend, providing their home coordinates. This data is securely stored in Firestore.
2. **Monitoring:** The interactive dashboard continuously visualizes data. The user can interact with the Chatbot or check specific Location Risks.
3. **Reporting & Alerting:** When a disaster strikes, any user can upload an image outlining the current situation. The Vision AI instantly categorizes the severity. If critical, the FastAPI server calculates the distance between the report and all registered home locations, dispatching instant life-saving notifications to those in the danger zone via Firebase Cloud Messaging.
