import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import IndustryApp from "./IndustryApp";
import WorkerApp from "./WorkerApp";
import { WorkerLogin, WorkerRegister } from "./WorkerAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

const PortalSelection = () => (
  <div className="app">
    <div className="portal-selection-container">
      <div className="portal-header">
        <div className="portal-logo-glow">♻️</div>
        <h1 className="hero-title">
          PyroCycle <span className="gradient-text">AI</span>
        </h1>
        <p className="hero-subtitle">
          AI Plastic Sourcing & Pyrolysis Yield Intelligence Platform
        </p>
      </div>

      {/* Clean Dual Portal Cards */}
      <div className="portal-cards-grid">
        {/* Worker Portal */}
        <Link to="/worker/login" className="portal-card-premium worker-card-theme">
          <div className="card-top-pill">FOR COLLECTORS & HUBS</div>
          <div className="card-icon-wrap">📸</div>
          <h2 className="card-title">Waste Collector Portal</h2>
          <p className="card-desc">
            Scan plastic waste with camera vision, identify polymer types, and book verified pickups with instant digital payout.
          </p>
          <div className="card-action-bar">
            <span>Enter Collector App</span>
            <span className="arrow-glow">→</span>
          </div>
        </Link>

        {/* Industry Portal */}
        <Link to="/industry" className="portal-card-premium industry-card-theme">
          <div className="card-top-pill industry-pill">FOR PYROLYSIS PLANTS</div>
          <div className="card-icon-wrap">⚡</div>
          <h2 className="card-title">Plant Pyrolysis Terminal</h2>
          <p className="card-desc">
            Simulate catalytic & thermal cracking with machine learning to predict liquid fuel, gas, and char yields before batch feeding.
          </p>
          <div className="card-action-bar">
            <span>Launch Plant Terminal</span>
            <span className="arrow-glow">→</span>
          </div>
        </Link>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<PortalSelection />} />
      <Route path="/industry/*" element={<IndustryApp />} />
      <Route path="/worker/login" element={<WorkerLogin />} />
      <Route path="/worker/register" element={<WorkerRegister />} />
      <Route element={<ProtectedRoute allowedRole="worker" />}>
        <Route path="/worker/*" element={<WorkerApp />} />
      </Route>
    </Routes>
  );
}

export default App;