import { Router } from "express";
import { getAllCommunities,updateCommunity,deleteCommunity, createCommunity, joinCommunity,getCommunityByID } from "../controllers/community.controllers.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const communityRouter = Router();

communityRouter.post("/",verifyJWT, createCommunity);
communityRouter.get("/", verifyJWT,getAllCommunities);
communityRouter.get("/:communityId", verifyJWT, getCommunityByID);
communityRouter.put("/:communityId", verifyJWT, updateCommunity);
communityRouter.delete("/:communityId", verifyJWT, deleteCommunity);
communityRouter.post("/join/:communityId", verifyJWT, joinCommunity);


export default communityRouter;

