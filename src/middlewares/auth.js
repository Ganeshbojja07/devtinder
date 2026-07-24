const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken');
const User=require('../models/user')

const userAuth=async(req, res, next)=>{
    const {token}=req.cookies
    if(!token){
        return res.status(401).send("Unauthorized");
    }
    try {
        const decoded=jwt.verify(token,'Ganesh&02')
        const user= await User.findById(decoded._id)
        if(!user){
            return res.status(401).send("Unauthorized");
        }
        req.user=user;
        next();
    } catch (err) {
        return res.status(401).send("Invalid token");
    }

}

module.exports=userAuth