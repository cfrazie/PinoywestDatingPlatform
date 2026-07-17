import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface VerificationRequest {
  userId: string;
  imageUrl: string;
  imageHash?: string;
  verificationType: string;
}

interface RiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  platforms: string[];
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const { userId, imageUrl, imageHash, verificationType }: VerificationRequest = await req.json();

    if (!userId || !imageUrl) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Extract EXIF data (in production, use a library like exifr)
    const exifData = await extractExifData(imageUrl);
    
    // 2. Check if taken with phone camera
    const isPhoneCamera = checkPhoneCameraMetadata(exifData);
    
    // 3. Perform reverse image search (mock for now)
    const reverseSearchResults = await performReverseImageSearch(imageUrl);
    
    // 4. Check against adult content databases (mock for now)
    const adultContentCheck = await checkAdultContentSites(imageHash || '');
    
    // 5. Check social media platforms (mock for now)
    const socialMediaCheck = await checkSocialMediaPlatforms(imageUrl);
    
    // 6. Check dating apps (mock for now)
    const datingAppCheck = await checkDatingApps(imageHash || '');
    
    // 7. Stock photo detection (mock for now)
    const stockPhotoCheck = await checkStockPhotoSites(imageHash || '');
    
    // 8. AI-generated image detection (mock for now)
    const aiGeneratedCheck = await detectAIGeneratedImage(imageUrl);
    
    // 9. Calculate risk score
    const riskAssessment = calculateRiskScore({
      reverseSearchResults,
      adultContentCheck,
      socialMediaCheck,
      datingAppCheck,
      stockPhotoCheck,
      aiGeneratedCheck,
      isPhoneCamera,
    });
    
    // 10. Create verification request in database
    const { data: verificationRequest, error: insertError } = await supabase
      .from('user_verification_requests')
      .insert({
        user_id: userId,
        verification_type: verificationType,
        image_url: imageUrl,
        image_hash: imageHash,
        is_phone_camera: isPhoneCamera,
        camera_metadata: exifData,
        reverse_search_completed: true,
        reverse_search_results: reverseSearchResults,
        found_on_platforms: riskAssessment.platforms,
        is_stock_photo: stockPhotoCheck.isStockPhoto,
        is_ai_generated: aiGeneratedCheck.isAI,
        risk_level: riskAssessment.riskLevel,
        risk_factors: riskAssessment.factors,
        risk_score: riskAssessment.riskScore,
        status: riskAssessment.riskLevel === 'critical' ? 'rejected' : 
                riskAssessment.riskLevel === 'high' ? 'flagged' : 'verified',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // 11. Insert image match detections if any
    if (riskAssessment.platforms.length > 0) {
      const matches = riskAssessment.platforms.map(platform => ({
        verification_request_id: verificationRequest.id,
        platform: platform,
        platform_category: getPlatformCategory(platform),
        match_url: `https://${platform}.com/found`,
        similarity_score: 0.85,
        confidence: 0.9,
      }));

      await supabase
        .from('image_match_detections')
        .insert(matches);
    }
    
    return new Response(JSON.stringify({
      success: true,
      verification: verificationRequest,
      riskAssessment,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error: any) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});

// Helper functions (mock implementations for now)
async function extractExifData(imageUrl: string) {
  // In production, fetch the image and extract EXIF data
  // For now, return mock data
  return {
    make: 'Apple',
    model: 'iPhone 14 Pro',
    software: 'iOS 17.1',
    date_time: new Date().toISOString(),
  };
}

function checkPhoneCameraMetadata(exifData: any): boolean {
  // Check if EXIF data indicates a phone camera
  const phoneMakes = ['Apple', 'Samsung', 'Google', 'Huawei', 'Xiaomi', 'OnePlus'];
  return phoneMakes.some(make => exifData.make?.includes(make));
}

async function performReverseImageSearch(imageUrl: string) {
  // In production, call Google Vision API, TinEye, PimEyes, etc.
  // For now, return mock results
  return {
    google: [],
    tineye: [],
    pimeyes: [],
    total_matches: 0,
  };
}

async function checkAdultContentSites(imageHash: string) {
  // In production, check against adult content database hashes
  return {
    found: false,
    platforms: [],
    confidence: 0.0,
  };
}

async function checkSocialMediaPlatforms(imageUrl: string) {
  // In production, check Facebook, Instagram, Twitter, etc.
  return {
    platforms: [],
  };
}

async function checkDatingApps(imageHash: string) {
  // In production, check Tinder, Bumble, etc. (if APIs available)
  return {
    platforms: [],
  };
}

async function checkStockPhotoSites(imageHash: string) {
  // In production, check Shutterstock, Getty Images, etc.
  return {
    isStockPhoto: false,
    platforms: [],
  };
}

async function detectAIGeneratedImage(imageUrl: string) {
  // In production, use AI detection services
  return {
    isAI: false,
    confidence: 0.0,
  };
}

function calculateRiskScore(checks: any): RiskAssessment {
  let riskScore = 0;
  const factors: string[] = [];
  const platforms: string[] = [];
  
  // High risk if found on adult sites
  if (checks.adultContentCheck.found) {
    riskScore += 50;
    factors.push('Found on adult content sites');
    platforms.push(...checks.adultContentCheck.platforms);
  }
  
  // Medium risk if found on multiple dating apps
  if (checks.datingAppCheck.platforms.length > 2) {
    riskScore += 30;
    factors.push(`Found on ${checks.datingAppCheck.platforms.length} dating apps`);
    platforms.push(...checks.datingAppCheck.platforms);
  }
  
  // Low risk if stock photo
  if (checks.stockPhotoCheck.isStockPhoto) {
    riskScore += 40;
    factors.push('Stock photo detected');
  }
  
  // High risk if AI-generated
  if (checks.aiGeneratedCheck.isAI) {
    riskScore += 45;
    factors.push('AI-generated image detected');
  }
  
  // Reduce risk if taken with phone camera
  if (checks.isPhoneCamera) {
    riskScore -= 20;
    factors.push('Photo taken with phone camera (positive indicator)');
  }
  
  // Determine risk level
  let riskLevel: RiskAssessment['riskLevel'] = 'low';
  if (riskScore >= 70) riskLevel = 'critical';
  else if (riskScore >= 40) riskLevel = 'high';
  else if (riskScore >= 20) riskLevel = 'medium';
  
  return {
    riskScore: Math.max(riskScore, 0),
    riskLevel,
    factors,
    platforms: [...new Set(platforms)],
  };
}

function getPlatformCategory(platform: string): string {
  const socialMedia = ['facebook', 'instagram', 'twitter', 'tiktok', 'linkedin'];
  const datingApps = ['tinder', 'bumble', 'hinge', 'okcupid', 'match'];
  const adultContent = ['onlyfans', 'pornhub', 'xvideos'];
  const stockPhoto = ['shutterstock', 'getty', 'unsplash', 'pexels'];
  
  if (socialMedia.includes(platform.toLowerCase())) return 'social_media';
  if (datingApps.includes(platform.toLowerCase())) return 'dating_app';
  if (adultContent.includes(platform.toLowerCase())) return 'adult_content';
  if (stockPhoto.includes(platform.toLowerCase())) return 'stock_photo';
  
  return 'other';
}
