"""
Patient-facing ("easy mode") assessment for low-literacy users.

Design rules (see README / conversation notes):
  * The patient never sees a diagnosis name or a confidence percentage,
    only a next action: RED (emergency now), YELLOW (doctor today), GREEN (home care).
  * Rules lean towards escalation: any danger sign -> RED.
  * The underlying triage engine is keyword-based and NOT clinically validated.
  * Hindi strings are machine-drafted and must be reviewed by a native speaker
    before any real-world use.
"""
import hashlib
import time
from typing import Dict, List, Any

from models import PatientProfile

# --------------------------------------------------------------------------
# Multi-language dictionary definitions
# Supported: English (en), Hindi (hi), Odia (or), Bengali (bn),
#            Tamil (ta), Telugu (te), Marathi (mr), Gujarati (gu)
# --------------------------------------------------------------------------
SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "native": "English", "speech_code": "en-IN"},
    {"code": "hi", "name": "Hindi", "native": "हिन्दी", "speech_code": "hi-IN"},
    {"code": "or", "name": "Odia", "native": "ଓଡ଼ିଆ", "speech_code": "or-IN"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "speech_code": "bn-IN"},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "speech_code": "ta-IN"},
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "speech_code": "te-IN"},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "speech_code": "mr-IN"},
    {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "speech_code": "gu-IN"},
]

