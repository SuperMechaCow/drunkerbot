const express = require('express');
const app = express();
const session = require('express-session')


app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: 'changethissecretlater',
    cookie: {
        maxAge: 3600000,
        sameSite: true,
        secure: false
    }
}))

const PORT = 3000;

const users = [{
    id: 1,
    name: 'Bob',
    email: 'bob@gmail.com',
    password: 'secret'
}]

// start the server in the port 3000 !
app.listen(PORT, function() {
    console.log('Listening on port ' + PORT + '.');
});

app.get('/', (req, res) => {
    console.log(req.session);
    const {userID} = req.session;
    res.send('Hello, ' + userID)
})
