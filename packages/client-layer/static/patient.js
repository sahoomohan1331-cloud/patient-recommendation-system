// ==========================================================================
// Triage Patient Easy Mode
// One question per screen. Every screen: picture + short text + spoken audio.
// Features:
//   - Interactive 3D Rotatable Anatomical Mannequin (Three.js) with 360° drag
//   - Quick views: Front, Back (spine view), Auto-Spin toggle
//   - Tap any body part to select (Head, Neck, Chest, Stomach, Back, Arms, Legs, Urine)
//   - Custom free-text & voice dictation box for any other disease/symptom
//   - 8 Indian Languages with voice synthesis & speech recognition
//   - Live Patient <-> Doctor OPD Queue integration
// ==========================================================================

const T = {
  en: {
    who_q: "Who is sick?",
    where_q: "Tap where it hurts, or what you feel",
    region_hint: "Now tap your problem",
    pain_q: "How much does it hurt?",
    confirm_q: "Is this right?",
    you_told: "You told us:",
    pain_label: n => `Pain: ${n} out of 10`,
    yes: "Yes", change: "Change", next: "Next", back: "Back",
    need_one: "Please tap at least one problem or enter your condition",
    need_pain: "Please tap a face",
    speak: "Speak", listening: "Listening…",
    heard: "We heard:",
    heard_check: "Please check the pictures below.",
    not_understood: "Sorry, we could not understand. Please tap the pictures.",
    mic_unsupported: "Voice input works in Chrome or Edge only. Please tap the pictures.",
    selected_title: "Your problems:",
    tray_empty: "Nothing chosen yet",
    result_q: "What you should do",
    red: "Danger. Go to the hospital emergency now. Call 108 for an ambulance.",
    yellow: "See a doctor today.",
    green: "You can rest at home. Keep drinking water. Come back if you feel worse.",
    return_if: "Come back immediately if:",
    call: "Call 108",
    print: "Print slip for clinic",
    restart: "Start again",
    loading: "Please wait…",
    error: "Something went wrong. If you feel very unwell, call 108.",
    disclaimer: "This is guidance only, not a diagnosis. A doctor must check you.",
    voice_missing: "No English voice found on this device, so audio may not play.",
    faces: ["No pain", "A little", "A bit more", "More", "A lot", "Worst"],
    send_doctor: "Send to Dr. Rajesh",
    token_label: "Your OPD Token",
    queue_pos: "Queue Position",
    waiting_doc: "Sent to Dr. Rajesh! Waiting in OPD queue…",
    called_alert: "Dr. Rajesh is calling you into",
    model_3d_tab: "3D Model",
    model_2d_tab: "2D Map",
    rotate_hint: "Drag to rotate 360° • Tap body part to select",
    view_front: "Front",
    view_back: "Back View",
    auto_spin: "Auto-Spin",
    custom_box_title: "Other disease or symptom?",
    custom_box_placeholder: "Type or speak (e.g., knee pain, thyroid, diabetes, rash)…",
    add_problem: "Add",
    custom_added: "Added problem:",
  },
  hi: {
    who_q: "कौन बीमार है?",
    where_q: "जहाँ दर्द है या जो महसूस हो रहा है, उसे छुएँ",
    region_hint: "अब अपनी तकलीफ़ छुएँ",
    pain_q: "कितना दर्द हो रहा है?",
    confirm_q: "क्या यह सही है?",
    you_told: "आपने बताया:",
    pain_label: n => `दर्द: 10 में से ${n}`,
    yes: "हाँ", change: "बदलें", next: "आगे", back: "पीछे",
    need_one: "कम से कम एक तकलीफ़ चुनें या लिखकर बताएँ",
    need_pain: "कृपया एक चेहरा छुएँ",
    speak: "बोलें", listening: "सुन रहे हैं…",
    heard: "हमने सुना:",
    heard_check: "कृपया नीचे तस्वीरें देख लें।",
    not_understood: "माफ़ कीजिए, समझ नहीं आया। कृपया तस्वीरें छुएँ।",
    mic_unsupported: "बोलकर बताने की सुविधा सिर्फ़ Chrome या Edge में है। कृपया तस्वीरें छुएँ।",
    selected_title: "आपकी तकलीफ़ें:",
    tray_empty: "अभी कुछ नहीं चुना",
    result_q: "आपको क्या करना चाहिए",
    red: "खतरा। अभी अस्पताल की इमरजेंसी में जाएँ। एम्बुलेंस के लिए 108 पर कॉल करें।",
    yellow: "आज ही डॉक्टर को दिखाएँ।",
    green: "आप घर पर आराम कर सकते हैं। पानी पीते रहें। तबीयत बिगड़े तो फिर से आएँ।",
    return_if: "तुरंत वापस आएँ अगर:",
    call: "108 पर कॉल करें",
    print: "क्लिनिक के लिए पर्ची प्रिंट करें",
    restart: "फिर से शुरू करें",
    loading: "कृपया रुकें…",
    error: "कुछ गड़बड़ हुई। अगर तबीयत बहुत खराब है तो 108 पर कॉल करें।",
    disclaimer: "यह सिर्फ़ मार्गदर्शन है, बीमारी की पहचान नहीं। डॉक्टर से ज़रूर जाँच करवाएँ।",
    voice_missing: "इस डिवाइस में हिन्दी आवाज़ नहीं मिली।",
    faces: ["कोई दर्द नहीं", "थोड़ा सा", "थोड़ा ज़्यादा", "ज़्यादा", "बहुत ज़्यादा", "सबसे ज़्यादा"],
    send_doctor: "डॉक्टर राजेश को भेजें",
    token_label: "आपका OPD टोकन",
    queue_pos: "कतार में नंबर",
    waiting_doc: "डॉक्टर राजेश को सूचना भेज दी गई है। कतार में प्रतीक्षा करें…",
    called_alert: "डॉक्टर राजेश आपको बुला रहे हैं:",
    model_3d_tab: "3D मॉडल",
    model_2d_tab: "2D नक्शा",
    rotate_hint: "घुमाने के लिए उंगली फिराएँ • चुनने के लिए शरीर का अंग छुएँ",
    view_front: "सामने",
    view_back: "पीठ की ओर",
    auto_spin: "घूमें",
    custom_box_title: "कोई अन्य बीमारी या तकलीफ़?",
    custom_box_placeholder: "यहाँ लिखें या बोलें (जैसे घुटने का दर्द, थायरॉइड, शुगर, दाने)…",
    add_problem: "जोड़ें",
    custom_added: "जोड़ा गया:",
  },
  or: {
    who_q: "କିଏ ଅସୁସ୍ଥ ଅଛନ୍ତି?",
    where_q: "ଯେଉଁଠି କଷ୍ଟ ହେଉଛି ବା ଯାହା ଅନୁଭବ କରୁଛନ୍ତି, ତାହା ଛୁଅନ୍ତୁ",
    region_hint: "ଏବେ ଆପଣଙ୍କ ସମସ୍ୟା ଛୁଅନ୍ତୁ",
    pain_q: "କେତେ ଯନ୍ତ୍ରଣା ହେଉଛି?",
    confirm_q: "ଏହା ଠିକ୍ ଅଛି କି?",
    you_told: "ଆପଣ କହିଛନ୍ତି:",
    pain_label: n => `ଯନ୍ତ୍ରଣା: ୧୦ ରୁ ${n}`,
    yes: "ହଁ", change: "ବଦଳାନ୍ତୁ", next: "ଆଗକୁ", back: "ପଛକୁ",
    need_one: "ଅତି କମରେ ଗୋଟିଏ ସମସ୍ୟା ବାଛନ୍ତୁ ବା ଲେଖନ୍ତୁ",
    need_pain: "ଦୟାକରି ଗୋଟିଏ ଚେହେରା ଛୁଅନ୍ତୁ",
    speak: "କୁହନ୍ତୁ", listening: "ଶୁଣୁଛୁ…",
    heard: "ଆମେ ଶୁଣିଲୁ:",
    heard_check: "ଦୟାକରି ତଳେ ଥିବା ଛବି ଦେଖନ୍ତୁ।",
    not_understood: "କ୍ଷମା କରିବେ, ବୁଝିପାରିଲୁ ନାହିଁ। ଦୟାକରି ଛବି ଛୁଅନ୍ତୁ।",
    mic_unsupported: "ଭଏସ୍ ସୁବିଧା କେବଳ Chrome ବା Edge ରେ ଚାଲିବ। ଦୟାକରି ଛବି ଛୁଅନ୍ତୁ।",
    selected_title: "ଆପଣଙ୍କ ସମସ୍ୟା:",
    tray_empty: "କିଛି ବାଛିନାହାଁନ୍ତି",
    result_q: "ଆପଣ କ'ଣ କରିବା ଉଚିତ୍",
    red: "ବିପଦ! ତୁରନ୍ତ ଡାକ୍ତରଖାନା ଏମରଜେନ୍ସିକୁ ଯାଆନ୍ତୁ। ଆମ୍ବୁଲାନ୍ସ ପାଇଁ ୧୦୮ କୁ କଲ୍ କରନ୍ତୁ।",
    yellow: "ଆଜି ହିଁ ଡାକ୍ତରଙ୍କୁ ଦେଖାନ୍ତୁ।",
    green: "ଆପଣ ଘରେ ବିଶ୍ରାମ ନେଇପାରିବେ। ପ୍ରଚୁର ପାଣି ପିଅନ୍ତୁ। ଅଧିକ ଅସୁବିଧା ହେଲେ ପୁଣି ଆସନ୍ତୁ।",
    return_if: "ତୁରନ୍ତ ଫେରିଆସନ୍ତୁ ଯଦି:",
    call: "୧୦୮ କୁ କଲ୍ କରନ୍ତୁ",
    print: "କ୍ଲିନିକ୍ ପାଇଁ ପର୍ଚି ପ୍ରିଣ୍ଟ କରନ୍ତୁ",
    restart: "ପୁଣି ଆରମ୍ଭ କରନ୍ତୁ",
    loading: "ଦୟାକରି ଅପେକ୍ଷା କରନ୍ତୁ…",
    error: "କିଛି ତ୍ରୁଟି ଘଟିଲା। ଅଧିକ ଅସୁବିଧା ଥିଲେ ୧୦୮ କୁ ଫୋନ କରନ୍ତୁ।",
    disclaimer: "ଏହା କେବଳ ସାହାଯ୍ୟ ପାଇଁ, ରୋଗ ନିର୍ଣ୍ଣୟ ନୁହେଁ। ଡାକ୍ତରଙ୍କ ସହିତ ପରାମର୍ଶ କରନ୍ତୁ।",
    voice_missing: "ଏହି ଡିଭାଇସରେ ଓଡ଼ିଆ ଭଏସ୍ ଉପଲବ୍ଧ ନାହିଁ।",
    faces: ["କିଛି ଯନ୍ତ୍ରଣା ନାହିଁ", "ଟିକିଏ", "ଆଉ ଟିକିଏ", "ବେଶୀ", "ପ୍ରବଳ", "ଅସହ୍ୟ"],
    send_doctor: "ଡାକ୍ତର ରାଜେଶଙ୍କୁ ପଠାନ୍ତୁ",
    token_label: "ଆପଣଙ୍କ OPD ଟୋକନ୍",
    queue_pos: "ଲାଇନ୍ ନମ୍ବର",
    waiting_doc: "ଡାକ୍ତର ରାଜେଶଙ୍କୁ ସୂଚନା ପଠାଯାଇଛି। ଅପେକ୍ଷା କରନ୍ତୁ…",
    called_alert: "ଡାକ୍ତର ରାଜେଶ ଆପଣଙ୍କୁ ଡାକୁଛନ୍ତି:",
    model_3d_tab: "3D ମଡେଲ୍",
    model_2d_tab: "2D ମାନଚିତ୍ର",
    rotate_hint: "୩୬୦° ଘୁରାଇବାକୁ ଟାଣନ୍ତୁ • ବାଛିବାକୁ ଅଙ୍ଗ ଛୁଅନ୍ତୁ",
    view_front: "ଆଗ",
    view_back: "ପଛ (ମେରୁଦଣ୍ଡ)",
    auto_spin: "ଘୂର୍ଣ୍ଣନ",
    custom_box_title: "ଅନ୍ୟ କୌଣସି ରୋଗ ବା ସମସ୍ୟା?",
    custom_box_placeholder: "ଏଠାରେ ଲେଖନ୍ତୁ ବା କୁହନ୍ତୁ (ଯଥା: ଆଣ୍ଠୁ ବିନ୍ଧା, ଥାଇରଏଡ୍, ଡାଇବେଟିସ୍)…",
    add_problem: "ଯୋଡ଼ନ୍ତୁ",
    custom_added: "ଯୋଡ଼ାଗଲା:",
  },
  bn: {
    who_q: "কে অসুস্থ?",
    where_q: "যেখানে কষ্ট হচ্ছে বা যা অনুভব করছেন, স্পর্শ করুন",
    region_hint: "এখন আপনার সমস্যা স্পর্শ করুন",
    pain_q: "কতটা ব্যথা হচ্ছে?",
    confirm_q: "এটি কি সঠিক?",
    you_told: "আপনি বলেছেন:",
    pain_label: n => `ব্যথা: ১০ এর মধ্যে ${n}`,
    yes: "হ্যাঁ", change: "পরিবর্তন", next: "পরবর্তী", back: "পেছনে",
    need_one: "কমপক্ষে একটি সমস্যা বাছুন বা লিখুন",
    need_pain: "একটি মুখ স্পর্শ করুন",
    speak: "বলুন", listening: "শুনছি…",
    heard: "আমরা শুনেছি:",
    heard_check: "দয়া করে নিচের ছবিগুলি দেখুন।",
    not_understood: "দুঃখিত, বুঝতে পারিনি। ছবি স্পর্শ করুন।",
    mic_unsupported: "ভয়েস শুধুমাত্র Chrome বা Edge এ সমর্থিত। ছবি স্পর্শ করুন।",
    selected_title: "আপনার সমস্যাগুলি:",
    tray_empty: "এখনও কিছু নির্বাচিত হয়নি",
    result_q: "আপনার কী করা উচিত",
    red: "বিপদ! অবিলম্বে হাসপাতালের ইমার্জেন্সিতে যান। অ্যাম্বুলেন্সের জন্য ১০৮ নম্বরে ফোন করুন।",
    yellow: "আজই ডাক্তার দেখান।",
    green: "আপনি বাড়িতে বিশ্রাম নিতে পারেন। জল খেতে থাকুন। বেশি অসুস্থ বোধ করলে আবার আসুন।",
    return_if: "অবিলম্বে ফিরে আসুন যদি:",
    call: "১০৮ নম্বরে কল করুন",
    print: "ক্লিনিক স্লিপ প্রিন্ট করুন",
    restart: "আবার শুরু করুন",
    loading: "অপেক্ষা করুন…",
    error: "কিছু ভুল হয়েছে। খুব অসুস্থ লাগলে ১০৮ এ কল করুন।",
    disclaimer: "এটি কেবল পরামর্শ, রোগ নির্ণয় নয়। ডাক্তারের পরামর্শ নিন।",
    voice_missing: "এই ডিভাইসে বাংলা ভয়েস পাওয়া যায়নি।",
    faces: ["কোন ব্যথা নেই", "একটু", "আরেকটু বেশি", "বেশি", "খুব বেশি", "সর্বাধিক"],
    send_doctor: "ডাক্তার রাজেশকে পাঠান",
    token_label: "আপনার OPD টোকেন",
    queue_pos: "লাইনের অবস্থান",
    waiting_doc: "ডাক্তার রাজেশকে পাঠানো হয়েছে। অপেক্ষা করুন…",
    called_alert: "ডাক্তার রাজেশ আপনাকে ডাকছেন:",
    model_3d_tab: "3D মডেল",
    model_2d_tab: "2D মানচিত্র",
    rotate_hint: "ঘোরাতে আঙুল দিয়ে টানুন • বেছে নিতে অঙ্গ স্পর্শ করুন",
    view_front: "সামনে",
    view_back: "পিছন দিক",
    auto_spin: "স্পিন",
    custom_box_title: "অন্য কোনো রোগ বা সমস্যা?",
    custom_box_placeholder: "এখানে লিখুন বা বলুন (যেমন হাঁটুর ব্যথা, থাইরয়েড, সুগার, চুলকানি)…",
    add_problem: "যোগ",
    custom_added: "যোগ করা হয়েছে:",
  },
  ta: {
    who_q: "யாருக்கு உடல்நலக்குறைவு?",
    where_q: "எங்கு வலிக்கிறது அல்லது என்ன உணர்கிறீர்கள் என்பதைத் தொடுங்கள்",
    region_hint: "இப்போது உங்கள் பிரச்சனையைத் தொடுங்கள்",
    pain_q: "எவ்வளவு வலி இருக்கிறது?",
    confirm_q: "இது சரியா?",
    you_told: "நீங்கள் கூறியது:",
    pain_label: n => `வலி: 10-ல் ${n}`,
    yes: "ஆம்", change: "மாற்று", next: "அடுத்து", back: "பின்னால்",
    need_one: "குறைந்தது ஒரு பிரச்சனையைத் தேர்ந்தெடுக்கவும்",
    need_pain: "ஒரு முகத்தைத் தொடுங்கள்",
    speak: "பேசுங்கள்", listening: "கேட்கிறது…",
    heard: "நாங்கள் கேட்டது:",
    heard_check: "கீழே உள்ள படங்களைச் சரிபார்க்கவும்.",
    not_understood: "மன்னிக்கவும், புரியவில்லை. படங்களைத் தொடவும்.",
    mic_unsupported: "குரல் பதிவு Chrome அல்லது Edge-ல் மட்டுமே இயங்கும்.",
    selected_title: "உங்கள் பிரச்சனைகள்:",
    tray_empty: "இன்னும் எதுவும் தேர்ந்தெடுக்கப்படவில்லை",
    result_q: "நீங்கள் என்ன செய்ய வேண்டும்",
    red: "ஆபத்து! உடனே மருத்துவமனை அவசர சிகிச்சைப் பிரிவுக்குச் செல்லுங்கள். ஆம்புலன்ஸுக்கு 108 ஐ அழைக்கவும்.",
    yellow: "இன்றே மருத்துவரைப் பாருங்கள்.",
    green: "வீட்டில் ஓய்வெடுக்கலாம். தண்ணீர் குடிக்கவும். உடல்நிலை மோசமானால் மீண்டும் வரவும்.",
    return_if: "உடனே திரும்பி வாருங்கள் என்றால்:",
    call: "108 ஐ அழைக்கவும்",
    print: "மருத்துவமனை சீட்டு அச்சிடவும்",
    restart: "மீண்டும் தொடங்கவும்",
    loading: "காத்திருக்கவும்…",
    error: "ஏதோ தவறு நிகழ்ந்தது. உடல்நிலை மோசமானால் 108 ஐ அழைக்கவும்.",
    disclaimer: "இது வழிகாட்டுதல் மட்டுமே. மருத்துவரிடம் ஆலோசனை பெறவும்.",
    voice_missing: "இந்தச் சாதனத்தில் தமிழ் குரல் கிடைக்கவில்லை.",
    faces: ["வலி இல்லை", "சிறிது", "இன்னும் கொஞ்சம்", "அதிகம்", "மிக அதிகம்", "தாங்க முடியாத வலி"],
    send_doctor: "டாக்டர் ராஜேஷுக்கு அனுப்பவும்",
    token_label: "உங்கள் OPD டோக்கன்",
    queue_pos: "வரிசை எண்",
    waiting_doc: "டாக்டர் ராஜேஷுக்கு தகவல் அனுப்பப்பட்டது. வரிசையில் காத்திருக்கவும்…",
    called_alert: "டாக்டர் ராஜேஷ் உங்களை அழைக்கிறார்:",
    model_3d_tab: "3D மாதிரி",
    model_2d_tab: "2D வரைபடம்",
    rotate_hint: "சுழற்ற இழுக்கவும் • தேர்ந்தெடுக்க உடலின் பகுதியைத் தொடவும்",
    view_front: "முன்",
    view_back: "முதுகு",
    auto_spin: "சுழற்சி",
    custom_box_title: "வேறு ஏதேனும் நோய் அல்லது பிரச்சனை?",
    custom_box_placeholder: "இங்கு எழுதவும் அல்லது பேசவும் (எ.கா: மூட்டு வலி, தைராய்டு, சர்க்கரை)…",
    add_problem: "சேர்க்க",
    custom_added: "சேர்க்கப்பட்டது:",
  },
  te: {
    who_q: "ఎవరికి ఆరోగ్యం బాగాలేదు?",
    where_q: "ఎక్కడ నొప్పిగా ఉందో లేదా ఏం అనిపిస్తుందో తాకండి",
    region_hint: "ఇప్పుడు మీ సమస్యను తాకండి",
    pain_q: "ఎంత నొప్పిగా ఉంది?",
    confirm_q: "ఇది సరియైనదేనా?",
    you_told: "మీరు చెప్పినది:",
    pain_label: n => `నొప్పి: 10 కి ${n}`,
    yes: "అవును", change: "మార్చండి", next: "తర్వాత", back: "వెనుకకు",
    need_one: "కనీసం ఒక సమస్యను ఎంచుకోండి లేదా రాయండి",
    need_pain: "ఒక ముఖాన్ని తాకండి",
    speak: "మాట్లాడండి", listening: "వింటున్నాము…",
    heard: "మేము విన్నది:",
    heard_check: "దయచేసి క్రింది చిత్రాలను చూడండి.",
    not_understood: "క్షమించండి, అర్థం కాలేదు. చిత్రాలను తాకండి.",
    mic_unsupported: "వాయిస్ ఇన్పుట్ Chrome లేదా Edge లో మాత్రమే పనిచేస్తుంది.",
    selected_title: "మీ సమస్యలు:",
    tray_empty: "ఇంకా ఏమీ ఎంచుకోలేదు",
    result_q: "మీరు ఏమి చేయాలి",
    red: "ప్రమాదం! వెంటనే ఆసుపత్రి అత్యవసర విభాగానికి వెళ్ళండి. అంబులెన్స్ కోసం 108 కి కాల్ చేయండి.",
    yellow: "ఈరోజే డాక్టర్‌ను సంప్రదించండి.",
    green: "ఇంట్లో విశ్రాంతి తీసుకోవచ్చు. నీరు ఎక్కువగా తాగండి. ఆరోగ్యం విషమిస్తే మళ్ళీ రండి.",
    return_if: "వెంటనే తిరిగి రండి ఒకవేళ:",
    call: "108 కి కాల్ చేయండి",
    print: "క్లినిక్ స్లిప్ ప్రింట్ చేయండి",
    restart: "మళ్ళీ ప్రారంభించండి",
    loading: "దయచేసి వేచి ఉండండి…",
    error: "ఏదో లోపం జరిగింది. 108 కి కాల్ చేయండి.",
    disclaimer: "ఇది కేవలం మార్గదర్శకత్వం మాత్రమే. డాక్టర్‌ను సంప్రదించండి.",
    voice_missing: "ఈ పరికరంలో తెలుగు వాయిస్ అందుబాటులో లేదు.",
    faces: ["నొప్పి లేదు", "కొద్దిగా", "మరికొంత", "ఎక్కువ", "చాలా ఎక్కువ", "తీవ్రమైన నొప్పి"],
    send_doctor: "డాక్టర్ రాజేష్‌కు పంపండి",
    token_label: "మీ OPD టోకెన్",
    queue_pos: "క్యూ నంబర్",
    waiting_doc: "డాక్టర్ రాజేష్‌కు పంపబడింది. క్యూలో వేచి ఉండండి…",
    called_alert: "డాక్టర్ రాజేష్ మిమ్మల్ని పిలుస్తున్నారు:",
    model_3d_tab: "3D మోడల్",
    model_2d_tab: "2D మ్యాప్",
    rotate_hint: "తిప్పడానికి లాగండి • ఎంచుకోవడానికి శరీర భాగాన్ని తాకండి",
    view_front: "ముందు",
    view_back: "వెనుక",
    auto_spin: "స్పిన్",
    custom_box_title: "మరేదైనా వ్యాధి లేదా సమస్య ఉందా?",
    custom_box_placeholder: "ఇక్కడ రాయండి లేదా మాట్లాడండి (ఉదా: మోకాలి నొప్పి, థైరాయిడ్, షుగర్)…",
    add_problem: "జోడించు",
    custom_added: "జోడించబడింది:",
  },
  mr: {
    who_q: "कोण आजारी आहे?",
    where_q: "जिथे दुखत आहे किंवा जे जाणवत आहे, तिथे स्पर्श करा",
    region_hint: "आता तुमचा त्रास निवडा",
    pain_q: "किती दुखत आहे?",
    confirm_q: "हे बरोबर आहे का?",
    you_told: "तुम्ही सांगितले:",
    pain_label: n => `वेदना: 10 पैकी ${n}`,
    yes: "होय", change: "बदला", next: "पुढे", back: "मागे",
    need_one: "किमान एक त्रास निवडा किंवा लिहा",
    need_pain: "कृपया एक चेहरा निवडा",
    speak: "बोला", listening: "ऐकत आहे…",
    heard: "आम्ही ऐकले:",
    heard_check: "खालील चित्रे तपासून पहा.",
    not_understood: "माफ करा, समजले नाही. चित्रांवर स्पर्श करा.",
    mic_unsupported: "व्हॉइस सुविधा फक्त Chrome किंवा Edge मध्ये चालते.",
    selected_title: "तुमच्या समस्या:",
    tray_empty: "अजून काही निवडलेले नाही",
    result_q: "तुम्ही काय करावे",
    red: "धोका! लगेच रुग्णालयाच्या आपत्कालीन विभागात जा. रुग्णवाहिकेसाठी १०८ वर कॉल करा.",
    yellow: "आजच डॉक्टरांना भेटा.",
    green: "घरी आराम करू शकता. पाणी पीत राहा. प्रकृती बिघडल्यास पुन्हा या.",
    return_if: "तातडीने परत या जर:",
    call: "१०८ वर कॉल करा",
    print: "क्लिनिक पावती प्रिंट करा",
    restart: "पुन्हा सुरू करा",
    loading: "कृपया थांबा…",
    error: "काही अडचण आली. तब्येत बिघडल्यास १०८ वर कॉल करा.",
    disclaimer: "हे केवळ मार्गदर्शनासाठी आहे. डॉक्टरांचा सल्ला नक्की घ्या.",
    voice_missing: "या डिव्हाइसवर मराठी आवाज उपलब्ध नाही.",
    faces: ["वेदना नाही", "थोडे", "अजून थोडे", "जास्त", "खूप जास्त", "असह्य वेदना"],
    send_doctor: "डॉक्टर राजेश यांना पाठवा",
    token_label: "तुमचा OPD टोकन",
    queue_pos: "रांगेतील क्रमांक",
    waiting_doc: "डॉक्टर राजेश यांच्याकडे माहिती पाठवली आहे. प्रतीक्षा करा…",
    called_alert: "डॉक्टर राजेश आपल्याला बोलवत आहेत:",
    model_3d_tab: "3D मॉडेल",
    model_2d_tab: "2D नकाशा",
    rotate_hint: "फिरवण्यासाठी ड्रॅग करा • निवडण्यासाठी अवयव निवडा",
    view_front: "समोर",
    view_back: "पाठीमागे",
    auto_spin: "फिरवा",
    custom_box_title: "इतर कोणताही आजार किंवा त्रास?",
    custom_box_placeholder: "येथे लिहा किंवा बोला (उदा: गुडघेदुखी, थायरॉईड, मधुमेह, पुरळ)…",
    add_problem: "जोडा",
    custom_added: "जोडले:",
  },
  gu: {
    who_q: "કોણ બીમાર છે?",
    where_q: "જ્યાં દુખાવો છે અથવા જે અનુભવાય છે ત્યાં સ્પર્શ કરો",
    region_hint: "હવે તમારી તકલીફ સ્પર્શ કરો",
    pain_q: "કેટલો દુખાવો થાય છે?",
    confirm_q: "શું આ સાચું છે?",
    you_told: "તમે કહ્યું:",
    pain_label: n => `દુખાવો: 10 માંથી ${n}`,
    yes: "હા", change: "બદલો", next: "આગળ", back: "પાછળ",
    need_one: "ઓછામાં ઓછી એક તકલીફ પસંદ કરો અથવા લખો",
    need_pain: "એક ચહેરો સ્પર્શ કરો",
    speak: "બોલો", listening: "સાંભળી રહ્યા છીએ…",
    heard: "અમે સાંભળ્યું:",
    heard_check: "કૃપા કરીને નીચેના ચિત્રો જુઓ.",
    not_understood: "માફ કરશો, સમજાયું નહીં. ચિત્રો પર સ્પર્શ કરો.",
    mic_unsupported: "વોઈસ સુવિધા માત્ર Chrome અથવા Edge માં કાર્ય કરશે.",
    selected_title: "તમારી તકલીફો:",
    tray_empty: "હજુ કંઈ પસંદ કરેલ નથી",
    result_q: "તમારે શું કરવું જોઈએ",
    red: "જોખમ! તરત જ હોસ્પિટલની ઇમરજન્સીમાં જાઓ. એમ્બ્યુલન્સ માટે ૧૦૮ પર કૉલ કરો.",
    yellow: "આજે જ ડૉક્ટરને બતાવો.",
    green: "ઘરે આરામ કરી શકો છો. પાણી પીતા રહો. તબિયત બગડે તો ફરીથી આવો.",
    return_if: "તરત જ પાછા આવો જો:",
    call: "૧૦૮ પર કૉલ કરો",
    print: "ક્લિનિક માટે કાપલી પ્રિન્ટ કરો",
    restart: "ફરી શરૂ કરો",
    loading: "કૃપા કરીને રાહ જુઓ…",
    error: "કંઈક ભૂલ થઈ. વધુ તબિયત ખરાબ હોય તો ૧૦૮ પર કૉલ કરો.",
    disclaimer: "આ માત્ર માર્ગદર્શન છે. ડૉક્ટરની સલાહ લો.",
    voice_missing: "આ ઉપકરણ પર ગુજરાતી અવાજ ઉપલબ્ધ નથી.",
    faces: ["કોઈ દુખાવો નથી", "થોડો", "જરા વધારે", "વધારે", "ખૂબ વધારે", "અસહ્ય દુખાવો"],
    send_doctor: "ડૉક્ટર રાજેશને મોકલો",
    token_label: "તમારો OPD ટોકન",
    queue_pos: "લાઈનમાં નંબર",
    waiting_doc: "ડૉક્ટર રાજેશને મોકલી દેવામાં આવ્યું છે. રાહ જુઓ…",
    called_alert: "ડૉક્ટર રાજેશ તમને બોલાવી રહ્યા છે:",
    model_3d_tab: "3D મોડેલ",
    model_2d_tab: "2D નકશો",
    rotate_hint: "ફેરવવા માટે ખેંચો • પસંદ કરવા માટે અંગ સ્પર્શ કરો",
    view_front: "આગળ",
    view_back: "પાછળ (કરોડરજ્જુ)",
    auto_spin: "સ્પિન",
    custom_box_title: "અન્ય કોઈ રોગ કે તકલીફ?",
    custom_box_placeholder: "અહીં લખો અથવા બોલો (જેમ કે ઢીંચણનો દુખાવો, થાઇરોઇડ, ડાયાબિટીસ)…",
    add_problem: "ઉમેરો",
    custom_added: "ઉમેરાયું:",
  },
};

