import { useState } from "react";
import "./App.css";

function App() {
  const [form, setForm] = useState({
    hdpe: 50,
    ldpe: 0,
    pp: 50,
    ps: 0,
    pvc: 0,
    pet: 0,
    temperature: 450,
    heatingRate: 10,
    particleSize: 1,
    feedSize: 10,
    catalyst: "None",
    reactorType: "Fixed Bed",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
            HDPE_wt_percent: Number(form.hdpe),
            LDPE_wt_percent: Number(form.ldpe),
            PP_wt_percent: Number(form.pp),
            PS_wt_percent: Number(form.ps),
            PVC_wt_percent: Number(form.pvc),
            PET_wt_percent: Number(form.pet),
            Temperature_C: Number(form.temperature),
            Heating_Rate_C_per_min: Number(form.heatingRate),
            Particle_Size_mm: Number(form.particleSize),
            Feed_Size_g: Number(form.feedSize),
            Catalyst: form.catalyst,
            Reactor_Type: form.reactorType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Prediction failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Unable to connect to AI backend.");
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="app">
      <header>
        <h1>♻️ PyroCycle AI</h1>
        <p>AI-powered plastic waste resource recovery</p>
      </header>

      <main>
        <section className="card">
          <h2>AI Pyrolysis Predictor</h2>

          <label>HDPE (%)</label>
          <input
            type="number"
            name="hdpe"
            value={form.hdpe}
            onChange={handleChange}
          />

          <label>LDPE (%)</label>
          <input
            type="number"
            name="ldpe"
            value={form.ldpe}
            onChange={handleChange}
          />

          <label>PP (%)</label>
          <input
            type="number"
            name="pp"
            value={form.pp}
            onChange={handleChange}
          />

          <label>PS (%)</label>
          <input
            type="number"
            name="ps"
            value={form.ps}
            onChange={handleChange}
          />

          <label>PVC (%)</label>
          <input
            type="number"
            name="pvc"
            value={form.pvc}
            onChange={handleChange}
          />

          <label>PET (%)</label>
          <input
            type="number"
            name="pet"
            value={form.pet}
            onChange={handleChange}
          />

          <label>Temperature (°C)</label>
          <input
            type="number"
            name="temperature"
            value={form.temperature}
            onChange={handleChange}
          />

          <label>Heating Rate (°C/min)</label>
          <input
            type="number"
            name="heatingRate"
            value={form.heatingRate}
            onChange={handleChange}
          />

          <label>Particle Size (mm)</label>
          <input
            type="number"
            step="0.1"
            name="particleSize"
            value={form.particleSize}
            onChange={handleChange}
          />

          <label>Feed Size (g)</label>
          <input
            type="number"
            name="feedSize"
            value={form.feedSize}
            onChange={handleChange}
          />

          <label>Catalyst</label>
          <select
            name="catalyst"
            value={form.catalyst}
            onChange={handleChange}
          >
            <option>None</option>
            <option>Zeolite</option>
            <option>HZSM-5</option>
            <option>Al2O3</option>
            <option>CaCO3</option>
          </select>

          <label>Reactor Type</label>
          <select
            name="reactorType"
            value={form.reactorType}
            onChange={handleChange}
          >
            <option>Fixed Bed</option>
            <option>Fluidized Bed</option>
            <option>Batch Reactor</option>
            <option>Rotary Kiln</option>
          </select>

          <button onClick={predict} disabled={loading}>
            {loading ? "AI Processing..." : "Predict Oil Yield"}
          </button>
        </section>

        {result && (
          <section className="results">
            <h2>AI Prediction</h2>

            <div className="results-grid">
              <div>
                🛢️ Oil
                <strong>
                  {result.oil ?? result.Oil_Yield_percent ?? result.prediction}%
                </strong>
              </div>
            </div>

            <p className="note">
              AI-based oil yield estimate using the trained pyrolysis model.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;