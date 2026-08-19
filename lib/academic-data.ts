export type PublicationStatus =
  | "Published"
  | "Accepted"
  | "Forthcoming"
  | "Submitted"
  | "Preprint"
  | "Work in Progress";

export type PublicationType =
  | "Journal Article"
  | "Preprint"
  | "Conference Paper"
  | "Book Chapter"
  | "Research Note"
  | "Thesis";

export type ResearchNoteStatus = "Draft" | "Public" | "Private" | "Archived";

export type Profile = {
  fullName: string;
  headline: string;
  tagline: string;
  shortBio: string;
  bio: string;
  email: string;
  location: string;
  orcid: string;
  scholarUrl: string;
  githubUrl: string;
  linkedinUrl: string;
  researchStatement: string;
  cvPdfUrl: string;
};

export type ResearchArea = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  keywords: string[];
  active: boolean;
  displayOrder: number;
};

export type Publication = {
  id: string;
  title: string;
  slug: string;
  authors: string;
  publicationYear: number;
  journal: string;
  volume?: string;
  issue?: string;
  pages?: string;
  publisher?: string;
  publicationType: PublicationType;
  status: PublicationStatus;
  abstract: string;
  keywords: string[];
  doi?: string;
  externalUrl?: string;
  pdfUrl?: string;
  arxivUrl?: string;
  repositoryUrl?: string;
  bibtex?: string;
  citation?: string;
  featured: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ResearchNote = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  abstract: string;
  authors: string;
  date: string;
  lastUpdated?: string;
  subject?: string;
  tags: string[];
  status: ResearchNoteStatus;
  content: string;
  references?: string;
  pdfUrl?: string;
  featured: boolean;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  projectType: string;
  status: string;
  technologies: string[];
  organization?: string;
  role?: string;
  problem?: string;
  approach?: string;
  architecture?: string;
  results?: string;
  technicalChallenges?: string;
  githubUrl?: string;
  liveUrl?: string;
  documentationUrl?: string;
  coverImage?: string;
  gallery: string[];
  featured: boolean;
};

export type TeachingEntry = {
  id: string;
  title: string;
  institution: string;
  academicYear: string;
  level: string;
  description: string;
  topics: string[];
  materials: string[];
  status: string;
};

export const profile: Profile = {
  fullName: "Idriss Olivier Bado",
  headline: "Software Engineer • AI / ML Engineer • Mathematician",
  tagline:
    "I build reliable software, AI systems, and data platforms for organizations operating in real-world, low-connectivity, and high-stakes environments.",
  shortBio:
    "Software engineer and applied mathematician with 7+ years building production software, data systems, and AI-driven workflows across West Africa and international teams.",
  bio:
    "Idriss Olivier Bado works at the intersection of software engineering, applied mathematics, data science, and institutional AI. He designs backend systems, full-stack products, analytics platforms, and ML workflows that are grounded in rigor, maintainability, and operational reliability. His experience spans public-sector software, mobile-money systems, industrial data infrastructure, and research-driven analytics.",
  email: "idrissbadoolivier@gmail.com",
  location: "Abidjan, Côte d’Ivoire · Remote-ready",
  orcid: "https://orcid.org/0000-0003-4582-6001",
  scholarUrl: "https://scholar.google.com",
  githubUrl: "https://github.com/idrissbado",
  linkedinUrl: "https://www.linkedin.com/in/idriss-olivier-bado/",
  researchStatement:
    "My work connects mathematical reasoning, machine learning, and software engineering to solve real problems in data, institutions, and decision systems. I focus on explainable AI, statistical rigor, and scalable architecture to build tools that are both technically strong and operationally useful.",
  cvPdfUrl: "/cv/idriss-olivier-bado-cv.pdf",
};

