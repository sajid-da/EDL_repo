import React from 'react';
import { AnalysisResult, ProcessedImageInfo } from '../types';
import { BrainCircuitIcon, SunIcon, ContrastIcon, SigmaIcon, AlertTriangleIcon } from './icons';

const ImageAnalysisCard: React.FC<{ title: string; image: ProcessedImageInfo }> = ({ title, image }) => (
  <div className="bg-black/30 rounded-2xl p-6 border border-amber-800/50">
    <h3 className="text-2xl font-bold text-gold-glow mb-4 text-center">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <img src={image.preview} alt="Original" className="rounded-lg w-full aspect-square object-contain bg-black/30" title="Original" />
      <img src={image.grayscale} alt="Grayscale" className="rounded-lg w-full aspect-square object-contain bg-black/30" title="Grayscale" />
      <img src={image.edges} alt="Edges" className="rounded-lg w-full aspect-square object-contain bg-black/30" title="Edges" />
    </div>
    <div className="bg-gray-900/50 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-gray-300 mb-3 flex items-center"><BrainCircuitIcon className="w-5 h-5 mr-2 text-amber-400" /> Image Classification</h4>
      <p className="text-center text-xl font-mono p-2 bg-black/30 rounded-md text-cyan-300">{image.classification}</p>
      
      <h4 className="text-lg font-semibold text-gray-300 mt-4 mb-3">Technical Metrics</h4>
      <div className="space-y-2 text-sm">
         <div className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
                <SunIcon className="w-6 h-6 mr-3 text-amber-300" />
                <span className="text-gray-400">Brightness</span>
            </div>
            <p className="font-bold text-lg">{image.metrics.brightness}</p>
        </div>
        <div className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
                <ContrastIcon className="w-6 h-6 mr-3 text-amber-300" />
                <span className="text-gray-400">Contrast</span>
            </div>
            <p className="font-bold text-lg">{image.metrics.contrast}</p>
        </div>
        <div className="bg-black/30 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
                <SigmaIcon className="w-6 h-6 mr-3 text-amber-300" />
                <span className="text-gray-400">Edge Density</span>
            </div>
            <p className="font-bold text-lg">{image.metrics.edgeDensity}%</p>
        </div>
        {image.metrics.isLowContrast && (
          <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-3 rounded-lg flex items-start">
            <AlertTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs">Low contrast detected. This may affect analysis accuracy.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

interface ResultsPanelProps {
  result: AnalysisResult;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  const scoreColor = result.similarityScore > 75 ? 'text-green-400' : result.similarityScore > 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="animate-fade-in space-y-8 mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ImageAnalysisCard title="Image 1 Analysis" image={result.image1} />
        <ImageAnalysisCard title="Image 2 Analysis" image={result.image2} />
      </div>

      <div className="bg-black/50 rounded-2xl p-1 animate-border-shimmer">
        <div className="bg-black rounded-xl p-6">
            <h3 className="text-3xl font-bold text-gold-glow mb-4 text-center">Comparative Analysis Summary</h3>
            <div className="text-center mb-6 border-b border-amber-800/50 pb-6">
            <p className="text-gray-400 text-lg">Similarity Score (Histogram-based)</p>
            <p className={`text-7xl font-bold ${scoreColor} text-shadow-[0_0_10px_currentColor]`}>{result.similarityScore}%</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-lg">
                <p className="text-gray-300 whitespace-pre-wrap">{result.summary}</p>
            </div>
        </div>
      </div>
    </div>
  );
};