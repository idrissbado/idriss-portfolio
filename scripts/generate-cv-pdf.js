const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outputDir = path.join(__dirname, '..', 'public', 'cv');
const outputPath = path.join(outputDir, 'idriss-olivier-bado-cv.pdf');

fs.mkdirSync(outputDir, { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 52, right: 52 },
  info: {
    Title: 'Idriss Olivier Bado CV',
    Author: 'Idriss Olivier Bado',
    Subject: 'Curriculum Vitae',
  },
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

const navy = '#1B2A4A';
const teal = '#0D6E6E';
const steel = '#2E5FA3';
const grey = '#555555';
const lightGrey = '#666666';
const bg = '#EAF1FB';

// Header block
const headerHeight = 110;
doc.fillColor(navy).rect(52, 40, 500, headerHeight).fill();

doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(22).text('IDRISS OLIVIER BADO', 72, 62, { width: 350 });

doc.fillColor('#A8CAEC').font('Helvetica-Oblique').fontSize(10).text('Software Engineer • AI / ML Engineer • Mathematician', 72, 90, { width: 420 });

doc.fillColor('#D8E8F8').font('Helvetica').fontSize(8).text('Abidjan, Côte d\'Ivoire  •  +225 07 58 40 91 36  •  idrissbadoolivier@gmail.com', 72, 108, { width: 420 });

doc.fillColor(steel).rect(552, 40, 90, headerHeight).fill();
doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10).text('REMOTE', 570, 70, { align: 'center', width: 60 });
doc.fontSize(9).text('READY', 570, 90, { align: 'center', width: 60 });

doc.moveDown(3);

// Profile

doc.fillColor(navy).font('Helvetica-Bold').fontSize(14).text('PROFESSIONAL PROFILE', { underline: false });
doc.moveTo(52, 178).lineTo(545, 178).strokeColor('#B0C4DE').lineWidth(1).stroke();
doc.moveDown(0.5);

doc.fillColor(grey).font('Helvetica').fontSize(10).text(
  'Software engineer and applied mathematician with 7+ years building and shipping production software, data systems, and AI-driven workflows across West Africa. I develop full-stack and backend applications with React, Python, and PostgreSQL, and I design systems that remain reliable in low-connectivity and high-stakes environments.',
  { align: 'justify', width: 490 }
);

doc.moveDown(0.8);
doc.text(
  'I work comfortably in cross-functional Agile teams and use AI coding tools to move faster without compromising quality. My research background sharpens my problem-solving abilities in system design, statistical reasoning, debugging, and data modeling.',
  { align: 'justify', width: 490 }
);

// Expertise
const startY = 250;
doc.fillColor(navy).font('Helvetica-Bold').fontSize(14).text('TECHNICAL EXPERTISE', 52, startY);
doc.moveTo(52, startY + 16).lineTo(545, startY + 16).strokeColor('#B0C4DE').lineWidth(1).stroke();

const expertise = [
  { heading: 'Frontend & Mobile', items: ['React, TypeScript, Next.js', 'Responsive UI systems', 'Offline-first applications', 'REST API integration'] },
  { heading: 'Backend & Data', items: ['Python (FastAPI, Flask)', 'PostgreSQL, SQL, data modeling', 'Event-driven workflows', 'Payments and document automation'] },
  { heading: 'Cloud & DevOps', items: ['AWS, GCP', 'Docker, CI/CD', 'Git, testing, IaC', 'Kubernetes and Linux operations'] },
  { heading: 'AI & ML', items: ['LLMs, RAG, document assistants', 'ETL, analytics pipelines', 'Forecasting and anomaly detection', 'AI coding tooling'] }
];

const colWidth = 220;
let x = 52;
let y = startY + 30;
for (let i = 0; i < expertise.length; i += 1) {
  const col = expertise[i];
  const maxHeight = 80;

  doc.fillColor(teal).font('Helvetica-Bold').fontSize(9).text(col.heading.toUpperCase(), x, y, { width: colWidth });
  y += 14;
  doc.fillColor(grey).font('Helvetica').fontSize(8.5);
  col.items.forEach((item) => {
    doc.text(`• ${item}`, x, y, { width: colWidth });
    y += 12;
  });

  y = startY + 30;
  x += colWidth + 26;
  if (x > 300) {
    x = 52;
    y = startY + 110;
  }
}

// Experience
const expY = 410;
doc.fillColor(navy).font('Helvetica-Bold').fontSize(14).text('PROFESSIONAL EXPERIENCE', 52, expY);
doc.moveTo(52, expY + 16).lineTo(545, expY + 16).strokeColor('#B0C4DE').lineWidth(1).stroke();

doc.fillColor(navy).font('Helvetica-Bold').fontSize(10).text('Senior Software Engineer', 52, expY + 26);
doc.fillColor(lightGrey).font('Helvetica').fontSize(9).text('Ceiba-Analytics', 250, expY + 26);
doc.fillColor(lightGrey).font('Helvetica-Oblique').fontSize(8.5).text('Mar 2026 – Present', 430, expY + 26, { align: 'right', width: 100 });

doc.fillColor(grey).font('Helvetica').fontSize(9).text('Software applications, data infrastructure and automation for public- and private-sector clients across West Africa.', 52, expY + 42, { width: 490 });

doc.fillColor(teal).font('Helvetica-Bold').fontSize(9).text('Email Archiving & Automation Platform', 52, expY + 62);

