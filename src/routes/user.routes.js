import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";

const userRouter = Router();

router.route("/register").post(registerUser);


export default userRouter