SYMPTOM_CATALOG: List[Dict[str, Any]] = [
    # Chest / heart
    {
        "id": "chest_pain", "region": "chest", "icon": "💔", "engine_term": "chest pain", "danger": True,
        "label": {
            "en": "Chest pain",
            "hi": "छाती में दर्द",
            "or": "ଛାତିରେ ଯନ୍ତ୍ରଣା",
            "bn": "বুকে ব্যথা",
            "ta": "மார்பு வலி",
            "te": "ఛాతీ నొప్పి",
            "mr": "छातीत दुखणे",
            "gu": "છાતીમાં દુખાવો"
        },
        "keywords": {
            "en": ["chest pain", "chest"],
            "hi": ["छाती", "सीने"],
            "or": ["ଛାତି", "ଯନ୍ତ୍ରଣା"],
            "bn": ["বুকে", "ব্যথা"],
            "ta": ["மார்பு", "வலி"],
            "te": ["ఛాతీ", "నొప్పి"],
            "mr": ["छाती", "दुखणे"],
            "gu": ["છાતી", "દુખાવો"]
        }
    },
    {
        "id": "arm_pain", "region": "chest", "icon": "💪", "engine_term": "radiating pain to left arm", "danger": True,
        "label": {
            "en": "Pain spreading to left arm or jaw",
            "hi": "बाएँ हाथ या जबड़े तक दर्द",
            "or": "ବାମ ହାତ କିମ୍ବା ବାଘୁଣିକୁ ଯନ୍ତ୍ରଣା",
            "bn": "বাম হাত বা চোয়ালে ব্যথা",
            "ta": "இடது கை அல்லது தாடைக்கு பரவும் வலி",
            "te": "ఎడమ చేయి లేదా దవడకు వ్యాపించే నొప్పి",
            "mr": "डाव्या हातात किंवा जबड्यात दुखणे",
            "gu": "ડાબા હાથ કે જડબા સુધી દુખાવો"
        },
        "keywords": {
            "en": ["arm", "jaw"],
            "hi": ["हाथ", "जबड़"],
            "or": ["ହାତ", "ବାଘୁଣି"],
            "bn": ["হাত", "চোয়াল"],
            "ta": ["கை", "தாடை"],
            "te": ["చేయి", "దవడ"],
            "mr": ["हात", "जबडा"],
            "gu": ["હાથ", "જડબું"]
        }
    },
    {
        "id": "breathless", "region": "chest", "icon": "💨", "engine_term": "shortness of breath", "danger": True,
        "label": {
            "en": "Hard to breathe",
            "hi": "साँस लेने में तकलीफ़",
            "or": "ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ",
            "bn": "শ্বাসকষ্ট",
            "ta": "மூச்சுத் திணறல்",
            "te": "శ్వాస తీసుకోవడంలో ఇబ్బంది",
            "mr": "श्वास घेण्यास त्रास",
            "gu": "શ્વાસ લેવામાં તકલીફ"
        },
        "keywords": {
            "en": ["breath", "breathe"],
            "hi": ["साँस", "सांस"],
            "or": ["ନିଶ୍ୱାସ", "ଦମ"],
            "bn": ["শ্বাস", "দম"],
            "ta": ["மூச்சு", "திணறல்"],
            "te": ["శ్వాస", "ఆయాసం"],
            "mr": ["श्वास", "दम"],
            "gu": ["શ્વાસ", "દમ"]
        }
    },
    {
        "id": "palpitations", "region": "chest", "icon": "💓", "engine_term": "palpitations", "danger": False,
        "label": {
            "en": "Heart racing",
            "hi": "दिल की धड़कन तेज़",
            "or": "ହୃଦସ୍ପନ୍ଦନ ଦ୍ରୁତ",
            "bn": "বুক ধড়ফড়",
            "ta": "படபடப்பு",
            "te": "గుండె దడ",
            "mr": "हृदयाचे ठोके जलद",
            "gu": "ધબકારા ઝડપી"
        },
        "keywords": {
            "en": ["heart racing", "palpitation"],
            "hi": ["धड़कन"],
            "or": ["ସ୍ପନ୍ଦନ"],
            "bn": ["ধড়ফড়"],
            "ta": ["படபடப்பு"],
            "te": ["దడ"],
            "mr": ["ठोके"],
            "gu": ["ધબકારા"]
        }
    },
    {
        "id": "heartburn", "region": "chest", "icon": "🔥", "engine_term": "heartburn", "danger": False,
        "label": {
            "en": "Burning in chest after food",
            "hi": "खाने के बाद छाती में जलन",
            "or": "ଖାଇବା ପରେ ଛାତି ଜଳାପୋଡ଼ା",
            "bn": "খাওয়ার পর বুকে জ্বালাপোড়া",
            "ta": "நெஞ்செரிச்சல்",
            "te": "ఛాతీలో మంట",
            "mr": "छातीत जळजळ",
            "gu": "છાતીમાં બળતરા"
        },
        "keywords": {
            "en": ["heartburn", "acidity"],
            "hi": ["एसिडिटी", "जलन"],
            "or": ["ଜଳାପୋଡ଼ା", "ଏସିଡିଟି"],
            "bn": ["জ্বালা", "অ্যাসিডিটি"],
            "ta": ["எரிச்சல்"],
            "te": ["మంట"],
            "mr": ["जळजळ"],
            "gu": ["બળતરા"]
        }
    },
    {
        "id": "cough", "region": "chest", "icon": "😷", "engine_term": "cough", "danger": False,
        "label": {
            "en": "Cough",
            "hi": "खाँसी",
            "or": "କାଶ",
            "bn": "কাশি",
            "ta": "இருமல்",
            "te": "దగ్గు",
            "mr": "खोकला",
            "gu": "ઉધરસ"
        },
        "keywords": {
            "en": ["cough"],
            "hi": ["खांसी", "खाँसी"],
            "or": ["କାଶ"],
            "bn": ["কাশি"],
            "ta": ["இருமல்"],
            "te": ["దగ్గు"],
            "mr": ["खोकला"],
            "gu": ["ઉધરસ"]
        }
    },
    {
        "id": "wheeze", "region": "chest", "icon": "🌬️", "engine_term": "wheezing", "danger": False,
        "label": {
            "en": "Whistling sound when breathing",
            "hi": "साँस में सीटी जैसी आवाज़",
            "or": "ନିଶ୍ୱାସରେ ହୁଇସିଲ୍ ଶବ୍ଦ",
            "bn": "শ্বাসে বাঁশির মতো শব্দ",
            "ta": "மூச்சில் விசில் சத்தம்",
            "te": "శ్వాసలో పిల్లికూతలు",
            "mr": "श्वासात शिट्टीसारखा आवाज",
            "gu": "શ્વાસમાં સિસટી જેવો અવાજ"
        },
        "keywords": {
            "en": ["wheez", "whistl"],
            "hi": ["सीटी"],
            "or": ["ଶବ୍ଦ"],
            "bn": ["বাঁশি"],
            "ta": ["விசில்"],
            "te": ["శబ్దం"],
            "mr": ["शिट्टी"],
            "gu": ["સિસટી"]
        }
    },
    {
        "id": "blood_cough", "region": "chest", "icon": "🩸", "engine_term": "coughing up blood", "danger": True,
        "label": {
            "en": "Coughing up blood",
            "hi": "खाँसी में खून",
            "or": "କାଶରେ ରକ୍ତ ପଡ଼ିବା",
            "bn": "কাশির সাথে রক্ত",
            "ta": "இருமலில் இரத்தம்",
            "te": "దగ్గులో రక్తం",
            "mr": "खोकल्यातून रक्त",
            "gu": "ઉધરસમાં લોહી"
        },
        "keywords": {
            "en": ["blood"],
            "hi": ["खून"],
            "or": ["ରକ୍ତ"],
            "bn": ["রক্ত"],
            "ta": ["இரத்தம்"],
            "te": ["రక్తం"],
            "mr": ["रक्त"],
            "gu": ["લોહી"]
        }
    },

    # Head
    {
        "id": "headache", "region": "head", "icon": "🤕", "engine_term": "headache", "danger": False,
        "label": {
            "en": "Headache",
            "hi": "सिरदर्द",
            "or": "ମୁଣ୍ଡବିନ୍ଧା",
            "bn": "মাথাব্যথা",
            "ta": "தலைவலி",
            "te": "తలనొప్పి",
            "mr": "डोकेदुखी",
            "gu": "માથાનો દુખાવો"
        },
        "keywords": {
            "en": ["headache", "head pain"],
            "hi": ["सिरदर्द", "सिर दर्द"],
            "or": ["ମୁଣ୍ଡବିନ୍ଧା", "ମୁଣ୍ଡ"],
            "bn": ["মাথাব্যথা", "মাথা"],
            "ta": ["தலைவலி", "தலை"],
            "te": ["తలనొప్పి", "తల"],
            "mr": ["डोकेदुखी", "डोके"],
            "gu": ["માથાનો દુખાવો", "માથું"]
        }
    },
    {
        "id": "worst_headache", "region": "head", "icon": "🤯", "engine_term": "worst headache of life", "danger": True,
        "label": {
            "en": "Sudden, worst-ever headache",
            "hi": "अचानक, अब तक का सबसे तेज़ सिरदर्द",
            "or": "ହଠାତ୍ ଅସହ୍ୟ ମୁଣ୍ଡବିନ୍ଧା",
            "bn": "হঠাৎ তীব্রতম মাথাব্যথা",
            "ta": "திடீர் கடுமையான தலைவலி",
            "te": "ఆకస్మిక తీవ్రమైన తలనొప్పి",
            "mr": "अचानक अतिशय तीव्र डोकेदुखी",
            "gu": "અચાનક અસહ્ય માથાનો દુખાવો"
        },
        "keywords": {
            "en": ["worst", "sudden"],
            "hi": ["सबसे तेज़"],
            "or": ["ଅସହ୍ୟ"],
            "bn": ["তীব্র"],
            "ta": ["கடுமையான"],
            "te": ["తీవ్రమైన"],
            "mr": ["तीव्र"],
            "gu": ["અસહ્ય"]
        }
    },
    {
        "id": "face_weak", "region": "head", "icon": "🧠", "engine_term": "facial droop", "danger": True,
        "label": {
            "en": "Face drooping or speech unclear",
            "hi": "चेहरा टेढ़ा, बोलने में दिक्कत",
            "or": "ମୁହଁ ବଙ୍କା ବା କଥା କହିବାରେ ଅସୁବିଧା",
            "bn": "মুখ বেঁকে যাওয়া বা কথা জড়ানো",
            "ta": "முகம் கோணல் அல்லது பேச்சு குழப்பம்",
            "te": "ముఖం వంకరపోవడం లేదా మాట తడబడటం",
            "mr": "तोंड वाकडे होणे किंवा अडखळणे",
            "gu": "મોં વાંકું થવું કે બોલવામાં તકલીફ"
        },
        "keywords": {
            "en": ["face", "slurred"],
            "hi": ["चेहरा", "लकवा"],
            "or": ["ମୁହଁ", "ଲକ୍ୱା"],
            "bn": ["মুখ", "প্যারালাইসিস"],
            "ta": ["முகம்", "பக்கவாதம்"],
            "te": ["ముఖం", "పక్షవాతం"],
            "mr": ["तोंड", "पक्षाघात"],
            "gu": ["મોં", "લકવો"]
        }
    },
    {
        "id": "faint", "region": "head", "icon": "😵", "engine_term": "fainting", "danger": True,
        "label": {
            "en": "Fainted or nearly fainted",
            "hi": "बेहोशी या गिर पड़ना",
            "or": "ମୂର୍ଚ୍ଛା ବା ଚେତା ହରାଇବା",
            "bn": "অজ্ঞান হয়ে যাওয়া",
            "ta": "மயக்கம் அடைதல்",
            "te": "స్పృహ తప్పడం",
            "mr": "चक्कर येऊन पडणे",
            "gu": "બેહોશ થઈ જવું"
        },
        "keywords": {
            "en": ["faint", "unconscious"],
            "hi": ["बेहोश"],
            "or": ["ମୂର୍ଚ୍ଛା"],
            "bn": ["অজ্ঞান"],
            "ta": ["மயக்கம்"],
            "te": ["స్పృహ"],
            "mr": ["बेहोश"],
            "gu": ["બેહોશ"]
        }
    },
    {
        "id": "dizzy", "region": "head", "icon": "🌀", "engine_term": "dizziness", "danger": False,
        "label": {
            "en": "Dizziness",
            "hi": "चक्कर आना",
            "or": "ମୁଣ୍ଡ ବୁଲାଇବା",
            "bn": "মাথা ঘোরা",
            "ta": "தலைசுற்றல்",
            "te": "కళ్ళు తిరగడం",
            "mr": "चक्कर येणे",
            "gu": "ચક્કર આવવા"
        },
        "keywords": {
            "en": ["dizzy"],
            "hi": ["चक्कर"],
            "or": ["ମୁଣ୍ଡ ବୁଲାଇବା"],
            "bn": ["মাথা ঘোরা"],
            "ta": ["தலைசுற்றல்"],
            "te": ["తిరగడం"],
            "mr": ["चक्कर"],
            "gu": ["ચક્કર"]
        }
    },
    {
        "id": "blurry", "region": "head", "icon": "👁️", "engine_term": "blurred vision", "danger": False,
        "label": {
            "en": "Blurry vision",
            "hi": "धुंधला दिखना",
            "or": "ଅସ୍ପଷ୍ଟ ଦେଖାଯିବା",
            "bn": "ঝাপসা দৃষ্টি",
            "ta": "மங்கலான பார்வை",
            "te": "మసక చూపు",
            "mr": "अंधुक दिसणे",
            "gu": "ઝાંખું દેખાવું"
        },
        "keywords": {
            "en": ["blurry", "vision"],
            "hi": ["धुंधला"],
            "or": ["ଅସ୍ପଷ୍ଟ"],
            "bn": ["ঝাপসা"],
            "ta": ["மங்கல்"],
            "te": ["మసక"],
            "mr": ["अंधुक"],
            "gu": ["ઝાંખું"]
        }
    },
    {
        "id": "light_hurts", "region": "head", "icon": "🔆", "engine_term": "photophobia", "danger": False,
        "label": {
            "en": "Light hurts the eyes",
            "hi": "रोशनी से आँखों में चुभन",
            "or": "ଆଲୋକରେ ଆଖି କାଟିବା",
            "bn": "আলোতে চোখে কষ্ট",
            "ta": "வெளிச்சம் கண்களை உறுத்துதல்",
            "te": "వెలుతురు చూడలేకపోవడం",
            "mr": "डोळ्यांना प्रकाश सहन न होणे",
            "gu": "પ્રકાશ આંખોમાં ખૂંચવો"
        },
        "keywords": {
            "en": ["light"],
            "hi": ["रोशनी"],
            "or": ["ଆଲୋକ"],
            "bn": ["আলো"],
            "ta": ["வெளிச்சம்"],
            "te": ["వెలుతురు"],
            "mr": ["प्रकाश"],
            "gu": ["પ્રકાશ"]
        }
    },

    # Stomach
    {
        "id": "belly_pain", "region": "belly", "icon": "😖", "engine_term": "abdominal cramps", "danger": False,
        "label": {
            "en": "Stomach pain",
            "hi": "पेट दर्द",
            "or": "ପେଟ ବିନ୍ଧା",
            "bn": "পেটে ব্যথা",
            "ta": "வயிற்று வலி",
            "te": "కడుపు నొప్పి",
            "mr": "पोटदुखी",
            "gu": "પેટનો દુખાવો"
        },
        "keywords": {
            "en": ["stomach", "belly"],
            "hi": ["पेट"],
            "or": ["ପେଟ"],
            "bn": ["পেট"],
            "ta": ["வயிறு"],
            "te": ["కడుపు"],
            "mr": ["पोट"],
            "gu": ["પેટ"]
        }
    },
    {
        "id": "nausea", "region": "belly", "icon": "🤢", "engine_term": "nausea", "danger": False,
        "label": {
            "en": "Feeling like vomiting",
            "hi": "जी मिचलाना",
            "or": "ବାନ୍ତି ଲାଗିବା",
            "bn": "বমি বমি ভাব",
            "ta": "குமட்டல்",
            "te": "వాంతి భావన",
            "mr": "मळमळ",
            "gu": "ઉબકા આવવા"
        },
        "keywords": {
            "en": ["nausea"],
            "hi": ["जी मिचल", "मतली"],
            "or": ["ବାନ୍ତି"],
            "bn": ["বমি বমি"],
            "ta": ["குமட்டல்"],
            "te": ["వాంతి"],
            "mr": ["मळमळ"],
            "gu": ["ઉબકા"]
        }
    },
    {
        "id": "vomiting", "region": "belly", "icon": "🤮", "engine_term": "vomiting", "danger": False,
        "label": {
            "en": "Vomiting",
            "hi": "उल्टी",
            "or": "ବାନ୍ତି ହେବା",
            "bn": "বমি",
            "ta": "வாந்தி",
            "te": "వాంతులు",
            "mr": "उलट्या",
            "gu": "ઉલટી"
        },
        "keywords": {
            "en": ["vomit"],
            "hi": ["उल्टी"],
            "or": ["ବାନ୍ତି"],
            "bn": ["বমি"],
            "ta": ["வாந்தி"],
            "te": ["వాంతులు"],
            "mr": ["उलटी"],
            "gu": ["ઉલટી"]
        }
    },
    {
        "id": "diarrhea", "region": "belly", "icon": "🚽", "engine_term": "diarrhea", "danger": False,
        "label": {
            "en": "Loose motions",
            "hi": "दस्त",
            "or": "ଝାଡ଼ା",
            "bn": "পাতলা পায়খানা",
            "ta": "வயிற்றுப்போக்கு",
            "te": "విరేచనాలు",
            "mr": "जुलाब",
            "gu": "ઝાડા"
        },
        "keywords": {
            "en": ["diarrh", "loose"],
            "hi": ["दस्त"],
            "or": ["ଝାଡ଼ା"],
            "bn": ["পায়খানা"],
            "ta": ["வயிற்றுப்போக்கு"],
            "te": ["విరేచనాలు"],
            "mr": ["जुलाब"],
            "gu": ["ઝાડા"]
        }
    },

    # Urine
    {
        "id": "urine_often", "region": "urine", "icon": "🚻", "engine_term": "frequent urination", "danger": False,
        "label": {
            "en": "Urinating often",
            "hi": "बार-बार पेशाब",
            "or": "ବାରମ୍ବାର ପରିସ୍ରା",
            "bn": "ঘন ঘন প্রস্রাব",
            "ta": "அடிக்கடி சிறுநீர்",
            "te": "తరచుగా మూత్రవిసర్జన",
            "mr": "वारंवार लघवी",
            "gu": "વારંવાર પેશાબ"
        },
        "keywords": {
            "en": ["urinat"],
            "hi": ["पेशाब"],
            "or": ["ପରିସ୍ରା"],
            "bn": ["প্রস্রাব"],
            "ta": ["சிறுநீர்"],
            "te": ["మూత్రం"],
            "mr": ["लघवी"],
            "gu": ["પેશાબ"]
        }
    },
    {
        "id": "burning_urine", "region": "urine", "icon": "🧯", "engine_term": "painful urination", "danger": False,
        "label": {
            "en": "Burning while urinating",
            "hi": "पेशाब में जलन",
            "or": "ପରିସ୍ରାରେ ଜଳାପୋଡ଼ା",
            "bn": "প্রস্রাবে জ্বালাপোড়া",
            "ta": "சிறுநீரில் எரிச்சல்",
            "te": "మూత్రంలో మంట",
            "mr": "लघवी करताना जळजळ",
            "gu": "પેશાબમાં બળતરા"
        },
        "keywords": {
            "en": ["burning urine"],
            "hi": ["पेशाब में जलन"],
            "or": ["ଜଳାପୋଡ଼ା"],
            "bn": ["জ্বালাপোড়া"],
            "ta": ["எரிச்சல்"],
            "te": ["మంట"],
            "mr": ["जळजळ"],
            "gu": ["બળતરા"]
        }
    },
    {
        "id": "thirst", "region": "urine", "icon": "🥤", "engine_term": "excessive thirst", "danger": False,
        "label": {
            "en": "Very thirsty all the time",
            "hi": "हर समय बहुत प्यास",
            "or": "ସବୁବେଳେ ପ୍ରବଳ ଶୋଷ",
            "bn": "অতিরিক্ত তৃষ্ণা",
            "ta": "அதிக தாகம்",
            "te": "అధిక దాహం",
            "mr": "सतत खूप तहान",
            "gu": "ખૂબ તરસ લાગવી"
        },
        "keywords": {
            "en": ["thirst"],
            "hi": ["प्यास"],
            "or": ["ଶୋଷ"],
            "bn": ["তৃষ্ণা"],
            "ta": ["தாகம்"],
            "te": ["దాహం"],
            "mr": ["तहान"],
            "gu": ["તરસ"]
        }
    },

    # Whole body
    {
        "id": "fever", "region": "body", "icon": "🤒", "engine_term": "fever", "danger": False,
        "label": {
            "en": "Fever",
            "hi": "बुखार",
            "or": "ଜ୍ୱର",
            "bn": "জ্বর",
            "ta": "காய்ச்சல்",
            "te": "జ్వరం",
            "mr": "ताप",
            "gu": "તાવ"
        },
        "keywords": {
            "en": ["fever"],
            "hi": ["बुखार"],
            "or": ["ଜ୍ୱର"],
            "bn": ["জ্বর"],
            "ta": ["காய்ச்சல்"],
            "te": ["జ్వరం"],
            "mr": ["ताप"],
            "gu": ["તાવ"]
        }
    },
    {
        "id": "chills", "region": "body", "icon": "🥶", "engine_term": "chills", "danger": False,
        "label": {
            "en": "Shivering",
            "hi": "कँपकँपी",
            "or": "ଥଣ୍ଡା ଲାଗି କମ୍ପିବା",
            "bn": "কাঁপুনি",
            "ta": "நடுக்கம்",
            "te": "వణుకు",
            "mr": "थंडी वाजणे",
            "gu": "ધ્રુજારી"
        },
        "keywords": {
            "en": ["chills", "shiver"],
            "hi": ["कँपकँपी", "कंपकंपी"],
            "or": ["କମ୍ପିବା"],
            "bn": ["কাঁপুনি"],
            "ta": ["நடுக்கம்"],
            "te": ["వణుకు"],
            "mr": ["थंडी"],
            "gu": ["ધ્રુજારી"]
        }
    },
    {
        "id": "sweating", "region": "body", "icon": "😓", "engine_term": "sweating", "danger": False,
        "label": {
            "en": "Cold sweat",
            "hi": "ठंडा पसीना",
            "or": "ଥଣ୍ଡା ଝାଳ",
            "bn": "ঠান্ডা ঘাম",
            "ta": "குளிர்ந்த வியர்வை",
            "te": "చల్లని చెమటలు",
            "mr": "थंड घाम",
            "gu": "ઠંડો પરસેવો"
        },
        "keywords": {
            "en": ["sweat"],
            "hi": ["पसीना"],
            "or": ["ଝାଳ"],
            "bn": ["ঘাম"],
            "ta": ["வியர்வை"],
            "te": ["చెమట"],
            "mr": ["घाम"],
            "gu": ["પરસેવો"]
        }
    },
    {
        "id": "tired", "region": "body", "icon": "😴", "engine_term": "fatigue", "danger": False,
        "label": {
            "en": "Very tired",
            "hi": "बहुत थकान",
            "or": "ପ୍ରବଳ କ୍ଲାନ୍ତି",
            "bn": "খুব ক্লান্তি",
            "ta": "அதிக சோர்வு",
            "te": "తీవ్ర అలసట",
            "mr": "खूप थकवा",
            "gu": "ખૂબ થાક"
        },
        "keywords": {
            "en": ["tired", "fatigue"],
            "hi": ["थकान"],
            "or": ["କ୍ଲାନ୍ତି"],
            "bn": ["ক্লান্তি"],
            "ta": ["சோர்வு"],
            "te": ["అలసట"],
            "mr": ["थकवा"],
            "gu": ["થાક"]
        }
    },

    # Neck
    {
        "id": "stiff_neck", "region": "neck", "icon": "🧣", "engine_term": "stiff neck", "danger": True,
        "label": {
            "en": "Stiff neck (can't touch chin to chest)",
            "hi": "गर्दन में अकड़न (ठोड़ी छाती से नहीं छू पा रही)",
            "or": "ବେକ ଶକ୍ତ ହେବା",
            "bn": "ঘাড় শক্ত হয়ে যাওয়া",
            "ta": "கழுத்து விறைப்பு",
            "te": "మెడ పట్టేయడం",
            "mr": "मान ताठ होणे",
            "gu": "ગરદન અકડાઈ જવી"
        },
        "keywords": {
            "en": ["stiff neck", "neck"],
            "hi": ["गर्दन अकड़", "गर्दन"],
            "or": ["ବେକ"],
            "bn": ["ঘাড়"],
            "ta": ["கழுத்து"],
            "te": ["మెడ"],
            "mr": ["मान"],
            "gu": ["ગરદન"]
        }
    },
    {
        "id": "sore_throat", "region": "neck", "icon": "🗣️", "engine_term": "sore throat", "danger": False,
        "label": {
            "en": "Sore throat / pain swallowing",
            "hi": "गले में खराश या निगलने में दर्द",
            "or": "ଗଳା ଯନ୍ତ୍ରଣା",
            "bn": "গলায় ব্যথা",
            "ta": "தொண்டை வலி",
            "te": "గొంతు నొప్పి",
            "mr": "घसा दुखणे",
            "gu": "ગળામાં દુખાવો"
        },
        "keywords": {
            "en": ["sore throat", "throat"],
            "hi": ["गला", "खराश"],
            "or": ["ଗଳା"],
            "bn": ["গলা"],
            "ta": ["தொண்டை"],
            "te": ["గొంతు"],
            "mr": ["घसा"],
            "gu": ["ગળું"]
        }
    },
    {
        "id": "neck_pain", "region": "neck", "icon": "🤕", "engine_term": "neck pain", "danger": False,
        "label": {
            "en": "Neck pain or muscle strain",
            "hi": "गर्दन में दर्द",
            "or": "ବେକ ଯନ୍ତ୍ରଣା",
            "bn": "ঘাড়ে তীব্র ব্যথা",
            "ta": "கடுமையான கழுத்து வலி",
            "te": "తీవ్రమైన మెడ నొప్పి",
            "mr": "मानेत तीव्र वेदना",
            "gu": "ગરદનમાં તીવ્ર દુખાવો"
        },
        "keywords": {
            "en": ["neck pain"],
            "hi": ["गर्दन"],
            "or": ["ବେକ"],
            "bn": ["ঘাড়"],
            "ta": ["கழுத்து"],
            "te": ["మెడ"],
            "mr": ["मान"],
            "gu": ["ગરદન"]
        }
    },

    # Arms & Hands
    {
        "id": "arm_weakness", "region": "arms", "icon": "💪", "engine_term": "sudden arm weakness", "danger": True,
        "label": {
            "en": "Sudden weakness or numbness in arm",
            "hi": "हाथ में अचानक कमज़ोरी या सुन्नपन",
            "or": "ହାତରେ ହଠାତ୍ ଦୁର୍ବଳତା",
            "bn": "হাতে হঠাৎ দুর্বলতা বা অবশ ভাব",
            "ta": "கையில் திடீர் பலவீனம்",
            "te": "చేతిలో ఆకస్మిక బలహీనత",
            "mr": "हातात अचानक अशक्तपणा",
            "gu": "હાથમાં અચાનક નબળાઈ"
        },
        "keywords": {
            "en": ["arm weakness", "arm numb"],
            "hi": ["हाथ सुन्न", "हाथ"],
            "or": ["ହାତ"],
            "bn": ["হাত"],
            "ta": ["கை"],
            "te": ["చేయి"],
            "mr": ["हात"],
            "gu": ["હાથ"]
        }
    },
    {
        "id": "hand_swelling", "region": "arms", "icon": "🖐️", "engine_term": "swollen hand joints", "danger": False,
        "label": {
            "en": "Swelling or stiffness in hands/fingers",
            "hi": "हाथों या उँगलियों में सूजन व जकड़न",
            "or": "ହାତ ବା ଆଙ୍ଗୁଳି ଫୁଲିବା",
            "bn": "হাত বা আঙুল ফোলা",
            "ta": "கை அல்லது விரல்களில் வீக்கம்",
            "te": "చేతులు లేదా వేళ్ళ వాపు",
            "mr": "हात किंवा बोटांवर सूज",
            "gu": "હાથ કે આંગળીઓમાં સોજો"
        },
        "keywords": {
            "en": ["hand swelling", "wrist"],
            "hi": ["हाथ सूजन", "उंगली"],
            "or": ["ହାତ"],
            "bn": ["আঙুল"],
            "ta": ["கை"],
            "te": ["చేయి"],
            "mr": ["हात"],
            "gu": ["હાથ"]
        }
    },

    # Legs & Feet
    {
        "id": "calf_swelling", "region": "legs", "icon": "🔴", "engine_term": "swollen painful calf", "danger": True,
        "label": {
            "en": "One leg/calf swollen, red, and painful",
            "hi": "एक पैर की पिंडली में सूजन, लाली व दर्द",
            "or": "ଗୋଟିଏ ଗୋଡ଼ ଫୁଲିବା ଓ ଯନ୍ତ୍ରଣା",
            "bn": "এক পায়ের গোড়ালি বা ডিমে ফোলা ও ব্যথা",
            "ta": "ஒரு காலில் வீக்கம் மற்றும் கடுமையான வலி",
            "te": "ఒక కాలు వాపు మరియు నొప్పి",
            "mr": "एका पायाच्या पोटरीवर सूज व वेदना",
            "gu": "એક પગની પિંડીમાં સોજો અને દુખાવો"
        },
        "keywords": {
            "en": ["calf", "leg swell", "dvt"],
            "hi": ["पिंडली", "पैर"],
            "or": ["ଗୋଡ଼"],
            "bn": ["পা"],
            "ta": ["கால்"],
            "te": ["కాలు"],
            "mr": ["पाय"],
            "gu": ["પગ"]
        }
    },
    {
        "id": "knee_pain", "region": "legs", "icon": "🦵", "engine_term": "knee pain", "danger": False,
        "label": {
            "en": "Knee pain or swelling",
            "hi": "घुटने में दर्द या सूजन",
            "or": "ଆଣ୍ଠୁ ବିନ୍ଧା ବା ଫୁଲିବା",
            "bn": "হাঁটুতে ব্যথা বা ফোলা",
            "ta": "மூட்டு வலி அல்லது வீக்கம்",
            "te": "మోకాలి నొప్పి లేదా వాపు",
            "mr": "गुडघेदुखी किंवा सूज",
            "gu": "ઢીંચણમાં દુખાવો કે સોજો"
        },
        "keywords": {
            "en": ["knee", "knee pain"],
            "hi": ["घुटने", "घुटना"],
            "or": ["ଆଣ୍ଠୁ"],
            "bn": ["হাঁটু"],
            "ta": ["மூட்டு"],
            "te": ["మోకాలు"],
            "mr": ["गुडघा"],
            "gu": ["ઢીંચણ"]
        }
    },
    {
        "id": "cant_walk", "region": "legs", "icon": "🩼", "engine_term": "inability to bear weight", "danger": False,
        "label": {
            "en": "Cannot stand or walk on foot",
            "hi": "पैर पर खड़ा होना या चलना मुश्किल",
            "or": "ଗୋଡ଼ରେ ଠିଆ ହୋଇପାରୁନାହାଁନ୍ତି",
            "bn": "পায়ে ভর দিয়ে দাঁড়াতে পারছেন না",
            "ta": "காலில் நிற்க அல்லது நடக்க முடியவில்லை",
            "te": "కాలు మీద నిలబడలేకపోవడం",
            "mr": "पायावर उभे राहता न येणे",
            "gu": "પગ પર ઊભા રહી શકાતું નથી"
        },
        "keywords": {
            "en": ["walk", "limp", "fracture"],
            "hi": ["चलना", "खड़ा"],
            "or": ["ଠିଆ"],
            "bn": ["দাঁড়াতে"],
            "ta": ["நடக்க"],
            "te": ["నడవలేక"],
            "mr": ["चालणे"],
            "gu": ["ચાલવું"]
        }
    },

    # Back & Spine
    {
        "id": "lower_back_pain", "region": "back", "icon": "⚡", "engine_term": "lower back pain", "danger": False,
        "label": {
            "en": "Severe lower back pain",
            "hi": "कमर के निचले हिस्से में तेज़ दर्द",
            "or": "କମରରେ ପ୍ରବଳ ଯନ୍ତ୍ରଣା",
            "bn": "কোমরে তীব্র ব্যথা",
            "ta": "கடுமையான இடுப்பு வலி",
            "te": "తీవ్రమైన నడుము నొప్పి",
            "mr": "कमरेत तीव्र वेदना",
            "gu": "કમરમાં તીવ્ર દુખાવો"
        },
        "keywords": {
            "en": ["back pain", "lower back"],
            "hi": ["कमर दर्द", "पीठ"],
            "or": ["କମର"],
            "bn": ["কোমর"],
            "ta": ["இடுப்பு"],
            "te": ["నడుము"],
            "mr": ["कंबर"],
            "gu": ["કમર"]
        }
    },
    {
        "id": "sciatica", "region": "back", "icon": "⚡", "engine_term": "sciatica radiating leg pain", "danger": False,
        "label": {
            "en": "Shooting electric pain down the leg",
            "hi": "कमर से पैर में करंट जैसा दर्द",
            "or": "କମରରୁ ଗୋଡ଼ ପର୍ଯ୍ୟନ୍ତ କରେଣ୍ଟ ଭଳି ଯନ୍ତ୍ରଣା",
            "bn": "কোমর থেকে পায়ে বিদ্যুৎ চমকানোর মতো ব্যথা",
            "ta": "இடுப்பிலிருந்து கால் வரை பரவும் வலி",
            "te": "నడుము నుండి కాలి వరకు వ్యాపించే నొప్పి",
            "mr": "कमरेतून पायात जाणारी तीव्र कळ",
            "gu": "કમરથી પગ સુધી કરંટ જેવો દુખાવો"
        },
        "keywords": {
            "en": ["shooting pain", "sciatica"],
            "hi": ["करंट", "कमर"],
            "or": ["କରେଣ୍ଟ"],
            "bn": ["বিদ্যুৎ"],
            "ta": ["பரவும் வலி"],
            "te": ["కరెంట్"],
            "mr": ["कळ"],
            "gu": ["કરંટ"]
        }
    },
]

