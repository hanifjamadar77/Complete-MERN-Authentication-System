import {User} from "../model/user.model.js";
import bcryptjs from "bcryptjs";
import { generateJWTTokenandSetCookie } from "../utils/generateJWTTokenandSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/email.js";

export const signUp = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        if(!name || !email || !password){
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            res.status(400).json({success:false, message:"User already exists"});
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
        throw error;
    }
}

export const logIn = async (req, res) => {
    res.send("LogIn Up Route");
}

export const logOut = async (req, res) => {
    res.send("LogOut Up Route");
}