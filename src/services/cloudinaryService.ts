import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from '@env';

export type ImageFolder = 'rooms' | 'avatars' | 'general';

/**
 * Cloudinary Service for LuxeStay
 * 
 * Best Practices implemented:
 * 1. Unsigned uploads for mobile security.
 * 2. Automatic folder organization.
 * 3. Dynamic URL optimization (f_auto, q_auto).
 * 4. React Native compatible FormData handling.
 */
export const cloudinaryService = {
  /**
   * Uploads an image to Cloudinary.
   * @param localUri The local file URI from image-picker.
   * @param folder The sub-folder ('rooms' or 'avatars').
   * @returns The secure HTTPS URL of the uploaded image.
   */
  uploadImage: async (localUri: string, folder: ImageFolder = 'general'): Promise<string> => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary config missing. Check your .env file.');
    }

    const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    
    // Extract file info for React Native FormData
    const filename = localUri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri: localUri,
      name: filename,
      type: type,
    } as any);

    // Using your 'hotel_uploads' preset via @env
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Organize by folder: luxestay/rooms/ or luxestay/avatars/
    formData.append('folder', `luxestay/${folder}`);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
      }

      // Return the secure URL
      return data.secure_url;
    } catch (error) {
      console.error('[CloudinaryService] Upload Error:', error);
      throw error;
    }
  },

  /**
   * Helper to transform a raw Cloudinary URL into an optimized version.
   * Best Practice: Always use 'f_auto' (format) and 'q_auto' (quality).
   */
  getOptimizedUrl: (url: string, width?: number, height?: number) => {
    if (!url || !url.includes('cloudinary.com')) return url;

    const transformation = [
      'f_auto', // Auto-format (WebP on Android/Chrome, etc.)
      'q_auto', // Auto-quality (compresses without visible loss)
      width ? `w_${width}` : '',
      height ? `h_${height}` : '',
      width && height ? 'c_fill' : '', // Crop to fill if both dimensions provided
    ].filter(Boolean).join(',');

    return url.replace('/upload/', `/upload/${transformation}/`);
  }
};
