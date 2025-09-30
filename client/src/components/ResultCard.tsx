import { Leaf, Award, Recycle, TrendingUp, Droplets, Globe, ShoppingBag, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ProductAnalysis } from '@/types';

interface ResultCardProps {
  result: ProductAnalysis;
  onAnalyzeAnother: () => void;
}

export const ResultCard = ({ result, onAnalyzeAnother }: ResultCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Very Poor';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
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

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 animate-in slide-in-from-bottom duration-600">
      <Card className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-background to-muted/30">
        {/* Header Section */}
        <div className="relative h-64 bg-gradient-to-br from-primary to-primary/80">
          {result.imageUrl && (
            <>
              <img
                src={result.imageUrl}
                alt={result.productName}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </>
          )}
          <div className="absolute top-4 right-4">
            <Button variant="secondary" onClick={onAnalyzeAnother}>
              Analyze Another
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              {result.productName}
            </h2>
            <p className="text-white/80">Environmental Impact Analysis</p>
          </div>
        </div>

        <CardContent className="p-8">
          {/* Sustainability Score */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                <CardTitle className="text-xl">Sustainability Score</CardTitle>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(result.sustainabilityScore)}`}>
                  {result.sustainabilityScore}
                </div>
                <div className={`text-sm font-medium ${getScoreColor(result.sustainabilityScore)}`}>
                  {getScoreLabel(result.sustainabilityScore)}
                </div>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={result.sustainabilityScore} 
                className="h-4"
              />
              <div 
                className={`absolute top-0 left-0 h-4 rounded-full transition-all duration-1000 ease-out ${getProgressColor(result.sustainabilityScore)}`}
                style={{ width: `${result.sustainabilityScore}%` }}
              />
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Eco Labels */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-xl">Eco Labels & Certifications</CardTitle>
            </div>
            <div className="flex flex-wrap gap-3">
              {result.ecoLabels.map((label, index) => (
                <Badge key={index} variant="default" className="px-3 py-1">
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Environmental Metrics */}
          <div className="mb-8">
            <CardTitle className="text-xl mb-4">Environmental Metrics</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {environmentalMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={index} className="p-4 bg-muted/30 border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent className={`w-5 h-5 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                      <h4 className="font-semibold text-foreground">{metric.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{metric.value}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Greener Alternatives */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-xl">Greener Alternatives</CardTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.alternatives.map((alt, index) => (
                <Card
                  key={index}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <Recycle className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="text-foreground font-medium">
                      {alt}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};