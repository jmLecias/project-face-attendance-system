import React, { useState, useEffect, useRef} from 'react';


const WebcamFeed = ({className, videoRef}) => {

    useEffect(() => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true })
                .then(stream => {
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(error => {
                    console.error("Error accessing media devices.", error);
                });
        } else {
            console.error("getUserMedia not supported on your browser!");
        }

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className={`video-feed ${className}`}>
            <video ref={videoRef} autoPlay playsInline muted />
            <canvas id="device-canvas" style={{ display: 'none' }}></canvas>
        </div>
    )
}

export default WebcamFeed;