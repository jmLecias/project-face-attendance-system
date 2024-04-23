import React from 'react';

import { useNavigate } from 'react-router-dom';

import { TiThMenu } from "react-icons/ti";


const InstructorHeader = ({ onMenuClick }) => {

    const navigate = useNavigate();

    return (
        <header className='listener-header d-flex align-items-center justify-content-between'>
            <div className='d-flex align-items-center'>
                <div className='logo-div'>
                    <img
                        src={"/images/resight2.png"}
                        alt={`resight logo`}
                    />
                </div>
                <span className='logo-text'>ReSight</span>
            </div>

            <TiThMenu size={28} className="d-lg-none" onClick={() => { onMenuClick() }} />
        </header>
    );
}

export default InstructorHeader;
