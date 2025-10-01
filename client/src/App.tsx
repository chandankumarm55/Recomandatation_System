import { useState, useEffect } from 'react';
import { Leaf, Camera, Globe, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UploadForm } from '@/components/UploadForm';
import { ResultCard } from '@/components/ResultCard';
import { ErrorAnalysis } from '@/components/ErrorAnalysis';
import { SampleProducts } from '@/components/SampleProducts';
import { Toast } from '@/components/Toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { analyzeSustainability } from './api/sustainabilityApi';
import { ProductAnalysis, ApiError } from './types';

function App() {
  const [theme, setTheme] = useState('light');
  const [result, setResult] = useState<ProductAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [imageWarnings, setImageWarnings] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const showToast = (message: string, type: 'error' | 'success' | 'warning') => {
    setToast({ message, type });
  };

  const handleSubmit = async (file: File, preview: string) => {
    setLoading(true);
    setError(null);
    setImageWarnings([]);
    setResult(null);

    try {
      console.log('Submitting file for analysis:', file.name);
      
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB. Please compress your image and try again.');
      }

      const response = await analyzeSustainability(file);
      
      // Check for image quality warnings
      if (response.imageQuality?.warnings && response.imageQuality.warnings.length > 0) {
        setImageWarnings(response.imageQuality.warnings);
      }

      setResult({
        ...response.analysis,
        imageUrl: preview
      });
      
      showToast('Analysis complete! Your product has been evaluated.', 'success');
      console.log('Analysis complete:', response.analysis);
    } catch (err: any) {
      console.error('Analysis error:', err);
      
      // Handle unknown product error
      if (err.isUnknownProduct) {
        setError({
          error: err.message,
          message: err.message,
          suggestions: err.suggestions,
          isUnknownProduct: true
        });
        showToast('Unable to identify product from image', 'error');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze product';
        setError({
          error: errorMessage,
          message: errorMessage
        });
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = async (product: any) => {
    setLoading(true);
    setError(null);
    setImageWarnings([]);
    setResult(null);

    try {
      // Fetch the sample image and convert to file
      const response = await fetch(product.image);
      const blob = await response.blob();
      const file = new File([blob], 'sample-product.jpg', { type: 'image/jpeg' });
      
      // Analyze the sample product
      const analysisResponse = await analyzeSustainability(file);
      
      // Check for image quality warnings
      if (analysisResponse.imageQuality?.warnings && analysisResponse.imageQuality.warnings.length > 0) {
        setImageWarnings(analysisResponse.imageQuality.warnings);
      }

      setResult({
        ...analysisResponse.analysis,
        imageUrl: product.image
      });
      
      showToast('Sample product analyzed successfully!', 'success');
    } catch (err: any) {
      console.error('Sample analysis error:', err);
      
      // Handle unknown product error
      if (err.isUnknownProduct) {
        setError({
          error: err.message,
          message: err.message,
          suggestions: err.suggestions,
          isUnknownProduct: true
        });
        showToast('Unable to identify product from image', 'error');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to analyze product';
        setError({
          error: errorMessage,
          message: errorMessage
        });
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setResult(null);
    setError(null);
    setImageWarnings([]);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setImageWarnings([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12 text-green-600 dark:text-green-400 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
              EcoScan
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-6">
            AI-Powered Sustainable Shopping Assistant
          </p>
          
          {/* Project Description */}
          <Card className="max-w-4xl mx-auto mb-8 bg-background/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                About EcoScan AR Shopping Assistant
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                EcoScan is an innovative Augmented Reality (AR) shopping assistant designed to revolutionize sustainable consumer behavior. 
                Using advanced AI and computer vision, our platform instantly analyzes product images to provide comprehensive sustainability metrics, 
                eco-certifications, and greener alternatives with direct buying links.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                  <CardContent className="text-center p-4">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                    <h3 className="font-semibold text-foreground">Instant Analysis</h3>
                    <p className="text-sm text-muted-foreground">Scan any product for immediate sustainability insights</p>
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                  <CardContent className="text-center p-4">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-foreground">Global Impact</h3>
                    <p className="text-sm text-muted-foreground">Contributing to UN Sustainable Development Goal 12</p>
                  </CardContent>
                </Card>
                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                  <CardContent className="text-center p-4">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-semibold text-foreground">Smart Alternatives</h3>
                    <p className="text-sm text-muted-foreground">Discover eco-friendly alternatives with buying links</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Image Quality Warnings */}
          {imageWarnings.length > 0 && !error && (
            <div className="max-w-2xl mx-auto mb-6">
              <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTitle className="text-yellow-800 dark:text-yellow-200">Image Quality Notice</AlertTitle>
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc list-inside">
                    {imageWarnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Sample Products - Only show when no result and no error */}
          {!result && !error && (
            <SampleProducts onSampleClick={handleSampleClick} loading={loading} />
          )}
        </div>

        {/* Conditional Rendering: Error Analysis, Upload Form, or Results */}
        {error && error.isUnknownProduct ? (
          <ErrorAnalysis
            error={error.message || error.error}
            suggestions={error.suggestions}
            onRetry={handleReset}
          />
        ) : !result ? (
          <UploadForm onSubmit={handleSubmit} loading={loading} onReset={handleReset} />
        ) : (
          <ResultCard result={result} onAnalyzeAnother={handleAnalyzeAnother} />
        )}
      </div>
    </div>
  );
}

export default App;