const SPEECH_LANG = {
  en: "en-IN",
  hi: "hi-IN",
  or: "or-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
};

const ICONS = {
  home: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  rotate: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
  volume: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  phone: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  check: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  edit: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`,
  mic: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
  plus: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  x: `<svg class="pm-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  printer: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>`,
  clock: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  ambulance: `<svg class="pm-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="16" height="10" x="1" y="6" rx="2"/><path d="M17 10h4l2 3v3h-6v-6Z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M7 9v4"/><path d="M5 11h4"/></svg>`,
  stethoscope: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
  alertTriangle: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  activity: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  heartPulse: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 9v3l1.5 1.5"/></svg>`,
  heartCrack: `<svg class="pm-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><polyline points="12 4 10 9 14 13 11 16 13 19"/></svg>`,
  wind: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  thermometer: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>`,
  brain: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z"/></svg>`,
  spine: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="12" cy="16" r="2"/><circle cx="12" cy="21" r="1.5"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="14"/><line x1="12" y1="18" x2="12" y2="19.5"/></svg>`,
  droplet: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  footprints: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.5v2"/><path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.5v2"/></svg>`,
  moveHorizontal: `<svg class="pm-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 8 22 12 18 16"/><polyline points="6 8 2 12 6 16"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  userCheck: `<svg class="pm-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
  baby: `<svg class="pm-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>`,
  child: `<svg class="pm-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M6 21v-4a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4"/></svg>`,
  senior: `<svg class="pm-icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 14v7"/><path d="M17 14h4"/></svg>`,
  zoomIn: `<svg class="pm-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  zoomOut: `<svg class="pm-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  crosshair: `<svg class="pm-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`,
  sparkles: `<svg class="pm-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  bell: `<svg class="pm-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,
};

