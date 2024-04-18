import React, { useState, useEffect } from 'react';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarFooter, SidebarHeader, SidebarContent } from 'react-pro-sidebar';
import { Link } from 'react-router-dom';


import { useNavigate } from 'react-router-dom';

import { MdOutlineExplore } from "react-icons/md";
import { FaVideo } from "react-icons/fa6";
import { IoMusicalNotes } from "react-icons/io5";
import { SiApplepodcasts } from "react-icons/si";
import { FaThList } from "react-icons/fa";

const ListenerSidebar = () => {
    const navigate = useNavigate();

    return (
        <ProSidebar className='listener-sidebar' hidden={false}>
            <SidebarContent>
                <SidebarHeader>
                    <Menu>
                        <MenuItem icon={<MdOutlineExplore size={25} />}>
                            <Link to="/"><span className='explore-text'>HOME</span></Link>
                        </MenuItem>
                    </Menu>
                </SidebarHeader>
                <Menu >
                    <MenuItem icon={<FaVideo size={20} />}><Link to="/">Live Attendance</Link></MenuItem>
                    <MenuItem icon={<FaThList size={20} />}><Link to="/">Records</Link></MenuItem>
                </Menu>
            </SidebarContent>
        </ProSidebar>
    );
}

export default ListenerSidebar;
