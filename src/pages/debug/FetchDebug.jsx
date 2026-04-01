import React, { useState } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const FetchDebug = () => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [status, setStatus] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setStatus(null);
    setResponse(null);
    setError(null);

    try {
      const res = await apiFetch(url);
      setStatus(res.status);
      
      const contentType = res.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }
      
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">CORS Proxy Debugger</h1>
      <p className="text-gray-600">
        Test external API calls through the configured CORS proxy (<code>https://cors-anywhere.herokuapp.com/</code>).
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Test Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="Enter external API URL..." 
            />
            <Button onClick={handleTest} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Fetch
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
              <XCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-bold">Error Occurred</p>
                <p className="font-mono text-sm">{error}</p>
              </div>
            </div>
          )}

          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${status >= 200 && status < 300 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
              {status >= 200 && status < 300 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              <div>
                <span className="font-bold">Status:</span> {status}
              </div>
            </div>
          )}

          {response && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Response Body:</h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-xs font-mono">
                {typeof response === 'object' ? JSON.stringify(response, null, 2) : response}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mixed Content Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Clicking this will attempt to fetch an insecure HTTP resource. If you are on HTTPS, <code>apiFetch</code> should block it immediately.
          </p>
          <Button 
            variant="secondary"
            onClick={() => {
              setUrl('http://insecure-endpoint.test/api');
              // We rely on the user clicking "Test Fetch" after setting the state
            }}
          >
            Load Insecure URL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FetchDebug;