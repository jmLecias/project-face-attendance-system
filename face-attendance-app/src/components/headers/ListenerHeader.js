import React from 'react';

import { useNavigate } from 'react-router-dom';

const ListenerHeader = () => {

    const navigate = useNavigate();

    return (
        <header className='listener-header'>
            <span className='logo-text'>@ FACE_Attendance</span>
        </header>
    );
}

export default ListenerHeader;
