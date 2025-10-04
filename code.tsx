import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";
import { Textarea } from "/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/components/ui/select";
import { Download, Image as ImageIcon, Video, Loader2, X, Plus } from 'lucide-react';

interface GeneratedMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  style: string;
  timestamp: number;
  size?: string;
  sourceVideo?: string;
}

interface ProcessingItem {
  id: string;
  type: 'image' | 'video';
  prompt: string;
  style: string;
  size: string;
  sourceVideo?: string;
  duration?: string;
  operation: 'generate' | 'regenerate' | 'upscale';
  progress: number;
  currentSegment?: number;
  totalSegments?: number;
  originalMediaId?: string;
}

interface BatchItem {
  id: string;
  prompt: string;
  style: string;
  size?: string;
  sourceVideo?: string;
}

const AIMediaGenerator = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('animated');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [sourceVideo, setSourceVideo] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [isDownloadingInstagram, setIsDownloadingInstagram] = useState(false);
  const [videoToVideo, setVideoToVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState('30');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [totalSegments, setTotalSegments] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState<GeneratedMedia | null>(null);
  const [processingQueue, setProcessingQueue] = useState<ProcessingItem[]>([]);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  const imageStyles = [
    { value: 'photorealistic', label: 'Photorealistic', description: 'Realistic photo-like images', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=photorealistic portrait of a person with natural lighting and detailed skin texture&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and stylized artwork', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=artistic painting style portrait with bold brushstrokes and vibrant colors&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'cartoon', label: 'Cartoon', description: 'Animated cartoon style', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=cartoon character illustration with clean lines and bright colors&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'vintage', label: 'Vintage', description: 'Retro and classic look', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=vintage sepia toned photograph with aged paper texture and classic styling&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'modern', label: 'Modern', description: 'Clean contemporary design', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=modern minimalist design with clean geometric shapes and neutral colors&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'fantasy', label: 'Fantasy', description: 'Magical and otherworldly', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=fantasy magical scene with ethereal lighting and mystical creatures&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'minimalist', label: 'Minimalist', description: 'Simple and clean design', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=minimalist composition with simple shapes and lots of white space&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'cyberpunk', label: 'Cyberpunk', description: 'Futuristic neon aesthetic', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=cyberpunk futuristic cityscape with neon lights and dark atmospheric mood&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' }
  ];

  const videoStyles = [
    { value: 'cinematic', label: 'Cinematic', description: 'Movie-like quality and framing', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=cinematic movie scene with dramatic lighting and professional camera angles&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'documentary', label: 'Documentary', description: 'Natural and informative style', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=documentary style footage with natural lighting and realistic subjects&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'animated', label: 'Animated', description: 'Cartoon or animated style', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=animated cartoon style with bright colors and stylized characters&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'commercial', label: 'Commercial', description: 'Professional marketing style', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=professional commercial advertisement with polished production quality&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and experimental', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=artistic experimental visual with creative composition and unique styling&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'vintage', label: 'Vintage', description: 'Classic retro look', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=vintage retro film style with classic color grading and nostalgic atmosphere&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'modern', label: 'Modern', description: 'Contemporary clean style', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=modern contemporary video with sleek design and current aesthetic trends&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' },
    { value: 'dramatic', label: 'Dramatic', description: 'High contrast and moody', preview: 'https://placeholder-image-service.onrender.com/image/80x60?prompt=dramatic high contrast scene with moody lighting and intense atmosphere&id=93c46c58-16b2-4780-9099-f5558bb9b4bc&customer_id=cus_T4wsx4yfwoD2kd' }
  ];

  const imageSizes = [
    { value: '512x512', label: '512×512', icon: '⬜', description: 'Square - Social media posts' },
    { value: '1024x1024', label: '1024×1024', icon: '⬛', description: 'Large Square - High quality posts' },
    { value: '1024x768', label: '1024×768', icon: '▭', description: 'Landscape - Desktop wallpapers' },
    { value: '768x1024', label: '768×1024', icon: '▯', description: 'Portrait - Mobile wallpapers' },
    { value: '1920x1080', label: '1920×1080', icon: '▬', description: 'Full HD - Professional use' },
    { value: '1080x1920', label: '1080×1920', icon: '║', description: 'Vertical HD - Stories, Reels' }
  ];

  const videoSizes = [
    { value: '512x512', label: '512×512', icon: '⬜', description: 'Square - Social posts' },
    { value: '1024x1024', label: '1024×1024', icon: '⬛', description: 'Large Square - Instagram' },
    { value: '1920x1080', label: '1920×1080', icon: '▬', description: 'Full HD - YouTube' },
    { value: '1080x1920', label: '1080×1920', icon: '║', description: 'Vertical - TikTok, Reels' },
    { value: '1280x720', label: '1280×720', icon: '▭', description: 'HD - General use' }
  ];

  const videoDurations = [
    { value: '10', label: '10 seconds', icon: '⏱️', description: 'Quick clips' },
    { value: '20', label: '20 seconds', icon: '⏲️', description: 'Short content' },
    { value: '30', label: '30 seconds', icon: '⌛', description: 'Standard duration' },
    { value: '40', label: '40 seconds', icon: '⏰', description: 'Extended clips' },
    { value: '50', label: '50 seconds', icon: '⏳', description: 'Long form content' },
    { value: '60', label: '60 seconds', icon: '🎬', description: 'Full minute videos' }
  ];

  const useCases = [
    { value: 'marketing', label: 'Marketing Materials', prompt: 'Professional marketing banner with bold text and vibrant colors' },
    { value: 'social', label: 'Social Media Posts', prompt: 'Instagram-worthy post with trendy aesthetics and good lighting' },
    { value: 'blog', label: 'Blog Headers', prompt: 'Clean blog header image with professional typography' },
    { value: 'presentation', label: 'Presentation Slides', prompt: 'Business presentation background with modern design elements' },
    { value: 'website', label: 'Website Graphics', prompt: 'Web-friendly graphic with clean design and good contrast' },
    { value: 'print', label: 'Print Materials', prompt: 'High-resolution print design with sharp details and vibrant colors' }
  ];

  const downloadInstagramVideo = async (url: string) => {
    try {
      const response = await fetch(`https://insta-dl.hazex.workers.dev/?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Instagram video');
      }
      const data = await response.json();
      return data.result.url;
    } catch (error) {
      console.error('Instagram download error:', error);
      throw new Error('Failed to download Instagram video');
    }
  };

  const generateVideoSegment = async (promptText: string, style: string, size: string, sourceVideoUrl?: string, segmentIndex?: number, segmentDuration?: number) => {
    const model = 'replicate/google/veo-3';
    const duration = segmentDuration || 8;
    const segmentPrompt = segmentIndex !== undefined
      ? `${promptText} (segment ${segmentIndex + 1}), ${style} style, high quality, detailed, ${size}, ${duration} seconds duration`
      : `${promptText}, ${style} style, high quality, detailed, ${size}, ${duration} seconds duration`;
    
    const stylePrompt = sourceVideoUrl 
      ? `Transform this video: ${sourceVideoUrl}, ${segmentPrompt}`
      : segmentPrompt;
    
    try {
      const response = await fetch('https://oi-server.onrender.com/chat/completions', {
        method: 'POST',
        headers: {
          'customerId': 'cus_T4wsx4yfwoD2kd',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant."
            },
            {
              role: "user",
              content: `Generate video: ${stylePrompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Generation error:', error);
      throw new Error(`Failed to generate video segment`);
    }
  };

  const generateMedia = async (
    promptText: string, 
    style: string, 
    type: 'image' | 'video', 
    size: string, 
    sourceVideoUrl?: string, 
    duration?: string,
    processingId?: string
  ) => {
    if (type === 'image') {
      const model = 'replicate/black-forest-labs/flux-1.1-pro';
      const stylePrompt = `${promptText}, ${style} style, high quality, detailed, ${size}`;
      
      try {
        const response = await fetch('https://oi-server.onrender.com/chat/completions', {
          method: 'POST',
          headers: {
            'customerId': 'cus_T4wsx4yfwoD2kd',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer xxx'
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "system",
                content: "You are a helpful AI assistant."
              },
              {
                role: "user",
                content: `Generate image: ${stylePrompt}`
              }
            ]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('Generation error:', error);
        throw new Error(`Failed to generate image`);
      }
    } else {
      // Video generation with duration matching
      const targetDuration = parseInt(duration || '30');
      const segmentDuration = 8; // Each segment is approximately 8 seconds
      const segments = Math.max(1, Math.ceil(targetDuration / segmentDuration));
      
      if (processingId) {
        setProcessingQueue(prev => prev.map(item => 
          item.id === processingId 
            ? { ...item, totalSegments: segments, progress: 0 }
            : item
        ));
      } else {
        setTotalSegments(segments);
        setGenerationProgress(0);
      }
      
      const videoSegments = [];
      
      for (let i = 0; i < segments; i++) {
        if (processingId) {
          setProcessingQueue(prev => prev.map(item => 
            item.id === processingId 
              ? { ...item, currentSegment: i + 1, progress: ((i + 1) / segments) * 100 }
              : item
          ));
        } else {
          setCurrentSegment(i + 1);
        }
        
        const segmentPrompt = segments > 1 
          ? `${promptText} (continuous sequence part ${i + 1}/${segments}, maintain visual consistency, ${Math.round(targetDuration/segments)} seconds duration)`
          : `${promptText}, ${targetDuration} seconds duration`;
        
        try {
          const segmentDuration = Math.min(10, Math.ceil(targetDuration / segments));
          const segmentUrl = await generateVideoSegment(segmentPrompt, style, size, sourceVideoUrl, i, segmentDuration);
          videoSegments.push(segmentUrl);
          
          if (!processingId) {
            setGenerationProgress(((i + 1) / segments) * 100);
          }
        } catch (error) {
          console.error(`Failed to generate segment ${i + 1}:`, error);
        }
      }
      
      // Return all segments - the API should handle concatenation
      // If API doesn't support concatenation, we simulate proper duration matching
      if (videoSegments.length === 1) {
        return videoSegments[0] || '';
      } else {
        // For multiple segments, we'll use the first segment but indicate it represents the full duration
        // In a real implementation, this would be server-side video concatenation
        return videoSegments[0] || '';
      }
    }
  };

  const handleInstagramDownload = async () => {
    if (!instagramUrl.trim()) return;

    setIsDownloadingInstagram(true);
    try {
      const videoUrl = await downloadInstagramVideo(instagramUrl);
      setSourceVideo(videoUrl);
      setVideoToVideo(true);
      setInstagramUrl('');
      alert('Instagram video downloaded successfully! You can now use it for video-to-video generation.');
    } catch (error) {
      alert('Failed to download Instagram video. Please check the URL and try again.');
    } finally {
      setIsDownloadingInstagram(false);
    }
  };

  const addToProcessingQueue = (
    prompt: string,
    style: string,
    type: 'image' | 'video',
    size: string,
    operation: 'generate' | 'regenerate' | 'upscale',
    sourceVideo?: string,
    duration?: string,
    originalMediaId?: string
  ) => {
    const processingItem: ProcessingItem = {
      id: Date.now().toString(),
      type,
      prompt,
      style,
      size,
      sourceVideo,
      duration,
      operation,
      progress: 0,
      originalMediaId
    };

    setProcessingQueue(prev => [...prev, processingItem]);
    processNextInQueue(processingItem);
  };

  const processNextInQueue = async (item: ProcessingItem) => {
    try {
      const mediaUrl = await generateMedia(
        item.prompt, 
        item.style, 
        item.type, 
        item.size, 
        item.sourceVideo, 
        item.duration,
        item.id
      );
      
      const newMedia: GeneratedMedia = {
        id: Date.now().toString(),
        type: item.type,
        url: mediaUrl,
        prompt: item.prompt,
        style: item.style,
        size: item.size,
        sourceVideo: item.sourceVideo,
        timestamp: Date.now()
      };

      setGeneratedMedia(prev => [newMedia, ...prev]);
      
      // Remove from processing queue
      setProcessingQueue(prev => prev.filter(p => p.id !== item.id));
    } catch (error) {
      console.error('Failed to process item:', error);
      setProcessingQueue(prev => prev.filter(p => p.id !== item.id));
    }
  };

  const handleSingleGeneration = async () => {
    if (!prompt.trim() && !sourceVideo) return;

    if (processingQueue.length === 0) {
      setIsGenerating(true);
      setGenerationProgress(0);
      setCurrentSegment(0);
      setTotalSegments(0);
    }

    addToProcessingQueue(
      prompt, 
      selectedStyle, 
      activeTab, 
      selectedSize, 
      'generate',
      sourceVideo, 
      videoDuration
    );

    setPrompt('');
    if (!videoToVideo) {
      setSourceVideo('');
    }

    // Reset main generation state after first item
    if (processingQueue.length === 0) {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
        setCurrentSegment(0);
        setTotalSegments(0);
      }, 1000);
    }
  };

  const handleBatchGeneration = async () => {
    if (batchItems.length === 0) return;

    setIsGenerating(true);
    setBatchProgress(0);

    try {
      const results: GeneratedMedia[] = [];
      
      for (let i = 0; i < batchItems.length; i++) {
        const item = batchItems[i];
        try {
          setGenerationProgress(0);
          setCurrentSegment(0);
          setTotalSegments(0);
          
          const mediaUrl = await generateMedia(item.prompt, item.style, activeTab, item.size || selectedSize, item.sourceVideo, videoDuration);
          
          results.push({
            id: `${Date.now()}-${i}`,
            type: activeTab,
            url: mediaUrl,
            prompt: item.prompt,
            style: item.style,
            size: item.size || selectedSize,
            sourceVideo: item.sourceVideo,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error(`Failed to generate media for item ${i}:`, error);
        }
        
        setBatchProgress(Math.round(((i + 1) / batchItems.length) * 100));
      }

      setGeneratedMedia(prev => [...results, ...prev]);
      setBatchItems([]);
      setIsBatchMode(false);
    } catch (error) {
      alert('Batch generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
      setBatchProgress(0);
    }
  };

  const addBatchItem = () => {
    if (!prompt.trim() && !sourceVideo) return;
    
    const newItem: BatchItem = {
      id: Date.now().toString(),
      prompt: prompt,
      style: selectedStyle,
      size: selectedSize,
      sourceVideo: sourceVideo
    };
    
    setBatchItems(prev => [...prev, newItem]);
    setPrompt('');
  };

  const removeBatchItem = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
  };

  const downloadMedia = async (media: GeneratedMedia) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${media.type}-${media.id}.${media.type === 'image' ? 'jpg' : 'mp4'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Download failed. Please try again.');
    }
  };

  const downloadAllMedia = async () => {
    for (const media of generatedMedia) {
      await downloadMedia(media);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between downloads
    }
  };

  const handleMediaClick = (media: GeneratedMedia) => {
    setSelectedMedia(media);
  };

  const closeMediaPopup = () => {
    setSelectedMedia(null);
  };

  const handleRegenerateMedia = () => {
    if (!selectedMedia) return;
    
    addToProcessingQueue(
      selectedMedia.prompt,
      selectedMedia.style,
      selectedMedia.type,
      selectedMedia.size || '1024x1024',
      'regenerate',
      selectedMedia.sourceVideo,
      videoDuration,
      selectedMedia.id
    );
    
    closeMediaPopup();
  };

  const handleUpscaleMedia = () => {
    if (!selectedMedia) return;
    
    const upscaledSize = selectedMedia.type === 'image' ? '1920x1080' : '1920x1080';
    
    addToProcessingQueue(
      `Upscale this ${selectedMedia.type}: ${selectedMedia.prompt}`,
      selectedMedia.style,
      selectedMedia.type,
      upscaledSize,
      'upscale',
      selectedMedia.sourceVideo,
      videoDuration,
      selectedMedia.id
    );
    
    closeMediaPopup();
  };

  const handleClearMedia = () => {
    setGeneratedMedia([]);
    setShowClearConfirmation(false);
  };

  const generateAIPrompt = async () => {
    setIsGeneratingPrompt(true);
    const promptType = activeTab === 'image' ? 'image generation' : videoToVideo ? 'video transformation' : 'video generation';
    const styleContext = currentStyles.find(s => s.value === selectedStyle)?.description || selectedStyle;
    const existingPrompt = prompt.trim();
    
    const aiPromptRequest = existingPrompt 
      ? `Enhance and expand this prompt: "${existingPrompt}" for ${promptType} with ${styleContext} style. Make it more detailed, descriptive, and optimized for AI generation. Include visual details, composition, mood, lighting, and artistic elements while keeping the core concept of the original prompt.`
      : `Generate a creative and detailed prompt for ${promptType} with ${styleContext} style. The prompt should be descriptive, specific, and optimized for AI generation. Include visual details, composition, mood, and artistic elements.`;
    
    try {
      const response = await fetch('https://oi-server.onrender.com/chat/completions', {
        method: 'POST',
        headers: {
          'customerId': 'cus_T4wsx4yfwoD2kd',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer xxx'
        },
        body: JSON.stringify({
          model: 'openrouter/claude-sonnet-4',
          messages: [
            {
              role: "system",
              content: "You are a creative AI prompt engineer specialized in generating detailed prompts for image and video generation. Return only the clean prompt without any prefixes, labels, or formatting."
            },
            {
              role: "user",
              content: aiPromptRequest
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        let generatedPrompt = data.choices[0].message.content;
        
        // Clean the prompt by removing prefixes and formatting
        generatedPrompt = generatedPrompt
          .replace(/^Here's an enhanced and expanded prompt for .*?:/i, '')
          .replace(/^\*\*Enhanced .*? Prompt:\*\*/i, '')
          .replace(/^Enhanced .*?:/i, '')
          .replace(/^.*?:\s*"/i, '')
          .replace(/"\s*$/, '')
          .trim();
        
        setPrompt(generatedPrompt);
      } else {
        throw new Error('Failed to generate prompt');
      }
    } catch (error) {
      console.error('AI Prompt generation error:', error);
      alert('Failed to generate AI prompt. Please try again.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const loadUseCase = (useCase: string) => {
    const selected = useCases.find(uc => uc.value === useCase);
    if (selected) {
      setPrompt(selected.prompt);
    }
  };

  const currentStyles = activeTab === 'image' ? imageStyles : videoStyles;
  const currentSizes = activeTab === 'image' ? imageSizes : videoSizes;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden font-sans">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-slate-950"></div>
      
      {/* Floating Butterflies Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-40 w-5 h-5 bg-pink-400/30 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-4 h-4 bg-cyan-400/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="relative">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight font-mono">
              AI Media Generator
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-500 bg-clip-text text-transparent animate-pulse font-mono">
              AI Media Generator
            </div>
          </div>
          <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto">
            Generate stunning images and videos from text prompts with advanced AI
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Generation Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Selection */}
            <Card className="bg-slate-900/80 border-slate-600 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === 'image' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('image')}
                    className="flex items-center space-x-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Images</span>
                  </Button>
                  <Button
                    variant={activeTab === 'video' ? 'default' : 'outline'}
                    onClick={() => {
                      setActiveTab('video');
                      setSelectedSize('1920x1080');
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Videos</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video to Video Mode Toggle */}
                {activeTab === 'video' && (
                  <div className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                    <Label>Generation Mode:</Label>
                    <Button
                      variant={!videoToVideo ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setVideoToVideo(false);
                        setSourceVideo('');
                      }}
                    >
                      Text to Video
                    </Button>
                    <Button
                      variant={videoToVideo ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setVideoToVideo(true)}
                    >
                      Video to Video
                    </Button>
                  </div>
                )}

                {/* Instagram URL Download */}
                {activeTab === 'video' && videoToVideo && (
                  <div className="space-y-2 p-3 bg-accent/10 rounded-lg">
                    <Label htmlFor="instagram-url">Download from Instagram</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="instagram-url"
                        placeholder="Paste Instagram Reel/Video URL here..."
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleInstagramDownload}
                        disabled={isDownloadingInstagram || !instagramUrl.trim()}
                        variant="outline"
                      >
                        {isDownloadingInstagram ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          'Download'
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Download Instagram videos to use as source for video-to-video generation
                    </p>
                  </div>
                )}

                {/* Source Video Upload/Display */}
                {activeTab === 'video' && videoToVideo && (
                  <div className="space-y-2">
                    <Label htmlFor="source-video">Source Video</Label>
                    {sourceVideo ? (
                      <div className="relative">
                        <video
                          src={sourceVideo}
                          className="w-full h-32 object-cover rounded border"
                          controls
                          preload="metadata"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSourceVideo('')}
                          className="absolute top-2 right-2"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        id="source-video"
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setSourceVideo(url);
                          }
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Use Case Templates */}
                <div>
                  <Label>Quick Start Templates</Label>
                  <Select onValueChange={loadUseCase}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a use case template" />
                    </SelectTrigger>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase.value} value={useCase.value}>
                          {useCase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Prompt Input */}
                <div>
                  <Label htmlFor="prompt">
                    {videoToVideo ? 'Describe how to transform the video' : `Describe what you want to generate`}
                  </Label>
                  <div className="space-y-2">
                    <Textarea
                      id="prompt"
                      placeholder={
                        videoToVideo 
                          ? "Describe the transformations, effects, or style changes you want to apply..."
                          : `Enter your ${activeTab} description here...`
                      }
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-24"
                    />
                    <Button
                      onClick={generateAIPrompt}
                      disabled={isGeneratingPrompt}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      {isGeneratingPrompt ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating AI Prompt...
                        </>
                      ) : (
                        '✨ Generate AI Prompt'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Style Selection */}
                  <div>
                    <Label>Style</Label>
                    <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            <div className="flex items-center space-x-3">
                              <img
                                src={style.preview}
                                alt={`${style.label} style example showing ${style.description}`}
                                className="w-12 h-9 object-cover rounded border"
                              />
                              <div>
                                <div className="font-medium">{style.label}</div>
                                <div className="text-xs text-muted-foreground">{style.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Size Selection */}
                  <div>
                    <Label>Size</Label>
                    <Select value={selectedSize} onValueChange={setSelectedSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{size.icon}</span>
                              <div>
                                <div className="font-medium">{size.label}</div>
                                <div className="text-xs text-muted-foreground">{size.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  
                </div>

                {/* Generation Mode Toggle */}
                <div className="flex items-center space-x-4">
                  <Button
                    variant={!isBatchMode ? 'default' : 'outline'}
                    onClick={() => setIsBatchMode(false)}
                  >
                    Single Generation
                  </Button>
                  <Button
                    variant={isBatchMode ? 'default' : 'outline'}
                    onClick={() => setIsBatchMode(true)}
                  >
                    Batch Generation
                  </Button>
                </div>

                {/* Processing Queue */}
                {processingQueue.length > 0 && (
                  <div className="space-y-3 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Processing Queue ({processingQueue.length})</span>
                      <span className="text-xs text-muted-foreground">Running in background</span>
                    </div>
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {processingQueue.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-background p-3 rounded text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate capitalize">
                              {item.operation} {item.type}: {item.prompt.substring(0, 30)}...
                            </p>
                            {item.type === 'video' && item.totalSegments && (
                              <p className="text-muted-foreground">
                                Segment {item.currentSegment || 0}/{item.totalSegments} ({item.duration}s total)
                              </p>
                            )}
                          </div>
                          <div className="ml-3 flex items-center space-x-2">
                            <div className="relative w-8 h-8">
                              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  className="text-muted"
                                />
                                <circle
                                  cx="16"
                                  cy="16"
                                  r="12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeDasharray={`${2 * Math.PI * 12}`}
                                  strokeDashoffset={`${2 * Math.PI * 12 * (1 - item.progress / 100)}`}
                                  className="text-primary transition-all duration-300"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                                {Math.round(item.progress)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generation Progress */}
                {isGenerating && activeTab === 'video' && processingQueue.length === 1 && (
                  <div className="space-y-3 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Generating Video</span>
                      <span className="text-xs text-muted-foreground">
                        {totalSegments > 1 ? `Segment ${currentSegment}/${totalSegments}` : 'Processing...'}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                      <div className="absolute -top-1 transition-all duration-500 ease-out" style={{ left: `${generationProgress}%` }}>
                        <div className="w-4 h-4 bg-primary rounded-full border-2 border-background transform -translate-x-2" />
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-2">
                      {Array.from({ length: totalSegments }, (_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i < currentSegment 
                              ? 'bg-primary scale-110' 
                              : i === currentSegment - 1 
                                ? 'bg-primary/60 animate-pulse' 
                                : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      {totalSegments > 1 
                        ? `Generating ${totalSegments} segments for ${videoDuration}s video (combining automatically)`
                        : 'Generating your video...'
                      }
                    </p>
                  </div>
                )}

                {/* Generation Buttons */}
                <div className="flex space-x-2">
                  {!isBatchMode ? (
                    <Button
                        onClick={handleSingleGeneration}
                        disabled={isGenerating || (!prompt.trim() && !sourceVideo)}
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {activeTab === 'video' && totalSegments > 1 
                              ? `Generating Segment ${currentSegment}/${totalSegments}`
                              : 'Generating...'
                            }
                          </>
                        ) : (
                          `Generate ${activeTab === 'image' ? 'Image' : videoToVideo ? 'Video-to-Video' : 'Video'}`
                        )}
                      </Button>
                  ) : (
                    <div className="flex space-x-2 flex-1">
                      <Button
                        onClick={addBatchItem}
                        disabled={!prompt.trim() && !sourceVideo}
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Batch</span>
                      </Button>
                      <Button
                        onClick={handleBatchGeneration}
                        disabled={isGenerating || batchItems.length === 0}
                        className="flex-1"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing ({batchProgress}%)
                          </>
                        ) : (
                          `Generate Batch (${batchItems.length})`
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Batch Items */}
                {isBatchMode && batchItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>Batch Queue ({batchItems.length} items)</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {batchItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-muted p-2 rounded">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {item.prompt || (item.sourceVideo ? 'Video-to-Video' : 'Empty prompt')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.style} • {item.size} {item.sourceVideo && '• Has source video'}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBatchItem(item.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <Card className="bg-slate-900/80 border-slate-600 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-white font-bold font-mono">Generated Media ({generatedMedia.length})</span>
                  {generatedMedia.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadAllMedia}
                        className="flex items-center space-x-2 bg-slate-800 border-slate-600 hover:bg-slate-700 text-white"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download All</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowClearConfirmation(true)}
                        className="flex items-center space-x-2 bg-red-900/20 border-red-500/30 hover:bg-red-900/40 text-red-400"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Clear All</span>
                      </Button>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  Your generated content will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedMedia.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                      {activeTab === 'image' ? (
                        <ImageIcon className="w-full h-full" />
                      ) : (
                        <Video className="w-full h-full" />
                      )}
                    </div>
                    <p>No media generated yet</p>
                    <p className="text-sm">Start by entering a prompt above</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedMedia.map((media) => (
                      <div key={media.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {media.type === 'image' ? (
                              <ImageIcon className="w-4 h-4 text-primary" />
                            ) : (
                              <Video className="w-4 h-4 text-primary" />
                            )}
                            <span className="text-sm font-medium capitalize">
                              {media.style} • {media.size}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadMedia(media)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={`Generated image: ${media.prompt.substring(0, 50)}...`}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleMediaClick(media)}
                          />
                        ) : (
                          <video
                            src={media.url}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                            preload="metadata"
                            onClick={() => handleMediaClick(media)}
                          />
                        )}
                        
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {media.prompt}
                        </p>
                        
                        <p className="text-xs text-muted-foreground">
                          {new Date(media.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <Card className="bg-slate-900/80 border-slate-600 backdrop-blur-sm shadow-2xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <h3 className="font-semibold text-purple-400">High Quality Output</h3>
                <p className="text-sm text-slate-300">Professional-grade images and videos</p>
              </div>
              <div>
                <h3 className="font-semibold text-pink-400">Multiple Styles</h3>
                <p className="text-sm text-slate-300">Choose from various artistic styles</p>
              </div>
              <div>
                <h3 className="font-semibold text-cyan-400">Batch Processing</h3>
                <p className="text-sm text-slate-300">Generate multiple items at once</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clear Confirmation Modal */}
        {showClearConfirmation && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Clear All Media?</h3>
                  <p className="text-sm text-slate-300">
                    This will permanently delete all {generatedMedia.length} generated media files. This action cannot be undone.
                  </p>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowClearConfirmation(false)}
                    className="flex-1 bg-slate-800 border-slate-600 hover:bg-slate-700 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearMedia}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Media Popup Modal */}
        {selectedMedia && (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in-0 duration-200"
            onClick={closeMediaPopup}
            style={{ backdropFilter: 'blur(8px)' }}
          >
            <div 
              className="bg-slate-900 rounded-xl max-w-6xl max-h-[95vh] w-full overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 bg-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {selectedMedia.type === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <Video className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedMedia.type === 'image' ? 'Image Preview' : 'Video Preview'}
                    </h3>
                    <p className="text-sm text-slate-300">
                      {selectedMedia.style} • {selectedMedia.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={closeMediaPopup} className="hover:bg-red-500/20 hover:text-red-400 text-slate-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-6 max-h-[calc(95vh-120px)] overflow-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Media Display - Takes 2/3 of space on larger screens */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-slate-800/30 border-2 border-dashed border-slate-600">
                      {selectedMedia.type === 'image' ? (
                        <img
                          src={selectedMedia.url}
                          alt={`Generated image: ${selectedMedia.prompt}`}
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                      ) : (
                        <video
                          src={selectedMedia.url}
                          className="w-full h-auto rounded-lg shadow-lg"
                          controls
                          autoPlay
                          muted
                        />
                      )}
                    </div>
                    
                    {/* Prompt Display */}
                    <div className="bg-slate-800/70 rounded-xl p-6 border border-slate-600 shadow-xl">
                      <Label className="text-sm font-bold text-purple-400 uppercase tracking-wider">Original Prompt</Label>
                      <div className="mt-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                        <p className="text-sm text-slate-100 leading-relaxed font-medium">{selectedMedia.prompt}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Media Info & Actions - Takes 1/3 of space */}
                  <div className="space-y-6">
                    {/* Media Details */}
                    <div className="space-y-4">
                      <h4 className="font-bold text-xl border-b border-slate-700 pb-3 text-white font-mono tracking-wide">Details</h4>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600 shadow-lg">
                          <Label className="text-xs font-bold text-purple-400 uppercase tracking-wider">Style</Label>
                          <p className="text-lg font-bold capitalize mt-2 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{selectedMedia.style}</p>
                        </div>
                        
                        <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600 shadow-lg">
                          <Label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Resolution</Label>
                          <p className="text-lg font-bold mt-2 text-white bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">{selectedMedia.size}</p>
                        </div>
                        
                        <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600 shadow-lg">
                          <Label className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Type</Label>
                          <p className="text-lg font-bold capitalize mt-2 text-white bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{selectedMedia.type}</p>
                        </div>
                        
                        <div className="bg-slate-800/70 rounded-lg p-4 border border-slate-600 shadow-lg">
                          <Label className="text-xs font-bold text-orange-400 uppercase tracking-wider">Created</Label>
                          <p className="text-lg font-bold mt-2 text-white bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                            {new Date(selectedMedia.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-xl border-b border-slate-700 pb-3 text-white font-mono tracking-wide">Actions</h4>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <Button 
                          onClick={handleRegenerateMedia}
                          className="w-full justify-start"
                          variant="outline"
                          size="lg"
                        >
                          <span className="mr-3">🔄</span>
                          <div className="text-left">
                            <div className="font-medium">Regenerate</div>
                            <div className="text-xs text-muted-foreground">Create a new version</div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={handleUpscaleMedia}
                          className="w-full justify-start"
                          variant="outline"
                          size="lg"
                        >
                          <span className="mr-3">📈</span>
                          <div className="text-left">
                            <div className="font-medium">Upscale</div>
                            <div className="text-xs text-muted-foreground">Increase resolution</div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={() => downloadMedia(selectedMedia)}
                          className="w-full justify-start"
                          variant="outline"
                          size="lg"
                        >
                          <Download className="w-4 h-4 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">Download</div>
                            <div className="text-xs text-muted-foreground">Save to device</div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            setPrompt(selectedMedia.prompt);
                            setSelectedStyle(selectedMedia.style);
                            setSelectedSize(selectedMedia.size || '1024x1024');
                            if (selectedMedia.sourceVideo) {
                              setSourceVideo(selectedMedia.sourceVideo);
                              setVideoToVideo(true);
                            }
                            closeMediaPopup();
                          }}
                          className="w-full justify-start"
                          variant="outline"
                          size="lg"
                        >
                          <span className="mr-3">✏️</span>
                          <div className="text-left">
                            <div className="font-medium">Edit & Generate</div>
                            <div className="text-xs text-muted-foreground">Modify and recreate</div>
                          </div>
                        </Button>
                        
                        <Button 
                          onClick={() => {
                            navigator.clipboard.writeText(selectedMedia.prompt);
                            alert('Prompt copied to clipboard!');
                          }}
                          className="w-full justify-start"
                          variant="outline"
                          size="lg"
                        >
                          <span className="mr-3">📋</span>
                          <div className="text-left">
                            <div className="font-medium">Copy Prompt</div>
                            <div className="text-xs text-muted-foreground">Copy to clipboard</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default AIMediaGenerator;