SYMPTOMS_BY_ID = {s["id"]: s for s in SYMPTOM_CATALOG}

# Symptoms that always need a doctor the same day, even if the engine rates them low.
SEE_DOCTOR_TODAY = {"burning_urine", "blurry", "thirst", "urine_often", "light_hurts", "vomiting", "stiff_neck", "calf_swelling", "arm_weakness", "cant_walk", "sciatica"}

AGE_GROUPS = {
    "baby": {
        "age": 1, "icon": "👶",
        "label": {
            "en": "Baby (under 2)",
            "hi": "शिशु (2 साल से छोटा)",
            "or": "ଶିଶୁ (୨ ବର୍ଷରୁ କମ୍)",
            "bn": "শিশু (২ বছরের কম)",
            "ta": "குழந்தை (2 வயதுக்குட்பட்ட)",
            "te": "శిశువు (2 ఏళ్ల లోపు)",
            "mr": "लहान बाळ (२ वर्षांखालील)",
            "gu": "નાનું બાળક (૨ વર્ષથી નાનું)"
        }
    },
    "child": {
        "age": 8, "icon": "🧒",
        "label": {
            "en": "Child",
            "hi": "बच्चा",
            "or": "ପିଲା",
            "bn": "শিশু",
            "ta": "குழந்தை",
            "te": "పిల్లవాడు",
            "mr": "मूल",
            "gu": "બાળક"
        }
    },
    "adult": {
        "age": 35, "icon": "🧑",
        "label": {
            "en": "Adult",
            "hi": "वयस्क",
            "or": "ବୟସ୍କ",
            "bn": "প্রাপ্তবয়স্ক",
            "ta": "பெரியவர்",
            "te": "పెద్దలు",
            "mr": "प्रौढ",
            "gu": "પુખ્ત"
        }
    },
    "elderly": {
        "age": 70, "icon": "👴",
        "label": {
            "en": "Elderly (60+)",
            "hi": "बुज़ुर्ग (60 से ऊपर)",
            "or": "ବୃଦ୍ଧ (୬୦ ବର୍ଷରୁ ଊର୍ଦ୍ଧ୍ୱ)",
            "bn": "প্রবীণ (৬০+)",
            "ta": "முதியவர் (60+)",
            "te": "వృద్ధులు (60+)",
            "mr": "ज्येष्ठ नागरिक (६०+)",
            "gu": "વૃદ્ધ (૬૦+)"
        }
    },
}

