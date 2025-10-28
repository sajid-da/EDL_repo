// This service simulates backend image processing on the client-side using Canvas.

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

const getGrayscaleData = (ctx: CanvasRenderingContext2D, width: number, height: number): Uint8ClampedArray => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const grayscaleData = new Uint8ClampedArray(width * height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    grayscaleData[i / 4] = avg;
  }
  return grayscaleData;
};

// --- Analysis Functions ---

const calculatePixelStats = (grayscaleData: Uint8ClampedArray): { brightness: number; contrast: number } => {
    let sum = 0;
    for(let i = 0; i < grayscaleData.length; i++) {
        sum += grayscaleData[i];
    }
    const mean = sum / grayscaleData.length;

    let varianceSum = 0;
    for(let i = 0; i < grayscaleData.length; i++) {
        varianceSum += (grayscaleData[i] - mean) ** 2;
    }
    const stdDev = Math.sqrt(varianceSum / grayscaleData.length);

    return { brightness: parseFloat(mean.toFixed(2)), contrast: parseFloat(stdDev.toFixed(2)) };
};

const checkForLowContrast = (contrast: number): boolean => {
    const LOW_CONTAST_THRESHOLD = 10; // Heuristic value
    return contrast < LOW_CONTAST_THRESHOLD;
};

const calculateHistogram = (imageData: ImageData): number[] => {
  const BINS = 16;
  const histogram = new Array(BINS * BINS * BINS).fill(0);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = Math.floor(data[i] / (256 / BINS));
    const g = Math.floor(data[i + 1] / (256 / BINS));
    const b = Math.floor(data[i + 2] / (256 / BINS));
    const index = r * BINS * BINS + g * BINS + b;
    histogram[index]++;
  }
  return histogram;
};

const compareHistograms = (hist1: number[], hist2: number[]): number => {
  let intersection = 0;
  let totalPixels1 = 0;
  let totalPixels2 = 0;

  for (let i = 0; i < hist1.length; i++) {
    intersection += Math.min(hist1[i], hist2[i]);
    totalPixels1 += hist1[i];
    totalPixels2 += hist2[i];
  }
  
  if (totalPixels1 === 0 || totalPixels2 === 0) return 0;
  const score = intersection / Math.min(totalPixels1, totalPixels2);
  return Math.round(score * 100);
};

const analyzeColorAndSkinTone = (imageData: ImageData): { colorVariety: number; skinTonePercent: number } => {
    const data = imageData.data;
    const pixelCount = data.length / 4;
    let skinPixelCount = 0;
    const colorSet = new Set<string>();
    const BINS = 8; // Lower bins for variety check

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin tone detection (heuristic RGB range)
        if (r > 95 && g > 40 && b > 20 &&
            r > g && r > b &&
            Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
            Math.abs(r - g) > 15) {
            skinPixelCount++;
        }

        // Color variety check
        const rBin = Math.floor(r / (256 / BINS));
        const gBin = Math.floor(g / (256 / BINS));
        const bBin = Math.floor(b / (256 / BINS));
        colorSet.add(`${rBin},${gBin},${bBin}`);
    }

    return {
        colorVariety: colorSet.size,
        skinTonePercent: (skinPixelCount / pixelCount) * 100,
    };
};


const classifySubject = (metrics: { edgeDensity: number, contrast: number, skinTonePercent: number, colorVariety: number }): string => {
    // Rule-based classification
    if (metrics.skinTonePercent > 10) {
        return "Human Portrait";
    }

    if (metrics.edgeDensity > 15 && metrics.contrast > 50 && metrics.colorVariety < 100) {
        return "Man-made Object";
    }
    
    if (metrics.edgeDensity > 8 && metrics.contrast > 30 && metrics.colorVariety > 150) {
        return "Animal";
    }

    if (metrics.edgeDensity < 10 && metrics.colorVariety > 200) {
        return "Landscape / Scenery";
    }

    return "General Subject / Abstract";
};

// --- Main Pipeline ---

