import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';

export default function BulkImageUploader({ 
  onUploadComplete, 
  cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  defaultCategory = "Event Capture",
  defaultPhotographer = "",
  hideMetadata = false
}) {
  const [files, setFiles] = useState([]);
  const [globalMetadata, setGlobalMetadata] = useState({
    category: defaultCategory,
    photographer: defaultPhotographer,
    event: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setError(null);
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending', // pending, compressing, uploading, success, error
      progress: 0,
      metadata: { title: file.name.split('.')[0] },
      optimizedSize: null,
      originalSize: file.size,
      url: null,
      publicId: null
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/avif': []
    }
  });

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateFileMetadata = (id, field, value) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, metadata: { ...f.metadata, [field]: value } } : f));
  };

  const handleUpload = async () => {
    if (!cloudName || !uploadPreset) {
      setError("Cloudinary configuration missing. Please check VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env");
      return;
    }

    if (files.length === 0) return;
    setIsUploading(true);
    setOverallProgress(0);
    setError(null);

    let completed = 0;
    const results = [];

    const processFile = async (fileObj) => {
      try {
        // Update status to compressing
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'compressing' } : f));
        
        const options = {
          maxSizeMB: 2,
          maxWidthOrHeight: 2500,
          useWebWorker: true,
          initialQuality: 0.8
        };
        
        const compressedFile = await imageCompression(fileObj, options);
        
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { 
          ...f, 
          status: 'uploading',
          optimizedSize: compressedFile.size 
        } : f));

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('upload_preset', uploadPreset);
        
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('Upload failed');
        }
        
        const data = await response.json();
        
        const resultItem = {
          url: data.secure_url,
          cloudinaryPublicId: data.public_id,
          title: fileObj.metadata.title || globalMetadata.event,
          category: fileObj.metadata.category || globalMetadata.category,
          photographer: fileObj.metadata.photographer || globalMetadata.photographer,
          event: globalMetadata.event,
          uploadDate: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        results.push(resultItem);
        
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { 
          ...f, 
          status: 'success', 
          url: data.secure_url, 
          publicId: data.public_id 
        } : f));
        
      } catch (err) {
        console.error(err);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
      } finally {
        completed++;
        setOverallProgress(Math.round((completed / files.length) * 100));
      }
    };

    // Process concurrently
    const concurrency = 3;
    const queue = [...files.filter(f => f.status !== 'success')];
    const executing = new Set();

    for (const fileObj of queue) {
      const p = processFile(fileObj).finally(() => {
        executing.delete(p);
      });
      executing.add(p);
      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }
    await Promise.all(executing);

    setIsUploading(false);
    
    if (results.length > 0 && onUploadComplete) {
      onUploadComplete(results);
      // Optional: Clear successful files after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
        setOverallProgress(0);
      }, 3000);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
      <h5 style={{ fontSize: '1rem', color: 'var(--gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Bulk Image Uploader
      </h5>
      
      {error && (
        <div style={{ padding: '1rem', background: 'rgba(255,77,77,0.1)', border: '1px solid #ff4d4d', color: '#ff4d4d', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Global Metadata Settings */}
      {!hideMetadata && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Default Category</label>
            <input className="form-input" value={globalMetadata.category} onChange={e => setGlobalMetadata({...globalMetadata, category: e.target.value})} placeholder="e.g. Event Capture" disabled={isUploading} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Default Photographer</label>
            <input className="form-input" value={globalMetadata.photographer} onChange={e => setGlobalMetadata({...globalMetadata, photographer: e.target.value})} placeholder="Name" disabled={isUploading} />
          </div>
        </div>
      )}

      <div 
        {...getRootProps()} 
        style={{ 
          border: '2px dashed', 
          borderColor: isDragActive ? 'var(--gold)' : 'var(--border)', 
          borderRadius: '12px', 
          padding: '3rem 1rem', 
          textAlign: 'center', 
          cursor: 'pointer',
          background: isDragActive ? 'rgba(201,169,110,0.05)' : 'transparent',
          transition: 'all 0.2s ease',
          marginBottom: '2rem'
        }}
      >
        <input {...getInputProps()} />
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📥</div>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Drag & drop images here, or click to select files</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>Supports JPG, PNG, WEBP, AVIF. Automatic optimization enabled.</p>
      </div>

      {files.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem' }}>Selected Files ({files.length})</h4>
            {files.length > 0 && (
              <button 
                onClick={() => setFiles([])} 
                disabled={isUploading}
                style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Clear All
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {files.map(file => (
              <div key={file.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <img src={file.preview} alt="preview" style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                  {file.status !== 'success' && !isUploading && (
                    <button 
                      onClick={() => removeFile(file.id)}
                      style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ×
                    </button>
                  )}
                  {file.status === 'success' && (
                    <div style={{ position: 'absolute', top: 5, right: 5, background: '#4CAF50', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                      ✓
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.8rem' }}>
                  {!hideMetadata && (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.3rem', fontSize: '0.75rem', marginBottom: '0.5rem', background: 'rgba(0,0,0,0.2)' }} 
                      placeholder="Title Override" 
                      value={file.metadata.title || ''}
                      onChange={(e) => updateFileMetadata(file.id, 'title', e.target.value)}
                      disabled={isUploading}
                    />
                  )}
                  <div style={{ fontSize: '0.65rem', opacity: 0.7, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{formatSize(file.originalSize)}</span>
                    {file.optimizedSize && <span style={{ color: 'var(--gold)' }}>→ {formatSize(file.optimizedSize)}</span>}
                  </div>
                  
                  {isUploading && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: file.status === 'error' ? '#ff4d4d' : 'var(--gold)' }}>
                      {file.status === 'pending' && 'Waiting...'}
                      {file.status === 'compressing' && 'Optimizing...'}
                      {file.status === 'uploading' && 'Uploading...'}
                      {file.status === 'success' && 'Uploaded!'}
                      {file.status === 'error' && 'Failed'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            {isUploading ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <span>Uploading {files.length} images...</span>
                  <span>{overallProgress}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${overallProgress}%`, background: 'var(--gold)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleUpload} 
                className="form-submit" 
                style={{ width: '100%' }}
                disabled={files.length === 0}
              >
                OPTIMIZE & UPLOAD {files.length} IMAGES
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
