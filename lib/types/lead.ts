export interface NewsItem {
  title: string;
  published_at?: string;
  description?: string;
}

export interface ScoreBreakdown {
  industry?: number;
  company_size?: number;
  geography?: number;
  revenue?: number;
  technology?: number;
  growth?: number;
  business_model?: number;
}

export interface ICPConfig {
  industries: string[];
  companySizes: string[];
  locations: string[];
  businessModels: string[];
  technologies: string[];
}

export interface Lead {
  id: string;
  company_name: string | null;
  domain: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  business_model: string | null;
  target_customers: string | null;
  company_size: string | null;
  location: string | null;
  products_services: string[] | null;
  technologies: string[] | null;
  growth_signals: string[] | null;
  news: NewsItem[] | null;
  confidence: number | null;
  score: number | null;
  fit: "High Fit" | "Medium Fit" | "Low Fit" | string | null;
  breakdown: ScoreBreakdown | null;
  reasons: string[] | null;
  matched_criteria?: string[] | null;
  missing_criteria?: string[] | null;
  icp_used?: ICPConfig | null;
  created_at?: string | null;
}

export interface EnrichApiRequest {
  website: string;
  icp: ICPConfig;
}

export interface EnrichApiResponse extends Partial<Lead> {
  success?: boolean;
  error?: string;
  message?: string;
}
