const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.signUp = async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashpassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            username,
            password: hashpassword
        });

        req.session.user = newUser;

        res.status(201).json({
            status: 'success',
            data: {
                user: newUser
            }
        });
    } catch (e) {
        res.status(401).json({
            status: 'failed - ' + e
        });
    }
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({username});
        if (!user) {
            res.status(404).json({
                status: 'failed',
                message: 'User not found'
            });
        }

        const isAuthenticated = await bcrypt.compare(password, user.password);

        if (isAuthenticated) {
            // Add this into session, and we can retrieve it in redis-cli if user logs in using GET "sess:<COOKIE_VALUE>(eg. hrYS2N2n3n762i3g4d67ft3)"
            req.session.user = user;
            res.status(201).json({
                status: 'logged in successfully'
            });
        } else {
            res.status(401).json({
                status: 'credentials failed'
            });
        }

    } catch (e) {
        res.status(401).json({
            status: 'failed - ' + e
        });
    }
}


