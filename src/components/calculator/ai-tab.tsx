
"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { naturalLanguageMathQuery, type NaturalLanguageMathQueryOutput } from '@/ai/flows/natural-language-math-queries';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BrainCircuit, Loader2, Camera, X, Upload, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";


const FormSchema = z.object({
  query: z.string().min(3, { message: 'Query must be at least 3 characters long.' }),
});
type FormValues = z.infer<typeof FormSchema>;

export default function AiTab() {
  const [result, setResult] = useState<NaturalLanguageMathQueryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (showCamera) {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setHasCameraPermission(true);
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          setShowCamera(false);
          setIsDialogOpen(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this feature.',
          });
        }
      };
      getCameraPermission();
    } else {
        // Stop camera stream when not in use
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }
     return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCamera]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please select an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setImageData(dataUri);
        setIsDialogOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if(context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            setImageData(dataUri);
            setImagePreview(dataUri);
        }
        setShowCamera(false);
        setIsDialogOpen(false);
    }
  }

  const removeImage = () => {
      setImagePreview(null);
      setImageData(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  }

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    if (!data.query && !imageData) {
        setError('Please enter a query or upload/capture an image.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await naturalLanguageMathQuery({ 
          query: data.query,
          photoDataUri: imageData || undefined
      });
      setResult(response);
    } catch (err) {
      setError('Failed to process the query. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold">AI Math Query</h3>
        <p className="text-muted-foreground">Ask any math question in plain English, with or without an image.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Question</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Textarea
                      placeholder="e.g., What is the integral of x^2 from 0 to 1? Or upload an image of an equation."
                      className="resize-none pr-12"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="ghost" 
                        className="absolute bottom-2 right-2"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="sr-only">Upload or Capture Image</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add an Image</DialogTitle>
                        </DialogHeader>
                        {showCamera ? (
                             <div className="space-y-4">
                                <div className="bg-black rounded-md overflow-hidden aspect-video relative">
                                    <video ref={videoRef} className="w-full h-full" autoPlay muted playsInline />
                                    <canvas ref={canvasRef} className="hidden" />
                                     {hasCameraPermission === false && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                            <p className="text-white">Camera access denied.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <Button variant="outline" onClick={() => setShowCamera(false)}>Back</Button>
                                    <Button onClick={handleCapture} disabled={hasCameraPermission === false}>
                                        <Camera className="mr-2 h-4 w-4" />
                                        Capture
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Image
                                </Button>
                                <Button variant="outline" onClick={() => setShowCamera(true)}>
                                    <Video className="mr-2 h-4 w-4" />
                                    Use Camera
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                  </Dialog>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageChange}
                    className="hidden" 
                    accept="image/png, image/jpeg, image/webp"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {imagePreview && (
              <div className="relative w-full max-w-xs mx-auto animate-in fade-in duration-300">
                  <Image src={imagePreview} alt="Image preview" width={300} height={200} className="rounded-md object-contain"/>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={removeImage}
                   >
                       <X className="h-4 w-4" />
                       <span className="sr-only">Remove image</span>
                   </Button>
              </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            Ask AI
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono text-primary">{result.result}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {result.explanation}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
