'use client';

import { useState } from 'react';

interface VideoPlayerProps {
    contentUrl: string;
    title: string;
    description: string;
}

// Function to extract YouTube video ID from various URL formats
const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
};

export default function VideoPlayer({ contentUrl, title, description }: VideoPlayerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const videoId = extractYouTubeVideoId(contentUrl);

    if (!videoId) {
        return (
            <div className="rcr-card p-6 text-center">
                <div className="text-red-600 mb-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="rcr-heading-secondary text-lg mb-2">Video Not Available</h3>
                <p className="text-gray-600 text-sm">
                    Unable to load video from the provided URL: {contentUrl}
                </p>
            </div>
        );
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;

    return (
        <div className="rcr-card p-6">
            <div className="mb-4">
                <h3 className="rcr-heading-secondary text-xl mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
            </div>

            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="text-sm text-gray-500">Loading video...</p>
                        </div>
                    </div>
                )}

                {hasError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <div className="text-red-500 mb-2">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600">Failed to load video</p>
                            <button
                                onClick={() => {
                                    setHasError(false);
                                    setIsLoading(true);
                                }}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={embedUrl}
                        title={title}
                        className={`w-full h-full ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                    />
                )}
            </div>

            {/* Video Controls and Information */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-4">
                    <a
                        href={contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        <span className="text-sm">Watch on YouTube</span>
                    </a>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Video Training</span>
                    </div>
                </div>
            </div>
        </div>
    );
}