export const researchAreas: ResearchArea[] = [
  {
    id: "area-number-theory",
    title: "Number Theory",
    slug: "number-theory",
    shortDescription:
      "Arithmetic structure, modular identities, and analytic methods that connect classical number theory to computational modeling.",
    longDescription:
      "My work in number theory explores structural questions in arithmetic, identities, and analytic behavior with emphasis on explicit forms, modular patterns, and connections to large-scale data-driven problems.",
    keywords: ["Arithmetic", "Diophantine analysis", "Modular forms"],
    active: true,
    displayOrder: 1,
  },
  {
    id: "area-topology",
    title: "Topology and Geometry",
    slug: "topology-and-geometry",
    shortDescription:
      "Geometric invariants and topological structures that reveal continuity, shape, and stability in complex systems.",
    longDescription:
      "Topology and geometry provide persistent structural language for the study of shape, continuity, and invariance. These tools offer a rigorous basis for understanding information flow, clustering, and regime changes in multiscale systems.",
    keywords: ["Topology", "Homology", "Geometry"],
    active: true,
    displayOrder: 2,
  },
  {
    id: "area-tda",
    title: "Topological Data Analysis",
    slug: "topological-data-analysis",
    shortDescription:
      "Persistent homology and geometric summaries for feature extraction from complex data ecosystems.",
    longDescription:
      "Topological data analysis uses persistence and homology to capture global structure in noisy data. This enables more robust feature engineering and interpretable analysis in scientific and economic settings.",
    keywords: ["Persistent homology", "Feature engineering", "Topology"],
    active: true,
    displayOrder: 3,
  },
  {
    id: "area-probability",
    title: "Probability & Statistics",
    slug: "probability-statistics",
    shortDescription:
      "Statistical inference, summarization, and probabilistic modeling for uncertain, high-dimensional systems.",
    longDescription:
      "Probability and statistics are central to the design of interpretable models, scalable summaries, and robust inference pipelines. I work on deriving analytical and computational procedures that respect uncertainty and structure.",
    keywords: ["Probability", "Inference", "Data summaries"],
    active: true,
    displayOrder: 4,
  },
  {
    id: "area-ml",
    title: "Machine Learning",
    slug: "machine-learning",
    shortDescription:
      "Statistical learning and predictive modeling with a focus on structure-aware, explainable, and rigorous systems.",
    longDescription:
      "Machine learning interests include model design, regime detection, feature engineering, and interpretable modeling for time series and structured data, with an emphasis on scientific validity and robustness.",
    keywords: ["Machine learning", "Feature extraction", "Model validation"],
    active: true,
    displayOrder: 5,
  },
  {
    id: "area-data-eng",
    title: "Data Engineering",
    slug: "data-engineering",
    shortDescription:
      "Data pipelines, platform design, and scalable systems for reliable scientific and operational analytics.",
    longDescription:
      "I design data ecosystems that support research iteration, reproducibility, and decision-making, from ingestion and wrangling to analytics-ready infrastructure.",
    keywords: ["Pipelines", "ETL", "Systems design"],
    active: true,
    displayOrder: 6,
  },
  {
    id: "area-ai",
    title: "Artificial Intelligence",
    slug: "artificial-intelligence",
    shortDescription:
      "AI methods grounded in mathematical structure, reliability, and scientifically interpretable outputs.",
    longDescription:
      "Artificial intelligence work here is concerned with principled systems, explainability, and hybrid methods that combine mathematical structure with practical engineering constraints.",
    keywords: ["AI", "Explainability", "Hybrid modeling"],
    active: true,
    displayOrder: 7,
  },
];

