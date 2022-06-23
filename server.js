import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import {
    GridFsStorage
} from "multer-gridfs-storage";
import Grid from "gridfs-stream";
import bodyParser from "body-parser";
import path, {
    resolve
} from "path";
import Pusher from "pusher";
import {
    rejects
} from "assert";


import mongoPosts from './postModel';


Grid.mongo = mongoose.mongo

//app congig

const app = express();
const port = process.env.PORT || 9000;

//middlewares

app.use(bodyParser.json());

app.use(cors());

//db config

const mongoUri = "mongodb+srv://fb-user:samikshya@cluster0.uszl862.mongodb.net/fb-user?retryWrites=true&w=majority"

const conn = mongoose.createConnection(mongoUri, {
    // useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let gfs;
conn.once('open', () => {
    console.log("DB CONNECTED");

    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('images')
})

const storage = new GridFsStorage({
    url: mongoUri,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = `image-${Date.now()}${path.extname(file.oroginalname)}`
            const fileInfo = {
                filename: filename,
                bucketName: 'images'
            }
            resolve(fileInfo)
        })
    }
});

const upload = multer({
    storage
});

mongoose.connect(mongoUri, {
        // useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log("your error ", err));


//api routes 
app.get('/', (req, res) => {
    res.status(200).send("hello world")
});

app.post('/upload/image', upload.single('file'), (req, res) => {
    res.status(201).send(req.file);
});

app.post('/upload/post', (req, res) => {
    const body = req.body;

    console.log("file=", body);

    mongoPosts.create(dbPost, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data);
        }
    })
})

app.get('/retrieve/posts', (req, res) => {
    mongoPosts.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            data.sort((b, a) => {
                return a.timestamp - b.timestamp;
            });
            res.status(200).send(data);
        }
    })
});

app.get(('/retrieve/images/single'), (req, res) => {
    gfs.files.findOne({
        filename: req.query.name
    }, (err, file) => {
        if (err) {
            res.status(500).json(err)
        } else {
            if (!file || file.length == 0) {
                res.status(404).json({
                    err: "file not found"
                });
            } else {
                const readStream = gfs.createReadStream(file.filename)

                readStream.pipe(res)
            }
        }
    })
})

//listen 


app.listen(port, () => console.log(`listening o localhost:${port}`))