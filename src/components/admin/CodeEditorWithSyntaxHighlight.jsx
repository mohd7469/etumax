
import React, { useState } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markup';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CodeEditorWithSyntaxHighlight = ({
  code,
  onChange,
  language = 'markup',
  placeholder = 'Enter code here...',
  height = '300px',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative border rounded-md bg-[#1e1e1e] overflow-hidden group flex flex-col shadow-inner">
      <div className="flex justify-between items-center bg-[#2d2d2d] px-3 py-1.5 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">
          {language.toUpperCase()}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-mono">
            {code?.length || 0} chars
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-700"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>
      <div
        className="overflow-auto custom-scrollbar"
        style={{ height, maxHeight: '500px' }}
      >
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={(code) => highlight(code, languages[language] || languages.markup, language)}
          padding={16}
          placeholder={placeholder}
          className="text-sm font-mono text-gray-100 min-h-full"
          style={{
            fontFamily: '"Fira Code", "Consolas", monospace',
            minHeight: '100%',
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditorWithSyntaxHighlight;
