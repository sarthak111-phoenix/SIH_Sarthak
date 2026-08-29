export type LanguageCode = "en" | "hi" | "hinglish" | "mr" | "gu" | "bn" | "ta" | "te" | "kn" | "pa";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  fontFamily: string;
}

export class LanguageOptions {
  static readonly ALL: LanguageOption[] = [
    { code: "en", name: "English", nativeName: "English", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", fontFamily: "'Noto Sans Devanagari', sans-serif" },
    { code: "hinglish", name: "Hinglish", nativeName: "Hinglish", fontFamily: "'Plus Jakarta Sans', sans-serif" },
    { code: "mr", name: "Marathi", nativeName: "मराठी", fontFamily: "'Noto Sans Devanagari', sans-serif" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", fontFamily: "'Noto Sans Gujarati', sans-serif" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা", fontFamily: "'Noto Sans Bengali', sans-serif" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", fontFamily: "'Noto Sans Tamil', sans-serif" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు", fontFamily: "'Noto Sans Telugu', sans-serif" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", fontFamily: "'Noto Sans Kannada', sans-serif" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", fontFamily: "'Noto Sans Gurmukhi', sans-serif" },
  ];
}

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Nav & Common
    appName: "FactoryIQ",
    tagline: "Intelligence Platform for Indian MSMEs",
    dashboard: "Dashboard",
    aiCopilot: "AI Copilot",
    aiAlerts: "AI Alerts",
    orders: "Orders",
    aiFeasibility: "AI Feasibility",
    production: "Production",
    machines: "Machines",
    maintenance: "Maintenance",
    inventory: "Inventory",
    suppliers: "Suppliers",
    profitability: "Profitability",
    workerView: "Worker View",
    memoryBank: "Memory Bank",
    factorySetup: "Factory Setup",
    signIn: "Sign In",
    signOut: "Sign Out",
    startFreeTrial: "Start Free Trial",
    features: "Features",
    howItWorks: "How It Works",
    pricing: "Pricing",

    // Dashboard Greeting & Header
    greeting: "Good morning 👋",
    shiftStatus: "Friday, 23 August 2024 · Shift A active · 45 workers on floor",
    checkFeasibilityBtn: "Check Order Feasibility",

    // Metrics Cards
    factoryHealth: "Factory Health",
    amberBreakdown: "Amber — 1 breakdown",
    ordersOnTrack: "Orders On Track",
    atRisk: "2 at risk",
    machinesRunning: "Machines Running",
    machineStatusSummary: "1 down, 1 in PM",
    materialAlerts: "Material Alerts",
    criticalShortage: "Critical shortage",
    todayDispatches: "Today Dispatches",
    pendingPickup: "2 pending pickup",
    criticalAlerts: "Critical Alerts",
    needsAction: "Needs immediate action",

    // AI Daily Briefing
    aiDailyBriefing: "AI Daily Briefing",
    updatedTime: "Updated 09:20 AM",
    highestPriority: "Highest Priority: Order #124 is at risk of missing deadline",
    viewDetails: "View Details",
    takeAction: "Take Action",
    whatHappened: "WHAT HAPPENED",
    whatHappenedDesc: "Machine M-02 (Milling) broke down at 09:15 AM due to spindle bearing failure.",
    whyHappened: "WHY IT HAPPENED",
    whyHappenedDesc: "PM service was 23 days overdue. Vibration alert ignored 3 days ago.",
    businessImpact: "BUSINESS IMPACT",
    businessImpactDesc: "Hero MotoCorp delivery misses Aug 26 by ~2 days. ₹64,000 penalty risk.",
    aiRecommendation: "AI RECOMMENDATION",
    aiRecDesc: "Immediately move Order #124 remaining work to Machine M-04 (currently idle). Raise emergency maintenance work order for M-02.",

    // Machine Monitoring Page
    machineMonitoring: "Machine Monitoring",
    realtimeTelemetry: "Real-time floor telemetry, status tracking, and servicing dispatch",
    all: "All",
    running: "Running",
    idle: "Idle",
    breakdown: "Breakdown",
    addMachine: "Add Machine",
    currentJob: "CURRENT JOB",

