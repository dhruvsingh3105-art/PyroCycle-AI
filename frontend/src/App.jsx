import { useState } from "react";
import "./App.css";

function App() {
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

  const predict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        "https://pyrocycle-ai-backend.onrender.com/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
      alert(
        "Unable to connect to the AI backend. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <span className="brand-icon">♻</span>
          <span>PyroCycle <strong>AI</strong></span>
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
                <div className="material active">
                  <span></span> HDPE
                </div>

                <div className="material">
                  <span></span> LDPE
                </div>

                <div className="material">
                  <span></span> PP
                </div>

                <div className="material">
                  <span></span> PS
                </div>
              </div>
            </div>

            <div className="side-card model-card">
              <div className="model-icon">🧠</div>

              <div>
                <h4>Random Forest</h4>
                <p>Machine Learning Model</p>
              </div>
            </div>

          </aside>


          {/* MAIN PREDICTOR */}
          <section className="predictor-card">

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
                onChange={(e) => setPlastic(e.target.value)}
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
                  value={hdpe}
                  onChange={(e) => setHdpe(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>LDPE (%)</label>
                <input
                  type="number"
                  value={ldpe}
                  onChange={(e) => setLdpe(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>PP (%)</label>
                <input
                  type="number"
                  value={pp}
                  onChange={(e) => setPp(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>PS (%)</label>
                <input
                  type="number"
                  value={ps}
                  onChange={(e) => setPs(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>PVC (%)</label>
                <input
                  type="number"
                  value={pvc}
                  onChange={(e) => setPvc(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>PET (%)</label>
                <input
                  type="number"
                  value={pet}
                  onChange={(e) => setPet(e.target.value)}
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
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>Heating Rate (°C/min)</label>
                <input
                  type="number"
                  value={heatingRate}
                  onChange={(e) => setHeatingRate(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>Particle Size (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={particleSize}
                  onChange={(e) => setParticleSize(e.target.value)}
                />
              </div>

              <div className="form-section">
                <label>Feed Size (g)</label>
                <input
                  type="number"
                  value={feedSize}
                  onChange={(e) => setFeedSize(e.target.value)}
                />
              </div>

            </div>


            {/* CATALYST / REACTOR */}
            <div className="form-grid">

              <div className="form-section">
                <label>Catalyst</label>

                <select
                  value={catalyst}
                  onChange={(e) => setCatalyst(e.target.value)}
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
                  onChange={(e) => setReactorType(e.target.value)}
                >
                  <option>Fixed Bed</option>
                  <option>Fluidized Bed</option>
                  <option>Batch Reactor</option>
                  <option>Rotary Kiln</option>
                </select>
              </div>

            </div>


            {/* PREDICT BUTTON */}
            <button
              className="predict-button"
              onClick={predict}
              disabled={loading}
            >
              {loading ? "AI PROCESSING..." : "Predict Oil Yield"}
              {!loading && <span>→</span>}
            </button>

          </section>


          {/* RIGHT SIDEBAR */}
          <aside className="sidebar right-sidebar">

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


            {/* OUTPUT CARD */}
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


            <div className="side-card circular-card">

              <div className="plant-icon">🌱</div>

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
                <div className="mini-label">AI PREDICTION</div>
                <h2>Pyrolysis Product Yields</h2>
              </div>

              <span className="result-badge">
                MODEL OUTPUT
              </span>
            </div>

            <div className="results-grid">

              <div className="result-box oil">
                <span>🛢️</span>
                <small>OIL</small>
                <strong>{result.oil ?? result.Oil_Yield_percent ?? 0}%</strong>
              </div>

              <div className="result-box gas">
                <span>🔥</span>
                <small>GAS</small>
                <strong>{result.gas ?? result.Gas_Yield_percent ?? 0}%</strong>
              </div>

              <div className="result-box wax">
                <span>◆</span>
                <small>WAX</small>
                <strong>{result.wax ?? result.Wax_Yield_percent ?? 0}%</strong>
              </div>

              <div className="result-box char">
                <span>▪</span>
                <small>CHAR</small>
                <strong>{result.char ?? result.Char_Yield_percent ?? 0}%</strong>
              </div>

            </div>

            <p className="result-note">
              AI-based prototype estimates generated using the trained
              pyrolysis model and literature data.
            </p>

          </section>
        )}

      </main>

      <footer>
        PyroCycle AI · AI-assisted plastic waste resource recovery
      </footer>

    </div>
  );
}

export default App;