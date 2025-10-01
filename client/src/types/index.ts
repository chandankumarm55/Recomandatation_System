export type ShoppingPlatform = 'flipkart' | 'amazon' | 'meesho';

export interface PlatformLink {
  platform: ShoppingPlatform;
  url: string;
  displayName: string;
}

export interface Alternative {
  name: string;
  description?: string;
  score?: number;
  buyLink?: string; // Deprecated, kept for backward compatibility
  price?: string;
  platformLinks?: PlatformLink[];
}

export interface ProductAnalysis {
  productName: string;
  sustainabilityScore: number;
  confidence?: number;
  imageQuality?: 'good' | 'poor' | 'blur' | 'unknown';
  ecoLabels: string[];
  recyclability: string;
  carbonFootprint: string;
  waterFootprint: string;
  materialComposition: string;
  lifespan: string;
  energyProduction: string;
  alternatives: (string | Alternative)[];
  imageUrl?: string;
  warnings?: string[];
  metadata?: {
    analyzedAt: string;
    imageQuality: string;
    confidence: number;
    warnings?: string[];
  };
}

export interface SampleProduct {
  name: string;
  category: string;
  image: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: ProductAnalysis;
  imageQuality?: {
    quality: string;
    confidence: number;
    warnings: string[];
    metadata: {
      width: number;
      height: number;
      format: string;
    } | null;
  };
}

export interface ApiError {
  error: string;
  details?: string;
  imageQuality?: string;
  confidence?: number;
  warnings?: string[];
  technicalDetails?: string;
  isUnknownProduct?: boolean;
  message?: string;
  suggestions?: string[];
}

export type Theme = 'light' | 'dark';