REGIONS = {
    "head": {
        "icon": "🙂",
        "label": {
            "en": "Head", "hi": "सिर", "or": "ମୁଣ୍ଡ", "bn": "মাথা",
            "ta": "தலை", "te": "తల", "mr": "डोके", "gu": "માથું"
        }
    },
    "neck": {
        "icon": "🧣",
        "label": {
            "en": "Neck & Throat", "hi": "गर्दन और गला", "or": "ବେକ ଓ ଗଳା", "bn": "ঘাড় ও গলা",
            "ta": "கழுத்து & தொண்டை", "te": "మెడ & గొంతు", "mr": "मान आणि घसा", "gu": "ગરદન અને ગળું"
        }
    },
    "chest": {
        "icon": "🫁",
        "label": {
            "en": "Chest", "hi": "छाती", "or": "ଛାତି", "bn": "বুক",
            "ta": "மார்பு", "te": "ఛాతీ", "mr": "छाती", "gu": "છાતી"
        }
    },
    "belly": {
        "icon": "🍽️",
        "label": {
            "en": "Stomach", "hi": "पेट", "or": "ପେଟ", "bn": "পেট",
            "ta": "வயிறு", "te": "కడుపు", "mr": "पोट", "gu": "પેટ"
        }
    },
    "back": {
        "icon": "🦴",
        "label": {
            "en": "Back & Spine", "hi": "पीठ और रीढ़", "or": "ପିଠି ଓ ମେରୁଦଣ୍ଡ", "bn": "পিঠ ও মেরুদণ্ড",
            "ta": "முதுகு & தண்டுவடம்", "te": "వీపు & వెన్నెముక", "mr": "पाठ आणि कणा", "gu": "પીઠ અને કરોડરજ્જુ"
        }
    },
    "arms": {
        "icon": "💪",
        "label": {
            "en": "Arms & Hands", "hi": "बाँहें और हाथ", "or": "ହାତ ଓ ବାହୁ", "bn": "হাত ও কব্জি",
            "ta": "கைகள்", "te": "చేతులు", "mr": "हात आणि मनगट", "gu": "હાથ અને કાંડું"
        }
    },
    "legs": {
        "icon": "🦵",
        "label": {
            "en": "Legs & Feet", "hi": "पैर और तलवे", "or": "ଗୋଡ଼ ଓ ପାଦ", "bn": "পা ও পায়ের পাতা",
            "ta": "கால்கள் & பாதம்", "te": "కాళ్ళు & పాదాలు", "mr": "पाय आणि पावले", "gu": "પગ અને પંજા"
        }
    },
    "urine": {
        "icon": "🚻",
        "label": {
            "en": "Urine", "hi": "पेशाब", "or": "ପରିସ୍ରା", "bn": "প্রস্রাব",
            "ta": "சிறுநீர்", "te": "మూత్రం", "mr": "लघवी", "gu": "પેશાબ"
        }
    },
    "body": {
        "icon": "🌡️",
        "label": {
            "en": "Whole body", "hi": "पूरा शरीर", "or": "ପୂରା ଶରୀର", "bn": "পুরো শরীর",
            "ta": "முழு உடல்", "te": "మొత్తం శరీరం", "mr": "संपूर्ण शरीर", "gu": "આખું શરીર"
        }
    },
}

