import React, { useState } from 'react';
import { getTrendSuggestions } from '../services/geminiService';
import type { GroundingChunk, Account } from '../types';

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

interface TrendHubProps {
    account: Account;
}

const TrendHub: React.FC<TrendHubProps> = ({ account }) => {
    const [suggestions, setSuggestions] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setSuggestions('');
        setSources([]);
        try {
            const { text, sources } = await getTrendSuggestions(account.niche);
            setSuggestions(text);
            setSources(sources.filter(s => s.web?.uri));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">Trend Hub</h2>
            <p className="text-gray-400 mb-6">Discover the latest trends for your <span className="font-bold text-orange-400">{account.niche}</span> niche. Our AI scours the web to keep you ahead of the curve.</p>
            
            <div className="space-y-4">
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-orange-600 hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
                >
                    {isLoading ? <Spinner /> : 'Find Latest Trends'}
                </button>
            </div>

            {error && <p className="text-red-400 mt-4">{error}</p>}

            {isLoading && !suggestions && (
                 <div className="flex flex-col items-center justify-center bg-gray-900/50 h-60 rounded-lg border-2 border-dashed border-gray-600 mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    <p className="mt-4 text-gray-400">Scouting the latest trends for you...</p>
                </div>
            )}
            
            {suggestions && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Your Trend Report:</h3>
                    <div className="bg-gray-900/50 p-6 rounded-lg whitespace-pre-wrap font-sans text-gray-300 border border-gray-700">
                        {suggestions}
                    </div>

                    {sources.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-300 mb-2">Sources from Google Search:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">
                                            {source.web?.title || source.web?.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TrendHub;