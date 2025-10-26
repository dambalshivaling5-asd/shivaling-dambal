import React, { useState } from 'react';
import { generateScript } from '../services/geminiService';
import type { GroundingChunk, Account } from '../types';

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

interface ScriptWriterProps {
    account: Account;
}

const ScriptWriter: React.FC<ScriptWriterProps> = ({ account }) => {
    const [prompt, setPrompt] = useState('');
    const [script, setScript] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a topic for your script.');
            return;
        }
        setIsLoading(true);
        setError('');
        setScript('');
        setSources([]);
        try {
            const { text, sources } = await generateScript(prompt, account.niche);
            setScript(text);
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
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">AI Script Writer</h2>
            <p className="text-gray-400 mb-6">Describe your content idea, and our AI will write a script for @{account.username} tailored for the <span className="font-bold text-green-400">{account.niche}</span> niche.</p>
            
            <div className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'A quick review of the latest tech gadget' or 'My morning routine for a productive day'"
                    className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-300 resize-none h-28"
                    rows={3}
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg"
                >
                    {isLoading ? <Spinner /> : 'Generate Script'}
                </button>
            </div>

            {error && <p className="text-red-400 mt-4">{error}</p>}
            
            {script && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4">Generated Script:</h3>
                    <div className="bg-gray-900/50 p-6 rounded-lg whitespace-pre-wrap font-mono text-gray-300 border border-gray-700">
                        {script}
                    </div>

                    {sources.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-gray-300 mb-2">Sources from Google Search:</h4>
                            <ul className="list-disc list-inside space-y-1">
                                {sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">
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

export default ScriptWriter;