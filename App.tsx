import React, { useState, useCallback } from 'react';
import { ImageFile, AnalysisResult } from './types';
import { ImageUploader } from './components/ImageUploader';
import { ResultsPanel } from './components/ResultsPanel';
import { Loader } from './components/Loader';
import { SparklesIcon, ErrorIcon } from './components/icons';
import { analyzeImagesClientSide } from './services/imageProcessor';
import { ParticleBackground } from './components/ParticleBackground';

function App() {
  const [image1, setImage1] = useState<ImageFile | null>(null);
  const [image2, setImage2] = useState<ImageFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImage1Upload = (file: File) => {
    setImage1({ file, preview: URL.createObjectURL(file) });
    setAnalysisResult(null);
    setError(null);
  };

  const handleImage2Upload = (file: File) => {
    setImage2({ file, preview: URL.createObjectURL(file) });
    setAnalysisResult(null);
    setError(null);
  };

  const handleAnalyze = useCallback(async () => {
    if (!image1 || !image2) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // All analysis is now done client-side. No more AI calls.
      const clientSideResult = await analyzeImagesClientSide(image1.preview, image2.preview);

      setAnalysisResult({
        ...clientSideResult,
        image1: { ...clientSideResult.image1, ...image1 },
        image2: { ...clientSideResult.image2, ...image2 },
      });

    } catch (e) {
      console.error(e);
      setError("An error occurred during the local image analysis. The image might be corrupted or in an unsupported format.");
    } finally {
      setIsLoading(false);
    }
  }, [image1, image2]);

  return (
    <div className="min-h-screen text-white p-4 sm:p-8 font-orbitron relative z-10">
      <ParticleBackground />
      <main className="max-w-7xl mx-auto">
        <header className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-wider text-gold-glow">
            Essentials of Deep Learning
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Upload two images to perform an in-depth technical comparison.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 animate-fade-in">
          <ImageUploader title="Upload Image 1" onImageUpload={handleImage1Upload} imagePreview={image1?.preview || null} />
          <ImageUploader title="Upload Image 2" onImageUpload={handleImage2Upload} imagePreview={image2?.preview || null} />
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <button
            onClick={handleAnalyze}
            disabled={!image1 || !image2 || isLoading}
            className="bg-black border-2 border-amber-500 text-amber-400 font-bold py-3 px-12 rounded-full text-lg transition-all duration-300 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(255,215,0,0.5)] hover:shadow-[0_0_25px_rgba(255,215,0,0.8)] hover:bg-amber-500/10 disabled:shadow-none"
          >
            {isLoading ? (
              'Analyzing...'
            ) : (
              <>
                <SparklesIcon className="w-6 h-6 mr-2" />
                Analyze Images
              </>
            )}
          </button>
        </div>

        {isLoading && <Loader />}
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl relative max-w-3xl mx-auto flex items-start">
            <ErrorIcon className="w-6 h-6 mr-3 mt-1 flex-shrink-0 text-red-500"/>
            <div>
              <strong className="font-bold">Analysis Failed!</strong>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {analysisResult && !isLoading && (
          <ResultsPanel result={analysisResult} />
        )}
      </main>
    </div>
  );
}

export default App;