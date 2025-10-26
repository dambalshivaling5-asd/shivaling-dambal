import React, { useState, useEffect } from 'react';
import { ContentType, Account } from './types';
import ScriptWriter from './components/ScriptWriter';
import PhotoGenerator from './components/PhotoGenerator';
import VideoGenerator from './components/VideoGenerator';
import TrendHub from './components/TrendHub';
import AccountSetup from './components/NicheSetup';
import AccountHealth from './components/AccountHealth';

const MHLogo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
        <path d="M4 28V4H8.66667L12.1667 14.8L15.6667 4H20.3333V28H16.3333V11.2L12.5 28H8L4.33333 11.2V28H4Z" fill="url(#paint0_linear_10_2)"/>
        <path d="M22.6667 28V4H30V8.66667H26.6667V13.6667H29.3333V18.3333H26.6667V28H22.6667Z" fill="url(#paint0_linear_10_2)"/>
        <defs>
            <linearGradient id="paint0_linear_10_2" x1="17" y1="4" x2="17" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#67E8F9"/>
                <stop offset="1" stopColor="#22D3EE"/>
            </linearGradient>
        </defs>
    </svg>
);

const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const VideoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ScriptIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TrendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);

const AccountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<ContentType>(ContentType.Trend);
    const [accounts, setAccounts] = useState<Account[]>(() => {
        const saved = localStorage.getItem('myhandle-accounts');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentAccountId, setCurrentAccountId] = useState<string | null>(() => {
        const savedId = localStorage.getItem('myhandle-current-account-id');
        const savedAccounts = localStorage.getItem('myhandle-accounts');
        // Ensure the saved ID is valid
        if (savedId && savedAccounts && JSON.parse(savedAccounts).some((a: Account) => a.id === savedId)) {
            return savedId;
        }
        return null;
    });
    const [isAddingAccount, setIsAddingAccount] = useState(false);

    useEffect(() => {
        localStorage.setItem('myhandle-accounts', JSON.stringify(accounts));
    }, [accounts]);
    
    useEffect(() => {
        if(currentAccountId) {
            localStorage.setItem('myhandle-current-account-id', currentAccountId);
        } else {
            // If there's no current account ID but there are accounts, select the first one.
            if(accounts.length > 0) {
                setCurrentAccountId(accounts[0].id);
            }
        }
    }, [currentAccountId, accounts]);

    const handleAddAccount = (newAccount: Account) => {
        const updatedAccounts = [...accounts, newAccount];
        setAccounts(updatedAccounts);
        setCurrentAccountId(newAccount.id);
        setIsAddingAccount(false);
    };

    const currentAccount = accounts.find(acc => acc.id === currentAccountId);

    if (accounts.length === 0 || isAddingAccount) {
        return <AccountSetup onAccountAdd={handleAddAccount} />;
    }

    if (!currentAccount) {
        // This case handles when an account was deleted but ID remains, shouldn't happen with current logic but is a good safeguard.
        setCurrentAccountId(accounts.length > 0 ? accounts[0].id : null);
        return <div>Loading account...</div>; // or some loading state
    }
    

    const renderContent = () => {
        switch (activeTab) {
            case ContentType.Trend:
                return <TrendHub account={currentAccount} />;
            case ContentType.AccountHealth:
                return <AccountHealth account={currentAccount} />;
            case ContentType.Script:
                return <ScriptWriter account={currentAccount} />;
            case ContentType.Photo:
                return <PhotoGenerator account={currentAccount} />;
            case ContentType.Video:
                return <VideoGenerator account={currentAccount} />;
            default:
                return null;
        }
    };

    const TabButton: React.FC<{ type: ContentType; label: string; icon: React.ReactNode }> = ({ type, label, icon }) => {
        const isActive = activeTab === type;
        return (
            <button
                onClick={() => setActiveTab(type)}
                className={`flex items-center justify-center font-semibold px-4 py-3 rounded-lg transition-all duration-300 ease-in-out w-full md:w-auto
                    ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
                {icon}
                {label}
            </button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm p-4 sticky top-0 z-10 border-b border-gray-700">
                <div className="container mx-auto flex justify-between items-center">
                     <div className="flex items-center">
                        <MHLogo />
                        <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-400">
                           myhandle
                        </h1>
                    </div>
                     <div className="flex items-center gap-4">
                         <select 
                            value={currentAccountId || ''}
                            onChange={(e) => setCurrentAccountId(e.target.value)}
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
                         >
                             {accounts.map(account => (
                                 <option key={account.id} value={account.id}>
                                     @{account.username}
                                 </option>
                             ))}
                         </select>
                         <button onClick={() => setIsAddingAccount(true)} className="text-sm bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition">
                             Add Account
                         </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8 p-1 bg-gray-800 rounded-lg shadow-md flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <TabButton type={ContentType.Trend} label="Trend Hub" icon={<TrendIcon />} />
                    <TabButton type={ContentType.AccountHealth} label="Account Health" icon={<AccountIcon />} />
                    <TabButton type={ContentType.Script} label="Script Writer" icon={<ScriptIcon />} />
                    <TabButton type={ContentType.Photo} label="Photo Factory" icon={<CameraIcon />} />
                    <TabButton type={ContentType.Video} label="Video Studio" icon={<VideoIcon />} />
                </div>
                
                <div className="w-full">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;