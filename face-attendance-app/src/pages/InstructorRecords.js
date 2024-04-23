import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import face_api, { faceApiBaseUrl, serverIp } from '../api/face_api';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';

import AddFaceModal from '../components/modals/AddFaceModal';

import { FaTableList } from "react-icons/fa6";

const InstructorRecords = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [showAddModal, setShowAddModal] = useState(false);
    const [reload, setReload] = useState(false);
    const [faces, setFaces] = useState(null);

    useEffect(() => {
        getFaces();
    }, [reload]);

    const getFaces = async () => {
        await face_api.post('/face-images').then((res) => {
            const faceImages = res.data.faceImages;

            setFaces(faceImages);
        })
    }

    const renderFaces = () => {
        return faces.map((face, index) => {
            return (
                <div
                    key={index}
                    style={{ maxWidth: '130px', overflow: 'hidden' }}
                >
                    <div
                        className='threel-item-cover my-auto mb-1'
                        style={{ width: '100%', borderRadius: '10px' }}
                    >
                        <img
                            src={faceApiBaseUrl + "/recognized-face/" + face}
                            alt={`database image`}
                        />
                    </div>
                    <div
                        className='fs-6 fw-bold mb-1 text-truncate'
                        style={{ maxWidth: '100%', cursor: 'pointer' }}
                        title={face}
                    >{face}</div>
                    <div className='small'>Student</div>
                </div>
            )
        });
    };


    return (
        <>
            <AddFaceModal
                onHide={() => setShowAddModal(false)}
                show={showAddModal}
                onAddSuccess={() => { setReload(!reload) }}
            />
            {!faces && (
                <div
                    className='d-flex align-items-center justify-content-center flex-column'
                    style={{ height: '100%', width: '100%' }}
                >
                    <Spinner
                        animation="border"
                        variant="dark"
                    />
                </div>
            )}
            {faces && (
                <div className='attendance-container custom-scrollbar'>
                    <div className='d-flex align-items-center justify-content-between mb-3'>
                        <div>
                            <FaTableList className='me-2' size={24} />
                            <span className='fs-5 fw-bold'>Face Database</span>
                        </div>

                        <Button
                            onClick={() => { setShowAddModal(true) }}
                            style={{
                                backgroundColor: 'var(--primary-color)',
                                fontSize: '18px',
                            }}
                        >
                            Add Face
                        </Button>
                    </div>
                    <span className='fs-2'>Class 1</span>
                    <div className='faces-database'>
                        {renderFaces()}
                    </div>
                    <br />
                </div>
            )}
        </>
    )
}

export default InstructorRecords;