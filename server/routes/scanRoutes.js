const express = require("express");
const axios = require("axios");
const bytes = require("bytes");
const cheerio = require("cheerio");

const router = express.Router();

router.post("/scan", async (req, res) => {
  try {
    const { url } = req.body;

    if (
         !url.startsWith("http://") &&
         !url.startsWith("https://")
      ) {
    return res.status(400).json({
       error: "URL must start with http:// or https://",
     });
}

    const response = await axios.get(url, {
        headers: {
        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
     },
   });

    const html = response.data;

    const $ = cheerio.load(html);

    // =========================
    // META TITLE
    // =========================

    const title = $("title").text();

    // =========================
    // META DESCRIPTION
    // =========================

    const metaDescription = $('meta[name="description"]').attr("content");

    // =========================
    // CANONICAL URL
    // =========================

    const canonical = $('link[rel="canonical"]').attr("href");

    // =========================
    // JQUERY DETECTION
    // =========================

    let jqueryVersion = "Not Detected";

    $("script").each((i, el) => {
      const src = $(el).attr("src");

      if (src && src.toLowerCase().includes("jquery")) {
        const match = src.match(/jquery[-.]([0-9.]+)/i);

        if (match && match[1]) {
          jqueryVersion = match[1];
        } else {
          jqueryVersion = "Detected";
        }
      }
    });

    // =========================
    // BOOTSTRAP DETECTION
    // =========================

    let bootstrapVersion = "Not Detected";

    $("link").each((i, el) => {
      const href = $(el).attr("href");

      if (href && href.toLowerCase().includes("bootstrap")) {
        const match = href.match(/bootstrap[-.]([0-9.]+)/i);

        if (match && match[1]) {
          bootstrapVersion = match[1];
        } else {
          bootstrapVersion = "Detected";
        }
      }
    });

    

    // =========================
    // IMAGE ANALYSIS
    // =========================

    let pngImages = [];
    let svgImages = [];
    let webpImages = [];
    let jpgImages = [];
    let allImages = [];

   $("img").each((i, el) => {

    const src = $(el).attr("src");

     if (src) {

    const imageUrl = src.startsWith("http")
      ? src
      : new URL(src, url).href;

    const lowerSrc = src.toLowerCase();

    if (lowerSrc.includes(".png")) {
      pngImages.push(imageUrl);
    }

    if (lowerSrc.includes(".svg")) {
      svgImages.push(imageUrl);
    }

    if (lowerSrc.includes(".webp")) {
      webpImages.push(imageUrl);
    }

    if (
      lowerSrc.includes(".jpg") ||
      lowerSrc.includes(".jpeg")
    ) {
      jpgImages.push(imageUrl);
    }
  }
});
    
// =========================
// ALT TAG CHECK
// =========================

let missingAltCount = 0;

$("img").each((i, el) => {

  const alt = $(el).attr("alt");

  if (!alt || alt.trim() === "") {
    missingAltCount++;
  }

});

// =========================
// H1 CHECK
// =========================

const h1Tags = [];

$("h1").each((i, el) => {
  h1Tags.push($(el).text().trim());
});

// =========================
// HTTPS CHECK
// =========================

const isHTTPS = url.startsWith("https://");

// =========================
// OPEN GRAPH TAGS
// =========================

const ogTitle = $('meta[property="og:title"]').attr("content");

const ogDescription = $('meta[property="og:description"]').attr("content");

const ogImage = $('meta[property="og:image"]').attr("content");

// =========================
// ROBOTS.TXT CHECK
// =========================

let robotsTxt = false;

try {

  const robotsResponse = await axios.get(`${url}/robots.txt`);

  if (robotsResponse.status === 200) {
    robotsTxt = true;
  }

} catch (error) {
  robotsTxt = false;
}

// =========================
// SITEMAP CHECK
// =========================

let sitemap = false;

try {

  const sitemapResponse = await axios.get(`${url}/sitemap.xml`);

  if (sitemapResponse.status === 200) {
    sitemap = true;
  }

} catch (error) {
  sitemap = false;
}

    // =========================
    // GOOGLE ANALYTICS + GTM
    // =========================

    const gtmMatch = html.match(/GTM-[A-Z0-9]+/g);

    const ga4Match = html.match(/G-[A-Z0-9]+/g);

    const uaMatch = html.match(/UA-\d+-\d+/g);

    // =========================
   // PERFORMANCE SCANNER
   // =========================

   // JS FILES

   const jsFiles = [];

   $('script[src]').each((i, el) => {

    const src = $(el).attr('src');

      if (src) {

        const fullUrl = src.startsWith("http")
        ? src
        : new URL(src, url).href;

        jsFiles.push(fullUrl);
     }
  });

  // CSS FILES

  const cssFiles = [];

  $('link[rel="stylesheet"]').each((i, el) => {

  const href = $(el).attr('href');

  if (href) {

    const fullUrl = href.startsWith("http")
      ? href
      : new URL(href, url).href;

    cssFiles.push(fullUrl);
   }
 });

  // PAGE SIZE

  const htmlSize = Buffer.byteLength(html, 'utf8');

  // HEAVY IMAGES

  const heavyImages = [];

  for (const image of allImages) {

  try {

    const response = await axios.head(image.url);

    const size = response.headers['content-length'];

    if (size && Number(size) > 300000) {

      heavyImages.push({
        url: image.url,
        size: bytes(Number(size)),
      });
    }

    } catch (error) {
    // ignore failed image checks
   }
 }

  // TOTAL REQUESTS

  const totalRequests =
  jsFiles.length +
  cssFiles.length +
  allImages.length;

    // =========================
    // BROKEN LINK CHECKER
    // =========================

    const links = [];

    $("a").each((i, el) => {
      const href = $(el).attr("href");

      if (
        href &&
        href.startsWith("http")
      ) {
        links.push(href);
      }
    });

    let brokenLinks = [];

    for (const link of links.slice(0, 20)) {
      try {
        await axios.get(link);
      } catch (error) {
        brokenLinks.push(link);
      }
    }

    // =========================
    // FINAL RESPONSE
    // =========================

    res.json({
      title,
      metaDescription,
      canonical,

      jqueryVersion,
      bootstrapVersion,

     images: {

         png: pngImages.length,
         svg: svgImages.length,
         webp: webpImages.length,
         jpg: jpgImages.length,

        pngImages,
        svgImages,
        webpImages,
        jpgImages,
      },
      
      performance: {

     totalJSFiles: jsFiles.length,

     totalCSSFiles: cssFiles.length,

     totalImages: allImages.length,

     totalRequests,

     htmlSize: bytes(htmlSize),

     heavyImages,
   },

      analytics: {
        GTM: gtmMatch || [],
        GA4: ga4Match || [],
        UA: uaMatch || [],
      },

      brokenLinks,
 
      missingAltCount,

      h1Tags,

      isHTTPS,

     openGraph: {
       ogTitle,
       ogDescription,
       ogImage,
     },

    robotsTxt,

    sitemap,
});

  } catch (error) {

        console.log("FULL ERROR:");
        console.log(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;