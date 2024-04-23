import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import face_api, { faceApiBaseUrl, serverIp } from "../../api/face_api";

import ImageDropzone from "../dropzones/ImageDropzone";

const AddFaceModal = ({ show, onHide, onAddSuccess }) => {

    const [isUploading, setIsUploading] = useState(false);
    const [faceDetails, setFaceDetails] = useState({
        name: '',
        faceImage: null,
    });

    useEffect(() => {
        console.log(faceDetails);
    }, [faceDetails]);

    const processFileName = (name) => {
        var nameWithoutExtension = name.toLowerCase();
        if (name.includes('.')) {
            nameWithoutExtension = name.split('.').slice(0, -1).join(".");
        }
        const processedName = nameWithoutExtension.replace(/ /g, '_');

        return processedName;
    }

    const handleSubmit = async () => {
        setIsUploading(true);

        if (!faceDetails.faceImage) {
            toast.error("No face image selected", {
                autoClose: 2500,
                closeOnClick: true,
                hideProgressBar: true,
                position: 'bottom-center'
            });
            setTimeout(() => {
                setIsUploading(false);
            }, 3000);

            return;
        }

        const formData = new FormData();
        formData.append('face', faceDetails.faceImage);

        const filename = faceDetails.faceImage.name
        const name = faceDetails.name
        formData.append('name', processFileName(name) + "." + filename.split('.')[filename.split('.').length - 1]);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        };

        console.log(processFileName(name) + "." + filename.split('.')[filename.split('.').length - 1])

        await face_api.post('/face/add', formData, config).then((res) => {
            if (res.status === 200) {
                toast.success("Face added succesfully", {
                    autoClose: 2500,
                    closeOnClick: true,
                    hideProgressBar: true,
                    position: 'bottom-right'
                });
                onAddSuccess()
            } else {
                toast.error("Error while adding face", {
                    autoClose: 2500,
                    closeOnClick: true,
                    hideProgressBar: true,
                    position: 'bottom-right'
                });
            }
            handleClose();
        })
    }

    const handleClose = () => {
        onHide();
        setIsUploading(false);
        setFaceDetails({
            name: '',
            faceImage: null,
        })
    }

    return (
        <Modal
            data-bs-theme="dark"
            show={show}
            onHide={onHide}
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    <span className="text-white">Add face to Database</span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="p-3">
                    <div className="" >
                        <input
                            className="text-white text-truncate"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ maxWidth: '100%' }}
                            onChange={(event) => {
                                if (event.target.files.length > 0) {
                                    setFaceDetails(() => ({
                                        faceImage: event.target.files[0],
                                        name: event.target.files[0].name,
                                    }))
                                }
                            }}
                        />

                        <br />
                        <br />
                        <input
                            className='form-control mb-2'
                            type="text"
                            placeholder="Name (Choose face image first)"
                            value={faceDetails.name}
                            disabled={!faceDetails.faceImage}
                            onChange={(event) => {
                                setFaceDetails((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                }))
                            }}
                        />
                        <br />
                    </div>

                    <div className="d-flex align-items-center justify-content-end">
                        <Button
                            variant="secondary"
                            onClick={() => { handleClose() }}
                            className="me-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => { handleSubmit() }}
                            disabled={isUploading}
                            tyle={{
                                backgroundColor: 'var(--primary-color)',
                            }}
                        >
                            Add face
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default AddFaceModal;