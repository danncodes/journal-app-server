const express = require("express")
const { Users, Entries } = require("./db")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
require('dotenv').config()

const app = express()
app.use(express.json())
const router = express.Router()
// router.get('/users/:id/entries...) etc.
app.use("/api", router)

app.listen( 4000, () => {
    console.log("listening at port", 4000)
})

function createToken(userId){
    return jwt.sign({ userId }, process.env.JWT_SECRET, {expiresIn: "1hr"})
   }

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
          if (err) {
              return res.sendStatus(403);
          }
          req.userId = token.userId;
          next();
      });
  } else {
      res.sendStatus(401);
  }
}


router.post("/users", async (req,res) => {

  const userExists = await Users.findOne({ where: {username: req.body.username}})
    if (userExists) return res.sendStatus(401)

  const newUser = await Users.create({
      username: req.body.username, 
      password: await bcrypt.hash(req.body.password,10),
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      phone: req.body.phone
  })

  return res.sendStatus(201)
})

router.post("/signIn", async (req,res) => {
    const thisUser = await Users.findOne({
       where: {
         username: req.body.username
       }
     });
     if(!thisUser){
       return res.sendStatus(404)
     }

   const loginResult = await bcrypt.compare(req.body.password, thisUser.password)
   
   if(loginResult){
     const token = createToken(thisUser.uid)
     res.json({token})
   }
    else {
    return res.sendStatus(404)
    }
})

router.post("/users/:userID/entries", verifyToken, async(req,res) => {
    if(req.params.userID != req.userId){
      return res.sendStatus(403)
    } 

    const Entry = await Entries.create({
        title: req.body.title, 
        entry: req.body.entry,
        tags: req.body.tags,
        public: req.body.public,
        emotion: req.body.emotion,
        photo: req.body.photo,
        UserUid: req.params.userID
    })

    res.sendStatus(201)
})

router.get("/users/:userID/entries", verifyToken, async(req,res) => {
  if(req.params.userID != req.userId){
    return res.sendStatus(403)
  } 

  const allUserPosts = await Entries.findAll({
    where: {
      UserUid: req.params.userID
    }
  });

  allUserPosts.length === 0 ? res.sendStatus(404) : res.json(allUserPosts)
})

router.get("/users/entries", async(req,res) => {
  const publicPosts = await Entries.findAll({
    where: {
      public: 1
    }
  });

  publicPosts.length === 0 ? res.sendStatus(404) : res.json(publicPosts)
})


router.get("/users/:userID/entries/:entryID", verifyToken,  async(req,res) => {
  if(req.params.userID != req.userId){
    return res.sendStatus(403)
  } 

  const Post = await Entries.findOne({
    where: {
      entryID: req.params.entryID
    }
  });


  Post ? res.json(Post) : res.sendStatus(404)
})

router.patch("/users/:userID/entries/:entryID", verifyToken,  async(req,res) => {
  if(req.params.userID != req.userId){
    return res.sendStatus(403)
  } 
  const Post = await Entries.findOne({
    where: {
      entryID: req.params.entryID
    }
  });

  Post.title = req.body.title
  Post.entry = req.body.entry
  Post.tags = req.body.tags
  Post.public = req.body.public
  Post.emotion = req.body.emotion
  Post.photo = req.body.photo
  await Post.save();

  res.sendStatus(202)
})

router.delete("/users/:userID/entries", verifyToken, async(req,res) => {
  if(req.params.userID != req.userId){
    return res.sendStatus(403)
  } 

  const Posts = await Entries.findAll({
    where: {
      UserUid: req.params.userID
    }
  });
  Posts.forEach(Post => {Post.destroy()})
  res.sendStatus(200)
})

router.delete("/users/:userID/entries/:entryID", verifyToken, async(req,res) => {
  if(req.params.userID != req.userId){
    return res.sendStatus(403)
  } 

  const Post = await Entries.findOne({
    where: {
      entryID: req.params.entryID
    }
  });
  await Post.destroy();
  res.sendStatus(200)
})

router.delete("/users/:userID", verifyToken, async(req,res) => {
  if(req.params.userID != req.userId){
    return res.sendStatus(403)
  } 
  
  const Posts = await Entries.findAll({
    where: {
      UserUid: req.params.userID
    }
  });
  Posts.forEach(Post => {Post.destroy()})

  const User = await Users.findOne({
    where: {
      uid: req.params.userID
    }
  });

  await User.destroy();
  res.sendStatus(200)
})