const FACES = [
  {
    score: 0,
    color: "#059669",
    name: "No Hurt",
    svg: `<svg viewBox="0 0 48 48" class="pm-face-svg" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle cx="17" cy="19" r="2.5" fill="#059669"/><circle cx="31" cy="19" r="2.5" fill="#059669"/><path d="M15 28c2.5 4 15.5 4 18 0"/></svg>`
  },
  {
    score: 2,
    color: "#16a34a",
    name: "Hurts Little Bit",
    svg: `<svg viewBox="0 0 48 48" class="pm-face-svg" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle cx="17" cy="19" r="2.5" fill="#16a34a"/><circle cx="31" cy="19" r="2.5" fill="#16a34a"/><path d="M16 29c2 2 14 2 16 0"/></svg>`
  },
  {
    score: 4,
    color: "#d97706",
    name: "Hurts Little More",
    svg: `<svg viewBox="0 0 48 48" class="pm-face-svg" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle cx="17" cy="19" r="2.5" fill="#d97706"/><circle cx="31" cy="19" r="2.5" fill="#d97706"/><line x1="16" y1="29" x2="32" y2="29"/></svg>`
  },
  {
    score: 6,
    color: "#ea580c",
    name: "Hurts Even More",
    svg: `<svg viewBox="0 0 48 48" class="pm-face-svg" fill="none" stroke="#ea580c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/><line x1="14" y1="16" x2="20" y2="18" stroke-width="2.5"/><line x1="34" y1="16" x2="28" y2="18" stroke-width="2.5"/><circle cx="17" cy="21" r="2.2" fill="#ea580c"/><circle cx="31" cy="21" r="2.2" fill="#ea580c"/><path d="M16 32c2.5-3 13.5-3 16 0"/></svg>`
  },
  {
    score: 8,
    color: "#dc2626",
    name: "Hurts Whole Lot",
    svg: `<svg viewBox="0 0 48 48" class="pm-face-svg" fill="none" stroke="#dc2626" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/><line x1="13" y1="15" x2="21" y2="19" stroke-width="3"/><line x1="35" y1="15" x2="27" y2="19" stroke-width="3"/><circle cx="17" cy="22" r="2.2" fill="#dc2626"/><circle cx="31" cy="22" r="2.2" fill="#dc2626"/><path d="M15 33c3-4 15-4 18 0"/></svg>`
  },
  {
    score: 10,
    color: "#991b1b",
    name: "Hurts Worst",
    svg: `<svg viewBox="0 0 48 48" class="pm-face-svg" fill="none" stroke="#991b1b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="24" cy="24" r="21"/><line x1="13" y1="14" x2="21" y2="19" stroke-width="3.2"/><line x1="35" y1="14" x2="27" y2="19" stroke-width="3.2"/><circle cx="17" cy="22" r="2.2" fill="#991b1b"/><circle cx="31" cy="22" r="2.2" fill="#991b1b"/><ellipse cx="24" cy="33" rx="7" ry="4.5"/><path d="M35 24c0 2-2 4-2 4s-2-2-2-4a2 2 0 0 1 4 0z" fill="#991b1b"/></svg>`
  },
];