const processAndAnalyzeSingleImage = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
    const MAX_WIDTH = 400;
    const scale = Math.min(1, MAX_WIDTH / img.width);
    const width = img.width * scale;
    const height = img.height * scale;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // --- Processing for previews ---
    ctx.drawImage(img, 0, 0, width, height);
    const originalImageData = ctx.getImageData(0, 0, width, height);
    const grayscaleData = getGrayscaleData(ctx, width, height);

    // Grayscale preview
    const grayscaleCanvas = document.createElement('canvas');
    grayscaleCanvas.width = width;
    grayscaleCanvas.height = height;
    const gtx = grayscaleCanvas.getContext('2d')!;
    const gImageData = gtx.createImageData(width, height);
    for (let i = 0; i < grayscaleData.length; i++) {
        gImageData.data[i * 4] = grayscaleData[i];
        gImageData.data[i * 4 + 1] = grayscaleData[i];
        gImageData.data[i * 4 + 2] = grayscaleData[i];
        gImageData.data[i * 4 + 3] = 255;
    }
    gtx.putImageData(gImageData, 0, 0);
    const grayscale = grayscaleCanvas.toDataURL('image/png');

    // Edge preview (Sobel Operator)
    const edgeCanvas = document.createElement('canvas');
    edgeCanvas.width = width;
    edgeCanvas.height = height;
    const etx = edgeCanvas.getContext('2d')!;
    const outputData = new Uint8ClampedArray(originalImageData.data.length);
    let edgePixels = 0;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const Gx = (-1 * grayscaleData[(y-1)*width + (x-1)]) + (1 * grayscaleData[(y-1)*width + (x+1)]) +
                       (-2 * grayscaleData[y*width + (x-1)])     + (2 * grayscaleData[y*width + (x+1)]) +
                       (-1 * grayscaleData[(y+1)*width + (x-1)]) + (1 * grayscaleData[(y+1)*width + (x+1)]);
            const Gy = (-1 * grayscaleData[(y-1)*width + (x-1)]) + (-2 * grayscaleData[(y-1)*width + x]) + (-1 * grayscaleData[(y-1)*width + (x+1)]) +
                       (1 * grayscaleData[(y+1)*width + (x-1)])  + (2 * grayscaleData[(y+1)*width + x])  + (1 * grayscaleData[(y+1)*width + (x+1)]);

            const magnitude = Math.sqrt(Gx*Gx + Gy*Gy);
            if (magnitude > 80) edgePixels++; // Threshold for an edge
            const pixelIndex = (y * width + x) * 4;
            outputData.set([magnitude, magnitude, magnitude, 255], pixelIndex);
        }
    }
    const edgeImageData = new ImageData(outputData, width, height);
    etx.putImageData(edgeImageData, 0, 0);
    const edges = edgeCanvas.toDataURL('image/png');

    // --- Analysis ---
    const { brightness, contrast } = calculatePixelStats(grayscaleData);
    const { colorVariety, skinTonePercent } = analyzeColorAndSkinTone(originalImageData);
    const edgeDensity = parseFloat(((edgePixels / (width * height)) * 100).toFixed(2));
    const isLowContrast = checkForLowContrast(contrast);
    
    const classification = classifySubject({ edgeDensity, contrast, skinTonePercent, colorVariety });
    const histogram = calculateHistogram(originalImageData);

    return {
        grayscale,
        edges,
        metrics: { brightness, contrast, edgeDensity, isLowContrast },
        classification,
        histogram
    };
};


export const analyzeImagesClientSide = async (imageDataUrl1: string, imageDataUrl2: string) => {
  const [img1, img2] = await Promise.all([loadImage(imageDataUrl1), loadImage(imageDataUrl2)]);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get canvas context");
  
  const analysis1 = processAndAnalyzeSingleImage(ctx, img1);
  const analysis2 = processAndAnalyzeSingleImage(ctx, img2);
  
  const similarityScore = compareHistograms(analysis1.histogram, analysis2.histogram);
  
  // --- Generate Intelligent Summary ---
  let summary = '';
  const class1 = analysis1.classification;
  const class2 = analysis2.classification;

  if (analysis1.metrics.isLowContrast || analysis2.metrics.isLowContrast) {
    summary += `[ANALYZABILITY WARNING] One or both images have very low contrast, which can make feature extraction difficult and may affect the accuracy of the similarity score.\n\n`;
  }

  if (class1 === class2) {
    summary += `Both images appear to be of the same category: '${class1}'.\n\n`;
    if (similarityScore > 85) {
      summary += `Their exceptionally high similarity score of ${similarityScore}% suggests they depict the very same subject or nearly identical scenes. For example, if they are 'Man-made Objects', they are likely the same type of object (e.g., both scissors or both cars).`;
    } else if (similarityScore > 60) {
      summary += `The strong similarity score of ${similarityScore}% indicates they share many visual characteristics, such as color palette and structure, as expected for two '${class1}' images.`;
    } else {
      summary += `Despite being in the same category, the lower similarity score of ${similarityScore}% suggests significant differences in lighting, angle, or specific subject matter.`;
    }
  } else {
    summary += `The images depict different subjects. Image 1 is classified as a '${class1}', while Image 2 is categorized as a '${class2}'.\n\nThis fundamental difference in subject matter is the primary reason for their moderate-to-low similarity score of ${similarityScore}%.`;
  }
  
  return {
    image1: {
        grayscale: analysis1.grayscale,
        edges: analysis1.edges,
        metrics: analysis1.metrics,
        classification: analysis1.classification
    },
    image2: {
        grayscale: analysis2.grayscale,
        edges: analysis2.edges,
        metrics: analysis2.metrics,
        classification: analysis2.classification
    },
    similarityScore,
    summary,
  };
};