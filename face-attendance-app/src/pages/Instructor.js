import React, { useState, useEffect, useRef } from 'react';
import face_api, { faceApiBaseUrl, serverIp } from '../api/face_api';
import { toDisplayText, toFilename } from '../services/DateFormatService';
import { ToastContainer, toast } from 'react-toastify';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarFooter, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import { Link, useNavigate } from 'react-router-dom';

import Offcanvas from 'react-bootstrap/Offcanvas';

import InstructorHeader from '../components/headers/InstructorHeader';
import InstructorSidebar from '../components/sidebars/InstructorSidebar';
import InstructorAttendance from './InstructorAttendance';
import InstructorRecords from './InstructorRecords';

import { FaVideo } from "react-icons/fa6";
import { FaClipboardList } from "react-icons/fa";

const Instructor = ({ content }) => {

    const navigate = useNavigate();

    const [showOffCanvas, setShowOffCanvas] = useState(false);

    const OffCanvasLink = ({ path, icon, text }) => {
        return (
            <div
                className='d-flex align-items-center  text-white mb-3 ps-3'
                onClick={() => {
                    navigate(path);
                    setShowOffCanvas(false);
                }}>
                {icon}

                <span className='fs-5 ms-3'>{text}</span>
            </div>
        )
    }

    return (
        <div className="listener-main-container" >
            <ToastContainer />
            <InstructorHeader onMenuClick={() => { setShowOffCanvas(!showOffCanvas) }} />
            <InstructorSidebar />
            {showOffCanvas && (
                <Offcanvas data-bs-theme="dark" show={showOffCanvas} onHide={() => { setShowOffCanvas(false) }} responsive="lg">
                    <Offcanvas.Header closeButton>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <OffCanvasLink
                            path={'/'}
                            text={'Live Attendance'}
                            icon={<FaVideo size={22} />}
                        />
                        <OffCanvasLink
                            path={'/records'}
                            text={'Records'}
                            icon={<FaClipboardList size={25} />}
                        />
                    </Offcanvas.Body>
                </Offcanvas>
            )}

            <div className='listener-main custom-scrollbar'>
                {content === "attendance" && (<InstructorAttendance />)}
                {content === "records" && (<InstructorRecords />)}
            </div>

        </div>
    );
}

export default Instructor;
