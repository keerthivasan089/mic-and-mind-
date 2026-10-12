import { supabase } from './supabase';

export type MediaType = 'image' | 'audio' | 'video';

export interface UploadMediaOptions {
  file: File;
  folder:
    | 'mic-and-mind/guests'
    | 'mic-and-mind/episodes/audio'
    | 'mic-and-mind/episodes/thumbnails'
    | 'mic-and-mind/hero/desktop'
    | 'mic-and-mind/hero/mobile'
    | 'mic-and-mind/hero/posters'
    | string;
  expectedType: MediaType;
  onProgress?: (percent: number) => void;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates uploaded media file extensions, MIME types, and size constraints.
 */
export function validateMediaFile(file: File, type: MediaType): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();

  switch (type) {
    case 'image': {
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const hasValidExt = validExtensions.some((ext) => name.endsWith(ext));
      const hasValidMime = ['image/jpeg', 'image/png', 'image/webp'].includes(mime) || mime.startsWith('image/');

      if (!hasValidExt && !hasValidMime) {
        return {
          valid: false,
          error: 'Unsupported image format. Please upload a JPG, JPEG, PNG, or WEBP image file.',
        };
      }

      // 10 MB limit for images
      if (file.size > 10 * 1024 * 1024) {
        return {
          valid: false,
          error: `Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`,
        };
      }
      return { valid: true };
    }

    case 'audio': {
      const validExtensions = ['.mp3', '.wav'];
      const hasValidExt = validExtensions.some((ext) => name.endsWith(ext));
      const hasValidMime =
        ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'].includes(mime) ||
        mime.startsWith('audio/');

      if (!hasValidExt && !hasValidMime) {
        return {
          valid: false,
          error: 'Unsupported audio format. Please upload an MP3 or WAV audio track.',
        };
      }

      // 100 MB limit for audio tracks
      if (file.size > 100 * 1024 * 1024) {
        return {
          valid: false,
          error: `Audio file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 100 MB.`,
        };
      }
      return { valid: true };
    }

    case 'video': {
      const validExtensions = ['.mp4', '.webm'];
      const hasValidExt = validExtensions.some((ext) => name.endsWith(ext));
      const hasValidMime = ['video/mp4', 'video/webm'].includes(mime) || mime.startsWith('video/');

      if (!hasValidExt && !hasValidMime) {
        return {
          valid: false,
          error: 'Unsupported video format. Please upload an MP4 or WEBM video file.',
        };
      }

      // 250 MB limit for video streams
      if (file.size > 250 * 1024 * 1024) {
        return {
          valid: false,
          error: `Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 250 MB.`,
        };
      }
      return { valid: true };
    }

    default:
      return { valid: false, error: 'Unknown media type.' };
  }
}

/**
 * Reusable, secure client-side Cloudinary upload function using backend-signed signatures.
 * Streams direct from browser to Cloudinary CDN without passing large binaries through the local server.
 */
export async function uploadMediaToCloudinary(options: UploadMediaOptions): Promise<string> {
  const { file, folder, expectedType, onProgress } = options;

  // 1. Client-side validation
  const validation = validateMediaFile(file, expectedType);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid media file.');
  }

  // 2. Retrieve Supabase JWT session
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.access_token) {
    throw new Error('Administrator authentication required. Please sign in to the Admin Portal.');
  }

  const token = sessionData.session.access_token;
  onProgress?.(10);

  // 3. Fetch cryptographic upload signature from server endpoint
  const signRes = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      folder,
      resourceType: expectedType === 'image' ? 'image' : 'video',
    }),
  });

  if (!signRes.ok) {
    const errorBody = await signRes.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `Server signature failed (${signRes.status}): ${signRes.statusText}`
    );
  }

  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json();
  onProgress?.(25);

  // 4. Construct direct multipart upload payload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', signedFolder);

  // In Cloudinary, audio and video use the 'video' or 'auto' resource endpoint
  const resourceEndpoint = expectedType === 'image' ? 'image' : 'video';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceEndpoint}/upload`;

  // 5. Execute XHR upload with continuous progress tracking
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        // Map upload phase from 25% to 95%
        const percentComplete = 25 + Math.round((event.loaded / event.total) * 70);
        onProgress?.(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          const secureUrl = response.secure_url;
          if (!secureUrl) {
            reject(new Error('Cloudinary response did not contain a secure_url.'));
            return;
          }
          onProgress?.(100);
          resolve(secureUrl);
        } catch (e) {
          reject(new Error('Failed to parse Cloudinary response payload.'));
        }
      } else {
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          reject(
            new Error(
              errorResponse.error?.message || `Cloudinary upload failed with status ${xhr.status}`
            )
          );
        } catch {
          reject(new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.statusText}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during media upload to Cloudinary.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out. Please check your internet connection and try again.'));
    };

    xhr.send(formData);
  });
}
