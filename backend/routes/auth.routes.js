import { Router } from "express";
import {signUp, logIn, logOut, verifyEmail, forgetPassword, resetPassword} from "../controllers/auth.controller.js";

const router = Router();

router.post('/signup', signUp)

router.post('/login',logIn)

router.post('/logout', logOut);

router.post('/verify-email', verifyEmail);

router.post('/forget-password', forgetPassword);

router.post('/reset-password/:token', resetPassword);

export default router;