import { useState } from 'react';
import { Leaf, Award, Recycle, TrendingUp, Droplets, Globe, ShoppingBag, Zap, ExternalLink, AlertCircle, CheckCircle, XCircle, Sparkles, Store } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Alternative } from '../types';
import { generatePlatformLinks, getPlatformColor, getPlatformDisplayName } from '../utils/platformLinks';

interface ResultCardProps {
  result: {
    productName: string;
    sustainabilityScore: number;
    ecoLabels: string[];
    recyclability: string;
    carbonFootprint: string;
    waterFootprint: string;
    materialComposition: string;
    lifespan: string;
    energyProduction: string;
    alternatives: (string | Alternative)[];
    imageUrl?: string;
    imageQuality?: 'good' | 'poor' | 'blur';
    confidence?: number;
  };
  onAnalyzeAnother: () => void;
}

export const ResultCard = ({ result, onAnalyzeAnother }: ResultCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', emoji: '🌟' };
    if (score >= 80) return { label: 'Very Good', emoji: '✅' };
    if (score >= 70) return { label: 'Good', emoji: '👍' };
    if (score >= 60) return { label: 'Fair', emoji: '⚠️' };
    if (score >= 40) return { label: 'Poor', emoji: '⚠️' };
    return { label: 'Very Poor', emoji: '❌' };
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRecommendationMessage = (score: number) => {
    if (score >= 80) {
      return {
        type: 'success' as const,
        title: 'Great Choice! 🎉',
        message: 'This product has excellent sustainability credentials. You\'re making a positive environmental impact!'
      };
    }
    if (score >= 60) {
      return {
        type: 'warning' as const,
        title: 'Good, But Could Be Better',
        message: 'This product has decent sustainability. Check out our recommendations below for even greener alternatives.'
      };
    }
    return {
      type: 'error' as const,
      title: 'Consider Alternatives 🌍',
      message: 'This product has significant environmental impact. We strongly recommend exploring the eco-friendly alternatives below.'
    };
  };

  const parseAlternative = (alt: string | Alternative): Alternative => {
    if (typeof alt === 'object') {
      // Generate platform links if not provided
      if (!alt.platformLinks) {
        return {
          ...alt,
          platformLinks: generatePlatformLinks(alt.name)
        };
      }
      return alt;
    }
    
    // Parse string format alternatives (fallback)
    return {
      name: alt,
      description: 'Eco-friendly alternative with better sustainability profile',
      platformLinks: generatePlatformLinks(alt)
    };
  };

  const environmentalMetrics = [
    {
      icon: Recycle,
      title: 'Recyclability',
      value: result.recyclability,
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Carbon Footprint',
      value: result.carbonFootprint,
      color: 'orange'
    },
    {
      icon: Droplets,
      title: 'Water Footprint',
      value: result.waterFootprint,
      color: 'blue'
    },
    {
      icon: Globe,
      title: 'Material',
      value: result.materialComposition,
      color: 'purple'
    },
    {
      icon: Award,
      title: 'Lifespan',
      value: result.lifespan,
      color: 'indigo'
    },
    {
      icon: Zap,
      title: 'Energy',
      value: result.energyProduction,
      color: 'yellow'
    }
  ];

  const recommendation = getRecommendationMessage(result.sustainabilityScore);
  const scoreInfo = getScoreLabel(result.sustainabilityScore);

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 animate-in slide-in-from-bottom duration-600">
      {/* Image Quality Warning */}
      {(result.imageQuality === 'poor' || result.imageQuality === 'blur') && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Image Quality Warning</AlertTitle>
          <AlertDescription>
            The uploaded image appears to be {result.imageQuality === 'blur' ? 'blurry' : 'of poor quality'}. 
            For more accurate analysis, please upload a clear, well-lit image of the product with visible labels and text.
          </AlertDescription>
        </Alert>
      )}

      {result.confidence && result.confidence < 70 && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">Low Confidence Analysis</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            The analysis confidence is {result.confidence}%. For better results, try uploading a clearer image with visible product details and labels.
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-background via-background to-muted/30">
        {/* Header Section */}
        <div className="relative h-72 bg-gradient-to-br from-primary to-primary/80 overflow-hidden">
          {result.imageUrl && (
            <>
              <img
                src={result.imageUrl}
                alt={result.productName}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </>
          )}
          <div className="absolute top-6 right-6 flex gap-3">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={onAnalyzeAnother}
              className="shadow-lg hover:scale-105 transition-transform"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Another
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-3 mb-2">
              <Leaf className="w-8 h-8 text-white animate-pulse" />
              <h2 className="text-4xl font-bold text-white">
                {result.productName}
              </h2>
            </div>
            <p className="text-white/90 text-lg">Environmental Impact Analysis Report</p>
          </div>
        </div>

        <CardContent className="p-8">
          {/* Sustainability Score with Recommendation */}
          <div className="mb-8">
            <Card className={`p-6 ${getScoreBgColor(result.sustainabilityScore)} border-2`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-full">
                    <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Sustainability Score</CardTitle>
                    <p className="text-sm text-muted-foreground">Environmental Impact Rating</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-6xl font-bold ${getScoreColor(result.sustainabilityScore)}`}>
                    {result.sustainabilityScore}
                  </div>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <span className="text-2xl">{scoreInfo.emoji}</span>
                    <span className={`text-lg font-semibold ${getScoreColor(result.sustainabilityScore)}`}>
                      {scoreInfo.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative mb-4">
                <Progress 
                  value={result.sustainabilityScore} 
                  className="h-6 bg-gray-200 dark:bg-gray-700"
                />
                <div 
                  className={`absolute top-0 left-0 h-6 rounded-full transition-all duration-1000 ease-out ${getProgressColor(result.sustainabilityScore)}`}
                  style={{ width: `${result.sustainabilityScore}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {result.sustainabilityScore}%
                </span>
              </div>

              <Alert 
                variant={recommendation.type === 'error' ? 'destructive' : 'default'}
                className={recommendation.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : ''}
              >
                {recommendation.type === 'success' ? <CheckCircle className="h-4 w-4" /> : 
                 recommendation.type === 'error' ? <XCircle className="h-4 w-4" /> : 
                 <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{recommendation.title}</AlertTitle>
                <AlertDescription>{recommendation.message}</AlertDescription>
              </Alert>
            </Card>
          </div>

          <Separator className="mb-8" />

          {/* Eco Labels */}
          {result.ecoLabels && result.ecoLabels.length > 0 && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-xl">Eco Labels & Certifications</CardTitle>
                </div>
                <div className="flex flex-wrap gap-3">
                  {result.ecoLabels.map((label, index) => (
                    <Badge 
                      key={index} 
                      variant="default" 
                      className="px-4 py-2 text-sm hover:scale-105 transition-transform"
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <Separator className="mb-8" />
            </>
          )}

          {/* Environmental Metrics */}
          <div className="mb-8">
            <CardTitle className="text-xl mb-6 flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary" />
              Environmental Metrics
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {environmentalMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card 
                    key={index} 
                    className="p-5 bg-gradient-to-br from-muted/50 to-muted/30 border hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-background rounded-full">
                        <IconComponent className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                      </div>
                      <h4 className="font-semibold text-foreground">{metric.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{metric.value}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Greener Alternatives with Multi-Platform Support */}
          {result.alternatives && result.alternatives.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <CardTitle className="text-xl">
                  {result.sustainabilityScore < 60 ? 'Recommended ' : ''}Greener Alternatives
                </CardTitle>
              </div>
              
              {result.sustainabilityScore < 60 && (
                <Alert className="mb-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                  <ShoppingBag className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-800 dark:text-purple-200">
                    Better Options Available
                  </AlertTitle>
                  <AlertDescription className="text-purple-700 dark:text-purple-300">
                    Based on your product's sustainability score, we recommend considering these eco-friendly alternatives 
                    for a more positive environmental impact. Shop from your preferred platform below!
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-6">
                {result.alternatives.map((alt, index) => {
                  const alternative = parseAlternative(alt);
                  
                  return (
                    <Card
                      key={index}
                      className="overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-300"
                    >
                      <CardContent className="p-6">
                        {/* Alternative Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex-shrink-0">
                            <Recycle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-foreground mb-2">{alternative.name}</h4>
                            {alternative.description && (
                              <p className="text-muted-foreground mb-3">{alternative.description}</p>
                            )}
                            <div className="flex flex-wrap gap-2 items-center">
                              {alternative.score && (
                                <Badge variant="outline" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold">
                                  ⭐ Score: {alternative.score}/100
                                </Badge>
                              )}
                              {alternative.price && (
                                <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold">
                                  💰 {alternative.price}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Shopping Platform Links */}
                        {alternative.platformLinks && alternative.platformLinks.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Store className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm font-semibold text-muted-foreground">
                                Shop on Your Preferred Platform:
                              </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {alternative.platformLinks.map((platformLink, idx) => (
                                <Button
                                  key={idx}
                                  variant="default"
                                  size="sm"
                                  className={`w-full ${getPlatformColor(platformLink.platform)} text-white font-semibold shadow-md hover:shadow-lg transition-all`}
                                  onClick={() => window.open(platformLink.url, '_blank', 'noopener,noreferrer')}
                                >
                                  {getPlatformDisplayName(platformLink.platform)}
                                  <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {result.sustainabilityScore < 60 && (
                <Alert className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-800 dark:text-blue-200">💡 Pro Tip</AlertTitle>
                  <AlertDescription className="text-blue-700 dark:text-blue-300">
                    When shopping for sustainable products, look for certifications like Fair Trade, Energy Star, 
                    FSC-certified, or Cradle to Cradle. Buy local when possible to reduce transportation emissions!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};