const RESULT_BADGES = {
  red: {
    tag: "Emergency Level 1 • Immediate Resuscitation",
    icon: `<svg class="pm-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    title: "Critical Emergency Care Required",
  },
  yellow: {
    tag: "Clinical Priority Level 2 • Same-Day OPD Evaluation",
    icon: `<svg class="pm-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>`,
    title: "Physician Consultation Needed Today",
  },
  green: {
    tag: "Priority Level 3 • Home Care & Observation Protocol",
    icon: `<svg class="pm-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    title: "Safe for Monitored Home Recovery",
  },
};

function getRegionIcon(region) {
  switch (region) {
    case "head": return ICONS.brain;
    case "neck": return ICONS.activity;
    case "chest": return ICONS.heartPulse;
    case "belly": return ICONS.stethoscope;
    case "back": return ICONS.spine;
    case "arms": return ICONS.moveHorizontal;
    case "legs": return ICONS.footprints;
    case "urine": return ICONS.droplet;
    case "body": return ICONS.thermometer;
    default: return ICONS.activity;
  }
}

function getAgeIcon(ageId) {
  switch (ageId) {
    case "baby": return ICONS.baby;
    case "child": return ICONS.child;
    case "adult": return ICONS.userCheck;
    case "elderly": return ICONS.senior;
    default: return ICONS.userCheck;
  }
}

function getSymptomIcon(symptomId, region) {
  switch (symptomId) {
    case "chest_pain": return ICONS.heartCrack;
    case "arm_pain": return ICONS.activity;
    case "breathless": return ICONS.wind;
    case "palpitations": return ICONS.heartPulse;
    case "headache": return ICONS.brain;
    case "dizziness": return ICONS.rotate;
    case "faint": return ICONS.alertTriangle;
    case "stiff_neck": return ICONS.activity;
    case "face_weak": return ICONS.alertTriangle;
    case "cough": return ICONS.wind;
    case "fever": return ICONS.thermometer;
    case "stomach_pain": return ICONS.stethoscope;
    case "vomiting": return ICONS.alertTriangle;
    case "diarrhea": return ICONS.droplet;
    case "burning_urine": return ICONS.droplet;
    case "blood_urine": return ICONS.alertTriangle;
    case "knee_pain": return ICONS.footprints;
    case "leg_pain": return ICONS.footprints;
    case "back_pain": return ICONS.spine;
    case "neck_pain": return ICONS.activity;
    case "rash": return ICONS.sparkles;
    case "swelling": return ICONS.activity;
    case "blood_cough": return ICONS.alertTriangle;
    case "calf_swelling": return ICONS.footprints;
    default: return getRegionIcon(region);
  }
}
const SCREENS = ["lang", "who", "where", "pain", "confirm", "result"];

const state = {
  lang: "en",
  screen: "lang",
  ageGroup: null,
  symptoms: new Set(),
  customSymptoms: [],
  pain: null,
  activeRegion: "chest",
  result: null,
  lastSpoken: "",
  modelMode: "3d",
  autoRotate: false,
};

let catalog = null;
let symptomById = {};

const $ = id => document.getElementById(id);
const t = key => T[state.lang][key] || T.en[key] || "";
const label = obj => (obj && (obj[state.lang] || obj.en)) || "";

// --------------------------------------------------------------------------
// Speech output
// --------------------------------------------------------------------------
function voiceFor(lang) {
  if (!("speechSynthesis" in window)) return null;
  const code = SPEECH_LANG[lang].toLowerCase();
  const prefix = code.split("-")[0];
  const voices = speechSynthesis.getVoices();
  return voices.find(v => v.lang.toLowerCase() === code)
      || voices.find(v => v.lang.toLowerCase().startsWith(prefix))
      || null;
}

function updateVoiceWarning() {
  const box = $("pm-voice-warning");
  if (!("speechSynthesis" in window)) {
    box.textContent = "This browser cannot read text aloud.";
    box.hidden = false;
    return;
  }
  if (speechSynthesis.getVoices().length === 0) return;
  if (!voiceFor(state.lang)) {
    box.textContent = t("voice_missing");
    box.hidden = false;
  } else {
    box.hidden = true;
  }
}

function speak(text, { interrupt = true, lang = state.lang } = {}) {
  state.lastSpoken = text;
  if (!("speechSynthesis" in window) || !text) return;
  if (interrupt) speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = SPEECH_LANG[lang];
  const v = voiceFor(lang);
  if (v) u.voice = v;
  u.rate = 0.9;
  const replay = $("pm-btn-replay");
  u.onstart = () => replay.classList.add("speaking");
  u.onend = u.onerror = () => replay.classList.remove("speaking");
  speechSynthesis.speak(u);
}

function beepAlarm() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.35, 0.7].forEach(offset => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.value = 0.2;
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
  } catch (e) {}
}

function toast(msg) {
  const el = document.createElement("div");
  el.className = "pm-toast";
  el.textContent = msg;
  document.body.appendChild(el);
  speak(msg);
  setTimeout(() => el.remove(), 2500);
}

// --------------------------------------------------------------------------
// Navigation
// --------------------------------------------------------------------------
function goTo(screen, opts = {}) {
  if (state.screen === "where" && screen !== "where") {
    cleanup3D();
  }
  state.screen = screen;
  const idx = SCREENS.indexOf(screen);
  $("pm-progress").innerHTML = SCREENS.map((_, i) => `<span class="${i <= idx ? "done" : ""}"></span>`).join("");
  $("pm-btn-back").hidden = idx === 0 || screen === "result";
  $("pm-btn-next").hidden = !["where", "pain"].includes(screen);
  const backSpan = $("pm-btn-back").querySelector("span");
  if (backSpan) backSpan.textContent = t("back");
  const nextSpan = $("pm-btn-next").querySelector("span");
  if (nextSpan) nextSpan.textContent = t("next");
  $("pm-disclaimer").textContent = t("disclaimer");
  document.documentElement.lang = state.lang;
  updateVoiceWarning();

  // Dynamic step label & phase pill updates
  const stepLabels = [
    "Step 1 of 5 • Language",
    "Step 2 of 5 • Demographics",
    "Step 3 of 5 • Symptom Mapping",
    "Step 4 of 5 • Pain Assessment",
    "Step 5 of 5 • Review Findings",
    "Clinical Triage Directive"
  ];
  const stepEl = $("pm-step-label");
  if (stepEl) stepEl.textContent = stepLabels[idx] || `Step ${idx + 1} of 5`;

  const phasePill = $("pm-phase-pill");
  const phases = [
    "Consultation Language",
    "Patient Demographics & Age",
    "Anatomical Symptom Mapping",
    "Wong-Baker Pain Scale",
    "Summary & Verification",
    "Clinical Directive"
  ];
  if (phasePill) phasePill.textContent = phases[idx] || "Clinical Triage Guidance";

  RENDER[screen](opts);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setQuestion(text, { interrupt = true, sub = "" } = {}) {
  $("pm-question").textContent = text;
  const subEl = $("pm-question-sub");
  if (subEl) {
    subEl.textContent = sub || "";
    subEl.style.display = sub ? "block" : "none";
  }
  speak(text, { interrupt });
}

// --------------------------------------------------------------------------
// 3D Model Variables & Engine (Three.js - High-Precision Medical Avatar)
// --------------------------------------------------------------------------
let threeRenderer = null;
let threeScene = null;
let threeCamera = null;
let threeAnimFrame = null;
let threeBodyGroup = null;
let threeBodyMeshes = [];
let threeRaycaster = null;
let threeMouse = null;
let isPointerDown = false;
let pointerStartX = 0;
let pointerStartY = 0;
let totalDragDistance = 0;
let dragVelocityY = 0;
let dragVelocityX = 0;
let targetRotationY = 0;
let currentRotationY = 0;
let targetRotationX = 0;
let currentRotationX = 0;
let targetCameraDistance = 22.0;
let scannerRing = null;
let pedestalInnerRing = null;
let vitalCoreMesh = null;

function cleanup3D() {
  if (threeAnimFrame) {
    cancelAnimationFrame(threeAnimFrame);
    threeAnimFrame = null;
  }
  if (threeRenderer) {
    try {
      threeRenderer.dispose();
      if (threeRenderer.domElement && threeRenderer.domElement.parentNode) {
        threeRenderer.domElement.parentNode.removeChild(threeRenderer.domElement);
      }
    } catch (e) {}
    threeRenderer = null;
  }
  threeScene = null;
  threeCamera = null;
  threeBodyGroup = null;
  threeBodyMeshes = [];
  scannerRing = null;
  pedestalInnerRing = null;
  vitalCoreMesh = null;
  targetRotationY = 0;
  currentRotationY = 0;
  targetRotationX = 0;
  currentRotationX = 0;
  dragVelocityY = 0;
  dragVelocityX = 0;
  targetCameraDistance = 22.0;
}

function init3DModel() {
  cleanup3D();
  if (typeof THREE === "undefined") {
    console.warn("Three.js not loaded, falling back to 2D view");
    state.modelMode = "2d";
    const box3D = $("pm-3d-box");
    const box2D = $("pm-2d-box");
    if (box3D) box3D.style.display = "none";
    if (box2D) box2D.style.display = "block";
    return;
  }

  const viewportEl = $("pm-3d-viewport");
  const tooltipEl = $("pm-3d-tooltip");
  if (!viewportEl) return;

  const width = viewportEl.clientWidth || 340;
  const height = viewportEl.clientHeight || 480;

  threeScene = new THREE.Scene();
  // Cinematic perspective framing: whole body + pedestal comfortably fits in view
  threeCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
  threeCamera.position.set(0, -0.2, targetCameraDistance);
  threeCamera.lookAt(0, -0.2, 0);

  threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  threeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  threeRenderer.toneMappingExposure = 1.15;
  viewportEl.appendChild(threeRenderer.domElement);

  // --- High-End Cinematic Studio Lighting with Deep Contrast ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  threeScene.add(ambientLight);

  // Key light: crisp cool white from top-front
  const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.70);
  keyLight.position.set(6, 14, 12);
  threeScene.add(keyLight);

  // Rim light: electric cyan/indigo from posterior-left to trace striking silhouette
  const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.4);
  rimLight.position.set(-7, 7, -10);
  threeScene.add(rimLight);

  // Secondary fill: soft warm violet from back-right
  const fillLight = new THREE.DirectionalLight(0x818cf8, 0.85);
  fillLight.position.set(7, -2, -8);
  threeScene.add(fillLight);

  // Upward holographic pedestal illumination
  const floorLight = new THREE.PointLight(0x06b6d4, 1.8, 16);
  floorLight.position.set(0, -5.8, 2.0);
  threeScene.add(floorLight);

  threeRaycaster = new THREE.Raycaster();
  threeMouse = new THREE.Vector2();

  threeBodyGroup = new THREE.Group();
  threeBodyMeshes = [];

  // Biomedical Frosted Glass Silicone Material
  const defaultBodyColor = 0x64748b;
  const defaultEmissive = 0x071e35;

  function addPart(geom, region, pos, rot = [0, 0, 0], scale = [1, 1, 1], customMat = null) {
    const mat = customMat || new THREE.MeshStandardMaterial({
      color: defaultBodyColor,
      roughness: 0.22,
      metalness: 0.14,
      transparent: true,
      opacity: 0.94,
      depthWrite: true,
      emissive: defaultEmissive,
      emissiveIntensity: 0.22,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.userData = { region: region, defaultColor: defaultBodyColor, defaultEmissive: defaultEmissive };
    threeBodyGroup.add(mesh);
    threeBodyMeshes.push(mesh);
    return mesh;
  }

  // =========================================================================
  // SCULPTED HUMAN ANATOMICAL TOPOLOGY (SURFACE-CALIBRATED)
  // =========================================================================

  // --- 1. HEAD & CRANIUM ---
  // Cranium dome (cranial vault centered slightly back)
  addPart(new THREE.SphereGeometry(0.85, 32, 32), "head", [0, 5.05, -0.05], [0, 0, 0], [0.92, 1.15, 1.0]);
  // Mandibular wedge (tapered jaw & chin)
  addPart(new THREE.CylinderGeometry(0.38, 0.72, 0.85, 24), "head", [0, 4.30, 0.22], [0, 0, 0], [0.90, 1.0, 0.85]);
  // Brow ridge & forehead contour
  addPart(new THREE.SphereGeometry(0.55, 18, 18), "head", [0, 4.95, 0.65], [0, 0, 0], [1.15, 0.35, 0.55]);
  // Refined nose bridge (pointing straight forward)
  addPart(new THREE.ConeGeometry(0.12, 0.40, 16), "head", [0, 4.70, 0.95], [Math.PI / 2, 0, 0]);
  // Chin contour
  addPart(new THREE.SphereGeometry(0.22, 16, 16), "head", [0, 3.98, 0.60]);
  // Stylized anatomical ears
  addPart(new THREE.SphereGeometry(0.20, 16, 16), "head", [-0.88, 4.82, -0.05], [0, 0, 0.15], [0.4, 1.0, 0.6]);
  addPart(new THREE.SphereGeometry(0.20, 16, 16), "head", [0.88, 4.82, -0.05], [0, 0, -0.15], [0.4, 1.0, 0.6]);
  // Floating holographic neural crown ring
  const haloGeo = new THREE.TorusGeometry(0.65, 0.028, 12, 36);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
  const haloMesh = new THREE.Mesh(haloGeo, haloMat);
  haloMesh.position.set(0, 5.72, 0);
  haloMesh.rotation.x = Math.PI / 2;
  threeBodyGroup.add(haloMesh);

  // --- 2. NECK & THROAT ---
  addPart(new THREE.CylinderGeometry(0.38, 0.48, 0.90, 24), "neck", [0, 3.55, 0]);
  // Thyroid cartilage (Adam's apple)
  addPart(new THREE.SphereGeometry(0.15, 14, 14), "neck", [0, 3.65, 0.45], [0, 0, 0], [0.8, 1.1, 0.7]);
  // Sternocleidomastoid muscle bands
  addPart(new THREE.CylinderGeometry(0.10, 0.14, 0.80, 14), "neck", [-0.28, 3.52, 0.18], [0.1, 0, -0.22]);
  addPart(new THREE.CylinderGeometry(0.10, 0.14, 0.80, 14), "neck", [0.28, 3.52, 0.18], [0.1, 0, 0.22]);

  // --- 3. CHEST & THORAX ---
  // Clavicle arches (collarbones across front of shoulders)
  addPart(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 16), "chest", [0, 3.10, 0.55], [0, 0, Math.PI / 2]);
  // Thoracic ribcage barrel
  addPart(new THREE.CylinderGeometry(1.30, 1.10, 1.55, 32), "chest", [0, 2.30, 0], [0, 0, 0], [1.0, 1.0, 0.65]);
  // Anatomical pectoral muscle plates (sculpted on front chest surface)
  addPart(new THREE.SphereGeometry(0.55, 20, 20), "chest", [-0.50, 2.45, 0.70], [0, 0.06, 0.08], [1.05, 0.65, 0.38]);
  addPart(new THREE.SphereGeometry(0.55, 20, 20), "chest", [0.50, 2.45, 0.70], [0, -0.06, -0.08], [1.05, 0.65, 0.38]);
  // Sternum vertical midline groove
  addPart(new THREE.CylinderGeometry(0.06, 0.06, 1.25, 12), "chest", [0, 2.30, 0.74]);
  // Internal glowing bioluminescent vital core (cardiac node)
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });
  vitalCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 16), coreMat);
  vitalCoreMesh.position.set(-0.15, 2.38, 0.05);
  threeBodyGroup.add(vitalCoreMesh);

  // --- 4. STOMACH & ABDOMEN (BELLY) ---
  // Mid-torso (seamlessly continues waist taper)
  addPart(new THREE.CylinderGeometry(1.10, 1.15, 1.35, 32), "belly", [0, 0.95, 0], [0, 0, 0], [1.0, 1.0, 0.68]);
  // Rectus abdominis 6-pack muscle definition (prominently sculpted on front surface)
  addPart(new THREE.SphereGeometry(0.22, 14, 14), "belly", [-0.24, 1.28, 0.72], [0, 0, 0], [0.9, 0.55, 0.30]);
  addPart(new THREE.SphereGeometry(0.22, 14, 14), "belly", [0.24, 1.28, 0.72], [0, 0, 0], [0.9, 0.55, 0.30]);
  addPart(new THREE.SphereGeometry(0.23, 14, 14), "belly", [-0.25, 0.92, 0.74], [0, 0, 0], [0.9, 0.55, 0.30]);
  addPart(new THREE.SphereGeometry(0.23, 14, 14), "belly", [0.25, 0.92, 0.74], [0, 0, 0], [0.9, 0.55, 0.30]);
  addPart(new THREE.SphereGeometry(0.22, 14, 14), "belly", [-0.24, 0.56, 0.72], [0, 0, 0], [0.9, 0.55, 0.30]);
  addPart(new THREE.SphereGeometry(0.22, 14, 14), "belly", [0.24, 0.56, 0.72], [0, 0, 0], [0.9, 0.55, 0.30]);
  // Navel (umbilicus)
  addPart(new THREE.SphereGeometry(0.06, 12, 12), "belly", [0, 0.72, 0.75]);

  // --- 5. PELVIS / BLADDER (URINE ZONE) ---
  addPart(new THREE.CylinderGeometry(1.15, 0.88, 1.10, 32), "urine", [0, -0.22, 0], [0, 0, 0], [1.0, 1.0, 0.74]);
  // Iliac crest anatomical wings
  addPart(new THREE.SphereGeometry(0.28, 16, 16), "urine", [-1.02, -0.08, 0.10]);
  addPart(new THREE.SphereGeometry(0.28, 16, 16), "urine", [1.02, -0.08, 0.10]);
  addPart(new THREE.CylinderGeometry(0.28, 0.34, 0.40, 16), "urine", [0, -0.60, 0.58]);

  // --- 6. BACK & SEGMENTED VERTEBRAL COLUMN (SPINE) ---
  // Scapular wings (shoulder blades placed on posterior surface)
  addPart(new THREE.BoxGeometry(0.68, 0.88, 0.12), "back", [-0.60, 2.48, -0.65], [0, 0.12, -0.08]);
  addPart(new THREE.BoxGeometry(0.68, 0.88, 0.12), "back", [0.60, 2.48, -0.65], [0, -0.12, 0.08]);
  // Erector spinae muscular columns
  addPart(new THREE.CylinderGeometry(0.18, 0.20, 3.2, 16), "back", [-0.38, 1.70, -0.65]);
  addPart(new THREE.CylinderGeometry(0.18, 0.20, 3.2, 16), "back", [0.38, 1.70, -0.65]);
  // 15 articulated vertebral discs along the natural human spinal S-curve on posterior surface
  for (let i = 0; i < 15; i++) {
    const vy = 3.55 - i * 0.25;
    const vz = -0.76 - Math.sin((i / 14) * Math.PI) * 0.06;
    const spineDisc = addPart(new THREE.TorusGeometry(0.24, 0.055, 12, 24), "back", [0, vy, vz], [Math.PI / 2, 0, 0]);
    spineDisc.material.emissive.setHex(0x0284c7);
    spineDisc.material.emissiveIntensity = 0.70;
  }
  // Central neural cord (illuminated cyan spinal filament)
  const spinalCord = addPart(new THREE.CylinderGeometry(0.05, 0.05, 3.7, 12), "back", [0, 1.80, -0.74]);
  spinalCord.material.emissive.setHex(0x38bdf8);
  spinalCord.material.emissiveIntensity = 0.95;
  // Gluteal muscular fullness
  addPart(new THREE.SphereGeometry(0.52, 18, 18), "back", [-0.45, -0.56, -0.42], [0, 0, 0], [1.0, 1.10, 0.85]);
  addPart(new THREE.SphereGeometry(0.52, 18, 18), "back", [0.45, -0.56, -0.42], [0, 0, 0], [1.0, 1.10, 0.85]);

  // --- 7. ARMS & HANDS ---
  // Left Arm
  addPart(new THREE.SphereGeometry(0.46, 20, 20), "arms", [-1.55, 2.82, 0], [0, 0, 0], [1.05, 1.15, 0.95]); // Deltoid
  addPart(new THREE.CylinderGeometry(0.32, 0.26, 1.50, 20), "arms", [-1.72, 1.94, 0], [0, 0, 0.10]); // Bicep
  addPart(new THREE.SphereGeometry(0.26, 16, 16), "arms", [-1.86, 1.08, 0]); // Elbow
  addPart(new THREE.CylinderGeometry(0.26, 0.20, 1.45, 20), "arms", [-1.96, 0.22, 0], [0, 0, 0.06]); // Forearm
  addPart(new THREE.SphereGeometry(0.18, 14, 14), "arms", [-2.04, -0.52, 0]); // Wrist
  addPart(new THREE.BoxGeometry(0.32, 0.48, 0.14), "arms", [-2.08, -0.88, 0]); // Palm
  addPart(new THREE.BoxGeometry(0.12, 0.26, 0.12), "arms", [-1.92, -0.78, 0.08], [0, 0, -0.38]); // Thumb
  addPart(new THREE.BoxGeometry(0.28, 0.38, 0.11), "arms", [-2.10, -1.24, 0.02], [-0.08, 0, 0]); // Fingers

  // Right Arm
  addPart(new THREE.SphereGeometry(0.46, 20, 20), "arms", [1.55, 2.82, 0], [0, 0, 0], [1.05, 1.15, 0.95]); // Deltoid
  addPart(new THREE.CylinderGeometry(0.32, 0.26, 1.50, 20), "arms", [1.72, 1.94, 0], [0, 0, -0.10]); // Bicep
  addPart(new THREE.SphereGeometry(0.26, 16, 16), "arms", [1.86, 1.08, 0]); // Elbow
  addPart(new THREE.CylinderGeometry(0.26, 0.20, 1.45, 20), "arms", [1.96, 0.22, 0], [0, 0, -0.06]); // Forearm
  addPart(new THREE.SphereGeometry(0.18, 14, 14), "arms", [2.04, -0.52, 0]); // Wrist
  addPart(new THREE.BoxGeometry(0.32, 0.48, 0.14), "arms", [2.08, -0.88, 0]); // Palm
  addPart(new THREE.BoxGeometry(0.12, 0.26, 0.12), "arms", [1.92, -0.78, 0.08], [0, 0, 0.38]); // Thumb
  addPart(new THREE.BoxGeometry(0.28, 0.38, 0.11), "arms", [2.10, -1.24, 0.02], [-0.08, 0, 0]); // Fingers

  // --- 8. LEGS & FEET ---
  // Left Leg
  addPart(new THREE.SphereGeometry(0.46, 18, 18), "legs", [-0.68, -0.72, 0]); // Hip joint
  addPart(new THREE.CylinderGeometry(0.48, 0.34, 2.20, 24), "legs", [-0.72, -1.82, 0], [0, 0, 0], [1.0, 1.0, 0.92]); // Thigh
  addPart(new THREE.SphereGeometry(0.32, 18, 18), "legs", [-0.72, -2.98, 0]); // Knee joint
  addPart(new THREE.SphereGeometry(0.24, 16, 16), "legs", [-0.72, -2.98, 0.26], [0, 0, 0], [1.0, 1.25, 0.5]); // Patella (kneecap)
  addPart(new THREE.CylinderGeometry(0.36, 0.24, 2.15, 24), "legs", [-0.72, -4.10, -0.02]); // Calf & shin
  addPart(new THREE.SphereGeometry(0.22, 16, 16), "legs", [-0.72, -5.24, 0]); // Ankle
  addPart(new THREE.BoxGeometry(0.42, 0.26, 0.88), "legs", [-0.72, -5.56, 0.20], [0.05, 0, 0]); // Foot arch & heel
  addPart(new THREE.BoxGeometry(0.40, 0.16, 0.36), "legs", [-0.72, -5.68, 0.68]); // Toe plate

  // Right Leg
  addPart(new THREE.SphereGeometry(0.46, 18, 18), "legs", [0.68, -0.72, 0]); // Hip joint
  addPart(new THREE.CylinderGeometry(0.48, 0.34, 2.20, 24), "legs", [0.72, -1.82, 0], [0, 0, 0], [1.0, 1.0, 0.92]); // Thigh
  addPart(new THREE.SphereGeometry(0.32, 18, 18), "legs", [0.72, -2.98, 0]); // Knee joint
  addPart(new THREE.SphereGeometry(0.24, 16, 16), "legs", [0.72, -2.98, 0.26], [0, 0, 0], [1.0, 1.25, 0.5]); // Patella (kneecap)
  addPart(new THREE.CylinderGeometry(0.36, 0.24, 2.15, 24), "legs", [0.72, -4.10, -0.02]); // Calf & shin
  addPart(new THREE.SphereGeometry(0.22, 16, 16), "legs", [0.72, -5.24, 0]); // Ankle
  addPart(new THREE.BoxGeometry(0.42, 0.26, 0.88), "legs", [0.72, -5.56, 0.20], [0.05, 0, 0]); // Foot arch & heel
  addPart(new THREE.BoxGeometry(0.40, 0.16, 0.36), "legs", [0.72, -5.68, 0.68]); // Toe plate

  threeScene.add(threeBodyGroup);

  // =========================================================================
  // HOLOGRAPHIC SCANNER PEDESTAL & CT SWEEP LASER
  // =========================================================================
  // Slate/Carbon Circular Turntable Base
  const pedestalGeo = new THREE.CylinderGeometry(3.5, 3.8, 0.18, 48);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.85,
    roughness: 0.2,
    transparent: true,
    opacity: 0.88,
  });
  const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestalMesh.position.set(0, -5.85, 0);
  threeScene.add(pedestalMesh);

  // Outer glowing cyan laser ring
  const ringGeo = new THREE.RingGeometry(3.15, 3.24, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });
  const outerRing = new THREE.Mesh(ringGeo, ringMat);
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = -5.75;
  threeScene.add(outerRing);

  // Inner rotating holographic tech ring
  const innerRingGeo = new THREE.RingGeometry(2.0, 2.06, 48);
  const innerRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.80 });
  pedestalInnerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  pedestalInnerRing.rotation.x = Math.PI / 2;
  pedestalInnerRing.position.y = -5.74;
  threeScene.add(pedestalInnerRing);

  // Sweeping CT Scan Laser Plane (moves up and down the human body)
  const scannerGeo = new THREE.RingGeometry(0.08, 3.0, 48);
  const scannerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.15,
  });
  scannerRing = new THREE.Mesh(scannerGeo, scannerMat);
  scannerRing.rotation.x = Math.PI / 2;
  threeScene.add(scannerRing);

  // =========================================================================
  // INTERACTIVE ORBIT CONTROLS & DAMPING
  // =========================================================================
  viewportEl.addEventListener("pointerdown", e => {
    isPointerDown = true;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    totalDragDistance = 0;
    dragVelocityY = 0;
    dragVelocityX = 0;
  });

  viewportEl.addEventListener("pointermove", e => {
    const rect = viewportEl.getBoundingClientRect();
    threeMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    threeMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isPointerDown) {
      const dx = e.clientX - pointerStartX;
      const dy = e.clientY - pointerStartY;
      totalDragDistance += Math.abs(dx) + Math.abs(dy);
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;

      dragVelocityY = dx * 0.012;
      dragVelocityX = dy * 0.008;

      targetRotationY += dragVelocityY;
      targetRotationX = Math.max(-0.35, Math.min(0.35, targetRotationX + dragVelocityX));

      state.autoRotate = false;
      const spinBtn = $("pm-btn-spin");
      if (spinBtn) spinBtn.classList.remove("active");
    } else {
      // Hover Raycasting
      if (threeRaycaster && threeCamera && threeBodyMeshes.length) {
        threeRaycaster.setFromCamera(threeMouse, threeCamera);
        const hits = threeRaycaster.intersectObjects(threeBodyMeshes);
        if (hits.length > 0) {
          const hoveredRegion = hits[0].object.userData.region;
          const regObj = catalog.regions.find(r => r.id === hoveredRegion);
          if (regObj && tooltipEl) {
            tooltipEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">${getRegionIcon(hoveredRegion)} <span>${label(regObj.label)}</span></span>`;
            tooltipEl.style.opacity = "1";
          }
          viewportEl.style.cursor = "pointer";
        } else {
          if (tooltipEl) tooltipEl.style.opacity = "0";
          viewportEl.style.cursor = "grab";
        }
      }
    }
  });

  const onPointerUp = () => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (totalDragDistance < 8) {
      // Direct click / tap selection
      if (threeRaycaster && threeCamera && threeBodyMeshes.length) {
        threeRaycaster.setFromCamera(threeMouse, threeCamera);
        const hits = threeRaycaster.intersectObjects(threeBodyMeshes);
        if (hits.length > 0) {
          const clickedRegion = hits[0].object.userData.region;
          selectRegion(clickedRegion);
        }
      }
    }
  };

  viewportEl.addEventListener("pointerup", onPointerUp);
  viewportEl.addEventListener("pointerleave", () => {
    isPointerDown = false;
    if (tooltipEl) tooltipEl.style.opacity = "0";
  });

  // Mouse wheel zoom
  viewportEl.addEventListener("wheel", e => {
    e.preventDefault();
    targetCameraDistance = Math.max(14, Math.min(28, targetCameraDistance + e.deltaY * 0.01));
  }, { passive: false });

  update3DHighlights();

  function animate() {
    threeAnimFrame = requestAnimationFrame(animate);

    if (state.autoRotate && !isPointerDown) {
      targetRotationY += 0.007;
    } else if (!isPointerDown) {
      // Smooth inertial damping on release
      targetRotationY += dragVelocityY;
      dragVelocityY *= 0.92;
      dragVelocityX *= 0.92;
    }

    // Smooth lerp for rotations
    currentRotationY += (targetRotationY - currentRotationY) * 0.12;
    currentRotationX += (targetRotationX - currentRotationX) * 0.12;

    if (threeBodyGroup) {
      threeBodyGroup.rotation.y = currentRotationY;
      threeBodyGroup.rotation.x = currentRotationX;
    }

    // Smooth camera distance lerp & always center view on the model
    threeCamera.position.z += (targetCameraDistance - threeCamera.position.z) * 0.12;
    threeCamera.lookAt(0, -0.2, 0);

    // Environmental & Vital animations
    if (vitalCoreMesh) {
      const pulse = 1.0 + Math.sin(Date.now() * 0.005) * 0.15;
      vitalCoreMesh.scale.set(pulse, pulse, pulse);
    }
    if (pedestalInnerRing) {
      pedestalInnerRing.rotation.z -= 0.005;
    }
    if (scannerRing) {
      scannerRing.position.y = Math.sin(Date.now() * 0.0018) * 5.2 + 0.1;
      scannerRing.rotation.z += 0.008;
    }

    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

function update3DHighlights() {
  if (!threeBodyMeshes || threeBodyMeshes.length === 0) return;

  threeBodyMeshes.forEach(mesh => {
    const reg = mesh.userData.region;
    const hasSymptoms = [...state.symptoms].some(id => symptomById[id] && symptomById[id].region === reg);

    if (reg === state.activeRegion) {
      // Vivid electric cyan & blue glowing selected state
      mesh.material.color.setHex(0x0284c7);
      mesh.material.emissive.setHex(0x00f0ff);
      mesh.material.emissiveIntensity = 0.95;
      mesh.material.opacity = 0.98;
    } else if (hasSymptoms) {
      // Diagnostic success emerald glow for active symptoms
      mesh.material.color.setHex(0x059669);
      mesh.material.emissive.setHex(0x10b981);
      mesh.material.emissiveIntensity = 0.85;
      mesh.material.opacity = 0.98;
    } else {
      // Clean frosted titanium clinical silicone
      mesh.material.color.setHex(mesh.userData.defaultColor);
      mesh.material.emissive.setHex(mesh.userData.defaultEmissive);
      mesh.material.emissiveIntensity = 0.20;
      mesh.material.opacity = 0.86;
    }
  });

  // Update HUD badge
  const activeObj = catalog ? catalog.regions.find(r => r.id === state.activeRegion) : null;
  const badgeIcon = $("pm-3d-badge-icon");
  const badgeText = $("pm-3d-badge-text");
  if (activeObj && badgeIcon && badgeText) {
    badgeIcon.innerHTML = getRegionIcon(state.activeRegion);
    badgeText.textContent = label(activeObj.label);
  }
  const countText = $("pm-3d-count-text");
  const countIcon = $("pm-3d-count-icon");
  if (countIcon) countIcon.innerHTML = ICONS.stethoscope;
  if (countText) {
    const count = [...state.symptoms].filter(id => symptomById[id] && symptomById[id].region === state.activeRegion).length;
    countText.textContent = `${count} ${state.lang === "hi" ? "चुने गए" : "selected"}`;
  }
}

// --------------------------------------------------------------------------
// Screens
// --------------------------------------------------------------------------
const RENDER = {
  lang() {
    setQuestion("Choose your language / अपनी भाषा चुनें / ଭାଷା ବାଛନ୍ତୁ", {
      interrupt: true,
      sub: "Select your preferred language. Spoken audio guidance is available across all 8 Indian languages."
    });
    speak("Choose your language", { lang: "en" });
    state.lastSpoken = "Choose your language";

    $("pm-screen").innerHTML = `
      <div class="pm-lang-section">
        <div class="pm-section-lead-label">Primary Consultation Languages</div>
        <div class="pm-lang-lead-grid">
          <button class="pm-lang-lead-card ${state.lang === "en" ? "selected" : ""}" data-lang="en">
            <div class="pm-lang-lead-meta">
              <span class="pm-lang-badge">EN • Official</span>
              <div class="pm-lang-lead-title">English</div>
              <div class="pm-lang-lead-sub">Standard English Clinical Guidance</div>
            </div>
            ${state.lang === "en" ? `<span style="color:var(--brand-blue);">${ICONS.check}</span>` : ""}
          </button>
          <button class="pm-lang-lead-card ${state.lang === "hi" ? "selected" : ""}" data-lang="hi">
            <div class="pm-lang-lead-meta">
              <span class="pm-lang-badge">HI • हिन्दी</span>
              <div class="pm-lang-lead-title">हिन्दी</div>
              <div class="pm-lang-lead-sub">Hindi Voice & Picture Support</div>
            </div>
            ${state.lang === "hi" ? `<span style="color:var(--brand-blue);">${ICONS.check}</span>` : ""}
          </button>
        </div>

        <div class="pm-section-lead-label">Regional Indian Languages</div>
        <div class="pm-lang-regional-grid">
          <button class="pm-lang-card ${state.lang === "or" ? "selected" : ""}" data-lang="or">
            <div>
              <div class="pm-lang-title">ଓଡ଼ିଆ</div>
              <div class="pm-lang-sub">Odia (Odisha)</div>
            </div>
            <span class="pm-lang-badge">OR</span>
          </button>
          <button class="pm-lang-card ${state.lang === "bn" ? "selected" : ""}" data-lang="bn">
            <div>
              <div class="pm-lang-title">বাংলা</div>
              <div class="pm-lang-sub">Bengali (Bengal)</div>
            </div>
            <span class="pm-lang-badge">BN</span>
          </button>
          <button class="pm-lang-card ${state.lang === "ta" ? "selected" : ""}" data-lang="ta">
            <div>
              <div class="pm-lang-title">தமிழ்</div>
              <div class="pm-lang-sub">Tamil (Tamil Nadu)</div>
            </div>
            <span class="pm-lang-badge">TA</span>
          </button>
          <button class="pm-lang-card ${state.lang === "te" ? "selected" : ""}" data-lang="te">
            <div>
              <div class="pm-lang-title">తెలుగు</div>
              <div class="pm-lang-sub">Telugu (Andhra / Telangana)</div>
            </div>
            <span class="pm-lang-badge">TE</span>
          </button>
          <button class="pm-lang-card ${state.lang === "mr" ? "selected" : ""}" data-lang="mr">
            <div>
              <div class="pm-lang-title">मराठी</div>
              <div class="pm-lang-sub">Marathi (Maharashtra)</div>
            </div>
            <span class="pm-lang-badge">MR</span>
          </button>
          <button class="pm-lang-card ${state.lang === "gu" ? "selected" : ""}" data-lang="gu">
            <div>
              <div class="pm-lang-title">ગુજરાતી</div>
              <div class="pm-lang-sub">Gujarati (Gujarat)</div>
            </div>
            <span class="pm-lang-badge">GU</span>
          </button>
        </div>
      </div>`;

    $("pm-screen").querySelectorAll("[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.lang = btn.dataset.lang;
        const nativeName = btn.querySelector(".pm-lang-lead-title, .pm-lang-title").textContent.trim();
        speak(nativeName, { lang: state.lang });
        goTo("who", { interrupt: false });
      });
    });
  },

  who({ interrupt = true } = {}) {
    setQuestion(t("who_q"), {
      interrupt,
      sub: "Age helps our clinical triage engine apply specialized pediatric, adult, or geriatric safety guidelines."
    });

    const adultGroup = catalog.age_groups.find(g => g.id === "adult") || { id: "adult", label: { en: "Adult" } };
    const supportingGroups = catalog.age_groups.filter(g => g.id !== "adult");

    $("pm-screen").innerHTML = `
      <div class="pm-who-layout">
        <!-- Lead Hero Card: Adult (18-65) -->
        <button class="pm-who-lead-card ${state.ageGroup === "adult" ? "selected" : ""}" data-age="adult">
          <div class="pm-who-lead-top">
            <div class="pm-who-icon-box">
              ${ICONS.userCheck}
            </div>
            <span class="pm-who-tag">Primary Demographic • Standard OPD</span>
          </div>
          <div>
            <div class="pm-who-lead-title">${label(adultGroup.label)}</div>
            <div class="pm-who-lead-desc">Standard adult clinical evaluation protocols. Covers work-age adults (18 to 65 years).</div>
          </div>
        </button>

        <!-- Supporting Age Groups -->
        <div class="pm-who-supporting-stack">
          ${supportingGroups.map(g => {
            const tagMap = {
              baby: "Pediatric Neonatal Watch",
              child: "Pediatric Growth Protocol",
              elderly: "Geriatric Vulnerability Watch"
            };
            return `
              <button class="pm-who-card ${state.ageGroup === g.id ? "selected" : ""}" data-age="${g.id}">
                <div class="pm-who-card-left">
                  <div class="pm-who-card-icon">
                    ${getAgeIcon(g.id)}
                  </div>
                  <div>
                    <div class="pm-who-card-title">${label(g.label)}</div>
                    <div class="pm-who-card-sub">${tagMap[g.id] || "Specialized clinical protocol"}</div>
                  </div>
                </div>
                ${state.ageGroup === g.id ? `<span style="color:var(--brand-blue);">${ICONS.check}</span>` : ""}
              </button>`;
          }).join("")}
        </div>
      </div>`;

    $("pm-screen").querySelectorAll("[data-age]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.ageGroup = btn.dataset.age;
        speak(label(catalog.age_groups.find(g => g.id === state.ageGroup).label));
        goTo("where", { interrupt: false });
      });
    });
  },

  where({ interrupt = true } = {}) {
    setQuestion(t("where_q"), {
      interrupt,
      sub: "Rotate the 3D anatomical model to target affected organs or select a region below."
    });
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    $("pm-screen").innerHTML = `
      <div class="pm-mic-row">
        ${SR ? `<button id="pm-mic" class="pm-mic">${ICONS.mic} <span>${t("speak")}</span></button>`
             : `<span class="pm-heard">${t("mic_unsupported")}</span>`}
        <div id="pm-heard" class="pm-heard"></div>
      </div>

      <div class="pm-body-layout">
        <div>
          <!-- 3D vs 2D Model Switch Tabs -->
          <div class="pm-model-switch">
            <button id="pm-tab-3d" class="pm-tab-btn ${state.modelMode === "3d" ? "active" : ""}">${ICONS.sparkles} <span>${t("model_3d_tab").replace(/^[^\w\s]+/, "").trim()}</span></button>
            <button id="pm-tab-2d" class="pm-tab-btn ${state.modelMode === "2d" ? "active" : ""}">${ICONS.brain} <span>${t("model_2d_tab").replace(/^[^\w\s]+/, "").trim()}</span></button>
          </div>

          <!-- 3D Viewport Box -->
          <div id="pm-3d-box" class="pm-3d-box" style="${state.modelMode === "3d" ? "" : "display:none;"}">
            <div class="pm-3d-hud">
              <div id="pm-3d-badge" class="pm-3d-active-badge">
                <span id="pm-3d-badge-icon">${getRegionIcon(state.activeRegion)}</span>
                <span id="pm-3d-badge-text">Chest</span>
              </div>
              <div id="pm-3d-symptom-count" class="pm-3d-active-badge" style="border-color: rgba(16, 185, 129, 0.4); color: #10b981;">
                <span id="pm-3d-count-icon">${ICONS.stethoscope}</span>
                <span id="pm-3d-count-text">0 selected</span>
              </div>
            </div>
            <div id="pm-3d-viewport" class="pm-3d-viewport">
              <div id="pm-3d-tooltip" class="pm-3d-tooltip" style="opacity:0;"></div>
            </div>
            <div class="pm-3d-controls">
              <button id="pm-btn-front" class="pm-3d-btn" title="Front view">${ICONS.rotate} <span>${t("view_front")}</span></button>
              <button id="pm-btn-back-view" class="pm-3d-btn" title="Back view (Spine)">${ICONS.spine} <span>${t("view_back")}</span></button>
              <button id="pm-btn-spin" class="pm-3d-btn ${state.autoRotate ? "active" : ""}" title="Toggle Auto-Spin">${ICONS.rotate} <span>${t("auto_spin")}</span></button>
              <button id="pm-btn-zoom-in" class="pm-3d-btn" title="Zoom in">${ICONS.zoomIn}</button>
              <button id="pm-btn-zoom-out" class="pm-3d-btn" title="Zoom out">${ICONS.zoomOut}</button>
              <button id="pm-btn-reset-view" class="pm-3d-btn" title="Reset view">${ICONS.crosshair}</button>
            </div>
            <div class="pm-3d-hint">${t("rotate_hint").replace(/•/g, "—")}</div>
          </div>

          <!-- 2D SVG Map Box -->
          <div id="pm-2d-box" style="${state.modelMode === "2d" ? "" : "display:none;"}">
            ${bodySvg()}
          </div>

          <!-- Quick Region Buttons -->
          <div class="pm-region-buttons">
            ${catalog.regions.map(r => `
              <button class="pm-region-btn ${state.activeRegion === r.id ? "active" : ""}" data-region="${r.id}">
                ${getRegionIcon(r.id)} <span>${label(r.label)}</span>
              </button>`).join("")}
          </div>
        </div>

        <div class="pm-symptom-workbench">
          <div id="pm-symptom-grid"></div>

          <!-- Custom Disease / Condition Text & Voice Box -->
          <div class="pm-custom-box">
            <div class="pm-custom-header">
              <div class="pm-custom-header-icon">${ICONS.edit}</div>
              <div>
                <div class="pm-custom-title">${t("custom_box_title").replace(/^[^\w\s]+/, "").trim()}</div>
                <div class="pm-custom-sub">${t("custom_box_placeholder")}</div>
              </div>
            </div>
            <div class="pm-custom-input-row">
              <input type="text" id="pm-custom-input" class="pm-custom-input" placeholder="${t("custom_box_placeholder")}" aria-label="Custom disease or symptom">
              ${SR ? `<button id="pm-custom-mic" class="pm-custom-mic" title="Voice typing">${ICONS.mic} <span>${t("speak")}</span></button>` : ""}
              <button id="pm-custom-add" class="pm-custom-add">${ICONS.plus} <span>${t("add_problem")}</span></button>
            </div>
            <div id="pm-custom-status" class="pm-custom-status"></div>
          </div>

          <!-- Selected Findings Tray -->
          <div class="pm-tray-wrap">
            <div class="pm-tray-label">${t("selected_title")}</div>
            <div id="pm-tray" class="pm-tray"></div>
          </div>
        </div>
      </div>`;

    // 2D & Region button clicks
    $("pm-screen").querySelectorAll(".pm-region-btn").forEach(el => {
      el.addEventListener("click", () => selectRegion(el.dataset.region));
    });
    $("pm-screen").querySelectorAll(".pm-body-svg [data-region]").forEach(el => {
      el.addEventListener("click", () => selectRegion(el.dataset.region));
    });

    // 3D vs 2D Toggle Handlers
    $("pm-tab-3d").addEventListener("click", () => {
      state.modelMode = "3d";
      $("pm-tab-3d").classList.add("active");
      $("pm-tab-2d").classList.remove("active");
      $("pm-3d-box").style.display = "flex";
      $("pm-2d-box").style.display = "none";
      init3DModel();
    });
    $("pm-tab-2d").addEventListener("click", () => {
      state.modelMode = "2d";
      $("pm-tab-2d").classList.add("active");
      $("pm-tab-3d").classList.remove("active");
      $("pm-3d-box").style.display = "none";
      $("pm-2d-box").style.display = "block";
      cleanup3D();
    });

    // 3D Quick Preset Buttons
    $("pm-btn-front").addEventListener("click", () => {
      targetRotationY = 0;
      targetRotationX = 0;
      state.autoRotate = false;
      const spinBtn = $("pm-btn-spin");
      if (spinBtn) spinBtn.classList.remove("active");
    });
    $("pm-btn-back-view").addEventListener("click", () => {
      targetRotationY = Math.PI;
      targetRotationX = 0;
      state.autoRotate = false;
      const spinBtn = $("pm-btn-spin");
      if (spinBtn) spinBtn.classList.remove("active");
      selectRegion("back");
    });
    $("pm-btn-spin").addEventListener("click", () => {
      state.autoRotate = !state.autoRotate;
      $("pm-btn-spin").classList.toggle("active", state.autoRotate);
    });
    const zoomInBtn = $("pm-btn-zoom-in");
    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        targetCameraDistance = Math.max(14, targetCameraDistance - 2.5);
      });
    }
    const zoomOutBtn = $("pm-btn-zoom-out");
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        targetCameraDistance = Math.min(28, targetCameraDistance + 2.5);
      });
    }
    const resetViewBtn = $("pm-btn-reset-view");
    if (resetViewBtn) {
      resetViewBtn.addEventListener("click", () => {
        targetRotationY = 0;
        targetRotationX = 0;
        targetCameraDistance = 22.0;
        state.autoRotate = false;
        const spinBtn = $("pm-btn-spin");
        if (spinBtn) spinBtn.classList.remove("active");
      });
    }

    // Custom Disease / Condition Box Handlers
    const customInp = $("pm-custom-input");
    const customAddBtn = $("pm-custom-add");
    const doAddCustom = () => {
      if (customInp.value.trim()) {
        addCustomProblem(customInp.value.trim());
        customInp.value = "";
      }
    };
    customAddBtn.addEventListener("click", doAddCustom);
    customInp.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        doAddCustom();
      }
    });

    if (SR) {
      $("pm-mic").addEventListener("click", () => startListening(SR));
      const customMic = $("pm-custom-mic");
      if (customMic) {
        customMic.addEventListener("click", () => startListeningForCustom(SR));
      }
    }

    renderSymptomGrid();
    renderTray();

    if (state.modelMode === "3d") {
      setTimeout(init3DModel, 50);
    }
  },

  pain({ interrupt = true } = {}) {
    setQuestion(t("pain_q"), {
      interrupt,
      sub: "Wong-Baker FACES clinical pain scale. Rate severity from 0 (No Pain) to 10 (Worst Possible Pain)."
    });
    $("pm-screen").innerHTML = `
      <div class="pm-faces-container">
        ${FACES.map((f, i) => `
          <button class="pm-face-card ${state.pain === f.score ? "selected" : ""}" data-score="${f.score}" style="color:${f.color}">
            <div class="pm-face-svg-wrap">
              ${f.svg}
            </div>
            <div class="pm-face-score">${f.score}</div>
            <div class="pm-face-label">${t("faces")[i]}</div>
          </button>
        `).join("")}
      </div>`;

    $("pm-screen").querySelectorAll("[data-score]").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        state.pain = Number(btn.dataset.score);
        $("pm-screen").querySelectorAll(".pm-face-card").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        speak(`${t("faces")[i]}. ${t("pain_label")(state.pain)}`);
      });
    });
  },

  confirm() {
    const items = [...state.symptoms].map(id => symptomById[id]).filter(Boolean);
    const age = catalog.age_groups.find(g => g.id === state.ageGroup) || { id: state.ageGroup, label: { en: "Patient" } };
    setQuestion(t("confirm_q"), {
      interrupt: true,
      sub: "Review clinical observations before transmission to Dr. Rajesh OPD triage queue."
    });

    $("pm-screen").innerHTML = `
      <div class="pm-confirm-layout">
        <div class="pm-confirm-summary-card">
          <div class="pm-summary-section-title">Patient Profile & Findings</div>
          <div class="pm-confirm-list">
            <div class="pm-confirm-item">
              ${getAgeIcon(age.id)}
              <span>Age Group: <strong>${label(age.label)}</strong></span>
            </div>
            ${items.map(s => `
              <div class="pm-confirm-item" style="${s.danger ? 'border-left: 3px solid var(--clinical-red);' : ''}">
                ${getSymptomIcon(s.id, s.region)}
                <span>${label(s.label)} ${s.danger ? `<span class="pm-danger-pill" style="margin-left:6px;">High Risk</span>` : ""}</span>
              </div>
            `).join("")}
            ${state.customSymptoms.map(c => `
              <div class="pm-confirm-item" style="border-left: 3px solid var(--clinical-amber);">
                ${ICONS.edit}
                <span>Reported Condition: <strong>${c}</strong></span>
              </div>
            `).join("")}
            <div class="pm-confirm-item">
              <span style="font-family:var(--font-mono); font-weight:800; color:${FACES.find(f => f.score === state.pain)?.color || '#1b2559'}; font-size:16px;">
                ${state.pain !== null ? state.pain : 0}/10
              </span>
              <span>Reported Pain: <strong>${t("pain_label")(state.pain)}</strong></span>
            </div>
          </div>
        </div>

        <div class="pm-confirm-actions">
          <button id="pm-yes" class="pm-big-btn yes">
            ${ICONS.check} <span>${t("yes")} — Submit Assessment</span>
          </button>
          <button id="pm-change" class="pm-big-btn no">
            ${ICONS.edit} <span>${t("change")} — Edit Details</span>
          </button>
        </div>
      </div>`;

    const spoken = [
      t("you_told"),
      label(age.label),
      ...items.map(s => label(s.label)),
      ...state.customSymptoms,
      t("pain_label")(state.pain),
      t("confirm_q"),
    ].join(". ");
    speak(spoken);
    $("pm-yes").addEventListener("click", submitAssessment);
    $("pm-change").addEventListener("click", () => goTo("where"));
  },

  result() {
    const r = state.result;
    const badgeInfo = RESULT_BADGES[r.color] || RESULT_BADGES.yellow;
    setQuestion(t("result_q"), {
      interrupt: true,
      sub: "Clinical recommendation generated by triage rule engine. Priority cases are routed immediately."
    });

    const ret = r.color === "red" ? "" : `
      <div class="pm-return-box">
        <h2>${ICONS.alertTriangle} <span>${t("return_if")}</span></h2>
        <div class="pm-return-grid">
          ${r.return_immediately_if.map(id => {
            const s = symptomById[id];
            return s ? `
              <div class="pm-return-item">
                ${getSymptomIcon(s.id, s.region)}
                <span>${label(s.label)}</span>
              </div>` : "";
          }).join("")}
        </div>
      </div>`;

    $("pm-screen").innerHTML = `
      <div id="pm-called-container"></div>

      <div class="pm-result-layout">
        <!-- Main Clinical Directive Card -->
        <div class="pm-result ${r.color}">
          <div class="pm-result-top">
            <div class="pm-result-icon-badge">${badgeInfo.icon}</div>
            <div>
              <span class="pm-result-urgency-tag">${badgeInfo.tag}</span>
              <div class="pm-result-headline">${badgeInfo.title}</div>
            </div>
          </div>
          <div class="pm-result-text">${t(r.color)}</div>
          ${r.color === "red" ? `
            <a class="pm-call-btn" href="tel:108">
              ${ICONS.phone} <span>${t("call")} — Ambulance Dispatch</span>
            </a>` : ""}
        </div>

        <!-- Live OPD Queue Ticket -->
        <div class="pm-queue-box" id="pm-queue-box">
          <div class="pm-token-row">
            <div class="pm-token-badge">
              <span class="pm-token-lbl">${t("token_label")}</span>
              <span class="pm-token-val" id="pm-token-id">TK-…</span>
            </div>
            <div class="pm-queue-pos-badge" id="pm-queue-pos-badge">
              ${t("queue_pos")}: <span id="pm-queue-pos" style="font-family:var(--font-mono); font-weight:800;">1</span>
            </div>
          </div>
          <div class="pm-queue-status-text" id="pm-queue-status">
            ${ICONS.clock} <span id="pm-queue-msg">${t("waiting_doc")}</span>
          </div>
        </div>
      </div>

      ${ret}

      <div class="pm-action-row">
        <button id="pm-print" class="pm-big-btn">${ICONS.printer} <span>${t("print")}</span></button>
        <button id="pm-restart" class="pm-big-btn">${ICONS.rotate} <span>${t("restart")}</span></button>
      </div>`;

    let spoken = t(r.color);
    if (r.color !== "red") {
      spoken += " " + t("return_if") + " " + r.return_immediately_if.map(id => symptomById[id] ? label(symptomById[id].label) : "").join(", ");
    }
    if (r.color === "red") beepAlarm();
    speak(spoken);
    $("pm-print").addEventListener("click", printSlip);
    $("pm-restart").addEventListener("click", resetAll);

    registerInOpdQueue();
  },
};

