import { Router } from "express";
import {signUp, logIn, logOut, verifyEmail} from "../controllers/auth.controller.js";

const router = Router();

router.post('/signup', signUp)

router.post('/login',logIn)

router.post('/logout', logOut);

router.post('/verify-email', verifyEmail);

export default router;