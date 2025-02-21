import { Router } from "express";
import { putObject} from "../controllers/picures.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router();

router.route("/").post(putObject);

export default router;