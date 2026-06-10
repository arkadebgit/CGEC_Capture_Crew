import fs from 'fs';
import path from 'path';
import { generateMetadataForPath } from './metadata-utils.js';

export default async function handler(req, res) {
  try {
    // Determine the requested path
    const requestUrl = req.url || '/';
    // Remove query parameters if any for path matching
    const urlPath = requestUrl.split('?')[0];

    // Generate metadata
    const metadata = generateMetadataForPath(urlPath);
    const domain = `https://${req.headers.host || 'capturecrew.site'}`;
    const fullUrl = `${domain}${metadata.urlPath}`;

    // Read the static index.html built by Vite
    // Depending on Vercel's build environment, it could be in 'dist'
    const filePath = path.join(process.cwd(), 'dist', 'index.html');
    
    if (!fs.existsSync(filePath)) {
      console.error(`Could not find index.html at ${filePath}`);
      return res.status(404).send('Not Found');
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Prepare the meta tags string
    const metaTags = `
    <title>${metadata.title}</title>
    <meta name="description" content="${metadata.description}" />
    <meta property="og:title" content="${metadata.title}" />
    <meta property="og:description" content="${metadata.description}" />
    <meta property="og:image" content="${metadata.image}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="${metadata.ogType}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${metadata.title}" />
    <meta name="twitter:description" content="${metadata.description}" />
    <meta name="twitter:image" content="${metadata.image}" />
    <link rel="canonical" href="${fullUrl}" />
    `;

    // Inject tags into <head>
    // Replace existing <title> if it exists, else inject at end of <head>
    if (html.includes('<title>')) {
      // Remove existing title and description to prevent duplicates
      html = html.replace(/<title>.*?<\/title>/gi, '');
    }
    
    // Inject our generated tags right after <head>
    html = html.replace('<head>', `<head>\n${metaTags}`);

    // Set cache headers so Vercel Edge Network caches the response
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    return res.status(200).send(html);
  } catch (error) {
    console.error('Error generating metadata:', error);
    // On error, try to return the raw HTML if possible, or 500
    res.status(500).send('Internal Server Error');
  }
}
