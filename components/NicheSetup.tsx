import React, { useState } from 'react';
import type { Account } from '../types';

interface AccountSetupProps {
    onAccountAdd: (account: Account) => void;
}

const AccountSetup: React.FC<AccountSetupProps> = ({ onAccountAdd }) => {
    const [username, setUsername] = useState('');
    const [niche, setNiche] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (niche.trim() && username.trim()) {
            onAccountAdd({
                id: Date.now().toString(),
                username: username.trim().replace(/^@/, ''), // Remove leading @ if present
                niche: niche.trim(),
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 text-center animate-fade-in">
                <h1 className="text-4xl font-bold tracking-wider mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
                    Welcome to myhandle
                </h1>
                <p className="text-gray-400 mb-8">
                    Let's set up your first account. This will tailor all AI suggestions to your specific brand.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                     <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your Instagram Username (e.g., @myhandle)"
                        className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300 text-center text-lg"
                        required
                        autoFocus
                    />
                    <input
                        type="text"
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                        placeholder="Your Content Niche (e.g., Vegan Cooking)"
                        className="w-full p-4 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-300 text-center text-lg"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg text-lg"
                        disabled={!niche.trim() || !username.trim()}
                    >
                        Save & Start Creating
                    </button>
                </form>
                 <p className="text-xs text-gray-500 mt-6">
                    You can add more accounts later from the app header.
                </p>
            </div>
        </div>
    );
};

export default AccountSetup;