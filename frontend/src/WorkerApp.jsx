import { useState, useEffect, useContext } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { apiFetch } from "./utils/api";
import { speakText, stopSpeaking, registerSpeechStateListener } from "./utils/speech";

const getPolymerBadgeStyle = (polymer) => {
  const map = {
    PP: { bg: "rgba(0, 255, 135, 0.15)", border: "rgba(0, 255, 135, 0.4)", text: "#00ff87", code: "♷ PP" },
    HDPE: { bg: "rgba(96, 239, 255, 0.15)", border: "rgba(96, 239, 255, 0.4)", text: "#60efff", code: "♴ HDPE" },
    LDPE: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.4)", text: "#60a5fa", code: "♶ LDPE" },
    PS: { bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.4)", text: "#c084fc", code: "♸ PS" },
    PVC: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.4)", text: "#fbbf24", code: "♵ PVC" },
    PET: { bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.4)", text: "#fb7185", code: "♳ PET" },
  };
  return map[polymer] || { bg: "rgba(255, 255, 255, 0.1)", border: "rgba(255, 255, 255, 0.2)", text: "#e2e8f0", code: `♻ ${polymer}` };
};

const WorkflowBreadcrumbs = ({ currentStep, language = "en" }) => {
  const steps = [
    {
      id: 1,
      icon: "📸",
      labels: {
        en: "1. Scan",
        hi: "1. स्कैन",
        bn: "1. স্ক্যান",
        ta: "1. ஸ்கேன்",
        te: "1. స్కాన్",
      }
    },
    {
      id: 2,
      icon: "🔍",
      labels: {
        en: "2. Polymers",
        hi: "2. पॉलीमर",
        bn: "2. পলিমার",
        ta: "2. பாலிமர்",
        te: "2. పాలిమర్",
      }
    },
    {
      id: 3,
      icon: "⚖️",
      labels: {
        en: "3. Value",
        hi: "3. मूल्य",
        bn: "3. মূল্য",
        ta: "3. மதிப்பு",
        te: "3. విలువ",
      }
    },
    {
      id: 4,
      icon: "🚚",
      labels: {
        en: "4. Recyclers",
        hi: "4. खरीदार",
        bn: "4. ক্রেতা",
        ta: "4. வாங்குபவர்",
        te: "4. కొనుగోలు",
      }
    },
    {
      id: 5,
      icon: "✅",
      labels: {
        en: "5. Confirmed",
        hi: "5. कन्फर्म",
        bn: "5. নিশ্চিত",
        ta: "5. உறுதி",
        te: "5. ధృవీకరణ",
      }
    }
  ];

  return (
    <div className="worker-stepper">
      {steps.map((st, idx) => {
        const isCompleted = currentStep > st.id;
        const isCurrent = currentStep === st.id;
        return (
          <div key={st.id} className="stepper-item-wrap">
            <div className={`stepper-node ${isCompleted ? "completed" : ""} ${isCurrent ? "current" : ""}`}>
              <span className="stepper-icon">{isCompleted ? "✓" : st.icon}</span>
              <span className="stepper-text">{st.labels[language] || st.labels.en}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`stepper-track ${isCompleted ? "active" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

function WorkerApp() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screen = location.pathname.split("/").pop() || "home";
  const setScreen = (s) => navigate(`/worker/${s}`);
  
  const [language, setLanguage] = useState(() => localStorage.getItem("pyrocycle_lang") || "en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Purge legacy offline cache from early testing
    localStorage.removeItem("pyrocycleBatches");
    localStorage.removeItem("pyrocyclePickupRequests");

    registerSpeechStateListener((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => stopSpeaking();
  }, []);

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
    PET: 35,
    PVC: 28,
  };

  const [buyersList, setBuyersList] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [batchesList, setBatchesList] = useState([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  const [worker, setWorker] = useState({
    name: user?.name || "",
    location: user?.location || "",
    phone: user?.phone || "",
    collection: "plastic",
  });

  useEffect(() => {
    if (user) {
      setWorker((prev) => ({
        ...prev,
        name: user.name || prev.name || "Worker",
        location: user.location || prev.location || "Local Hub",
        phone: user.phone || prev.phone || "",
      }));
    }
  }, [user]);

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
      worker: "Waste Collector",
      name: "Name or nickname",
      location: "Location / Area",
      phone: "Phone number (optional)",
      collect: "What do you collect?",
      plastic: "Plastic",
      mixed: "Mixed waste",
      both: "Both",
      start: "Get Started",
      home: "Worker Home",
      homeDesc: "Turn your collected plastic waste into maximum earnings.",
      scan: "Scan Plastic",
      scanDesc: "Identify plastic polymers in your collected waste with AI.",
      value: "Check Value",
      valueDesc: "Estimate the real market value of your batch.",
      buyer: "Find Buyer / Pickup",
      buyerDesc: "Connect with verified recyclers and lock in your price.",
      batches: "My Batches",
      batchesDesc: "Your collection history, weight slips, and settlements",
      required: "Please enter your name and location.",
      collectionRequired: "Please select what you collect.",
      voiceGuide: "Voice Guide",
      stopVoice: "Stop Audio",
      listenNow: "Listen",
      logout: "Logout",
      back: "Back",
      uploadPhoto: "Upload Plastic Photo",
      uploadDesc: "Take or upload a clear photo of your plastic waste pile.",
      photoUploaded: "Photo Ready",
      analyzing: "Analyzing with AI...",
      analyzeBtn: "Analyze Plastic Waste",
      compositionTitle: "Plastic Composition",
      compSubtitle: "AI detected breakdown of recyclable polymers",
      confidence: "AI Confidence",
      checkValueBtn: "Check Batch Value →",
      batchValueTitle: "Estimated Batch Value",
      enterWeight: "Total Batch Weight",
      grossValue: "Estimated Gross Value",
      estPayout: "Estimated Net Payout",
      confirmPickup: "Confirm Pickup",
      pickupConfirmedTitle: "Pickup Confirmed! ✅",
      pickupConfirmedDesc: "Your request is registered. Recycler partner will arrive for digital gate verification and instant payout.",
      voiceHome: "Welcome to PyroCycle. Turn your collected plastic into maximum earnings. Tap Scan Plastic to detect polymers with AI, or tap Find Buyer to schedule a pickup.",
      voiceScan: "Please upload a clear photo of your collected plastic pile. Then tap Analyze Plastic to detect polymers.",
      voiceComp: "Polymer analysis complete. We detected the plastic composition. Tap Check Value to see what your batch is worth.",
      voiceValue: "Enter your total weight in kilograms. We calculate the market value based on live polymer prices.",
      voiceBuyers: "Here are verified recycling buyers matching your plastics. Choose your partner and tap Confirm Pickup.",
      voiceConfirmed: "Your pickup request is confirmed! The recycler will arrive soon to weigh and settle payment.",
      voiceBatches: "Here is your history of all waste collections, digital weigh slips, and payouts.",
      voiceLang: "Please select your preferred regional language. Voice guidance will assist you in this language.",
      voiceOnboarding: "Please fill in your name and collection area to personalize your collector profile."
    },

    hi: {
      welcome: "स्वागत है",
      chooseLanguage: "अपनी भाषा चुनें",
      continue: "आगे बढ़ें",
      worker: "कचरा संग्रहकर्ता",
      name: "नाम या उपनाम",
      location: "स्थान / इलाका",
      phone: "फोन नंबर (वैकल्पिक)",
      collect: "आप क्या एकत्र करते हैं?",
      plastic: "प्लास्टिक",
      mixed: "मिश्रित कचरा",
      both: "दोनों",
      start: "शुरू करें",
      home: "वर्कर होम",
      homeDesc: "अपने एकत्र किए गए प्लास्टिक से अधिकतम कमाई करें।",
      scan: "प्लास्टिक स्कैन करें",
      scanDesc: "AI से एकत्र कचरे में प्लास्टिक पॉलीमर की पहचान करें।",
      value: "मूल्य देखें",
      valueDesc: "अपने बैच का वास्तविक बाजार मूल्य जानें।",
      buyer: "खरीदार / पिकअप खोजें",
      buyerDesc: "सत्यापित रीसाइक्लर्स से जुड़ें और मूल्य तय करें।",
      batches: "मेरे बैच",
      batchesDesc: "आपके पिछले संग्रह, वजन पर्ची और भुगतान",
      required: "कृपया अपना नाम और स्थान दर्ज करें।",
      collectionRequired: "कृपया चुनें कि आप क्या एकत्र करते हैं।",
      voiceGuide: "ऑडियो गाइड",
      stopVoice: "ऑडियो रोकें",
      listenNow: "सुनें",
      logout: "लॉगआउट",
      back: "पीछे",
      uploadPhoto: "प्लास्टिक का फोटो अपलोड करें",
      uploadDesc: "अपने एकत्र प्लास्टिक कचरे की स्पष्ट तस्वीर लें या अपलोड करें।",
      photoUploaded: "फोटो तैयार है",
      analyzing: "AI से विश्लेषण हो रहा है...",
      analyzeBtn: "प्लास्टिक का विश्लेषण करें",
      compositionTitle: "प्लास्टिक संरचना",
      compSubtitle: "AI द्वारा पहचाने गए पॉलीमर का विवरण",
      confidence: "AI सटीकता",
      checkValueBtn: "बैच का मूल्य देखें →",
      batchValueTitle: "अनुमानित बैच मूल्य",
      enterWeight: "कुल बैच वजन",
      grossValue: "अनुमानित कुल मूल्य",
      estPayout: "अनुमानित शुद्ध भुगतान",
      confirmPickup: "पिकअप कन्फर्म करें",
      pickupConfirmedTitle: "पिकअप कन्फर्म हो गया! ✅",
      pickupConfirmedDesc: "आपका अनुरोध दर्ज हो गया है। रीसाइक्लर पार्टनर डिजिटल वजन और तत्काल भुगतान के लिए जल्द पहुंचेगा।",
      voiceHome: "पायरोसाइकिल में आपका स्वागत है। अपने एकत्र किए गए प्लास्टिक से अधिक कमाई करें। पॉलीमर पहचानने के लिए 'प्लास्टिक स्कैन करें' पर टैप करें, या पिकअप के लिए खरीदार खोजें।",
      voiceScan: "कृपया अपने प्लास्टिक कचरे की एक साफ फोटो अपलोड करें। फिर पॉलीमर पहचानने के लिए 'प्लास्टिक का विश्लेषण करें' पर टैप करें।",
      voiceComp: "पॉलीमर विश्लेषण पूरा हुआ। अपने बैच का मूल्य जानने के लिए 'बैच का मूल्य देखें' पर टैप करें।",
      voiceValue: "कृपया किलोग्राम में कुल वजन दर्ज करें। हम वर्तमान पॉलीमर दरों के आधार पर आपके बैच का मूल्य तय करते हैं।",
      voiceBuyers: "ये आपके प्लास्टिक से मेल खाने वाले सत्यापित रीसाइक्लिंग खरीदार हैं। अपनी पसंद का खरीदार चुनें और पिकअप कन्फर्म करें।",
      voiceConfirmed: "पिकअप सफलतापूर्वक कन्फर्म हो गया है! रीसाइक्लर पार्टनर वजन और भुगतान निपटान के लिए जल्द संपर्क करेगा।",
      voiceBatches: "यहाँ आपके सभी कचरा संग्रह, वजन पर्चियों और भुगतानों का इतिहास है।",
      voiceLang: "कृपया अपनी पसंदीदा भाषा चुनें। ऑडियो गाइड इसी भाषा में आपको निर्देश देगा।",
      voiceOnboarding: "कृपया अपनी प्रोफ़ाइल पूरी करने के लिए अपना नाम और क्षेत्र दर्ज करें।"
    },

    bn: {
      welcome: "স্বাগতম",
      chooseLanguage: "আপনার ভাষা নির্বাচন করুন",
      continue: "এগিয়ে যান",
      worker: "বর্জ্য সংগ্রাহক",
      name: "নাম বা ডাকনাম",
      location: "স্থান / এলাকা",
      phone: "ফোন নম্বর (ঐচ্ছিক)",
      collect: "আপনি কী সংগ্রহ করেন?",
      plastic: "প্লাস্টিক",
      mixed: "মিশ্র বর্জ্য",
      both: "উভয়",
      start: "শুরু করুন",
      home: "কর্মী হোম",
      homeDesc: "আপনার সংগ্রহ করা প্লাস্টিক বর্জ্য থেকে সর্বোচ্চ আয় করুন।",
      scan: "প্লাস্টিক স্ক্যান করুন",
      scanDesc: "AI দিয়ে আপনার বর্জ্যে পলিমার শনাক্ত করুন।",
      value: "মূল্য দেখুন",
      valueDesc: "আপনার ব্যাচের আসল বাজার মূল্য জানুন।",
      buyer: "ক্রেতা / পিকআপ খুঁজুন",
      buyerDesc: "অনুমোদিত রিসাইক্লারের সাথে যুক্ত হন।",
      batches: "আমার ব্যাচ",
      batchesDesc: "আপনার সংগ্রহ ইতিহাস এবং পেমেন্ট রসিদ",
      required: "অনুগ্রহ করে আপনার নাম এবং স্থান লিখুন।",
      collectionRequired: "আপনি কী সংগ্রহ করেন তা নির্বাচন করুন।",
      voiceGuide: "ভয়েস গাইড",
      stopVoice: "অডিও বন্ধ",
      listenNow: "শুনুন",
      logout: "লগআউট",
      back: "ফিরে যান",
      uploadPhoto: "প্লাস্টিকের ছবি আপলোড করুন",
      uploadDesc: "আপনার সংগৃহীত প্লাস্টিক বর্জ্যের একটি পরিষ্কার ছবি তুলুন বা আপলোড করুন।",
      photoUploaded: "ছবি প্রস্তুত",
      analyzing: "AI বিশ্লেষণ করছে...",
      analyzeBtn: "প্লাস্টিক বিশ্লেষণ করুন",
      compositionTitle: "প্লাস্টিকের গঠন",
      compSubtitle: "শনাক্ত পুনর্ব্যবহারযোগ্য পলিমার অনুপাত",
      confidence: "AI আত্মবিশ্বাস",
      checkValueBtn: "ব্যাচের মূল্য দেখুন →",
      batchValueTitle: "ব্যাচের আনুমানিক মূল্য",
      enterWeight: "মোট ব্যাচ ওজন",
      grossValue: "আনুমানিক মোট মূল্য",
      estPayout: "আনুমানিক চূড়ান্ত অর্থ",
      confirmPickup: "পিকআপ নিশ্চিত করুন",
      pickupConfirmedTitle: "পিকআপ নিশ্চিত হয়েছে! ✅",
      pickupConfirmedDesc: "আপনার পিকআপ অনুরোধ সফল হয়েছে। রিসাইক্লার পার্টনার দ্রুত ওজন ও পেমেন্ট নিষ্পত্তি করতে আসবে।",
      voiceHome: "পাইরোসাইকেলে স্বাগতম। সংগৃহীত প্লাস্টিক থেকে সর্বোচ্চ মূল্য পান। প্লাস্টিক স্ক্যান করুন বা পিকআপের জন্য ক্রেতা খুঁজুন।",
      voiceScan: "অনুগ্রহ করে আপনার প্লাস্টিক বর্জ্যের পরিষ্কার ছবি আপলোড করুন। তারপর প্লাস্টিক বিশ্লেষণ করুন বোতামে চাপুন।",
      voiceComp: "পলিমার বিশ্লেষণ সম্পন্ন হয়েছে। আপনার ব্যাচের মূল্য দেখতে 'মূল্য দেখুন' চাপুন।",
      voiceValue: "কেজিতে মোট ওজন লিখুন। বর্তমান বাজার দর অনুযায়ী মূল্য হিসাব করা হবে।",
      voiceBuyers: "এখানে আপনার প্লাস্টিকের জন্য উপযুক্ত ক্রেতা রয়েছে। পিকআপ নিশ্চিত করুন।",
      voiceConfirmed: "পিকআপ নিশ্চিত হয়েছে! রিসাইক্লার পার্টনার ওজন ও পেমেন্ট করতে আসবে।",
      voiceBatches: "এখানে আপনার আগের সব বর্জ্য সংগ্রহ ও পেমেন্টের তালিকা রয়েছে।",
      voiceLang: "আপনার পছন্দের ভাষা নির্বাচন করুন। ভয়েস গাইড এই ভাষায় কথা বলবে।",
      voiceOnboarding: "আপনার নাম ও এলাকা লিখে প্রোফাইল তৈরি করুন।"
    },

    ta: {
      welcome: "வரவேற்கிறோம்",
      chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
      continue: "தொடரவும்",
      worker: "கழிவு சேகரிப்பாளர்",
      name: "பெயர் அல்லது புனைப்பெயர்",
      location: "இடம் / பகுதி",
      phone: "தொலைபேசி எண் (விருப்பம்)",
      collect: "நீங்கள் எதை சேகரிக்கிறீர்கள்?",
      plastic: "பிளாஸ்டிக்",
      mixed: "கலப்பு கழிவு",
      both: "இரண்டும்",
      start: "தொடங்குங்கள்",
      home: "தொழிலாளர் முகப்பு",
      homeDesc: "நீங்கள் சேகரித்த பிளாஸ்டிக் கழிவுகளுக்கு சிறந்த வருமானம் பெறுங்கள்.",
      scan: "பிளாஸ்டிக் ஸ்கேன்",
      scanDesc: "AI மூலம் கழிவுகளில் உள்ள பாலிமர்களைக் கண்டறியவும்.",
      value: "மதிப்பைப் பார்க்கவும்",
      valueDesc: "உங்கள் தொகுப்பின் சந்தை மதிப்பை அறியவும்.",
      buyer: "வாங்குபவர் / பிக்கப்",
      buyerDesc: "மறுசுழற்சியாளருடன் இணைந்து விலையை முடிவு செய்யவும்.",
      batches: "எனது தொகுப்புகள்",
      batchesDesc: "உங்கள் முந்தைய சேகரிப்புகள் மற்றும் பரிவர்த்தனைகள்",
      required: "உங்கள் பெயர் மற்றும் இடத்தை உள்ளிடவும்.",
      collectionRequired: "நீங்கள் சேகரிப்பதைத் தேர்ந்தெடுக்கவும்.",
      voiceGuide: "குரல் வழிகாட்டி",
      stopVoice: "ஆடியோ நிறுத்து",
      listenNow: "கேளுங்கள்",
      logout: "வெளியேறு",
      back: "பின்செல்",
      uploadPhoto: "பிளாஸ்டிக் புகைப்படம் பதிவேற்றவும்",
      uploadDesc: "சேகரிக்கப்பட்ட பிளாஸ்டிக் குவியலின் தெளிவான புகைப்படத்தைப் பதிவேற்றவும்.",
      photoUploaded: "புகைப்படம் தயார்",
      analyzing: "AI ஆய்வு செய்கிறது...",
      analyzeBtn: "பிளாஸ்டிக்கை பகுப்பாய்வு செய்",
      compositionTitle: "பிளாஸ்டிக் கலவை",
      compSubtitle: "கண்டறியப்பட்ட பாலிமர் விபரம்",
      confidence: "AI துல்லியம்",
      checkValueBtn: "மதிப்பை கணக்கிடுங்கள் →",
      batchValueTitle: "மதிப்பிடப்பட்ட தொகை",
      enterWeight: "மொத்த எடை (கிலோ)",
      grossValue: "மதிப்பிடப்பட்ட மொத்த மதிப்பு",
      estPayout: "மதிப்பிடப்பட்ட நிகர தொகை",
      confirmPickup: "பிக்கப்பை உறுதிசெய்",
      pickupConfirmedTitle: "பிக்கப் உறுதி செய்யப்பட்டது! ✅",
      pickupConfirmedDesc: "உங்கள் கோரிக்கை பதிவாகிவிட்டது. மறுசுழற்சியாளர் நேரில் வந்து எடை சரிபார்த்து உடனடி பணம் வழங்குவார்.",
      voiceHome: "பைரோசைக்கிளுக்கு வரவேற்கிறோம். உங்கள் பிளாஸ்டிக் கழிவுக்கு சிறந்த விலை பெறுங்கள். பிளாஸ்டிக் ஸ்கேன் செய்ய தட்டவும் அல்லது பிக்கப் பதிவு செய்யவும்.",
      voiceScan: "உங்கள் பிளாஸ்டிக் கழிவின் புகைப்படத்தைப் பதிவேற்றவும். பிறகு பகுப்பாய்வு பொத்தானை அழுத்தவும்.",
      voiceComp: "பாலிமர் ஆய்வு முடிந்தது. உங்கள் தொகுப்பின் மதிப்பை அறிய மதிப்பை கணக்கிடுங்கள் பொத்தானை அழுத்தவும்.",
      voiceValue: "தோராயமான எடையை கிலோவில் உள்ளிடவும். தற்போதைய சந்தை விலையின்படி மதிப்பு கணக்கிடப்படும்.",
      voiceBuyers: "உங்கள் பிளாஸ்டிக்கிற்கு பொருத்தமான வாங்குபவர்கள் இங்கே உள்ளனர். பிக்கப்பை உறுதிசெய்யுங்கள்.",
      voiceConfirmed: "பிக்கப் வெற்றிகரமாக உறுதி செய்யப்பட்டது! மறுசுழற்சியாளர் உங்கள் இடத்திற்கு வந்து பணம் வழங்குவார்.",
      voiceBatches: "உங்கள் முந்தைய கழிவு சேகரிப்பு மற்றும் பணம் பெற்ற விவரங்கள் இங்கே உள்ளன.",
      voiceLang: "உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும். குரல் வழிகாட்டி இந்த மொழியில் உதவும்.",
      voiceOnboarding: "உங்கள் சுயவிவரத்தை முடிக்க உங்கள் பெயர் மற்றும் பகுதியை உள்ளிடவும்."
    },

    te: {
      welcome: "స్వాగతం",
      chooseLanguage: "మీ భాషను ఎంచుకోండి",
      continue: "కొనసాగించండి",
      worker: "వ్యర్థాల సేకరింపుదారు",
      name: "పేరు లేదా మారుపేరు",
      location: "ప్రాంతం / ప్రదేశం",
      phone: "ఫోన్ నంబర్ (ఐచ్ఛికం)",
      collect: "మీరు ఏమి సేకరిస్తారు?",
      plastic: "ప్లాస్టిక్",
      mixed: "మిశ్రమ వ్యర్థాలు",
      both: "రెండూ",
      start: "ప్రారంభించండి",
      home: "వర్కర్ హోమ్",
      homeDesc: "మీరు సేకరించిన ప్లాస్టిక్ వ్యర్థాలకు గరిష్ట ఆదాయం పొందండి.",
      scan: "ప్లాస్టిక్ స్కాన్ చేయండి",
      scanDesc: "AI సహాయంతో ప్లాస్టిక్ పాలిమర్లను గుర్తించండి.",
      value: "విలువను చూడండి",
      valueDesc: "మీ బ్యాచ్ యొక్క నిజమైన మార్కెట్ విలువను తెలుసుకోండి.",
      buyer: "కొనుగోలుదారు / పికప్",
      buyerDesc: "రీసైక్లర్లతో కనెక్ట్ అవ్వండి మరియు ధరను నిర్ణయించండి.",
      batches: "నా బ్యాచ్‌లు",
      batchesDesc: "మీ మునుపటి సేకరణలు మరియు చెల్లింపుల చరిత్ర",
      required: "దయచేసి మీ పేరు మరియు ప్రాంతాన్ని నమోదు చేయండి.",
      collectionRequired: "మీరు ఏమి సేకరిస్తారో ఎంచుకోండి.",
      voiceGuide: "వాయిస్ గైడ్",
      stopVoice: "ఆడియో ఆపు",
      listenNow: "వినండి",
      logout: "లాగౌట్",
      back: "వెనుకకు",
      uploadPhoto: "ప్లాస్టిక్ ఫోటో అప్‌లోడ్ చేయండి",
      uploadDesc: "మీరు సేకరించిన ప్లాస్టిక్ వ్యర్థాల స్పష్టమైన ఫోటోను అప్‌లోడ్ చేయండి.",
      photoUploaded: "ఫోటో సిద్ధంగా ఉంది",
      analyzing: "AI విశ్లేషిస్తోంది...",
      analyzeBtn: "ప్లాస్టిక్ విశ్లేషించండి",
      compositionTitle: "ప్లాస్టిక్ కూర్పు",
      compSubtitle: "గుర్తించిన రీసైకిల్ చేయగల పాలిమర్ల శాతం",
      confidence: "AI ఖచ్చితత్వం",
      checkValueBtn: "బ్యాచ్ విలువను తనిఖీ చేయండి →",
      batchValueTitle: "బ్యాచ్ అంచనా విలువ",
      enterWeight: "మొత్తం బరువు (కిలోలు)",
      grossValue: "అంచనా మొత్తం విలువ",
      estPayout: "అంచనా నికర చెల్లింపు",
      confirmPickup: "పికప్‌ని నిర్ధారించండి",
      pickupConfirmedTitle: "పికప్ నిర్ధారించబడింది! ✅",
      pickupConfirmedDesc: "మీ అభ్యర్థన నమోదు చేయబడింది. రీసైక్లర్ భాగస్వామి బరువును పరిశీలించి వెంటనే చెల్లింపు చేస్తారు.",
      voiceHome: "పైరోసైకిల్‌కు స్వాగతం. సేకరించిన ప్లాస్టిక్‌కు ఉత్తమ విలువను పొందండి. ప్లాస్టిక్ స్కాన్ చేయండి లేదా పికప్ బుక్ చేయండి.",
      voiceScan: "దయచేసి మీ ప్లాస్టిక్ వ్యర్థాల స్పష్టమైన ఫోటోను అప్‌లోడ్ చేసి విశ్లేషణ బటన్‌పై నొక్కండి.",
      voiceComp: "పాలిమర్ విశ్లేషణ పూర్తయింది. మీ బ్యాచ్ విలువను తెలుసుకోవడానికి విలువను తనిఖీ చేయండి పై నొక్కండి.",
      voiceValue: "కిలోలలో బరువు నమోదు చేయండి. మార్కెట్ రేట్ ఆధారంగా విలువ లెక్కించబడుతుంది.",
      voiceBuyers: "మీ ప్లాస్టిక్‌కు సరిపోయే కొనుగోలుదారులు ఇక్కడ ఉన్నారు. పికప్‌ని నిర్ధారించండి.",
      voiceConfirmed: "పికప్ నిర్ధారించబడింది! రీసైక్లర్ బరువును పరిశీలించి వెంటనే చెల్లింపు చేస్తారు.",
      voiceBatches: "ఇక్కడ మీ గత వ్యర్థాల సేకరణ మరియు చెల్లింపుల చరిత్ర ఉంది.",
      voiceLang: "దయచేసి మీ భాషను ఎంచుకోండి. వాయిస్ గైడ్ ఈ భాషలో మీకు సహాయం చేస్తుంది.",
      voiceOnboarding: "మీ ప్రొఫైల్‌ను పూర్తి చేయడానికి మీ పేరు మరియు ప్రాంతాన్ని నమోదు చేయండి."
    },
  };

  const t = text[language] || text.en;

  const selectLanguage = (id) => {
    setLanguage(id);
    localStorage.setItem("pyrocycle_lang", id);
    stopSpeaking();
    const greetings = {
      en: "English selected. Audio voice guidance is active.",
      hi: "हिन्दी चुनी गई। ऑडियो गाइड सक्रिय है।",
      bn: "বাংলা নির্বাচন করা হয়েছে। অডিও গাইড সক্রিয়।",
      ta: "தமிழ் தேர்ந்தெடுக்கப்பட்டது. ஆடியோ வழிகாட்டி தயார்.",
      te: "తెలుగు ఎంపిక చేయబడింది. ఆడియో గైడ్ సిద్ధంగా ఉంది.",
    };
    speakText(greetings[id] || greetings.en, id);
  };

  const handleVoiceGuide = (customText) => {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    const promptMap = {
      home: t.voiceHome,
      scan: t.voiceScan,
      composition: t.voiceComp,
      weight: t.voiceValue,
      buyers: t.voiceBuyers,
      batches: t.voiceBatches,
      "pickup-confirmed": t.voiceConfirmed,
      onboarding: t.voiceOnboarding,
      language: t.voiceLang,
    };
    const textToSpeak = customText || promptMap[screen] || t.voiceHome;
    speakText(textToSpeak, language);
  };
    useEffect(() => {
    if (location.pathname === "/worker" || location.pathname === "/worker/") {
      navigate("/worker/home");
    }
  }, [location.pathname, navigate]);

  const goBack = () => {
  if (screen === "onboarding") {
    setScreen("language");
  } else if (screen === "home") {
    navigate("/");
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

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedImage);
      
      const res = await apiFetch("/api/scan", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        // filter out 0 values if you want, but for now just pass it all
        const filteredComp = Object.fromEntries(
            Object.entries(data.composition).filter(([_, v]) => v > 0)
        );
        setComposition(filteredComp);
        setScreen("composition");

        const highestPolymer = Object.entries(filteredComp).sort((a,b) => b[1] - a[1])[0];
        const polymerName = highestPolymer ? highestPolymer[0] : "plastic";
        const polymerPct = highestPolymer ? Math.round(highestPolymer[1]) : 50;
        const scanVoiceSummary = {
          en: `Analysis complete! Detected ${polymerPct}% ${polymerName}. Tap check value to view your earnings.`,
          hi: `विश्लेषण पूरा हुआ! ${polymerPct}% ${polymerName} पाया गया। अपनी कमाई देखने के लिए 'बैच का मूल्य देखें' पर टैप करें।`,
          bn: `বিশ্লেষণ সম্পন্ন হয়েছে! ${polymerPct}% ${polymerName} পাওয়া গেছে। ব্যাচের মূল্য দেখতে ট্যাপ করুন।`,
          ta: `ஆய்வு முடிந்தது! ${polymerPct}% ${polymerName} கண்டறியப்பட்டது. உங்கள் தொகையை அறிய தட்டவும்.`,
          te: `విశ్లేషణ పూర్తయింది! ${polymerPct}% ${polymerName} గుర్తించబడింది. మీ సంపాదనను చూడటానికి నొక్కండి.`,
        }[language] || `Analysis complete! Detected ${polymerPct}% ${polymerName}.`;
        speakText(scanVoiceSummary, language);
      } else {
        alert(data.msg || data.error || "Failed to analyze image. Please ensure you are logged in.");
      }
    } catch (e) {
      console.error(e);
      alert(`Error analyzing image: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (screen === "buyers") {
      setBuyersLoading(true);
      const compParam = encodeURIComponent(JSON.stringify(composition || {}));
      apiFetch(`/api/buyers?composition=${compParam}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.buyers && data.buyers.length > 0) {
            const mapped = data.buyers.map((b) => ({
              id: b.id,
              name: b.name,
              distance: b.location || "Nearby Hub",
              accepts: Array.isArray(b.accepts) ? b.accepts.join(" • ") : (b.accepts || "All Plastics"),
              pickupCharge: b.pickup_charge || 100,
              matchScore: b.match_score || 95,
            }));
            setBuyersList(mapped);
          }
        })
        .catch((err) => console.warn("Using fallback buyers:", err))
        .finally(() => setBuyersLoading(false));
    }
  }, [screen, composition]);

  useEffect(() => {
    if (screen === "batches") {
      setBatchesLoading(true);
      apiFetch("/api/batches")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.batches) {
            setBatchesList(data.batches);
          }
        })
        .catch((err) => console.warn("Failed to fetch DB batches:", err))
        .finally(() => setBatchesLoading(false));
    }
  }, [screen]);

  useEffect(() => {
    if (screen === "pickup-confirmed") {
      speakText(t.voiceConfirmed, language);
    }
  }, [screen, language, t.voiceConfirmed]);

  const submitBatchToBackend = async (req) => {
    try {
      await apiFetch("/api/batches", {
        method: "POST",
        body: JSON.stringify({
          batch_code: req.batchId,
          buyer_id: req.buyerId,
          composition: req.composition,
          weight: req.weight,
          gross_value: req.grossValue || 0,
          final_payout: req.workerAmount,
          ai_confidence: "86%",
          ai_notes: `Assigned pickup partner: ${req.buyerName}`
        })
      });
    } catch (e) {
      console.warn("Could not save to DB:", e);
    }
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
        <button className="worker-back" onClick={() => navigate("/")}>
          ← Back
        </button>

        <div className="worker-container">
          <div className="worker-logo">♻️</div>

          <h1>PyroCycle AI</h1>

          <p className="worker-tagline">
            AI-powered plastic recovery
          </p>

          <div className="worker-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h2 style={{ margin: 0 }}>{t.welcome} 👋</h2>
              <button
                className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
                onClick={() => handleVoiceGuide(t.voiceLang)}
                title={isSpeaking ? t.stopVoice : t.voiceGuide}
              >
                {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
              </button>
            </div>

            <p>{t.chooseLanguage}</p>

            <div className="language-list">
              {languages.map((item) => (
                <button
                  key={item.id}
                  className={`language-option ${
                    language === item.id ? "selected" : ""
                  }`}
                  onClick={() => selectLanguage(item.id)}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span>🗣️</span>
                    <span>{item.native}</span>
                  </span>

                  {language === item.id && (
                    <span className="language-check">✓</span>
                  )}
                </button>
              ))}
            </div>

            <button
              className="worker-primary-button"
              onClick={() => {
                stopSpeaking();
                setScreen(worker.name ? "home" : "onboarding");
              }}
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
    onClick={() => navigate("/")}
  >
    ← Back
  </button>

        <div className="worker-home">

          <div className="worker-home-header">

            <div>
              <div className="worker-brand-small">
                ♻️ PyroCycle AI • {user?.role === "worker" ? "Verified Collector" : "Worker Portal"}
              </div>

              <h1>{worker.name || user?.name ? `Hello, ${worker.name || user?.name} 👋` : t.home}</h1>

              <p style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginTop: "4px" }}>
                {user?.email && (
                  <span style={{ fontSize: "12px", background: "rgba(0, 255, 135, 0.08)", border: "1px solid rgba(0, 255, 135, 0.25)", color: "#00ff87", padding: "2px 8px", borderRadius: "12px" }}>
                    👤 {user.email}
                  </span>
                )}
                {worker.location && (
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    📍 {worker.location}
                  </span>
                )}
              </p>
              <p style={{ marginTop: "4px", fontSize: "13px", color: "var(--text-muted)" }}>{t.homeDesc}</p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <button
                className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
                onClick={() => handleVoiceGuide()}
                title={isSpeaking ? t.stopVoice : t.voiceGuide}
              >
                {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
              </button>

              <button
                className="language-mini"
                onClick={() => setScreen("language")}
                title="Change Language"
              >
                🌐 {languages.find(
                  (x) => x.id === language
                )?.native}
              </button>

              <button
                className="language-mini"
                onClick={() => {
                  stopSpeaking();
                  logout();
                  navigate("/worker/login");
                }}
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "#ef4444",
                  borderColor: "rgba(239, 68, 68, 0.35)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontWeight: "600",
                }}
                title="Sign out of Worker Portal"
              >
                🚪 {t.logout || "Logout"}
              </button>
            </div>

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

        <div
          className={`floating-voice-pill ${isSpeaking ? "speaking-active" : ""}`}
          onClick={() => handleVoiceGuide()}
          title={isSpeaking ? t.stopVoice : t.voiceGuide}
        >
          <span>{isSpeaking ? "⏹️" : "🔊"}</span>
          <span>{isSpeaking ? t.stopVoice : t.voiceGuide}</span>
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
          onClick={() => {
            stopSpeaking();
            setScreen("home");
          }}
        >
          ← {t.back || "Back"}
        </button>

        <div className="worker-container">

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div className="worker-logo small">
              📸
            </div>
            <button
              className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
              onClick={() => handleVoiceGuide(t.voiceScan)}
              title={isSpeaking ? t.stopVoice : t.voiceGuide}
            >
              {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
            </button>
          </div>

          <h1>{t.scan}</h1>

          <p className="worker-tagline">
            {t.scanDesc}
          </p>

          <WorkflowBreadcrumbs currentStep={1} language={language} />

          <div className="worker-card scan-card">

            {!imagePreview ? (
              <>
                <div className="scan-icon-large">
                  📤
                </div>

                <h2>{t.uploadPhoto}</h2>

                <p>
                  {t.uploadDesc}
                </p>

                <label className="worker-primary-button upload-button">
                  📤 {t.uploadPhoto}

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
                <h2>{t.photoUploaded}</h2>

                <div className="image-preview-container">
                  <img
                    src={imagePreview}
                    alt="Uploaded plastic waste"
                    className="plastic-preview"
                  />
                </div>

                <button
                  className="worker-primary-button"
                  onClick={analyzeImage}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? `⏳ ${t.analyzing}` : `🔍 ${t.analyzeBtn}`}
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
        onClick={() => {
          stopSpeaking();
          setScreen("scan");
        }}
      >
        ← {t.back || "Back"}
      </button>

      <div className="worker-container">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div className="worker-logo small">
            🔍
          </div>
          <button
            className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
            onClick={() => handleVoiceGuide(t.voiceComp)}
            title={isSpeaking ? t.stopVoice : t.voiceGuide}
          >
            {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
          </button>
        </div>

        <h1>{t.compositionTitle}</h1>

        <p className="worker-tagline">
          {t.compSubtitle}
        </p>

        <WorkflowBreadcrumbs currentStep={2} language={language} />

        <div className="worker-card">

          <div className="composition-list">

            {Object.entries(composition).map(
              ([material, percentage]) => {
                const badge = getPolymerBadgeStyle(material);
                return (
                  <div
                    className="composition-row"
                    key={material}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          fontWeight: "700",
                          fontFamily: "var(--font-mono)",
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.text,
                        }}
                      >
                        {badge.code}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "#8b949e" }}>
                        (~₹{referencePrices[material] || 35}/kg)
                      </span>
                    </div>

                    <strong style={{ color: badge.text, fontSize: "1.05rem" }}>{percentage}%</strong>
                  </div>
                );
              }
            )}

          </div>

          <div className="confidence-box">
            <span>{t.confidence}</span>
            <strong>86%</strong>
          </div>

          <div className="worker-warning">
            ⚠️ AI estimate only. For accurate commercial
            grading, verify by physical sorting.
          </div>

          <button
            className="worker-primary-button"
            onClick={() => {
              stopSpeaking();
              setScreen("weight");
            }}
          >
            {t.checkValueBtn}
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
      return total + kg * (referencePrices[material] || 35);
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
        onClick={() => {
          stopSpeaking();
          setScreen("composition");
        }}
      >
        ← {t.back || "Back"}
      </button>

      <div className="worker-container">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div className="worker-logo small">
            ⚖️
          </div>
          <button
            className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
            onClick={() => handleVoiceGuide(t.voiceValue)}
            title={isSpeaking ? t.stopVoice : t.voiceGuide}
          >
            {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
          </button>
        </div>

        <h1>{t.batchValueTitle}</h1>

        <p className="worker-tagline">
          {t.enterWeight}
        </p>

        <WorkflowBreadcrumbs currentStep={3} language={language} />

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
                  {t.estPayout}
                </span>

                <strong>
                  ₹{Math.round(finalPayout).toLocaleString("en-IN")}
                </strong>

                <button
                  type="button"
                  className="voice-guide-btn"
                  onClick={() => {
                    const payoutMsg = {
                      en: `Your batch weight is ${weight} kilograms. Estimated gross value is ${Math.round(grossValue)} rupees. Estimated net payout is ${Math.round(finalPayout)} rupees.`,
                      hi: `आपके बैच का वजन ${weight} किलोग्राम है। अनुमानित कुल मूल्य ₹${Math.round(grossValue)} है और शुद्ध भुगतान ₹${Math.round(finalPayout)} है।`,
                      bn: `আপনার ব্যাচের ওজন ${weight} কেজি। আনুমানিক মোট মূল্য ₹${Math.round(grossValue)} এবং নগদ অর্থ ₹${Math.round(finalPayout)} টাকা।`,
                      ta: `உங்கள் தொகுப்பு எடை ${weight} கிலோ. மதிப்பிடப்பட்ட நிகர தொகை ₹${Math.round(finalPayout)} ரூபாய்.`,
                      te: `మీ బ్యాచ్ బరువు ${weight} కిలోలు. అంచనా నికర చెల్లింపు ₹${Math.round(finalPayout)} రూపాయలు.`
                    }[language] || `Estimated payout is ${Math.round(finalPayout)} rupees.`;
                    speakText(payoutMsg, language);
                  }}
                  style={{ marginTop: "10px", width: "100%", justifyContent: "center" }}
                >
                  🔊 {t.listenNow} (₹{Math.round(finalPayout).toLocaleString("en-IN")})
                </button>

                <small style={{ marginTop: "8px" }}>
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
                  stopSpeaking();
                  sessionStorage.setItem("fromScanFlow", "true");
                  setScreen("buyers");
                }}
              >
                {t.continue} →
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
  const defaultBuyers = [
    {
      id: 1,
      name: "ABC Recycling Centre",
      distance: "3.2 km",
      accepts: "PP • HDPE • LDPE • PS",
      pickupCharge: 80,
      matchScore: 98,
    },
    {
      id: 2,
      name: "GreenCycle Aggregator",
      distance: "4.7 km",
      accepts: "Mixed Plastic",
      pickupCharge: 100,
      matchScore: 94,
    },
    {
      id: 3,
      name: "Eco Plastic Recovery",
      distance: "6.1 km",
      accepts: "PP • HDPE • PS",
      pickupCharge: 120,
      matchScore: 89,
    },
  ];

  const buyers = (buyersList && buyersList.length > 0) ? buyersList : defaultBuyers;

  return (
    <div className="worker-page">

    <button
  className="worker-back"
  onClick={() => {
    stopSpeaking();
    sessionStorage.removeItem("fromScanFlow");
    setScreen("home");
  }}
>
  ← {t.back || "Back"}
</button>

      <div className="worker-container">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div className="worker-logo small">
            📍
          </div>
          <button
            className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
            onClick={() => handleVoiceGuide(t.voiceBuyers)}
            title={isSpeaking ? t.stopVoice : t.voiceGuide}
          >
            {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
          </button>
        </div>

        <h1>{t.buyer}</h1>

        <p className="worker-tagline">
          {t.buyerDesc}
        </p>

        <WorkflowBreadcrumbs currentStep={4} language={language} />

        <div className="worker-card">

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>Available Nearby</h2>
            {buyersLoading && <span style={{ fontSize: "0.8rem", color: "#8b949e" }}>Updating from DB...</span>}
          </div>

          <p className="scan-note">
            Real registered recyclers & aggregators matched with your scanned plastic
          </p>

          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              className="buyer-card"
            >

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <h3 className="buyer-card-name" style={{ margin: 0 }}>
                  {buyer.name}
                </h3>
                {buyer.matchScore && (
                  <span style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#10b981",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    padding: "2px 8px",
                    whiteSpace: "nowrap"
                  }}>
                    🎯 {buyer.matchScore}% Match
                  </span>
                )}
              </div>

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
      return total + kg * (referencePrices[material] || 35);
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

        <WorkflowBreadcrumbs currentStep={4} language={language} />

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

                  const pickupRequest = {
                    batchId: `PYRO-${Date.now().toString().slice(-6)}`,
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
                    grossValue: grossValue || 0,
                    status: "SUBMITTED",
                    createdAt: new Date().toISOString(),
                  };

                  submitBatchToBackend(pickupRequest);
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div className="worker-logo">
            ✅
          </div>
          <button
            className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
            onClick={() => handleVoiceGuide(t.voiceConfirmed)}
            title={isSpeaking ? t.stopVoice : t.voiceGuide}
          >
            {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
          </button>
        </div>

        <h1>{t.pickupConfirmedTitle}</h1>

        <p className="worker-tagline">
          {t.pickupConfirmedDesc}
        </p>

        <WorkflowBreadcrumbs currentStep={5} language={language} />

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
    stopSpeaking();
    sessionStorage.removeItem("selectedBuyer");
    sessionStorage.removeItem("fromScanFlow");
    setScreen("home");
  }}
>
  ← {t.back || "Back"} to {t.home}
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
  // Purge any residual local cache
  localStorage.removeItem("pyrocycleBatches");
  localStorage.removeItem("pyrocyclePickupRequests");

  const batches = (batchesList || []).map((b) => ({
    id: b.batch_code || b.id.slice(0, 8),
    weight: b.est_weight_kg || 0,
    actualWeight: b.actual_weight_kg,
    buyer: b.buyer_name || "Direct Recycler",
    amount: Math.round(b.final_payout || b.est_value || 0),
    status: (b.status || "SUBMITTED").toUpperCase(),
    oilYield: b.oil_yield,
    gasYield: b.gas_yield,
    date: b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN") : "Recent",
  }));

  return (
    <div className="worker-page">

      <button
        className="worker-back"
        onClick={() => {
          stopSpeaking();
          setScreen("home");
        }}
      >
        ← {t.back || "Back"}
      </button>

      <div className="worker-container">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div className="worker-logo small">
            📦
          </div>
          <button
            className={`voice-guide-btn ${isSpeaking ? "speaking-pulse" : ""}`}
            onClick={() => handleVoiceGuide(t.voiceBatches)}
            title={isSpeaking ? t.stopVoice : t.voiceGuide}
          >
            {isSpeaking ? "⏹️ " + t.stopVoice : "🔊 " + t.voiceGuide}
          </button>
        </div>

        <h1>{t.batches}</h1>

        <p className="worker-tagline">
          {t.batchesDesc}
        </p>

        <div className="worker-card">
          {batchesLoading && (
            <p style={{ textAlign: "center", color: "#8b949e", fontSize: "0.85rem" }}>
              Syncing batches from database...
            </p>
          )}

          {batches.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#8b949e" }}>
              <p style={{ marginBottom: "1rem" }}>No batches recorded yet.</p>
              <button
                className="worker-primary-button"
                onClick={() => setScreen("scan")}
              >
                Scan Plastic Waste →
              </button>
            </div>
          ) : (
            batches.map((batch) => (
              <div
                key={batch.id}
                className="batch-card"
              >

              <div className="batch-card-header">

                <h3>
                  📦 Batch #{batch.id}
                </h3>

                <span style={{
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                  background: batch.status === "SETTLED" ? "rgba(16, 185, 129, 0.15)" : batch.status === "PROCESSED" ? "rgba(56, 189, 248, 0.15)" : batch.status === "VERIFIED" ? "rgba(245, 158, 11, 0.15)" : "rgba(148, 163, 184, 0.15)",
                  color: batch.status === "SETTLED" ? "#10b981" : batch.status === "PROCESSED" ? "#38bdf8" : batch.status === "VERIFIED" ? "#f59e0b" : "#94a3b8",
                  border: `1px solid ${batch.status === "SETTLED" ? "rgba(16, 185, 129, 0.3)" : batch.status === "PROCESSED" ? "rgba(56, 189, 248, 0.3)" : batch.status === "VERIFIED" ? "rgba(245, 158, 11, 0.3)" : "rgba(148, 163, 184, 0.3)"}`
                }}>
                  {batch.status === "SETTLED" ? "💰 Paid & Settled" : batch.status === "PROCESSED" ? "⚡ Pyrolysis Complete" : batch.status === "VERIFIED" ? "🔍 Weighed & Verified" : "🚚 Pickup Requested"}
                </span>

              </div>

              <div className="composition-list">

                <div className="composition-row">
                  <span>Weight</span>
                  <strong>
                    {batch.weight} kg {batch.actualWeight ? `(Gate: ${batch.actualWeight} kg)` : ""}
                  </strong>
                </div>

                <div className="composition-row">
                  <span>Buyer</span>
                  <strong>
                    {batch.buyer}
                  </strong>
                </div>

                <div className="composition-row">
                  <span>Payout</span>
                  <strong style={{ color: "#10b981" }}>
                    ₹{batch.amount.toLocaleString("en-IN")}
                  </strong>
                </div>

                {batch.oilYield && (
                  <div style={{
                    marginTop: "8px",
                    padding: "8px 10px",
                    background: "rgba(56, 189, 248, 0.08)",
                    border: "1px solid rgba(56, 189, 248, 0.2)",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    display: "flex",
                    justifyContent: "space-between"
                  }}>
                    <span style={{ color: "#38bdf8", fontWeight: "600" }}>Recovered Fuel:</span>
                    <span>🛢️ {batch.oilYield}% Oil • 🔥 {batch.gasYield}% Gas</span>
                  </div>
                )}

              </div>

            </div>
          )))}

        </div>

      </div>

    </div>
  );
}
  return null;
}

export default WorkerApp;
