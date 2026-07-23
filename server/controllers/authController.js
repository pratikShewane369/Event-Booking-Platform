const User = require("../models/user");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const {sendOTPEmail} = require("../utils/email");

const generateToken = (id, role) => {
    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn : '7d'});
}
// Register User
exports.registerUser = async(req, res) => {
    const {name, email, password} = req.body;
    let userExists = await User.findOne({email});
    if(userExists) {
        return res.status(400).json({
            error : "User already Exists"
        })
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        const user = await User.create({name, email, password : hashedPassword, role : 'user', isVerified : false});

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`otp for ${email} : ${otp}`);
        await OTP.create({email, otp, action : 'account_verification'});
        await sendOTPEmail(email, otp, 'account_verification');

        res.status(201).json({ 
            message : "User Registration Successfully, Please Check your email for OTP to verify your account", 
            email : user.email
        });

    } catch(err) {
        res.status(400).json({
            error : err.message
        });
    }
}

exports.loginUser = async(req, res) => {
    const {email, password} = req.body;
    let user = await User.findOne({email});
    if(!user) {
        return res.status(400).json({error : 'Invalid Credentials Please Signup First'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        return res.status(400).json({error : 'Invalid Password'});
    }

    if(!user.isVerified && user.role === 'user') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.deleteMany({email, action : 'account_verification'}); // Remove old OTPs
        await OTP.create({email, otp, action: 'account_verification'});
        await sendOTPEmail(email, otp, 'account_verification');

        return res.status(400).json({
            error : 'Account not verified. A new otp has been send to you email.'
        })
    }

    res.status(200).json({
        message : 'Login Successful',
        _id : user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        token : generateToken(user._id, user.role)
    })
}

exports.verifyOtp = async(req, res) => {
    const {email, otp} = req.body;
    const otpRecord = await OTP.findOne({email, otp, action : 'account_verification'});

    if(!otpRecord) {
        return res.status(400).json({
            error : 'Invalid or Expired OTP'
        })
    }

    const user = await User.findOneAndUpdate({email}, {isVerified: true});
    await OTP.deleteMany({email, action : 'account_verification'}); // Remove Used OTP
    res.json({
        message : 'Account Verified Successfully, You Can Login',
        _id : user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        token : generateToken(user._id, user.role)
    })
};