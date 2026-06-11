import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Loader, Image } from 'lucide-react';
import { processAndUpload } from '@/lib/imageProcessor';
import { useAuth } from '@/context/AuthContext';

export default function ImageUploader({ images = [], onChange, slug = 'product', maxImages = 8 }) {
  const { t }      = useTranslation();
  const { user }   = useAuth();
  const inputRef   = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0); // 0-100

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    const toProcess = Array.from(files).slice(0, remaining);

    setUploading(true);
    setProgress(0);

    try {
      const { resolveImgbbKey } = await import('@/lib/imageProcessor');
      const apiKey = await resolveImgbbKey(user);
      if (!apiKey) throw new Error('Could not resolve imgbb API key. Check VITE_IMGBB_API_KEY in .env');

      const urls = [];
      for (let i = 0; i < toProcess.length; i++) {
        const url = await processAndUpload(toProcess[i], apiKey, slug || 'product', images.length + i);
        urls.push(url);
        setProgress(Math.round(((i + 1) / toProcess.length) * 100));
      }
      onChange([...images, ...urls]);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const reorder = (from, to) => {
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="img-uploader">
      {/* Image grid */}
      {images.length > 0 && (
        <div className="img-grid">
          {images.map((url, i) => (
            <div key={url} className={`img-item ${i === 0 ? 'img-item-first' : ''}`}>
              <img src={url} alt={`Image ${i + 1}`} loading="lazy" />
              {i === 0 && <span className="img-item-label">Cover</span>}
              <button
                className="img-item-remove"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                type="button"
              >
                <X size={12} />
              </button>
              {/* Move left/right */}
              {i > 0 && (
                <button
                  className="img-item-move img-item-move-l"
                  onClick={() => reorder(i, i - 1)}
                  type="button"
                  aria-label="Move left"
                >‹</button>
              )}
              {i < images.length - 1 && (
                <button
                  className="img-item-move img-item-move-r"
                  onClick={() => reorder(i, i + 1)}
                  type="button"
                  aria-label="Move right"
                >›</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={`img-drop-zone ${uploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
            disabled={uploading}
          />
          {uploading ? (
            <>
              <Loader size={20} className="img-spin" strokeWidth={1.5} />
              <span>{t('admin.uploading')} {progress}%</span>
              <div className="img-progress-bar">
                <div className="img-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <Upload size={20} strokeWidth={1.5} />
              <span>{t('admin.upload_image')}</span>
              <span className="img-drop-hint">Drag & drop or click · {maxImages - images.length} remaining · WebP auto-converted</span>
            </>
          )}
        </div>
      )}

      <style>{`
        .img-uploader { display: flex; flex-direction: column; gap: 10px; }

        .img-grid {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .img-item {
          position: relative;
          width: 72px; height: 72px;
          border-radius: var(--r-s);
          overflow: hidden;
          border: 1px solid var(--border-2);
          flex-shrink: 0;
        }
        .img-item-first { border-color: var(--accent); }
        .img-item img { width: 100%; height: 100%; object-fit: cover; }
        .img-item-label {
          position: absolute; bottom: 0; left: 0; right: 0;
          background: rgba(201,184,154,0.85);
          color: var(--text-inv);
          font-size: 8px; font-weight: 600;
          text-align: center; padding: 2px 0;
          letter-spacing: 0.06em;
        }
        .img-item-remove {
          position: absolute; top: 3px; right: 3px;
          width: 18px; height: 18px;
          background: rgba(0,0,0,0.7);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: #fff; opacity: 0; transition: opacity var(--t-fast);
          cursor: pointer; border: none;
        }
        .img-item:hover .img-item-remove { opacity: 1; }
        .img-item-move {
          position: absolute; bottom: 3px;
          width: 18px; height: 18px;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 14px; line-height: 1;
          cursor: pointer; border: none;
          border-radius: 3px;
          opacity: 0; transition: opacity var(--t-fast);
        }
        .img-item:hover .img-item-move { opacity: 1; }
        .img-item-move-l { left: 3px; }
        .img-item-move-r { right: 3px; }

        .img-drop-zone {
          border: 1.5px dashed var(--border-2);
          border-radius: var(--r-m);
          padding: 20px 16px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          color: var(--text-3);
          cursor: pointer;
          transition: all var(--t-base);
        }
        .img-drop-zone:hover, .img-drop-zone:focus { border-color: var(--border-3); color: var(--text-2); background: var(--bg-3); }
        .img-drop-zone.uploading { pointer-events: none; opacity: 0.7; }
        .img-drop-zone > span:first-of-type { font-size: var(--text-sm); font-weight: 500; }
        .img-drop-hint { font-size: var(--text-xs); color: var(--text-4); text-align: center; }

        .img-spin { animation: spin 1s linear infinite; }
        .img-progress-bar {
          width: 120px; height: 3px;
          background: var(--border-2); border-radius: 2px;
          overflow: hidden;
        }
        .img-progress-fill {
          height: 100%; background: var(--accent);
          transition: width 0.2s ease;
        }
      `}</style>
    </div>
  );
}
