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
    const { imageData, modelId, version } = await req.json();
    const apiKey = Deno.env.get('ROBOFLOW_API_KEY');

    if (!apiKey) {
      throw new Error('ROBOFLOW_API_KEY not configured');
    }

    if (!modelId || !version) {
      throw new Error('Model ID and version are required');
    }

    // Roboflow API endpoint - image goes in query param
    const roboflowUrl = `https://detect.roboflow.com/${modelId}/${version}?api_key=${apiKey}&image=${encodeURIComponent(imageData)}`;

    console.log('Calling Roboflow API:', roboflowUrl.replace(apiKey, '***').replace(imageData, '[IMAGE_DATA]'));

    const response = await fetch(roboflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roboflow API error:', response.status, errorText);
      throw new Error(`Roboflow API error: ${response.status} ${errorText}`);
    }

    const detections = await response.json();
    console.log('Roboflow detections:', detections);

    // Transform Roboflow format to our app format
    const formattedDetections = (detections.predictions || []).map((prediction: any) => ({
      x: prediction.x - prediction.width / 2,
      y: prediction.y - prediction.height / 2,
      width: prediction.width,
      height: prediction.height,
      confidence: prediction.confidence,
      class: prediction.class,
      severity: prediction.confidence > 0.8 ? 'high' : prediction.confidence > 0.5 ? 'medium' : 'low'
    }));

    return new Response(JSON.stringify({ 
      detections: formattedDetections,
      image: detections.image
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in roboflow-detect function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