# Pictures shown under "come back immediately if..."
RETURN_IMMEDIATELY_IF = ["chest_pain", "breathless", "faint", "face_weak", "blood_cough", "stiff_neck", "calf_swelling"]


class PatientAssessmentError(ValueError):
    pass


def get_catalog() -> Dict[str, Any]:
    return {
        "languages": SUPPORTED_LANGUAGES,
        "symptoms": [
            {k: s[k] for k in ("id", "region", "icon", "label", "keywords", "danger")}
            for s in SYMPTOM_CATALOG
        ],
        "age_groups": [{"id": k, **v} for k, v in AGE_GROUPS.items()],
        "regions": [{"id": k, **v} for k, v in REGIONS.items()],
        "return_immediately_if": RETURN_IMMEDIATELY_IF,
    }


def assess(engine, age_group: str, symptom_ids: List[str], pain_score: int, custom_symptoms: str = "") -> Dict[str, Any]:
    if age_group not in AGE_GROUPS:
        raise PatientAssessmentError(f"Unknown age group: {age_group}")
    if not 0 <= pain_score <= 10:
        raise PatientAssessmentError("pain_score must be between 0 and 10")
    unknown = [s for s in symptom_ids if s not in SYMPTOMS_BY_ID]
    if unknown:
        raise PatientAssessmentError(f"Unknown symptom ids: {unknown}")
    symptom_ids = list(dict.fromkeys(symptom_ids))  # de-duplicate, keep order

    custom_text = (custom_symptoms or "").strip()
    if not symptom_ids and pain_score == 0 and not custom_text:
        raise PatientAssessmentError("Select at least one symptom, describe your condition, or pick a pain level above 0")

    # If custom text provided, match against catalog symptom keywords across all languages
    if custom_text:
        custom_lower = custom_text.lower()
        for s in SYMPTOM_CATALOG:
            if s["id"] not in symptom_ids:
                all_kws = []
                for kw_list in s.get("keywords", {}).values():
                    if isinstance(kw_list, list):
                        all_kws.extend(kw_list)
                if any(k.lower() in custom_lower for k in all_kws if len(k) > 2):
                    symptom_ids.append(s["id"])

    engine_terms = [SYMPTOMS_BY_ID[s]["engine_term"] for s in symptom_ids]
    if custom_text:
        engine_terms.append(f"Patient reported condition: {custom_text}")

    profile = PatientProfile(
        patient_id="PATIENT-MODE",
        name="Anonymous Patient",
        age=AGE_GROUPS[age_group]["age"],
        gender="Other",
        symptoms=engine_terms,
        chief_complaint=", ".join(engine_terms) if engine_terms else (custom_text or "General discomfort"),
    )
    result = engine.process_patient(profile)

    # ---- Escalation-biased traffic light -------------------------------
    reasons: List[str] = []
    danger_hits = [s for s in symptom_ids if SYMPTOMS_BY_ID[s]["danger"]]

    color = "green"
    if danger_hits:
        color = "red"
        reasons.append("danger_symptom")
    if result.triage_level <= 2:
        color = "red"
        reasons.append("engine_emergent")
    if pain_score >= 8:
        color = "red"
        reasons.append("severe_pain")
    if age_group == "baby" and "fever" in symptom_ids:
        color = "red"
        reasons.append("baby_with_fever")

    if color != "red":
        if result.triage_level == 3:
            color = "yellow"
            reasons.append("engine_urgent")
        if pain_score >= 4:
            color = "yellow"
            reasons.append("moderate_pain")
        if age_group in ("baby", "elderly") and (symptom_ids or custom_text):
            color = "yellow"
            reasons.append("vulnerable_age_group")
        if any(s in SEE_DOCTOR_TODAY for s in symptom_ids):
            color = "yellow"
            reasons.append("needs_doctor_check")

    slip_code = "SLIP-" + hashlib.sha256(
        f"{age_group}|{','.join(symptom_ids)}|{pain_score}|{time.time()}".encode()
    ).hexdigest()[:6].upper()

    return {
        "color": color,
        "reasons": reasons,
        "danger_symptoms": danger_hits,
        "return_immediately_if": RETURN_IMMEDIATELY_IF,
        # Clinic-staff section of the printed slip. Deliberately no diagnosis names.
        "clinic_summary": {
            "slip_code": slip_code,
            "age_group": age_group,
            "symptoms_en": [SYMPTOMS_BY_ID[s]["label"]["en"] for s in symptom_ids],
            "custom_symptoms": custom_text or None,
            "pain_score": pain_score,
            "esi_level": result.triage_level,
            "esi_category": result.triage_category,
            "suggested_specialty": result.specialist.specialty,
        },
    }