export const publications: Publication[] = [
  {
    id: "pub-graph-statistical-summaries",
    title: "Information Graphs of Statistical Summaries",
    slug: "information-graphs-statistical-summaries",
    authors: "Idriss Olivier Bado",
    publicationYear: 2025,
    journal: "Afrika Statistika",
    volume: "20",
    issue: "1",
    pages: "1-18",
    publisher: "Afrika Statistika",
    publicationType: "Journal Article",
    status: "Published",
    abstract:
      "This article introduces information graphs derived from statistical summaries and studies how structural summaries can be encoded to reveal dependencies and patterns in data-rich systems.",
    keywords: ["information graphs", "statistics", "summaries", "data structure"],
    doi: "10.16929/as/2025.4411.352",
    externalUrl: "https://doi.org/10.16929/as/2025.4411.352",
    pdfUrl: "/pdf/information-graphs-of-statistical-summaries.pdf",
    citation:
      "Bado, I. O. (2025). Information Graphs of Statistical Summaries. Afrika Statistika.",
    featured: true,
    publishedAt: "2025-05-20T00:00:00.000Z",
    createdAt: "2025-05-20T00:00:00.000Z",
    updatedAt: "2025-05-20T00:00:00.000Z",
  },
  {
    id: "pub-topological-feature-engineering",
    title:
      "Topological Feature Engineering and Machine Learning for Economic Regime Detection in Côte d'Ivoire (1960--2022)",
    slug: "topological-feature-engineering-economic-regime-detection-cote-divoire-1960-2022",
    authors: "Idriss Olivier Bado",
    publicationYear: 2026,
    journal: "Preprint",
    publicationType: "Preprint",
    status: "Preprint",
    abstract:
      "This work investigates how topological and statistical features can be used to identify structural economic regimes and detect transitions in the economic history of Côte d'Ivoire.",
    keywords: ["Applied AI", "Topological Data Analysis", "Machine Learning"],
    arxivUrl: "https://arxiv.org",
    pdfUrl: "/pdf/topological-feature-engineering-economic-regimes.pdf",
    featured: true,
    publishedAt: "2026-01-15T00:00:00.000Z",
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
  },
];

export const researchNotes: ResearchNote[] = [
  {
    id: "note-goldbach-reduction",
    title: "Goldbach Reduction Notes",
    slug: "goldbach-reduction",
    subtitle: "A structural reduction for additive decompostion problems",
    abstract:
      "This note studies additive decompositions through a reduction framework and explores structural identities relevant to Goldbach-type questions.",
    authors: "Idriss Olivier Bado",
    date: "2025-03-12T00:00:00.000Z",
    lastUpdated: "2025-06-03T00:00:00.000Z",
    subject: "Number Theory",
    tags: ["Number theory", "Additive combinatorics"],
    status: "Public",
    content: "# Goldbach Reduction Notes\n\nThis is a working mathematical note. Replace the content from the admin system when needed.\n\n$$\n\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}.\n$$\n\nThe key reduction is to translate additive constraints into a structural equation and then analyze the resulting landscapes.\n",
    references: "[1] Hardy, G. H.; Littlewood, J. E. (1923).\n[2] Vinogradov, I. M. (1937).",
    featured: true,
  },
  {
    id: "note-fifth-power-taxicab",
    title: "Fifth Power Taxicab Equation",
    slug: "fifth-power-taxicab-equation",
    subtitle: "A notes-based exploration of higher-order additive identities",
    abstract:
      "This note explores structural identities and computational patterns in the study of fifth-power taxicab-type equations.",
    authors: "Idriss Olivier Bado",
    date: "2026-01-06T00:00:00.000Z",
    subject: "Number Theory",
    tags: ["Taxicab", "Diophantine equations"],
    status: "Public",
    content: "# Fifth Power Taxicab Equation\n\n$$\na^5+b^5=c^5+d^5.\n$$\n\nThis note is intended for serious mathematical exposition and can be edited through the CMS.",
    references: "Hardy and Littlewood; Mordell; modern computational experiments.",
    featured: true,
  },
];

