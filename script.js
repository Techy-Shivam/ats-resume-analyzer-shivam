const resumeInput = document.querySelector("#resumeText");
const jobInput = document.querySelector("#jobText");
const analyzeButton = document.querySelector("#analyzeButton");
const statusText = document.querySelector("#statusText");
const scoreValue = document.querySelector("#scoreValue");
const scoreGauge = document.querySelector("#scoreGauge");
const scoreLabel = document.querySelector("#scoreLabel");
const scoreSummary = document.querySelector("#scoreSummary");
const metrics = document.querySelector("#metrics");
const suggestions = document.querySelector("#suggestions");
const matchedKeywords = document.querySelector("#matchedKeywords");
const missingKeywords = document.querySelector("#missingKeywords");
const rolePreset = document.querySelector("#rolePreset");
const resumeFile = document.querySelector("#resumeFile");
const loadSample = document.querySelector("#loadSample");
const downloadReport = document.querySelector("#downloadReport");
const menuToggle = document.querySelector("#menuToggle");
const navLinks = document.querySelector("#navLinks");

const circumference = 427;
let latestReport = null;

const stopWords = new Set([
  "about", "above", "across", "after", "again", "against", "also", "among", "and", "are", "as", "at",
  "be", "because", "been", "before", "being", "between", "both", "but", "by", "can", "did", "do",
  "does", "doing", "during", "each", "for", "from", "further", "had", "has", "have", "having", "he",
  "her", "here", "hers", "him", "his", "how", "into", "its", "itself", "job", "more", "most", "must",
  "of", "off", "on", "once", "only", "or", "other", "our", "out", "over", "own", "role", "same",
  "she", "should", "so", "some", "such", "than", "that", "the", "their", "them", "then", "there",
  "these", "they", "this", "those", "through", "to", "under", "until", "up", "very", "was", "we",
  "were", "what", "when", "where", "which", "while", "who", "will", "with", "within", "you", "your"
]);

const roleDescriptions = {
  frontend: `Frontend Developer role requiring React, JavaScript, TypeScript, HTML, CSS, responsive design, REST APIs, accessibility, performance optimization, testing, Git, component architecture, state management, debugging, and collaboration with product and design teams.`,
  backend: `Backend Developer role requiring Node.js, Java, Python, REST APIs, microservices, databases, SQL, MongoDB, authentication, cloud services, Docker, testing, system design, performance optimization, security, Git, and API documentation.`,
  fullstack: `Full Stack Developer role requiring React, JavaScript, TypeScript, Node.js, Express, REST APIs, SQL, MongoDB, HTML, CSS, responsive design, authentication, testing, Git, deployment, debugging, and cross-functional collaboration.`,
  data: `Data Analyst role requiring SQL, Excel, Python, dashboards, Tableau or Power BI, statistical analysis, data cleaning, reporting, stakeholder communication, business insights, KPIs, visualization, and experiment analysis.`,
  datascience: `Data Scientist role requiring Python, SQL, machine learning, statistics, predictive modeling, data cleaning, feature engineering, pandas, scikit-learn, visualization, experimentation, model evaluation, business insights, and stakeholder communication.`,
  marketing: `Digital Marketer role requiring SEO, Google Analytics, paid ads, campaign management, content strategy, email marketing, conversion rate optimization, social media, reporting, A/B testing, and marketing automation.`,
  product: `Product Manager role requiring roadmap planning, user research, analytics, prioritization, stakeholder management, agile delivery, product strategy, requirements, metrics, experimentation, market research, and cross-functional leadership.`,
  uiux: `UI/UX Designer role requiring Figma, wireframes, prototypes, user research, usability testing, design systems, interaction design, visual design, accessibility, information architecture, journey maps, responsive design, and collaboration with product and engineering.`,
  devops: `DevOps Engineer role requiring AWS, Azure or GCP, Docker, Kubernetes, CI/CD, Terraform, Linux, monitoring, incident response, scripting, automation, Git, security, cloud infrastructure, and deployment pipelines.`,
  cybersecurity: `Cybersecurity Analyst role requiring risk assessment, vulnerability management, SIEM, incident response, threat detection, network security, endpoint security, compliance, security monitoring, penetration testing, firewalls, and reporting.`,
  hr: `HR Recruiter role requiring sourcing, screening, interviewing, applicant tracking systems, job postings, stakeholder management, candidate experience, offer coordination, onboarding, HR policies, communication, and recruitment metrics.`,
  finance: `Financial Analyst role requiring Excel, financial modeling, forecasting, budgeting, variance analysis, reporting, dashboards, accounting, data analysis, Power BI, stakeholder communication, valuation, and business planning.`,
  sales: `Sales Executive role requiring lead generation, prospecting, CRM, cold calling, account management, negotiation, pipeline management, revenue targets, client relationships, presentations, closing deals, and sales reporting.`
};

