import { useState } from "react";
import API from "./services/api";

import {
  FaSearch,
  FaLink,
  FaImage,
  FaChartLine,
  FaCode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaHeading,
  FaRobot,
  FaBolt,
} from "react-icons/fa";

import { Circles } from "react-loader-spinner";

function App() {

  const [url, setUrl] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [selectedImages, setSelectedImages] = useState([]);

  const [modalTitle, setModalTitle] = useState("");

  const [showModal, setShowModal] = useState(false);  

  // =========================
  // SEO SCORE
  // =========================

  const calculateSEOScore = () => {

    if (!result) return 0;

    let score = 100;

    if (!result.title) score -= 15;

    if (!result.metaDescription) score -= 15;

    if (!result.canonical) score -= 10;

    if (result.brokenLinks.length > 0) {
      score -= result.brokenLinks.length * 2;
    }

    if (result.images.png > 5) {
      score -= 10;
    }

    return Math.max(score, 0);
  };

  // =========================
  // SCAN WEBSITE
  // =========================

  const openImageModal = (title, images) => {

  setModalTitle(title);

  setSelectedImages(images);

  setShowModal(true);
  };

  const downloadPDF = async () => {

  try {

    const response = await fetch(
      "http://localhost:5000/api/export-pdf",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...result,
          seoScore: calculateSEOScore(),
        }),
      }
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "seo-report.pdf";

    document.body.appendChild(a);

    a.click();

    a.remove();

  } catch (error) {

    console.log(error);

    alert("PDF Download Failed");
  }
};


  const scanWebsite = async () => {

    if (!url) {
      alert("Please enter URL");
      return;
    }

    try {

      setLoading(true);

      const response = await API.post("/scan", {
        url,
      });

      setResult(response.data);

    } catch (error) {

      console.log(error);

      alert("Scan Failed");

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* HERO SECTION */}

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* HEADER */}

        <div className="text-center mb-14">

          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">

            SEO Scanner Pro

          </h1>

          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">

            Analyze websites instantly for SEO, analytics,
            broken links, image optimization, and tech stack.

          </p>

        </div>

        {/* SEARCH BAR */}

        <div className="bg-[#1e293b] border border-gray-700 rounded-3xl p-4 shadow-2xl flex flex-col md:flex-row gap-4">

          <input
            type="text"
            placeholder="https://example.com"
            className="flex-1 bg-[#0f172a] border border-gray-700 rounded-2xl px-5 py-4 text-lg outline-none focus:border-cyan-400 transition-all"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            onClick={scanWebsite}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Scan Website
          </button>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="flex flex-col items-center justify-center mt-20">

            <Circles
              height="100"
              width="100"
              color="#06b6d4"
              ariaLabel="loading"
            />

            <p className="mt-6 text-xl text-cyan-400 font-semibold">

              Scanning Website...

            </p>

            <p className="text-gray-500 mt-2">

              Checking SEO, links, analytics & images

            </p>

          </div>

        )}

        {/* SUCCESS MESSAGE */}

        {result && !loading && (

          <div className="mt-8 bg-green-500/10 border border-green-500 text-green-400 p-5 rounded-2xl flex items-center gap-3">

            <FaCheckCircle />

            Scan Completed Successfully

          </div>

        )}

        {/* RESULTS */}

        {result && !loading && (

          <>

            {/* SEO SCORE */}

            <div className="mt-10 mb-10">

              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 rounded-3xl shadow-2xl">

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">

                  <div>

                    <h2 className="text-3xl font-bold mb-2">

                      SEO Health Score

                    </h2>
                   <div className="mt-6">

                    <button
                        onClick={downloadPDF}
                        className="bg-white text-black px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all"
                      >
                       Download PDF Report
                      </button>

                     </div>
                    <p className="text-cyan-100">

                      Website optimization overview

                    </p>

                  </div>

                  <div className="text-6xl font-extrabold">

                    {calculateSEOScore()}/100

                  </div>

                </div>

              </div>

            </div>

            {/* GRID */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* META CARD */}

              <div className="bg-[#1e293b] hover:scale-[1.02] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

                <div className="flex items-center gap-3 mb-6">

                  <FaSearch className="text-cyan-400 text-2xl" />

                  <h2 className="text-2xl font-bold">

                    Meta Information

                  </h2>

                </div>

                <div className="space-y-6 text-gray-300">

                  <div>

                    <p className="font-bold text-white mb-2">
                      Title
                    </p>

                    {result.title ? (
                      <div className="text-green-400">
                        {result.title}
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center gap-2">
                        <FaExclamationTriangle />
                        Missing Title
                      </div>
                    )}

                  </div>

                  <div>

                    <p className="font-bold text-white mb-2">
                      Meta Description
                    </p>

                    {result.metaDescription ? (
                      <div className="text-green-400">
                        {result.metaDescription}
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center gap-2">
                        <FaExclamationTriangle />
                        Missing Meta Description
                      </div>
                    )}

                  </div>

                  <div>

                    <p className="font-bold text-white mb-2">
                      Canonical URL
                    </p>

                    {result.canonical ? (
                      <div className="text-green-400 break-all">
                        {result.canonical}
                      </div>
                    ) : (
                      <div className="text-red-400 flex items-center gap-2">
                        <FaExclamationTriangle />
                        Missing Canonical URL
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* TECH STACK */}

              <div className="bg-[#1e293b] hover:scale-[1.02] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

                <div className="flex items-center gap-3 mb-6">

                  <FaCode className="text-purple-400 text-2xl" />

                  <h2 className="text-2xl font-bold">

                    Tech Stack

                  </h2>

                </div>

                <div className="space-y-5 text-gray-300">

                  <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between">

                    <span>jQuery</span>

                    <span className="text-cyan-400">
                      {result.jqueryVersion}
                    </span>

                  </div>

                  <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between">

                    <span>Bootstrap</span>

                    <span className="text-purple-400">
                      {result.bootstrapVersion}
                    </span>

                  </div>

                </div>

              </div>

             {/* IMAGE ANALYSIS */}

<div className="bg-[#1e293b] hover:scale-[1.02] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

  <div className="flex items-center gap-3 mb-6">

    <FaImage className="text-pink-400 text-2xl" />

    <h2 className="text-2xl font-bold">

      Image Analysis

    </h2>

  </div>

  <div className="grid grid-cols-2 gap-4">

    {/* PNG */}

    <button
      onClick={() =>
        openImageModal("PNG Images", result.images.pngImages)
      }
      className="bg-[#0f172a] p-5 rounded-2xl text-left hover:bg-[#162033] transition-all"
    >

      <div className="text-gray-400 mb-2">
        PNG
      </div>

      <div className={`text-3xl font-bold ${
        result.images.png > 5
          ? "text-red-400"
          : "text-green-400"
      }`}>
        {result.images.png}
      </div>

    </button>

    {/* SVG */}

    <button
      onClick={() =>
        openImageModal("SVG Images", result.images.svgImages)
      }
      className="bg-[#0f172a] p-5 rounded-2xl text-left hover:bg-[#162033] transition-all"
    >

      <div className="text-gray-400 mb-2">
        SVG
      </div>

      <div className="text-3xl font-bold text-cyan-400">
        {result.images.svg}
      </div>

    </button>

    {/* WEBP */}

    <button
      onClick={() =>
        openImageModal("WEBP Images", result.images.webpImages)
      }
      className="bg-[#0f172a] p-5 rounded-2xl text-left hover:bg-[#162033] transition-all"
    >

      <div className="text-gray-400 mb-2">
        WEBP
      </div>

      <div className="text-3xl font-bold text-green-400">
        {result.images.webp}
      </div>

    </button>

    {/* JPG */}

    <button
      onClick={() =>
        openImageModal("JPG Images", result.images.jpgImages)
      }
      className="bg-[#0f172a] p-5 rounded-2xl text-left hover:bg-[#162033] transition-all"
    >

      <div className="text-gray-400 mb-2">
        JPG
      </div>

      <div className="text-3xl font-bold text-yellow-400">
        {result.images.jpg}
      </div>

    </button>

  </div>

</div>

              {/* ANALYTICS */}

              <div className="bg-[#1e293b] hover:scale-[1.02] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

                <div className="flex items-center gap-3 mb-6">

                  <FaChartLine className="text-green-400 text-2xl" />

                  <h2 className="text-2xl font-bold">

                    Analytics

                  </h2>

                </div>

                <div className="space-y-5">

                  <div className="bg-[#0f172a] p-4 rounded-2xl">

                    <div className="text-gray-400 mb-2">
                      Google Tag Manager
                    </div>

                    <div className="text-green-400 break-all">
                      {result.analytics.GTM.join(", ") || "Not Found"}
                    </div>

                  </div>

                  <div className="bg-[#0f172a] p-4 rounded-2xl">

                    <div className="text-gray-400 mb-2">
                      Google Analytics 4
                    </div>

                    <div className="text-cyan-400 break-all">
                      {result.analytics.GA4.join(", ") || "Not Found"}
                    </div>

                  </div>

                </div>

              </div>

             


{/* SEO CHECKS */}

<div className="bg-[#1e293b] hover:scale-[1.02] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

  <div className="flex items-center gap-3 mb-6">

    <FaShieldAlt className="text-cyan-400 text-2xl" />

    <h2 className="text-2xl font-bold">

      SEO Checks

    </h2>

  </div>

  <div className="space-y-5">

    <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between">

      <span>HTTPS Security</span>

      <span className={
        result.isHTTPS
          ? "text-green-400"
          : "text-red-400"
      }>
        {result.isHTTPS ? "Secure" : "Not Secure"}
      </span>

    </div>

    <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between">

      <span>robots.txt</span>

      <span className={
        result.robotsTxt
          ? "text-green-400"
          : "text-red-400"
      }>
        {result.robotsTxt ? "Found" : "Missing"}
      </span>

    </div>

    <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between">

      <span>sitemap.xml</span>

      <span className={
        result.sitemap
          ? "text-green-400"
          : "text-red-400"
      }>
        {result.sitemap ? "Found" : "Missing"}
      </span>

    </div>

    <div className="bg-[#0f172a] p-4 rounded-2xl flex justify-between">

      <span>Missing Alt Tags</span>

      <span className={
        result.missingAltCount > 0
          ? "text-red-400"
          : "text-green-400"
      }>
        {result.missingAltCount}
      </span>

    </div>

  </div>

</div>


{/* H1 TAGS */}

<div className="bg-[#1e293b] hover:scale-[1.02] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

  <div className="flex items-center gap-3 mb-6">

    <FaHeading className="text-yellow-400 text-2xl" />

    <h2 className="text-2xl font-bold">

      H1 Tags

    </h2>

  </div>

  {result.h1Tags.length === 0 ? (

    <div className="text-red-400">

      No H1 Tags Found

    </div>

  ) : (

    <div className="space-y-3">

      {result.h1Tags.map((tag, index) => (

        <div
          key={index}
          className="bg-[#0f172a] p-4 rounded-2xl text-cyan-400"
        >
          {tag}
        </div>

      ))}

    </div>

  )}

</div>

{/* OPEN GRAPH */}

<div className="md:col-span-2 bg-[#1e293b] hover:scale-[1.01] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

  <div className="flex items-center gap-3 mb-6">

    <FaRobot className="text-pink-400 text-2xl" />

    <h2 className="text-2xl font-bold">

      Open Graph Tags

    </h2>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <div className="text-gray-400 mb-2">
        og:title
      </div>

      <div className="text-cyan-400">
        {result.openGraph.ogTitle || "Missing"}
      </div>

    </div>

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <div className="text-gray-400 mb-2">
        og:description
      </div>

      <div className="text-green-400">
        {result.openGraph.ogDescription || "Missing"}
      </div>

    </div>

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <div className="text-gray-400 mb-2">
        og:image
      </div>

      <div className="text-pink-400 break-all">
        {result.openGraph.ogImage || "Missing"}
      </div>

    </div>

  </div>

</div>

{/* PERFORMANCE */}

<div className="md:col-span-2 bg-[#1e293b] hover:scale-[1.01] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

  <div className="flex items-center gap-3 mb-6">

    <FaBolt className="text-yellow-400 text-2xl" />

    <h2 className="text-2xl font-bold">

      Performance Scanner

    </h2>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <p className="text-gray-400 mb-2">
        JS Files
      </p>

      <h3 className="text-3xl font-bold text-cyan-400">

        {result.performance.totalJSFiles}

      </h3>

    </div>

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <p className="text-gray-400 mb-2">
        CSS Files
      </p>

      <h3 className="text-3xl font-bold text-green-400">

        {result.performance.totalCSSFiles}

      </h3>

    </div>

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <p className="text-gray-400 mb-2">
        Total Images
      </p>

      <h3 className="text-3xl font-bold text-pink-400">

        {result.performance.totalImages}

      </h3>

    </div>

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <p className="text-gray-400 mb-2">
        Requests
      </p>

      <h3 className="text-3xl font-bold text-yellow-400">

        {result.performance.totalRequests}

      </h3>

    </div>

    <div className="bg-[#0f172a] p-5 rounded-2xl">

      <p className="text-gray-400 mb-2">
        HTML Size
      </p>

      <h3 className="text-3xl font-bold text-red-400">

        {result.performance.htmlSize}

      </h3>

    </div>

  </div>

  {/* HEAVY IMAGES */}

  <div>

    <div className="flex items-center justify-between mb-5">

      <h3 className="text-xl font-bold">

        Heavy Images

      </h3>

      <div className="text-gray-400">

        {result.performance.heavyImages.length} Found

      </div>

    </div>

    {result.performance.heavyImages.length === 0 ? (

      <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-2xl">

        No Heavy Images Found

      </div>

    ) : (

      <div className="space-y-3">

        {result.performance.heavyImages.map((image, index) => (

          <div
            key={index}
            className="bg-[#0f172a] border border-gray-700 p-4 rounded-2xl flex justify-between items-center"
          >

            <a
              href={image.url}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 break-all hover:underline"
            >
              {image.url}
            </a>

            <div className="text-red-400 font-bold ml-4">

              {image.size}

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

</div>

              {/* BROKEN LINKS */}

              <div className="md:col-span-2 bg-[#1e293b] hover:scale-[1.01] transition-all duration-300 p-8 rounded-3xl shadow-xl border border-gray-700">

                <div className="flex items-center gap-3 mb-6">

                  <FaLink className="text-red-400 text-2xl" />

                  <h2 className="text-2xl font-bold">

                    Broken Links

                  </h2>

                </div>

                {result.brokenLinks.length === 0 ? (

                  <div className="bg-green-500/10 border border-green-500 text-green-400 p-5 rounded-2xl">

                    No Broken Links Found

                  </div>

                ) : (

                  <div className="space-y-4">

                    {result.brokenLinks.map((link, index) => (

                      <div
                        key={index}
                        className="bg-red-500/10 border border-red-500 text-red-400 p-5 rounded-2xl break-all"
                      >
                        {link}
                      </div>

                    ))}

                  </div>

                )}

              </div>

            </div>

          </>

        )}

      </div>

   {/* IMAGE MODAL */}

{showModal && (

  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">

    <div className="bg-[#1e293b] w-full max-w-5xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto border border-gray-700">

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-3xl font-bold">
          {modalTitle}
        </h2>

        <button
          onClick={() => setShowModal(false)}
          className="bg-red-500 px-5 py-2 rounded-xl hover:bg-red-600"
        >
          Close
        </button>

      </div>

      {selectedImages.length === 0 ? (

        <div className="text-gray-400">
          No Images Found
        </div>

      ) : (

       <div className="space-y-3">

  {selectedImages.map((image, index) => (

    <div
      key={index}
      className="bg-[#0f172a] border border-gray-700 rounded-2xl p-4 flex items-center gap-4 hover:bg-[#162033] transition-all"
    >

      {/* SMALL IMAGE */}

      <img
        src={image}
        alt="preview"
        className="w-16 h-16 object-cover rounded-xl border border-gray-600"
      />

      {/* IMAGE INFO */}

      <div className="flex-1 overflow-hidden">

        <p className="text-sm text-gray-400 mb-1">
          Image {index + 1}
        </p>

        <a
          href={image}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-400 text-sm break-all hover:underline"
        >
          {image}
        </a>

      </div>

    </div>

  ))}

</div>

      )}

    </div>

  </div>

)}

    </div>
  );
}

export default App;