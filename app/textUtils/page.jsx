'use client'
import React, { useState } from 'react';
import toast from "react-hot-toast";

export default function TextForm() {
    const [text, setText] = useState('');

    const handleOnChange = (event) => {
        setText(event.target.value);
    }

    const handleClearText = () => {
        setText("");
        toast.success("Text cleared successfully!", {
            icon: '🗑️',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    }

    const handleUpperCase = () => {
        let newText = text.toUpperCase();
        setText(newText);
        toast.success("Converted to uppercase!", {
            icon: '📝',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    };

    const handleLowerCase = () => {
        let newText = text.toLowerCase();
        setText(newText);
        toast.success("Converted to lowercase!", {
            icon: '📝',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    }

    const handleCopy = () => {
        if (text.length === 0) {
            toast.error("No text to copy!", {
                icon: '⚠️',
                style: {
                    borderRadius: '10px',
                    background: '#fff',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                },
            });
            return;
        }
        navigator.clipboard.writeText(text);
        toast.success("Text copied to clipboard!", {
            icon: '📋',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    }

    const handleRemoveExtraSpaces = () => {
        let newText = text.replace(/\s+/g, ' ').trim();
        setText(newText);
        toast.success("Extra spaces removed!", {
            icon: '✨',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    }

    const handleCapitalizeWords = () => {
        let newText = text.replace(/\b\w/g, l => l.toUpperCase());
        setText(newText);
        toast.success("Words capitalized!", {
            icon: '🔤',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    }

    const handleReverseText = () => {
        let newText = text.split('').reverse().join('');
        setText(newText);
        toast.success("Text reversed!", {
            icon: '🔄',
            style: {
                borderRadius: '10px',
                background: '#fff',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
            },
        });
    }

    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    const charCountNoSpaces = text.replace(/\s/g, '').length;
    const sentenceCount = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphCount = text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
    const readingTime = (wordCount * 0.008).toFixed(2);

    return (
        <div 
          className="min-h-screen text-gray-900 relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50"
        >
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl bg-purple-200 opacity-30"></div>
                <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl bg-pink-200 opacity-30"></div>
            </div>
            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                {/* Main Content - Text Editor & Tools Side by Side */}
                <div className='flex flex-col lg:flex-row gap-8 mb-8'>
                    {/* Main Text Editor */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex-1">
                        <div 
                          className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                📝 Text Editor
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <textarea 
                                className="w-full h-80 p-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none resize-none transition-all duration-300 text-gray-900 placeholder-gray-500 leading-relaxed"
                                value={text}  
                                onChange={handleOnChange} 
                                placeholder="✍️ Start typing your text here... Let your creativity flow!"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden lg:w-96">
                        <div 
                          className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600"
                        >
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                🛠️ Text Tools
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                <button 
                                    className="text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                                    onClick={handleUpperCase}
                                >
                                    🔤 UPPER CASE
                                </button>
                                <button 
                                    className="text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800"
                                    onClick={handleLowerCase}
                                >
                                    🔡 LOWER CASE
                                </button>
                                <button 
                                    className="text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                    onClick={handleCapitalizeWords}
                                >
                                    📚 Title
                                </button>
                                <button 
                                    className="text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                                    onClick={handleReverseText}
                                >
                                    🔄 Reverse
                                </button>
                                <button 
                                    className="text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                    onClick={handleRemoveExtraSpaces}
                                >
                                    ✨ Remove Spaces
                                </button>
                                <button 
                                    className="text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    onClick={handleCopy}
                                >
                                    📋 Copy
                                </button>
                            </div>
                            
                            <div className="mt-4">
                                <button 
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" 
                                    onClick={handleClearText}
                                >
                                    🗑️ Clear All Text
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Text Statistics */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div 
                          className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600"
                        >
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                📊 Text Statistics
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div 
                                  className="p-4 rounded-xl text-center border border-purple-200 bg-purple-50"
                                >
                                    <div className="text-3xl font-bold text-purple-700">{wordCount}</div>
                                    <div className="font-medium text-purple-600">Words</div>
                                </div>
                                <div 
                                  className="p-4 rounded-xl text-center border border-pink-200 bg-pink-50"
                                >
                                    <div className="text-3xl font-bold text-pink-700">{charCount}</div>
                                    <div className="font-medium text-pink-600">Characters</div>
                                </div>
                                <div 
                                  className="p-4 rounded-xl text-center border border-blue-200 bg-blue-50"
                                >
                                    <div className="text-3xl font-bold text-blue-700">{charCountNoSpaces}</div>
                                    <div className="font-medium text-blue-600">Char excluding spaces</div>
                                </div>
                                <div 
                                  className="p-4 rounded-xl text-center border border-purple-200 bg-purple-50"
                                >
                                    <div className="text-3xl font-bold text-purple-700">{sentenceCount}</div>
                                    <div className="font-medium text-purple-600">Sentences</div>
                                </div>
                                <div 
                                  className="p-4 rounded-xl text-center border border-indigo-200 bg-indigo-50"
                                >
                                    <div className="text-3xl font-bold text-indigo-700">{paragraphCount}</div>
                                    <div className="font-medium text-indigo-600">Paragraphs</div>
                                </div>
                                <div 
                                  className="p-4 rounded-xl text-center border border-pink-200 bg-pink-50"
                                >
                                    <div className="text-3xl font-bold text-pink-700">{readingTime}</div>
                                    <div className="font-medium text-pink-600">Min Read</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-4">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                👀 Live Preview
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300 min-h-64 max-h-80 overflow-y-auto">
                                {text.length > 0 ? (
                                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                                        {text}
                                    </p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="text-6xl mb-4">📝</div>
                                        <p className="text-gray-600 text-lg">
                                            Your text preview will appear here
                                        </p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            Start typing in the editor above
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
