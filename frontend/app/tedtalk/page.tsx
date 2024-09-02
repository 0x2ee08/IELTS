'use client';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState, useRef } from 'react';
import config from '../config';
import axios from 'axios';
import { convertDuration } from '../components/tedtalk/convertDuration';
import { useRouter } from 'next/navigation';

const TedTalkPage: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    // Function to fetch videos from the backend
    const fetchVideos = async () => {
        const token = localStorage.getItem('token'); // Assume user is authenticated and token is available
        try {
            setLoading(true);
            const response = await axios.get(`${config.API_BASE_URL}api/get_ted_videos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Fetched videos:', response.data); // Log fetched video data
            setVideos(response.data.videos || []); // Set the fetched videos
            setLoading(false);
        } catch (error) {
            console.error('Error fetching videos:', error);
            setLoading(false);
        }
    };

    // Function to fetch and save videos from YouTube using the backend
    const takeVideos = async () => {
        try {
            await axios.post(`${config.API_BASE_URL}api/fetch_and_save_ted_videos`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Videos fetched and saved successfully');
        } catch (error) {
            console.error('Error fetching and saving videos:', error);
        }
    };

    // Effect to fetch videos on component mount
    useEffect(() => {
        // takeVideos();
        fetchVideos();
    }, []);

    // Observer to detect when the user scrolls to the bottom to load more videos (if implemented)
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    // Implement lazy loading or pagination if needed in the future
                    console.log('Reached end of the list');
                }
            },
            { threshold: 1.0 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [loading]);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow p-4">
                <h1 className="text-2xl font-bold mb-4">TEDx Talks Videos</h1>

                <div className="overflow-y-auto h-full">
                    <div className="space-y-4">
                        {videos.map((video, index) => (
                            <a
                                key={index}
                                href={`/ted_video_loader?id=${video._id}`} // Update this URL to match your routing structure
                                className="flex items-start space-x-4 border-b pb-4 cursor-pointer text-decoration-none"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-32 h-18 object-cover rounded"
                                />
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">{video.title}</h2>
                                    <p className="text-sm">Duration: {convertDuration(video.duration)}</p>
                                    <p className="text-sm">Views: {video.views}</p>
                                    <p className="text-sm">Likes: {video.likes}</p>
                                </div>
                            </a>
                        
                        ))}
                    </div>
                </div>

                {loading && <p>Loading more videos...</p>}

                <div ref={observerRef} style={{ height: '20px' }} />
            </main>

            <Footer />
        </div>
    );
};

export default TedTalkPage;
