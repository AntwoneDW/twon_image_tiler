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
if(whitelist.length > 0)
{
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

app.use(express.static(path.join(__dirname, 'build')), corsVar, express.static('public') );




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
const PORT = 8080;
const baseUrl = `http://localhost:${PORT}`;
const grandImageArray = [];
console.log("******* baseUrl: " + baseUrl );
prompt.get(properties,  (err, result) => {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log(' directory: ' + result.directory);
    let directoryToUse = result.directory;
    if( !directoryToUse || directoryToUse.length < 1)
    {
        directoryToUse = path.join(__dirname, 'public', 'default_images');
    }
    console.log(' directoryToUse: ' + directoryToUse );

    fs.readdir(directoryToUse, function(err, items) {
        console.log("************************************");
        console.log(JSON.stringify(items));
        console.log("************************************");

        items.forEach( item => {
            console.log("*-----------------------------*");
            console.log("   ITEM(S): "+JSON.stringify(items));
            console.log('   THIS ITEM: ' + JSON.stringify(item));
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
                console.log(' READ_FILE ITEM: ' + JSON.stringify(item));
                var src = urljoin(baseUrl, 'default_images', item );
                console.log("src: " + src);
                const imageObj =
                    {
                        src,
                        thumbnail: src,
                        thumbnailWidth: info.width,
                        thumbnailHeight: info.height
                    };
                grandImageArray.push(imageObj);
                console.log(JSON.stringify(imageObj));
                //console.log("Data is type:", info.mimeType);
                //console.log("  Size:", data.length, "bytes");
                //console.log("  Dimensions:", info.width, "x", info.height);
            });
        }
        shuffle(grandImageArray);
        );
    });



    app.get('/ping', function (req, res) {
        return res.send('pong');
    });

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, 'public', 'default_page.html'));
    });


    app.get('/images', function (req, res) {
        res.json(grandImageArray);
    });

    app.listen(process.env.PORT || PORT );

});

function onErr(err) {
    console.log("There Was An Error With Directory Input")
    console.log(err);
    return 1;
}
