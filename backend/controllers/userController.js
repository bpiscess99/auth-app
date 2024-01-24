const User = require("../models/userModel");
const asyncHandler = require("express-async-handler")
var parser = require("ua-parser-js") // this js library provide us the user agent information like which browser engine client is using like chrome, os etc
const {generateToken, hashToken} = require("../utils/index");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const Cryptr = require("cryptr"); // this is use to encryption and decryption the string
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // generate cryptographic keys, hashing data and encrypting/decrypting data
const sendEmail = require("../utils/sendEmail")
const {OAuth2Client} = require("google-auth-library")

const cryptr = new Cryptr(process.env.CRYPTR_KEY);
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = asyncHandler(async(req, res) => {
    const {name, email, password} = req.body
//    console.log('Received Data', {name, email, password})
//    console.log('Received Headers', req.headers);

    // Validation 
    if(!name || !email || !password){
        // console.log("validation failed, Please provide all emails")
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
            isVerified,
            token
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
        res.status(400);
        throw new Error("New browser of device detected")
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
        isVerified,
        token
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

    // Generate 6 digit code 
    const loginCode = Math.floor(100000 + Math.random() * 900000)
    console.log("loginCode", loginCode);

    // Encrypt login Code before saving to DB
    const encryptLoginCode = cryptr.encrypt(loginCode.toString());
    console.log("encryptLoginCode", encryptLoginCode);

    // Find login code in DB
    const userToken = await Token.findOne({userId: user._id});
    // delete token if already exists
    if (userToken) {
        await userToken.deleteOne();
    }

    // Save Token in DB
    const newToken = await new Token({
        userId: user._id,
        lToken: encryptLoginCode,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * (60 * 1000),
    }).save();
    console.log("userId", user._id);
    // console.log("lToken", encryptLoginCode);

    if(!userToken){
        res.status(400)
        throw new Error("Invalid or Expired token, please login again");
    }

    const decryptedLoginCode = cryptr.decrypt(newToken.lToken);
    console.log("decryptedLoginCode", decryptedLoginCode)

    // Send login code
    const subject = "Login Access Code - AUTH:Z";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "bumair9@gmail.com";
    const template = "loginCode";
    const name = user.name;
    const link = decryptedLoginCode;
    
    try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link
        );
        res.status(200).json({message: `Access code sent to ${email}` });
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, please try again");
    }
    
});

// Login with code 
const loginWithCode = asyncHandler(async (req, res) => {
    const {email} = req.params;
    const {loginCode} = req.body;

    const user = await User.findOne({email});

    if(!user){
        res.status(404)
        throw new Error("User not found")
    }
      

    // Find user login token
    const userToken = await Token.findOne({
        userId: user.id,
        expiresAt: {$gt: Date.now()},
    });
    // console.log("userToken", userToken)

    if(!userToken){
        res.status(404);
        throw new Error("Invalid or Expired Token, Please login again");
    }

    const decryptedLoginCode = cryptr.decrypt(userToken.lToken);
    // console.log(decryptedLoginCode)

    if(loginCode !== decryptedLoginCode){
        res.status(404);
        throw new Error("Incorrect login code, Please try again")
    }else{
        // Register User Agent
        const ua = parser(req.headers["user-agent"]);
        const thisUserAgent = ua.ua;
        user.userAgent.push(thisUserAgent);
        await user.save();

        // Generate Token
        const token = generateToken(user._id)

        // Send HTTP- only cookie
        res.cookie("token", token, {
            path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true,
        });

        const {_id, name, email, phone, bio, photo, role, isVerified} = user;

        res.status(200).json({
            _id,
            name,
            email,
            phone,
            bio,
            photo,
            role,
            isVerified,
            token
        });
    }
});

