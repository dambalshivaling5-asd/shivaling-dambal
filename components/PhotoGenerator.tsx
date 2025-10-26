import React, { useState } from 'react';
import { generatePhoto } from '../services/geminiService';
import type { Account } from '../types';

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

interface PhotoGeneratorProps {
    account: Account;
}

const PhotoGenerator: React.FC<PhotoGeneratorProps> = ({ account }) => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt for the photo.');
            return;
        }
        setIsLoading(true);
        setError('');
        setImageUrl('');
        try {
            const url = await generatePhoto(prompt, account.niche);
            setImageUrl(url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">AI Photo Factory</h2>
            <p className="text-gray-400 mb-6">Create stunning photos for your posts. The AI will match the style to the <span className="font-bold text-pink-400">{account.niche}</span> niche.</p>

            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A cat wearing sunglasses, studio lighting'"
                    className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition duration-300 resize-none"
                    rows={2}
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-pink-600 hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
                >
                    {isLoading ? <Spinner /> : 'Create Photo'}
                </button>
            </div>

            {error && <p className="text-red-400 mt-4">{error}</p>}
            
            <div className="mt-8">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center bg-gray-900/50 h-80 rounded-lg border-2 border-dashed border-gray-600">
                        <Spinner />
                        <p className="mt-4 text-gray-400">Conjuring your visual masterpiece...</p>
                    </div>
                )}
                {imageUrl && (
                    <div className="relative group">
                        <img src={imageUrl} alt={prompt} className="rounded-lg w-full max-w-lg mx-auto shadow-2xl" />
                        <a 
                            href={imageUrl} 
                            download={`myhandle-photo-${Date.now()}.png`} 
                            className="absolute bottom-4 right-4 bg-black/50 text-white py-2 px-4 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            Download
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PhotoGenerator;