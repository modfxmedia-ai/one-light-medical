/** Designed service pages. Harvested H1s stay exact on live routes. */

export type ServiceStat = {
  value: number;
  suffix: string;
  label: string;
};

export type ServiceStep = {
  title: string;
  copy: string;
};

export type ServiceContent = {
  path: string;
  slug: string;
  kicker: string;
  h1: string;
  lead: string;
  intro: readonly string[];
  understandingTitle: string;
  understanding: readonly string[];
  src: string;
  alt: string;
  tags: readonly string[];
  symptomsTitle: string;
  symptoms: readonly string[];
  whoTitle: string;
  who: readonly string[];
  optionsTitle: string;
  options: readonly string[];
  steps: readonly ServiceStep[];
  stats: readonly ServiceStat[];
  closerTitle: string;
  closer: string;
  related: readonly { href: string; label: string }[];
  extraTitle?: string;
  extra?: readonly string[];
  extraHref?: string;
  extraLabel?: string;
  seoName: string;
  seoDescription: string;
  legacy: boolean;
};

const SHARED_STEPS: readonly ServiceStep[] = [
  {
    title: "Share what you are dealing with",
    copy: "Tell us where it hurts, how long it has been going on, and what you have already tried.",
  },
  {
    title: "Candidacy exam in Amarillo",
    copy: "A clinician reviews your history and exam findings before anyone talks about a product or protocol.",
  },
  {
    title: "A plan, not a one-size offer",
    copy: "If a treatment belongs in your plan, we will say why. If it does not, we will say that too.",
  },
  {
    title: "Clinic-based follow-through",
    copy: "Care happens here with a team you can name, not as a mail-order subscription.",
  },
];

