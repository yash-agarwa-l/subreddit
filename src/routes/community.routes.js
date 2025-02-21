import { Router } from "express";
import { getAllCommunities,updateCommunity,deleteCommunity, createCommunity } from "../controllers/community.controllers";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const communityRouter = Router();

communityRouter.post("/", createCommunity);
communityRouter.get("/", getAllCommunities);
communityRouter.put("/:communityId", verifyJWT, updateCommunity);
communityRouter.delete("/:communityId", verifyJWT, deleteCommunity);

export default communityRouter;

