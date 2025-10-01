// File: server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import axios from 'axios';
import sharp from 'sharp'; // npm install sharp

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Mistral AI Configuration
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = 'pixtral-12b-2409';

// Enhanced System Prompt
const SUSTAINABILITY_SYSTEM_PROMPT = `You are an expert environmental analyst specializing in product sustainability assessment. 

Analyze product images carefully and provide comprehensive sustainability evaluations. Consider:
- Material composition and recyclability
- Manufacturing impact and carbon footprint
- Water usage and resource depletion
- Product lifespan and durability
- End-of-life disposal options
- Certifications and eco-labels visible in the image
- Energy consumption (if applicable)

IMPORTANT IMAGE QUALITY ASSESSMENT:
- Evaluate the image quality (blur, lighting, clarity)
- If the image is blurry, dark, or unclear, indicate this in your response
- Provide confidence level based on image quality (0-100)

RESPONSE FORMAT (JSON only):
{
  "productName": "string",
  "sustainabilityScore": number (0-100),
  "confidence": number (0-100, based on image quality),
  "imageQuality": "good" | "poor" | "blur",
  "ecoLabels": ["array of strings, empty if none visible"],
  "recyclability": "detailed description",
  "carbonFootprint": "detailed description with estimates",
  "waterFootprint": "detailed description with estimates",
  "materialComposition": "detailed materials description",
  "lifespan": "expected durability description",
  "energyProduction": "energy impact or 'Not applicable'",
  "alternatives": [
    {
      "name": "alternative product name",
      "description": "why it's better",
      "score": estimated score (75-95),
      "buyLink": "search query for the product"
    }
  ]
}

Provide 3-4 specific alternative products with buying information. Be honest about image quality issues.`;

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
        return { valid: false, error: 'No image data provided' };
    }
    const dataURLPattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/i;
    if (!dataURLPattern.test(imageData)) {
        return { valid: false, error: 'Invalid image format. Supported: JPEG, PNG, GIF, WebP' };
    }
    return { valid: true };
};

const analyzeImageQuality = async(base64Image) => {
    try {
        // Remove data URL prefix
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Use sharp to analyze image
        const metadata = await sharp(buffer).metadata();
        const stats = await sharp(buffer).stats();

        // Calculate quality metrics
        const isBlurry = stats.channels.some(channel => channel.mean < 50 || channel.stdev < 20);
        const isTooSmall = metadata.width < 200 || metadata.height < 200;
        const isTooLarge = metadata.width > 4000 || metadata.height > 4000;

        let quality = 'good';
        let confidence = 90;
        let warnings = [];

        if (isBlurry) {
            quality = 'blur';
            confidence = 50;
            warnings.push('Image appears blurry. Please upload a clearer photo.');
        }

        if (isTooSmall) {
            quality = 'poor';
            confidence = Math.min(confidence, 60);
            warnings.push('Image resolution is too low. Use a higher quality photo.');
        }

        if (isTooLarge) {
            warnings.push('Image will be compressed for processing.');
        }

        return {
            quality,
            confidence,
            warnings,
            metadata: {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format
            }
        };
    } catch (error) {
        console.warn('Image quality analysis failed:', error);
        return {
            quality: 'unknown',
            confidence: 75,
            warnings: ['Could not analyze image quality'],
            metadata: null
        };
    }
};

const compressAndOptimizeImage = async(base64Image, maxSizeKB = 4000) => {
    try {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const metadata = await sharp(buffer).metadata();
        const sizeInKB = buffer.length / 1024;

        console.log(`Original image: ${metadata.width}x${metadata.height}, ${sizeInKB.toFixed(2)} KB`);

        if (sizeInKB <= maxSizeKB) {
            return base64Image;
        }

        // Compress image
        let quality = 85;
        let optimizedBuffer = buffer;

        while (optimizedBuffer.length / 1024 > maxSizeKB && quality > 40) {
            optimizedBuffer = await sharp(buffer)
                .resize(Math.min(metadata.width, 1920), null, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality, progressive: true })
                .toBuffer();

            quality -= 10;
        }

        const optimizedSize = optimizedBuffer.length / 1024;
        console.log(`Optimized image: ${optimizedSize.toFixed(2)} KB (quality: ${quality + 10})`);

        return `data:image/jpeg;base64,${optimizedBuffer.toString('base64')}`;
    } catch (error) {
        console.warn('Image optimization failed, using original:', error);
        return base64Image;
    }
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

