import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from '../services/geminiService';
import type { Account } from '../types';

const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);

const loadingMessages = [
    "Warming up the virtual cameras...",
    "Choreographing pixels into motion...",
    "Rendering your cinematic vision...",
    "This can take a few minutes, good things come to those who wait!",
    "Polishing the final frames...",
    "Almost ready for the premiere..."
];

const ApiKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => (
    <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg bg-gray-900/50">
        <h3 className="text-xl font-semibold mb-2">Veo Video Generation Requires Your API Key</h3>
        <p className="text-gray-400 mb-4">To generate videos, please select an API key from your project. This is a one-time setup for this session.</p>
        <p className="text-sm text-gray-500 mb-6">
            Please ensure your project has billing enabled. For more information, visit the{' '}
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">
                official billing documentation
            </a>.
        </p>
        <button
            onClick={async () => {
                await window.aistudio.openSelectKey();
                onKeySelected();
            }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300"
        >
            Select API Key
        </button>
    </div>
);

type AspectRatio = '16:9' | '9:16';

interface VideoGeneratorProps {
    account: Account;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ account }) => {
    const [isKeyReady, setIsKeyReady] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
    const [videoUrl, setVideoUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [error, setError] = useState('');
    
    const checkKey = useCallback(async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setIsKeyReady(true);
        } else {
            setIsKeyReady(false);
        }
    }, []);

    useEffect(() => {
        checkKey();
    }, [checkKey]);
    
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = loadingMessages.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % loadingMessages.length;
                    return loadingMessages[nextIndex];
                });
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for the video.');
            return;
        }
        setIsLoading(true);
        setError('');
        setVideoUrl('');
        setLoadingMessage(loadingMessages[0]);
        try {
            const url = await generateVideo(prompt, aspectRatio, account.niche);
            setVideoUrl(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            if (errorMessage.includes("Requested entity was not found")) {
                 setError("Your API key is invalid. Please select a valid key.");
                 setIsKeyReady(false);
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isKeyReady) {
        return <ApiKeySelector onKeySelected={() => setIsKeyReady(true)} />;
    }

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">AI Video Studio</h2>
            <p className="text-gray-400 mb-6">Describe a scene and watch the magic happen. The video style will be customized for the <span className="font-bold text-cyan-300">{account.niche}</span> niche.</p>

            <div className="space-y-4">
                 <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A neon hologram of a cat driving at top speed'"
                    className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300 resize-none"
                    rows={2}
                    disabled={isLoading}
                />
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full sm:w-auto">
                        <label className="text-sm font-medium text-gray-400">Aspect Ratio:</label>
                        <div className="mt-1 flex gap-2 rounded-lg bg-gray-700 p-1">
                            {(['9:16', '16:9'] as AspectRatio[]).map(ratio => (
                                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-sm font-semibold rounded-md transition ${aspectRatio === ratio ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                                    {ratio} {ratio === '9:16' ? '(Portrait)' : '(Landscape)'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full sm:flex-1 flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
                    >
                        {isLoading ? <Spinner /> : 'Generate Video'}
                    </button>
                </div>
            </div>

            {error && <p className="text-red-400 mt-4">{error}</p>}
            
            <div className="mt-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center bg-gray-900/50 min-h-80 rounded-lg border-2 border-dashed border-gray-600 p-8">
                        <Spinner />
                        <p className="mt-4 text-lg text-gray-300">{loadingMessage}</p>
                    </div>
                )}
                {videoUrl && (
                    <div className="relative group max-w-md mx-auto">
                        <video src={videoUrl} controls autoPlay loop className="rounded-lg w-full shadow-2xl" />
                        <a 
                            href={videoUrl} 
                            download={`myhandle-video-${Date.now()}.mp4`} 
                            className="absolute bottom-4 right-4 bg-black/50 text-white py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                           Download Video
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;