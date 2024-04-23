import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import face_api, { faceApiBaseUrl, serverIp } from "../../api/face_api";


import { MdOutlineImageSearch } from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";

import Dropzone from 'react-dropzone'

const ImageDropzone = ({ onImageDrop, initialImage }) => {

    const [isNotNull, setIsNotNull] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [coverPreview, setcoverPreview] = useState(
        <>
            <MdOutlineImageSearch size={100} />
            <span className="small w-75 text-center">Click to select a cover photo or drop one here.</span>
        </>
    );

    useEffect(() => {
        if (initialImage) {
            setcoverPreview(
                <img src={faceApiBaseUrl + "/recognized-face/" + initialImage} alt="Cover Preview" title={`${initialImage}}`} />
            );
            setIsNotNull(true);
        }
    }, []);

    const handleImageDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 1) {
            toast.error(`Too many files. Please select only one cover photo.`, {
                autoClose: 3000,
                position: 'top-center'
            });
            return;
        }

        if (!acceptedFiles[0].type.startsWith('image/')) {
            toast.error(`Invalid file. Please select an image file as a cover photo.`, {
                autoClose: 3000,
                position: 'top-center'
            });
            return;
        }

        onImageDrop(acceptedFiles[0]);
        setcoverPreview(
            <img src={URL.createObjectURL(acceptedFiles[0])} alt="Cover Preview" title={`${acceptedFiles[0].path}`} />
        );
        setIsNotNull(true);
    };

    return (
        <Dropzone
            onDrop={acceptedFiles => handleImageDrop(acceptedFiles)}
        >
            {({ getRootProps, getInputProps, isDragActive }) => (
                <div
                    {...getRootProps({})}
                    className={`upload-cover-dropzone ${(isDragActive) ? "active" : ""}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <input {...getInputProps()} />
                    {(isDragActive && isNotNull) && (
                        <div
                            className="drag-active"
                        >
                            <RiImageAddFill size={100} />
                            <span className="fs-6 fw-bold">Change cover photo</span>
                        </div>
                    )}

                    {(isHovered && isNotNull) && (
                        <div
                            className="hover-active"
                        >
                            <FaRegEdit size={100} />
                            <span className="fs-6 fw-bold">Choose another cover photo</span>
                        </div>
                    )}

                    {coverPreview}
                </div>
            )}
        </Dropzone>

    );
}

export default ImageDropzone;