// --------------------------------------------------------------------------
// 2D Body Map + Symptoms
// --------------------------------------------------------------------------
function bodySvg() {
  const zoneClass = region => {
    const has = [...state.symptoms].some(id => symptomById[id] && symptomById[id].region === region);
    return `zone ${state.activeRegion === region ? "active" : has ? "has-selection" : ""}`;
  };
  return `
    <svg class="pm-body-svg" viewBox="0 0 200 400" role="img" aria-label="Body map">
      <!-- Head -->
      <circle class="${zoneClass("head")}" data-region="head" cx="100" cy="42" r="32"/>
      <!-- Neck -->
      <rect class="${zoneClass("neck")}" data-region="neck" x="84" y="74" width="32" height="18" rx="6"/>
      <!-- Arms -->
      <rect class="${zoneClass("arms")}" data-region="arms" x="18" y="94" width="30" height="144" rx="15"/>
      <rect class="${zoneClass("arms")}" data-region="arms" x="152" y="94" width="30" height="144" rx="15"/>
      <!-- Chest -->
      <rect class="${zoneClass("chest")}" data-region="chest" x="52" y="94" width="96" height="78" rx="20"/>
      <!-- Belly -->
      <rect class="${zoneClass("belly")}" data-region="belly" x="58" y="174" width="84" height="58" rx="18"/>
      <!-- Urine -->
      <rect class="${zoneClass("urine")}" data-region="urine" x="64" y="234" width="72" height="38" rx="14"/>
      <!-- Legs -->
      <rect class="${zoneClass("legs")}" data-region="legs" x="64" y="274" width="32" height="118" rx="15"/>
      <rect class="${zoneClass("legs")}" data-region="legs" x="104" y="274" width="32" height="118" rx="15"/>
    </svg>`;
}

