import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadFormProps {
  onSubmit: (file: File, preview: string) => void;
  loading: boolean;
  onReset: () => void;
}

export const UploadForm = ({ onSubmit, loading, onReset }: UploadFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setError(null);
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    } else {
      setError('Please select a valid image file');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      setShowCamera(true);
      setError(null);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      setError('Unable to access camera. Please check permissions or use file upload instead.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            stopCamera();
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    stopCamera();
    onReset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB');
          return;
        }
        setError(null);
        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
      } else {
        setError('Please drop a valid image file');
      }
    }
  };

  const handleSubmit = () => {
    if (selectedFile && preview) {
      onSubmit(selectedFile, preview);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showCamera ? (
        <Card className="overflow-hidden shadow-2xl">
          <CardContent className="p-0 relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
              <div className="flex gap-4 justify-center">
                <Button onClick={capturePhoto} className="bg-primary hover:bg-primary/90">
                  <Camera className="w-5 h-5 mr-2" />
                  Capture
                </Button>
                <Button variant="destructive" onClick={stopCamera}>
                  ✕ Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card
            className={`relative border-2 border-dashed transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/5 scale-105'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="p-12">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />

              {preview ? (
                <div className="text-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg shadow-lg mb-4 object-cover"
                  />
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedFile?.name}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="ghost" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </label>
                    </Button>
                    <Button variant="ghost" onClick={resetForm}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer block text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <span className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                    Click to upload or drag and drop
                  </span>
                  <p className="mt-2 text-sm text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              )}
            </CardContent>
          </Card>

          {!showCamera && !selectedFile && (
            <div className="mt-6 text-center">
              <Button
                onClick={startCamera}
                disabled={loading}
                variant="outline"
                size="lg"
                className="gap-3"
              >
                <Camera className="w-5 h-5" />
                Use Camera
              </Button>
              <p className="mt-3 text-sm text-muted-foreground">
                Take a photo in real-time
              </p>
            </div>
          )}

          {selectedFile && (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              size="lg"
              className="w-full mt-6 gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Analyzing Sustainability...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Analyze Sustainability
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
};