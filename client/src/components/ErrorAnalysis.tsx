import { AlertCircle, Camera, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorAnalysisProps {
  error: string;
  suggestions?: string[];
  onRetry: () => void;
}

export const ErrorAnalysis = ({ error, suggestions, onRetry }: ErrorAnalysisProps) => {
  return (
    <div className="max-w-3xl mx-auto mt-12 animate-in slide-in-from-bottom duration-500">
      <Card className="border-red-200 dark:border-red-800 shadow-xl">
        <CardContent className="p-8">
          {/* Error Icon and Title */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">Product Not Recognized</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {error}
            </p>
          </div>

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <>
              <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-200 text-lg">
                  Tips for Better Results
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300 mt-2">
                  <ul className="space-y-2 mt-2">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Example Good vs Bad Images */}
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Image Quality Examples
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-700">
                    <div className="font-semibold text-green-800 dark:text-green-200 mb-2">✓ Good Images</div>
                    <ul className="text-green-700 dark:text-green-300 space-y-1">
                      <li>• Clear, focused product</li>
                      <li>• Visible labels/branding</li>
                      <li>• Good lighting</li>
                      <li>• Plain background</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-700">
                    <div className="font-semibold text-red-800 dark:text-red-200 mb-2">✗ Avoid</div>
                    <ul className="text-red-700 dark:text-red-300 space-y-1">
                      <li>• Blurry or dark images</li>
                      <li>• No visible labels</li>
                      <li>• Cluttered background</li>
                      <li>• Extreme angles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Retry Button */}
          <Button 
            onClick={onRetry} 
            className="w-full" 
            size="lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Try Another Image
          </Button>

          {/* Additional Help */}
          <p className="text-center text-sm text-muted-foreground mt-4">
            Need help? Make sure your product has visible labels, packaging, or branding.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};