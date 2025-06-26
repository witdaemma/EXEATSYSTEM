
'use server';

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment variables.
// This is safe to run on the server.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file (as a base64 data URL) to Cloudinary.
 * @param fileAsDataUrl The file encoded as a data URL.
 * @returns The secure URL of the uploaded file.
 * @throws An error if the upload fails or Cloudinary is not configured.
 */
export async function uploadConsentForm(fileAsDataUrl: string): Promise<string> {
  // Guard clause to ensure Cloudinary is configured.
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error("Cloudinary is not configured. Upload failed.");
    throw new Error("File upload service is not available.");
  }

  try {
    // Use the Cloudinary uploader to upload the file.
    // We store it in a specific folder for organization.
    const uploadResult = await cloudinary.uploader.upload(fileAsDataUrl, {
      folder: 'mtuexceat_consents',
      resource_type: 'image', // We are expecting image files.
    });
    return uploadResult.secure_url; // Return the HTTPS URL of the uploaded file.
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Could not upload the consent form.");
  }
}
