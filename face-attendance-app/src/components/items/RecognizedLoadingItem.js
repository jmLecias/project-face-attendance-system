import React from 'react';
import Placeholder from 'react-bootstrap/Placeholder';

import { FaArrowRight } from "react-icons/fa";

const RecognizedLoadingItem = () => {
    return (
        <div className='loading-recognition-item animate-wave mb-2'>
            <div className='d-flex align-items-center' style={{ width: 'fit-content' }}>
                <div
                    className='loading-cover my-auto'
                    style={{ width: '60px', borderRadius: '5px' }}
                >
                </div>
                <FaArrowRight className='ms-2 me-2 opacity-50' size={24} />
                <div
                    className='loading-cover my-auto'
                    style={{ width: '60px', borderRadius: '5px' }}
                >
                </div>
            </div>
            <div className='ms-3 w-100 d-flex flex-column'>
                <Placeholder className='w-25 mb-1' />
                <Placeholder className='w-75 mb-1' />
                <Placeholder className='w-50' />
            </div>
        </div>
    )
}

export default RecognizedLoadingItem;