function selectRegion(region) {
  state.activeRegion = region;
  const r = catalog.regions.find(x => x.id === region);
  if (r) {
    speak(`${label(r.label)}. ${t("region_hint")}`);
  }

  // Update 2D map
  const svg = $("pm-screen").querySelector(".pm-body-svg");
  if (svg) {
    svg.outerHTML = bodySvg();
    $("pm-screen").querySelectorAll(".pm-body-svg [data-region]").forEach(el => {
      el.addEventListener("click", () => selectRegion(el.dataset.region));
    });
  }

  // Update Region buttons
  $("pm-screen").querySelectorAll(".pm-region-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.region === region);
  });

  // Update 3D Highlights
  update3DHighlights();

  // If selecting back in 3D, rotate model towards back view smoothly
  if (region === "back" && threeBodyGroup && state.modelMode === "3d") {
    threeBodyGroup.rotation.y = Math.PI;
    state.autoRotate = false;
    const spinBtn = $("pm-btn-spin");
    if (spinBtn) spinBtn.classList.remove("active");
  }

  renderSymptomGrid();
}

function renderSymptomGrid() {
  const container = $("pm-symptom-grid");
  if (!container) return;
  const list = catalog.symptoms.filter(s => s.region === state.activeRegion);
  const dangerList = list.filter(s => s.danger);
  const regularList = list.filter(s => !s.danger);

  let html = "";
  if (dangerList.length > 0) {
    html += `
      <div class="pm-symptom-group-title">
        ${ICONS.alertTriangle} <span>High-Priority Red-Flag Symptoms</span>
      </div>
      <div class="pm-lead-symptoms-list">
        ${dangerList.map(s => `
          <button class="pm-symptom-card lead ${state.symptoms.has(s.id) ? "selected" : ""}" data-symptom="${s.id}">
            <div class="pm-symptom-lead-left">
              <div class="pm-symptom-lead-icon">${getSymptomIcon(s.id, s.region)}</div>
              <div class="pm-symptom-lead-text">${label(s.label)}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="pm-danger-pill">${ICONS.alertTriangle} Red Flag</span>
              ${state.symptoms.has(s.id) ? `<span style="color:var(--clinical-red);">${ICONS.check}</span>` : ""}
            </div>
          </button>
        `).join("")}
      </div>`;
  }

  if (regularList.length > 0) {
    html += `
      <div class="pm-symptom-group-title" style="margin-top:${dangerList.length > 0 ? "14px" : "0"};">
        ${getRegionIcon(state.activeRegion)} <span>Associated Symptoms</span>
      </div>
      <div class="pm-supporting-symptoms-grid">
        ${regularList.map(s => `
          <button class="pm-symptom-card supporting ${state.symptoms.has(s.id) ? "selected" : ""}" data-symptom="${s.id}">
            <div class="pm-symptom-icon-wrap">${getSymptomIcon(s.id, s.region)}</div>
            <span class="pm-symptom-text">${label(s.label)}</span>
          </button>
        `).join("")}
      </div>`;
  }

  container.innerHTML = html;
  container.querySelectorAll("[data-symptom]").forEach(btn => {
    btn.addEventListener("click", () => toggleSymptom(btn.dataset.symptom));
  });
}