// Send Verification Email
const sendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if(!user){
        res.status(404);
        throw new Error("User not found");
    }

    if(user.isVerified){
        res.status(400);
        throw new Error("User already verified");
    }

    // Delete Token if it exists in DB
    let token = await Token.findOne({userId: user._id});
    if(token){
        await token.deleteOne();
    }

    // Create Verification Token and Save
    const verificationToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(verificationToken)

    // Hash token and save
    const hashedToken = hashToken(verificationToken) 
        await new Token({
            userId: user._id,
            vToken: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 1000), //60 mins
        }).save();

        // construct Verification URL
        const verificationUrl = `${process.env.FRONTEND_URL}/verify/${verificationToken}`

        // Send Email
        const subject = "Verify Your Account - AUTH:Z"
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = "bumair9@gmail.com";
        const template = "verifyEmail";
        const name = user.name;
        const link = verificationUrl;

        try {
            await sendEmail(
                subject,
                send_to,
                sent_from,
                reply_to,
                template,
                name,
                link
            );
            res.status(200).json({message: "Verification Email Sent"});
        } catch (error) {
            res.status(500);
            throw new Email("Email not sent, Please try again");
        }
    });


// Verify User
const verifyUser = asyncHandler(async(req, res) => {
    const {verificationToken} = req.params;

    // const hashedToken = hashToken(verificationToken);

    const userToken = await Token.findOne({
        vToken: verificationToken,
        expiresAt: {$gt: Date.now()},
    });

    if(!userToken){
        res.status(400);
        throw new Error("Invalid or Expired Token");
    }

    // Find User
    const user = await User.findOne({_id: userToken.userId})

    if(user.isVerified){
        res.status(400);
        throw new Error("User is already verified");
    }

    // Now Verify User 
    user.isVerified = true;
    await user.save();

    res.status(200).json({message: "Account Verification Successful"});

});

// Logout User
const logoutUser = asyncHandler(async(req, res) => {
    res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), 
    sameSite: "none",
    secure: true,
  });
  return res.status(200).json({ message: "Logout successful" });
});

// Get User 
const getUser = asyncHandler(async(req, res) => {
   const user = await User.findById(req.user._id);

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
    });
   }else{
    res.status(404);
    throw new Error("User not found");
   }
});

// Update User
const updateUser = asyncHandler(async(req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id)

    if(user){
        const {name, email, phone, bio, photo, role, isVerified} = user;

        user.email =  email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

    const updateUser = await user.save();

    res.status(200).json({
        _id: updateUser._id,
        name: updateUser.name,
        email: updateUser.email,
        phone: updateUser.phone,
        bio: updateUser.bio,
        photo: updateUser.photo,
        role: updateUser.role,
        isVerified: updateUser.isVerified,

    });
    }else{
        res.status(404);
        throw new Error("User not found");
    }
});

// Delete User

const deleteUser = asyncHandler(async(req, res) => {
   const user = await User.findById(req.params.id);

   if(!user){
    res.status(404);
    throw new Error("User not found")
   }
   await user.deleteOne();
   res.status(200).json({message: "User deleted Successfully"})
});

// Get Users
const getUsers = asyncHandler(async(req, res) => {
     const users = await User.find().sort("-createdAt").select("-password");
     if(!users){
       res.status(500);
       throw new Error("Something went wrong")
     }
     res.status(200).json(users)
});

