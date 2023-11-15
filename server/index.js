const express = require('express');
const axios = require('axios');
const cors = require("cors");
const puppeteer = require('puppeteer');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');
const fs = require('fs');
const app = express();
const port = 3001;
const corsOptions = {
    origin: '*', // allow only requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
};

const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

app.use(cors(corsOptions));
app.get('/capture', async (req, res) => {
    const { url, videoLink } = req.query;
    try {
        const browser = await puppeteer.launch({
            executablePath: '/usr/bin/google-chrome',
            headless: "new",
            args: [
                '--no-sandbox',
                // '--start-fullscreen',
                '--disable-gpu',
                '--disable-setuid-sandbox',
                // "--window-size=1920,1080",
                // "--ozone-override-screen-size=1920,1080"
            ],
            // defaultViewport: {
            //     width: 1920,
            //     height: 1080
            // }
        });
        const page = await browser.newPage();
        // await page.setViewport({
        //     width: 1920,
        //     height: 1080,
        //     deviceScaleFactor: 1,
        // });

        const recorder = new PuppeteerScreenRecorder(page);
        await page.goto(url);
        await recorder.start('./video/simple.mp4'); // Use an absolute path to save the video

        await page.evaluate(() => {
            const interval = setInterval(() => {
                if (window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 100) {
                    clearInterval(interval); // Clear the interval if the condition is met
                } else {
                    window.scrollTo({ top: window.scrollY + window.innerHeight, behavior: 'smooth' });
                }
            }, 2000);
        })

        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds

        await recorder.stop();
        await browser.close();

        const videoData = fs.readFileSync('./video/simple.mp4');

        // Set the appropriate headers for the video response
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader('Content-Length', videoData.length);

        // ffmpeg.setFfmpegPath(ffmpegPath);
        ffmpeg.setFfmpegPath('/usr/bin/ffmpeg')
        const outputPath = './combineVideo/output.mp4'; // Replace with the desired output filename
        const corner_radius = 100;
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input('./video/simple.mp4')
                .input(videoLink)
                .complexFilter([
                    {
                        filter: 'format',
                        options: 'yuva444p',
                        inputs: '[1]',
                        outputs: 'circular_mask',
                    },
                    {
                        filter: 'scale',
                        options: 'w=200:h=200',
                        inputs: '[circular_mask]',
                        outputs: 'scaled',
                    },
                    {
                        filter: 'geq',
                        options: `lum='p(X,Y)':a='if(gt(abs(W/2-X),W/2-${corner_radius})*gt(abs(H/2-Y),H/2-${corner_radius}),if(lte(hypot(${corner_radius}-(W/2-abs(W/2-X)),${corner_radius}-(H/2-abs(H/2-Y))),${corner_radius}),255,0),255)'`,
                        //   options: "lum='p(X,Y)':a='st(1,pow(min(W/2,H/2),2))+st(3,pow(X-(W/2),2)+pow(Y-(H/2),2));if(lte(ld(3),ld(1)),255,0)'",
                        inputs: 'scaled',
                        outputs: '[v_mask]',
                    },
                    {
                        filter: 'overlay',
                        options: { x: 10, y: 250 },
                        inputs: ['0:v', 'v_mask'],
                        outputs: 'output_video',
                    },
                ])
                .outputOptions('-map [output_video]')
                .toFormat('mp4')
                .on('end', () => {
                    resolve()
                })
                .on('error', (err) => {
                    console.error('Error processing video:', err);
                    reject(err)
                })
                .save(outputPath);
        });
        // Read the combined video file
        const combinedVideoData = fs.readFileSync(outputPath);
        const combinedVideoBlob = new Blob([combinedVideoData], { type: 'video/mp4' });

        // Upload video to Cloudinary
        const folderName = 'Easybell';
        const formData = new FormData();
        formData.append('file', combinedVideoBlob, {
            filename: 'simple.mp4',
            contentType: 'video/mp4',
        });
        formData.append('upload_preset', 'jhujouxl');
        formData.append('folder', folderName);

        const cloudinaryResponse = await axios.post(
            `https://api.cloudinary.com/v1_1/simplefind/upload`,
            formData
        );

        // Get the video URL from the Cloudinary response
        const videoUrl = cloudinaryResponse.data.secure_url;

        // Send the video data as the response
        res.status(200).send({ videoUrl });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occurred while capturing the video.');
    }
});

app.get("/", (req, res) => {
    res.status(200).send("OK")
})

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
});
