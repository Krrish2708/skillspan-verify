// src/lib/exportPDF.ts
// Professional PDF export for VerifyHire reports
// Uses jsPDF (client-side, no server needed)
// Install: npm install jspdf

import type { Resume, ResumeSkill, ParsedData } from "@/lib/types";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  teal: [16, 185, 129] as [number, number, number],
  tealLight: [209, 250, 229] as [number, number, number],
  dark: [15, 23, 42] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  redLight: [254, 226, 226] as [number, number, number],
  yellow: [234, 179, 8] as [number, number, number],
  yellowLight: [254, 249, 195] as [number, number, number],
  green: [34, 197, 94] as [number, number, number],
  greenLight: [220, 252, 231] as [number, number, number],
  blue: [59, 130, 246] as [number, number, number],
  blueLight: [219, 234, 254] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function scoreColor(score: number): [number, number, number] {
  if (score >= 75) return C.teal;
  if (score >= 50) return C.yellow;
  return C.red;
}

function scoreBg(score: number): [number, number, number] {
  if (score >= 75) return C.tealLight;
  if (score >= 50) return C.yellowLight;
  return C.redLight;
}

function confidenceColor(conf: string): [number, number, number] {
  if (conf === "verified") return C.teal;
  if (conf === "partially_verified") return C.yellow;
  return C.red;
}

function confidenceBg(conf: string): [number, number, number] {
  if (conf === "verified") return C.tealLight;
  if (conf === "partially_verified") return C.yellowLight;
  return C.redLight;
}

function confidenceLabel(conf: string): string {
  if (conf === "verified") return "Verified";
  if (conf === "partially_verified") return "Partial";
  return "Risk";
}

