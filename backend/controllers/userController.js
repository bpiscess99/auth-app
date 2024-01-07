const User = require("../models/userModel");
const asyncHandler = require("express-async-handler")
var parser = require("ua-parser-js") // this js library provide us the user agent information like which browser engine client is using like chrome, os etc
const {generateToken, hashToken} = require("../utils/index");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const Cryptr = require("cryptr");
const jwt = require("jsonwebtoken");
const crypto = require("crypto")

const cryptr = new Cryptr(process.env.CRYPTR_KEY);

const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body

    // Validation 
    if(!name || !email || !password){
        res.status(400);
        throw new Error('Please provide all fields');
    }

    if(password.length < 6){
        res.status(400);
        throw new Error('Password should be at least 6 characters long')
    }

    // Check if user exists
    const userExist = await User.findOne({email})
    if(userExist){
        res.status(400);
        throw new Error('Email already in use');
    }

    // Get user agent
    const ua = parser(req.headers["user-agent"]);
    const userAgent = [ua.ua]; 

    // create new user
    const user = await User.create({
        name,
        email,
        password, 
        userAgent
    });

    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
      });

    if(user){
        const {_id, name, email, phone, bio, photo, role, isVerified} = user;
        res.status(200).json({
            _id,
            name,
            email,
            phone,
            bio,
            photo,
            role,
            isVerified
        })
    }else{
        res.status(400)
        throw new Error("Invalid user data")
    }
});

// Login user 

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    // validation
    if(!email || !password){
        res.status(400)
        throw new Error("Please add email and password")
    }

    const user = await User.findOne({email});

    // Validation
    if(!user){
        res.status(400)
        throw new Error("There is no user, Please Signup")
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password)
    
    // validation
    if(!passwordIsCorrect){
      res.status(400)
      throw new Error("Invalid email or password")
    }
     
    // Trgger 2FA for unknown userAgent
    const ua = parser(req.headers['user-agent']);
    const thisUserAgent = ua.ua;
    console.log(thisUserAgent);
    const allowedAgent = user.userAgent.includes(thisUserAgent);

    if(!allowedAgent){
        // Generate 6 digit code 
        const loginCode = Math.floor(100000 + Math.random() * 900000)
        console.log(loginCode);

        // Encrypt login Code before saving to DB
        const encryptLoginCode = cryptr.encrypt(loginCode.toString());

        // Delete Token if it exists in DB 
        let userToken = await Token.findOne({userId: user._id});
        if(userToken){          
            await userToken.deleteOne();
        }

        // save Token to DB
        await new Token({
            userId: user._id,
            lToken: encryptLoginCode,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 1000), // 60 mins
        }).save()
    }
    // Generate token
    const token = generateToken(user._id);

    if(user && passwordIsCorrect){
        // Send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
    });
    
    const {_id, name, email, phone, bio, photo, role, isVerified} = user
    res.status(200).json({
        _id,
        name,
        email,
        phone,
        bio,
        photo,
        role,
        isVerified
    });
    }else{
        res.status(400)
        throw new Error("something went wrong, Please try again later")
    }
});


// Send login code 
const sendLoginCode = asyncHandler(async(req, res) => {
    const {email} = req.params;
    const user = await User.findOne({email});

    if(!user){
        res.status(400);
        throw new Error("User not found");
    }

    // Find login code in DB
    const userToken = await Token.findOne({
        userId: user._id,
        expiresAt: {$gt: Date.now()},
    });

    if(!userToken){
        res.status(400)
        throw new Error("Invalid or Expired token, please login again");
    }

    const loginCode = userToken.lToken
    const dcryptedLoginCode = cryptr.decrypt(loginCode);
});
module.exports = {
    registerUser,
    loginUser,
    sendLoginCode
}