const validateAndEnhanceAnalysis = (analysis, imageQualityData) => {
    const requiredFields = [
        'productName', 'sustainabilityScore', 'ecoLabels', 'recyclability',
        'carbonFootprint', 'waterFootprint', 'materialComposition',
        'lifespan', 'energyProduction', 'alternatives'
    ];

    // Fill missing fields with defaults
    const enhanced = {
        productName: analysis.productName || 'Unknown Product',
        sustainabilityScore: Math.min(Math.max(analysis.sustainabilityScore || 50, 0), 100),
        confidence: analysis.confidence || imageQualityData.confidence,
        imageQuality: analysis.imageQuality || imageQualityData.quality,
        ecoLabels: Array.isArray(analysis.ecoLabels) ? analysis.ecoLabels : [],
        recyclability: analysis.recyclability || 'Recyclability information not available',
        carbonFootprint: analysis.carbonFootprint || 'Moderate carbon impact estimated',
        waterFootprint: analysis.waterFootprint || 'Moderate water usage estimated',
        materialComposition: analysis.materialComposition || 'Mixed materials detected',
        lifespan: analysis.lifespan || 'Average product lifespan expected',
        energyProduction: analysis.energyProduction || 'Not applicable',
        alternatives: []
    };

    // Process alternatives
    if (Array.isArray(analysis.alternatives) && analysis.alternatives.length > 0) {
        enhanced.alternatives = analysis.alternatives.map(alt => {
            if (typeof alt === 'string') {
                return {
                    name: alt,
                    description: 'Eco-friendly alternative with better sustainability',
                    score: enhanced.sustainabilityScore < 60 ?
                        Math.floor(Math.random() * 20) + 75 : undefined,
                    buyLink: `https://www.amazon.com/s?k=${encodeURIComponent(alt)}+eco+friendly+sustainable`
                };
            }
            return {
                name: alt.name || 'Alternative Product',
                description: alt.description || 'Eco-friendly alternative',
                score: alt.score || (enhanced.sustainabilityScore < 60 ? 80 : undefined),
                buyLink: alt.buyLink || `https://www.amazon.com/s?k=${encodeURIComponent(alt.name || 'eco product')}+sustainable`
            };
        });
    } else {
        // Provide default alternatives
        enhanced.alternatives = [{
                name: 'Locally manufactured alternative',
                description: 'Support local businesses and reduce transportation emissions',
                score: 85,
                buyLink: 'https://www.amazon.com/s?k=local+eco+friendly+products'
            },
            {
                name: 'Certified organic option',
                description: 'Look for products with organic certifications',
                score: 88,
                buyLink: 'https://www.amazon.com/s?k=certified+organic+sustainable'
            },
            {
                name: 'Refurbished/Second-hand',
                description: 'Extend product lifecycle by choosing pre-owned',
                score: 92,
                buyLink: 'https://www.amazon.com/s?k=refurbished+renewed'
            }
        ];
    }

    // Add warnings if image quality is poor
    if (imageQualityData.warnings && imageQualityData.warnings.length > 0) {
        enhanced.warnings = imageQualityData.warnings;
    }

    return enhanced;
};

// ============================================
// API ROUTES
// ============================================

