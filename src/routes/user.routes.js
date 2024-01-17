import { Router } from "express";
import registerUsere from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUsere)
router.route("/login").post(registerUsere)

export default router;