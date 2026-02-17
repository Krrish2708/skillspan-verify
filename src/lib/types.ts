export interface Profile {
  id: string;
  auth_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  profile_id: string;
  file_name: string;
  file_url: string | null;
  status: "pending" | "parsing" | "completed" | "failed";
  candidate_name: string | null;
  candidate_role: string | null;
  overall_score: number;
  ats_score: number;
  relevancy_score: number;
  credibility_score: number;
  job_description: string | null;
  role_title: string | null;
  experience_range: string | null;
  parsed_data: ParsedData;
  created_at: string;
  updated_at: string;
}

export interface ResumeSkill {
  id: string;
  resume_id: string;
  skill_name: string;
  category: string;
  score: number;
  confidence: "verified" | "partially_verified" | "unverified";
  evidence: string | null;
  created_at: string;
}

export interface ParsedData {
  risk_flags?: string[];
  experience_items?: ExperienceItem[];
  certifications?: Certification[];
  relevancy_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  matched_keywords?: string[];
  ats_breakdown?: ATSBreakdown;
  credibility_breakdown?: CredibilityBreakdown;
  education?: EducationItem[];
  links?: ResumeLink[];
  improvement_suggestions?: string[];
  timeline_consistency?: "consistent" | "minor_gaps" | "inconsistent";
  strength_summary?: string;
  missing_evidence?: string[];
}

export interface ATSBreakdown {
  formatting_score: number;
  keyword_score: number;
  structure_score: number;
  contact_info_present: boolean;
  sections_detected: string[];
  missing_sections: string[];
}

export interface CredibilityBreakdown {
  evidence_score: number;
  github_linked: boolean;
  certifications_verified: number;
  certifications_unverified: number;
  projects_with_links: number;
  projects_without_links: number;
}

export interface EducationItem {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeLink {
  type: string;
  url: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  verified: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  verified: boolean;
}
