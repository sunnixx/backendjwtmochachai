const express = require('express');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const download = require('image-downloader');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const jsonPatch = require('fast-json-patch');

require('dotenv').config();

const app = express();

//Middleware
app.use(morgan('dev'));


//Routes
app.get('/api/login', (req, res) => {

    //Send the LOGIN API any username and password as query string
    //e.g. localhost:3000/api/login?username=john&&password=1234
    //This returns a JWT string that can be used to accessed protected routes

    const username = req.query.username;
    const password = req.query.password;

    if (username !== undefined && password !== undefined) {
        //Authorize the user

        const token = jwt.sign({ user: username, password: password }, process.env.TOKEN_KEY);

        res.json({
            msg: 'protected link now accessible: http://localhost:3000/api/protected',
            token: token
        })

        process.env.TOKEN = token;

    } else {
        res.sendStatus(403);
    }
});

app.get('/api/protected/jsonpatch', ensureToken, (req, res) => {

    //The protected API can only be accessed with a JWT string. 
    //Access the public API once and then you can access the protected API

    jwt.verify(req.token, process.env.TOKEN_KEY, (err, data) => {

        //Authorize token generated from public API
        if (err) {
            res.sendStatus(403);
        }

        if (req.query.jsonObj !== undefined && req.query.jsonPatch !== undefined) {

            let document = JSON.parse(req.query.jsonObj);

            let keys = Object.keys(JSON.parse(req.query.jsonPatch));
            let values = Object.values(JSON.parse(req.query.jsonPatch));

            let patch = [];

            for (let i = 0; i < keys.length; i++) {
                patch.push({
                    op: 'add',
                    path: '/' + keys[i],
                    value: values[i]
                });
            }

            res.json({
                document: jsonPatch.applyPatch(document, patch)
            })

        } else {
            res.json({
                msg: `insert JSON object and JSON patch Object in query string e.g. jsonObj={firstname:'John'}&&jsonPatch={lastname:'doe'}
                `
            });
        }
    });
});

app.get('/api/protected/imagereq', ensureToken, (req, res) => {
    jwt.verify(req.token, process.env.TOKEN_KEY, (err, data) => {
        //Authorize token generated from public API

        if (err) {
            res.sendStatus(403);
        }
        if (req.query.imgurl !== undefined) {
            downloadImage(req.query.imgurl);

            res.sendFile(process.env.IMAGE);
        } else {
            res.json({
                err: 'insert image url in query, e.g. ?imgrul=[insert uri]'
            })
        }
    });
});

function ensureToken(req, res, next) {
    req.token = process.env.TOKEN;
    next();
}

async function downloadImage(url) {

    /*
        - The function downlaods images from url query string e.g. imgurl=[enter url string]
        - It takes the image and downloads it.
        - Shrinks the image to 50x50 dimensions. 
        - Creates a copy of it.
        - Removes the original file
    */
    const options = {
        url: url,
        dest: __dirname + '/uploads/img'
    }

    download.image(options)
        .then(({ filename, image }) => {

            let imgPath = __dirname + '/uploads/img/' + path.basename(filename);
            let imgPath50 = __dirname + '/uploads/img/50x50' + path.basename(filename);

            sharp(imgPath)
                .resize(50, 50)
                .toFile(imgPath50, (err, info) => {
                    if (err) throw err;

                    fs.unlink(filename, (err) => {
                        if (err) throw err;
                        process.env.IMAGE = imgPath50;
                    });
                });
        })
        .catch((err) => { throw err });
}

app.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;

    console.log(`Server connected to http://localhost:3000`);
})

module.exports = app;