const sampleResume = `Aarav Mehta
Frontend Developer
aarav.mehta@email.com | +91 98765 43210 | linkedin.com/in/aaravmehta | github.com/aaravmehta

Summary
Frontend Developer with 3 years of experience building responsive web applications using React, JavaScript, TypeScript, HTML, CSS, REST APIs, and Git.

Skills
React, JavaScript, TypeScript, HTML, CSS, Redux, REST APIs, Jest, Git, responsive design, accessibility, performance optimization

Experience
Frontend Developer, BrightApps
- Built reusable React components for a customer dashboard used by 20,000 monthly users.
- Improved page load speed by 32% by reducing bundle size and optimizing API calls.
- Partnered with designers and product managers to ship accessible UI patterns.

Associate Developer, CodeWorks
- Created responsive landing pages and internal tools with JavaScript, HTML, and CSS.
- Wrote unit tests with Jest and fixed production bugs across the UI.

Education
B.Tech in Computer Science

Projects
Portfolio Builder: React app with form validation, local storage, and export features.`;

const sampleJob = roleDescriptions.frontend;

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function topKeywords(jobText) {
  const words = tokenize(jobText);
  const phrases = extractPhrases(jobText);
  const counts = new Map();

  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  phrases.forEach((phrase) => counts.set(phrase, (counts.get(phrase) || 0) + 3));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([word]) => word)
    .slice(0, 24);
}

function extractPhrases(text) {
  const normalized = normalize(text);
  const patterns = [
    "a/b testing", "accessibility", "account management", "agile delivery", "api documentation",
    "applicant tracking systems", "business insights", "campaign management", "candidate experience",
    "ci/cd", "cloud infrastructure", "cold calling", "component architecture", "conversion rate optimization",
    "cross-functional", "data analysis", "data cleaning", "design systems", "email marketing",
    "endpoint security", "experiment analysis", "feature engineering", "financial modeling",
    "google analytics", "incident response", "information architecture", "interaction design",
    "lead generation", "machine learning", "market research", "microservices", "paid ads",
    "penetration testing", "performance optimization", "pipeline management", "power bi",
    "predictive modeling", "product strategy", "responsive design", "rest apis", "risk assessment",
    "sales reporting", "security monitoring", "social media", "stakeholder communication",
    "stakeholder management", "state management", "system design", "threat detection", "unit tests",
    "user research", "usability testing", "variance analysis", "visual design", "vulnerability management"
  ];

  return patterns.filter((phrase) => normalized.includes(phrase));
}

function sectionScore(resumeText) {
  const sections = ["experience", "education", "skills", "projects", "summary", "certifications"];
  const found = sections.filter((section) => new RegExp(`\\b${section}\\b`, "i").test(resumeText));
  return { score: Math.min(100, Math.round((found.length / 5) * 100)), found };
}

function impactScore(resumeText) {
  const bulletCount = (resumeText.match(/(^|\n)\s*[-•*]/g) || []).length;
  const numbers = (resumeText.match(/\b\d+[%+]?|\$\d+|\b\d+x\b/gi) || []).length;
  const actionWords = (resumeText.match(/\b(achieved|built|created|delivered|designed|developed|improved|increased|launched|led|managed|optimized|reduced|shipped|streamlined)\b/gi) || []).length;
  const raw = bulletCount * 4 + numbers * 8 + actionWords * 5;
  return Math.min(100, raw);
}

function formatScore(resumeText) {
  let score = 100;
  const penalties = [];

  if (resumeText.length < 1200) {
    score -= 18;
    penalties.push("Resume is likely too short for most ATS scans.");
  }
  if (resumeText.length > 8500) {
    score -= 12;
    penalties.push("Resume text is long; keep it focused for the role.");
  }
  if (!/@/.test(resumeText) || !/\b(?:\+?\d[\d\s().-]{7,})\b/.test(resumeText)) {
    score -= 16;
    penalties.push("Contact details are incomplete or hard to detect.");
  }
  if (/\b(table|text box|header|footer|image|graphic|photo)\b/i.test(resumeText)) {
    score -= 10;
    penalties.push("Avoid tables, text boxes, photos, and graphics in ATS versions.");
  }
  if ((resumeText.match(/\n/g) || []).length < 10) {
    score -= 10;
    penalties.push("Use clear line breaks and section headings.");
  }

  return { score: Math.max(0, score), penalties };
}

