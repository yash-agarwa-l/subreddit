import { Community } from "../models/community.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const createCommunity = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        throw new ApiError(400, "Community name is required");
    }

    // Check if the community name already exists
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
