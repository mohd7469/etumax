
import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Code2, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const HeaderFooterCodeEditor = ({ initialCode, onSave }) => {
  const { toast } = useToast();
  const [headerCode, setHeaderCode] = useState(initialCode?.header || '');
  const [bodyCode, setBodyCode] = useState(initialCode?.body || '');
  const [footerCode, setFooterCode] = useState(initialCode?.footer || '');

  useEffect(() => {
    if (initialCode) {
      setHeaderCode(initialCode.header || '');
      setBodyCode(initialCode.body || '');
      setFooterCode(initialCode.footer || '');
    }
  }, [initialCode]);

  const handleSave = () => {
    onSave({ header: headerCode, body: bodyCode, footer: footerCode });
    toast({
      title: 'Code Saved! ✨',
      description: 'Header, Body, and Footer code has been successfully updated.',
    });
  };

  const handleClear = () => {
    setHeaderCode('');
    setBodyCode('');
    setFooterCode('');
    onSave({ header: '', body: '', footer: '' });
    toast({
      variant: 'destructive',
      title: 'Code Cleared',
      description: 'Header, Body, and Footer code has been removed.',
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code2 className="w-5 h-5 text-primary" />
            Header Code
          </CardTitle>
          <CardDescription>
            Inject custom code into the <code>&lt;head&gt;</code> section. Useful for meta tags, analytics, tracking pixels, or external CSS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="code-editor-container bg-[#282c34] rounded-lg overflow-hidden border border-gray-700 shadow-inner min-h-[250px] relative">
            <Editor
              value={headerCode}
              onValueChange={setHeaderCode}
              highlight={code => highlight(code, languages.markup, 'markup')}
              padding={16}
              placeholder="<!-- Add your header HTML/JS/CSS here -->"
              className="text-sm font-mono text-gray-300 min-h-[250px] w-full"
              style={{ fontFamily: '"Fira Code", "Consolas", monospace', minHeight: '250px' }}
            />
          </div>
          <div className="text-right mt-2 text-xs text-gray-500 font-medium">
            {headerCode.length} characters
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <LayoutTemplate className="w-5 h-5 text-primary" />
            Body Code
          </CardTitle>
          <CardDescription>
            Inject custom code right after the opening <code>&lt;body&gt;</code> tag or as main content HTML/JSX overlays. Useful for global banners or noscript tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="code-editor-container bg-[#282c34] rounded-lg overflow-hidden border border-gray-700 shadow-inner min-h-[250px] relative">
            <Editor
              value={bodyCode}
              onValueChange={setBodyCode}
              highlight={code => highlight(code, languages.markup, 'markup')}
              padding={16}
              placeholder="<!-- Add your body HTML/JS here -->"
              className="text-sm font-mono text-gray-300 min-h-[250px] w-full"
              style={{ fontFamily: '"Fira Code", "Consolas", monospace', minHeight: '250px' }}
            />
          </div>
          <div className="text-right mt-2 text-xs text-gray-500 font-medium">
            {bodyCode.length} characters
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-sm border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Code2 className="w-5 h-5 text-primary" />
            Footer Code
          </CardTitle>
          <CardDescription>
            Inject custom code before the closing <code>&lt;/body&gt;</code> tag. Useful for tracking scripts or external widgets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="code-editor-container bg-[#282c34] rounded-lg overflow-hidden border border-gray-700 shadow-inner min-h-[250px] relative">
            <Editor
              value={footerCode}
              onValueChange={setFooterCode}
              highlight={code => highlight(code, languages.markup, 'markup')}
              padding={16}
              placeholder="<!-- Add your footer HTML/JS/CSS here -->"
              className="text-sm font-mono text-gray-300 min-h-[250px] w-full"
              style={{ fontFamily: '"Fira Code", "Consolas", monospace', minHeight: '250px' }}
            />
          </div>
          <div className="text-right mt-2 text-xs text-gray-500 font-medium">
            {footerCode.length} characters
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2 pb-6">
        <Button variant="outline" onClick={handleClear} className="bg-white">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Code
        </Button>
      </div>
    </div>
  );
};

export default HeaderFooterCodeEditor;
