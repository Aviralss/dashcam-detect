import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Settings, ExternalLink } from 'lucide-react';

interface RoboflowConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: { modelId: string; version: string };
  onSave: (config: { modelId: string; version: string }) => void;
}

const RoboflowConfig = ({ open, onOpenChange, config, onSave }: RoboflowConfigProps) => {
  const [modelId, setModelId] = useState(config.modelId);
  const [version, setVersion] = useState(config.version);

  const handleSave = () => {
    if (!modelId || !version) {
      toast({
        title: "Missing Information",
        description: "Please provide both Model ID and Version",
        variant: "destructive"
      });
      return;
    }

    onSave({ modelId, version });
    toast({
      title: "Configuration Saved",
      description: "Your Roboflow model is now configured for detection"
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Roboflow Model
          </DialogTitle>
          <DialogDescription>
            Enter your Roboflow model details to enable real-time detection with your custom trained model
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="modelId">Model ID</Label>
            <Input
              id="modelId"
              placeholder="e.g., pothole-detection-abc123"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your Roboflow project workspace
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Model Version</Label>
            <Input
              id="version"
              placeholder="e.g., 1"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Version number of your trained model
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">How to find your model details:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to your Roboflow workspace</li>
              <li>Open your project</li>
              <li>Navigate to the "Deploy" tab</li>
              <li>Look for the API endpoint URL</li>
              <li>Extract the model ID and version from the URL</li>
            </ol>
            <a 
              href="https://docs.roboflow.com/deploy/hosted-api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline mt-2"
            >
              View Roboflow Documentation
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoboflowConfig;
