import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';
import { uploadMediaToCloudinary, validateMediaFile } from '../lib/cloudinaryService';

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'banner';
  folder?: string;
  id?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  description,
  value,
  onChange,
  aspectRatio = 'portrait',
  folder = 'mic-and-mind/guests',
  id = 'image-upload',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadError(null);

    // 1. Strict validation (JPG, JPEG, PNG, WEBP)
    const validation = validateMediaFile(file, 'image');
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image format.');
      return;
    }

    try {
      setUploadProgress(5);
      const secureUrl = await uploadMediaToCloudinary({
        file,
        folder,
        expectedType: 'image',
        onProgress: (percent) => setUploadProgress(percent),
      });

      onChange(secureUrl);
      setUploadProgress(null);
      setUploadError(null);
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadProgress(null);
      setUploadError(err?.message || 'Failed to upload image to Cloudinary.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualUrlSave = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setIsUrlMode(false);
      setUploadError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
          {label}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsUrlMode(!isUrlMode);
            setManualUrl(value || '');
            setUploadError(null);
          }}
          className="text-[11px] font-mono text-neutral-400 hover:text-[#DD5A1F] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isUrlMode ? 'Upload Mode' : 'Paste Direct URL'}</span>
        </button>
      </div>

      {description && (
        <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>
      )}

      {/* Validation / Error Feedback Alert */}
      {uploadError && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-red-200">Upload Issue: </span>
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isUrlMode ? (
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700 space-y-2.5">
          <div className="flex items-center gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#DD5A1F]"
            />
            <button
              type="button"
              onClick={handleManualUrlSave}
              className="px-3 py-2 bg-[#DD5A1F] hover:bg-[#B84312] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      ) : value ? (
        /* Image Preview with Management Actions */
        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-700/80 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shrink-0 group">
            <img
              src={value}
              alt="Asset Preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                {value.includes('cloudinary.com') ? 'Cloudinary Hosted' : 'External Asset'}
              </span>
            </div>
            <div className="text-xs font-mono text-neutral-300 truncate" title={value}>
              {value}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 text-[#DD5A1F] ${uploadProgress !== null ? 'animate-spin' : ''}`} />
                <span>{uploadProgress !== null ? `Uploading (${uploadProgress}%)` : 'Replace Image'}</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-red-900/40 text-red-400 hover:text-red-300 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* Drag-and-Drop Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (uploadProgress === null) fileInputRef.current?.click();
          }}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#DD5A1F] bg-[#DD5A1F]/10 scale-[1.01]'
              : 'border-neutral-700 hover:border-neutral-500 bg-neutral-900/60 hover:bg-neutral-900'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white">
              <UploadCloud className={`w-5 h-5 text-[#DD5A1F] ${uploadProgress !== null ? 'animate-bounce' : ''}`} />
            </div>

            <div>
              <span className="text-xs font-semibold text-white">
                {uploadProgress !== null ? 'Uploading to Cloudinary...' : 'Click to upload image'}
              </span>
              {uploadProgress === null && <span className="text-xs text-neutral-400"> or drag and drop</span>}
            </div>

            <p className="text-[11px] text-neutral-500 font-mono">
              JPG, JPEG, PNG, WEBP up to 10MB
            </p>

            {uploadProgress !== null && (
              <div className="w-full max-w-xs mt-2 space-y-1">
                <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DD5A1F] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-neutral-400">{uploadProgress}% complete</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

