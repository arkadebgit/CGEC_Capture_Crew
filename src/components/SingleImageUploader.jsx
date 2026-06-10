import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';

export default function SingleImageUploader({ 
  onUploadComplete, 
  cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  label = "Upload Image",
  currentUrl = null
}) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setError(null);
    const selectedFile = acceptedFiles[0];
    
    selectedFile.preview = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    
    // Auto-upload
    handleUpload(selectedFile);
  }, [cloudName, uploadPreset, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/avif': []
    },
    maxFiles: 1
  });

  const handleUpload = async (fileObj) => {
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary configuration missing in .env");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2500,
        useWebWorker: true,
        initialQuality: 0.8
      };
      
      const compressedFile = await imageCompression(fileObj, options);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', uploadPreset);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      
      if (onUploadComplete) {
        onUploadComplete(data.secure_url, data.public_id);
      }
      
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. " + err.message);
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1rem', width: '100%' }}>
      <div 
        {...getRootProps()} 
        style={{ 
          border: '2px dashed', 
          borderColor: isDragActive ? 'var(--gold)' : 'var(--border)', 
          borderRadius: '8px', 
          padding: '1.5rem 1rem', 
          textAlign: 'center', 
          cursor: isUploading ? 'not-allowed' : 'pointer',
          background: isDragActive ? 'rgba(201,169,110,0.05)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s ease',
          opacity: isUploading ? 0.7 : 1
        }}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {isUploading ? (
          <div style={{ color: 'var(--gold)' }}>
            <div style={{ marginBottom: '0.5rem' }}>⏳ Optimizing & Uploading...</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Please wait</div>
          </div>
        ) : file ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <img src={file.preview} alt="preview" style={{ height: '40px', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.8rem', color: '#4CAF50' }}>Uploaded Successfully! Click to replace.</span>
          </div>
        ) : currentUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
            <img src={currentUrl} alt="current" style={{ height: '40px', borderRadius: '4px' }} />
            <span style={{ fontSize: '0.8rem' }}>Click or drag to replace image</span>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📤</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{label}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Drag & drop or click to select (JPG, PNG, WEBP)</div>
          </div>
        )}
      </div>
      {error && <div style={{ color: '#ff4d4d', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</div>}
    </div>
  );
}