    // Pricing Section
    transparentPricing: "TRANSPARENT PRICING",
    simplePlans: "Simple Plans for Indian Factories",
    starterPlan: "Choose Starter Plan",
    growthPlan: "Start Free Trial",
    enterprisePlan: "Contact Sales",
    mostPopular: "MOST POPULAR FOR MSMEs",
  },
  hinglish: {
    appName: "FactoryIQ",
    tagline: "Indian MSMEs ke liye Intelligence Platform",
    dashboard: "Dashboard",
    aiCopilot: "AI Copilot",
    aiAlerts: "AI Alerts",
    orders: "Orders",
    aiFeasibility: "AI Feasibility",
    production: "Production",
    machines: "Machines",
    maintenance: "Maintenance",
    inventory: "Inventory",
    suppliers: "Suppliers",
    profitability: "Profitability",
    workerView: "Worker View",
    memoryBank: "Memory Bank",
    factorySetup: "Factory Setup",
    signIn: "Sign In",
    signOut: "Sign Out",
    startFreeTrial: "Start Free Trial",
    features: "Features",
    howItWorks: "How It Works",
    pricing: "Pricing",
    greeting: "Good morning 👋",
    shiftStatus: "Friday, 23 August 2024 · Shift A active · 45 floor workers",
    checkFeasibilityBtn: "Order Feasibility Check Karein",
    factoryHealth: "Factory ki Sthiti",
    amberBreakdown: "Amber — 1 breakdown",
    ordersOnTrack: "Orders On Track",
    atRisk: "2 risk par hain",
    machinesRunning: "Machines Running",
    machineStatusSummary: "1 down, 1 PM mein hai",
    materialAlerts: "Material Alerts",
    criticalShortage: "Critical shortage",
    todayDispatches: "Today Dispatches",
    pendingPickup: "2 pickup pending hain",
    criticalAlerts: "Critical Alerts",
    needsAction: "Action zaroori hai",
    aiDailyBriefing: "AI Daily Briefing",
    updatedTime: "Updated 09:20 AM",
    highestPriority: "Highest Priority: Order #124 deadline miss kar sakta hai",
    viewDetails: "Details Dekhein",
    takeAction: "Action lein",
  },
  bn: {
    appName: "ফ্যাক্টরি-IQ",
    tagline: "ভারতীয় MSME-এর জন্য ইন্টেলিজেন্স প্ল্যাটফর্ম",
    dashboard: "ড্যাশবোর্ড",
    aiCopilot: "AI সহায়ক",
    aiAlerts: "AI অ্যালার্ট",
    orders: "অর্ডার",
    aiFeasibility: "AI সম্ভাব্যতা",
    production: "উৎপাদন",
    machines: "মেশিন",
    maintenance: "রক্ষণাবেক্ষণ",
    inventory: "ইনভেন্টরি",
    suppliers: "সরবরাহকারী",
    profitability: "লাভজনকতা",
    workerView: "কর্মী ভিউ",
    memoryBank: "মেমরি ব্যাংক",
    factorySetup: "ফ্যাক্টরি সেটআপ",
    signIn: "সাইন ইন করুন",
    signOut: "সাইন আউট করুন",
    startFreeTrial: "বিনামূল্যে ট্রায়াল শুরু করুন",
    features: "বৈশিষ্ট্য",
    howItWorks: "এটি কীভাবে কাজ করে",
    pricing: "মূল্য নির্ধারণ",
    greeting: "শুভ সকাল, রাজেশ 👋",
    shiftStatus: "শুক্রবার, ২৩ আগস্ট ২০২৪ · শিফট এ সক্রিয়",
    checkFeasibilityBtn: "অর্ডার সম্ভাব্যতা পরীক্ষা করুন",
    factoryHealth: "ফ্যাক্টরি স্বাস্থ্য",
    ordersOnTrack: "সময়মতো অর্ডার",
    machinesRunning: "চলতি মেশিন",
    transparentPricing: "স্বচ্ছ মূল্য",
    simplePlans: "ভারতীয় কারখানার জন্য সহজ প্ল্যান",
  },
  pa: {
    appName: "ਫੈਕਟਰੀ-IQ",
    tagline: "ਭਾਰਤੀ MSMEs ਲਈ ਇੰਟੈਲੀਜੈਂਸ ਪਲੇਟਫਾਰਮ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    aiCopilot: "AI ਸਹਾਇਕ",
    aiAlerts: "AI ਅਲਰਟ",
    orders: "ਆਰਡਰ",
    aiFeasibility: "AI ਸੰਭਾਵਨਾ",
    production: "ਉਤਪਾਦਨ",
    machines: "ਮਸ਼ੀਨਾਂ",
    maintenance: "ਰੱਖ-ਰਖਾਅ",
    inventory: "ਇਨਵੈਂਟਰੀ",
    suppliers: "ਸਪਲਾਇਰ",
    profitability: "ਮੁਨਾਫਾ",
    workerView: "ਕਰਮਚਾਰੀ ਵਿਊ",
    memoryBank: "ਮੈਮੋਰੀ ਬੈਂਕ",
    factorySetup: "ਫੈਕਟਰੀ ਸੈੱਟਅੱਪ",
    signIn: "ਸਾਈਨ ਇਨ ਕਰੋ",
    signOut: "ਸਾਈਨ ਆਊਟ ਕਰੋ",
    startFreeTrial: "ਮੁਫ਼ਤ ਟ੍ਰਾਇਲ ਸ਼ੁਰੂ ਕਰੋ",
    features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
    howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    pricing: "ਕੀਮਤ",
    greeting: "ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ, ਰਾਜੇਸ਼ 👋",
    shiftStatus: "ਸ਼ੁੱਕਰਵਾਰ, 23 ਅਗਸਤ 2024 · ਸ਼ਿਫਟ A ਚਾਲੂ",
    checkFeasibilityBtn: "ਆਰਡਰ ਫਿਜ਼ੀਬਿਲਟੀ ਚੈੱਕ ਕਰੋ",
    factoryHealth: "ਫੈਕਟਰੀ ਦੀ ਸਥਿਤੀ",
    ordersOnTrack: "ਸਮੇਂ ਸਿਰ ਆਰਡਰ",
    machinesRunning: "ਚੱਲ ਰਹੀਆਂ ਮਸ਼ੀਨਾਂ",
    transparentPricing: "ਪਾਰਦਰਸ਼ੀ ਕੀਮਤਾਂ",
    simplePlans: "ਭਾਰਤੀ ਫੈਕਟਰੀਆਂ ਲਈ ਸਰਲ ਪਲਾਨ",
  },
  hi: {
    // Nav & Common
    appName: "फ़ैक्टरी-आईक्यू",
    tagline: "भारतीय एमएसएमई के लिए इंटेलिजेंस प्लेटफॉर्म",
    dashboard: "डैशबोर्ड",
    aiCopilot: "एआई कोपायलट",
    aiAlerts: "एआई अलर्ट्स",
    orders: "ऑर्डर्स",
    aiFeasibility: "एआई व्यवहार्यता",
    production: "उत्पादन",
    machines: "मशीनें",
    maintenance: "रखरखाव (मेंटेनेंस)",
    inventory: "इन्वेंटरी (स्टॉक)",
    suppliers: "आपूर्तिकर्ता (सप्लायर्स)",
    profitability: "लाभप्रदता (मुनाफा)",
    workerView: "कार्यकर्ता व्यू",
    memoryBank: "मेमोरी बैंक",
    factorySetup: "फ़ैक्टरी सेटअप",
    signIn: "साइन इन करें",
    signOut: "साइन आउट करें",
    startFreeTrial: "निःशुल्क ट्रायल शुरू करें",
    features: "विशेषताएं",
    howItWorks: "यह कैसे काम करता है",
    pricing: "मूल्य निर्धारण (प्राइजिंग)",

    // Dashboard Greeting & Header
    greeting: "शुभ प्रभात, राजेश 👋",
    shiftStatus: "शुक्रवार, 23 अगस्त 2024 · शिफ्ट ए सक्रिय · फ़्लोर पर 45 कार्यकर्ता",
    checkFeasibilityBtn: "ऑर्डर व्यवहार्यता जांचें",

    // Metrics Cards
    factoryHealth: "फ़ैक्टरी स्वास्थ्य",
    amberBreakdown: "एम्बर — 1 खराबी",
    ordersOnTrack: "ऑर्डर सही समय पर",
    atRisk: "2 जोखिम में",
    machinesRunning: "मशीनें चल रही हैं",
    machineStatusSummary: "1 बंद, 1 मेंटेनेंस में",
    materialAlerts: "सामग्री अलर्ट",
    criticalShortage: "गंभीर कमी",
    todayDispatches: "आज की प्रेषण (डिसपैच)",
    pendingPickup: "2 पिकअप लंबित",
    criticalAlerts: "महत्वपूर्ण अलर्ट",
    needsAction: "तत्काल कार्रवाई की आवश्यकता है",

    // AI Daily Briefing
    aiDailyBriefing: "एआई दैनिक ब्रीफिंग",
    updatedTime: "अद्यतन सुबह 09:20 बजे",
    highestPriority: "सर्वोच्च प्राथमिकता: ऑर्डर #124 की समय सीमा छूटने का जोखिम है",
    viewDetails: "विवरण देखें",
    takeAction: "कार्रवाई करें",
    whatHappened: "क्या हुआ",
    whatHappenedDesc: "स्पिंडल बियरिंग विफलता के कारण सुबह 09:15 बजे मशीन M-02 (मिलिंग) खराब हो गई।",
    whyHappened: "यह क्यों हुआ",
    whyHappenedDesc: "पीएम सेवा 23 दिन से अधिक पुरानी थी। 3 दिन पहले कंपन अलर्ट पर ध्यान नहीं दिया गया।",
    businessImpact: "व्यावसायिक प्रभाव",
    businessImpactDesc: "हीरो मोटोकॉर्प डिलीवरी 26 अगस्त से ~2 दिन पीछे। ₹64,000 जुर्माना जोखिम।",
    aiRecommendation: "एआई सिफारिश",
    aiRecDesc: "ऑर्डर #124 के शेष कार्य को तुरंत मशीन M-04 (वर्तमान में निष्क्रिय) पर स्थानांतरित करें।",

    // Machine Monitoring Page
    machineMonitoring: "मशीन निगरानी",
    realtimeTelemetry: "वास्तविक समय फ़्लोर टेलीमेट्री, स्थिति ट्रैकिंग और सर्विसिंग प्रेषण",
    all: "सभी",
    running: "चल रहा है",
    idle: "निष्क्रिय",
    breakdown: "खराबी",
    addMachine: "मशीन जोड़ें",
    currentJob: "वर्तमान कार्य",

    // Pricing Section
    transparentPricing: "पारदर्शी मूल्य निर्धारण",
    simplePlans: "भारतीय कारखानों के लिए सरल योजनाएँ",
    starterPlan: "स्टार्टर प्लान चुनें",
    growthPlan: "निःशुल्क ट्रायल शुरू करें",
    enterprisePlan: "बिक्री टीम से संपर्क करें",
    mostPopular: "एमएसएमई के लिए सबसे लोकप्रिय",
  },
  mr: {
    // Nav & Common
    appName: "फॅक्टरी-आयक्यू",
    tagline: "भारतीय एमएसएमई साठी इंटेलिजन्स प्लॅटफॉर्म",
    dashboard: "डॅशबोर्ड",
    aiCopilot: "एआय कोपायलट",
    aiAlerts: "एआय इशारे",
    orders: "ऑर्डर्स",
    aiFeasibility: "एआय संभाव्यता",
    production: "उत्पादन",
    machines: "मशिन्स",
    maintenance: "देखभाल (मेंटेनन्स)",
    inventory: "साठा (इन्व्हेंटरी)",
    suppliers: "पुरवठादार",
    profitability: "नफा (प्रॉफिटॅबिलिटी)",
    workerView: "कामगार व्ह्यू",
    memoryBank: "मेमरी बँक",
    factorySetup: "फॅक्टरी सेटअप",
    signIn: "साइन इन करा",
    signOut: "साइन आउट करा",
    startFreeTrial: "मोफत ट्रायल सुरू करा",
    features: "वैशिष्ट्ये",
    howItWorks: "हे कसे काम करते",
    pricing: "किंमती",

    // Dashboard Greeting & Header
    greeting: "शुभ प्रभात, राजेश 👋",
    shiftStatus: "शुक्रवार, 23 ऑगस्ट 2024 · शिफ्ट ए चालू · 45 कामगार उपस्थित",
    checkFeasibilityBtn: "ऑर्डर संभाव्यता तपासा",

    // Metrics Cards
    factoryHealth: "कारखाना आरोग्य",
    amberBreakdown: "अंबर — 1 मशीन बंद",
    ordersOnTrack: "वेळेवर ऑर्डर्स",
    atRisk: "2 धोक्यात",
    machinesRunning: "चालू मशिन्स",
    machineStatusSummary: "1 बंद, 1 मेंटेनन्समध्ये",
    materialAlerts: "कच्चा माल अलर्ट",
    criticalShortage: "कमी साठा",
    todayDispatches: "आजचे डिस्पॅच",
    pendingPickup: "2 पिकअप बाकी",
    criticalAlerts: "महत्वाचे इशारे",
    needsAction: "तातडीने कारवाई आवश्यक",

    // AI Daily Briefing
    aiDailyBriefing: "एआय दैनिक ब्रीफिंग",
    updatedTime: "सकाळी 09:20 वाजता अद्ययावत",
    highestPriority: "सर्वोच्च प्राधान्य: ऑर्डर #124 ची वेळ चुकण्याचा धोका आहे",
    viewDetails: "तपशील पहा",
    takeAction: "कारवाई करा",
    whatHappened: "काय घडले",
    whatHappenedDesc: "स्पिंडल बेरिंग बिघाडामुळे सकाळी 09:15 वाजता मशीन M-02 (मिलिंग) बंद पडले.",
    whyHappened: "का घडले",
    whyHappenedDesc: "पीएम सर्व्हिसिंग 23 दिवस उशिरा होते. 3 दिवसांपूर्वीच्या व्हायब्रेशन अलर्टकडे दुर्लक्ष केले.",
    businessImpact: "व्यावसायिक परिणाम",
    businessImpactDesc: "हीरो मोटोकॉर्प डिलिव्हरी 26 ऑगस्टपेक्षा 2 दिवस उशिरा. ₹64,000 दंडाचा धोका.",
    aiRecommendation: "एआय शिफारस",
    aiRecDesc: "ऑर्डर #124 चे उर्वरित काम त्वरित मशीन M-04 वर हलवा. M-02 साठी आपत्कालीन मेंटेनन्स सुरू करा.",

    // Machine Monitoring Page
    machineMonitoring: "मशीन देखरेख",
    realtimeTelemetry: "रिअल-टाइम फ्लोअर टेलिमेट्री, स्टेटस ट्रॅकिंग आणि सर्व्हिसिंग",
    all: "सर्व",
    running: "चालू",
    idle: "बंद/मोकळे",
    breakdown: "बिघाड",
    addMachine: "मशीन जोडा",
    currentJob: "सध्याचे काम",

    // Pricing Section
    transparentPricing: "पारदर्शक किंमती",
    simplePlans: "भारतीय कारखान्यांसाठी सोपे प्लॅन्स",
    starterPlan: "स्टार्टर प्लॅन निवडा",
    growthPlan: "मोफत ट्रायल सुरू करा",
    enterprisePlan: "विक्री टीमशी संपर्क साधा",
    mostPopular: "एमएसएमई साठी सर्वात लोकप्रिय",
  },
  gu: {
    // Nav & Common
    appName: "ફેક્ટરી-IQ",
    tagline: "ભારતીય MSMEs માટે ઈન્ટેલિજન્સ પ્લેટફોર્મ",
    dashboard: "ડેશબોર્ડ",
    aiCopilot: "AI કોપાયલટ",
    aiAlerts: "AI એલર્ટ્સ",
    orders: "ઓર્ડર્સ",
    aiFeasibility: "AI ક્ષમતા ચકાસણી",
    production: "ઉત્પાદન",
    machines: "મશીનો",
    maintenance: "મેઇન્ટેનન્સ",
    inventory: "ઇન્વેન્ટરી",
    suppliers: "સપ્લાયર્સ",
    profitability: "નફાકારકતા",
    workerView: "વર્કર વ્યૂ",
    memoryBank: "મેમરી બેંક",
    factorySetup: "ફેક્ટરી સેટઅપ",
    signIn: "સાઇન ઇન કરો",
    signOut: "સાઇન આઉટ કરો",
    startFreeTrial: "મફત ટ્રાયલ શરૂ કરો",
    features: "સુવિધાઓ",
    howItWorks: "તે કેવી રીતે કામ કરે છે",
    pricing: "ભાવ",

    // Dashboard Greeting & Header
    greeting: "સુપ્રભાત, રાજેશ 👋",
    shiftStatus: "શુક્રવાર, 23 ઓગસ્ટ 2024 · શિફ્ટ A સક્રિય · 45 કામદારો હાજર",
    checkFeasibilityBtn: "ઓર્ડર ફિઝિબિલિટી તપાસો",

    // Metrics Cards
    factoryHealth: "ફેક્ટરી હેલ્થ",
    amberBreakdown: "એમ્બર — 1 બ્રેકડાઉન",
    ordersOnTrack: "સમયસર ઓર્ડર",
    atRisk: "2 જોખમમાં",
    machinesRunning: "ચાલતા મશીનો",
    machineStatusSummary: "1 બંધ, 1 સર્વિસમાં",
    materialAlerts: "મટિરિયલ એલર્ટ",
    criticalShortage: "ગંભીર અછત",
    todayDispatches: "આજના ડિસ્પેચ",
    pendingPickup: "2 બાકી",
    criticalAlerts: "મહત્વપૂર્ણ એલર્ટ",
    needsAction: "તત્કાલ પગલાં જરૂરી",

    // AI Daily Briefing
    aiDailyBriefing: "AI દૈનિક બ્રીફિંગ",
    updatedTime: "સવારે 09:20 વાગ્યે અપડેટ થયું",
    highestPriority: "સર્વોચ્ચ પ્રાથમિકતા: ઓર્ડર #124 ડેલિવેરી જોખમમાં છે",
    viewDetails: "વિગતો જુઓ",
    takeAction: "પગલાં લો",
    whatHappened: "શું થયું",
    whatHappenedDesc: "સ્પિન્ડલ બેરિંગ ફેલ થવાને કારણે સવારે 09:15 વાગ્યે મશીન M-02 બંધ પડી ગયું.",
    whyHappened: "શા માટે થયું",
    whyHappenedDesc: "PM સર્વિસ 23 દિવસ બાકી હતી. 3 દિવસ પહેલા વાઇબ્રેશન એલર્ટ અવગણવામાં આવ્યું હતું.",
    businessImpact: "વ્યવસાયિક અસર",
    businessImpactDesc: "હીરો મોટોકોર્પ ડિલિવરી 26 ઓગસ્ટ કરતાં 2 દિવસ મોડી. ₹64,000 પેનલ્ટીનું જોખમ.",
    aiRecommendation: "AI ભલામણ",
    aiRecDesc: "ઓર્ડર #124 નું બાકીનું કામ તરત જ મશીન M-04 પર ટ્રાન્સફર કરો.",

    // Machine Monitoring Page
    machineMonitoring: "મશીન મોનિટરિંગ",
    realtimeTelemetry: "રિયલ-ટાઇમ ફ્લોર ટેલિમેટ્રી અને સ્ટેટસ ટ્રેકિંગ",
    all: "બધા",
    running: "ચાલુ",
    idle: "બંધ",
    breakdown: "બ્રેકડાઉન",
    addMachine: "મશીન ઉમેરો",
    currentJob: "ચાલુ કામ",

    // Pricing Section
    transparentPricing: "પારદર્શક ભાવ",
    simplePlans: "ભારતીય ફેક્ટરીઓ માટે સરળ પ્લાન",
    starterPlan: "સ્ટાર્ટર પ્લાન પસંદ કરો",
    growthPlan: "મફત ટ્રાયલ શરૂ કરો",
    enterprisePlan: "સેલ્સ ટીમનો સંપર્ક કરો",
    mostPopular: "MSME માટે સૌથી લોકપ્રિય",
  },
  ta: {
    // Nav & Common
    appName: "ஃபேக்டரி-IQ",
    tagline: "இந்திய MSME-களுக்கான புத்திசாலித்தன தளம்",
    dashboard: "டாஷ்போர்டு",
    aiCopilot: "AI உதவியாளர்",
    aiAlerts: "AI எச்சரிக்கைகள்",
    orders: "ஆர்டர்கள்",
    aiFeasibility: "AI சாத்தியக்கூறு",
    production: "உற்பத்தி",
    machines: "இயந்திரங்கள்",
    maintenance: "பராமரிப்பு",
    inventory: "சரக்கு (இன்வென்டரி)",
    suppliers: "விநியோகஸ்தர்கள்",
    profitability: "லாபம்",
    workerView: "தொழிலாளி பார்வை",
    memoryBank: "மெமரி பேங்க்",
    factorySetup: "ஃபேக்டரி அமைப்பு",
    signIn: "உள்நுழைக",
    signOut: "வெளியேறு",
    startFreeTrial: "இலவச சோதனைத் தொடங்கு",
    features: "அம்சங்கள்",
    howItWorks: "எப்படி செயல்படுகிறது",
    pricing: "விலை",

    // Dashboard Greeting & Header
    greeting: "காலை வணக்கம், ராஜேஷ் 👋",
    shiftStatus: "வெள்ளி, 23 ஆகஸ்ட் 2024 · ஷிப்ட் A இயங்குகிறது · 45 தொழிலாளர்கள்",
    checkFeasibilityBtn: "ஆர்டர் சாத்தியக்கூறு சரிபார்",

    // Metrics Cards
    factoryHealth: "ஆலை ஆரோக்கியம்",
    amberBreakdown: "ஆம்பர் — 1 பழுது",
    ordersOnTrack: "சரியான நேரத்தில் ஆர்டர்கள்",
    atRisk: "2 ஆபத்தில்",
    machinesRunning: "இயங்கும் இயந்திரங்கள்",
    machineStatusSummary: "1 பழுது, 1 பராமரிப்பில்",
    materialAlerts: "பொருள் எச்சரிக்கை",
    criticalShortage: "கடுமையான தட்டுப்பாடு",
    todayDispatches: "இன்றைய விநியோகம்",
    pendingPickup: "2 நிலுவையில்",
    criticalAlerts: "முக்கிய எச்சரிக்கைகள்",
    needsAction: "உடனடி நடவடிக்கை தேவை",

    // AI Daily Briefing
    aiDailyBriefing: "AI தினசரி அறிக்கை",
    updatedTime: "காலை 09:20 மணிக்கு புதுப்பிக்கப்பட்டது",
    highestPriority: "முக்கிய முன்னுரிமை: ஆர்டர் #124 காலக்கெடுவை தவறவிடும் அபாயம்",
    viewDetails: "விவரங்களை காண்க",
    takeAction: "நடவடிக்கை எடு",
    whatHappened: "என்ன நடந்தது",
    whatHappenedDesc: "காலை 09:15 மணிக்கு M-02 இயந்திரம் பழுதடைந்தது.",
    whyHappened: "ஏன் நடந்தது",
    whyHappenedDesc: "PM பராமரிப்பு 23 நாட்கள் தாமதமானது.",
    businessImpact: "வணிக பாதிப்பு",
    businessImpactDesc: "ஹீரோ மோட்டோகார்ப் விநியோகம் 2 நாட்கள் தாமதம். ₹64,000 அபராத அபாயம்.",
    aiRecommendation: "AI பரிந்துரை",
    aiRecDesc: "ஆர்டர் #124 மீதமுள்ள வேலையை உடனடியாக M-04 இயந்திரத்திற்கு மாற்றவும்.",

    // Machine Monitoring Page
    machineMonitoring: "இயந்திர கண்காணிப்பு",
    realtimeTelemetry: "நிகழ்நேர தள அளவீடு மற்றும் கண்காணிப்பு",
    all: "அனைத்தும்",
    running: "இயங்குகிறது",
    idle: "சும்மா உள்ளது",
    breakdown: "பழுது",
    addMachine: "இயந்திரம் சேர்",
    currentJob: "தற்போதைய வேலை",

    // Pricing Section
    transparentPricing: "வெளிப்படையான விலை",
    simplePlans: "இந்திய தொழிற்சாலைகளுக்கான எளிய திட்டங்கள்",
    starterPlan: "ஸ்டார்ட்டர் திட்டம் தேர்வு செய்",
    growthPlan: "இலவச சோதனைத் தொடங்கு",
    enterprisePlan: "விற்பனை பிரிவை தொடர்பு கொள்ளவும்",
    mostPopular: "MSME-களுக்கு மிகவும் பிரபலமானது",
  },
  te: {
    // Nav & Common
    appName: "ఫ్యాక్టరీ-IQ",
    tagline: "భారతీయ MSMEల కోసం ఇంటెలిజెన్స్ ప్లాట్‌ఫారమ్",
    dashboard: "డాష్‌బోర్డ్",
    aiCopilot: "AI కోపైలట్",
    aiAlerts: "AI హెచ్చరికలు",
    orders: "ఆర్డర్లు",
    aiFeasibility: "AI లభ్యత",
    production: "ఉత్పత్తి",
    machines: "మిషన్లు",
    maintenance: "నిర్వహణ (మెయింటెనెన్స్)",
    inventory: "ఇన్వెంటరీ",
    suppliers: "సప్లయర్లు",
    profitability: "లాభదాయకత",
    workerView: "వర్కర్ వ్యూ",
    memoryBank: "మెమరీ బ్యాంక్",
    factorySetup: "ఫ్యాక్టరీ సెటప్",
    signIn: "సైన్ ఇన్ చేయండి",
    signOut: "సైన్ అవుట్ చేయండి",
    startFreeTrial: "ఉచిత ట్రయల్ ప్రారంభించండి",
    features: "ఫీచర్లు",
    howItWorks: "ఇది ఎలా పనిచేస్తుంది",
    pricing: "ధరలు",

    // Dashboard Greeting & Header
    greeting: "శుభోదయం, రాజేష్ 👋",
    shiftStatus: "శుక్రవారం, 23 ఆగస్టు 2024 · షిఫ్ట్ A సక్రియం · 45 మంది కార్మికులు",
    checkFeasibilityBtn: "ఆర్డర్ లభ్యతను తనిఖీ చేయండి",

    // Metrics Cards
    factoryHealth: "ఫ్యాక్టరీ ఆరోగ్యం",
    amberBreakdown: "ఆంబర్ — 1 బ్రేక్‌డౌన్",
    ordersOnTrack: "సమయానికి ఉన్న ఆర్డర్లు",
    atRisk: "2 ప్రమాదంలో ఉన్నాయి",
    machinesRunning: "నడుస్తున్న మిషన్లు",
    machineStatusSummary: "1 బంద్, 1 మెయింటెనెన్స్‌లో",
    materialAlerts: "మెటీరియల్ అలర్ట్స్",
    criticalShortage: "తీవ్రమైన కొరత",
    todayDispatches: "నేటి డిస్పాచ్‌లు",
    pendingPickup: "2 పికప్ మిగిలి ఉన్నాయి",
    criticalAlerts: "ముఖ్యమైన అలర్ట్స్",
    needsAction: "వెంటనే చర్య అవసరం",

    // AI Daily Briefing
    aiDailyBriefing: "AI డైలీ బ్రీఫింగ్",
    updatedTime: "ఉదయం 09:20 కి అప్‌డేట్ చేయబడింది",
    highestPriority: "అత్యంత ప్రాధాన్యత: ఆర్డర్ #124 గడువు తప్పే ప్రమాదం ఉంంది",
    viewDetails: "వివరాలను చూడండి",
    takeAction: "చర్య తీసుకోండి",
    whatHappened: "ఏమి జరిగింది",
    whatHappenedDesc: "ఉదయం 09:15 కి M-02 మిషన్ బేరింగ్ ఫెయిల్యూర్‌ వల్ల ఆగిపోయింది.",
    whyHappened: "ఎందుకు జరిగింది",
    whyHappenedDesc: "PM సర్వీసింగ్ 23 రోజులు ఆలస్యమైంది.",
    businessImpact: "వ్యాపార ప్రభావం",
    businessImpactDesc: "హీరో మోటోకార్ప్ డెలివరీ 2 రోజులు ఆలస్యం. ₹64,000 జరిమానా ప్రమాదం.",
    aiRecommendation: "AI సిఫార్సు",
    aiRecDesc: "ఆర్డర్ #124 మిగిలిన పనిని వెంటనే మిషన్ M-04 కి తరలించండి.",

    // Machine Monitoring Page
    machineMonitoring: "మిషన్ పర్యవేక్షణ",
    realtimeTelemetry: "రియల్ టైమ్ ఫ్లోర్ టెలిమెట్రీ మరియు స్థితి పర్యవేక్షణ",
    all: "అన్నీ",
    running: "నడుస్తోంది",
    idle: "ఖాలీగా ఉంది",
    breakdown: "బ్రేక్‌డౌన్",
    addMachine: "మిషన్ జోడించండి",
    currentJob: "ప్రస్తుత పని",

    // Pricing Section
    transparentPricing: "పారదర్శక ధరలు",
    simplePlans: "భారతీయ ఫ్యాక్టరీల కోసం సరళమైన ప్లాన్లు",
    starterPlan: "స్టార్టర్ ప్లాన్ ఎంచుకోండి",
    growthPlan: "ఉచిత ట్రయల్ ప్రారంభించండి",
    enterprisePlan: "సేల్స్ టీమ్‌ను సంప్రదించండి",
    mostPopular: "MSMEల కోసం అత్యంత ప్రజాదరణ పొందినది",
  },
  kn: {
    // Nav & Common
    appName: "ಫ್ಯಾಕ್ಟರಿ-IQ",
    tagline: "ಭಾರತೀಯ MSMEಗಳಿಗಾಗಿ ಇಂಟೆಲಿಜೆನ್ಸ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    aiCopilot: "AI ಸಹಾಯಕ",
    aiAlerts: "AI ಎಚ್ಚರಿಕೆಗಳು",
    orders: "ಆರ್ಡರ್‌ಗಳು",
    aiFeasibility: "AI ಲಭ್ಯತೆ ಪರೀಕ್ಷೆ",
    production: "ಉತ್ಪಾದನೆ",
    machines: "ಯಂತ್ರಗಳು",
    maintenance: "ನಿರ್ವಹಣೆ (ಮೇಂಟೇನೆನ್ಸ್)",
    inventory: "ದಾಸ್ತಾನು (ಇನ್ವೆಂಟರಿ)",
    suppliers: "ಸರಬರಾಜುದಾರರು",
    profitability: "ಲಾಭದಾಯಕತೆ",
    workerView: "ಕಾರ್ಮಿಕರ ನೋಟ",
    memoryBank: "ಮೆಮೊರಿ ಬ್ಯಾಂಕ್",
    factorySetup: "ಫ್ಯಾಕ್ಟರಿ ಸೆಟಪ್",
    signIn: "ಸೈನ್ ಇನ್ ಮಾಡಿ",
    signOut: "ಸೈನ್ ಔಟ್ ಮಾಡಿ",
    startFreeTrial: "ಉಚಿತ ಟ್ರಯಲ್ ಪ್ರಾರಂಭಿಸಿ",
    features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    howItWorks: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ",
    pricing: "ಬೆಲೆಗಳು",

    // Dashboard Greeting & Header
    greeting: "ಶುಭೋದಯ, ರಾಜೇಶ್ 👋",
    shiftStatus: "ಶುಕ್ರವಾರ, 23 ಆಗಸ್ಟ್ 2024 · ಶಿಫ್ಟ್ A ಸಕ್ರಿಯ · 45 ಕಾರ್ಮಿಕರು ಉಪಸ್ಥಿತರಿದ್ದಾರೆ",
    checkFeasibilityBtn: "ಆರ್ಡರ್ ಲಭ್ಯತೆ ಪರೀಕ್ಷಿಸಿ",

    // Metrics Cards
    factoryHealth: "ಫ್ಯಾಕ್ಟರಿ ಆರೋಗ್ಯ",
    amberBreakdown: "ಆಂಬರ್ — 1 ಯಂತ್ರ ಸ್ಥಗಿತ",
    ordersOnTrack: "ಸಮಯಕ್ಕೆ ಸರಿಯಾದ ಆರ್ಡರ್‌ಗಳು",
    atRisk: "2 ಅಪಾಯದಲ್ಲಿದೆ",
    machinesRunning: "ಚಾಲನೆಯಲ್ಲಿರುವ ಯಂತ್ರಗಳು",
    machineStatusSummary: "1 ಸ್ಥಗಿತ, 1 ನಿರ್ವಹಣೆಯಲ್ಲಿದೆ",
    materialAlerts: "ಸಾಮಗ್ರಿ ಎಚ್ಚರಿಕೆ",
    criticalShortage: "ತೀವ್ರ ಅಭಾವ",
    todayDispatches: "ಇಂದಿನ ರವಾನೆ (ಡಿಸ್ಪ್ಯಾಚ್)",
    pendingPickup: "2 ಬಾಕಿ ಇವೆ",
    criticalAlerts: "ಪ್ರಮುಖ ಎಚ್ಚರಿಕೆಗಳು",
    needsAction: "ತಕ್ಷಣದ ಕ್ರಮ ಅಗತ್ಯವಿದೆ",

    // AI Daily Briefing
    aiDailyBriefing: "AI ದೈನಂದಿನ ಮಾಹಿತಿ",
    updatedTime: "ಬೆಳಿಗ್ಗೆ 09:20 ಕ್ಕೆ ನವೀಕರಿಸಲಾಗಿದೆ",
    highestPriority: "ಅತ್ಯಂತ ಪ್ರಮುಖ: ಆರ್ಡರ್ #124 ಸಮಯಕ್ಕೆ ತಲುಪದಿರುವ ಅಪಾಯದಲ್ಲಿದೆ",
    viewDetails: "ವಿವರಗಳನ್ನು ನೋಡಿ",
    takeAction: "ಕ್ರಮ ತೆಗೆದುಕೊಳ್ಳಿ",
    whatHappened: "ಏನಾಯಿತು",
    whatHappenedDesc: "ಬೆಳಿಗ್ಗೆ 09:15 ಕ್ಕೆ M-02 ಯಂತ್ರವು ಬಿಡಿಭಾಗಗಳ ವೈಫಲ್ಯದಿಂದ ಸ್ಥಗಿತಗೊಂಡಿದೆ.",
    whyHappened: "ಏಕೆ ಆಯಿತು",
    whyHappenedDesc: "PM ಸೇವೆ 23 ದಿನಗಳು ವಿಳಂಬವಾಗಿತ್ತು.",
    businessImpact: "ವ್ಯಾಪಾರದ ಮೇಲಿನ ಪರಿಣಾಮ",
    businessImpactDesc: "ಹೀರೋ ಮೋಟೋಕಾರ್ಪ್ ವಿತರಣೆ 2 ದಿನ ವಿಳಂಬ. ₹64,000 ದಂಡದ ಅಪಾಯ.",
    aiRecommendation: "AI ಶಿಫಾರಸು",
    aiRecDesc: "ಆರ್ಡರ್ #124 ರ ಉಳಿದ ಕೆಲಸವನ್ನು ತಕ್ಷಣ M-04 ಯಂತ್ರಕ್ಕೆ ವರ್ಗಾಯಿಸಿ.",

    // Machine Monitoring Page
    machineMonitoring: "ಯಂತ್ರ ಉಸ್ತುವಾರಿ",
    realtimeTelemetry: "ನೈಜ సమಯದ ಫ್ಲೋರ್ ಟೆಲಿಮೆಟ್ರಿ ಮತ್ತು ಸ್ಥಿತಿ ಪರೀಕ್ಷೆ",
    all: "ಎಲ್ಲವೂ",
    running: "ಚಾಲನೆಯಲ್ಲಿದೆ",
    idle: "ಖಾಲಿಯಾಗಿದೆ",
    breakdown: "ಸ್ಥಗಿತಗೊಂಡಿದೆ",
    addMachine: "ಯಂತ್ರ ಸೇರಿಸಿ",
    currentJob: "ಪ್ರಸ್ತುತ ಕೆಲಸ",

    // Pricing Section
    transparentPricing: "ಪಾರದರ್ಶಕ ಬೆಲೆಗಳು",
    simplePlans: "ಭಾರತೀಯ ಕಾರ್ಖಾನೆಗಳಿಗೆ ಸರಳ ಪ್ಲಾನ್‌ಗಳು",
    starterPlan: "ಸ್ಟಾರ್ಟರ್ ಪ್ಲಾನ್ ಆಯ್ಕೆಮಾಡಿ",
    growthPlan: "ಉಚಿತ ಟ್ರಯಲ್ ಪ್ರಾರಂಭಿಸಿ",
    enterprisePlan: "ಮಾರಾಟ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ",
    mostPopular: "MSME ಗಳಿಗೆ ಅತ್ಯಂತ ಜನಪ್ರಿಯ",
  },
};

