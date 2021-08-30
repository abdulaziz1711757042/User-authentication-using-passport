const express = require('express');
 const router = express.Router(); 
 const bcrypt = require('bcryptjs');
 const passport = require('passport');

 //user module
  const User = require('../models/User')
//Login page
 router.get('/login',(req, res)=>res.render('login'));
 //Register page
 router.get('/register',(req, res)=>res.render('register'));

 //register handle
router.post('/register',(req, res)=>{
    const { name, email, password, password2 } = req.body;
    let errors= []; 

    // check require fields
    if(!name || !email || !password || !password2) {
        errors.push({ message :"Please fill the required fields"})

    }
    //check password matches
    if(!password || !password2) {
        errors.push({ message :"passwords does not match"}); 
    }
    //check password length
    if(password.length < 6){
        errors.push({ message :"password should be at least 6 character"});

    }

    if(errors.length >0){
        res.render('register',{
            errors,
            name,
            email,
            password,
            password2
        });

    }else{
       //validation passed
       User.findOne({ email: email})
       .then(user => {
           if(user){
               //user exists
               errors.push({ message : 'Email is already register'})
               res.render('register',{
                errors,
                name,
                email,
                password,
                password2
            });
           }else{
               const newUser = new User({ 
                   name, email,password
               });
               //hash password
               bcrypt.genSalt(10, (errors, salt) => bcrypt.hash(newUser.password, salt, (errors, hash)=>{
                   if(errors) throw errors;
                   //set password to hash
                   newUser.password = hash;

                   //save user
                   newUser.save()
                   .then(user => {
                       req.flash('success_msg', "You are now registered and can log in");
                       res.redirect('/users/login')
                   })
                   .catch(err => {
                       console.log(err);
                   })
               }))
           }
       });

    }

});
//login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local',{
        successRedirect:'/dashboard',
        failureRedirect:'/users/login',
        failureFlash: true
    })(req, res, next);
});

//logout handle

router.get('/logout',(req, res)=>{
    req.logout();
    req.flash('success_msg','You are logged out');
    res.redirect('/users/login');

})
 module.exports = router;