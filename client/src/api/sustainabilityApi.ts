import axios from 'axios';
import { AnalysisResponse, ApiError } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const analyzeSustainability = async (imageFile: File): Promise<AnalysisResponse> => {
  try {
    const base64Image = await fileToBase64(imageFile);

    const requestData = {
      image: base64Image,
      prompt: `Analyze this product image for sustainability. Provide a comprehensive environmental impact assessment.

CRITICAL INSTRUCTIONS:
1. If you cannot clearly identify the product from the image (blurry, unclear, no visible labels/branding, or ambiguous object), you MUST respond with:
{
  "productName": "Unknown",
  "error": "Unable to identify product",
  "reason": "Specific explanation of why product cannot be identified (e.g., 'Image is too blurry', 'No product labels visible', 'Cannot determine product type')"
}

2. If you CAN identify the product, provide detailed analysis including:
   - Product name/type (generic category like "Plastic Water Bottle", "Cotton T-Shirt", "LED Bulb")
   - Sustainability score (0-100)
   - Eco certifications (if visible)
   - Environmental metrics
   - 3-4 greener alternatives

IMPORTANT FOR ALTERNATIVES:
- Provide GENERIC product names that describe the eco-friendly alternative category
- DO NOT provide specific brand names or product ASINs
- DO NOT include "buyLink" field - the system will auto-generate shopping links
- Focus on the TYPE of sustainable alternative, not specific products

Example of CORRECT alternative format:
{
  "name": "Stainless Steel Reusable Water Bottle",
  "description": "BPA-free, insulated stainless steel bottles that last 10+ years",
  "score": 88,
  "price": "₹500-₹1500"
}

Example of WRONG format (DO NOT DO THIS):
{
  "name": "Milton Thermosteel Flask",
  "buyLink": "https://www.amazon.in/dp/...",
  ...
}

Format your response as JSON with this exact structure:
{
  "productName": "string (generic product category)",
  "sustainabilityScore": number,
  "confidence": number (0-100, how confident you are in identifying the product),
  "ecoLabels": ["string"],
  "recyclability": "string",
  "carbonFootprint": "string",
  "waterFootprint": "string",
  "materialComposition": "string",
  "lifespan": "string",
  "energyProduction": "string",
  "alternatives": [
    {
      "name": "Generic Eco-Friendly Product Category",
      "description": "Description of sustainable features and benefits",
      "score": 85,
      "price": "₹XX-₹XXX (price range in INR)"
    }
  ]
}

EXAMPLES OF GOOD ALTERNATIVE NAMES:
- "Bamboo Toothbrush" (not "Colgate Bamboo Toothbrush")
- "Organic Cotton T-Shirt" (not "Nike Organic Cotton Tee")
- "LED Energy Efficient Bulb" (not "Philips LED 9W Bulb")
- "Reusable Shopping Bag" (not "Ikea Blue Shopping Bag")
- "Glass Food Storage Container" (not "Borosil Glass Container Set")`
    };

    console.log('Sending analysis request to:', `${BACKEND_URL}/api/sustainability/analyze`);
    console.log('Image size:', (base64Image.length / 1024).toFixed(2), 'KB');

    const response = await axios.post<AnalysisResponse>(
      `${BACKEND_URL}/api/sustainability/analyze`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    console.log('Analysis response received:', response.data);

    // Check if product is unknown
    if (response.data.analysis.productName.toLowerCase().includes('unknown') || 
        response.data.analysis.productName.toLowerCase() === 'unidentified product' ||
        response.data.analysis.productName.toLowerCase() === 'unclear') {
      throw {
        isUnknownProduct: true,
        message: (response.data.analysis as any).reason || 
                 "Unable to identify the product from the image. Please ensure the image shows clear product labels, branding, or packaging.",
        suggestions: [
          "Take a photo with better lighting",
          "Ensure product labels and text are visible and in focus",
          "Position the product against a plain, uncluttered background",
          "Try capturing the product from a different angle showing brand/label",
          "Make sure the image is not blurry or distorted",
          "Include the full product packaging in the frame"
        ]
      } as ApiError;
    }

    // Check confidence level
    if (response.data.analysis.confidence && response.data.analysis.confidence < 50) {
      throw {
        isUnknownProduct: true,
        message: "Low confidence in product identification. The image quality or content is insufficient for accurate analysis.",
        suggestions: [
          "Upload a clearer, higher resolution image",
          "Ensure the product is well-lit and in focus",
          "Make sure product labels and branding are visible",
          "Try a different angle that shows the product more clearly"
        ]
      } as ApiError;
    }

    return response.data;
  } catch (error: any) {
    console.error('Sustainability analysis error:', error);

    // Handle unknown product error
    if (error.isUnknownProduct) {
      throw error;
    }

    // Handle axios errors
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a few minutes.');
      }
      if (error.response?.status === 413) {
        throw new Error('Image too large. Please use an image under 5MB.');
      }
      if (error.response?.status === 504) {
        throw new Error('Request timeout. The server is taking too long to respond. Please try again.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please ensure the backend is running at ' + BACKEND_URL);
      }
    }

    throw new Error('Failed to analyze sustainability. Please try again.');
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};