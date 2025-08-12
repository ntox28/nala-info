import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "https://esm.sh/@google/genai";
import { ProductionItem } from '../types';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import AIAssistantIcon from './icons/AIAssistantIcon';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    productionItems: ProductionItem[];
}

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose, productionItems }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const chatRef = useRef<Chat | null>(null);
    const chatBodyRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
            document.body.style.overflow = 'hidden';

            if (messages.length === 0) {
                 if (!process.env.API_KEY) {
                    setMessages([{ sender: 'ai', text: 'Konfigurasi API Key untuk AI Assistant tidak ditemukan. Mohon hubungi administrator.' }]);
                } else {
                    setMessages([{ sender: 'ai', text: 'Halo! Saya Nala AI. Ada yang bisa saya bantu terkait antrian produksi hari ini?' }]);
                }
            }
        } else {
            dialogRef.current?.close();
            document.body.style.overflow = 'auto';
        }
    }, [isOpen]);

     useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        setMessages(prev => [...prev, { sender: 'user', text: trimmedInput }]);
        setInputValue('');
        setIsLoading(true);

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
                const systemInstruction = `You are a helpful and friendly AI assistant for Nala Media Digital Printing, a company in Karanganyar, Indonesia.
Your name is 'Nala AI'.
Your purpose is to provide quick and accurate answers about the current production queue based on the data provided.
- Analyze the provided JSON data which represents the current list of production items.
- Answer user questions clearly and concisely in Indonesian.
- Be friendly and professional.
- If a question cannot be answered from the provided data, politely say so. For example: "Maaf, saya tidak memiliki informasi mengenai hal tersebut."
- Do not make up information.
- The current date is ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`;
                
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction },
                });
            }

            const prompt = `
            This is the current production data:
            ${JSON.stringify(productionItems, null, 2)}

            User question: "${trimmedInput}"
            `;

            const response = await chatRef.current.sendMessage({ message: prompt });
            setMessages(prev => [...prev, { sender: 'ai', text: response.text }]);

        } catch (error) {
            console.error("AI Assistant Error:", error);
            const errorMessage = "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti.";
            setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === dialogRef.current) {
                    onClose();
                }
            }}
            className="w-full max-w-2xl h-[80vh] max-h-[700px] bg-gray-900/80 backdrop-blur-xl rounded-2xl p-0 text-gray-200 shadow-2xl border border-purple-500/20 open:animate-fade-in"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <AIAssistantIcon className="w-6 h-6 text-purple-400"/>
                        <h2 className="text-lg font-bold text-white">NALA siap membantu!</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label="Tutup">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </header>

                {/* Chat Body */}
                <div ref={chatBodyRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center flex-shrink-0"><AIAssistantIcon className="w-5 h-5 text-purple-300"/></div>}
                            <div className={`max-w-md p-3 rounded-2xl text-white ${msg.sender === 'user' ? 'bg-blue-600 rounded-br-lg' : 'bg-gray-700 rounded-bl-lg'}`}>
                               <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-end gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center flex-shrink-0"><AIAssistantIcon className="w-5 h-5 text-purple-300"/></div>
                            <div className="max-w-md p-3 rounded-2xl bg-gray-700 rounded-bl-lg flex items-center space-x-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0s'}}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse " style={{animationDelay: '0.4s'}}></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Form */}
                <footer className="p-4 border-t border-gray-700/50 flex-shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Tanyakan sesuatu tentang produksi..."
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg py-2 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading || !inputValue.trim()} className="p-2.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                            <PaperAirplaneIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </footer>
            </div>
        </dialog>
    );
};

export default AIAssistant;