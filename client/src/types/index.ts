export interface ProductAnalysis {
  productName: string;
  sustainabilityScore: number;
  ecoLabels: string[];
  alternatives: string[];
  recyclability: string;
  carbonFootprint: string;
  waterFootprint: string;
  materialComposition: string;
  lifespan: string;
  energyProduction: string;
  imageUrl?: string;
}

export interface SampleProduct {
  name: string;
  category: string;
  image: string;
  response: ProductAnalysis;
}

export type Theme = 'light' | 'dark';