function toggleSymptom(id) {
  if (state.symptoms.has(id)) {
    state.symptoms.delete(id);
  } else {
    state.symptoms.add(id);
    speak(label(symptomById[id].label));
  }
  renderSymptomGrid();
  renderTray();
  updateVisuals();
}

function addCustomProblem(text) {
  const clean = (text || "").trim();
  if (!clean) return;
  if (!state.customSymptoms.includes(clean)) {
    state.customSymptoms.push(clean);
  }

  // Check if any catalog keywords match to auto-select relevant catalog symptoms
  const lower = clean.toLowerCase();
  const matched = catalog.symptoms.filter(s =>
    [...(s.keywords[state.lang] || []), ...s.keywords.en].some(k => lower.includes(k.toLowerCase()))
  );
  matched.forEach(s => state.symptoms.add(s.id));
  if (matched.length > 0) {
    state.activeRegion = matched[0].region;
  }

  const statusEl = $("pm-custom-status");
  if (statusEl) {
    statusEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;color:var(--clinical-emerald-text);font-weight:700;">${ICONS.check} <span>${t("custom_added")} "${clean}"</span></span>`;
  }
  speak(`${t("custom_added")} ${clean}`);
  renderTray();
  renderSymptomGrid();
  updateVisuals();
}

function updateVisuals() {
  const svg = $("pm-screen").querySelector(".pm-body-svg");
  if (svg) {
    svg.outerHTML = bodySvg();
    $("pm-screen").querySelectorAll(".pm-body-svg [data-region]").forEach(el => {
      el.addEventListener("click", () => selectRegion(el.dataset.region));
    });
  }
  update3DHighlights();
}

