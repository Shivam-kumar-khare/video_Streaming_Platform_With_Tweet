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
            videos:[videoId]
            
        })

        return res.status(200).json(
            new ApiResponse(200,playlist,"New playList created and Video added")
        )
    

    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400,"Invalid Playlist Id")
    }

    const updatedPlaylist=await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner
        },
        {
            $addToSet:{
                videos:videoId
            }
        },
        {
            new:true
        }
        
    )
    if(!updatedPlaylist){
        throw new ApiError(400,"you are not authenticted to update the playlist")
    }

    res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"Video Added Successfully")
    )
    

})



const getMyPlaylists = asyncHandler(async (req, res) => {
    // Fetch playlists created by the authenticated user
    const playlists = await Playlist.find(
        {
            owner: new mongoose.Types.ObjectId(req.user._id)
        },
        {
            createdAt:0,
            updatedAt:0,
            owner:0,
            __v:0
        }
    )

    if(playlists.length === 0){
        return res.status(200).json(
            new ApiResponse(200,[],"no playlist found")
        )
    }

    res.status(200).json(
        new ApiResponse(200,playlists,"Success")
    )


    //TODO: get user playlists
})



const getUserPlaylists = asyncHandler(async (req, res) => {
    // This function searches for playlists owned by another user (req.params.userId).
    const {userId} = req.params

    if( !userId || !mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    const playlists =await Playlist.find(
        {
            owner: new mongoose.Types.ObjectId(userId)
        },
        {
            createdAt:0,
            updatedAt:0,
            __v:0
        }
    )

    if(playlists.length === 0){
        return res.status(200).json(
            new ApiResponse(200,[],"no playlist found")
        )
    }

    res.status(200).json(
        new ApiResponse(200,playlists,"Success")
    )


    //TODO: get user playlists
})



const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    const {playlistId} = req.params

    if(!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400,"Invalid PlayList Id")
    }

    const playList=await Playlist.findById(new mongoose.Types.ObjectId(playlistId))

    if(!playList){
        throw new ApiError(400,"No playlist found for given Id")
    }

    res.status(200).json(
        new ApiResponse(
            200,
            playList,
            "Plalist fetched successfully"
        )
    )
   
})



const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    
    const {playlistId, videoId} = req.params;
    // TODO: remove video from playlist

    if(!isValidObjectId(playlistId)  ||  !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid videoId or PlaylistId")
    }

    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }
        },
        {
            new:true
        }

    )


    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Video Removed"

        )
    )

})



const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return res.status(404).json(new ApiResponse(404, {}, "Playlist does not exist"));
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this playlist");
    }

    await playlist.deleteOne();

    res.status(200).json(
       new ApiResponse(200,"","Playlist deleted successfully")
    ); // 204 No Content for deletion
});




const updatePlaylist = asyncHandler(async (req, res) => {
    
    const { playlistId } = req.params;
    const { name,description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist Id");
    }

    if(!(name||description)){
        throw new ApiError(400,"Atlest One Feild Name or description is required")
    }

    const updateData = {};
    if (name) { updateData.name = name }
    if (description) { updateData.description = description }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        updateData,
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
    );

    
})


export {
    createPlaylist,
    addVideoToPlaylist,
    getMyPlaylists,
    getUserPlaylists,
    getPlaylistById,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,

};