// ─── Main export function ─────────────────────────────────────────────────────
export async function exportReportPDF(
  resume: Resume,
  skills: ResumeSkill[],
  calculatedOverall: number
) {
  // Dynamically import jsPDF to avoid bundle bloat
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; // A4 width
  const MARGIN = 16;
  const CONTENT_W = W - MARGIN * 2;
  let y = 0;

  const parsedData = (resume.parsed_data || {}) as ParsedData;
  const atsBreakdown = parsedData.ats_breakdown as any;
  const credBreakdown = parsedData.credibility_breakdown as any;
  const hasJD = !!resume.job_description;
  const rel = resume.relevancy_score || 0;
  const cred = resume.credibility_score || 0;

  // ── Page management ──────────────────────────────────────────────────────
  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > 270) {
      doc.addPage();
      y = MARGIN;
      drawPageHeader();
    }
  }

  function drawPageHeader() {
    // Thin teal top bar
    doc.setFillColor(...C.teal);
    doc.rect(0, 0, W, 1.5, "F");
  }

  // ── Section header ────────────────────────────────────────────────────────
  function sectionHeader(title: string) {
    checkPageBreak(14);
    doc.setFillColor(...C.bg);
    doc.rect(MARGIN, y, CONTENT_W, 8, "F");
    doc.setDrawColor(...C.teal);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, MARGIN, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...C.teal);
    doc.text(title.toUpperCase(), MARGIN + 4, y + 5.5);
    y += 11;
  }

  // ── Score pill ────────────────────────────────────────────────────────────
  function scorePill(score: number, label: string, x: number, py: number, w: number) {
    const color = scoreColor(score);
    const bg = scoreBg(score);
    doc.setFillColor(...bg);
    doc.roundedRect(x, py, w, 18, 2, 2, "F");
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, py, w, 18, 2, 2, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...color);
    doc.text(String(score), x + w / 2, py + 11, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(label.toUpperCase(), x + w / 2, py + 16, { align: "center" });
  }

  // ── Score bar ─────────────────────────────────────────────────────────────
  function scoreBar(score: number, label: string, barY: number) {
    checkPageBreak(10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.dark);
    doc.text(label, MARGIN, barY + 3.5);
    const scoreStr = `${score}%`;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...scoreColor(score));
    doc.text(scoreStr, MARGIN + CONTENT_W, barY + 3.5, { align: "right" });
    // Track
    doc.setFillColor(...C.border);
    doc.roundedRect(MARGIN + 40, barY, CONTENT_W - 40 - 12, 3.5, 1, 1, "F");
    // Fill
    const fillW = ((CONTENT_W - 40 - 12) * score) / 100;
    doc.setFillColor(...scoreColor(score));
    doc.roundedRect(MARGIN + 40, barY, fillW, 3.5, 1, 1, "F");
    y = barY + 8;
  }

  // ── Tag chip ──────────────────────────────────────────────────────────────
  function drawChips(items: string[], chipY: number, color: [number,number,number], bg: [number,number,number]): number {
    let cx = MARGIN;
    let cy = chipY;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    items.forEach(item => {
      const tw = doc.getTextWidth(item);
      const chipW = tw + 6;
      if (cx + chipW > MARGIN + CONTENT_W) {
        cx = MARGIN;
        cy += 8;
      }
      doc.setFillColor(...bg);
      doc.roundedRect(cx, cy, chipW, 6, 1, 1, "F");
      doc.setDrawColor(...color);
      doc.setLineWidth(0.2);
      doc.roundedRect(cx, cy, chipW, 6, 1, 1, "S");
      doc.setTextColor(...color);
      doc.text(item, cx + 3, cy + 4.3);
      cx += chipW + 3;
    });
    return cy + 8;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════════
  drawPageHeader();
  y = MARGIN;

  // ── Branding header ───────────────────────────────────────────────────────
  // Logo circle
  doc.setFillColor(...C.teal);
  doc.circle(MARGIN + 4, y + 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.white);
  doc.text("VH", MARGIN + 4, y + 5.5, { align: "center" });

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...C.dark);
  doc.text("VerifyHire", MARGIN + 11, y + 6);

  // Report label + date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...C.muted);
  doc.text("Resume Verification Report", MARGIN + CONTENT_W, y + 3, { align: "right" });
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, MARGIN + CONTENT_W, y + 8, { align: "right" });

  y += 16;

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 8;

  // ── Candidate info ────────────────────────────────────────────────────────
  // Big score circle
  doc.setFillColor(...scoreColor(calculatedOverall));
  doc.circle(MARGIN + 10, y + 10, 10, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...C.white);
  doc.text(String(calculatedOverall), MARGIN + 10, y + 12, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...C.dark);
  doc.text(resume.candidate_name || "Unknown Candidate", MARGIN + 24, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...C.muted);
  doc.text(resume.candidate_role || "Unknown Role", MARGIN + 24, y + 13);
  doc.text(resume.file_name, MARGIN + 24, y + 18);

  // Hire verdict badge (top right)
  const hrNotes = (parsedData as any).hr_notes || [];
  const verdictLine = hrNotes.find((s: string) => s.startsWith("HIRE_RECOMMENDATION:"));
  if (verdictLine) {
    const verdict = verdictLine.replace("HIRE_RECOMMENDATION:", "").trim();
    const isStrongHire = verdict.includes("Strong Hire");
    const isHire = verdict.includes("Hire") && !verdict.includes("Strong");
    const isMaybe = verdict.includes("Maybe");
    const vColor = isStrongHire || isHire ? C.teal : isMaybe ? C.yellow : C.red;
    const vBg = isStrongHire || isHire ? C.tealLight : isMaybe ? C.yellowLight : C.redLight;
    const vText = `Hire Recommendation: ${verdict}`;
    const vW = doc.getTextWidth(vText) + 10;
    doc.setFillColor(...vBg);
    doc.roundedRect(MARGIN + CONTENT_W - vW, y, vW, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...vColor);
    doc.text(vText, MARGIN + CONTENT_W - vW / 2, y + 5.3, { align: "center" });
  }

  y += 26;

  // ── Score cards row ───────────────────────────────────────────────────────
  const cardW = CONTENT_W / 4 - 2;
  scorePill(calculatedOverall, "Overall", MARGIN, y, cardW);
  scorePill(resume.ats_score || 0, "ATS Score", MARGIN + cardW + 2, y, cardW);
  scorePill(resume.credibility_score || 0, "Credibility", MARGIN + (cardW + 2) * 2, y, cardW);
  scorePill(hasJD ? (resume.relevancy_score || 0) : 0, "Relevancy", MARGIN + (cardW + 2) * 3, y, cardW);
  y += 24;

  // ── Divider ───────────────────────────────────────────────────────────────
  doc.setDrawColor(...C.border);
  doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
  y += 8;

  // ── JD Relevancy section ──────────────────────────────────────────────────
  if (hasJD) {
    sectionHeader("Relevancy Breakdown");
    scoreBar(resume.relevancy_score || 0, "Relevance Score", y);

    if (parsedData.matched_skills?.length) {
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.dark);
      doc.text("SKILLS MATCHED", MARGIN, y + 4);
      y += 7;
      y = drawChips(parsedData.matched_skills, y, C.teal, C.tealLight);
      y += 2;
    }

    if (parsedData.missing_skills?.length) {
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.dark);
      doc.text("MISSING SKILLS", MARGIN, y + 4);
      y += 7;
      y = drawChips(parsedData.missing_skills, y, C.red, C.redLight);
      y += 2;
    }

    if ((parsedData as any).matched_keywords?.length) {
      checkPageBreak(20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...C.dark);
      doc.text("KEYWORDS MATCHED", MARGIN, y + 4);
      y += 7;
      y = drawChips((parsedData as any).matched_keywords, y, C.muted, C.bg);
      y += 4;
    }
  }

  // ── ATS Breakdown ─────────────────────────────────────────────────────────
  if (atsBreakdown) {
    sectionHeader("ATS Breakdown");
    scoreBar(atsBreakdown.formatting_score || 0, "Formatting", y);
    scoreBar(atsBreakdown.keyword_score || 0, "Keywords", y);
    scoreBar(atsBreakdown.structure_score || 0, "Structure", y);

    // Contact info
    checkPageBreak(8);
    const ciColor = atsBreakdown.contact_info_present ? C.teal : C.red;
    const ciText = atsBreakdown.contact_info_present ? "✔ Contact info detected" : "✘ Contact info missing";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...ciColor);
    doc.text(ciText, MARGIN, y + 4);
    y += 10;
  }

  // ── Skill Verification ────────────────────────────────────────────────────
  if (skills.length > 0) {
    sectionHeader("Skill Verification");

    skills.forEach((skill) => {
      checkPageBreak(14);

      // Confidence badge
      const conf = skill.confidence || "unverified";
      const cLabel = confidenceLabel(conf);
      const cColor = confidenceColor(conf);
      const cBg = confidenceBg(conf);
      const badgeW = doc.getTextWidth(cLabel) + 6;

      doc.setFillColor(...cBg);
      doc.roundedRect(MARGIN, y, badgeW, 5.5, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...cColor);
      doc.text(cLabel, MARGIN + 3, y + 3.9);

      // Evidence text
      if (skill.evidence) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(...C.muted);
        const evidenceText = skill.evidence.length > 80 ? skill.evidence.substring(0, 80) + "..." : skill.evidence;
        doc.text(evidenceText, MARGIN + badgeW + 3, y + 3.9);
      }

      y += 7;

      // Skill name + score
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.dark);
      const skillLabel = skill.skill_name.length > 20 ? skill.skill_name.substring(0, 20) + "..." : skill.skill_name;
doc.text(skillLabel, MARGIN, y + 3.5);
      doc.setTextColor(...scoreColor(skill.score));
      doc.text(`${skill.score}%`, MARGIN + CONTENT_W, y + 3.5, { align: "right" });

      // Bar
      doc.setFillColor(...C.border);
      doc.roundedRect(MARGIN + 35, y + 0.5, CONTENT_W - 35 - 12, 3, 1, 1, "F");
      const fw = ((CONTENT_W - 35 - 12) * skill.score) / 100;
      const barColor = skill.confidence === "verified" ? C.teal : skill.confidence === "partially_verified" ? C.yellow : C.red;
doc.setFillColor(...barColor);
doc.roundedRect(MARGIN + 35, y + 0.5, fw, 3, 1, 1, "F");

      y += 8;
    });
    y += 2;
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (parsedData.experience_items?.length) {
    sectionHeader("Experience");
    parsedData.experience_items.forEach((item: any) => {
      checkPageBreak(12);
      doc.setFillColor(...C.bg);
      doc.roundedRect(MARGIN, y, CONTENT_W, 10, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.dark);
      doc.text(item.role || "", MARGIN + 4, y + 4.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`${item.company || ""} · ${item.duration || ""}`, MARGIN + 4, y + 8.5);
      // Verified icon
      if (item.verified) {
        doc.setTextColor(...C.teal);
        doc.text("OK", MARGIN + CONTENT_W - 6, y + 6.5);
      }
      y += 13;
    });
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (parsedData.education?.length) {
    sectionHeader("Education");
    parsedData.education.forEach((edu: any) => {
      checkPageBreak(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...C.dark);
      doc.text(edu.degree || "", MARGIN, y + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.muted);
      doc.text(`${edu.institution || ""} · ${edu.year || ""}`, MARGIN, y + 8.5);
      y += 12;
    });
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (parsedData.certifications?.length) {
    sectionHeader("Certifications");
    parsedData.certifications.forEach((cert: any) => {
      checkPageBreak(10);
      const vColor = cert.verified ? C.teal : C.red;
      const vText = cert.verified ? "+" : "-";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...vColor);
      doc.text(vText, MARGIN, y + 4);
      doc.setTextColor(...C.dark);
      doc.text(cert.name || "", MARGIN + 6, y + 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(...C.muted);
      doc.text(cert.issuer || "", MARGIN + 6, y + 8.5);
      y += 12;
    });
  }

  // ── Credibility Breakdown ─────────────────────────────────────────────────
  if (credBreakdown) {
    sectionHeader("Credibility Breakdown");
    const credItems = [
      { label: "GitHub Profile", value: credBreakdown.github_linked ? "Verified" : "Not Linked", ok: credBreakdown.github_linked },
      { label: "Certifications Verified", value: `${credBreakdown.certifications_verified || 0}/${(credBreakdown.certifications_verified || 0) + (credBreakdown.certifications_unverified || 0)}`, ok: credBreakdown.certifications_verified > 0 },
      { label: "Projects with Links", value: `${credBreakdown.projects_with_links || 0} linked`, ok: credBreakdown.projects_with_links > 0 },
    ];
    credItems.forEach(item => {
      checkPageBreak(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...C.dark);
      doc.text(item.label, MARGIN, y + 4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...(item.ok ? C.teal : C.muted));
      doc.text(item.value, MARGIN + CONTENT_W, y + 4, { align: "right" });
      doc.setDrawColor(...C.border);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y + 7, MARGIN + CONTENT_W, y + 7);
      y += 10;
    });
  }

  // ── HR Notes ─────────────────────────────────────────────────────────────
  if (hrNotes.length > 0) {
    sectionHeader("HR Notes");
    hrNotes.forEach((note: string) => {
      checkPageBreak(10);
      const isVerdict = note.startsWith("HIRE_RECOMMENDATION:");
      const cleanNote = note
        .replace("HIRE_RECOMMENDATION:", "Hire Recommendation:")
        .replace("Reason:", "")
        .replace("Concern 1:", "•")
        .replace("Concern 2:", "•")
        .trim();

      if (isVerdict) {
        const verdict = note.replace("HIRE_RECOMMENDATION:", "").trim();
        const isPos = verdict.includes("Strong Hire") || verdict.includes("Hire");
        const isMaybe = verdict.includes("Maybe");
        const vColor = isPos ? C.teal : isMaybe ? C.yellow : C.red;
        const vBg = isPos ? C.tealLight : isMaybe ? C.yellowLight : C.redLight;
        doc.setFillColor(...vBg);
        doc.roundedRect(MARGIN, y, CONTENT_W, 9, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...vColor);
        doc.text(`Hire Recommendation: ${verdict}`, MARGIN + CONTENT_W / 2, y + 6, { align: "center" });
        y += 12;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(...C.muted);
        const lines = doc.splitTextToSize(cleanNote, CONTENT_W - 6);
        doc.text(lines, MARGIN + 3, y + 4);
        y += lines.length * 5 + 3;
      }
    });
  }

  // ── Candidate Summary ─────────────────────────────────────────────────────
  if (parsedData.strength_summary) {
    checkPageBreak(20);
    sectionHeader("Candidate Summary");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(...C.muted);
    const summaryLines = doc.splitTextToSize(parsedData.strength_summary, CONTENT_W);
    doc.text(summaryLines, MARGIN, y + 4);
    y += summaryLines.length * 5 + 4;
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, 287, MARGIN + CONTENT_W, 287);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text("Generated by VerifyHire · AI-Powered Resume Verification", MARGIN, 291);
    doc.text(`Page ${p} of ${totalPages}`, MARGIN + CONTENT_W, 291, { align: "right" });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const fileName = `VerifyHire_${(resume.candidate_name || "Report").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
