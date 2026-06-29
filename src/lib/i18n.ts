// QuickPrint i18n strings — English / Hindi / Marathi
export type Lang = "en" | "hi" | "mr";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

type Dict = Record<string, { en: string; hi: string; mr: string }>;

export const T: Dict = {
  brand: { en: "QuickPrint", hi: "क्विकप्रिंट", mr: "क्विकप्रिंट" },
  tagline: {
    en: "Scan. Upload. Print.",
    hi: "स्कैन करें. अपलोड करें. प्रिंट करें.",
    mr: "स्कॅन करा. अपलोड करा. प्रिंट करा.",
  },
  uploadTitle: {
    en: "Upload document",
    hi: "दस्तावेज़ अपलोड करें",
    mr: "दस्तऐवज अपलोड करा",
  },
  uploadHint: {
    en: "PDF, images, Word, Excel, PowerPoint and more — up to 50 MB each.",
    hi: "PDF, इमेज, Word, Excel, PowerPoint और अधिक — प्रत्येक 50 MB तक.",
    mr: "PDF, प्रतिमा, Word, Excel, PowerPoint आणि अधिक — प्रत्येकी 50 MB पर्यंत.",
  },
  selectFiles: { en: "Select Files", hi: "फ़ाइल चुनें", mr: "फाइल निवडा" },
  addMore: { en: "Add More Files", hi: "और फ़ाइल जोड़ें", mr: "आणखी फाइल जोडा" },
  filesSelected: {
    en: "files selected",
    hi: "फ़ाइलें चयनित",
    mr: "फाइल्स निवडल्या",
  },
  clearAll: { en: "Clear All", hi: "सब हटाएँ", mr: "सर्व काढा" },
  remove: { en: "Remove", hi: "हटाएँ", mr: "काढा" },
  settings: { en: "Settings", hi: "सेटिंग्स", mr: "सेटिंग्ज" },
  customSettings: {
    en: "Custom Settings",
    hi: "कस्टम सेटिंग्स",
    mr: "कस्टम सेटिंग्ज",
  },
  letShopDecide: {
    en: "Let Shop Decide",
    hi: "दुकान तय करे",
    mr: "दुकान ठरवेल",
  },
  copies: { en: "Copies", hi: "प्रतियाँ", mr: "प्रत" },
  paperSize: { en: "Paper Size", hi: "पेपर साइज", mr: "पेपर साईज" },
  color: { en: "Color Mode", hi: "रंग मोड", mr: "रंग मोड" },
  bw: { en: "B/W", hi: "श्वेत-श्याम", mr: "श्वेत-श्याम" },
  colorOpt: { en: "Color", hi: "रंगीन", mr: "रंगीत" },
  orientation: { en: "Orientation", hi: "दिशा", mr: "दिशा" },
  portrait: { en: "Portrait", hi: "खड़ा", mr: "उभा" },
  landscape: { en: "Landscape", hi: "आड़ा", mr: "आडवा" },
  sides: { en: "Sides", hi: "साइड्स", mr: "साइड्स" },
  single: { en: "Single-sided", hi: "एक तरफ", mr: "एका बाजूने" },
  double: { en: "Double-sided", hi: "दोनों तरफ", mr: "दोन्ही बाजूंनी" },
  fit: { en: "Fit to page", hi: "पेज के अनुसार", mr: "पानानुसार" },
  pages: { en: "Pages to print", hi: "कौन से पेज", mr: "कोणते पेज" },
  pagesHint: {
    en: "e.g. 1-3",
    hi: "उदाहरण: 1-3",
    mr: "उदाहरणः 1-3",
  },
  estCost: {
    en: "Estimated cost",
    hi: "अनुमानित लागत",
    mr: "अंदाजे खर्च",
  },
  estTotal: { en: "Estimated total", hi: "कुल अनुमान", mr: "एकूण अंदाज" },
  send: { en: "Send", hi: "भेजें", mr: "पाठवा" },
  rotateLeft: {
    en: "Rotate left",
    hi: "बाएँ घुमाएँ",
    mr: "डावीकडे फिरवा",
  },
  rotateRight: {
    en: "Rotate right",
    hi: "दाएँ घुमाएँ",
    mr: "उजवीकडे फिरवा",
  },
  uploading: {
    en: "Uploading files…",
    hi: "फ़ाइलें अपलोड हो रही हैं…",
    mr: "फाईल अपलोड होत आहेत…",
  },
  uploadDone: {
    en: "Upload complete. Your files are ready.",
    hi: "अपलोड पूरा हुआ। फ़ाइलें तैयार हैं।",
    mr: "अपलोड पूर्ण झाले. फाइल्स तयार आहेत.",
  },
  scrollHint: {
    en: "Done. Showing your files below.",
    hi: "हो गया। आपकी फ़ाइलें नीचे दिख रही हैं।",
    mr: "झाले. तुमच्या फाइल्स खाली दिसत आहेत.",
  },
  noFiles: {
    en: "Please add at least one file.",
    hi: "कृपया कम से कम एक फ़ाइल जोड़ें।",
    mr: "किमान एक फाइल जोडा.",
  },
  badFile: {
    en: "Some files were skipped — format or size not allowed.",
    hi: "कुछ फ़ाइलें छोड़ दी गईं — फॉर्मेट या आकार अनुमत नहीं।",
    mr: "काही फाइल्स वगळल्या — स्वरूप किंवा आकार अनुमत नाही.",
  },
  cleared: {
    en: "Files cleared.",
    hi: "फ़ाइलें हटा दी गई।",
    mr: "फाइल्स काढल्या.",
  },
  quickDone: {
    en: "Your job is in the queue.",
    hi: "त्वरित प्रिंट कतार में भेज दिया गया।",
    mr: "तुमचा जॉब रांगेत पाठवला आहे.",
  },
  vendorDone: {
    en: "Sent for shop review.",
    hi: "दुकान समीक्षा के लिए भेज दिया गया।",
    mr: "दुकानाच्या पुनरावलोकनासाठी पाठवले.",
  },
  privacyTitle: {
    en: "Privacy Notice",
    hi: "गोपनीयता सूचना",
    mr: "गोपनीयता सूचना",
  },
  privacyBody: {
    en: "The shop owner may need access to your document to help with printing.",
    hi: "प्रिंटिंग में मदद के लिए दुकान मालिक को आपके दस्तावेज़ तक पहुँच की आवश्यकता हो सकती है।",
    mr: "प्रिंटिंगसाठी मदत म्हणून दुकानदाराला तुमच्या दस्तऐवजात प्रवेश आवश्यक असू शकतो.",
  },
  viewConsent: {
    en: "I understand the shop owner may view this document.",
    hi: "मैं समझता/समझती हूँ कि दुकान मालिक इस दस्तावेज़ को देख सकते हैं।",
    mr: "दुकानदार हा दस्तऐवज पाहू शकतो हे मला समजते.",
  },
  downloadPerm: {
    en: "Download permission",
    hi: "डाउनलोड अनुमति",
    mr: "डाउनलोड परवानगी",
  },
  downloadConsent: {
    en: "I allow the shop owner to download this document.",
    hi: "मैं दुकान मालिक को इस दस्तावेज़ को डाउनलोड करने की अनुमति देता/देती हूँ।",
    mr: "दुकानदाराला हा दस्तऐवज डाउनलोड करण्याची मी परवानगी देतो/देते.",
  },
  continueBtn: { en: "Continue", hi: "आगे बढ़ें", mr: "पुढे जा" },
  cancel: { en: "Cancel", hi: "रद्द करें", mr: "रद्द करा" },
  save: { en: "Save", hi: "सहेजें", mr: "जतन करा" },
  jobStatus: { en: "Job status", hi: "जॉब स्टेटस", mr: "जॉब स्टेटस" },
  queued: {
    en: "Your print job is queued",
    hi: "आपका प्रिंट जॉब कतार में है",
    mr: "तुमचा प्रिंट जॉब रांगेत आहे",
  },
  printing: {
    en: "Currently printing",
    hi: "अभी प्रिंट हो रहा है",
    mr: "सध्या प्रिंट होत आहे",
  },
  done: {
    en: "Ready for pickup",
    hi: "पिकअप के लिए तैयार",
    mr: "पिकअपसाठी तयार",
  },
  position: {
    en: "Position in queue",
    hi: "कतार में स्थान",
    mr: "रांगेतील स्थान",
  },
  token: { en: "Token", hi: "टोकन", mr: "टोकन" },
  cancelJob: {
    en: "Cancel job",
    hi: "जॉब रद्द करें",
    mr: "जॉब रद्द करा",
  },
  emptyTitle: {
    en: "Add files to see preview and settings",
    hi: "फ़ाइल जोड़कर पूर्वावलोकन और सेटिंग्स देखें",
    mr: "पूर्वावलोकन व सेटिंग्जसाठी फाइल्स जोडा",
  },
  theme: { en: "Theme", hi: "थीम", mr: "थीम" },
  stepQueued: { en: "Queued", hi: "कतार में", mr: "रांगेत" },
  stepPrinting: { en: "Printing", hi: "प्रिंटिंग", mr: "प्रिंटिंग" },
  stepDone: { en: "Done", hi: "तैयार", mr: "तयार" },
  newJob: {
    en: "Start a new job",
    hi: "नया जॉब शुरू करें",
    mr: "नवीन जॉब सुरू करा",
  },
  shopLink: {
    en: "Shop staff view",
    hi: "दुकान स्टाफ दृश्य",
    mr: "दुकान स्टाफ दृश्य",
  },
};

export function tr(lang: Lang, key: keyof typeof T): string {
  return T[key][lang];
}
