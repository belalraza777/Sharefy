import React, { useState, useEffect } from 'react';
import useStoryStore from '../../store/storyStore';
import './CreateStory.css';
import './Story.css';


// Simple create story form: choose media, preview, add caption, submit.
// Uses store.createStory (original naming kept) and shows uploading state.
// Optional onSuccess/onClose callbacks for parent integration.

// Props:
// onSuccess: called with newly created story object after successful upload.
// onClose: optional close handler (e.g., close modal).
const CreateStory = ({ onSuccess, onClose }) => {
  const { createStory, creating } = useStoryStore();
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState(null);

  // Cleanup object URL when component unmounts or preview changes.
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  // Handle file selection & basic type guard.
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // Basic type check (allow image or video)
    if (!f.type.startsWith('image/') && !f.type.startsWith('video/')) {
      setLocalError('Only image or video files allowed');
      setFile(null);
      setPreview(null);
      return;
    }
    setLocalError(null);
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  // Submit new story via store (delegates upload to API layer).
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creating.uploading) return;
    if (!file) {
      setLocalError('Select a media file first');
      return;
    }
    const res = await createStory(file, caption.trim());
    if (res.success) {
      setFile(null);
      setCaption('');
      if (preview) { URL.revokeObjectURL(preview); setPreview(null); }
      if (onSuccess) onSuccess(res.data);
      if (onClose) onClose();
    }
  };

  return (
    <div className="create-story-container">
      <form onSubmit={handleSubmit} className="create-story-form">
        <h3 style={{ textAlign: 'center' }}>Create Story</h3>
        <label className="file-picker">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFile}
            disabled={creating.uploading}
          />
          <span>{file ? 'Change media' : 'Choose media'}</span>
        </label>
        {preview && (
          <div className="preview-wrapper">
            {file.type.startsWith('image/') ? (
              <img src={preview} alt="preview" className="preview-media" />
            ) : (
              <video src={preview} className="preview-media" controls />
            )}
          </div>
        )}
        <textarea
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={150}
          disabled={creating.uploading}
          className="caption-input"
        />
        {(localError || creating.error) && (
          <div className="story-create-error">{localError || creating.error}</div>
        )}
        <div className="actions-row">
          {onClose && (
            <button type="button" className="btn secondary" onClick={onClose} disabled={creating.uploading}>Cancel</button>
          )}
          <button type="submit" className="btn primary" disabled={creating.uploading}>
            {creating.uploading ? 'Uploading…' : 'Post Story'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateStory;