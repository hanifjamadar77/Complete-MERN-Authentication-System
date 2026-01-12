import {User} from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { generateJWTTokenandSetCookie } from "../utils/generateJWTTokenandSetCookie.js";
import { sendVerificationEmail,sendWelcomeEmail } from "../mailtrap/email.js";

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
    res.send("LogIn Up Route");
}

export const logOut = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({success : true, message : "Logged out successfully"});
}