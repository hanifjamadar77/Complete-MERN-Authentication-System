import express from "express";
import dotenv from "dotenv";
import connectToDatabse from "./DB/database.js";
import cookieParser from "cookie-parser";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";

const PORT = process.env.PORT;

const app = express();

app.use(express.json()); // Allow to pasrse incoming requests:req.body
app.use(cookieParser()); // allow us to parse incoming cookies

app.use("/api/auth", authRoutes);

app.get('/', (req, res) =>{
    res.send("Hello World server is running ");
});

app.listen(PORT, () =>{
    connectToDatabse();
    console.log(`Server is running on port ${PORT}`);
})