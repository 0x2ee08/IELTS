'use client';
import Footer from '../components/Footer';
import Header from '../components/Header';
import React, { useEffect, useState, useRef } from 'react';
import config from '../config';
import axios from 'axios';
import { convertDuration } from '../components/tedtalk/convertDuration';
import { useRouter } from 'next/navigation';
import { Pagination, Card, Skeleton, Button, Divider } from "@nextui-org/react";

const ITEMS_PER_PAGE = 20;

const TedTalkPage: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    const fetchVideos = async () => {
        const token = localStorage.getItem('token');
        try {
            setLoading(true);
            const response = await axios.get(`${config.API_BASE_URL}api/get_ted_videos`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            console.log('Fetched videos:', response.data);
            setVideos(response.data.videos || []);
            setTotalPages(Math.ceil(response.data.videos.length / ITEMS_PER_PAGE));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching videos:', error);
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchVideos();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const currentVideos = videos.slice(startIndex, endIndex);

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-grow p-4">
                <h1 className="flex justify-center text-2xl font-bold mb-4">
                    TED Ed Videos
                </h1>

                <div className="mb-10 flex justify-center">
                    <Pagination 
                        total={totalPages} 
                        initialPage={1} 
                        onChange={handlePageChange} 
                        page={currentPage} 
                    />
                </div>

                <Divider className='mb-4'/>

                <div className="overflow-y-auto h-full">
                    <div className="space-y-4">
                        {currentVideos.map((video, index) => (
                            <a
                                key={index}
                                href={`/loader/tedtalk?id=${video._id}`}
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