export const projects: Project[] = [
  {
    id: "project-topological-regime-detection",
    title: "Topological Regime Detection for Economic Signals",
    slug: "topological-regime-detection-economic-signals",
    summary:
      "A pipeline combining topological data analysis and machine learning to understand economic transitions and structural regime changes.",
    description:
      "This project develops a complete workflow for extracting robust topological features from economic and temporal data and combining them with predictive and interpretive modeling techniques.",
    projectType: "Machine Learning",
    status: "Active",
    technologies: ["Python", "PyTorch", "scikit-learn", "Topological Data Analysis", "PostgreSQL"],
    organization: "Independent research",
    role: "Lead researcher and engineer",
    problem:
      "Economic time series contain regime changes and nonlinear transitions that are difficult to isolate with conventional indicators alone.",
    approach:
      "Use persistence-based features, statistical summaries, and structured modeling to identify transitions and produce interpretable outputs.",
    architecture:
      "Data ingestion → feature engineering → topology-aware representations → model validation → reporting.",
    results:
      "A reproducible framework for exploring economic structure with explainable machine learning and topological insights.",
    technicalChallenges:
      "Balancing model interpretability with predictive performance and handling noisy, irregular time-series data.",
    githubUrl: "https://github.com",
    liveUrl: "https://example.com",
    documentationUrl: "https://example.com/docs",
    gallery: [],
    featured: true,
  },
  {
    id: "project-knowledge-graph-research-platform",
    title: "Research Knowledge Graph Platform",
    slug: "research-knowledge-graph-platform",
    summary:
      "A content and research platform architected to manage publications, notes, and professional knowledge in one coherent system.",
    description:
      "A database-first, content-rich platform for publishing mathematical notes and research assets with strong editorial control and searchable relationships.",
    projectType: "Software Engineering",
    status: "Completed",
    technologies: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "Neon", "Tailwind CSS"],
    organization: "Independent portfolio",
    role: "Architect and full-stack engineer",
    problem:
      "A serious research website requires structured content modeling, editorial workflows, and a separation between public and private spaces.",
    approach:
      "Develop a database-first content model and private admin interface with a research-oriented public frontend.",
    architecture:
      "Next.js App Router, Prisma models, metadata APIs, protected admin routes, and editorial content management.",
    results:
      "A robust foundation for future publications, notes, and project content across years of research work.",
    technicalChallenges:
      "Maintaining academic rigor in the UX while delivering an efficient authoring environment for complex mathematical content.",
    githubUrl: "https://github.com",
    gallery: [],
    featured: true,
  },
];

export const teachingEntries: TeachingEntry[] = [
  {
    id: "teach-statistics",
    title: "Probability and Statistical Inference",
    institution: "Independent training / research seminars",
    academicYear: "2025-2026",
    level: "Advanced",
    description:
      "A structured course covering probabilistic reasoning, estimation, and statistical modeling with emphasis on mathematical rigor.",
    topics: ["Probability", "Bayes inference", "Sampling", "Model diagnostics"],
    materials: ["Lecture notes", "Exercises"],
    status: "Active",
  },
  {
    id: "teach-tda",
    title: "Topological Data Analysis",
    institution: "Research workshop",
    academicYear: "2025-2026",
    level: "Graduate / research",
    description:
      "An applied and theoretical introduction to persistent homology, feature extraction, and topological summaries.",
    topics: ["Persistent homology", "Data summaries", "Feature engineering"],
    materials: ["Slides", "Reading list"],
    status: "Active",
  },
];

export const siteLinks = [
  { label: "ResearchGate", url: "https://www.researchgate.net/profile/Idriss-Bado", type: "academic" },
  { label: "ORCID", url: "https://orcid.org/0000-0003-4582-6001", type: "academic" },
  { label: "GitHub", url: "https://github.com/idrissbado", type: "code" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/idriss-olivier-bado/", type: "professional" },
];

export const fallbackSearchIndex = [
  ...publications.map((publication) => ({
    label: publication.title,
    href: `/publications/${publication.slug}`,
    type: "Publication",
  })),
  ...researchNotes.map((note) => ({
    label: note.title,
    href: `/notes/${note.slug}`,
    type: "Research note",
  })),
  ...projects.map((project) => ({
    label: project.title,
    href: `/projects/${project.slug}`,
    type: "Project",
  })),
  ...researchAreas.map((area) => ({
    label: area.title,
    href: `/research/${area.slug}`,
    type: "Research area",
  })),
  ...teachingEntries.map((entry) => ({
    label: entry.title,
    href: `/teaching`,
    type: "Teaching",
  })),
];
