import { useState, useEffect } from 'react';
import { Leaf, Camera, Globe, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UploadForm } from '@/components/UploadForm';
import { ResultCard } from '@/components/ResultCard';
import { SampleProducts } from '@/components/SampleProducts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { analyzeSustainability } from './api/sustainabilityApi';

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ecoscan-theme');
      if (savedTheme) return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('ecoscan-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSubmit = async (file, preview) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting file for analysis:', file.name);
      const response = await analyzeSustainability(file);
      
      setResult({
        ...response.analysis,
        imageUrl: preview
      });
      
      console.log('Analysis complete:', response.analysis);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze product';
      setError(errorMessage);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = async (product) => {
    setLoading(true);
    setError(null);

    try {
      // Fetch the sample image and convert to file
      const response = await fetch(product.image);
      const blob = await response.blob();
      const file = new File([blob], 'sample-product.jpg', { type: 'image/jpeg' });
      
      // Analyze the sample product
      const analysisResponse = await analyzeSustainability(file);
      
      setResult({
        ...analysisResponse.analysis,
        imageUrl: product.image
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze product';
      setError(errorMessage);
      console.error('Sample analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setResult(null);
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-500">
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

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
                eco-certifications, and greener alternatives.
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
                    <p className="text-sm text-muted-foreground">Discover eco-friendly product alternatives instantly</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <div className="max-w-2xl mx-auto mb-6">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Sample Products */}
          {!result && (
            <SampleProducts onSampleClick={handleSampleClick} loading={loading} />
          )}
        </div>

        {/* Upload Form or Results */}
        {!result ? (
          <UploadForm onSubmit={handleSubmit} loading={loading} onReset={handleReset} />
        ) : (
          <ResultCard result={result} onAnalyzeAnother={handleAnalyzeAnother} />
        )}
      </div>
    </div>
  );
}

export default App;