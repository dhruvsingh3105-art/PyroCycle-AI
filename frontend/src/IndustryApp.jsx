import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { apiFetch } from "./utils/api";
import "./App.css";

function IndustryApp() {
  const { user, logout } = useContext(AuthContext);
  const [plastic, setPlastic] = useState("HDPE");

  const [hdpe, setHdpe] = useState(100);
  const [ldpe, setLdpe] = useState(0);
  const [pp, setPp] = useState(0);
  const [ps, setPs] = useState(0);
  const [pvc, setPvc] = useState(0);
  const [pet, setPet] = useState(0);

  const [temperature, setTemperature] = useState(450);
  const [heatingRate, setHeatingRate] = useState(10);
  const [particleSize, setParticleSize] = useState(1);
  const [feedSize, setFeedSize] = useState(10);

  const [catalyst, setCatalyst] = useState("None");
  const [reactorType, setReactorType] = useState("Fixed Bed");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [selectedPickupRequest, setSelectedPickupRequest] = useState(null);
  const [verifiedWeight, setVerifiedWeight] = useState("");
  const [batchStatus, setBatchStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBatches = () => {
    localStorage.removeItem("pyrocyclePickupRequests");
    localStorage.removeItem("pyrocycleBatches");

    apiFetch("/api/batches")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.batches && data.batches.length > 0) {
          const dbRequests = data.batches.map((b) => ({
            id: b.id,
            batchId: b.batch_code,
            workerName: b.worker_name || "Worker",
            workerLocation: b.worker_location || "Local Zone",
            buyerName: b.buyer_name || "Direct Recycler",
            weight: b.est_weight_kg || 0,
            actualWeight: b.actual_weight_kg,
            composition: b.composition || {},
            workerAmount: b.final_payout || b.est_value || 0,
            rawStatus: (b.status || "SUBMITTED").toUpperCase(),
            status: (b.status || "pending").toLowerCase() === "submitted" ? "pending" : (b.status || "pending").toLowerCase(),
            oilYield: b.oil_yield,
            gasYield: b.gas_yield,
            createdAt: b.created_at || new Date().toISOString(),
          }));
          setPickupRequests(dbRequests);
        } else {
          setPickupRequests([]);
        }
      })
      .catch(() => setPickupRequests([]));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleSelectPickupRequest = (request) => {
    setSelectedPickupRequest(request);
    setVerifiedWeight(request.actualWeight || request.weight || 0);
    setBatchStatus((request.rawStatus || request.status || "pending").toLowerCase());

    setHdpe(request.composition.HDPE || 0);
    setLdpe(request.composition.LDPE || 0);
    setPp(request.composition.PP || 0);
    setPs(request.composition.PS || 0);
    setPvc(request.composition.PVC || 0);
    setPet(request.composition.PET || 0);

    setTemperature(request.temperature || 450);
    setHeatingRate(request.heatingRate || 10);
    setParticleSize(request.particleSize || 1);
    setFeedSize(request.feedSize || 10);
    setCatalyst(request.catalyst || "None");
    setReactorType(request.reactorType || "Fixed Bed");

    setResult(null);
  };

  const handleVerifyBatch = async () => {
    if (!selectedPickupRequest) return;
    setActionLoading(true);
    try {
      const batchId = selectedPickupRequest.id;
      const res = await apiFetch(`/api/batches/${batchId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "VERIFIED",
          actual_weight_kg: Number(verifiedWeight) || Number(selectedPickupRequest.weight)
        })
      });
      const data = await res.json();
      if (data.success) {
        setBatchStatus("verified");
        fetchBatches();
        alert("Batch verified! Feedstock weight confirmed. You can now run the Pyrolysis yield prediction.");
      }
    } catch (err) {
      console.error(err);
      alert("Error verifying batch.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkProcessed = async () => {
    if (!selectedPickupRequest || !result) return;
    setActionLoading(true);
    try {
      const batchId = selectedPickupRequest.id;
      const res = await apiFetch(`/api/batches/${batchId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "PROCESSED",
          oil_yield: result.oil,
          gas_yield: result.gas,
          wax_yield: result.wax,
          char_yield: result.char
        })
      });
      const data = await res.json();
      if (data.success) {
        setBatchStatus("processed");
        fetchBatches();
        alert("Pyrolysis yields recorded successfully! Status updated to PROCESSED.");
      }
    } catch (err) {
      console.error(err);
      alert("Error recording pyrolysis results.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSettleBatch = async () => {
    if (!selectedPickupRequest) return;
    setActionLoading(true);
    try {
      const batchId = selectedPickupRequest.id;
      const payout = selectedPickupRequest.workerAmount || 0;
      const res = await apiFetch(`/api/batches/${batchId}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "SETTLED",
          settlement_status: "SETTLED",
          final_payout: payout
        })
      });
      const data = await res.json();
      if (data.success) {
        setBatchStatus("settled");
        fetchBatches();
        alert(`Payment of ₹${payout} marked as SETTLED to worker! Batch closed.`);
      }
    } catch (err) {
      console.error(err);
      alert("Error settling batch payment.");
    } finally {
      setActionLoading(false);
    }
  };

  // Change composition automatically when plastic type changes
  const handlePlasticChange = (value) => {
    setPlastic(value);

    setHdpe(value === "HDPE" ? 100 : 0);
    setLdpe(value === "LDPE" ? 100 : 0);
    setPp(value === "PP" ? 100 : 0);
    setPs(value === "PS" ? 100 : 0);
    setPvc(value === "PVC" ? 100 : 0);
    setPet(value === "PET" ? 100 : 0);
  };

  const predict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await apiFetch(
        "/predict",
        {
          method: "POST",
          body: JSON.stringify({
            HDPE_wt_percent: Number(hdpe),
            LDPE_wt_percent: Number(ldpe),
            PP_wt_percent: Number(pp),
            PS_wt_percent: Number(ps),
            PVC_wt_percent: Number(pvc),
            PET_wt_percent: Number(pet),

            Temperature_C: Number(temperature),
            Heating_Rate_C_per_min: Number(heatingRate),
            Particle_Size_mm: Number(particleSize),
            Feed_Size_g: Number(feedSize),

            Catalyst: catalyst,
            Reactor_Type: reactorType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to connect to the AI backend. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="app">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "10px 20px" }}>
        <Link to="/" className="portal-switch">
          ← Switch Portal
        </Link>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", background: "rgba(0, 255, 135, 0.08)", border: "1px solid rgba(0, 255, 135, 0.25)", color: "#00ff87", padding: "4px 10px", borderRadius: "12px" }}>
              👤 {user.name || user.email} ({user.role})
            </span>
            <button
              onClick={() => logout()}
              style={{
                background: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: "600"
              }}
              title="Sign Out"
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Industry Portal (Plant Operations)
          </div>
        )}
      </div>
      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <span className="brand-icon">♻</span>
          <span>
            PyroCycle <strong>AI</strong>
          </span>
        </div>

        <p>AI-powered plastic waste resource recovery</p>

        <div className="status-row">
          <span className="status-pill">
            <span className="status-dot"></span>
            AI ENGINE ONLINE
          </span>

          <span className="status-pill">
            325 LITERATURE RECORDS
          </span>
        </div>
      </header>

      {/* CENTERED CONTENT */}
      <main className="page-container">

        <div className="section-label">
          AI-POWERED PYROLYSIS INTELLIGENCE
        </div>

        <div className="dashboard-grid">

          {/* LEFT SIDEBAR */}
          <aside className="sidebar left-sidebar">

            <div className="side-card intro-card">
              <div className="large-icon">♻</div>

              <h3>Waste → Resource</h3>

              <p>
                Transform plastic waste into valuable energy products
                using AI-assisted pyrolysis prediction.
              </p>
            </div>

            <div className="side-card">

              <div className="card-label">
                <span>01</span>
                MATERIAL INPUT
              </div>

              <div className="material-list">

                <div
                  className={`material ${
                    plastic === "HDPE" ? "active" : ""
                  }`}
                  onClick={() => handlePlasticChange("HDPE")}
                >
                  <span></span>
                  HDPE
                </div>

                <div
                  className={`material ${
                    plastic === "LDPE" ? "active" : ""
                  }`}
                  onClick={() => handlePlasticChange("LDPE")}
                >
                  <span></span>
                  LDPE
                </div>

                <div
                  className={`material ${
                    plastic === "PP" ? "active" : ""
                  }`}
                  onClick={() => handlePlasticChange("PP")}
                >
                  <span></span>
                  PP
                </div>

                <div
                  className={`material ${
                    plastic === "PS" ? "active" : ""
                  }`}
                  onClick={() => handlePlasticChange("PS")}
                >
                  <span></span>
                  PS
                </div>

                <div
                  className={`material ${
                    plastic === "PVC" ? "active" : ""
                  }`}
                  onClick={() => handlePlasticChange("PVC")}
                >
                  <span></span>
                  PVC
                </div>

                <div
                  className={`material ${
                    plastic === "PET" ? "active" : ""
                  }`}
                  onClick={() => handlePlasticChange("PET")}
                >
                  <span></span>
                  PET
                </div>

              </div>
            </div>

            <div className="side-card model-card">

              <div className="model-icon">
                🧠
              </div>

              <div>
                <h4>Random Forest</h4>
                <p>Machine Learning Model</p>
              </div>

            </div>
            <div className="side-card pickup-request-card">

  <div className="card-label">
    <span>04</span>
    PICKUP REQUESTS
  </div>

  {pickupRequests.length === 0 ? (
    <p className="no-requests">
      No pickup requests recorded yet.
    </p>
  ) : (
    pickupRequests.map((request) => {
      const isSelected = selectedPickupRequest?.id === request.id;
      const st = (request.rawStatus || request.status || "pending").toLowerCase();
      const badgeColor = st === "settled" ? "#10b981" : st === "processed" ? "#38bdf8" : st === "verified" ? "#f59e0b" : "#94a3b8";
      const badgeBg = st === "settled" ? "rgba(16, 185, 129, 0.15)" : st === "processed" ? "rgba(56, 189, 248, 0.15)" : st === "verified" ? "rgba(245, 158, 11, 0.15)" : "rgba(148, 163, 184, 0.15)";

      return (
        <button
          key={request.id}
          className={`pickup-request ${isSelected ? "selected" : ""}`}
          style={isSelected ? { borderColor: "#10b981", background: "rgba(16, 185, 129, 0.05)" } : {}}
          onClick={() => handleSelectPickupRequest(request)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div className="pickup-request-name" style={{ margin: 0 }}>
              📦 {request.batchId || request.buyerName}
            </div>
            <span style={{
              fontSize: "0.7rem",
              fontWeight: "700",
              color: badgeColor,
              background: badgeBg,
              borderRadius: "9999px",
              padding: "1px 6px"
            }}>
              {st.toUpperCase()}
            </span>
          </div>

          <div className="pickup-request-info">
            <div>📍 {request.workerLocation || "Local Zone"}</div>
            <div>⚖️ {request.actualWeight || request.weight} kg</div>
          </div>

          <div className="pickup-request-action">
            {isSelected ? "Active Feedstock ✓" : "Load Feedstock →"}
          </div>
        </button>
      );
    })
  )}

</div>

          </aside>


          {/* MAIN PREDICTOR */}
          <section className="predictor-card">
            
            {/* ACTIVE BATCH VERIFICATION & OPERATIONS BANNER */}
            {selectedPickupRequest && (
              <div className="active-batch-banner" style={{
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(56, 189, 248, 0.08))",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "12px",
                padding: "16px 20px",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "1.4rem" }}>📦</span>
                    <div>
                      <strong style={{ fontSize: "1.05rem", color: "#f8fafc" }}>
                        Active Feedstock Batch: #{selectedPickupRequest.batchId || selectedPickupRequest.id}
                      </strong>
                      <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                        Worker: <b style={{ color: "#e2e8f0" }}>{selectedPickupRequest.workerName}</b> • {selectedPickupRequest.workerLocation || "Local Zone"} • Buyer: <b style={{ color: "#38bdf8" }}>{selectedPickupRequest.buyerName}</b>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "0.8rem",
                      fontWeight: "700",
                      background: batchStatus === "settled" ? "rgba(16, 185, 129, 0.2)" : batchStatus === "processed" ? "rgba(56, 189, 248, 0.2)" : batchStatus === "verified" ? "rgba(245, 158, 11, 0.2)" : "rgba(148, 163, 184, 0.2)",
                      color: batchStatus === "settled" ? "#10b981" : batchStatus === "processed" ? "#38bdf8" : batchStatus === "verified" ? "#f59e0b" : "#94a3b8",
                      border: `1px solid ${batchStatus === "settled" ? "rgba(16, 185, 129, 0.4)" : batchStatus === "processed" ? "rgba(56, 189, 248, 0.4)" : batchStatus === "verified" ? "rgba(245, 158, 11, 0.4)" : "rgba(148, 163, 184, 0.3)"}`
                    }}>
                      ● {batchStatus.toUpperCase()}
                    </span>
                    <button
                      onClick={() => setSelectedPickupRequest(null)}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "#cbd5e1",
                        borderRadius: "6px",
                        padding: "4px 8px",
                        cursor: "pointer",
                        fontSize: "0.8rem"
                      }}
                      title="Clear active batch"
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr auto",
                  gap: "12px",
                  alignItems: "end",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "12px 14px",
                  borderRadius: "8px"
                }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                      ESTIMATED WEIGHT
                    </label>
                    <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
                      {selectedPickupRequest.weight} kg
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                      GATE-VERIFIED WEIGHT (KG)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={verifiedWeight}
                      onChange={(e) => setVerifiedWeight(e.target.value)}
                      disabled={batchStatus !== "pending" && batchStatus !== "submitted"}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "#f8fafc",
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "0.95rem",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div>
                    {(batchStatus === "pending" || batchStatus === "submitted") && (
                      <button
                        onClick={handleVerifyBatch}
                        disabled={actionLoading}
                        style={{
                          background: "#10b981",
                          color: "#0f172a",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 14px",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        {actionLoading ? "Saving..." : "✅ Verify Gate Weight"}
                      </button>
                    )}

                    {batchStatus === "verified" && (
                      <button
                        onClick={handleMarkProcessed}
                        disabled={actionLoading || !result}
                        style={{
                          background: result ? "#38bdf8" : "rgba(56, 189, 248, 0.3)",
                          color: "#0f172a",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 14px",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: result ? "pointer" : "not-allowed"
                        }}
                        title={result ? "Save ML yields to batch" : "Run prediction below first"}
                      >
                        {actionLoading ? "Recording..." : result ? "⚡ Record ML Yields" : "Run Prediction Below →"}
                      </button>
                    )}

                    {batchStatus === "processed" && (
                      <button
                        onClick={handleSettleBatch}
                        disabled={actionLoading}
                        style={{
                          background: "#f59e0b",
                          color: "#0f172a",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 14px",
                          fontWeight: "700",
                          fontSize: "0.85rem",
                          cursor: "pointer"
                        }}
                      >
                        {actionLoading ? "Processing..." : `💰 Settle Payout (₹${Math.round(selectedPickupRequest.workerAmount || 0)})`}
                      </button>
                    )}

                    {batchStatus === "settled" && (
                      <span style={{ color: "#10b981", fontWeight: "700", fontSize: "0.9rem" }}>
                        ✓ Paid & Settled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
            

            <div className="predictor-top">

              <div>

                <div className="mini-label">
                  PREDICTION ENGINE
                </div>

                <h1>AI Pyrolysis Predictor</h1>

                <p>
                  Configure your feedstock and process parameters to
                  estimate pyrolysis product yields.
                </p>

              </div>

              <div className="ready-pill">
                <span></span>
                AI READY
              </div>

            </div>


            {/* PLASTIC TYPE */}
            <div className="form-section">

              <label>Plastic Type</label>

              <select
                value={plastic}
                onChange={(e) =>
                  handlePlasticChange(e.target.value)
                }
              >
                <option>HDPE</option>
                <option>LDPE</option>
                <option>PP</option>
                <option>PS</option>
                <option>PVC</option>
                <option>PET</option>
              </select>

            </div>


            {/* POLYMER COMPOSITION */}
            <div className="section-heading">

              <span>POLYMER COMPOSITION</span>
              <small>WT %</small>

            </div>

            <div className="form-grid">

              <div className="form-section">
                <label>HDPE (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={hdpe}
                  onChange={(e) =>
                    setHdpe(e.target.value)
                  }
                />
              </div>


              <div className="form-section">
                <label>LDPE (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={ldpe}
                  onChange={(e) =>
                    setLdpe(e.target.value)
                  }
                />
              </div>


              <div className="form-section">
                <label>PP (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pp}
                  onChange={(e) =>
                    setPp(e.target.value)
                  }
                />
              </div>


              <div className="form-section">
                <label>PS (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={ps}
                  onChange={(e) =>
                    setPs(e.target.value)
                  }
                />
              </div>


              <div className="form-section">
                <label>PVC (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pvc}
                  onChange={(e) =>
                    setPvc(e.target.value)
                  }
                />
              </div>


              <div className="form-section">
                <label>PET (%)</label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={pet}
                  onChange={(e) =>
                    setPet(e.target.value)
                  }
                />
              </div>

            </div>


            {/* PROCESS PARAMETERS */}
            <div className="section-heading process-heading">

              <span>PROCESS PARAMETERS</span>
              <small>EXPERIMENTAL CONDITIONS</small>

            </div>

            <div className="form-grid">

              <div className="form-section">

                <label>Temperature (°C)</label>

                <input
                  type="number"
                  value={temperature}
                  onChange={(e) =>
                    setTemperature(e.target.value)
                  }
                />

              </div>


              <div className="form-section">

                <label>Heating Rate (°C/min)</label>

                <input
                  type="number"
                  value={heatingRate}
                  onChange={(e) =>
                    setHeatingRate(e.target.value)
                  }
                />

              </div>


              <div className="form-section">

                <label>Particle Size (mm)</label>

                <input
                  type="number"
                  step="0.1"
                  value={particleSize}
                  onChange={(e) =>
                    setParticleSize(e.target.value)
                  }
                />

              </div>


              <div className="form-section">

                <label>Feed Size (g)</label>

                <input
                  type="number"
                  value={feedSize}
                  onChange={(e) =>
                    setFeedSize(e.target.value)
                  }
                />

              </div>

            </div>


            {/* CATALYST / REACTOR */}
            <div className="form-grid">

              <div className="form-section">

                <label>Catalyst</label>

                <select
                  value={catalyst}
                  onChange={(e) =>
                    setCatalyst(e.target.value)
                  }
                >
                  <option>None</option>
                  <option>Zeolite</option>
                  <option>HZSM-5</option>
                  <option>FCC</option>
                  <option>Alumina</option>
                </select>

              </div>


              <div className="form-section">

                <label>Reactor Type</label>

                <select
                  value={reactorType}
                  onChange={(e) =>
                    setReactorType(e.target.value)
                  }
                >
                  <option>Fixed Bed</option>
                  <option>Fluidized Bed</option>
                  <option>Batch Reactor</option>
                  <option>Rotary Kiln</option>
                </select>

              </div>

            </div>

            {/* DYNAMIC REACTOR STATUS & TEMPERATURE GAUGE */}
            <div className="reactor-status-strip">
              <div className="reactor-status-header">
                <span className="reactor-temp-pill">
                  <span className="temp-flame">🔥</span>
                  <strong>{temperature}°C</strong> Core Temp
                </span>
                <span className={`reactor-regime-badge ${temperature >= 420 && temperature <= 500 ? "optimal" : "warning"}`}>
                  {temperature >= 420 && temperature <= 500 
                    ? "✨ Optimal Liquid Fuel Regime (420–500°C)" 
                    : temperature < 420 
                      ? "⚠️ Low Temp / High Wax Condensation (<420°C)" 
                      : "⚡ High Temp / Light Gas Cracking (>500°C)"}
                </span>
              </div>
              <div className="reactor-config-summary">
                <span>⚙️ Bed: <strong>{reactorType}</strong></span>
                <span>•</span>
                <span>🧪 Catalyst: <strong>{catalyst}</strong></span>
                <span>•</span>
                <span>⏱️ Ramp: <strong>{heatingRate}°C/min</strong></span>
              </div>
            </div>

            {/* PREDICT BUTTON */}
            <button
              className="predict-button"
              onClick={predict}
              disabled={loading}
            >
              {loading
                ? "AI PROCESSING..."
                : "Predict Pyrolysis Yield"}

              {!loading && <span>→</span>}
            </button>

          </section>


          {/* RIGHT SIDEBAR */}
          <aside className="sidebar right-sidebar">

            {/* PROCESS */}
            <div className="side-card">

              <div className="card-label">
                <span>02</span>
                PYROLYSIS PROCESS
              </div>

              <div className="process-list">

                <div className="process-item">

                  <b>01</b>

                  <div>
                    <strong>Plastic Feed</strong>
                    <small>Waste material</small>
                  </div>

                </div>

                <div className="process-line"></div>

                <div className="process-item">

                  <b>02</b>

                  <div>
                    <strong>Thermal Conversion</strong>
                    <small>Controlled heating</small>
                  </div>

                </div>

                <div className="process-line"></div>

                <div className="process-item">

                  <b>03</b>

                  <div>
                    <strong>Product Separation</strong>
                    <small>Oil · Gas · Wax · Char</small>
                  </div>

                </div>

              </div>

            </div>


            {/* OUTPUT STREAMS */}
            <div className="side-card output-card">

              <div className="card-label">
                <span>03</span>
                OUTPUT STREAMS
              </div>

              <div className="output-row">
                <span>🛢️ Oil</span>
                <i></i>
              </div>

              <div className="output-row">
                <span>🔥 Gas</span>
                <i></i>
              </div>

              <div className="output-row">
                <span>◆ Wax</span>
                <i></i>
              </div>

              <div className="output-row">
                <span>▪ Char</span>
                <i></i>
              </div>

            </div>


            {/* CIRCULAR ECONOMY */}
            <div className="side-card circular-card">

              <div className="plant-icon">
                🌱
              </div>

              <h3>CIRCULAR ECONOMY</h3>

              <p>
                Turning plastic waste into useful resources through
                intelligent prediction.
              </p>

            </div>

          </aside>

        </div>


        {/* RESULTS */}
        {result && (

          <section className="results-card">

            <div className="result-header">

              <div>

                <div className="mini-label">
                  AI PREDICTION
                </div>

                <h2>Pyrolysis Product Yields</h2>

              </div>

              <span className="result-badge">
                MODEL OUTPUT
              </span>

            </div>


            <div className="results-grid">

              {/* OIL */}
              <div className="result-box oil">
                <span>🛢️</span>
                <small>LIQUID FUEL OIL</small>
                <strong>{result.oil ?? 0}%</strong>
                <div className="yield-progress-track">
                  <div className="yield-progress-fill oil-fill" style={{ width: `${Math.min(100, result.oil ?? 0)}%` }} />
                </div>
                <span className="yield-sub-info">High-grade synthetic crude</span>
              </div>

              {/* GAS */}
              <div className="result-box gas">
                <span>🔥</span>
                <small>SYNTHESIS GAS</small>
                <strong>{result.gas ?? 0}%</strong>
                <div className="yield-progress-track">
                  <div className="yield-progress-fill gas-fill" style={{ width: `${Math.min(100, result.gas ?? 0)}%` }} />
                </div>
                <span className="yield-sub-info">Recycled for plant heating</span>
              </div>

              {/* WAX */}
              <div className="result-box wax">
                <span>◆</span>
                <small>HEAVY WAX</small>
                <strong>{result.wax ?? 0}%</strong>
                <div className="yield-progress-track">
                  <div className="yield-progress-fill wax-fill" style={{ width: `${Math.min(100, result.wax ?? 0)}%` }} />
                </div>
                <span className="yield-sub-info">Paraffin & lubricant feedstock</span>
              </div>

              {/* CHAR */}
              <div className="result-box char">
                <span>▪</span>
                <small>CARBON CHAR</small>
                <strong>{result.char ?? 0}%</strong>
                <div className="yield-progress-track">
                  <div className="yield-progress-fill char-fill" style={{ width: `${Math.min(100, result.char ?? 0)}%` }} />
                </div>
                <span className="yield-sub-info">Industrial carbon black filler</span>
              </div>

            </div>

            {/* Economic Feasibility & Carbon Offset Intelligence */}
            {(() => {
              const batchWeightKg = selectedPickupRequest 
                ? (Number(verifiedWeight) || Number(selectedPickupRequest.weight) || 100) 
                : 1000;
              const oilKg = (batchWeightKg * (result.oil || 0)) / 100;
              const oilLiters = Math.round(oilKg / 0.85);
              const estRevenue = Math.round(oilLiters * 65);
              const co2OffsetKg = Math.round(batchWeightKg * 1.95);
              const charKg = Math.round((batchWeightKg * (result.char || 0)) / 100);

              return (
                <div className="economic-carbon-card">
                  <div className="eco-header">
                    <h3 style={{ margin: 0, fontSize: "16px" }}>Batch Output & Value</h3>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Feedstock: {batchWeightKg} kg
                    </span>
                  </div>

                  <div className="eco-metrics-grid">
                    <div className="eco-metric-tile">
                      <span className="eco-icon">🛢️</span>
                      <div className="eco-val">{oilLiters.toLocaleString()} L</div>
                      <div className="eco-lbl">Fuel Oil</div>
                    </div>

                    <div className="eco-metric-tile">
                      <span className="eco-icon">💰</span>
                      <div className="eco-val" style={{ color: "var(--accent-emerald)" }}>
                        ₹{estRevenue.toLocaleString("en-IN")}
                      </div>
                      <div className="eco-lbl">Est. Value (₹65/L)</div>
                    </div>

                    <div className="eco-metric-tile">
                      <span className="eco-icon">🌱</span>
                      <div className="eco-val" style={{ color: "var(--accent-cyan)" }}>
                        {co2OffsetKg.toLocaleString()} kg
                      </div>
                      <div className="eco-lbl">CO₂ Diverted</div>
                    </div>

                    <div className="eco-metric-tile">
                      <span className="eco-icon">⬛</span>
                      <div className="eco-val">{charKg.toLocaleString()} kg</div>
                      <div className="eco-lbl">Char Byproduct</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <p className="result-note">
              Prediction configured for {temperature}°C in {reactorType} ({catalyst} catalyst).
            </p>

          </section>

        )}

      </main>


      {/* FOOTER */}
      <footer>
        PyroCycle AI · AI-assisted plastic waste resource recovery
      </footer>

    </div>
  );
}

export default IndustryApp;