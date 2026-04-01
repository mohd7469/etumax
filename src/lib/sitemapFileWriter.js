
import JSZip from 'jszip';

/**
 * In a pure frontend React application (Vite SPA), we cannot directly write files
 * to the server's /public directory at runtime using Node's 'fs' module.
 * 
 * This utility simulates the file writing process by creating a downloadable ZIP 
 * containing the generated sitemaps, which the admin can then extract into the 
 * /public directory, OR it can be adapted to send to a backend endpoint.
 */
export const writeSitemapFiles = async (files) => {
  try {
    // Attempt to use a backend endpoint if one existed (e.g. Next.js API route)
    // For this strict frontend environment, we'll generate a ZIP file download
    
    const zip = new JSZip();
    
    // Add files to zip
    Object.entries(files).forEach(([filename, content]) => {
      zip.file(filename, content);
    });
    
    // Generate the zip blob
    const content = await zip.generateAsync({ type: "blob" });
    
    // Trigger download
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sitemaps_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Sitemaps generated and downloaded as ZIP successfully.'
    };
  } catch (error) {
    console.error('Error writing sitemap files:', error);
    return {
      success: false,
      error: error.message,
      timestamp: null
    };
  }
};
