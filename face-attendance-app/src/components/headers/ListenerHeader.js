import React from 'react';

import { useNavigate } from 'react-router-dom';

const ListenerHeader = () => {

    const navigate = useNavigate();

    return (
        <header className='listener-header'>
            <div className='logo-div'>
                <img
                    src={"/images/resight2.png"}
                    alt={`resight logo`}
                />
            </div>
            <span className='logo-text'>ReSight</span>
        </header>
    );
}

export default ListenerHeader;
