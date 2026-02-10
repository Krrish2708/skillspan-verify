export interface DemoCandidate {
  id: string;
  name: string;
  role: string;
  experience: string;
  relevancyScore: number;
  credibilityScore: number;
  skills: {
    name: string;
    score: number;
    confidence: "verified" | "partially_verified" | "unverified";
    evidence: string;
    category: string;
  }[];
  relevancyBreakdown: {
    skillsMatched: string[];
    missingSkills: string[];
    keywordsMatched: string[];
  };
  credibilityBreakdown: {
    educationVerification: { status: string; detail: string };
    certifications: { name: string; status: string; detail: string }[];
    experienceConsistency: { status: string; detail: string };
    projectEvidence: { status: string; detail: string };
  };
  experience_items: { company: string; role: string; duration: string; verified: boolean }[];
  certifications: { name: string; issuer: string; verified: boolean }[];
  risk_flags: string[];
}

export const demoCandidates: DemoCandidate[] = [
  {
    id: "demo-1",
    name: "Priya Sharma",
    role: "Senior Full-Stack Engineer",
    experience: "6 years",
    relevancyScore: 88,
    credibilityScore: 91,
    skills: [
      { name: "React", score: 92, confidence: "verified", evidence: "GitHub repos with 3 production React apps, 1.2k stars combined", category: "framework" },
      { name: "Node.js", score: 85, confidence: "verified", evidence: "Backend services deployed on AWS, referenced in two job roles", category: "programming" },
      { name: "TypeScript", score: 88, confidence: "verified", evidence: "All recent projects use TypeScript, evident from GitHub activity", category: "programming" },
      { name: "PostgreSQL", score: 78, confidence: "partially_verified", evidence: "Mentioned in resume but limited public evidence of advanced usage", category: "database" },
      { name: "AWS", score: 82, confidence: "verified", evidence: "AWS Solutions Architect certification verified, deployment evidence found", category: "cloud" },
      { name: "Docker", score: 75, confidence: "partially_verified", evidence: "Dockerfiles found in repos but no orchestration evidence", category: "devops" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL"],
      missingSkills: ["GraphQL", "Kubernetes"],
      keywordsMatched: ["microservices", "REST API", "CI/CD", "agile", "full-stack"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "B.Tech in Computer Science from IIT Delhi — institution records confirm enrollment (2016–2020)." },
      certifications: [
        { name: "AWS Solutions Architect – Associate", status: "verified", detail: "Certification ID cross-referenced with AWS Credly badge — valid through March 2027." },
      ],
      experienceConsistency: { status: "verified", detail: "LinkedIn timeline matches resume dates. Role progression from Junior to Senior is consistent over 6 years." },
      projectEvidence: { status: "verified", detail: "Three GitHub repositories match claimed projects. Commit history shows sustained contributions over 18+ months." },
    },
    experience_items: [
      { company: "TechCorp India", role: "Senior Full-Stack Engineer", duration: "2022 – Present", verified: true },
      { company: "Innovate Labs", role: "Full-Stack Developer", duration: "2020 – 2022", verified: true },
      { company: "StartupXYZ", role: "Junior Developer", duration: "2018 – 2020", verified: true },
    ],
    certifications: [
      { name: "AWS Solutions Architect – Associate", issuer: "Amazon Web Services", verified: true },
    ],
    risk_flags: ["PostgreSQL expertise claimed at 'expert' level but limited public evidence beyond basic CRUD operations."],
  },
  {
    id: "demo-2",
    name: "James Wilson",
    role: "Data Scientist",
    experience: "4 years",
    relevancyScore: 72,
    credibilityScore: 65,
    skills: [
      { name: "Python", score: 85, confidence: "verified", evidence: "Active Python contributor on GitHub with 40+ commits/month", category: "programming" },
      { name: "Machine Learning", score: 68, confidence: "partially_verified", evidence: "One Kaggle competition (top 15%), but no production ML deployment evidence", category: "general" },
      { name: "TensorFlow", score: 55, confidence: "unverified", evidence: "Listed on resume but no repos, articles, or certifications reference TensorFlow", category: "framework" },
      { name: "SQL", score: 78, confidence: "verified", evidence: "Multiple data pipeline projects with complex SQL queries in public repos", category: "database" },
      { name: "Tableau", score: 62, confidence: "partially_verified", evidence: "Portfolio link shows 3 dashboards but authorship cannot be independently confirmed", category: "general" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Python", "SQL", "Machine Learning"],
      missingSkills: ["Deep Learning", "Spark", "MLOps"],
      keywordsMatched: ["data pipeline", "analytics", "statistical modeling"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "M.Sc. in Statistics from University of Michigan — degree confirmed via alumni records." },
      certifications: [
        { name: "Google Data Analytics Certificate", status: "partially_verified", detail: "Certificate listed but Coursera profile is private — unable to independently verify completion date." },
        { name: "TensorFlow Developer Certificate", status: "unverified", detail: "Low score — certification link missing. No Credly badge or certificate URL provided." },
      ],
      experienceConsistency: { status: "partially_verified", detail: "Two of three roles verified via LinkedIn. Gap of 6 months between roles is unexplained." },
      projectEvidence: { status: "partially_verified", detail: "Kaggle profile active but claimed 'production ML models' have no deployment artifacts or case studies." },
    },
    experience_items: [
      { company: "DataDriven Inc.", role: "Data Scientist", duration: "2022 – Present", verified: true },
      { company: "Analytics Co.", role: "Data Analyst", duration: "2020 – 2021", verified: true },
      { company: "Freelance", role: "ML Consultant", duration: "2019 – 2020", verified: false },
    ],
    certifications: [
      { name: "Google Data Analytics Certificate", issuer: "Google / Coursera", verified: false },
      { name: "TensorFlow Developer Certificate", issuer: "Google", verified: false },
    ],
    risk_flags: [
      "TensorFlow listed as a core skill but zero public evidence of usage.",
      "6-month employment gap between roles is not addressed in resume.",
      "Claims 'production ML deployment' but no artifacts, repositories, or case studies found.",
    ],
  },
  {
    id: "demo-3",
    name: "Maria Garcia",
    role: "UX/UI Designer",
    experience: "5 years",
    relevancyScore: 94,
    credibilityScore: 88,
    skills: [
      { name: "Figma", score: 95, confidence: "verified", evidence: "Figma Community profile with 12 published design systems, 8k+ duplicates", category: "design" },
      { name: "User Research", score: 82, confidence: "verified", evidence: "Published case studies on Medium detailing research methodology with real metrics", category: "general" },
      { name: "Prototyping", score: 90, confidence: "verified", evidence: "Interactive prototypes linked in portfolio match claimed work samples", category: "design" },
      { name: "Design Systems", score: 88, confidence: "verified", evidence: "Open-source design system on GitHub with 600+ stars and active maintenance", category: "design" },
      { name: "HTML/CSS", score: 72, confidence: "partially_verified", evidence: "Some front-end implementations in portfolio but limited code contributions", category: "programming" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Figma", "User Research", "Prototyping", "Design Systems", "HTML/CSS"],
      missingSkills: ["Motion Design"],
      keywordsMatched: ["user-centered design", "wireframing", "accessibility", "design thinking", "stakeholder management"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "BFA in Interaction Design from Savannah College of Art and Design — confirmed." },
      certifications: [
        { name: "Google UX Design Certificate", status: "verified", detail: "Verified via Coursera public profile and shareable certificate link." },
      ],
      experienceConsistency: { status: "verified", detail: "Consistent 5-year trajectory from Junior Designer to Lead UX Designer. All roles verified." },
      projectEvidence: { status: "verified", detail: "Portfolio showcases 8 detailed case studies with measurable outcomes (e.g., '32% improvement in task completion rate')." },
    },
    experience_items: [
      { company: "DesignFirst Agency", role: "Lead UX Designer", duration: "2023 – Present", verified: true },
      { company: "ProductCo", role: "Senior UI/UX Designer", duration: "2021 – 2023", verified: true },
      { company: "CreativeStudio", role: "Junior Designer", duration: "2019 – 2021", verified: true },
    ],
    certifications: [
      { name: "Google UX Design Certificate", issuer: "Google / Coursera", verified: true },
    ],
    risk_flags: [],
  },
  {
    id: "demo-4",
    name: "Alex Chen",
    role: "DevOps Engineer",
    experience: "7 years",
    relevancyScore: 81,
    credibilityScore: 76,
    skills: [
      { name: "Kubernetes", score: 88, confidence: "verified", evidence: "CKA certified, multiple Helm charts in public repos", category: "devops" },
      { name: "Terraform", score: 82, confidence: "verified", evidence: "Open-source Terraform modules with 300+ GitHub stars", category: "devops" },
      { name: "AWS", score: 90, confidence: "verified", evidence: "AWS DevOps Professional certified, evidence of multi-account architecture work", category: "cloud" },
      { name: "Python", score: 65, confidence: "partially_verified", evidence: "Automation scripts found but no substantial software projects", category: "programming" },
      { name: "CI/CD", score: 85, confidence: "verified", evidence: "GitHub Actions and Jenkins pipelines visible in public repositories", category: "devops" },
      { name: "Monitoring", score: 70, confidence: "partially_verified", evidence: "Grafana dashboards mentioned but no public artifacts available", category: "devops" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Python"],
      missingSkills: ["GCP", "Service Mesh"],
      keywordsMatched: ["infrastructure as code", "site reliability", "automation", "cloud-native"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "B.Sc. Computer Engineering from UC Berkeley — verified." },
      certifications: [
        { name: "CKA (Certified Kubernetes Administrator)", status: "verified", detail: "Verified via CNCF registry. Valid through 2027." },
        { name: "AWS DevOps Professional", status: "verified", detail: "Credly badge confirmed. Certification is current." },
      ],
      experienceConsistency: { status: "partially_verified", detail: "Most roles confirmed. Early career role at a now-defunct startup cannot be independently verified." },
      projectEvidence: { status: "verified", detail: "Terraform modules and Kubernetes configs publicly available. Evidence of real infrastructure management." },
    },
    experience_items: [
      { company: "CloudScale Inc.", role: "Senior DevOps Engineer", duration: "2021 – Present", verified: true },
      { company: "InfraTech", role: "DevOps Engineer", duration: "2019 – 2021", verified: true },
      { company: "NovaSoft (defunct)", role: "Systems Administrator", duration: "2017 – 2019", verified: false },
    ],
    certifications: [
      { name: "CKA", issuer: "CNCF", verified: true },
      { name: "AWS DevOps Professional", issuer: "Amazon Web Services", verified: true },
    ],
    risk_flags: ["Early career employer (NovaSoft) is defunct — role cannot be independently verified."],
  },
  {
    id: "demo-5",
    name: "Sarah Johnson",
    role: "Product Manager",
    experience: "8 years",
    relevancyScore: 77,
    credibilityScore: 83,
    skills: [
      { name: "Product Strategy", score: 85, confidence: "verified", evidence: "Published product roadmaps and strategy docs referenced in industry talks", category: "general" },
      { name: "Agile/Scrum", score: 90, confidence: "verified", evidence: "CSM certified, team lead for 3 agile squads confirmed by references", category: "general" },
      { name: "Data Analytics", score: 68, confidence: "partially_verified", evidence: "Claims advanced analytics skills but evidence is limited to basic dashboard usage", category: "general" },
      { name: "Stakeholder Management", score: 88, confidence: "verified", evidence: "Conference talks and LinkedIn endorsements from VP-level stakeholders", category: "soft_skill" },
      { name: "SQL", score: 45, confidence: "unverified", evidence: "Listed as skill but no evidence of query writing or data projects", category: "database" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Product Strategy", "Agile/Scrum", "Stakeholder Management"],
      missingSkills: ["Technical Architecture", "A/B Testing"],
      keywordsMatched: ["roadmap", "KPIs", "cross-functional", "user stories", "market research"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "MBA from Stanford Graduate School of Business — confirmed via alumni directory." },
      certifications: [
        { name: "Certified Scrum Master (CSM)", status: "verified", detail: "Scrum Alliance profile verified. Certification renewed annually." },
      ],
      experienceConsistency: { status: "verified", detail: "Consistent career progression from Associate PM to Director of Product. All roles verified." },
      projectEvidence: { status: "partially_verified", detail: "Product launches mentioned are real products, but her specific contribution level is hard to quantify." },
    },
    experience_items: [
      { company: "BigTech Corp", role: "Director of Product", duration: "2022 – Present", verified: true },
      { company: "GrowthStartup", role: "Senior Product Manager", duration: "2019 – 2022", verified: true },
      { company: "Enterprise Solutions", role: "Product Manager", duration: "2016 – 2019", verified: true },
    ],
    certifications: [
      { name: "Certified Scrum Master", issuer: "Scrum Alliance", verified: true },
    ],
    risk_flags: ["SQL listed as skill but no evidence found — may be aspirational rather than practical."],
  },
  {
    id: "demo-6",
    name: "Raj Patel",
    role: "Mobile Developer",
    experience: "3 years",
    relevancyScore: 69,
    credibilityScore: 42,
    skills: [
      { name: "React Native", score: 58, confidence: "partially_verified", evidence: "One app on Google Play but reviews suggest basic implementation quality", category: "framework" },
      { name: "Swift", score: 35, confidence: "unverified", evidence: "No iOS apps, repos, or certifications found. Claim unsupported.", category: "programming" },
      { name: "JavaScript", score: 72, confidence: "verified", evidence: "Active GitHub profile with JS contributions across 10+ repos", category: "programming" },
      { name: "Firebase", score: 65, confidence: "partially_verified", evidence: "Used in published app but implementation quality unclear", category: "cloud" },
      { name: "Flutter", score: 30, confidence: "unverified", evidence: "Listed on resume but zero public evidence — no repos, apps, or articles", category: "framework" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["React Native", "JavaScript", "Firebase"],
      missingSkills: ["Swift", "Kotlin", "App Store Optimization"],
      keywordsMatched: ["mobile development", "cross-platform"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "partially_verified", detail: "B.Sc. from a recognized university, but graduation year doesn't align with claimed experience timeline." },
      certifications: [
        { name: "Meta React Native Specialization", status: "unverified", detail: "Low score — certification link missing. No Coursera profile found." },
      ],
      experienceConsistency: { status: "unverified", detail: "Claims 3 years of experience but timeline shows only 1.5 years of verifiable employment." },
      projectEvidence: { status: "partially_verified", detail: "One published app found but two other claimed apps don't exist on app stores." },
    },
    experience_items: [
      { company: "MobileFirst LLC", role: "Mobile Developer", duration: "2023 – Present", verified: true },
      { company: "Freelance", role: "App Developer", duration: "2021 – 2023", verified: false },
    ],
    certifications: [
      { name: "Meta React Native Specialization", issuer: "Meta / Coursera", verified: false },
    ],
    risk_flags: [
      "Swift and Flutter listed as skills with zero public evidence.",
      "Experience timeline inconsistency: graduation year vs. claimed experience doesn't add up.",
      "Two of three claimed published apps cannot be found on any app store.",
      "Meta certification link missing — unable to verify.",
    ],
  },
  {
    id: "demo-7",
    name: "Emily Zhang",
    role: "Backend Engineer",
    experience: "5 years",
    relevancyScore: 85,
    credibilityScore: 92,
    skills: [
      { name: "Java", score: 90, confidence: "verified", evidence: "Core contributor to an open-source Java framework with 2k+ stars", category: "programming" },
      { name: "Spring Boot", score: 88, confidence: "verified", evidence: "Multiple Spring Boot microservices in public repos with production-grade patterns", category: "framework" },
      { name: "Microservices", score: 85, confidence: "verified", evidence: "Conference talk on microservice architecture at SpringOne, slides available", category: "general" },
      { name: "Kafka", score: 78, confidence: "verified", evidence: "Event-driven architecture implementations visible in open-source work", category: "general" },
      { name: "Go", score: 60, confidence: "partially_verified", evidence: "A few Go utilities in repos but primary work is Java-focused", category: "programming" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Java", "Spring Boot", "Microservices", "Kafka"],
      missingSkills: ["gRPC"],
      keywordsMatched: ["distributed systems", "event-driven", "API design", "scalability", "performance optimization"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "M.Sc. Computer Science from Carnegie Mellon — verified through official records." },
      certifications: [
        { name: "Oracle Certified Professional, Java SE 17", status: "verified", detail: "Verified via Oracle CertView. Current and valid." },
      ],
      experienceConsistency: { status: "verified", detail: "Consistent 5-year career in backend engineering. All positions verified via LinkedIn and company references." },
      projectEvidence: { status: "verified", detail: "Open-source contributions with sustained commit history. Conference talk confirms deep expertise." },
    },
    experience_items: [
      { company: "FinTech Global", role: "Senior Backend Engineer", duration: "2022 – Present", verified: true },
      { company: "CloudServices Ltd.", role: "Backend Developer", duration: "2020 – 2022", verified: true },
      { company: "TechStartup", role: "Software Engineer", duration: "2019 – 2020", verified: true },
    ],
    certifications: [
      { name: "Oracle Certified Professional, Java SE 17", issuer: "Oracle", verified: true },
    ],
    risk_flags: [],
  },
  {
    id: "demo-8",
    name: "Daniel Kim",
    role: "Cybersecurity Analyst",
    experience: "4 years",
    relevancyScore: 79,
    credibilityScore: 71,
    skills: [
      { name: "Penetration Testing", score: 80, confidence: "verified", evidence: "HackTheBox profile ranked top 5%, Offensive Security lab completions", category: "general" },
      { name: "SIEM Tools", score: 72, confidence: "partially_verified", evidence: "Splunk mentioned in resume, one certification but no hands-on artifacts", category: "general" },
      { name: "Network Security", score: 75, confidence: "verified", evidence: "CTF competition results and write-ups confirm practical knowledge", category: "general" },
      { name: "Python", score: 68, confidence: "partially_verified", evidence: "Security automation scripts on GitHub, basic but functional", category: "programming" },
      { name: "Cloud Security", score: 55, confidence: "unverified", evidence: "Listed on resume but no cloud security certifications or project evidence", category: "cloud" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Penetration Testing", "Network Security", "SIEM Tools", "Python"],
      missingSkills: ["Cloud Security", "Incident Response", "Zero Trust Architecture"],
      keywordsMatched: ["vulnerability assessment", "threat modeling", "compliance", "SOC"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "B.Sc. Cybersecurity from Georgia Tech — confirmed." },
      certifications: [
        { name: "CompTIA Security+", status: "verified", detail: "Verified via CompTIA registry. Active certification." },
        { name: "OSCP", status: "partially_verified", detail: "Claims in-progress but no exam date or Offensive Security student ID provided." },
      ],
      experienceConsistency: { status: "verified", detail: "4-year career in security roles. Timeline is consistent and roles verified." },
      projectEvidence: { status: "partially_verified", detail: "CTF write-ups and HackTheBox activity confirm skills, but enterprise-scale experience evidence is thin." },
    },
    experience_items: [
      { company: "SecureDefend Corp.", role: "Cybersecurity Analyst", duration: "2022 – Present", verified: true },
      { company: "InfoSec Partners", role: "Junior Security Analyst", duration: "2020 – 2022", verified: true },
    ],
    certifications: [
      { name: "CompTIA Security+", issuer: "CompTIA", verified: true },
      { name: "OSCP (in progress)", issuer: "Offensive Security", verified: false },
    ],
    risk_flags: [
      "Cloud Security listed as skill but no supporting evidence found.",
      "OSCP certification claimed as 'in progress' without verification details.",
    ],
  },
  {
    id: "demo-9",
    name: "Olivia Brown",
    role: "Frontend Engineer",
    experience: "3 years",
    relevancyScore: 91,
    credibilityScore: 86,
    skills: [
      { name: "React", score: 88, confidence: "verified", evidence: "5 production React apps with deployed URLs. Clean, component-based architecture.", category: "framework" },
      { name: "TypeScript", score: 85, confidence: "verified", evidence: "All recent repos use strict TypeScript. Type-safe patterns throughout.", category: "programming" },
      { name: "CSS/Tailwind", score: 92, confidence: "verified", evidence: "Stunning portfolio site built with Tailwind. Open-source Tailwind component library.", category: "design" },
      { name: "Next.js", score: 80, confidence: "verified", evidence: "Two Next.js apps deployed on Vercel with ISR and API routes.", category: "framework" },
      { name: "Testing", score: 65, confidence: "partially_verified", evidence: "Some test files in repos but coverage appears limited (<40%).", category: "general" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["React", "TypeScript", "CSS/Tailwind", "Next.js", "Testing"],
      missingSkills: [],
      keywordsMatched: ["responsive design", "web performance", "accessibility", "component library", "SSR"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "B.A. in Digital Media from NYU — confirmed via alumni records." },
      certifications: [],
      experienceConsistency: { status: "verified", detail: "3-year career with clear progression. All employers verified." },
      projectEvidence: { status: "verified", detail: "Portfolio with live deployed projects. GitHub commit frequency is high and consistent." },
    },
    experience_items: [
      { company: "WebAgency Pro", role: "Frontend Engineer", duration: "2023 – Present", verified: true },
      { company: "DigitalCraft", role: "Junior Frontend Developer", duration: "2021 – 2023", verified: true },
    ],
    certifications: [],
    risk_flags: ["Test coverage is low across projects — may indicate gaps in testing discipline."],
  },
  {
    id: "demo-10",
    name: "Michael Torres",
    role: "AI/ML Engineer",
    experience: "5 years",
    relevancyScore: 83,
    credibilityScore: 58,
    skills: [
      { name: "Python", score: 90, confidence: "verified", evidence: "Extensive Python repos with ML pipelines, data processing, and API development.", category: "programming" },
      { name: "PyTorch", score: 75, confidence: "verified", evidence: "Two published papers using PyTorch models. Code available on GitHub.", category: "framework" },
      { name: "LLMs/NLP", score: 70, confidence: "partially_verified", evidence: "Blog posts on fine-tuning but no production deployment evidence.", category: "general" },
      { name: "MLOps", score: 50, confidence: "unverified", evidence: "Claims MLOps expertise but no evidence of MLflow, Kubeflow, or similar tools.", category: "devops" },
      { name: "Spark", score: 40, confidence: "unverified", evidence: "Listed on resume but no repos, projects, or work experience mention Spark.", category: "general" },
      { name: "Computer Vision", score: 82, confidence: "verified", evidence: "Published research paper on object detection with 50+ citations.", category: "general" },
    ],
    relevancyBreakdown: {
      skillsMatched: ["Python", "PyTorch", "Computer Vision", "LLMs/NLP"],
      missingSkills: ["MLOps", "Spark", "Model Serving"],
      keywordsMatched: ["deep learning", "neural networks", "model training", "research"],
    },
    credibilityBreakdown: {
      educationVerification: { status: "verified", detail: "Ph.D. in Computer Science (ML focus) from MIT — confirmed." },
      certifications: [
        { name: "DeepLearning.AI TensorFlow Developer", status: "verified", detail: "Coursera certificate verified via public profile." },
        { name: "AWS Machine Learning Specialty", status: "unverified", detail: "Claimed but no Credly badge or certificate number provided." },
      ],
      experienceConsistency: { status: "partially_verified", detail: "Academic career is well-documented. Industry experience (2 years) has gaps in verification." },
      projectEvidence: { status: "partially_verified", detail: "Research output is strong, but claims of 'production ML systems' lack deployment artifacts." },
    },
    experience_items: [
      { company: "AI Research Lab", role: "ML Engineer", duration: "2023 – Present", verified: true },
      { company: "MIT CSAIL", role: "Research Assistant", duration: "2019 – 2023", verified: true },
      { company: "DataCorp", role: "Data Scientist Intern", duration: "2018 – 2019", verified: false },
    ],
    certifications: [
      { name: "DeepLearning.AI TensorFlow Developer", issuer: "DeepLearning.AI / Coursera", verified: true },
      { name: "AWS Machine Learning Specialty", issuer: "Amazon Web Services", verified: false },
    ],
    risk_flags: [
      "MLOps and Spark listed as skills with no evidence.",
      "AWS ML certification unverified — no badge or certificate link.",
      "Claims 'production ML systems' but artifacts show only research prototypes.",
    ],
  },
];

export function calculateOverallScore(
  relevancy: number,
  credibility: number,
  relevancyWeight: number
): number {
  const credibilityWeight = 100 - relevancyWeight;
  return Math.round((relevancy * relevancyWeight + credibility * credibilityWeight) / 100);
}
