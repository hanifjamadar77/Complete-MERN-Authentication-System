import { Router } from "express";
import {signUp, logIn, logOut, verifyEmail, forgetPassword, resetPassword, checkAuth} from "../controllers/auth.controller.js";
import {verifyToken} from '../middleware/verifyToken.js'

const router = Router();

router.get("/check-auth", verifyToken, checkAuth);
router.post('/signup', signUp)

router.post('/login',logIn)

router.post('/logout', logOut);

router.post('/verify-email', verifyEmail);

router.post('/forgot-password', forgetPassword);

router.post('/reset-password/:token', resetPassword);

export default router;