function renderTray() {
  const tray = $("pm-tray");
  if (!tray) return;
  const totalCount = state.symptoms.size + state.customSymptoms.length;
  if (totalCount === 0) {
    tray.innerHTML = `<span class="pm-tray-empty">${t("tray_empty")}</span>`;
    return;
  }

  const symptomChips = [...state.symptoms].map(id => {
    const s = symptomById[id];
    if (!s) return "";
    return `<span class="pm-tray-item ${s.danger ? 'danger' : ''}">${getSymptomIcon(s.id, s.region)} <span>${label(s.label)}</span> <button class="pm-tray-remove-btn" data-remove="${id}" aria-label="remove">${ICONS.x}</button></span>`;
  });
  const customChips = state.customSymptoms.map((text, idx) => {
    return `<span class="pm-tray-item custom">${ICONS.edit} <span>${text}</span> <button class="pm-tray-remove-btn" data-remove-custom="${idx}" aria-label="remove">${ICONS.x}</button></span>`;
  });

  tray.innerHTML = [...symptomChips, ...customChips].join("");
  tray.querySelectorAll("[data-remove]").forEach(b => b.addEventListener("click", () => toggleSymptom(b.dataset.remove)));
  tray.querySelectorAll("[data-remove-custom]").forEach(b => {
    b.addEventListener("click", () => {
      const idx = Number(b.dataset.removeCustom);
      state.customSymptoms.splice(idx, 1);
      renderTray();
      updateVisuals();
    });
  });
}

// --------------------------------------------------------------------------
// Voice input (keyword match against catalogue + custom dictation)
// --------------------------------------------------------------------------
function startListening(SR) {
  const mic = $("pm-mic");
  const heard = $("pm-heard");
  speechSynthesis && speechSynthesis.cancel();
  const rec = new SR();
  rec.lang = SPEECH_LANG[state.lang];
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  mic.classList.add("listening");
  mic.querySelector("span").textContent = t("listening");

  rec.onresult = evt => {
    const text = evt.results[0][0].transcript;
    const lower = text.toLowerCase();
    const matched = catalog.symptoms.filter(s =>
      [...(s.keywords[state.lang] || []), ...s.keywords.en].some(k => lower.includes(k.toLowerCase()))
    );

    if (matched.length === 0) {
      heard.textContent = `${t("heard")} "${text}"`;
      // If no exact catalog match, save as custom symptom!
      addCustomProblem(text);
      return;
    }

    matched.forEach(s => state.symptoms.add(s.id));
    state.activeRegion = matched[0].region;
    heard.textContent = `${t("heard")} "${text}"`;
    speak(`${t("heard")} ${matched.map(s => label(s.label)).join(", ")}. ${t("heard_check")}`);
    selectRegion(state.activeRegion);
    renderTray();
  };

  rec.onerror = evt => {
    heard.textContent = evt.error === "not-allowed"
      ? "Microphone permission was blocked."
      : t("not_understood");
  };
  rec.onend = () => {
    mic.classList.remove("listening");
    mic.querySelector("span").textContent = t("speak");
  };
  rec.start();
}

function startListeningForCustom(SR) {
  const customMic = $("pm-custom-mic");
  const customInp = $("pm-custom-input");
  speechSynthesis && speechSynthesis.cancel();
  const rec = new SR();
  rec.lang = SPEECH_LANG[state.lang];
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  if (customMic) {
    customMic.classList.add("listening");
    customMic.querySelector("span").textContent = t("listening");
  }

  rec.onresult = evt => {
    const text = evt.results[0][0].transcript;
    if (customInp) customInp.value = text;
    addCustomProblem(text);
  };
  rec.onerror = () => {
    if (customMic) {
      customMic.classList.remove("listening");
      customMic.querySelector("span").textContent = t("speak");
    }
  };
  rec.onend = () => {
    if (customMic) {
      customMic.classList.remove("listening");
      customMic.querySelector("span").textContent = t("speak");
    }
  };
  rec.start();
}

// --------------------------------------------------------------------------
// Submit + result
// --------------------------------------------------------------------------
async function submitAssessment() {
  $("pm-screen").innerHTML = `<div class="pm-question" style="display:flex; align-items:center; gap:0.75rem; justify-content:center;">${ICONS.clock} <span>${t("loading")}</span></div>`;
  try {
    const res = await fetch("/api/patient/assess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age_group: state.ageGroup,
        symptom_ids: [...state.symptoms],
        pain_score: state.pain,
        custom_symptoms: state.customSymptoms.join("; "),
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    state.result = await res.json();
    goTo("result");
  } catch (e) {
    console.error(e);
    $("pm-screen").innerHTML = `<div class="pm-result red"><div class="pm-result-text">${t("error")}</div>
      <a class="pm-call-btn" href="tel:108">${ICONS.phone} <span>${t("call")}</span></a></div>`;
    speak(t("error"));
  }
}

function printSlip() {
  const r = state.result;
  const c = r.clinic_summary;
  const badge = RESULT_BADGES[r.color] || RESULT_BADGES.green;
  $("pm-print-slip").innerHTML = `
    <div class="slip-light" style="display:flex; align-items:center; gap:0.5rem; justify-content:center;">
      <span class="slip-badge ${r.color}">[${r.color.toUpperCase()}]</span>
      <span>${badge.title}</span>
    </div>
    <h2>${t(r.color)}</h2>
    <p>${new Date().toLocaleString()} • Token: ${c.slip_code}</p>
    <table>
      <tr><td colspan="2"><strong>For clinic staff</strong> (rule-based triage tool — not a final diagnosis)</td></tr>
      <tr><td>Age group</td><td>${c.age_group}</td></tr>
      <tr><td>Reported symptoms</td><td>${c.symptoms_en.join(", ") || "None"}</td></tr>
      ${c.custom_symptoms ? `<tr><td>Additional patient problem/notes</td><td><strong>${c.custom_symptoms}</strong></td></tr>` : ""}
      <tr><td>Pain (faces scale)</td><td>${c.pain_score} / 10</td></tr>
      <tr><td>Patient advice given</td><td>${r.color.toUpperCase()}</td></tr>
      <tr><td>Engine triage</td><td>${c.esi_category}</td></tr>
      <tr><td>Suggested specialty</td><td>${c.suggested_specialty}</td></tr>
    </table>`;
  window.print();
}

let queuePollTimer = null;
let currentToken = null;

function playCallChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.45);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.5);
    });
  } catch (e) {}
}

async function registerInOpdQueue() {
  try {
    const res = await fetch("/api/queue/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age_group: state.ageGroup,
        symptom_ids: [...state.symptoms],
        pain_score: state.pain,
        triage_color: state.result.color,
        language: state.lang,
        audio_notes: state.lastHeard || "",
        custom_symptoms: state.customSymptoms.join("; "),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      currentToken = data.token_id;
      const tokEl = $("pm-token-id");
      const posEl = $("pm-queue-pos");
      if (tokEl) tokEl.textContent = data.token_id;
      if (posEl) posEl.textContent = data.queue_position;
      startQueuePolling(data.token_id);
    }
  } catch (err) {
    console.error("Queue submission error:", err);
  }
}

function startQueuePolling(tokenId) {
  if (queuePollTimer) clearInterval(queuePollTimer);
  queuePollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/queue/status/${tokenId}`);
      if (!res.ok) return;
      const data = await res.json();

      const posEl = $("pm-queue-pos");
      if (posEl && data.queue_position) posEl.textContent = data.queue_position;

      if (data.status === "called") {
        clearInterval(queuePollTimer);
        handleDoctorCalled(data);
      }
    } catch (e) {
      console.warn("Queue poll error:", e);
    }
  }, 2500);
}

function handleDoctorCalled(data) {
  const room = data.called_room || "Room 2";
  const container = $("pm-called-container");
  if (container) {
    container.innerHTML = `
      <div class="pm-called-banner">
        <span class="pm-called-icon">${ICONS.bell}</span>
        <div class="pm-called-title">${t("called_alert")}</div>
        <div class="pm-called-room">${room}</div>
      </div>`;
  }
  playCallChime();

  let announcement = "";
  if (state.lang === "or") {
    announcement = `ଟୋକନ୍ ${data.token_id}, ଡାକ୍ତର ରାଜେଶ ଆପଣଙ୍କୁ ${room} କୁ ଡାକୁଛନ୍ତି।`;
  } else if (state.lang === "hi") {
    announcement = `टोकन ${data.token_id}, डॉक्टर राजेश आपको ${room} में बुला रहे हैं।`;
  } else if (state.lang === "bn") {
    announcement = `টোকেন ${data.token_id}, ডাক্তার রাজেশ আপনাকে ${room}-এ ডাকছেন।`;
  } else if (state.lang === "ta") {
    announcement = `டோக்கன் ${data.token_id}, டாக்டர் ராஜேஷ் உங்களை ${room}-ல் அழைக்கிறார்.`;
  } else if (state.lang === "te") {
    announcement = `టోకెన్ ${data.token_id}, డాక్టర్ రాజేష్ మిమ్మల్ని ${room} కు పిలుస్తున్నారు.`;
  } else if (state.lang === "mr") {
    announcement = `टोकन ${data.token_id}, डॉक्टर राजेश आपल्याला ${room} मध्ये बोलवत आहेत.`;
  } else if (state.lang === "gu") {
    announcement = `ટોકન ${data.token_id}, ડૉક્ટર રાજેશ તમને ${room} માં બોલાવી રહ્યા છે.`;
  } else {
    announcement = `Token ${data.token_id}, Dr. Rajesh is calling you into ${room}.`;
  }
  speak(announcement, { lang: state.lang });
}

function resetAll() {
  cleanup3D();
  if (queuePollTimer) clearInterval(queuePollTimer);
  currentToken = null;
  state.ageGroup = null;
  state.symptoms.clear();
  state.customSymptoms = [];
  state.pain = null;
  state.result = null;
  state.activeRegion = "chest";
  goTo("lang");
}

// --------------------------------------------------------------------------
// Init
// --------------------------------------------------------------------------
async function init() {
  $("pm-btn-replay").addEventListener("click", () => speak(state.lastSpoken));
  $("pm-btn-home").addEventListener("click", resetAll);
  $("pm-btn-back").addEventListener("click", () => {
    const idx = SCREENS.indexOf(state.screen);
    if (idx > 0) goTo(SCREENS[idx - 1]);
  });
  $("pm-btn-next").addEventListener("click", () => {
    if (state.screen === "where") {
      if (state.symptoms.size === 0 && state.customSymptoms.length === 0) return toast(t("need_one"));
      goTo("pain");
    } else if (state.screen === "pain") {
      if (state.pain === null) return toast(t("need_pain"));
      goTo("confirm");
    }
  });

  if ("speechSynthesis" in window) {
    speechSynthesis.onvoiceschanged = updateVoiceWarning;
  }

  try {
    const res = await fetch("/api/patient/catalog");
    catalog = await res.json();
    catalog.symptoms.forEach(s => { symptomById[s.id] = s; });
  } catch (e) {
    $("pm-question").textContent = "Could not load. If you feel very unwell, call 108.";
    return;
  }
  goTo("lang");
}

document.addEventListener("DOMContentLoaded", init);
