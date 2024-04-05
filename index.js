const express = require('express');
const session = require('express-session');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const jwtStrategy = require("passport-jwt").Strategy;
const jwtExtract = require("passport-jwt").ExtractJwt;
const app = express();
const port = 8008;
app.use(
    session({
        name: "jwtcrud",
        secret: "jwtcrud",
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 100,
        },
    })
);


const posts = [];
const users = [];

app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());


passport.use("userLogin", new jwtStrategy({
    jwtFromRequest: jwtExtract.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'jwtdata'
}, (record, done) => {

    const user = users.find(user => user.id === record.id);
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));


app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered', status: 0 });
    }


    const newUser = {
        id: String(users.length + 1),
        username,
        email,
        password
    };


    users.push(newUser);
    res.status(200).json({ message: 'User registered successfully', newUser: newUser, status: 1 });
});

app.post('/login', (req, res, next) => {
    passport.authenticate('userLogin', { session: false }, (err, user, info) => {
        if (err) {
            return res.status(400).json({ error: 'Internal server error', status: 0 });
        }

        const token = jwt.sign({ id: user.id }, 'jwtdata', { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token: token, status: 1 });
    })(req, res, next);
});


app.post('/add_posts', (req, res) => {

    const { title, content, author } = req.body;

    if (!title || !content) {
        res.status(400).json({ error: 'Title and content are required', status: 0 });
    } else {
        const newPost = {
            id: String(posts.length + 1),
            title,
            content,
            author
        };
        posts.push(newPost);
        res.status(200).json({ mes: "record insert sucessfully", newPost: newPost, status: 1 });
    }
});


app.get('/view_posts', (req, res) => {
    res.json(posts);
});


app.get('/single_posts/:id', (req, res) => {
    const id = req.params.id;
    const post = posts.find(post => post.id === id);

    if (!post) {
        res.status(400).json({ error: 'Post not found', status: 0 });
    } else {
        res.json(post);
    }
});

app.put('/update_posts/:id', (req, res) => {
    const id = req.params.id;
    const { title, content, author } = req.body;
    const postIndex = posts.findIndex(post => post.id === id);

    if (postIndex === -1) {
        res.status(400).json({ error: 'Post not found', status: 0 });
    } else {
        posts[postIndex] = { id, title, content, author };
        res.status(200).json({ message: "Record updated successfully", updatedPost: posts[postIndex], status: 1 });
    }
});


app.delete('/delete_posts/:id', (req, res) => {
    const id = req.params.id;
    const postIndex = posts.findIndex(post => post.id === id);

    if (postIndex === -1) {
        res.status(400).json({ error: 'Post not found', status: 0 });
    } else {
        const deletedPost = posts.splice(postIndex, 1)[0];
        res.status(200).json({ message: "Record deleted successfully", deletedPost: deletedPost, status: 1 });
    }
});




app.listen(port, (err) => {
    err ? console.log("Listen error:", err) : console.log(`Server listening on ${port}`);
});



