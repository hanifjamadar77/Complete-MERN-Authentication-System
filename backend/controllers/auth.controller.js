import {User} from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

import { generateJWTTokenandSetCookie } from "../utils/generateJWTTokenandSetCookie.js";
import { sendVerificationEmail,sendWelcomeEmail, sendPasswordResetEmail, setResetSuccessEmail } from "../mailtrap/email.js";

export const signUp = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        if(!name || !email || !password){
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success:false, message:"User already exists"});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationCode,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hour
        })

        await user.save();

        generateJWTTokenandSetCookie(res, user._id);

       await sendVerificationEmail(user.email, verificationCode);

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
        })
    } catch (error) {
        res.status(500).json({success:false, message:error.message});
    }
}

export const verifyEmail = async (req, res) =>{
    const {code} = req.body;

    try {
        const user = await User.findOne({verificationToken: code, verificationTokenExpires: {$gt: Date.now()}});

        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired verification code"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        await sendWelcomeEmail(user.email, user.name);
        
        res.status(200).json({
            success:true,
            message:`Welcome email sent to ${user.email}`,
            user:{
                ...user._doc,
                password:undefined,
            }
        })
    } catch (error) {
        res.status(500).json({success:false, message:error.message});
    }
}

export const logIn = async (req, res) => {
    const{email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user){
           return res.status(404).json({success: false , message:"Invalid Crendentials"})
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if(!isPasswordValid){
           return res.status(400).json({success: false, message : "Invalid Crendentials"});
        }

        generateJWTTokenandSetCookie(res, user._id);

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success : true,
            message : "Login successfully",
            user :{
                ...user._doc,
                password: undefined,
            }
        })
    } catch (error) {
        throw res.status(400).json({success: false, message : error.message})
    }
}

export const logOut = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success : true, message : "Logged out successfully"});
}

export const forgetPassword = async (req, res) => {
    const{email} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({success:false, message:"User not found"});
        }

        // genetate the reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordTokenExpires = resetTokenExpires;

        await user.save();

        // reset Password
        const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
        await sendPasswordResetEmail(user.email, `${CLIENT_URL}/reset-password/${resetToken}`)

        res.status(200).json({success:true, message:`Password reset email sent to ${user.email}`});
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({success:false, message:error.message});
    }
}

export const resetPassword = async(req, res) =>{
    try {
        const {token} = req.params; 
        const {password} = req.body;

        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordTokenExpires : {$gt : Date.now()}
        });
        
        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired password reset token"});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpires = undefined;

        await user.save();

        await setResetSuccessEmail(user.email);

        console.log("Password reset successfully");
        res.status(200).json({success:true, message:"Password reset successfully"});
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false, message:error.message});
    }
}

export const checkAuth = async(req, res) =>{
    try {
        const user = await User.findById(req.userId).select("-password");
        if(!user){
            return res.status(400).json({success : false, message: "User not found"});

        }

        res.status(200).json({success: true, user})
    } catch (error) {
        res.status(400).json({success : false, message: error.message})
    }
}