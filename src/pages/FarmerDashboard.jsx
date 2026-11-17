//```jsx
import React, { useState } from "react";
import "./FarmerDashboard.css";
import CropDetection from "../components/CropDetection.jsx";

function FarmerDashboard({ user, onLogout }) {
  const [latestResult, setLatestResult] = useState(null);

  const farmerName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    "Muhinzi";

  const handleDetectionComplete = (result) => {
    setLatestResult(result);
  };

  return (
    <div className="farmer-dashboard">

      {/* HEADER */}
      <header className="dashboard-header">
        <div className="brand-area">
          <div className="brand-icon">🌿</div>
          <div>
            <h1>Smart CropCare</h1>
            <p>Smart farming with Artificial Intelligence</p>
          </div>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          <span>↪</span> Sohoka
        </button>
      </header>

      <main className="dashboard-content">

        {/* WELCOME */}
        <section className="welcome-card">
          <div className="welcome-text">
            <span className="welcome-label">FARMER DASHBOARD</span>
            <h2>Muraho, {farmerName}! 👋</h2>
            <p>
              Ikaze muri Smart CropCare. Koresha AI kugira ngo
              umenye indwara z'ibihingwa byawe kandi ubone inama
              zagufasha kubirinda.
            </p>
          </div>

          <div className="welcome-illustration">🌱</div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="farmer-info">
          <div className="section-heading">
            <div>
              <span className="small-label">YOUR ACCOUNT</span>
              <h2>Amakuru ya konti yawe</h2>
            </div>
            <span className="account-status">● Active</span>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">👤</span>
              <div>
                <small>Izina</small>
                <strong>{farmerName}</strong>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📧</span>
              <div>
                <small>Email</small>
                <strong>{user?.email || "Nta yo"}</strong>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📱</span>
              <div>
                <small>Telefone</small>
                <strong>{user?.phone || "Nta yo"}</strong>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <small>Akarere</small>
                <strong>{user?.district || "Nta ko"}</strong>
              </div>
            </div>
          </div>
        </section>

        {/* AI DETECTION */}
        <section className="detection-section">
          <div className="section-heading detection-heading">
            <div>
              <span className="small-label">ARTIFICIAL INTELLIGENCE</span>
              <h2>AI Crop Disease Detection</h2>
              <p>
                Shyiramo ifoto y'igihingwa kugira ngo AI isuzume
                indwara ishobora kuba ifite.
              </p>
            </div>
            <div className="ai-badge">🤖 AI Powered</div>
          </div>

          <CropDetection
            onDetectionComplete={handleDetectionComplete}
          />
        </section>

        {/* LATEST RESULT */}
        {latestResult && (
          <section className="latest-result">
            <div className="result-title">
              <span>📊</span>
              <div>
                <small>AI ANALYSIS</small>
                <h2>Igisubizo giheruka</h2>
              </div>
            </div>

            <div className="latest-result-grid">
              <div>
                <small>Igihingwa</small>
                <strong>{latestResult.crop_name || "Ntabwo kizwi"}</strong>
              </div>

              <div>
                <small>Indwara</small>
                <strong>{latestResult.disease || "Ntabwo izwi"}</strong>
              </div>

              <div>
                <small>Confidence</small>
                <strong>{Number(latestResult.confidence || 0).toFixed(2)}%</strong>
              </div>
            </div>

            <div className="latest-recommendation">
              <strong>💡 Inama za AI</strong>
              <p>
                {latestResult.recommendation || "Nta nama yatanzwe."}
              </p>
            </div>
          </section>
        )}

        {/* FEATURES */}
        <section className="dashboard-features">
          <div className="section-heading">
            <div>
              <span className="small-label">SMART FARMING</span>
              <h2>Serivisi zawe</h2>
            </div>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Amateka y'ibizamini</h3>
              <p>
                Reba ibisubizo by'ibizamini wakoze mbere.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🌾</div>
              <h3>Inama ku bihingwa</h3>
              <p>
                Menya uburyo bwo kwita ku bihingwa no
                gukumira indwara.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Kurinda ibihingwa</h3>
              <p>
                Fata ingamba hakiri kare igihe hagaragaye
                ibimenyetso by'indwara.
              </p>
            </article>
          </div>
        </section>

      </main>

      <footer className="dashboard-footer">
        <p>© 2026 Smart CropCare | AI-Powered Agriculture</p>
      </footer>

    </div>
  );
}

export default FarmerDashboard;
//```