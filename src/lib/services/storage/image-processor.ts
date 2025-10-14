/**
 * Image processing utility that performs non-blocking operations
 */
export class ImageProcessor {
  /**
   * Compress image while maintaining aspect ratio
   * @note This should run in a WebWorker in production implementations
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 800,
    quality: number = 0.85
  ): Promise<File> {
    return new Promise((resolve) => {
      // For now using browser capabilities, but in production this should run in webworker
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('Could not get canvas context');
        resolve(file); // Return original if compression fails
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        try {
          // Determine dimensions while respecting aspect ratio
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(objectUrl); // Clean up object URL
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: file.lastModified
                });
                resolve(compressedFile);
              } else {
                resolve(file); // Fallback to original
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          console.error('Image compression error:', error);
          URL.revokeObjectURL(objectUrl);
          resolve(file); // Return original on error
        }
      };

      img.onerror = () => {
        console.error('Image could not be loaded for compression');
        URL.revokeObjectURL(objectUrl);
        resolve(file); // Return original on error
      };

      img.src = objectUrl;
    });
  }

  /**
   * Determine if file is an image that can be processed
   */
  static isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Extract file type from MIME
   */
  static getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('application/pdf')) return 'document';
    if (mimeType.startsWith('text/')) return 'text';
    return 'other';
  }
}