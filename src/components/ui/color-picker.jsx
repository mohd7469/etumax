import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ColorPicker = ({ color, onChange, className }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <div className={cn("flex items-center gap-2 border rounded-md p-1 cursor-pointer", className)}>
          <div
            className="w-8 h-8 rounded-md border"
            style={{ backgroundColor: color }}
          />
          <span className="font-mono text-sm">{color}</span>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-0">
        <div className="space-y-2">
          <HexColorPicker color={color} onChange={onChange} />
          <div className="flex items-center gap-2 p-2 border-t">
            <Input
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigator.clipboard.writeText(color)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};