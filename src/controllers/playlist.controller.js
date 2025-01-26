import mongoose ,{isValidObjectId} from "mongoose";
import { Playlist } from "../model/playlist.model.js"
import { ApiError  } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.utils.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!(name && description)) {
        throw new ApiError(400, "Name or Description Not Found")
    }
    const owner = isValidObjectId(req.user._id) ? req.user._id : null
    if (!owner) {
        throw new ApiError(400, "Please Login First")
    }

    const playlist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner,
        video: []
    })
    //#########################
    // if(Object.keys(playlist).length===0){
    //     throw new ApiError(400,"Problem Occured during creation of playlist ")
    // }
   

    /* 
    Unnecessary Empty Object Check:
    After Playlist.create(), it doesn't make sense to check Object.keys(playlist).length === 0,
    because Mongoose will throw an error if creation fails. You don't need this check.
    */
    


    res.status(200).json(
        new ApiResponse(200, playlist, "Playlist Created SuccessFully")
    )


    //TODO: create playlist
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if( !( videoId && isValidObjectId(videoId) ) ){
        throw new ApiError(400,"Invalid Video id")

    }
    const owner = isValidObjectId(req.user._id) ? req.user._id : null
    if (!owner) {
        throw new ApiError(400, "Please Login First")
    }
    if(!playlistId){
        const { name, description } = { name: "newPlaylist", description: "not added" };
        const playlist=await Playlist.create({
            name,
            description,
            owner,
            video:[videoId]
            
        })
        return res.status(200).json(
            new ApiResponse(200,playlist,"New playList created and Video added")
        )
    

    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                video:videoId
            }
        },
        {
            new:true
        }
        
    )

    res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"Video Added Successfully")
    )
    

})

const renamePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name } = req.body;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id");
    }

    // Validate name
    if (!name) {
        throw new ApiError(400, "Name is required");
    }

    // Update playlist name
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist renamed successfully")
    );
});

const changePlaylistDescription = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { description } = req.body;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id");
    }

    // Validate description
    if (!description) {
        throw new ApiError(400, "Description is required");
    }

    // Update playlist description
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { description },
        { new: true }
    );

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist description updated successfully")
    );
});








const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
})









const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
})

// const addVideoToPlaylist = asyncHandler(async (req, res) => {
//     const {playlistId, videoId} = req.params
// })














const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})













const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
    renamePlaylist,
    changePlaylistDescription
}