// Get login status 
const loginStatus = asyncHandler(async (req, res) => {
     const token = req.cookies.token;
     if(!token){
        return res.json(false)
     }

    //  Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }else{
        return res.json(false);
    } 
});

    // Upgrade User
    const upgradeUser = asyncHandler(async(req, res) => {
        const {role, id} = req.body;

        const user = await User.findById(id);

        if(!user){
          res.status(400);
          throw new Error("User not found")
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: `User role update to ${role}`,
        });
    });

    // Send Automated Email
    const sendAutoMatedEmail = asyncHandler(async (req, res) => {
       const {subject, send_to, reply_to, template, url} = req.body;

       if(!subject || !send_to || !reply_to || !template){
        res.status(500);
        throw new Error("Missing email parameters")
       }

    //    Get user 
    const user = await User.findOne({email: send_to})

    if(!user){
        res.status(404);
        throw new Error("User not found");
    }

    const sent_from = process.env.EMAIL_USER;
    const name = user.name;
    const link = `${process.env.FRONTEND_URL}${url}`;

    try {
        await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link
        );
        res.status(200).json({message: "Email Sent"});
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, Please try again")
    }
    });

    // Forgot Password
    const forgotPassword = asyncHandler(async (req, res) => {
        const {email} = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.status(404);
            throw new Error("No user found");
        }

        // Delete token if it exists in DB
        let token = await Token.findOne({userId: user._id})
        if(token){
            await token.deleteOne()
        }

        // Create verification Token and Save
        const resetToken = crypto.randomBytes(32).toString("hex") + user._id;
        console.log(resetToken);
        
        // Hash token and save
        const hashedToken = hashToken(resetToken);
        await new Token({
            userId: user._id,
            rToken: hashedToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 60 * (60 * 1000), 
        }).save();

        // Construct Reset Url
        const resetUrl = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;

        // Send Email
        const subject = "Password Reset Request - AUTH:Z";
        const send_to = user.email;
        const sent_from = process.env.EMAIL_USER;
        const reply_to = "bumair97@gmail.com";
        const template = "forgotPassword";
        const name = user.name;
        const link = resetUrl;

        try {
         await sendEmail(
            subject,
            send_to,
            sent_from,
            reply_to,
            template,
            name,
            link
         );
         res.status(200).json({message: "Password Reset Email Sent"});     
        } catch (error) {
            res.status(500);
            throw new Error("Email not sent, please try again")
        }
    });


    // Reset Password 
    const resetPassword = asyncHandler(async(req, res) => {
        const {resetToken} = req.params;
        const {password} = req.body;
       console.log(resetToken);
       console.log(password);
        
    //    const hashedToken = hashToken(resetToken);

       const userToken = await Token.findOne({
        rToken: resetToken,
        expiresAt: {$gt: Date.now()}
       });

       if(!userToken){
        res.status(404)
        throw new Error('Invalid or Expired Token');
      }

    //   Find User
    const user = await User.findOne({_id: userToken.userId});

    // Now Reset Password
    user.password = password;
    await user.save();

    res.status(200).json({message: "Password Reset Successfully, Please Login"})

    });

    // Change Password
    const changePassword = asyncHandler(async(req, res) => {
        const {oldPassword, password} = req.body;
        const user = await User.findOne(req.user._id);

        if(!user){
            res.status(404);
            throw new Error("User not found");
        }

        if(!oldPassword || !password){
            res.status(400);
            throw new Error("Please enter old and new Password")
        }

        // Check whether old password is correct
        const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

        // Save new Password
        if(user && passwordIsCorrect){
            user.password = password;
            await user.save();
            res.status(200).json({message: "Please change successfully, Please login"});
        }
    });

    // Login with google
    const loginWithGoogle = asyncHandler(async(req, res) => {
        const {userToken} = req.body;

        const ticket = await client.verifyIdToken({
            idToken: userToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const {name, email, picture, sub} = payload;
        const password = Date.now() + sub;
        
        // Get UserAgent
        const ua = parser(req.headers["user-agent"]);
        const userAgent = [ua.ua];

        // Check if user exists
        const user = await User.findOne({email});

        if(!user){
            // Create new user
            const newUser = await User.create({
                name, 
                email,
                password,
                photo: picture,
                isVerified: true,
                userAgent
            });

            if(newUser){
                // Generate Token
                const token = generateToken(user._id);

                // Send HTTP-only token
                res.cookie("token", token, {
                    path: "/",
                    httpOnly: true,
                    expires: new Date(Date.now() + 1000 * 86400), // 1 day
                    sameSite: "none",
                    secure: true,
            });

            const {_id, name, email, phone, bio, photo, role, isVerified} = newUser;
            
            res.status(201).json({
                _id,
                name,
                email,
                phone,
                bio,
                photo,
                role,
                isVerified,
                token
            });
            }
        }

        // If User exists, Login
        if(user){
            const token = generateToken(user._id);

            // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
      });
        
      const {_id, name, email, phone, bio, photo, role, isVerified} = user;

      res.status(201).json({
        _id,
        name,
        email,
        phone,
        bio,
        photo,
        role,
        isVerified
      });
        }
    });



module.exports = {
    registerUser,
    loginUser,
    sendLoginCode,
    loginWithCode,
    sendVerificationEmail,
    verifyUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser,
    getUsers,
    loginStatus,
    upgradeUser,
    sendAutoMatedEmail,
    forgotPassword,
    resetPassword,
    changePassword,
    loginWithGoogle

}