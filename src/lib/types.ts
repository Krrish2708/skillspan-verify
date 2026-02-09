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