function analyze() {
  const resumeText = resumeInput.value.trim();
  const jobText = jobInput.value.trim();

  if (!resumeText || !jobText) {
    statusText.textContent = "Add both resume text and a job description before analyzing.";
    return;
  }

  const keywords = topKeywords(jobText);
  const normalizedResume = normalize(resumeText);
  const matched = keywords.filter((keyword) => normalizedResume.includes(keyword));
  const missing = keywords.filter((keyword) => !normalizedResume.includes(keyword));
  const keywordScore = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
  const sections = sectionScore(resumeText);
  const impact = impactScore(resumeText);
  const formatting = formatScore(resumeText);
  const wordCount = tokenize(resumeText).length;
  const lengthScore = wordCount > 280 && wordCount < 900 ? 100 : wordCount <= 280 ? Math.max(35, Math.round((wordCount / 280) * 100)) : 78;

  const finalScore = Math.round(
    keywordScore * 0.4 +
    sections.score * 0.2 +
    impact * 0.18 +
    formatting.score * 0.14 +
    lengthScore * 0.08
  );
  const category = scoreCategory(finalScore);

  renderScore(finalScore);
  renderMetrics([
    ["Keyword match", keywordScore],
    ["Resume sections", sections.score],
    ["Measurable impact", impact],
    ["ATS formatting", formatting.score],
    ["Resume length", lengthScore]
  ]);
  renderKeywords(matchedKeywords, matched, "No strong matches yet.", false);
  renderKeywords(missingKeywords, missing.slice(0, 16), "No major keyword gaps found.", true);
  const suggestionItems = buildSuggestions({ finalScore, missing, sections, impact, formatting, keywordScore, lengthScore });
  renderSuggestions(suggestionItems);

  latestReport = {
    score: finalScore,
    category,
    metrics: [
      ["Keyword match", keywordScore],
      ["Resume sections", sections.score],
      ["Measurable impact", impact],
      ["ATS formatting", formatting.score],
      ["Resume length", lengthScore]
    ],
    matched,
    missing,
    suggestions: suggestionItems,
    analyzedAt: new Date()
  };
  downloadReport.disabled = false;

  statusText.textContent = `Analyzed ${wordCount.toLocaleString()} resume keywords against ${keywords.length} target terms.`;
}

function scoreCategory(score) {
  if (score >= 90) {
    return {
      label: "Excellent",
      summary: "This resume is highly aligned with the target role. Keep it focused and polish the strongest keywords."
    };
  }
  if (score >= 75) {
    return {
      label: "Good Fit",
      summary: "This resume is aligned with the role. Add a few missing keywords and sharpen measurable achievements."
    };
  }
  if (score >= 55) {
    return {
      label: "Needs Work",
      summary: "This resume has a workable base, but keyword coverage, sections, or proof of impact need improvement."
    };
  }
  return {
    label: "High Risk",
    summary: "This resume may be filtered out by ATS systems. Add role-specific keywords, standard sections, and measurable achievements."
  };
}

function renderScore(score) {
  const offset = circumference - (score / 100) * circumference;
  scoreValue.textContent = score;
  scoreGauge.style.strokeDashoffset = offset;
  const category = scoreCategory(score);
  scoreLabel.textContent = category.label;
  scoreSummary.textContent = category.summary;

  if (score >= 75) {
    scoreGauge.style.stroke = "var(--green)";
  } else if (score >= 55) {
    scoreGauge.style.stroke = "var(--gold)";
  } else {
    scoreGauge.style.stroke = "var(--red)";
  }
}

function renderMetrics(items) {
  metrics.innerHTML = items.map(([label, value]) => `
    <div class="metric">
      <div class="metric-row">
        <strong>${escapeHtml(label)}</strong>
        <span>${value}/100</span>
      </div>
      <div class="bar"><span style="width: ${value}%"></span></div>
    </div>
  `).join("");
}

function renderKeywords(container, words, emptyText, isMissing) {
  if (!words.length) {
    container.innerHTML = `<span class="empty-state">${emptyText}</span>`;
    return;
  }

  container.innerHTML = words
    .map((word) => `<span class="chip ${isMissing ? "missing" : ""}">${escapeHtml(word)}</span>`)
    .join("");
}

