import React, { useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

export const ImageUpload = ({
  label,
  file,
  previewUrl,
  onChange,
  aspectRatio = 'aspect-[2/3]', // or 'aspect-video'
  className = '',
}) => {
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displaySrc = file ? URL.createObjectURL(file) : previewUrl;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && <label className="block text-xs font-bold text-ink">{label}</label>}

      <div
        onClick={() => inputRef.current?.click()}
        className={`relative w-full ${aspectRatio} rounded-md border-2 border-dashed border-border hover:border-primary/60 bg-gray-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors group`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {displaySrc ? (
          <>
            <img
              src={displaySrc}
              alt="Upload preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-sm"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center p-4 text-muted space-y-1 group-hover:text-primary transition-colors">
            <UploadCloud className="w-8 h-8 opacity-60 mb-1" />
            <p className="text-xs font-semibold">Click to upload</p>
            <p className="text-[10px] text-gray-400">PNG, JPG or WebP up to 5MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
