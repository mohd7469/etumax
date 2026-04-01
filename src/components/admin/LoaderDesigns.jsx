import React from 'react';
import { Rings, TailSpin, InfinitySpin, Bars, Puff, Circles, ThreeDots } from 'react-loader-spinner';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const loaderComponents = {
  Rings,
  TailSpin,
  InfinitySpin,
  Bars,
  Puff,
  Circles,
  ThreeDots,
};

const LoaderDesigns = ({ onSelect, selectedStyle, color, size }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Object.keys(loaderComponents).map((styleName) => {
        const LoaderComponent = loaderComponents[styleName];
        const isSelected = selectedStyle === styleName;

        return (
          <Card
            key={styleName}
            onClick={() => onSelect(styleName)}
            className={cn(
              "cursor-pointer transition-all duration-200",
              isSelected ? "border-primary ring-2 ring-primary shadow-lg" : "hover:shadow-md hover:border-gray-300"
            )}
          >
            <CardContent className="p-4 flex flex-col items-center justify-center aspect-square gap-4">
              <div className="flex-grow flex items-center justify-center">
                <LoaderComponent
                  color={color}
                  height={size * 0.5}
                  width={size * 0.5}
                  visible={true}
                />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{styleName}</p>
                {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LoaderDesigns;