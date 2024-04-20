const express = require("express");
const Stream = require("node-rtsp-stream");
const cors = require("cors");

const app = express();
const port = 3002;
let stream = null;

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.get('/discover-devices', async (req, res) => {
    try {
        const devices = await discoverDevices();
        res.json(devices);
    } catch (error) {
        res.status(500).send('Error discovering devices' + error);
    }
});

app.get("/stream", (req, res) => {
    const newRtspStreamUrl = req.query.rtsp;
    let currentRtspStreamUrl = "";

    if (!stream || currentRtspStreamUrl !== newRtspStreamUrl) {
        if (stream || newRtspStreamUrl === "stop") {
            stream.stop();
        }
        stream = new Stream({
            name: "Camera Stream",
            streamUrl: newRtspStreamUrl,
            wsPort: 9999,
            ffmpegOptions: {
                '-vf': 'scale=1920:1080',
                '-q:v': 22,
                '-b': '2000K'
            }
        });
        currentRtspStreamUrl = newRtspStreamUrl;
    }

    res.send(200).json({ url: `ws://127.0.0.1:9999` });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
