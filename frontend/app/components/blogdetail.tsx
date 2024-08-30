import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import styles from './ContestDetails.module.css';
import config from '../config';
import { useSearchParams } from "next/navigation";

interface ContestImage {
  data: string;
  contentType: string;
  name: string;
}

interface Contest {
  id: number;
  name: string;
  start: string;
  end: string;
  taskDescription: string;
  contestImage?: ContestImage;
}

const ContestDetails: React.FC = () => {
    const params = useSearchParams();

    useEffect(() => {
    const fetchContest = async () => {
      try {
        const id = params.get("id");
        const response = await axios.get(`${config.API_BASE_URL}api/get_contest/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
        } else {
        }
      } finally {
      }
    };

    fetchContest();
  }, [params]);

    return (
        <div className="container mx-auto p-4">
      
        </div>
    );
};

export default ContestDetails;