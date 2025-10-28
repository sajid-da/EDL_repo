export interface ImageFile {
  file: File;
  preview: string;
}

export interface AdvancedMetrics {
  brightness: number; // 0-255
  contrast: number; // Standard deviation
  edgeDensity: number; // Percentage 0-100
  isLowContrast: boolean;
}

export interface ProcessedImageInfo extends ImageFile {
  grayscale: string;
  edges: string;
  metrics: AdvancedMetrics;
  classification: string;
}

export interface AnalysisResult {
  image1: ProcessedImageInfo;
  image2: ProcessedImageInfo;
  similarityScore: number;
  summary: string;
}
