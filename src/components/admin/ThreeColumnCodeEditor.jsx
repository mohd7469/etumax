
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import CodeEditorWithSyntaxHighlight from './CodeEditorWithSyntaxHighlight';
import { LayoutTemplate, AlignLeft as AlignTop, AlignCenter, PanelBottom as AlignBottom } from 'lucide-react';

const ThreeColumnCodeEditor = ({
  headerCode, setHeaderCode,
  bodyCode, setBodyCode,
  footerCode, setFooterCode,
  toggles, setToggles
}) => {
  
  const handleToggle = (key) => (checked) => {
    setToggles(prev => ({ ...prev, [key]: checked }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <LayoutTemplate className="w-6 h-6 text-primary" />
          Mobile Layout Code Editor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Header Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <AlignTop className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="toggle-header" className="font-semibold text-sm">Header Section</Label>
              </div>
              <Switch 
                id="toggle-header" 
                checked={toggles.header} 
                onCheckedChange={handleToggle('header')} 
              />
            </div>
            <CodeEditorWithSyntaxHighlight
              code={headerCode}
              onChange={setHeaderCode}
              language="markup"
              placeholder="<!-- Header HTML -->&#10;<header>My Header</header>"
              height="350px"
            />
          </div>

          {/* Body Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <AlignCenter className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="toggle-body" className="font-semibold text-sm">Main Content (Body)</Label>
              </div>
              <Switch 
                id="toggle-body" 
                checked={toggles.body} 
                onCheckedChange={handleToggle('body')} 
              />
            </div>
            <CodeEditorWithSyntaxHighlight
              code={bodyCode}
              onChange={setBodyCode}
              language="markup"
              placeholder="<!-- Main Content HTML -->&#10;<main>Main Content</main>"
              height="350px"
            />
          </div>

          {/* Footer Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border">
              <div className="flex items-center gap-2">
                <AlignBottom className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="toggle-footer" className="font-semibold text-sm">Footer Section</Label>
              </div>
              <Switch 
                id="toggle-footer" 
                checked={toggles.footer} 
                onCheckedChange={handleToggle('footer')} 
              />
            </div>
            <CodeEditorWithSyntaxHighlight
              code={footerCode}
              onChange={setFooterCode}
              language="markup"
              placeholder="<!-- Footer HTML -->&#10;<footer>My Footer</footer>"
              height="350px"
            />
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default ThreeColumnCodeEditor;
