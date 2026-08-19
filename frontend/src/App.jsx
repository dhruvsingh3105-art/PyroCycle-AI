import { useState } from "react";
import "./App.css";

function App() {
  const [plastic, setPlastic] = useState("HDPE");
  const [quantity, setQuantity] = useState(10);
  const [temperature, setTemperature] = useState(450);
  const [time, setTime] = useState(60);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plastic_type: plastic,
          quantity: quantity,
          temperature: temperature,
          time: time,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      alert("Backend is not running!");
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
            <option>PP</option>
            <option>LDPE</option>
            <option>PS</option>
          </select>

          <label>Quantity (kg)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />

          <label>Temperature (°C)</label>
          <input
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />

          <label>Reaction Time (min)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <button onClick={predict}>
            {loading ? "AI Processing..." : "Predict with AI"}
          </button>
        </section>

        {result && (
          <section className="results">
            <h2>AI Prediction</h2>

            <div className="results-grid">
              <div>🛢️ Oil <strong>{result.oil}%</strong></div>
              <div>🔥 Gas <strong>{result.gas}%</strong></div>
              <div>🟡 Wax <strong>{result.wax}%</strong></div>
              <div>⚫ Char <strong>{result.char}%</strong></div>
            </div>

            <p className="note">
              These values are AI-based prototype estimates.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;