export function getTranslation(
  lang: LanguageCode,
  key: string,
  paramsOrFallback?: Record<string, any> | string,
  defaultText?: string
): string {
  let fallback: string | undefined = typeof paramsOrFallback === "string" ? paramsOrFallback : defaultText;
  let params: Record<string, any> | undefined = typeof paramsOrFallback === "object" ? paramsOrFallback : undefined;

  const langDict = translations[lang] || translations.en;

  // Direct key lookup
  let text = langDict?.[key];

  // Dot notation lookup (e.g. "dashboard.welcome")
  if (!text && key.includes(".")) {
    const parts = key.split(".");
    const leaf = parts[parts.length - 1];
    text = langDict?.[leaf];
  }

  // Fallback to English dictionary
  if (!text) {
    const enDict = translations.en;
    text = enDict?.[key];
    if (!text && key.includes(".")) {
      const leaf = key.split(".").pop()!;
      text = enDict?.[leaf];
    }
  }

  // Fallback to provided string or formatted key
  if (!text) {
    if (fallback) {
      text = fallback;
    } else {
      const leaf = key.split(".").pop() || key;
      text = leaf
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
    }
  }

  // Handle variable interpolation {{variable}} and pluralization
  if (params) {
    Object.keys(params).forEach((paramKey) => {
      const val = params![paramKey];
      text = text.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, "g"), String(val));
    });
  }

  return text;
}
