
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save, Clock, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const AdminPuzzleTimerSettings = ({ settings, onChange, onSave }) => {
  const { toast } = useToast();

  const handleSave = async () => {
    const duration = parseInt(settings.timeLimit, 10);
    if (isNaN(duration) || duration < 10 || duration > 300) {
      toast({ 
        title: 'Validation Error', 
        description: 'Timer duration must be between 10 and 300 seconds.', 
        variant: 'destructive' 
      });
      return;
    }
    
    await onSave();
  };

  const imagesCount = Array.isArray(settings.images) ? settings.images.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> 
          Timer Configuration
        </CardTitle>
        <CardDescription>Configure a countdown timer to increase urgency and auto-cycle through puzzle images.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
          <div>
            <Label className="text-base font-semibold">Enable Timer</Label>
            <p className="text-sm text-gray-500">Show a countdown timer during the puzzle.</p>
          </div>
          <Switch 
            checked={!!settings.timerEnabled} 
            onCheckedChange={(v) => onChange('timerEnabled', v)} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Timer Duration (Seconds)</Label>
            <Input
              type="number"
              min="10" 
              max="300"
              value={settings.timeLimit ?? 60}
              onChange={(e) => onChange('timeLimit', parseInt(e.target.value, 10))}
              disabled={!settings.timerEnabled}
            />
            <p className="text-xs text-muted-foreground">Default is 60. Minimum 10, Maximum 300.</p>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center justify-between border p-3 rounded-md h-[42px] mt-6 transition-opacity ${!settings.timerEnabled ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <Label className="mb-0">Image Cycling</Label>
                </div>
              </div>
              <Switch 
                checked={!!settings.imageCyclingEnabled} 
                onCheckedChange={(v) => onChange('imageCyclingEnabled', v)} 
                disabled={!settings.timerEnabled}
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight px-1">Automatically cycle through configured images when the timer expires.</p>
          </div>
        </div>

        <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100 flex justify-between items-center">
          <div>
            <strong>Linked Images:</strong> {imagesCount}
          </div>
          {!!settings.imageCyclingEnabled && imagesCount > 1 && settings.timerEnabled && (
            <div className="text-blue-600 font-medium animate-pulse flex items-center gap-2">
              <RefreshCw className="w-3 h-3" /> Cycling Enabled
            </div>
          )}
          {!!settings.imageCyclingEnabled && imagesCount <= 1 && settings.timerEnabled && (
            <div className="text-amber-600 font-medium">Add more images to cycle</div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={handleSave} className="w-full md:w-auto">
            <Save className="w-4 h-4 mr-2" /> Save Timer Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper icon
const RefreshCw = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

export default AdminPuzzleTimerSettings;
