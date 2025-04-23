
import { supabase } from "@/lib/supabase";

/**
 * Creates storage buckets if they don't already exist
 * This function can be run during app initialization
 */
export async function setupStorage() {
  try {
    // Create avatars bucket if it doesn't exist
    const { error: avatarsError } = await supabase.storage.createBucket(
      'avatars', 
      { public: true }
    );
    
    if (avatarsError && avatarsError.message !== "Bucket already exists") {
      console.error("Error creating avatars bucket:", avatarsError);
    } else {
      console.log("Avatars bucket setup complete");
    }
    
    // Create blog-images bucket if it doesn't exist
    const { error: blogImagesError } = await supabase.storage.createBucket(
      'blog-images', 
      { public: true }
    );
    
    if (blogImagesError && blogImagesError.message !== "Bucket already exists") {
      console.error("Error creating blog-images bucket:", blogImagesError);
    } else {
      console.log("Blog images bucket setup complete");
    }
    
    return true;
  } catch (error) {
    console.error("Failed to setup storage buckets:", error);
    return false;
  }
}
