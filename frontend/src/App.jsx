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
            plastic_type: plastic,

            HDPE_wt_percent: Number(hdpe),
            LDPE_wt_percent: Number(ldpe),
            PP_wt_percent: Number(pp),
            PS_wt_percent: Number(ps),
            PVC_wt_percent: Number(pvc),
            PET_wt_percent: Number(pet),

            temperature: Number(temperature),
            heating_rate: Number(heatingRate),
            particle_size: Number(particleSize),
            feed_size: Number(feedSize),

            catalyst: catalyst,
            reactor_type: reactorType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Backend is not running or prediction failed!");
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


          <label>HDPE (%)</label>

          <input
            type="number"
            value={hdpe}
            onChange={(e) => setHdpe(e.target.value)}
          />


          <label>LDPE (%)</label>

          <input
            type="number"
            value={ldpe}
            onChange={(e) => setLdpe(e.target.value)}
          />


          <label>PP (%)</label>

          <input
            type="number"
            value={pp}
            onChange={(e) => setPp(e.target.value)}
          />


          <label>PS (%)</label>

          <input
            type="number"
            value={ps}
            onChange={(e) => setPs(e.target.value)}
          />


          <label>PVC (%)</label>

          <input
            type="number"
            value={pvc}
            onChange={(e) => setPvc(e.target.value)}
          />


          <label>PET (%)</label>

          <input
            type="number"
            value={pet}
            onChange={(e) => setPet(e.target.value)}
          />


          <label>Temperature (°C)</label>

          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />


          <label>Heating Rate (°C/min)</label>

          <input
            type="number"
            value={heatingRate}
            onChange={(e) => setHeatingRate(e.target.value)}
          />


          <label>Particle Size (mm)</label>

          <input
            type="number"
            value={particleSize}
            onChange={(e) => setParticleSize(e.target.value)}
          />


          <label>Feed Size (g)</label>

          <input
            type="number"
            value={feedSize}
            onChange={(e) => setFeedSize(e.target.value)}
          />


          <label>Catalyst</label>

          <select
            value={catalyst}
            onChange={(e) => setCatalyst(e.target.value)}
          >
            <option>None</option>
            <option>HZSM-5</option>
            <option>H-ZSM-5</option>
            <option>Zeolite</option>
            <option>FCC</option>
          </select>


          <label>Reactor Type</label>

          <select
            value={reactorType}
            onChange={(e) => setReactorType(e.target.value)}
          >
            <option>Fixed Bed</option>
            <option>Fluidized Bed</option>
            <option>Batch</option>
            <option>Vacuum</option>
            <option>Rotary Kiln</option>
          </select>


          <button onClick={predict} disabled={loading}>
            {loading ? "AI Processing..." : "Predict Pyrolysis Yield"}
          </button>

        </section>


        {result && (

          <section className="results">

            <h2>AI Prediction</h2>

            <div className="results-grid">

              <div className="result-card">
                🛢️ Oil
                <strong>{result.oil}%</strong>
              </div>

              <div className="result-card">
                🔥 Gas
                <strong>{result.gas}%</strong>
              </div>

              <div className="result-card">
                🟡 Wax
                <strong>{result.wax}%</strong>
              </div>

              <div className="result-card">
                ⚫ Char
                <strong>{result.char}%</strong>
              </div>

            </div>

            <p className="note">
              Oil yield is predicted using the 325-row
              literature-trained AI model. Gas, wax and char
              are prototype estimates derived from the predicted
              oil yield.
            </p>

          </section>

        )}

      </main>

    </div>
  );
}

export default App;