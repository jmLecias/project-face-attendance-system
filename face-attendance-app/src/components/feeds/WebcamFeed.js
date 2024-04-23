import React, { useState, useEffect, useRef } from 'react';

const WebcamFeed = ({ className, videoRef }) => {
    const [isStreamAvailable, setIsStreamAvailable] = useState(true);

    useEffect(() => {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
                    .then(stream => {
                        if (videoRef.current) {
                            videoRef.current.srcObject = stream;
                            setIsStreamAvailable(true); // Set stream availability to true
                        }
                    })
            } else {
                console.error("getUserMedia not supported on your browser!");
                setIsStreamAvailable(false); // Set stream availability to false if getUserMedia is not supported
            }
        } catch (error) {
            console.error("Error accessing media devices.", error);
            setIsStreamAvailable(false); // Set stream availability to false in case of error
        };
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <>
            {isStreamAvailable && (
                <div className={`video-feed ${className}`}>
                    <video ref={videoRef} autoPlay playsInline muted />
                    <canvas id="device-canvas" style={{ display: 'none' }}></canvas>
                </div>
            )}
        </>
    );
}

export default WebcamFeed;
