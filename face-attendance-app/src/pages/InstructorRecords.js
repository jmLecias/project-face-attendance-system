import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Spinner from 'react-bootstrap/Spinner';
import { threelApiBaseUrl } from '../../backend/api';

import SongListDatatable from '../../components/DataTables/SongListDatatable';
import FindSongDatatable from '../../components/DataTables/FindSongDatatable';

import ThreelBreadcrumbs from '../../components/Navigation/ThreelBreadcrumbs';
import PlaylistAddModal from '../../components/Modals/PlaylistAddModal';

import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

import { usePlaylist } from '../../hooks/usePlaylist';
import { useItem } from '../../hooks/useItem';
import { useAuth } from '../../hooks/useAuth';

const ListenerPlaylist = () => {
    const { user } = useAuth();

    const { id } = useParams();

    const location = useLocation();
    const navigate = useNavigate();

    const [isHeaderHovered, setIsHeaderHovered] = useState(false);
    const [showEditPlaylist, setShowEditPlaylist] = useState(false);

    const [reload, setReload] = useState(false);
    const [playlist, setPlaylist] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);

    const {
        getPlaylist,
        getSidebarPlaylists,
        getPlaylists,
        deletePlaylist,
        addSong,
        removeSong,
    } = usePlaylist();

    const {
        items,
    } = useItem();

    useEffect(() => {
        setPlaylist(null);
        getPlaylist(id).then((playlist) => {
            console.log(playlist);
            setPlaylist(playlist);
            setPlaylistSongs(mapData(playlist.uploads));
        }).catch((e) => {
            console.log("Error while getting playlist: " + e);
        });
    }, [id, reload]);

    const mapData = (data) => {
        return data.map((upload, index) => ({
            ...upload,
            id: upload.id + "_" + Date.now(),
            index: index,
            cover: threelApiBaseUrl + "/" + ((upload.album) ? upload.album.cover : upload.thumbnail),
            artist: upload.user.username,
            albumName: ((upload.album) ? upload.album.name : upload.title)
        }));
    };

    const breadcrumbs = [
        { label: 'Explore', link: '/' },
        { label: (playlist) ? playlist.name : '', link: '' }
    ]

    const handlePlaylistDelete = () => {
        if (window.confirm(`Are you sure you want to delete '${playlist.name}' playlist?`)) {
            deletePlaylist(playlist).then((success) => {
                if (success) {
                    getSidebarPlaylists(); //refresh user playlist list
                    getPlaylists(); //refresh playlist list
                    navigate('/');
                    toast("Playlist deleted successfully", {
                        autoClose: 2000,
                        closeOnClick: true,
                        hideProgressBar: true,
                        position: 'bottom-right',
                    });
                }
            }).catch((e) => {
                console.log(e);
                toast.error("Error while deleting playlist.", {
                    autoClose: 2000,
                    closeOnClick: true,
                    position: 'bottom-right',
                });
            })
        }
    }

    const handleAddClick = (song) => {
        addSong(song.id.split("_")[0], playlist.id).then((success) => {
            if (success) {
                getSidebarPlaylists(); //refresh user playlist list
                getPlaylists(); //refresh playlist list
                setReload(!reload);
                toast("Added to playlist!", {
                    autoClose: 2000,
                    closeOnClick: true,
                    hideProgressBar: true,
                    position: 'bottom-right',
                });
            }
        }).catch((e) => {
            console.log(e);
            toast.error("Error while adding to playlist.", {
                autoClose: 2000,
                closeOnClick: true,
                position: 'bottom-right',
            });
        });
    }

    const handleDeleteClick = (song) => {
        if (window.confirm(`Are you sure you want to remove '${song.title}' from playlist?`)) {
            removeSong(song.id.split("_")[0], playlist.id).then((success) => {
                if (success) {
                    getSidebarPlaylists(); //refresh user playlist list
                    getPlaylists(); //refresh playlist list
                    setReload(!reload);
                    toast("Removed from playlist.", {
                        autoClose: 2000,
                        closeOnClick: true,
                        hideProgressBar: true,
                        position: 'bottom-right',
                    });
                }
            }).catch((e) => {
                console.log(e);
                toast.error("Error while removing from playlist.", {
                    autoClose: 2000,
                    closeOnClick: true,
                    position: 'bottom-right',
                });
            });
        }
    }

    return (
        <>
            <PlaylistAddModal
                playlist={playlist}
                onHide={() => setShowEditPlaylist(false)}
                show={showEditPlaylist}
                title="Edit Playlist"
                onActionEnded={() => {setReload(!reload)}}
            />
            {!playlist && (
                <div
                    className='d-flex align-items-center justify-content-center flex-column'
                    style={{ height: '100%', width: '100%' }}
                >
                    <Spinner
                        animation="border"
                        variant="light"
                    />
                </div>
            )}
            {playlist && (
                <div style={{ height: '100%', width: '100%' }}>
                    <div className='listener-album-grid threel-scrollbar'>
                        <div className='listener-dashboard-head'>
                            <ThreelBreadcrumbs breadcrumbs={breadcrumbs} />
                            <div
                                className='threel-album-header'
                                onMouseEnter={() => setIsHeaderHovered(true)}
                                onMouseLeave={() => setIsHeaderHovered(false)}
                            >
                                {(isHeaderHovered && (user.id === playlist.user.id)) && (
                                    <div className='playlist-actions-container'>
                                        <MdEdit
                                            className="header-icons"
                                            size={40}
                                            title='Edit Playlist'
                                            onClick={() => setShowEditPlaylist(true)}
                                        />
                                        <MdDelete
                                            className="header-icons"
                                            size={40}
                                            title='Delete Playlist'
                                            onClick={() => handlePlaylistDelete()}
                                        />
                                    </div>
                                )}
                                <div className='threel-item-cover box-shadow' style={{ width: '150px' }}>
                                    {(playlist.cover) && (
                                        <img
                                            src={threelApiBaseUrl + "/" + playlist.cover}
                                            alt={`${playlist.name} cover`}
                                        />
                                    )}
                                    {(!playlist.cover) && (
                                        <img
                                            src={'/uploads/Gemini_Generated_Image.jfif'}
                                            alt={`${playlist.name} cover`}
                                        />
                                    )}
                                </div>
                                <div className='ms-3'>
                                    <span className='small  opacity-50'>{(playlist.visibility === 2) ? "Public" : "Private"} Playlist</span><br />
                                    <span className='album-title'>{playlist.name}</span><br />
                                    {playlist.description && (
                                        <div className='mb-1'>
                                            <span className='fs-6 fst-italic opacity-50'>{playlist.description}</span>
                                            <br />
                                        </div>
                                    )}
                                    <span>{playlist.user.username}</span><br />
                                </div>
                            </div>
                        </div>
                        <div className='listener-album-content threel-scrollbar'>
                            <SongListDatatable
                                data={playlistSongs}
                                showDelete={user.id === playlist.user.id}
                                onDeleteClick={(song) => handleDeleteClick(song)}
                            />
                            <br />
                            <FindSongDatatable
                                data={
                                    mapData(items).filter(
                                        song => !playlistSongs.map(playlistSong => playlistSong.id.split("_")[0])
                                                    .includes(song.id.split("_")[0])
                                    )
                                }
                                onAddClick={(song) => { handleAddClick(song) }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ListenerPlaylist;