function buildSuggestions(data) {
  const items = [];

  if (data.keywordScore < 75 && data.missing.length) {
    items.push({
      title: "Add missing role keywords naturally",
      text: `Work these terms into skills, summary, and experience where truthful: ${data.missing.slice(0, 8).join(", ")}.`
    });
  }
  if (data.sections.score < 80) {
    items.push({
      title: "Use standard ATS section headings",
      text: "Include clear headings such as Summary, Skills, Experience, Education, Projects, and Certifications."
    });
  }
  if (data.impact < 70) {
    items.push({
      title: "Quantify achievements",
      text: "Rewrite bullets with numbers, scale, speed, revenue, users, savings, accuracy, or percentage improvements."
    });
  }
  if (data.formatting.penalties.length) {
    items.push({
      title: "Simplify ATS formatting",
      text: data.formatting.penalties[0]
    });
  }
  if (data.lengthScore < 85) {
    items.push({
      title: "Balance resume length",
      text: "Aim for concise, role-relevant detail. Most resumes work best around one to two pages of focused content."
    });
  }
  if (data.finalScore >= 75) {
    items.push({
      title: "Polish for the final shortlist",
      text: "Mirror the job title, add the most important tools near the top, and keep every bullet tied to business value."
    });
  }

  return items;
}

function renderSuggestions(items) {
  suggestions.innerHTML = items.map(({ title, text }) => `
    <li>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </li>
  `).join("");
}

async function extractResumeText(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (extension === "txt" || file.type === "text/plain") {
    return file.text();
  }

  if (extension === "pdf" || file.type === "application/pdf") {
    if (!window.pdfjsLib) {
      throw new Error("PDF reader is still loading. Please try again in a few seconds.");
    }

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const buffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(" "));
    }

    return pages.join("\n\n");
  }

  if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    if (!window.mammoth) {
      throw new Error("DOCX reader is still loading. Please try again in a few seconds.");
    }

    const buffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  }

  throw new Error("Unsupported file type. Please upload a TXT, PDF, or DOCX resume.");
}

function downloadAtsReport() {
  if (!latestReport) return;

  const report = [
    "ATS Resume Analysis Report",
    "Developed by Shivam Kumar",
    `Generated: ${latestReport.analyzedAt.toLocaleString()}`,
    "",
    `Overall Score: ${latestReport.score}/100`,
    `Category: ${latestReport.category.label}`,
    latestReport.category.summary,
    "",
    "Score Breakdown:",
    ...latestReport.metrics.map(([label, value]) => `- ${label}: ${value}/100`),
    "",
    "Matched Keywords:",
    latestReport.matched.length ? latestReport.matched.join(", ") : "No strong matches found.",
    "",
    "Missing Keywords:",
    latestReport.missing.length ? latestReport.missing.slice(0, 20).join(", ") : "No major gaps found.",
    "",
    "Suggestions:",
    ...latestReport.suggestions.map((item, index) => `${index + 1}. ${item.title}: ${item.text}`),
    "",
    "Copyright © 2026 Shivam Kumar. All rights reserved."
  ].join("\n");

  const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ats-resume-report.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

resumeFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  statusText.textContent = `Reading ${file.name}...`;

  try {
    resumeInput.value = await extractResumeText(file);
    statusText.textContent = `Loaded ${file.name}. Add a job description and run the analyzer.`;
  } catch (error) {
    statusText.textContent = error.message;
  }
});

rolePreset.addEventListener("change", (event) => {
  const value = event.target.value;
  if (value && roleDescriptions[value]) {
    jobInput.value = roleDescriptions[value];
    statusText.textContent = "Role preset loaded. Paste your resume and analyze.";
  }
});

loadSample.addEventListener("click", () => {
  resumeInput.value = sampleResume;
  jobInput.value = sampleJob;
  rolePreset.value = "frontend";
  analyze();
});

analyzeButton.addEventListener("click", analyze);
downloadReport.addEventListener("click", downloadAtsReport);

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

navLinks.addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }
});

renderMetrics([
  ["Keyword match", 0],
  ["Resume sections", 0],
  ["Measurable impact", 0],
  ["ATS formatting", 0],
  ["Resume length", 0]
]);
renderKeywords(matchedKeywords, [], "Run an analysis to see matches.", false);
renderKeywords(missingKeywords, [], "Run an analysis to see gaps.", true);
renderSuggestions(buildSuggestions({
  finalScore: 0,
  missing: ["target tools", "role-specific skills", "measurable outcomes"],
  sections: { score: 0 },
  impact: 0,
  formatting: { penalties: [] },
  keywordScore: 0,
  lengthScore: 0
}));
