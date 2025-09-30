import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { sampleProducts } from '@/data/sampleProducts';
import { SampleProduct } from '@/types';

interface SampleProductsProps {
  onSampleClick: (product: SampleProduct) => void;
  loading: boolean;
}

export const SampleProducts = ({ onSampleClick, loading }: SampleProductsProps) => {
  return (
    <div className="max-w-7xl mx-auto mb-12 px-4">
      <h3 className="text-xl font-semibold text-muted-foreground mb-6 text-center">
        🔬 Try with sample products:
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {sampleProducts.map((product, index) => (
          <Card
            key={index}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            <Button
              variant="ghost"
              onClick={() => onSampleClick(product)}
              disabled={loading}
              className="w-full h-full p-0 hover:bg-transparent relative"
            >
              <div className="relative w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-lg">
                  <span className="text-primary-foreground font-semibold text-lg">Analyze</span>
                </div>
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm text-foreground truncate">{product.name}</h4>
                <Badge variant="secondary" className="text-xs mt-2">
                  {product.category}
                </Badge>
              </CardContent>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};