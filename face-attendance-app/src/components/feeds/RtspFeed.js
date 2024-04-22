import React, { useState, useEffect } from 'react';
import face_api, { faceApiBaseUrl, serverIp }  from '../../api/face_api';
import JSMpeg from "@cycjimmy/jsmpeg-player";
import axios from "axios";

import Spinner from 'react-bootstrap/Spinner';

const RtspFeed = ({rtspUrl, className}) => {
    const [rtspLoading, setRtspLoading] = useState(true);

    const rtspurl = "rtsp://CAPSTONE:@CAPSTONE1@192.168.1.2:554/live/ch00_0"; // Appartment Network
    // const rtspurl = "rtsp://CAPSTONE:@CAPSTONE1@192.168.254.104:554/live/ch00_0"; // Home Network

    useEffect(() => {
        startRTSPFeed();
        const url = 'ws://' + serverIp + ':9999';
        let canvas = document.getElementById("stream-canvas");
        const player = new JSMpeg.Player(String(url), {
            canvas: canvas,
            preserveDrawingBuffer: true,
            onVideoDecode: () => setRtspLoading(false),
        });


        return () => {
            stopRTSPFeed();
            setRtspLoading(true);
        }
    }, []);

    const httpRequest = async (url) => {
        axios.get(`http://${serverIp}:3002/stream?rtsp=${url}`);
    };

    const startRTSPFeed = () => {
        httpRequest(rtspUrl);
    };

    const stopRTSPFeed = () => {
        httpRequest("stop");
    };

    return (
        <div className={`video-feed ${className}`}>
            {rtspLoading && (
                <Spinner
                    className='position-absolute'
                    animation="border"
                    variant="light"
                />
            )}
            <canvas id="stream-canvas" style={{ backgroundColor: 'black' }}></canvas>
        </div>
    )
}

export default RtspFeed;