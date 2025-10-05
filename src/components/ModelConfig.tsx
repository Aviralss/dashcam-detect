import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save, Info } from 'lucide-react';

interface ModelConfigProps {
  onSave: (config: {
    modelType: 'roboflow' | 'huggingface' | 'custom' | 'browser';
    modelEndpoint?: string;
    apiKey?: string;
  }) => void;
  currentConfig?: {
    modelType: 'roboflow' | 'huggingface' | 'custom' | 'browser';
    modelEndpoint?: string;
    apiKey?: string;
  };
}

export const ModelConfig = ({ onSave, currentConfig }: ModelConfigProps) => {
  const [modelType, setModelType] = useState(currentConfig?.modelType || 'browser');
  const [endpoint, setEndpoint] = useState(currentConfig?.modelEndpoint || '');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');

  const handleSave = () => {
    onSave({
      modelType: modelType as any,
      modelEndpoint: endpoint || undefined,
      apiKey: apiKey || undefined,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <CardTitle>Detection Model Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure your custom YOLOv8 model for pothole detection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="modelType">Model Type</Label>
          <Select value={modelType} onValueChange={(value) => setModelType(value as any)}>
            <SelectTrigger id="modelType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="browser">Browser (Default YOLO)</SelectItem>
              <SelectItem value="roboflow">Roboflow</SelectItem>
              <SelectItem value="huggingface">Hugging Face</SelectItem>
              <SelectItem value="custom">Custom API</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {modelType === 'roboflow' && (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Upload your YOLOv8 model to Roboflow and get your API endpoint from:
                <br />
                <code className="text-xs">https://app.roboflow.com/</code>
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Roboflow Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://detect.roboflow.com/your-project/1"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Roboflow API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your Roboflow API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </>
        )}

        {modelType === 'huggingface' && (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Convert your YOLOv8 to ONNX, upload to Hugging Face, and use the inference API.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Hugging Face Model Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://api-inference.huggingface.co/models/your-username/your-model"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">Hugging Face API Token</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="hf_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </>
        )}

        {modelType === 'custom' && (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Deploy your YOLOv8 model with Flask/FastAPI and provide the endpoint URL.
                <br />
                Expected response format: {`{"detections": [{"x": 0, "y": 0, "width": 0, "height": 0, "confidence": 0.9, "label": "pothole"}]}`}
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="endpoint">Custom API Endpoint</Label>
              <Input
                id="endpoint"
                placeholder="https://your-api.com/detect"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key (Optional)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Your API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </>
        )}

        {modelType === 'browser' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Using the default browser-based YOLO model. This runs entirely in your browser.
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSave} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Configuration
        </Button>
      </CardContent>
    </Card>
  );
};
