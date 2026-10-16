import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { EASE } from '../../lib/motion';

const ImageUpload = ({ images, setImages, maxImages = 5, maxSizeMB = 5 }) => {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // Release object URLs on unmount
  const previewsRef = useRef(previews);
  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);
  useEffect(() => () => previewsRef.current.forEach((p) => URL.revokeObjectURL(p)), []);

  const processFiles = (files) => {
    setError('');

    // Check total number of images
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = [];

    for (const file of files) {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name} exceeds ${maxSizeMB}MB`);
        continue;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image`);
        continue;
      }

      validFiles.push(file);
    }

    setPreviews((prev) => [...prev, ...validFiles.map((f) => URL.createObjectURL(f))]);
    setImages([...images, ...validFiles]);
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (images.length >= maxImages) return;
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    if (previews[index]) URL.revokeObjectURL(previews[index]);
    setPreviews(previews.filter((_, i) => i !== index));
    setError('');
  };

  const full = images.length >= maxImages;

  return (
    <div className="space-y-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300 ${
          full
            ? 'cursor-not-allowed border-line bg-paper-2/50 opacity-60'
            : dragOver
              ? 'cursor-copy border-flare bg-flare-soft/60 scale-[1.01]'
              : 'cursor-pointer border-line-strong bg-paper/60 hover:border-ink hover:bg-paper'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          disabled={full}
        />
        <motion.span
          animate={{ y: dragOver ? -4 : 0, scale: dragOver ? 1.08 : 1 }}
          className={`mb-3 grid size-12 place-items-center rounded-2xl transition-colors ${
            dragOver ? 'bg-flare text-white' : 'bg-card text-ink shadow-soft'
          }`}
        >
          <UploadCloud className="size-5" />
        </motion.span>
        <p className="text-sm font-medium text-ink">
          {full ? 'Photo limit reached' : dragOver ? 'Drop to add photos' : 'Drag photos here or click to browse'}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {images.length} / {maxImages} photos · JPG, PNG or WebP up to {maxSizeMB}MB
        </p>
      </label>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-danger-soft px-4 py-2.5 text-[13px] text-danger"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          <AnimatePresence initial={false}>
            {previews.map((preview, index) => (
              <motion.li
                key={preview}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-paper-2"
              >
                <img src={preview} alt={`Preview ${index + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  aria-label={`Remove photo ${index + 1}`}
                  className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-ink/80 text-paper backdrop-blur transition hover:bg-danger sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink backdrop-blur">
                    Cover
                  </span>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
          {!full && (
            <li className="aspect-square">
              <label className="grid size-full cursor-pointer place-items-center rounded-xl border border-dashed border-line-strong text-muted transition hover:border-ink hover:text-ink">
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
                <ImagePlus className="size-5" />
              </label>
            </li>
          )}
        </ul>
      )}

      {images.length === 0 && (
        <p className="text-[13px] text-muted">The first photo becomes the cover image buyers see first.</p>
      )}
    </div>
  );
};

export default ImageUpload;
