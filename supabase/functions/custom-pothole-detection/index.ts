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
    const { imageData } = await req.json();

    // Option A: Call your custom model API
    const customModelApiKey = Deno.env.get('CUSTOM_MODEL_API_KEY');
    const modelEndpoint = Deno.env.get('CUSTOM_MODEL_ENDPOINT');

    const response = await fetch(modelEndpoint!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${customModelApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: imageData,
        // Add any other parameters your model needs
      }),
    });

    const detections = await response.json();

    // Transform your model's output to match the expected format
    const formattedDetections = detections.map((detection: any) => ({
      x: detection.box.xmin,
      y: detection.box.ymin,
      width: detection.box.xmax - detection.box.xmin,
      height: detection.box.ymax - detection.box.ymin,
      confidence: detection.score,
      severity: detection.score > 0.8 ? 'high' : detection.score > 0.5 ? 'medium' : 'low'
    }));

    return new Response(JSON.stringify({ detections: formattedDetections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in custom pothole detection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});