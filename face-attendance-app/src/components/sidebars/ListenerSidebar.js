import React, { useState, useEffect } from 'react';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarFooter, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';


import { useNavigate } from 'react-router-dom';

import { FaVideo } from "react-icons/fa6";
import { FaClipboardList } from "react-icons/fa";
import { TiThMenu } from "react-icons/ti";
import { AiFillSchedule } from "react-icons/ai";

const ListenerSidebar = () => {
    const navigate = useNavigate();

    const [collapse, setCollapse] = useState(true);

    return (
        <ProSidebar className='listener-sidebar' collapsed={collapse}>
            <SidebarContent>
                <SidebarHeader>
                    <Menu>
                        <MenuItem onClick={() => { setCollapse(!collapse) }} icon={<TiThMenu size={28} />}>
                            <Link to="/"><span className='explore-text'>INSTRUCTOR</span></Link>
                        </MenuItem>
                    </Menu>
                </SidebarHeader>
                <Menu >
                    <MenuItem icon={<FaVideo size={22} />}><Link to="/">Live Attendance</Link></MenuItem>
                    <MenuItem icon={<AiFillSchedule size={25} />}><Link to="/">Schedules</Link></MenuItem>
                    <MenuItem icon={<FaClipboardList size={25} />}><Link to="/">Records</Link></MenuItem>
                </Menu>
            </SidebarContent>
        </ProSidebar>
    );
}

export default ListenerSidebar;
