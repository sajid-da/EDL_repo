
import React, { useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (file: File) => void;
  imagePreview: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, imagePreview }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="bg-black/50 border-2 border-dashed border-gray-700 rounded-xl p-6 text-center transition-all duration-300 hover:border-amber-500 hover:bg-black/80 cursor-pointer aspect-video flex flex-col items-center justify-center relative group" onClick={handleClick}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {imagePreview ? (
        <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain rounded-xl p-2" />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <UploadIcon className="w-12 h-12 mb-4 text-gray-600 transition-colors group-hover:text-amber-400" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
          <p>Click or drag to upload</p>
          <p className="text-sm text-gray-500">PNG, JPG, WEBP</p>
        </div>
      )}
      <div className="absolute inset-0 rounded-xl transition-all duration-300 group-hover:shadow-[inset_0_0_15px_rgba(255,215,0,0.4),0_0_15px_rgba(255,215,0,0.3)]"></div>
    </div>
  );
};
