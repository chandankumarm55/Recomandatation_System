import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Mistral AI Configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY; // Load from .env file
const MISTRAL_MODEL = 'pixtral-12b-2409';

// System prompt for sustainability analysis
const SUSTAINABILITY_SYSTEM_PROMPT = `You are an expert environmental analyst specializing in product sustainability assessment. 

Your task is to analyze product images and provide comprehensive sustainability evaluations. Consider:
- Material composition and recyclability
- Manufacturing impact and carbon footprint
- Water usage and resource depletion
- Product lifespan and durability
- End-of-life disposal options
- Certifications and eco-labels visible in the image
- Energy consumption (if applicable)

Always provide practical, actionable insights and realistic sustainability scores based on industry standards.

IMPORTANT: You must respond with valid JSON only, no additional text. Use this exact structure:
{
  "productName": "string",
  "sustainabilityScore": number (0-100),
  "ecoLabels": ["array of strings, can be empty if none visible"],
  "recyclability": "detailed string description",
  "carbonFootprint": "detailed string description with estimates",
  "waterFootprint": "detailed string description with estimates",
  "materialComposition": "detailed string description of materials",
  "lifespan": "detailed string description of expected durability",
  "energyProduction": "string description of energy impact or 'Not applicable'",
  "alternatives": ["array of 3-4 specific greener alternative products"]
}

Be specific and provide numerical estimates where possible. If you cannot determine exact values, provide reasonable estimates based on typical products in that category.`;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// HELPER FUNCTIONS
// ============================================

const validateImageFormat = (imageData) => {
    if (!imageData || typeof imageData !== 'string') {
        return false;
    }
    const dataURLPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
    return dataURLPattern.test(imageData);
};

const compressBase64Image = (base64String, maxSizeKB = 4000) => {
    const sizeInBytes = (base64String.length * 3) / 4;
    const sizeInKB = sizeInBytes / 1024;

    console.log(`Image size: ${sizeInKB.toFixed(2)} KB`);

    if (sizeInKB <= maxSizeKB) {
        return base64String;
    }

    console.warn(`Image size (${sizeInKB.toFixed(2)} KB) exceeds recommended limit (${maxSizeKB} KB)`);
    return base64String;
};

const parseAIResponse = (aiResponse) => {
    try {
        return JSON.parse(aiResponse);
    } catch (parseError) {
        console.error('JSON parsing error, attempting to extract JSON from response');
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse AI response as JSON');
    }
};

const validateAnalysisResponse = (analysis) => {
    const requiredFields = [
        'productName',
        'sustainabilityScore',
        'ecoLabels',
        'recyclability',
        'carbonFootprint',
        'waterFootprint',
        'materialComposition',
        'lifespan',
        'energyProduction',
        'alternatives'
    ];

    const missingFields = requiredFields.filter(field => !(field in analysis));

    if (missingFields.length > 0) {
        console.warn('Missing fields in AI response:', missingFields);
        return {
            productName: analysis.productName || 'Unknown Product',
            sustainabilityScore: Math.min(Math.max(analysis.sustainabilityScore || 50, 0), 100),
            ecoLabels: Array.isArray(analysis.ecoLabels) ? analysis.ecoLabels : [],
            recyclability: analysis.recyclability || 'Recyclability information not available from image',
            carbonFootprint: analysis.carbonFootprint || 'Moderate carbon impact estimated',
            waterFootprint: analysis.waterFootprint || 'Moderate water usage estimated',
            materialComposition: analysis.materialComposition || 'Mixed materials detected',
            lifespan: analysis.lifespan || 'Average product lifespan expected',
            energyProduction: analysis.energyProduction || 'Not applicable',
            alternatives: Array.isArray(analysis.alternatives) && analysis.alternatives.length > 0 ?
                analysis.alternatives : [
                    'Seek locally manufactured alternatives',
                    'Consider second-hand or refurbished options',
                    'Look for products with eco-certifications',
                    'Choose products with minimal packaging'
                ],
            ...analysis
        };
    }

    analysis.sustainabilityScore = Math.min(Math.max(analysis.sustainabilityScore, 0), 100);
    analysis.ecoLabels = Array.isArray(analysis.ecoLabels) ? analysis.ecoLabels : [];
    analysis.alternatives = Array.isArray(analysis.alternatives) ? analysis.alternatives : [];

    return analysis;
};

// ============================================
// API ROUTES
// ============================================

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiConfigured: !!MISTRAL_API_KEY
    });
});

app.post('/api/sustainability/analyze', async(req, res) => {
    try {
        const { image, prompt } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        if (!MISTRAL_API_KEY) {
            console.error('MISTRAL_API_KEY not configured in environment variables');
            return res.status(500).json({
                error: 'Server configuration error. API key not found.'
            });
        }

        if (!validateImageFormat(image)) {
            return res.status(400).json({
                error: 'Invalid image format. Please upload a valid image (JPEG, PNG, GIF, or WebP).'
            });
        }

        console.log('Processing sustainability analysis...');
        console.log('Image size:', (image.length / 1024).toFixed(2), 'KB');

        const processedImage = compressBase64Image(image);

        const messages = [{
                role: 'system',
                content: SUSTAINABILITY_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: [{
                        type: 'text',
                        text: prompt || 'Analyze this product for sustainability and environmental impact. Provide detailed assessment.'
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: processedImage
                        }
                    }
                ]
            }
        ];

        console.log('Calling Mistral AI API...');

        const response = await axios.post(
            MISTRAL_API_URL, {
                model: MISTRAL_MODEL,
                messages: messages,
                temperature: 0.3,
                max_tokens: 2500,
                response_format: { type: 'json_object' }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MISTRAL_API_KEY}`
                },
                timeout: 60000
            }
        );

        const aiResponse = response.data.choices[0].message.content;
        console.log('AI Response received, parsing...');

        let analysis = parseAIResponse(aiResponse);
        analysis = validateAnalysisResponse(analysis);

        console.log('Analysis complete:', {
            productName: analysis.productName,
            score: analysis.sustainabilityScore,
            alternativesCount: analysis.alternatives.length
        });

        res.json({
            analysis,
            rawResponse: aiResponse
        });

    } catch (error) {
        console.error('Sustainability analysis error:', error);

        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            console.error('Mistral API error:', { status, data: errorData });

            if (status === 401 || status === 403) {
                return res.status(500).json({
                    error: 'API authentication failed. Please check server configuration.'
                });
            }
            if (status === 429) {
                return res.status(429).json({
                    error: 'Rate limit exceeded. Please try again in a few moments.'
                });
            }
            if (status === 400) {
                return res.status(400).json({
                    error: 'Invalid request. Please try with a different image.'
                });
            }
            if (status === 413) {
                return res.status(413).json({
                    error: 'Image too large. Please use an image under 5MB.'
                });
            }
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                error: 'Request timeout. The AI service is taking too long to respond. Please try again.'
            });
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Unable to connect to AI service. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Failed to analyze sustainability. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);

    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large. Please use an image under 5MB.'
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`EcoScan Backend Server`);
    console.log('='.repeat(50));
    console.log(`Server running on port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Key configured: ${MISTRAL_API_KEY ? 'Yes ✓' : 'No ✗'}`);
    console.log(`Model: ${MISTRAL_MODEL}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('='.repeat(50));
});

export default app;