app.get('/', (req, res) => {
    res.json({
        message: 'EcoScan Backend API',
        version: '2.0.0',
        endpoints: {
            health: '/health',
            analyze: '/api/sustainability/analyze'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiConfigured: !!MISTRAL_API_KEY,
        features: {
            imageQualityCheck: true,
            imageOptimization: true,
            alternativeRecommendations: true
        }
    });
});

app.post('/api/sustainability/analyze', async(req, res) => {
    try {
        const { image, prompt } = req.body;

        // Validation
        if (!image) {
            return res.status(400).json({
                error: 'Image is required',
                details: 'Please upload a valid product image'
            });
        }

        if (!MISTRAL_API_KEY) {
            console.error('MISTRAL_API_KEY not configured');
            return res.status(500).json({
                error: 'Server configuration error',
                details: 'API key not found. Please contact administrator.'
            });
        }

        // Validate image format
        const validation = validateImageFormat(image);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Invalid image format',
                details: validation.error
            });
        }

        console.log('Starting image analysis...');

        // Analyze image quality
        const imageQualityData = await analyzeImageQuality(image);
        console.log('Image quality analysis:', imageQualityData);

        // Check if image quality is too poor
        if (imageQualityData.quality === 'blur' && imageQualityData.confidence < 40) {
            return res.status(400).json({
                error: 'Image quality too poor',
                details: 'The uploaded image is too blurry or unclear. Please upload a clearer, well-lit image with visible product details and labels.',
                imageQuality: imageQualityData.quality,
                confidence: imageQualityData.confidence,
                warnings: imageQualityData.warnings
            });
        }

        // Optimize image
        console.log('Optimizing image...');
        const optimizedImage = await compressAndOptimizeImage(image);
        console.log('Image size:', (optimizedImage.length / 1024).toFixed(2), 'KB');

        // Prepare AI request
        const messages = [{
                role: 'system',
                content: SUSTAINABILITY_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: [{
                        type: 'text',
                        text: prompt || `Analyze this product for comprehensive sustainability assessment. 
                        Image quality detected as: ${imageQualityData.quality}. 
                        Provide detailed environmental impact analysis with specific alternative products and buying links.`
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: optimizedImage
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
                max_tokens: 3000,
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
        analysis = validateAndEnhanceAnalysis(analysis, imageQualityData);

        // Add metadata
        analysis.metadata = {
            analyzedAt: new Date().toISOString(),
            imageQuality: imageQualityData.quality,
            confidence: analysis.confidence,
            warnings: imageQualityData.warnings
        };

        console.log('Analysis complete:', {
            productName: analysis.productName,
            score: analysis.sustainabilityScore,
            confidence: analysis.confidence,
            imageQuality: analysis.imageQuality,
            alternativesCount: analysis.alternatives.length
        });

        res.json({
            success: true,
            analysis,
            imageQuality: imageQualityData
        });

    } catch (error) {
        console.error('Sustainability analysis error:', error);

        // Handle specific error types
        if (error.response) {
            const status = error.response.status;
            const errorData = error.response.data;

            console.error('Mistral API error:', { status, data: errorData });

            if (status === 401 || status === 403) {
                return res.status(500).json({
                    error: 'API authentication failed',
                    details: 'Invalid API credentials. Please check server configuration.'
                });
            }
            if (status === 429) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    details: 'Too many requests. Please try again in a few moments.'
                });
            }
            if (status === 400) {
                return res.status(400).json({
                    error: 'Invalid request',
                    details: 'The image could not be processed. Please try with a different, clearer image.'
                });
            }
            if (status === 413) {
                return res.status(413).json({
                    error: 'Image too large',
                    details: 'Please use an image under 5MB. Try compressing your image first.'
                });
            }
        }

        if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            return res.status(504).json({
                error: 'Request timeout',
                details: 'The AI service is taking too long to respond. Please try again with a smaller or clearer image.'
            });
        }

        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Service unavailable',
                details: 'Unable to connect to AI service. Please try again later.'
            });
        }

        // Generic error
        res.status(500).json({
            error: 'Analysis failed',
            details: 'Failed to analyze product sustainability. Please ensure you uploaded a clear image of the product and try again.',
            technicalDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: {
            health: 'GET /health',
            analyze: 'POST /api/sustainability/analyze'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Payload too large',
            details: 'Image file is too large. Please use an image under 5MB.'
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        details: 'An unexpected error occurred. Please try again.',
        technicalDetails: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🌿 EcoScan Backend Server v2.0');
    console.log('='.repeat(60));
    console.log(`Server running on port: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Key configured: ${MISTRAL_API_KEY ? '✓ Yes' : '✗ No'}`);
    console.log(`Model: ${MISTRAL_MODEL}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('Features:');
    console.log('  ✓ Image quality detection');
    console.log('  ✓ Automatic image optimization');
    console.log('  ✓ Alternative product recommendations');
    console.log('  ✓ Enhanced error handling');
    console.log('='.repeat(60));
});

export default app;