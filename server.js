const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const prompt = require('prompt');
const imageInfo = require('imageinfo')
const fs = require('fs');
const cors = require('cors');
const urljoin = require('url-join');
const shuffle = require('shuffle-array');

/*********************************/

const app = express();
let corsVar = cors();

//By default, the cors library will allow requests
// from any origin. This can open you up to security problems and abuse.
// Set up a whitelist and check against it:
var whitelist = [];
if (whitelist.length > 0) {
    console.log("CORS WITH a whitelist");
    var corsOptions = {
        origin: function (origin, callback) {
            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'))
            }
        }
    }
// Then pass them to cors:
    console.log("CORS with a whitelist");
    let cors = cors(corsOptions);
}

app.use(express.static(path.join(__dirname, 'build')), corsVar, express.static('public'));


/*
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "localhost:3000"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
 */

const properties = [
    {
        name: 'directory'
    }
];

prompt.start();
let isDefault = true;
let nonDefaultDir = "";
const PORT = 8080;
const baseUrl = `http://localhost:${PORT}`;
const baseUrlDefault = baseUrl + "\default_images";
const baseUrlNonDefault = `http://localhost:${PORT}/nondefault`;
const grandImageArray = [];
console.log("******* baseUrl: " + baseUrl);
prompt.get(properties, (err, result) => {
    if (err) {
        return onErr(err);
    }
    console.log('Command-line input received:');
    console.log(' directory: ' + result.directory);
    let directoryToUse = result.directory;
    if (!directoryToUse || directoryToUse.length < 1) {
        directoryToUse = path.join(__dirname, 'public', 'default_images');
        isDefault = true;
    } else {
        isDefault = false;
        nonDefaultDir = directoryToUse;
    }

    console.log(' directoryToUse: ' + directoryToUse);

    fs.readdir(directoryToUse, function (err, items) {
        console.log("************************************");
        console.log(JSON.stringify(items));
        console.log("************************************");

        console.log("*** Loading the Images START ....");
        let progressCount = 0;
        items.forEach(item => {
                if(items.length > 500 )
                {
                    if(progressCount !== 0 && progressCount % 100 == 0)
                    {
                        console.log(`(${progressCount} / ${items.length}`);
                    }
                }
                progressCount++;
                //console.log("*-----------------------------*");
                //console.log("   ITEM(S): "+JSON.stringify(items));
                //console.log('   THIS ITEM: ' + JSON.stringify(item));
                const pathToImageFile = path.join(directoryToUse, item);
                /*
                    {
                      src: "https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_b.jpg",
                      thumbnail: "https://c4.staticflickr.com/9/8887/28897124891_98c4fdd82b_n.jpg",
                      thumbnailWidth: 320,
                      thumbnailHeight: 212
                    }
                 */
                fs.readFile(pathToImageFile, (err, data) => {
                    if (err) throw err;
                    const info = imageInfo(data);
                    //console.log(' READ_FILE ITEM: ' + JSON.stringify(item));
                    var src = urljoin(isDefault ? baseUrl : baseUrlNonDefault, item);
                    console.log(" -> src: " + src);
                    const imag                                                                                                                                                                                                                                                                                                                                                          eObj =
                        {
                            src,
                            thumbnail: src,
                            thumbnailWidth: info.width,
                            thumbnailHeight: info.height
                        };
                    grandImageArray.push(imageObj);
                    //console.log(JSON.stringify(imageObj));
                    //console.log("Data is type:", info.mimeType);
                    //console.log("  Size:", data.length, "bytes");
                    //console.log("  Dimensions:", info.width, "x", info.height);
                });
            }
    );
        console.log("*** Loading the Images COMPLETED ....");
    });


    app.get('/nondefault/:fileName', (req, res) => {
        //const reqUrl = req.path;
        //const reqUrl2 = req.originalUrl;
        //console.log("* reqUrl: " + reqUrl);
        //console.log("- reqUrl2: " + reqUrl2);
        //console.log("- fileName: " + req.params.fileName);
        const pathToFile = path.join(nonDefaultDir, req.params.fileName);
        //console.log("- pathToFile: " + pathToFile);
        return res.sendFile(
            pathToFile);
    });

    app.get('/ping', function (req, res) {
        return res.send('pong');
    });

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, 'public', 'default_page.html'));
    });


    app.get('/images', function (req, res) {
        const arrayToSendBack = [];
        for (let i = 0; i < 250; i++) {
            let oneToChoose = Math.floor(Math.random() * Math.floor(grandImageArray.length));
            console.log("oneToChoose: " + oneToChoose);
            while (arrayToSendBack.length > 1
            && (arrayToSendBack.includes(oneToChoose) && grandImageArray.length > 250 ) ) {
                console.log("FOUND DUPLICATE SO GETTING ANOTHER");
                oneToChoose = Math.floor(Math.random() * Math.floor(grandImageArray.length));
            }
            console.log("oneToChoose (FINAL): " + oneToChoose);
            arrayToSendBack.push(grandImageArray[oneToChoose])
        }
        res.json(arrayToSendBack);
    });

    app.listen(process.env.PORT || PORT);

});

function onErr(err) {
    console.log("There Was An Error With Directory Input")
    console.log(err);
    return 1;
}
