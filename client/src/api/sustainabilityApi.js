import axios from 'axios';

const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const analyzeSustainability = async(imageFile) => {
    try {
        const base64Image = await fileToBase64(imageFile);

        const requestData = {
            image: base64Image,
            prompt: `Analyze this product image for sustainability. Provide a comprehensive environmental impact assessment including:
1. Product name/type
2. Sustainability score (0-100)
3. Eco certifications (if visible)
4. Recyclability assessment
5. Estimated carbon footprint
6. Water usage impact
7. Material composition analysis
8. Expected product lifespan
9. Energy production/consumption
10. Suggest 3-4 greener alternatives

Format your response as JSON with this exact structure:
{
  "productName": "string",
  "sustainabilityScore": number,
  "ecoLabels": ["string"],
  "recyclability": "string",
  "carbonFootprint": "string",
  "waterFootprint": "string",
  "materialComposition": "string",
  "lifespan": "string",
  "energyProduction": "string",
  "alternatives": ["string"]
}`
        };

        console.log('Sending analysis request to:', `${BACKEND_URL}/api/sustainability/analyze`);
        console.log('Image size:', (base64Image.length / 1024).toFixed(2), 'KB');

        const response = await axios.post(
            `${BACKEND_URL}/api/sustainability/analyze`,
            requestData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            }
        );

        console.log('Analysis response received:', response.data);

        return response.data;
    } catch (error) {
        console.error('Sustainability analysis error:', error);

        if (axios.isAxiosError(error)) {
            if (error.response && error.response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }
            if (error.response && error.response.status === 413) {
                throw new Error('Image too large. Please use an image under 5MB.');
            }
            if (error.response && error.response.status === 504) {
                throw new Error('Request timeout. The server is taking too long to respond.');
            }
            if (error.response && error.response.data && error.response.data.error) {
                throw new Error(error.response.data.error);
            }
            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please ensure the backend is running.');
            }
        }

        throw new Error('Failed to analyze sustainability. Please try again.');
    }
};

const fileToBase64 = (file) => {
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