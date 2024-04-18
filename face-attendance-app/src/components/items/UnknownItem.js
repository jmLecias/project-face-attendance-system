import React, { useState, useEffect } from 'react';
import { faceApiBaseUrl } from '../../api/face_api';

import { FaArrowRight } from "react-icons/fa";

const UnknownItem = ({ detected }) => {
    return (
        <div className='queue-item box-shadow mb-2'>
            <div className='d-flex align-items-center'>
                <div
                    className='threel-item-cover my-auto'
                    style={{ width: '60px', borderRadius: '5px' }}
                >
                    <img
                        src={faceApiBaseUrl + "/detected-face/" + detected  }
                        alt={`input image`}
                    /> 
                </div>
                <FaArrowRight className='ms-2 me-2' size={24} />
                <div
                    className='threel-item-cover my-auto'
                    style={{ width: '60px', borderRadius: '5px' }}
                >
                    <img
                        src={"/images/unknown.jpg"}
                        alt={`database image`}
                    />
                </div>
            </div>
            <div className='ms-3 d-flex flex-column justify-content-center' style={{ width: '50%' }}>
                <span
                    className='fs-6 fw-bold text-truncate'
                >Unknown Face</span>
                <span
                    className='small opacity-75 text-truncate'
                >Room 1</span>
            </div>
        </div>
    )
}

export default UnknownItem;