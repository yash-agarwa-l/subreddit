import { Community } from "../models/community.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";


export const createCommunity = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Community name is required");
    }
    const existingCommunity = await Community.findOne({ name });
    if (existingCommunity) {
        throw new ApiError(400, "Community name already taken");
    }

    const community = await Community.create({
        name,
        description,
        createdBy: req.user._id
    });

    return res.status(201).json(new ApiResponse(201, "Community created", { community }));
});

export const getAllCommunities = asyncHandler(async (req, res) => {
    const communities = await Community.find();
    
    return res.status(200).json(new ApiResponse(200, "Communities fetched", { communities }));
});

export const updateCommunity = asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    const { name, description } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (!community.createdBy.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized to update this community");
    }

    if (name) community.name = name;
    if (description) community.description = description;

    await community.save();

    return res.status(200).json(new ApiResponse(200, "Community updated", { community }));
});

export const deleteCommunity = asyncHandler(async (req, res) => {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    if (!community.createdBy.equals(req.user._id)) {
        throw new ApiError(403, "Unauthorized to delete this community");
    }

    await community.deleteOne();

    return res.status(200).json(new ApiResponse(200, "Community deleted"));
});

export const getCommunityByID = asyncHandler(async (req, res) => {
    const { communityId } = req.params;
    if(!communityId){
        throw new ApiError(400, "Community ID is required");
    }
    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, "Community not found");
        }
    return res.status(200).json(new ApiResponse(200, "successful", { community }));
})




export const joinCommunity = asyncHandler(async (req, res) => {
    const { communityId } = req.params;

    if (!req.user) {
        throw new ApiError(401, "Unauthorized - Please log in");
    }

    const userId = req.user._id;

    const community = await Community.findById(communityId);
    if (!community) {
        throw new ApiError(404, "Community not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.communities && user.communities.includes(communityId)) {
        throw new ApiError(400, "User is already a member of this community");
    }

    user.communities.push(communityId);
    await user.save();

    return res.status(200).json(new ApiResponse(200, "Successfully joined community", { user }));
});
