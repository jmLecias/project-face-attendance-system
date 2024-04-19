import React, { useState, useEffect } from 'react';
import face_api, { faceApiBaseUrl } from '../api/face_api';
import { ToastContainer, toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

import ListenerHeader from '../components/headers/ListenerHeader';
import ListenerSidebar from '../components/sidebars/ListenerSidebar';

import RecognizedItem from '../components/items/RecognizedItem';
import RecognizedLoadingItem from '../components/items/RecognizedLoadingItem';
import UnknownItem from '../components/items/UnknownItem';

import { RiLiveFill } from "react-icons/ri";
import { FaCheckCircle } from "react-icons/fa";

const IndexPage = () => {

    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState(null);
    const [detection, setDetection] = useState(null);
    const [verifiedFaces, setVerifiedFaces] = useState([]);

    const [recognized, setRecognized] = useState([]);

    const renderRecognized = () => {
        return verifiedFaces.map((face) => {
            if (face.identity !== null) {
                return (
                    <RecognizedItem
                        identityPath={face.identity}
                        detected={face.detected}
                    />
                )
            } else {
                return (
                    <UnknownItem
                        detected={face.detected}
                    />
                )
            }
        });
    }

    const handleCapture = async () => {
        setIsScanning(true);
        setDetection(null);
        setVerifiedFaces([]);

        await face_api.post('/capture')
            .then(async (capturedPath) => {
                const data = { capturedPath: capturedPath.data.capturedPath }

                setScanStatus("detecting");
                const response = await face_api.post('/detect-faces', data);
                const newDetection = response.data //{faces, datetime}

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
            })
            .then(async (detection) => {
                setScanStatus("recognizing");
                const response = await face_api.post('/recognize-faces', JSON.stringify(detection), {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const results = response.data.results

                if (!(results.length > 0)) {
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
                        <div className='w-50'>
                            <div className="video-feed mb-3">
                                <img id="feed" src={faceApiBaseUrl + "/video-feed"} alt="Live Video Feed" />
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
                        <div className="w-50 ms-3">
                            <div className='fs-4 fw-bold'>Attendance</div>
                            {detection && (
                                <div className='fs-6 mb-3 opacity-75'>{detection.datetime}</div>
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
                                // <div className='w-100 p-5 d-flex align-items-center justify-content-center'>
                                //     <Spinner
                                //         animation="border"
                                //         variant="dark"
                                //     />
                                // </div>
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
