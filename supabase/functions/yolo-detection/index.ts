import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, modelEndpoint, apiKey, modelType = 'roboflow' } = await req.json();

    console.log('Processing detection request for model type:', modelType);

    let detections = [];

    // Roboflow API Integration
    if (modelType === 'roboflow') {
      const roboflowApiKey = apiKey || Deno.env.get('ROBOFLOW_API_KEY');
      const endpoint = modelEndpoint || Deno.env.get('ROBOFLOW_MODEL_ENDPOINT');

      if (!roboflowApiKey || !endpoint) {
        throw new Error('Roboflow API key or endpoint not configured');
      }

      const response = await fetch(`${endpoint}?api_key=${roboflowApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: imageData, // Base64 image
      });

      const result = await response.json();
      console.log('Roboflow response:', result);

      // Transform Roboflow format to our format
      detections = (result.predictions || []).map((pred: any) => ({
        x: pred.x - pred.width / 2,
        y: pred.y - pred.height / 2,
        width: pred.width,
        height: pred.height,
        confidence: pred.confidence,
        label: pred.class,
        severity: pred.confidence > 0.8 ? 'high' : pred.confidence > 0.5 ? 'medium' : 'low'
      }));
    }
    
    // Hugging Face API Integration
    else if (modelType === 'huggingface') {
      const hfApiKey = apiKey || Deno.env.get('HUGGINGFACE_API_KEY');
      const endpoint = modelEndpoint || Deno.env.get('HUGGINGFACE_MODEL_ENDPOINT');

      if (!hfApiKey || !endpoint) {
        throw new Error('Hugging Face API key or endpoint not configured');
      }

      // Convert base64 to binary
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfApiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        body: binaryData,
      });

      const result = await response.json();
      console.log('Hugging Face response:', result);

      // Transform HF format to our format
      detections = (result || []).map((pred: any) => ({
        x: pred.box.xmin,
        y: pred.box.ymin,
        width: pred.box.xmax - pred.box.xmin,
        height: pred.box.ymax - pred.box.ymin,
        confidence: pred.score,
        label: pred.label,
        severity: pred.score > 0.8 ? 'high' : pred.score > 0.5 ? 'medium' : 'low'
      }));
    }
    
    // Custom API Integration (Flask/FastAPI)
    else if (modelType === 'custom') {
      const customApiKey = apiKey || Deno.env.get('CUSTOM_MODEL_API_KEY');
      const endpoint = modelEndpoint || Deno.env.get('CUSTOM_MODEL_ENDPOINT');

      if (!endpoint) {
        throw new Error('Custom model endpoint not configured');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (customApiKey) {
        headers['Authorization'] = `Bearer ${customApiKey}`;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          image: imageData,
        }),
      });

      const result = await response.json();
      console.log('Custom API response:', result);

      // Transform custom format (adjust based on your API response format)
      detections = (result.detections || result.predictions || []).map((pred: any) => ({
        x: pred.x || pred.bbox?.x || pred.box?.xmin,
        y: pred.y || pred.bbox?.y || pred.box?.ymin,
        width: pred.width || pred.bbox?.width || (pred.box?.xmax - pred.box?.xmin),
        height: pred.height || pred.bbox?.height || (pred.box?.ymax - pred.box?.ymin),
        confidence: pred.confidence || pred.score,
        label: pred.label || pred.class,
        severity: (pred.confidence || pred.score) > 0.8 ? 'high' : 
                 (pred.confidence || pred.score) > 0.5 ? 'medium' : 'low'
      }));
    }

    console.log(`Detected ${detections.length} objects`);

    return new Response(JSON.stringify({ detections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in YOLO detection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
