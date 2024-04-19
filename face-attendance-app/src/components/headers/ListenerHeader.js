import React from 'react';

import { useNavigate } from 'react-router-dom';

const ListenerHeader = () => {

    const navigate = useNavigate();

    return (
        <header className='listener-header'>
            <span className='logo-text'>ReSight</span>
        </header>
    );
}

export default ListenerHeader;
