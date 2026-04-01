
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowDownAZ, Shuffle, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const SortFilterControl = ({ 
  activeMethod, 
  onMethodChange, 
  onCategoryChange, 
  categories, 
  currentCategory,
  filtersEnabled = true,
  sortingEnabled = true
}) => {
  if (!filtersEnabled && !sortingEnabled) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white p-4 rounded-xl border shadow-sm mb-8">
      <div className="flex items-center gap-3 md:mr-auto">
        <span className="font-semibold text-gray-700 whitespace-nowrap">Active Sort:</span>
        <Badge variant="default" className="text-sm px-3 py-1 bg-primary text-primary-foreground">
          {activeMethod === 'category' ? 'Category Priority' : activeMethod === 'price' ? 'Price (Low to High)' : 'Random Sort'}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {filtersEnabled && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant={activeMethod === 'category' ? 'default' : 'outline'}
              onClick={() => onMethodChange('category')}
              className={cn("gap-2 whitespace-nowrap", activeMethod === 'category' && "shadow-md")}
            >
              <Filter className="w-4 h-4" />
              Category Filter
            </Button>

            {activeMethod === 'category' && (
              <Select 
                value={currentCategory} 
                onValueChange={(val) => onCategoryChange({ id: val, slug: val })}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug || cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {sortingEnabled && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={activeMethod === 'price' ? 'default' : 'outline'}
              onClick={() => onMethodChange('price')}
              className={cn("gap-2 flex-1 sm:flex-none whitespace-nowrap", activeMethod === 'price' && "shadow-md")}
            >
              <ArrowDownAZ className="w-4 h-4" />
              Price Sort
            </Button>

            <Button
              variant={activeMethod === 'random' ? 'default' : 'outline'}
              onClick={() => onMethodChange('random')}
              className={cn("gap-2 flex-1 sm:flex-none whitespace-nowrap", activeMethod === 'random' && "shadow-md")}
            >
              <Shuffle className="w-4 h-4" />
              Random
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortFilterControl;