doc.fillColor(grey).font('Helvetica').fontSize(8.7).text('• Solved critical full-mailbox archive constraints through a data-warehouse solution.', 70, expY + 76, { width: 470 });
doc.text('• Automated ETL ingestion to keep historical correspondence searchable and up to date.', 70, expY + 90, { width: 470 });
doc.text('• Built bulk email workflows, follow-ups, and reporting on top of the archive.', 70, expY + 104, { width: 470 });

doc.fillColor(teal).font('Helvetica-Bold').fontSize(9).text('Full-Stack Applications & Document Assistants', 52, expY + 124);
doc.fillColor(grey).font('Helvetica').fontSize(8.7).text('• Built React / Next.js product applications with Python and PostgreSQL backends.', 70, expY + 138, { width: 470 });
doc.text('• Delivered on-premise document assistants using semantic search and LLM citation layers.', 70, expY + 152, { width: 470 });

doc.fillColor(teal).font('Helvetica-Bold').fontSize(9).text('Data Platform, Cloud & Infrastructure', 52, expY + 172);
doc.fillColor(grey).font('Helvetica').fontSize(8.7).text('• Architected cloud-to-on-premise migration and multi-layer data platform solutions.', 70, expY + 186, { width: 470 });
doc.text('• Built Kafka + Spark pipelines reducing latency from T+1 day to under 5 minutes.', 70, expY + 200, { width: 470 });

doc.fillColor(navy).font('Helvetica-Bold').fontSize(10).text('Founder & Lead Architect — EconInsightLab', 52, expY + 225);
doc.fillColor(lightGrey).font('Helvetica').fontSize(8.5).text('2025 – Present', 430, expY + 225, { align: 'right', width: 100 });
doc.fillColor(grey).font('Helvetica').fontSize(8.7).text('• Built a regional intelligence platform covering 16 West African economies with structured analytics, AI synthesis, and evidence-rich reporting.', 52, expY + 240, { width: 490 });

doc.fillColor(grey).font('Helvetica').fontSize(8.7).text('• Engineered secure data pipelines, retrieval layers, and executive briefing outputs for strategic use cases.', 52, expY + 254, { width: 490 });

// Education & certifications
const lowerY = 675;
doc.fillColor(navy).font('Helvetica-Bold').fontSize(14).text('EDUCATION & CERTIFICATIONS', 52, lowerY);
doc.moveTo(52, lowerY + 16).lineTo(545, lowerY + 16).strokeColor('#B0C4DE').lineWidth(1).stroke();

doc.fillColor(grey).font('Helvetica-Bold').fontSize(9).text('M.Sc. Computer Science (Software Engineering) — Woolf University', 52, lowerY + 30);
doc.text('2025–2026', 430, lowerY + 30, { align: 'right', width: 100 });

doc.text('M.Sc. Pure Mathematics (Number Theory) — Université Bourgogne Franche-Comté, France', 52, lowerY + 45, { width: 430 });
doc.text('2023–2024', 430, lowerY + 45, { align: 'right', width: 100 });

doc.text('M.Sc. Mathematics & Applications — Aix-Marseille University, France', 52, lowerY + 60, { width: 430 });
doc.text('2021–2022', 430, lowerY + 60, { align: 'right', width: 100 });

doc.text('Statistical Engineering Degree (M.Sc. level) — ENSEA, Abidjan', 52, lowerY + 75, { width: 430 });
doc.text('2017–2020', 430, lowerY + 75, { align: 'right', width: 100 });

doc.text('B.Sc. Mathematics — UNISAT, Côte d\'Ivoire', 52, lowerY + 90, { width: 430 });
doc.text('2011–2014', 430, lowerY + 90, { align: 'right', width: 100 });

doc.fillColor(teal).font('Helvetica-Bold').fontSize(9).text('CERTIFICATIONS', 52, lowerY + 112);
doc.fillColor(grey).font('Helvetica').fontSize(8.4).text('GOMYCODE Software Engineering • HackerRank (Python, SQL, Docker, GCP) • Oracle AI Foundations • Dataiku MLOps & Generative AI • Qdrant Essential • Dremio Lakehouse Associate', 52, lowerY + 126, { width: 490 });

// Research
const researchY = 820;
doc.fillColor(navy).font('Helvetica-Bold').fontSize(14).text('RESEARCH & PUBLICATIONS', 52, researchY);
doc.moveTo(52, researchY + 16).lineTo(545, researchY + 16).strokeColor('#B0C4DE').lineWidth(1).stroke();

doc.fillColor(grey).font('Helvetica').fontSize(8.6).text('• Information Graphs of Statistical Summaries — Afrika Statistika, 2025', 52, researchY + 31, { width: 490 });
doc.text('• Topological Feature Engineering and Machine Learning for Economic Regime Detection in Côte d\'Ivoire (1960–2022) — preprint, 2026', 52, researchY + 45, { width: 490 });
doc.text('• Cohomological Risk Scoring: A Topological Framework for Detecting Structural Inconsistencies in Financial Networks — preprint, 2025', 52, researchY + 59, { width: 490 });
doc.text('• Monogeneity, index forms and power integral bases of multiquadratic number fields — under review', 52, researchY + 73, { width: 490 });
doc.text('• 40+ preprints in number theory, combinatorics, applied probability and topological methods for ML', 52, researchY + 87, { width: 490 });

doc.fillColor(lightGrey).font('Helvetica-Oblique').fontSize(8).text('June 2026', 52, 815, { align: 'center', width: 500 });

doc.end();

writeStream.on('finish', () => {
  console.log(`CV PDF generated: ${outputPath}`);
});
