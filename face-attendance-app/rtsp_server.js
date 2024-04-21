const express = require("express");
const Stream = require("node-rtsp-stream");
const cors = require("cors");

const app = express();
const port = 3002;
const serverIp = '192.168.254.101'
let stream = null;

app.use(cors({
    origin: "*",
    credentials: true,
}));

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
                '-b': '4000K'
            }
        });
        currentRtspStreamUrl = newRtspStreamUrl;
    }

    return res.status(200).json({ url: `ws://${serverIp}:9999` });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});