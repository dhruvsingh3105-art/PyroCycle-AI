import { useState } from "react";

function WorkerApp({ onBack }) {
  const [screen, setScreen] = useState("language");
  const [language, setLanguage] = useState("en");
  const [selectedImage, setSelectedImage] = useState(null);
const [imagePreview, setImagePreview] = useState(null);

    const [composition, setComposition] = useState({
  PP: 52,
  HDPE: 31,
  LDPE: 12,
  PS: 5,
});

const [batchWeight, setBatchWeight] = useState("");

const referencePrices = {
  PP: 50,
  HDPE: 48,
  LDPE: 38,
  PS: 42,
};

  const [worker, setWorker] = useState({
    name: "",
    location: "",
    phone: "",
    collection: "plastic",
  });

  const languages = [
    { id: "en", native: "English" },
    { id: "hi", native: "हिन्दी" },
    { id: "bn", native: "বাংলা" },
    { id: "ta", native: "தமிழ்" },
    { id: "te", native: "తెలుగు" },
  ];

  const text = {
    en: {
      welcome: "Welcome",
      chooseLanguage: "Choose your language",
      continue: "Continue",
      worker: "Worker",
      name: "Name or nickname",
      location: "Location",
      phone: "Phone number (optional)",
      collect: "What do you collect?",
      plastic: "Plastic",
      mixed: "Mixed waste",
      both: "Both",
      start: "Get Started",
      home: "Worker Home",
      homeDesc: "Turn your collected plastic into better value.",
      scan: "Scan Plastic",
      scanDesc: "Identify plastic in your collected waste.",
      value: "Check Value",
      valueDesc: "Estimate the value of your batch.",
      buyer: "Find Buyer / Pickup",
      buyerDesc: "Connect your batch with a recycler.",
      batches: "My Batches",
      batchesDesc: "Your previous collections and transactions",
      required: "Please enter your name and location.",
      collectionRequired: "Please select what you collect.",
    },

    hi: {
      welcome: "स्वागत है",
      chooseLanguage: "अपनी भाषा चुनें",
      continue: "आगे बढ़ें",
      worker: "कचरा संग्रहकर्ता",
      name: "नाम या उपनाम",
      location: "स्थान",
      phone: "फोन नंबर (वैकल्पिक)",
      collect: "आप क्या एकत्र करते हैं?",
      plastic: "प्लास्टिक",
      mixed: "मिश्रित कचरा",
      both: "दोनों",
      start: "शुरू करें",
      home: "वर्कर होम",
      homeDesc: "अपने एकत्र किए गए प्लास्टिक से बेहतर मूल्य प्राप्त करें।",
      scan: "प्लास्टिक स्कैन करें",
      scanDesc: "एकत्र किए गए कचरे में प्लास्टिक की पहचान करें।",
      value: "मूल्य देखें",
      valueDesc: "अपने बैच का अनुमानित मूल्य देखें।",
      buyer: "खरीदार / पिकअप खोजें",
      buyerDesc: "अपने बैच को रिसाइकलर से जोड़ें।",
      batches: "मेरे बैच",
      batchesDesc: "आपके पिछले संग्रह और लेनदेन",
      required: "कृपया अपना नाम और स्थान दर्ज करें।",
      collectionRequired: "कृपया चुनें कि आप क्या एकत्र करते हैं।",
    },

    bn: {
      welcome: "স্বাগতম",
      chooseLanguage: "আপনার ভাষা নির্বাচন করুন",
      continue: "এগিয়ে যান",
      worker: "কর্মী",
      name: "নাম বা ডাকনাম",
      location: "স্থান",
      phone: "ফোন নম্বর (ঐচ্ছিক)",
      collect: "আপনি কী সংগ্রহ করেন?",
      plastic: "প্লাস্টিক",
      mixed: "মিশ্র বর্জ্য",
      both: "উভয়",
      start: "শুরু করুন",
      home: "কর্মী হোম",
      homeDesc: "আপনার সংগ্রহ করা প্লাস্টিক থেকে আরও ভালো মূল্য পান।",
      scan: "প্লাস্টিক স্ক্যান করুন",
      scanDesc: "সংগৃহীত বর্জ্যে প্লাস্টিক শনাক্ত করুন।",
      value: "মূল্য দেখুন",
      valueDesc: "আপনার ব্যাচের আনুমানিক মূল্য দেখুন।",
      buyer: "ক্রেতা / পিকআপ খুঁজুন",
      buyerDesc: "আপনার ব্যাচকে রিসাইক্লারের সাথে যুক্ত করুন।",
      batches: "আমার ব্যাচ",
      batchesDesc: "আপনার আগের সংগ্রহ এবং লেনদেন",
      required: "অনুগ্রহ করে আপনার নাম এবং স্থান লিখুন।",
      collectionRequired: "আপনি কী সংগ্রহ করেন তা নির্বাচন করুন।",
    },

    ta: {
      welcome: "வரவேற்கிறோம்",
      chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
      continue: "தொடரவும்",
      worker: "தொழிலாளர்",
      name: "பெயர் அல்லது புனைப்பெயர்",
      location: "இடம்",
      phone: "தொலைபேசி எண் (விருப்பம்)",
      collect: "நீங்கள் எதை சேகரிக்கிறீர்கள்?",
      plastic: "பிளாஸ்டிக்",
      mixed: "கலப்பு கழிவு",
      both: "இரண்டும்",
      start: "தொடங்குங்கள்",
      home: "தொழிலாளர் முகப்பு",
      homeDesc: "நீங்கள் சேகரித்த பிளாஸ்டிக்கிற்கு சிறந்த மதிப்பைப் பெறுங்கள்.",
      scan: "பிளாஸ்டிக் ஸ்கேன்",
      scanDesc: "சேகரிக்கப்பட்ட கழிவுகளில் உள்ள பிளாஸ்டிக்கைக் கண்டறியவும்.",
      value: "மதிப்பைப் பார்க்கவும்",
      valueDesc: "உங்கள் தொகுப்பின் மதிப்பை மதிப்பிடவும்.",
      buyer: "வாங்குபவர் / பிக்கப்",
      buyerDesc: "உங்கள் தொகுப்பை மறுசுழற்சியாளருடன் இணைக்கவும்.",
      batches: "எனது தொகுப்புகள்",
      batchesDesc: "உங்கள் முந்தைய சேகரிப்புகள் மற்றும் பரிவர்த்தனைகள்",
      required: "உங்கள் பெயர் மற்றும் இடத்தை உள்ளிடவும்.",
      collectionRequired: "நீங்கள் சேகரிப்பதைத் தேர்ந்தெடுக்கவும்.",
    },

    te: {
      welcome: "స్వాగతం",
      chooseLanguage: "మీ భాషను ఎంచుకోండి",
      continue: "కొనసాగించండి",
      worker: "కార్మికుడు",
      name: "పేరు లేదా మారుపేరు",
      location: "ప్రాంతం",
      phone: "ఫోన్ నంబర్ (ఐచ్ఛికం)",
      collect: "మీరు ఏమి సేకరిస్తారు?",
      plastic: "ప్లాస్టిక్",
      mixed: "మిశ్రమ వ్యర్థాలు",
      both: "రెండూ",
      start: "ప్రారంభించండి",
      home: "వర్కర్ హోమ్",
      homeDesc: "మీరు సేకరించిన ప్లాస్టిక్‌కు మెరుగైన విలువను పొందండి.",
      scan: "ప్లాస్టిక్ స్కాన్ చేయండి",
      scanDesc: "సేకరించిన వ్యర్థాలలో ప్లాస్టిక్‌ను గుర్తించండి.",
      value: "విలువను చూడండి",
      valueDesc: "మీ బ్యాచ్ విలువను అంచనా వేయండి.",
      buyer: "కొనుగోలుదారు / పికప్",
      buyerDesc: "మీ బ్యాచ్‌ను రీసైక్లర్‌తో కనెక్ట్ చేయండి.",
      batches: "నా బ్యాచ్‌లు",
      batchesDesc: "మీ మునుపటి సేకరణలు మరియు లావాదేవీలు",
      required: "దయచేసి మీ పేరు మరియు ప్రాంతాన్ని నమోదు చేయండి.",
      collectionRequired: "మీరు ఏమి సేకరిస్తారో ఎంచుకోండి.",
    },
  };

  const t = text[language];
  const goBack = () => {
  if (screen === "onboarding") {
    setScreen("language");
  } else if (screen === "home") {
    onBack();
  }
};
const handleImageSelect = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  setSelectedImage(file);
  setImagePreview(URL.createObjectURL(file));
};
  const updateWorker = (field, value) => {
    setWorker((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const finishOnboarding = () => {
    if (!worker.name.trim() || !worker.location.trim()) {
      alert(t.required);
      return;
    }

    if (!worker.collection) {
      alert(t.collectionRequired);
      return;
    }

    setScreen("home");
  };

  // =========================
  // LANGUAGE SCREEN
  // =========================

  if (screen === "language") {
    return (
      <div className="worker-page">
        <button className="worker-back" onClick={onBack}>
          ← Back
        </button>

        <div className="worker-container">
          <div className="worker-logo">♻️</div>

          <h1>PyroCycle AI</h1>

          <p className="worker-tagline">
            AI-powered plastic recovery
          </p>

          <div className="worker-card">
            <h2>{t.welcome} 👋</h2>

            <p>{t.chooseLanguage}</p>

            <div className="language-list">
              {languages.map((item) => (
                <button
                  key={item.id}
                  className={`language-option ${
                    language === item.id ? "selected" : ""
                  }`}
                  onClick={() => setLanguage(item.id)}
                >
                  <span>{item.native}</span>

                  {language === item.id && (
                    <span className="language-check">✓</span>
                  )}
                </button>
              ))}
            </div>

            <button
              className="worker-primary-button"
              onClick={() => setScreen("onboarding")}
            >
              {t.continue} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ONBOARDING SCREEN
  // =========================

  if (screen === "onboarding") {
    return (
      <div className="worker-page">
        <button
          className="worker-back"
          onClick={() => setScreen("language")}
        >
          ← Back
        </button>

        <div className="worker-container">
          <div className="worker-logo small">♻️</div>

          <h1>PyroCycle AI</h1>

          <p className="worker-tagline">
            {t.worker}
          </p>

          <div className="worker-card onboarding-card">
            <h2>{t.welcome} 👋</h2>

            <div className="worker-form">

              <label>{t.name}</label>

              <input
                type="text"
                value={worker.name}
                onChange={(e) =>
                  updateWorker("name", e.target.value)
                }
                placeholder={t.name}
              />

              <label>{t.location}</label>

              <input
                type="text"
                value={worker.location}
                onChange={(e) =>
                  updateWorker("location", e.target.value)
                }
                placeholder={t.location}
              />

              <label>{t.phone}</label>

              <input
                type="tel"
                value={worker.phone}
                onChange={(e) =>
                  updateWorker("phone", e.target.value)
                }
                placeholder={t.phone}
              />

              <label>{t.collect}</label>

              <div className="collection-options">

                <button
                  type="button"
                  className={
                    worker.collection === "plastic"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateWorker("collection", "plastic")
                  }
                >
                  ♻️
                  <span>{t.plastic}</span>
                </button>

                <button
                  type="button"
                  className={
                    worker.collection === "mixed"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateWorker("collection", "mixed")
                  }
                >
                  📦
                  <span>{t.mixed}</span>
                </button>

                <button
                  type="button"
                  className={
                    worker.collection === "both"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    updateWorker("collection", "both")
                  }
                >
                  🔄
                  <span>{t.both}</span>
                </button>

              </div>

              <button
                className="worker-primary-button"
                onClick={finishOnboarding}
              >
                {t.start} →
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // WORKER HOME
  // =========================

  if (screen === "home") {
    return (
      <div className="worker-page">
  <button
    className="worker-back"
    onClick={() => onBack()}
  >
    ← Back
  </button>

        <div className="worker-home">

          <div className="worker-home-header">

            <div>
              <div className="worker-brand-small">
                ♻️ PyroCycle AI
              </div>

              <h1>{t.home}</h1>

              <p>{t.homeDesc}</p>
            </div>

            <button
              className="language-mini"
              onClick={() => setScreen("language")}
            >
              {languages.find(
                (x) => x.id === language
              )?.native}
            </button>

          </div>

          <div className="worker-actions">

            <button
              className="worker-action-card scan-action"
             onClick={() => setScreen("scan")}
            >
              <span className="action-icon">📸</span>

              <div>
                <h3>{t.scan}</h3>
                <p>{t.scanDesc}</p>
              </div>

              <span>→</span>
            </button>

            <button
              className="worker-action-card buyer-action"
              onClick={() => {
             sessionStorage.removeItem("fromScanFlow");
            setScreen("buyers");
            }}
            >
              <span className="action-icon">📍</span>

              <div>
                <h3>{t.buyer}</h3>
                <p>{t.buyerDesc}</p>
              </div>

              <span>→</span>
            </button>

          </div>

          <button
  className="my-batches-card"
  onClick={() => setScreen("batches")}
>

  <span>📦</span>

  <div>
    <h3>{t.batches}</h3>
    <p>{t.batchesDesc}</p>
  </div>

  <span>→</span>

</button>

        </div>

      </div>
    );
  }

   // =========================
  // SCAN PLASTIC
  // =========================

  if (screen === "scan") {
    return (
      <div className="worker-page">

        <button
          className="worker-back"
          onClick={() => setScreen("home")}
        >
          ← Back
        </button>

        <div className="worker-container">

          <div className="worker-logo small">
            📸
          </div>

          <h1>PyroCycle AI</h1>

          <p className="worker-tagline">
            Scan Plastic
          </p>

          <div className="worker-card scan-card">

            {!imagePreview ? (
              <>
                <div className="scan-icon-large">
                  📤
                </div>

                <h2>Upload Plastic Photo</h2>

                <p>
                  Upload a clear photo of your collected plastic waste.
                </p>

                <label className="worker-primary-button upload-button">
                  📤 Upload Photo

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    hidden
                  />
                </label>

                <p className="scan-note">
                  Supported formats: JPG, JPEG, PNG
                </p>
              </>
            ) : (
              <>
                <h2>Photo Uploaded</h2>

                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Uploaded plastic waste"
                    className="plastic-preview"
                  />
                </div>

                <button
                  className="worker-primary-button"
               onClick={() => setScreen("composition")}
                >
                  🔍 Analyze Plastic
                </button>

                <button
                  className="worker-secondary-button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  Upload Another Photo
                </button>
              </>
            )}

          </div>

        </div>

      </div>
    );
  }
// =========================
// AI COMPOSITION RESULT
// =========================

if (screen === "composition") {
  return (
    <div className="worker-page">

      <button
        className="worker-back"
        onClick={() => setScreen("scan")}
      >
        ← Back
      </button>

      <div className="worker-container">

        <div className="worker-logo small">
          🔍
        </div>

        <h1>AI Plastic Analysis</h1>

        <p className="worker-tagline">
          Estimated composition of your collected waste
        </p>

        <div className="worker-card">

          <div className="composition-list">

            {Object.entries(composition).map(
              ([material, percentage]) => (
                <div
                  className="composition-row"
                  key={material}
                >
                  <div>
                    <strong>{material}</strong>
                  </div>

                  <strong>{percentage}%</strong>
                </div>
              )
            )}

          </div>

          <div className="confidence-box">
            <span>AI Confidence</span>
            <strong>86%</strong>
          </div>

          <div className="worker-warning">
            ⚠️ AI estimate only. For accurate commercial
            grading, verify by physical sorting.
          </div>

          <button
            className="worker-primary-button"
            onClick={() => setScreen("weight")}
          >
            Continue →
          </button>

        </div>

      </div>

    </div>
  );
}
// =========================
// WEIGHT + VALUE
// =========================

if (screen === "weight") {

  const weight = Number(batchWeight) || 0;

  const materialKg = {};

  Object.entries(composition).forEach(
    ([material, percentage]) => {
      materialKg[material] =
        weight * (percentage / 100);
    }
  );

  const grossValue = Object.entries(materialKg).reduce(
    (total, [material, kg]) => {
      return total + kg * referencePrices[material];
    },
    0
  );

  // Conservative / probable realization factor
  const conservativeValue = grossValue * 0.85;

  const sorting = 120;
  const transportation = 150;
  const contamination = 80;
  const aggregation = 100;

  const finalPayout = Math.max(
    0,
    conservativeValue -
      sorting -
      transportation -
      contamination -
      aggregation
  );

  const lowerRange = Math.max(
    0,
    Math.round(finalPayout * 0.95)
  );

  const upperRange = Math.round(
    finalPayout * 1.05
  );

  return (
    <div className="worker-page">

      <button
        className="worker-back"
        onClick={() => setScreen("composition")}
      >
        ← Back
      </button>

      <div className="worker-container">

        <div className="worker-logo small">
          ⚖️
        </div>

        <h1>Batch Value</h1>

        <p className="worker-tagline">
          Enter the total weight of your collected plastic
        </p>

        <div className="worker-card">

          <label className="weight-label">
            Total batch weight
          </label>

          <div className="weight-input-wrapper">
            <input
              type="number"
              min="0"
              step="0.1"
              value={batchWeight}
              onChange={(e) =>
                setBatchWeight(e.target.value)
              }
              placeholder="Enter weight"
            />

            <span>kg</span>
          </div>

          {weight > 0 && (
            <>

              <h3 className="value-section-title">
                Estimated material
              </h3>

              <div className="composition-list">

                {Object.entries(materialKg).map(
                  ([material, kg]) => (
                    <div
                      className="composition-row"
                      key={material}
                    >
                      <span>
                        {material}
                      </span>

                      <strong>
                        {kg.toFixed(1)} kg
                      </strong>
                    </div>
                  )
                )}

              </div>

              <div className="gross-value-box">

                <span>
                  Gross reference value
                </span>

                <strong>
                  ₹{Math.round(grossValue).toLocaleString("en-IN")}
                </strong>

              </div>

              <div className="deduction-box">

                <h3>
                  Conservative settlement
                </h3>

                <div>
                  Probable realization adjustment
                  <span>
                    −₹
                    {Math.round(
                      grossValue - conservativeValue
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  Sorting
                  <span>−₹120</span>
                </div>

                <div>
                  Transportation
                  <span>−₹150</span>
                </div>

                <div>
                  Contamination
                  <span>−₹80</span>
                </div>

                <div>
                  Aggregation / service
                  <span>−₹100</span>
                </div>

              </div>

              <div className="final-payout-box">

                <span>
                  Indicative fair-value payout
                </span>

                <strong>
                  ₹{Math.round(finalPayout).toLocaleString("en-IN")}
                </strong>

                <small>
                  Expected range: ₹
                  {lowerRange.toLocaleString("en-IN")}
                  {" – "}
                  ₹
                  {upperRange.toLocaleString("en-IN")}
                </small>

              </div>

              <div className="worker-warning">

                ℹ️ This is an indicative estimate based on
                AI composition, reference prices and
                conservative deductions. Actual settlement
                may vary after physical grading and buyer
                verification.

              </div>

              <button
                className="worker-primary-button"
               onClick={() => {
            sessionStorage.setItem("fromScanFlow", "true");
             setScreen("buyers");
                }}
              >
                Continue →
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}
// =========================
// BUYER / PICKUP SCREEN
// =========================

if (screen === "buyers") {

  const fromScanFlow =
    sessionStorage.getItem("fromScanFlow") === "true";
  const buyers = [
    {
      id: 1,
      name: "ABC Recycling Centre",
      distance: "3.2 km",
      accepts: "PP • HDPE • LDPE • PS",
      pickupCharge: 80,
    },
    {
      id: 2,
      name: "GreenCycle Aggregator",
      distance: "4.7 km",
      accepts: "Mixed Plastic",
      pickupCharge: 100,
    },
    {
      id: 3,
      name: "Eco Plastic Recovery",
      distance: "6.1 km",
      accepts: "PP • HDPE • PS",
      pickupCharge: 120,
    },
  ];

  return (
    <div className="worker-page">

    <button
  className="worker-back"
  onClick={() => {
    sessionStorage.removeItem("fromScanFlow");
    setScreen("home");
  }}
>
  ← Back
</button>

      <div className="worker-container">

        <div className="worker-logo small">
          📍
        </div>

        <h1>Nearby Buyers & Pickup</h1>

        <p className="worker-tagline">
          Choose a nearby recycler or pickup partner
        </p>

        <div className="worker-card">

          <h2>Available Nearby</h2>

          <p className="scan-note">
            Demo facilities for hackathon
          </p>

          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              style={{
                border: "1px solid rgba(60, 220, 160, 0.2)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >

              <h3 style={{ marginBottom: "8px" }}>
                {buyer.name}
              </h3>

              <p>
                📍 {buyer.distance}
              </p>

              <p>
                ♻️ Accepts: {buyer.accepts}
              </p>

              <p>
                🚚 Pickup charge: ₹{buyer.pickupCharge}
              </p>

             {fromScanFlow ? (
    <button
    className="worker-primary-button"
    onClick={() => {
      sessionStorage.setItem(
        "selectedBuyer",
        JSON.stringify(buyer)
      );

      setScreen("pickup-summary");
    }}
  >
    Select Buyer →
    </button>
    ) : null}

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
// =========================
// PICKUP SUMMARY
// =========================

if (screen === "pickup-summary") {

  const selectedBuyer = JSON.parse(
    sessionStorage.getItem("selectedBuyer") || "null"
  );

  const weight = Number(batchWeight) || 0;

  const materialKg = {};

  Object.entries(composition).forEach(
    ([material, percentage]) => {
      materialKg[material] =
        weight * (percentage / 100);
    }
  );

  const grossValue = Object.entries(materialKg).reduce(
    (total, [material, kg]) => {
      return total + kg * referencePrices[material];
    },
    0
  );

  const conservativeValue = grossValue * 0.85;

  const sorting = 120;
  const transportation = 150;
  const contamination = 80;
  const aggregation = 100;

  const basePayout = Math.max(
    0,
    conservativeValue -
      sorting -
      transportation -
      contamination -
      aggregation
  );

  const pickupCharge = selectedBuyer?.pickupCharge || 0;

  const finalWorkerAmount = Math.max(
    0,
    basePayout - pickupCharge
  );

  const lowerRange = Math.max(
    0,
    Math.round(finalWorkerAmount * 0.95)
  );

  const upperRange = Math.round(
    finalWorkerAmount * 1.05
  );

  return (
    <div className="worker-page">

      <button
        className="worker-back"
        onClick={() => setScreen("buyers")}
      >
        ← Back
      </button>

      <div className="worker-container">

        <div className="worker-logo small">
          💰
        </div>

        <h1>Pickup & Settlement</h1>

        <p className="worker-tagline">
          Your estimated amount after pickup costs
        </p>

        <div className="worker-card">

          <h2>Your Selected Buyer</h2>

          {selectedBuyer && (
            <>
              <div className="composition-list">

                <div className="composition-row">
                  <span>Buyer</span>
                  <strong>
                    {selectedBuyer.name}
                  </strong>
                </div>

                <div className="composition-row">
                  <span>Distance</span>
                  <strong>
                    {selectedBuyer.distance}
                  </strong>
                </div>

                <div className="composition-row">
                  <span>Batch weight</span>
                  <strong>
                    {weight} kg
                  </strong>
                </div>

              </div>

              <div className="gross-value-box">

                <span>
                  Gross reference value
                </span>

                <strong>
                  ₹{Math.round(grossValue).toLocaleString("en-IN")}
                </strong>

              </div>

              <div className="deduction-box">

                <h3>
                  Estimated deductions
                </h3>

                <div>
                  Conservative realization
                  <span>
                    −₹
                    {Math.round(
                      grossValue - conservativeValue
                    ).toLocaleString("en-IN")}
                  </span>
                </div>

                <div>
                  Sorting
                  <span>−₹120</span>
                </div>

                <div>
                  Transportation
                  <span>−₹150</span>
                </div>

                <div>
                  Contamination
                  <span>−₹80</span>
                </div>

                <div>
                  Aggregation / service
                  <span>−₹100</span>
                </div>

                <div>
                  Pickup charge
                  <span>
                    −₹{pickupCharge}
                  </span>
                </div>

              </div>

              <div className="final-payout-box">

                <span>
                  Estimated amount you receive
                </span>

                <strong>
                  ₹
                  {Math.round(
                    finalWorkerAmount
                  ).toLocaleString("en-IN")}
                </strong>

                <small>
                  Expected range: ₹
                  {lowerRange.toLocaleString("en-IN")}
                  {" – "}
                  ₹
                  {upperRange.toLocaleString("en-IN")}
                </small>

              </div>

              <div className="worker-warning">

                ℹ️ This is an indicative fair-value
                estimate. Final settlement may vary
                after physical weighing, sorting and
                buyer verification.

              </div>

              <button
  className="worker-primary-button"
  onClick={() => {
    const selectedBuyer = JSON.parse(
      sessionStorage.getItem("selectedBuyer") || "null"
    );

    const existingBatches = JSON.parse(
      localStorage.getItem("pyrocycleBatches") || "[]"
    );

    const newBatch = {
      id: `PYS${Date.now().toString().slice(-4)}`,
      weight: Number(batchWeight) || 0,
      buyer: selectedBuyer?.name || "Selected Buyer",
      amount: Math.round(finalWorkerAmount || 0),
      status: "Pickup Requested",
      date: new Date().toLocaleDateString("en-IN"),
    };

    localStorage.setItem(
      "pyrocycleBatches",
      JSON.stringify([
        newBatch,
        ...existingBatches,
      ])
    );
    const pickupRequest = {
  id: `REQ${Date.now().toString().slice(-6)}`,

  batchId: `PYS${Date.now().toString().slice(-4)}`,

  workerName: worker.name || "Worker",
  workerLocation: worker.location || "Location not provided",

  buyerId: selectedBuyer?.id,
  buyerName: selectedBuyer?.name || "Selected Buyer",

  weight: Number(batchWeight) || 0,

  composition: {
    PP: Number(composition.PP || 0),
    HDPE: Number(composition.HDPE || 0),
    LDPE: Number(composition.LDPE || 0),
    PS: Number(composition.PS || 0),
    PVC: Number(composition.PVC || 0),
    PET: Number(composition.PET || 0),
  },

  temperature: 450,
  heatingRate: 10,
  particleSize: 1,
  feedSize: 10,
  catalyst: "None",
  reactorType: "Fixed Bed",

  workerAmount: Number(finalWorkerAmount) || 0,

  status: "pending",

  createdAt: new Date().toISOString(),
};

const existingRequests = JSON.parse(
  localStorage.getItem("pyrocyclePickupRequests") || "[]"
);

localStorage.setItem(
  "pyrocyclePickupRequests",
  JSON.stringify([
    pickupRequest,
    ...existingRequests,
  ])
);

    setScreen("pickup-confirmed");
  }}
>
  🚚 Confirm Pickup
</button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}
// =========================
// PICKUP CONFIRMED
// =========================

if (screen === "pickup-confirmed") {

  const selectedBuyer = JSON.parse(
    sessionStorage.getItem("selectedBuyer") || "null"
  );

  return (
    <div className="worker-page">

      <div className="worker-container">

        <div className="worker-logo">
          ✅
        </div>

        <h1>Pickup Confirmed</h1>

        <p className="worker-tagline">
          Your pickup request has been successfully submitted.
        </p>

        <div className="worker-card">

          <div className="final-payout-box">

            <span>
              Pickup Status
            </span>

            <strong>
              🟢 Confirmed
            </strong>

          </div>

          <div className="composition-list">

            <div className="composition-row">
              <span>Pickup Partner</span>
              <strong>
                {selectedBuyer?.name || "Selected Buyer"}
              </strong>
            </div>

            <div className="composition-row">
              <span>Estimated Weight</span>
              <strong>
                {batchWeight || 0} kg
              </strong>
            </div>

          </div>

          <div className="worker-warning">

            📞 Pickup service personnel will contact
            you shortly to coordinate the collection.

          </div>

          <div className="scan-note">

            <strong>What happens next?</strong>

            <br />
            <br />

            1. Pickup partner contacts you.
            <br />
            2. Your plastic batch is collected.
            <br />
            3. Weight and quality are verified.
            <br />
            4. Final settlement is completed.

          </div>

         <button
  className="worker-primary-button"
  onClick={() => {
    sessionStorage.removeItem("selectedBuyer");
    sessionStorage.removeItem("fromScanFlow");
    setScreen("home");
  }}
>
  ← Back to Worker Home
</button>
        </div>

      </div>

    </div>
  );
}
// =========================
// MY BATCHES
// =========================

if (screen === "batches") {
    const batches = JSON.parse(
  localStorage.getItem("pyrocycleBatches") || "[]"
);

  return (
    <div className="worker-page">

      <button
        className="worker-back"
        onClick={() => setScreen("home")}
      >
        ← Back
      </button>

      <div className="worker-container">

        <div className="worker-logo small">
          📦
        </div>

        <h1>My Batches</h1>

        <p className="worker-tagline">
          Your previous plastic transactions
        </p>

        <div className="worker-card">

          {batches.map((batch) => (
            <div
              key={batch.id}
              style={{
                border: "1px solid rgba(60, 220, 160, 0.2)",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >

                <h3>
                  📦 Batch #{batch.id}
                </h3>

                <span>
                  ✅ {batch.status}
                </span>

              </div>

              <div className="composition-list">

                <div className="composition-row">
                  <span>Weight</span>
                  <strong>
                    {batch.weight} kg
                  </strong>
                </div>

                <div className="composition-row">
                  <span>Buyer</span>
                  <strong>
                    {batch.buyer}
                  </strong>
                </div>

                <div className="composition-row">
                  <span>Amount received</span>
                  <strong>
                    ₹{batch.amount.toLocaleString("en-IN")}
                  </strong>
                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
  return null;
}

export default WorkerApp;