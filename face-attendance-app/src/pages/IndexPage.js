import React, { useState, useEffect, useRef } from 'react';
import face_api, { faceApiBaseUrl, serverIp } from '../api/face_api';
import { toDisplayText, toFilename } from '../services/DateFormatService';
import { ToastContainer, toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import ListenerHeader from '../components/headers/ListenerHeader';
import ListenerSidebar from '../components/sidebars/ListenerSidebar';

import RecognizedItem from '../components/items/RecognizedItem';
import RecognizedLoadingItem from '../components/items/RecognizedLoadingItem';
import UnknownItem from '../components/items/UnknownItem';

import RtspFeed from '../components/feeds/RtspFeed';
import WebcamFeed from '../components/feeds/WebcamFeed';

import { RiLiveFill } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";


const IndexPage = () => {    
    const videoRef = useRef(null);

    const rtspurl = "rtsp://CAPSTONE:@CAPSTONE1@192.168.1.2:554/live/ch00_0"; // Appartment Network
    // const rtspurl = "rtsp://CAPSTONE:@CAPSTONE1@192.168.254.104:554/live/ch00_0"; // Home Network

    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState(null);
    const [detection, setDetection] = useState(null);
    const [datetime, setDateTime] = useState(null);
    const [verifiedFaces, setVerifiedFaces] = useState([]);

    const renderRecognized = () => {
        return verifiedFaces.map((face, index) => {
            if (face.identity !== null) {
                return (
                    <RecognizedItem
                        key={index}
                        identityPath={face.identity}
                        detected={face.detected}
                    />
                )
            } else {
                return (
                    <UnknownItem
                        key={index}
                        detected={face.detected}
                    />
                )
            }
        });
    }

    const captureFrame = () => {
        return new Promise((resolve, reject) => {
            const canvas = document.getElementById("stream-canvas");
            requestAnimationFrame(() => {
                canvas.toBlob(resolve, 'image/png');
            });
        });
    };

    const captureDeviceFrame = () => {
        const video = videoRef.current;
        const canvas = document.getElementById("device-canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        return new Promise((resolve, reject) => {
            requestAnimationFrame(() => {
                canvas.toBlob(resolve, 'image/png');
            });
        });
    };

    const handleCapture = async () => {
        setIsScanning(true);
        setDetection(null);
        setVerifiedFaces([]);
        setDateTime(null)

        const date = new Date();
        const formattedDate = toDisplayText(date);

        const imageBlob = await captureFrame();
        const deviceImageBlob = await captureDeviceFrame();

        const captureData = new FormData();
        captureData.append('capturedFrames', imageBlob, toFilename(date) + "_ipcam.png");
        captureData.append('capturedFrames', deviceImageBlob, toFilename(date) + "_dvcam.png");
        captureData.append('datetime', date);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        setDateTime(formattedDate);
        setScanStatus("detecting");

        await face_api.post('/detect-faces', captureData, config)
            .then((response) => {
                const newDetection = response.data;

                setDetection(newDetection);

                if (newDetection.faces.length == 0) {
                    toast.error("No faces were detected", {
                        autoClose: 2500,
                        closeOnClick: true,
                        hideProgressBar: true,
                        position: 'bottom-right'
                    });
                } else {
                    toast.info(newDetection.faces.length + " face(s) were detected", {
                        autoClose: 2500,
                        closeOnClick: true,
                        hideProgressBar: true,
                        position: 'bottom-right'
                    });
                }

                return newDetection;
            }).then(async (detection) => {
                setScanStatus("recognizing");
                const response = await face_api.post('/recognize-faces', JSON.stringify(detection), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const results = response.data.results

                if (results.filter((face) => face.identity).length === 0) {
                    toast.error("No faces were recognized", {
                        autoClose: 2500,
                        closeOnClick: true,
                        hideProgressBar: true,
                        position: 'bottom-right'
                    });
                } else {
                    toast.info(results.length + " face(s) were recognized", {
                        autoClose: 2500,
                        closeOnClick: true,
                        hideProgressBar: true,
                        position: 'bottom-right'
                    });
                }

                setVerifiedFaces(results);

                return results;
            }).finally(() => {
                setIsScanning(false);
                setScanStatus(null);
            })

    }
    

    return (
        <div className="listener-main-container" >
            <ToastContainer />
            <ListenerHeader />
            <ListenerSidebar />

            <div className='listener-main custom-scrollbar'>
                <div className='attendance-container'>
                    <div className='d-flex align-items-center'>
                        <RiLiveFill className='me-2' size={24} />
                        <span className='fs-5 fw-bold'>Live video feed</span>
                    </div>
                    <div className='d-flex align-items-start w-100 mt-3' >
                        <div style={{ width: '60%' }}>
                            <div className='w-100 d-flex align-items-start'>
                                <RtspFeed 
                                    className='me-2 mb-3 w-50'
                                    rtspUrl={rtspurl} 
                                />
                                <WebcamFeed 
                                    className={'ms-2 w-50'} 
                                    videoRef={videoRef}
                                />
                            </div>
                            <div className='d-flex align-items-center mb-3'>
                                <Button
                                    onClick={() => handleCapture()}
                                    disabled={isScanning}
                                    style={{
                                        backgroundColor: 'var(--primary-color)',
                                        fontSize: '18px',
                                        marginRight: '10px ',
                                    }}
                                >
                                    {(isScanning) ? "Taking attendance..." : "Take attendance"}
                                </Button>

                                {(isScanning && scanStatus === "detecting") && (
                                    <div className='d-flex align-items-center'>
                                        <Spinner
                                            className='me-2'
                                            animation="border"
                                            variant="dark"
                                            size='sm'
                                        />
                                        <span className='fs-6'>Detecting faces...</span>
                                    </div>
                                )}

                                {(isScanning && scanStatus === "recognizing") && (
                                    <div className='d-flex align-items-center'>
                                        <Spinner
                                            className='me-2'
                                            animation="border"
                                            variant="dark"
                                            size='sm'
                                        />
                                        <span className='fs-6'>Recognizing detections...</span>
                                    </div>
                                )}
                            </div>

                            {(detection && !isScanning) && (
                                <div className='d-flex align-items-center' style={{ color: 'green' }}>
                                    <FaCheckCircle className='me-2' size={17} />
                                    <span className='fs-6'>{(detection) ? detection.faces.length : ''} face(s) were detected.</span>
                                </div>

                            )}

                            {(verifiedFaces.length > 0 && !isScanning) && (
                                <div className='d-flex align-items-center' style={{ color: 'green' }}>
                                    <FaCheckCircle className='me-2' size={17} />
                                    <span className='fs-6'>
                                        {verifiedFaces.filter((face) => face.identity).length} face(s) were recognized.
                                    </span>
                                </div>
                            )}

                        </div>
                        <div className="ms-3" style={{ width: '40%' }}>
                            <div className='fs-4 fw-bold'>Attendance</div>
                            {datetime && (
                                <div className='fs-6 mb-3 opacity-75'>{datetime}</div>
                            )}
                            {(verifiedFaces.length > 0) && (
                                renderRecognized()
                            )}
                            {(!(verifiedFaces.length > 0) && !isScanning) && (
                                <div className='w-100'>
                                    <span className='fs-6 opacity-50'>
                                        Click 'Scan' button to recognize faces.
                                    </span>
                                </div>
                            )}
                            {isScanning && (
                                <>
                                    <RecognizedLoadingItem />
                                    <RecognizedLoadingItem />
                                    <RecognizedLoadingItem />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default IndexPage;
