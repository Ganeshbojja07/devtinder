const validator=require('validator')

const validateSignup=(req)=>{
    const {firstName,email,password}=req.body;
    if(!firstName || !email || !password){
        throw new Error("Missing required fields");
    }

    if(firstName.length<2 || firstName.length>50){
        throw new Error("First name must be between 2 and 50 characters");
    }

    if(!validator.isEmail(email)){
        throw new Error("Invalid email address");
    }

    if(!validator.isStrongPassword(password)){
        throw new Error("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol");
    }

}

module.exports=validateSignup