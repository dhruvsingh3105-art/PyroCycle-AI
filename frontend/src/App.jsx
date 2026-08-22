import { useState } from "react";
import "./App.css";

function App() {
  const [plastic, setPlastic] = useState("HDPE");

  const [values, setValues] = useState({
    HDPE: 100,
    LDPE: 0,
    PP: 0,
    PS: 0,
    PVC: 0,
    PET: 0,
    temperature: 450,
    heatingRate: 10,
    particleSize: 1,
    feedSize: 10,
    catalyst: "None",
    reactorType: "Fixed Bed",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
            HDPE_wt_percent: Number(values.HDPE),
            LDPE_wt_percent: Number(values.LDPE),
            PP_wt_percent: Number(values.PP),
            PS_wt_percent: Number(values.PS),
            PVC_wt_percent: Number(values.PVC),
            PET_wt_percent: Number(values.PET),
            Temperature_C: Number(values.temperature),
            Heating_Rate_C_per_min: Number(values.heatingRate),
            Particle_Size_mm: Number(values.particleSize),
            Feed_Size_g: Number(values.feedSize),
            Catalyst: values.catalyst,
            Reactor_Type: values.reactorType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Unable to connect to PyroCycle AI backend.");
    }

    setLoading(false);
  };

  const plasticInputs = ["HDPE", "LDPE", "PP", "PS", "PVC", "PET"];

  return (
    <div className="app">

      {/* Background decoration */}
      <div className="glow glow-one"></div>
      <div className="glow glow-two"></div>
      <div className="grid-background"></div>

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">♻</span>
          <span>PyroCycle <b>AI</b></span>
        </div>

        <p>AI-powered plastic waste resource recovery</p>

        <div className="header-badges">
          <span>● AI ENGINE ONLINE</span>
          <span>325 LITERATURE RECORDS</span>
        </div>
      </header>

      <div className="page-layout">

        {/* LEFT PANEL */}
        <aside className="side-panel left-panel">

          <div className="side-card hero-side">
            <div className="orb">
              ♻
            </div>

            <h3>Waste → Resource</h3>

            <p>
              Transform plastic waste into valuable
              energy products using AI-assisted
              pyrolysis prediction.
            </p>
          </div>

          <div className="side-card">

            <div className="mini-title">
              <span>01</span>
              MATERIAL INPUT
            </div>

            <div className="material-list">
              <div>
                <span className="material-dot hdpe"></span>
                HDPE
              </div>

              <div>
                <span className="material-dot ldpe"></span>
                LDPE
              </div>

              <div>
                <span className="material-dot pp"></span>
                PP
              </div>

              <div>
                <span className="material-dot ps"></span>
                PS
              </div>
            </div>

          </div>

          <div className="side-card stat-card">

            <div className="stat-icon">🧠</div>

            <div>
              <strong>Random Forest</strong>
              <small>Machine Learning Model</small>
            </div>

          </div>

        </aside>


        {/* CENTER */}
        <main className="main-content">

          <div className="section-label">
            AI-POWERED PYROLYSIS INTELLIGENCE
          </div>

          <section className="prediction-card">

            <div className="card-top">

              <div>
                <span className="eyebrow">PREDICTION ENGINE</span>
                <h1>AI Pyrolysis Predictor</h1>
                <p>
                  Configure your feedstock and process parameters
                  to estimate pyrolysis product yields.
                </p>
              </div>

              <div className="ai-status">
                <span></span>
                AI READY
              </div>

            </div>


            {/* Plastic type */}
            <label>Plastic Type</label>

            <select
              value={plastic}
              onChange={(e) => {
                const type = e.target.value;
                setPlastic(type);

                const updated = {
                  HDPE: 0,
                  LDPE: 0,
                  PP: 0,
                  PS: 0,
                  PVC: 0,
                  PET: 0,
                  temperature: values.temperature,
                  heatingRate: values.heatingRate,
                  particleSize: values.particleSize,
                  feedSize: values.feedSize,
                  catalyst: values.catalyst,
                  reactorType: values.reactorType,
                };

                updated[type] = 100;
                setValues(updated);
              }}
            >
              {plasticInputs.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>


            <div className="input-section">

              <div className="input-heading">
                <span>POLYMER COMPOSITION</span>
                <small>WT %</small>
              </div>

              <div className="composition-grid">

                {plasticInputs.map((type) => (
                  <div className="input-group" key={type}>

                    <label>{type} (%)</label>

                    <input
                      type="number"
                      value={values[type]}
                      min="0"
                      max="100"
                      onChange={(e) =>
                        handleChange(type, e.target.value)
                      }
                    />

                  </div>
                ))}

              </div>

            </div>


            <div className="input-heading process-heading">
              <span>PROCESS PARAMETERS</span>
              <small>EXPERIMENTAL CONDITIONS</small>
            </div>


            <div className="composition-grid">

              <div className="input-group">
                <label>Temperature (°C)</label>

                <input
                  type="number"
                  value={values.temperature}
                  onChange={(e) =>
                    handleChange("temperature", e.target.value)
                  }
                />
              </div>


              <div className="input-group">
                <label>Heating Rate (°C/min)</label>

                <input
                  type="number"
                  value={values.heatingRate}
                  onChange={(e) =>
                    handleChange("heatingRate", e.target.value)
                  }
                />
              </div>


              <div className="input-group">
                <label>Particle Size (mm)</label>

                <input
                  type="number"
                  value={values.particleSize}
                  onChange={(e) =>
                    handleChange("particleSize", e.target.value)
                  }
                />
              </div>


              <div className="input-group">
                <label>Feed Size (g)</label>

                <input
                  type="number"
                  value={values.feedSize}
                  onChange={(e) =>
                    handleChange("feedSize", e.target.value)
                  }
                />
              </div>

            </div>


            <div className="composition-grid">

              <div className="input-group">

                <label>Catalyst</label>

                <select
                  value={values.catalyst}
                  onChange={(e) =>
                    handleChange("catalyst", e.target.value)
                  }
                >
                  <option>None</option>
                  <option>HZSM-5</option>
                  <option>Zeolite</option>
                  <option>Silica-Alumina</option>
                </select>

              </div>


              <div className="input-group">

                <label>Reactor Type</label>

                <select
                  value={values.reactorType}
                  onChange={(e) =>
                    handleChange("reactorType", e.target.value)
                  }
                >
                  <option>Fixed Bed</option>
                  <option>Fluidized Bed</option>
                  <option>Batch Reactor</option>
                  <option>Rotary Kiln</option>
                </select>

              </div>

            </div>


            <button
              className="predict-button"
              onClick={predict}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  AI PROCESSING...
                </>
              ) : (
                <>
                  RUN AI PREDICTION
                  <span>→</span>
                </>
              )}
            </button>

          </section>


          {/* RESULTS */}

          {result && (

            <section className="results-card">

              <div className="results-header">

                <div>
                  <span className="eyebrow">MODEL OUTPUT</span>
                  <h2>Predicted Product Yield</h2>
                </div>

                <span className="confidence">
                  AI ESTIMATE
                </span>

              </div>


              <div className="results-grid">

                <div className="result-box oil">
                  <span className="result-symbol">🛢</span>
                  <small>OIL</small>
                  <strong>{result.oil}%</strong>
                </div>

                <div className="result-box gas">
                  <span className="result-symbol">🔥</span>
                  <small>GAS</small>
                  <strong>{result.gas}%</strong>
                </div>

                <div className="result-box wax">
                  <span className="result-symbol">◆</span>
                  <small>WAX</small>
                  <strong>{result.wax}%</strong>
                </div>

                <div className="result-box char">
                  <span className="result-symbol">●</span>
                  <small>CHAR</small>
                  <strong>{result.char}%</strong>
                </div>

              </div>

              <p className="result-note">
                AI-based prototype estimate generated using the trained
                pyrolysis model and literature-derived process data.
              </p>

            </section>

          )}

        </main>


        {/* RIGHT PANEL */}
        <aside className="side-panel right-panel">

          <div className="side-card process-card">

            <div className="mini-title">
              <span>02</span>
              PYROLYSIS PROCESS
            </div>

            <div className="process-flow">

              <div className="process-item">
                <span className="process-number">01</span>
                <div>
                  <strong>Plastic Feed</strong>
                  <small>Waste material</small>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="process-item">
                <span className="process-number">02</span>
                <div>
                  <strong>Thermal Conversion</strong>
                  <small>Controlled heating</small>
                </div>
              </div>

              <div className="flow-line"></div>

              <div className="process-item">
                <span className="process-number">03</span>
                <div>
                  <strong>Product Separation</strong>
                  <small>Oil • Gas • Wax • Char</small>
                </div>
              </div>

            </div>

          </div>


          <div className="side-card output-preview">

            <div className="mini-title">
              <span>03</span>
              OUTPUT STREAMS
            </div>

            <div className="output-line">
              <span>🛢 Oil</span>
              <div></div>
            </div>

            <div className="output-line">
              <span>🔥 Gas</span>
              <div></div>
            </div>

            <div className="output-line">
              <span>◆ Wax</span>
              <div></div>
            </div>

            <div className="output-line">
              <span>● Char</span>
              <div></div>
            </div>

          </div>


          <div className="side-card eco-card">

            <span className="eco-icon">🌱</span>

            <strong>CIRCULAR ECONOMY</strong>

            <p>
              Turning plastic waste into useful
              resources through intelligent prediction.
            </p>

          </div>

        </aside>

      </div>


      <footer>
        <span>PYROCYCLE AI</span>
        <span>•</span>
        <span>AI-ASSISTED PYROLYSIS RESEARCH PROTOTYPE</span>
      </footer>

    </div>
  );
}

export default App;