export const SERVICES = {
  "stem-cell": {
    path: "/stem-cell/",
    slug: "stem-cell",
    kicker: "Regenerative",
    h1: "Stem Cell",
    lead: "Stem cell therapy is one regenerative option our clinicians may discuss for joint and soft-tissue concerns in Amarillo, after a candidacy exam, not as a first-line promise.",
    intro: [
      "At One Light Medical, stem cell care sits inside a broader regenerative plan. The goal is an honest path toward comfort and mobility, not a sales pitch from a webpage.",
      "Not every joint is a candidate. If yours is not, we will say so on the consult and help you understand the next step.",
    ],
    understandingTitle: "Stem cell therapy, explained for the consult",
    understanding: [
      "Stem cell therapy is one option we may discuss for pain or reduced mobility in joints and soft tissue, including for patients who are weighing options before surgery.",
      "Care is planned after a consult. We do not offer a one-size protocol, an in-home visit, or a stand-alone outcome promise from a product name alone.",
    ],
    src: "/images/home/card-stem-cells.jpg",
    alt: "A clinician administering a regenerative injection at a patient's knee",
    tags: ["Knee", "Hip", "Shoulder", "Back", "Elbow", "Neck", "Ankle", "Wrist"],
    symptomsTitle: "When we may discuss it",
    symptoms: [
      "Pain or reduced mobility in joints and soft tissue",
      "Patients weighing options before surgery",
      "Active adults whose joints are holding them back",
      "Care planned after a consult, not a one-size protocol",
    ],
    whoTitle: "Who this page is for",
    who: [
      "Adults in and around Amarillo looking for clinic-based regenerative options",
      "People who want an honest candidacy answer before a procedure",
      "Patients who already know surgery is on the table and want another conversation",
    ],
    optionsTitle: "How it fits the plan",
    options: [
      "Reviewed alongside Wharton's Jelly and exosome options when relevant",
      "Paired with complementary care such as SoftWave when the exam supports it",
      "Always optional. The consult decides, not this page",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 8, suffix: "", label: "Joints we may review" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Start with a candidacy exam",
    closer: "Book a consult at One Light Medical in Amarillo. We will help you understand whether stem cell therapy belongs in a plan for your joints and your goals.",
    related: [
      { href: "/whartons-jelly/", label: "Wharton's Jelly" },
      { href: "/why-exosomes/", label: "Why Exosomes" },
      { href: "/knee-pain/", label: "Knee Pain Care" },
    ],
    seoName: "Stem Cell Therapy in Amarillo, TX | One Light Medical",
    seoDescription:
      "Stem cell therapy in Amarillo, TX. One regenerative option we may discuss for joint and soft-tissue concerns after a candidacy exam. Book a consult.",
    legacy: false,
  },
  "whartons-jelly": {
    path: "/whartons-jelly/",
    slug: "whartons-jelly",
    kicker: "Regenerative",
    h1: "Wharton's Jelly",
    lead: "Wharton's Jelly is an umbilical-cord tissue matrix used in some regenerative protocols for its growth factors. Your clinician will explain whether it belongs in your plan.",
    intro: [
      "At One Light Medical, Wharton's Jelly is discussed only when it fits the exam and imaging, and only as part of a broader regenerative plan.",
      "No stand-alone outcome is promised from the product alone. The consult decides what, if anything, is appropriate.",
    ],
    understandingTitle: "What Wharton's Jelly is, in clinic terms",
    understanding: [
      "Wharton's Jelly is an umbilical-cord tissue matrix used in some regenerative protocols. It is sourced and handled under clinic protocols, then considered alongside the rest of your plan.",
      "This is clinician-led care in Amarillo, not a mail-order kit and not a guarantee of regeneration from a product name.",
    ],
    src: "/images/home/card-whartons-jelly.jpg",
    alt: "A clinician administering an injection during a regenerative treatment",
    tags: ["Joints", "Soft tissue", "Recovery", "Mobility"],
    symptomsTitle: "When it may be discussed",
    symptoms: [
      "Discussed only when it fits the exam and imaging",
      "Paired with the rest of your regenerative plan",
      "Sourced and handled under clinic protocols",
      "No stand-alone outcome is promised from the product alone",
    ],
    whoTitle: "Who this page is for",
    who: [
      "Patients already in a regenerative consult at One Light Medical",
      "People comparing tissue-matrix options with stem cell and exosome care",
      "Anyone who wants a clear, clinic-based explanation before deciding",
    ],
    optionsTitle: "How it fits the plan",
    options: [
      "Never sold as a stand-alone miracle product",
      "Considered with stem cell and exosome options when relevant",
      "Skipped entirely when the exam says it is not a fit",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 3, suffix: "", label: "Regenerative pillars" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Ask whether it belongs in your plan",
    closer: "A consult at One Light Medical is the place to review Wharton's Jelly against your joints, your imaging, and your goals.",
    related: [
      { href: "/stem-cell/", label: "Stem Cell" },
      { href: "/why-exosomes/", label: "Why Exosomes" },
      { href: "/softwave-trt-treatment/", label: "Softwave TRT Treatment" },
    ],
    seoName: "Wharton's Jelly in Amarillo, TX | One Light Medical",
    seoDescription:
      "Wharton's Jelly regenerative care in Amarillo, TX. An umbilical-cord tissue matrix we may include after a candidacy exam. Book a consult at One Light Medical.",
    legacy: false,
  },
  "why-exosomes": {
    path: "/why-exosomes/",
    slug: "why-exosomes",
    kicker: "Regenerative",
    h1: "Why Exosomes",
    lead: "Exosomes are signaling vesicles studied for cell-to-cell communication. We present them as one part of regenerative care at One Light Medical, not as a stand-alone treatment promise.",
    intro: [
      "Exosome therapy may be considered alongside stem cell and tissue-matrix options after a candidacy exam.",
      "Always optional. The consult decides, not the webpage. We do not claim a guaranteed outcome from signaling support alone.",
    ],
    understandingTitle: "Why we talk about exosomes",
    understanding: [
      "Exosomes are signaling vesicles studied for cell-to-cell communication. At One Light Medical they are framed as support inside a broader regenerative plan, aimed at the body's own signaling rather than replacing a workup.",
      "Your clinician reviews them against your history and goals in clinic. If they do not belong, we will say so.",
    ],
    src: "/images/home/card-exosomes.webp",
    alt: "A person holding their shoulder, representing joint discomfort regenerative care can address",
    tags: ["Cellular signaling", "Recovery", "Resilience", "Soft tissue"],
    symptomsTitle: "When they may be considered",
    symptoms: [
      "Considered alongside stem cell and tissue-matrix options",
      "Aimed at supporting the body's own signaling, not replacing a workup",
      "Reviewed against your history and goals in clinic",
      "Always optional, the consult decides, not the webpage",
    ],
    whoTitle: "Who this page is for",
    who: [
      "Patients comparing regenerative options in Amarillo",
      "People who want signaling support explained without hype",
      "Anyone already discussing stem cell or Wharton's Jelly care",
    ],
    optionsTitle: "How it fits the plan",
    options: [
      "Never positioned as a stand-alone cure",
      "Paired with the rest of your regenerative consult",
      "Skipped when it is not a fit for your exam",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 3, suffix: "", label: "Regenerative pillars" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Get a clear answer on exosomes",
    closer: "Book a consult in Amarillo. We will explain whether exosome therapy belongs beside other regenerative options in your plan.",
    related: [
      { href: "/stem-cell/", label: "Stem Cell" },
      { href: "/whartons-jelly/", label: "Wharton's Jelly" },
      { href: "/knee-pain/", label: "Knee Pain Care" },
    ],
    seoName: "Why Exosomes | Regenerative Care in Amarillo, TX",
    seoDescription:
      "Why exosomes may be part of regenerative care in Amarillo, TX. Signaling support discussed after a candidacy exam at One Light Medical, not as a stand-alone promise.",
    legacy: false,
  },
  "knee-pain": {
    path: "/knee-pain/",
    slug: "knee-pain",
    kicker: "Joints",
    h1: "Knee Pain",
    lead: "Stop letting sore joints slow you down. We use a holistic and nonsurgical approach to help restore your knee movement naturally in Amarillo, TX.",
    intro: [
      "At One Light Medical, we provide comprehensive care to knee and joint pain patients. Our approach is designed to alleviate your pain and address the underlying causes that may be contributing to your discomfort.",
      "Located in Amarillo, TX, we are dedicated to helping our patients reduce or even eliminate knee pain within a few short weeks, all without relying on long-term medication or invasive surgery. Our goal is to enhance your quality of life through targeted, effective treatment plans that promote natural healing and long-lasting relief.",
    ],
    understandingTitle: "Knee Pain Treatment",
    understanding: [
      "At One Light Medical, we believe in a holistic and non-surgical approach to treating knee pain. Our specialised treatments aim to reduce pain and address the root causes of discomfort, helping you regain your mobility and quality of life.",
      "Anyone suffering from knee pain or joint discomfort can benefit from our treatments. Whether your pain is due to injury, arthritis, or wear and tear, our tailored approach aims to help you achieve lasting relief without the need for surgery or long-term medications.",
    ],
    src: "/images/cards/knee-pain.webp",
    alt: "A patient holding their knee",
    tags: ["Chronic pain", "Stiffness", "Mobility", "Arthritis"],
    symptomsTitle: "Common symptoms and conditions",
    symptoms: ["Chronic knee pain", "Joint stiffness", "Limited mobility", "Inflammation", "Arthritis"],
    whoTitle: "Who benefits?",
    who: [
      "Anyone suffering from knee pain or joint discomfort",
      "Pain due to injury, arthritis, or wear and tear",
      "Patients looking for non-surgical, clinic-based care in Amarillo",
    ],
    optionsTitle: "Treatment options we may discuss",
    options: [
      "Viscosupplementation: a gel-like substance used to lubricate the joint and relieve pain",
      "Plasma and regenerative cell therapy, using the body's own cells to support damaged tissue",
      "Stem cell, Wharton's Jelly, SoftWave, and other regenerative options when the exam supports them",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 5, suffix: "", label: "Knee concerns we review" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Take the first step on your healing journey",
    closer: "Don't let knee pain hold you back any longer. Contact One Light Medical today to schedule your consultation and discover how our comprehensive approach can help you live more comfortably.",
    related: [
      { href: "/stem-cell/", label: "Stem Cell" },
      { href: "/softwave-trt-treatment/", label: "Softwave TRT Treatment" },
      { href: "/weight-loss/", label: "Weight Loss & Red Light Therapy" },
    ],
    seoName: "Knee Pain Treatment in Amarillo, TX | One Light Medical",
    seoDescription:
      "Stop letting sore joints slow you down. We use a holistic and nonsurgical approach to help restore your knee movement naturally. Visit us in Amarillo, TX today!",
    legacy: true,
  },
  neuropathy: {
    path: "/neuropathy/",
    slug: "neuropathy",
    kicker: "Nerves",
    h1: "Neuropathy",
    lead: "Tired of numbness and tingling? Try our peripheral neuropathy care in Amarillo, TX to improve blood flow and nerve function.",
    intro: [
      "At One Light Medical, we offer advanced programs designed to help you combat the challenges of neuropathy. If you're dealing with burning pain, tingling, numbness, or even a loss of feeling, we encourage you to reach out to our office today.",
      "Located in Amarillo, TX, our dedicated doctors will meet with you to determine if you're a good candidate for our care. It's a great day to begin your journey to a more comfortable life.",
    ],
    understandingTitle: "Neuropathy Care",
    understanding: [
      "Neuropathy can significantly impact your daily life, leading to symptoms like burning pain, tingling, and numbness, particularly in your hands and feet. At One Light Medical, we focus on holistic care to address these symptoms and help restore your quality of life.",
      "Anyone suffering from neuropathy symptoms can benefit from our specialized care. Whether your symptoms are mild or severe, our treatments aim to alleviate pain and improve your overall well-being.",
    ],
    src: "/images/cards/neuropathy.webp",
    alt: "Hands representing neuropathy symptoms",
    tags: ["Burning pain", "Tingling", "Numbness", "Weakness"],
    symptomsTitle: "Common symptoms and conditions",
    symptoms: [
      "Burning pain",
      "Tingling in hands or feet",
      "Numbness",
      "Muscle weakness",
      "Sharp, jabbing pain",
    ],
    whoTitle: "Who benefits?",
    who: [
      "Anyone suffering from neuropathy symptoms",
      "Mild or severe burning, tingling, or numbness",
      "Patients who want a candidacy exam before a care plan",
    ],
    optionsTitle: "Treatment options",
    options: [
      "Personalized care plans",
      "Non-invasive therapies",
      "Pain management techniques",
      "Lifestyle and nutritional guidance",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 5, suffix: "", label: "Symptoms we review" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Take the first step on your journey to wellness",
    closer: "If you're experiencing symptoms of neuropathy, now is the time to take action. Contact One Light Medical today to schedule a consultation.",
    related: [
      { href: "/spinal-decompression/", label: "Spinal Decompression" },
      { href: "/softwave-trt-treatment/", label: "Softwave TRT Treatment" },
      { href: "/stem-cell/", label: "Stem Cell" },
    ],
    seoName: "Neuropathy Treatment in Amarillo, TX | One Light Medical",
    seoDescription:
      "Tired of numbness and tingling? Try our peripheral neuropathy care in Amarillo, TX to improve blood flow and nerve function. Contact us to get started.",
    legacy: true,
  },
  "spinal-decompression": {
    path: "/spinal-decompression/",
    slug: "spinal-decompression",
    kicker: "Spine",
    h1: "Spinal Decompression",
    lead: "Ease back pain with our spinal decompression therapy in Amarillo, TX. This gentle stretching helps heal bulging discs and pinched nerves.",
    intro: [
      "At One Light Medical, we offer advanced spinal decompression therapy for patients suffering from chronic back, neck, and disc-related pain. Our non-invasive treatments not only relieve pressure on the spine but also address the underlying causes of your discomfort, helping you achieve long-term relief and enhanced mobility.",
      "Located in Amarillo, TX, we specialize in holistic, drug-free solutions like spinal decompression, soft tissue therapy, and corrective exercises. These treatments work together to naturally reduce pain, promote disc healing, and restore your quality of life.",
    ],
    understandingTitle: "Spinal decompression for lasting pain relief",
    understanding: [
      "At One Light Medical, we offer spinal decompression therapy to help patients suffering from chronic back pain, herniated discs, and sciatica. This non-invasive, FDA-approved treatment gently stretches the spine, relieving pressure on discs and nerves, promoting natural healing, and providing long-term pain relief.",
      "Our program is built around experienced practitioners, non-surgical solutions, and a plan tailored to your condition and goals for pain relief and mobility.",
    ],
    src: "/images/home/card-spinal-decompression.webp",
    alt: "A practitioner assessing a patient's spine",
    tags: ["Herniated discs", "Sciatica", "Neck pain", "Pinched nerves"],
    symptomsTitle: "Common symptoms and conditions",
    symptoms: [
      "Herniated or bulging discs",
      "Sciatica and nerve pain",
      "Degenerative disc disease",
      "Facet joint syndrome",
      "Chronic lower back or neck pain",
      "Radiculopathy (pinched nerves)",
      "Post-surgical pain relief",
    ],
    whoTitle: "Who benefits?",
    who: [
      "Chronic back pain due to herniated discs or sciatica",
      "Degenerative disc disease or other spine-related conditions",
      "Individuals seeking a non-surgical, drug-free solution for their pain",
    ],
    optionsTitle: "What the plan may support",
    options: [
      "Reduced nerve pain and pressure",
      "Improved disc health and mobility",
      "Enhanced natural healing processes",
      "Long-term relief without surgery or medications",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 7, suffix: "", label: "Spine concerns we review" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Take the first step toward more comfortable living",
    closer: "Don't let back pain control your life. Contact One Light Medical today to schedule your spinal decompression consultation.",
    related: [
      { href: "/neuropathy/", label: "Neuropathy" },
      { href: "/softwave-trt-treatment/", label: "Softwave TRT Treatment" },
      { href: "/stem-cell/", label: "Stem Cell" },
    ],
    seoName: "Spinal Decompression in Amarillo, TX | One Light Medical",
    seoDescription:
      "Ease back pain with our spinal decompression therapy in Amarillo, TX. This gentle stretching helps heal bulging discs and pinched nerves. Book a session now!",
    legacy: true,
  },
  "softwave-trt-treatment": {
    path: "/softwave-trt-treatment/",
    slug: "softwave-trt-treatment",
    kicker: "Tissue",
    h1: "Softwave TRT Treatment",
    lead: "Discover SoftWave therapy for stubborn joint issues. This procedure is used to stimulate deep tissue repair at our Amarillo clinic.",
    intro: [
      "At One Light Medical, we specialize in providing advanced SoftWave TRT treatments for patients suffering from knee and joint pain. This innovative therapy not only helps alleviate pain but also stimulates the body's natural healing processes, targeting the root causes of your discomfort.",
      "Located in Amarillo, TX, we are committed to offering non-invasive, drug-free solutions like SoftWave TRT that promote tissue regeneration and long-lasting relief.",
    ],
    understandingTitle: "Revolutionizing pain relief with SoftWave TRT",
    understanding: [
      "At One Light Medical, we are proud to offer SoftWave Tissue Regeneration Technology (TRT), a treatment designed to naturally alleviate knee and joint pain. This non-invasive, FDA-cleared therapy stimulates healing and promotes long-term relief, all without surgery or medications.",
      "We may combine SoftWave TRT with other regenerative therapies, including plasma and regenerative cell therapy, when the exam supports that pairing.",
    ],
    src: "/images/home/card-softwave-therapy.webp",
    alt: "Close-up of a practitioner's hands",
    tags: ["Knee pain", "Arthritis", "Tendonitis", "Recovery"],
    symptomsTitle: "Common symptoms and conditions",
    symptoms: [
      "Knee pain from injuries or arthritis",
      "Joint stiffness and inflammation",
      "Chronic pain that limits mobility",
      "Tendonitis and ligament injuries",
      "Post-surgical recovery and scar tissue",
    ],
    whoTitle: "Who can benefit from SoftWave TRT?",
    who: [
      "Looking for a non-invasive alternative to surgery",
      "Suffering from arthritis, tendonitis, or joint degeneration",
      "Requiring post-surgical recovery support",
      "Seeking natural pain relief without long-term medication dependency",
    ],
    optionsTitle: "How SoftWave TRT works",
    options: [
      "Increased blood flow to accelerate tissue repair",
      "Reduced inflammation for quicker relief",
      "Pain reduction by targeting damaged tissues",
      "Cell regeneration to restore damaged areas",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 5, suffix: "", label: "Joint concerns we review" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Take control of your pain today",
    closer: "You don't have to live with knee or joint pain. Contact One Light Medical today to learn more about how SoftWave TRT may fit a plan for your recovery.",
    related: [
      { href: "/knee-pain/", label: "Knee Pain Care" },
      { href: "/stem-cell/", label: "Stem Cell" },
      { href: "/spinal-decompression/", label: "Spinal Decompression" },
    ],
    seoName: "Softwave TRT Treatment in Amarillo, TX | One Light Medical",
    seoDescription:
      "Discover the benefits of SoftWave therapy for stubborn joint issues. This procedure safely stimulates deep tissue repair. Visit our Amarillo for more details!",
    legacy: true,
  },
  "weight-loss": {
    path: "/weight-loss/",
    slug: "weight-loss",
    kicker: "Metabolism",
    h1: "Weight Loss",
    lead: "Start your journey with our medical weight loss program in Amarillo, TX. We offer a clear plan to help you shed pounds safely, now paired with red light therapy when it belongs in the plan.",
    intro: [
      "At One Light Medical, we believe that achieving a healthy weight goes beyond just numbers on a scale, it's about transforming your overall health and quality of life. Our weight loss program is designed to help you reach your goals safely and sustainably through a personalized, medically guided approach.",
      "We understand that every individual's weight loss journey is unique. That's why we focus on uncovering the root causes of weight challenges and crafting customized plans that address your specific needs.",
    ],
    understandingTitle: "Weight Loss",
    understanding: [
      "Weight loss is more than a cosmetic goal; it's a journey toward improved health and vitality. Factors such as metabolism, hormonal imbalances, lifestyle habits, and medical conditions can all play a role in weight gain and the challenges of losing weight.",
      "At One Light Medical, we approach weight loss with a focus on understanding these underlying causes, ensuring that every treatment plan is tailored to meet your specific needs. By addressing the root issues and offering ongoing support, we help you achieve results that are not only effective but sustainable.",
    ],
    src: "/images/home/card-red-light-therapy.webp",
    alt: "A red light therapy bed used alongside medically guided weight-loss care",
    tags: ["Medically guided", "Red light", "Energy", "Joints"],
    symptomsTitle: "Common symptoms and conditions",
    symptoms: ["Fatigue", "Joint pain", "Digestive issues", "Chronic conditions", "Emotional strain"],
    whoTitle: "Who benefits?",
    who: [
      "Individuals struggling with stubborn weight",
      "Patients with weight-related conditions like prediabetes or sleep apnea",
      "Those seeking a medically guided, lasting solution",
      "Anyone wanting to improve health, energy, and quality of life",
    ],
    optionsTitle: "Treatment options",
    options: [
      "Customized nutrition plans",
      "Behavioral coaching",
      "Medical weight loss solutions",
      "Exercise recommendations",
      "Ongoing monitoring and support",
      "Red light therapy when it fits beside the plan",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 2, suffix: "", label: "Paired offerings" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    extraTitle: "Paired with red light therapy",
    extra: [
      "Red Light Therapy is a non-invasive treatment that uses specific wavelengths of red and near-infrared light. At One Light Medical it can sit beside a medically guided weight-loss plan to support comfort, recovery, and cellular activity.",
      "Whether you are managing joint discomfort while you lose weight or looking for a gentle adjunct to recovery, your clinician will tell you if a red light session belongs in the same plan.",
    ],
    extraHref: "/red-light-therapy/",
    extraLabel: "Read about Red Light Therapy",
    closerTitle: "Ready to take the next step toward a healthier you?",
    closer: "At One Light Medical, we're here to make your journey to wellness smooth, supportive, and effective. Whether you're managing pain, pursuing weight loss, or exploring red light therapy, our dedicated team is ready to guide you.",
    related: [
      { href: "/red-light-therapy/", label: "Red Light Therapy" },
      { href: "/knee-pain/", label: "Knee Pain Care" },
      { href: "/stem-cell/", label: "Stem Cell" },
    ],
    seoName: "Doctor-Supervised Weight Loss Clinic in Amarillo, TX",
    seoDescription:
      "Start your journey with our medical weight loss program in Amarillo, TX. We offer a clear plan to help you shed pounds safely. Reach out to get started.",
    legacy: true,
  },
  "red-light-therapy": {
    path: "/red-light-therapy/",
    slug: "red-light-therapy",
    kicker: "Recovery",
    h1: "Red Light Therapy",
    lead: "Boost cell repair with low-level light therapy in Amarillo, TX. This gentle method is used to reduce swelling and help targeted tissues.",
    intro: [
      "At One Light Medical, we offer Red Light Therapy, an advanced, non-invasive treatment designed to enhance your body's natural healing processes and improve overall wellness. Using specific wavelengths of light, this therapy stimulates cellular activity to promote healing, reduce inflammation, and provide pain relief.",
      "Whether you're looking to manage chronic pain, improve your skin, support weight loss, or accelerate muscle recovery, Red Light Therapy is discussed as part of a clinic plan, including beside medically guided weight loss.",
    ],
    understandingTitle: "Understanding red light therapy",
    understanding: [
      "Red Light Therapy (RLT) is a non-invasive treatment that uses specific wavelengths of red and near-infrared light to stimulate the body's natural healing processes. By penetrating the skin and tissues, it enhances cellular energy production, reduces inflammation, and promotes tissue regeneration.",
      "This therapy is used for pain relief, muscle recovery, skin rejuvenation, and overall wellness. RLT harnesses the body's innate ability to heal, and your clinician will tell you whether a targeted or full-body session belongs in your plan.",
    ],
    src: "/images/home/card-red-light-therapy.webp",
    alt: "A red light therapy bed at One Light Medical",
    tags: ["Chronic pain", "Recovery", "Circulation", "Wellness"],
    symptomsTitle: "Common symptoms and conditions",
    symptoms: [
      "Chronic pain and inflammation",
      "Skin issues",
      "Muscle and joint recovery",
      "Poor circulation",
      "Sleep and mood concerns",
    ],
    whoTitle: "Who benefits?",
    who: [
      "People with chronic pain",
      "Athletes and active individuals",
      "Individuals with skin concerns",
      "Those with poor circulation",
      "Anyone seeking overall wellness support",
    ],
    optionsTitle: "Treatment options",
    options: [
      "Targeted therapy for specific pain, skin issues, or muscle recovery",
      "Full-body sessions for circulation, energy, and skin health",
      "Combination therapy with medically guided weight loss",
    ],
    steps: SHARED_STEPS,
    stats: [
      { value: 30, suffix: "+", label: "Years in practice" },
      { value: 3, suffix: "", label: "Session styles" },
      { value: 1, suffix: "", label: "Amarillo clinic" },
    ],
    closerTitle: "Ready to take the next step toward a healthier you?",
    closer: "We offer an integrative approach with Red Light Therapy to support healing, comfort, and overall wellness. Start your journey at One Light Medical in Amarillo.",
    related: [
      { href: "/weight-loss/", label: "Weight Loss" },
      { href: "/softwave-trt-treatment/", label: "Softwave TRT Treatment" },
      { href: "/knee-pain/", label: "Knee Pain Care" },
    ],
    seoName: "Red Light Therapy in Amarillo, TX | One Light Medical",
    seoDescription:
      "Boost cell repair with low-level light therapy in Amarillo, TX. This gentle method reduces swelling and helps heal targeted tissues. Book your session now.",
    legacy: true,
  },
} as const satisfies Record<string, ServiceContent>;

export type ServiceSlug = keyof typeof SERVICES;

export function getService(slug: string): ServiceContent | undefined {
  return SERVICES[slug as ServiceSlug];
}
