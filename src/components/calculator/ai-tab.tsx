"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { naturalLanguageMathQuery, type NaturalLanguageMathQueryOutput } from '@/ai/flows/natural-language-math-queries';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { BrainCircuit, Loader2, Camera, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { toast } from '@/hooks/use-toast';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      query: '',
    },
  });

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
      };
      reader.readAsDataURL(file);
    }
  };
  
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
        setError('Please enter a query or upload an image.');
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
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="ghost" 
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="sr-only">Upload Image</span>
                  </Button>
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
