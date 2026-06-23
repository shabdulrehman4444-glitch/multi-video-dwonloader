const express = require('express');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Frontend files ke liye

// Download Endpoint
app.post('/download', async (req, res) => {
    let { videoUrl, quality } = req.body;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Yaar link tu do!' });
    }

    videoUrl = videoUrl.trim();

    // 1. Asli Title fetch karne ke liye saaf aur seedhi command
    const getTitleCmd = `yt-dlp --get-title --no-playlist "${videoUrl}"`;
    
    exec(getTitleCmd, (error, stdout, stderr) => {
        let videoTitle = "";

        if (!error && stdout) {
            // Hashtags (#) ko hatana aur safe filename banana
            videoTitle = stdout.trim().split('#')[0].replace(/[/\\?%*:|"<>]/g, '').trim();
        }

        // AGAR TITLE FETCH NA HO TU DEFINE A GENERAL NAME (Kyunki baaz auqat Insta/TikTok title nahi dete)
        if (!videoTitle) {
            videoTitle = `Video_${Date.now()}`; // Taake har baar naya random naam aaye, purana football gameplay na aaye
        }

        const websiteTag = "MyWebsite"; 
        const outputFilename = `${websiteTag} - ${videoTitle}`;
        
        let formatSelection = '';
        let fileExtension = 'mp4';

        if (quality === 'hd') {
            formatSelection = '-f "best[ext=mp4]/best"'; 
        } else if (quality === 'low') {
            formatSelection = '-f "worst[ext=mp4]/worst"';
        } else if (quality === 'mp3') {
            formatSelection = '-f "ba[ext=m4a]/ba"';
            fileExtension = 'mp3';
        }

        if (!fs.existsSync('downloads')){
            fs.mkdirSync('downloads');
        }

        const outputPath = path.join(__dirname, 'downloads', `${outputFilename}.${fileExtension}`);
        
        const downloadCmd = `yt-dlp --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" --no-check-certificates ${formatSelection} "${videoUrl}" -o "${outputPath}"`;

        console.log("Downloading Asli Video:", outputFilename);

        exec(downloadCmd, (dlError, dlStdout, dlStderr) => {
            if (dlError) {
                console.error("🔴 DOWNLOAD ERROR:", dlError);
                return res.status(500).json({ error: 'Download fail ho gya.' });
            }

            if (!fs.existsSync(outputPath)) {
                return res.status(500).json({ error: 'File save nahi ho saki.' });
            }

            res.download(outputPath, `${outputFilename}.${fileExtension}`, (err) => {
                if (err) console.error("File send error:", err);
                
                try {
                    if (fs.existsSync(outputPath)) {
                        fs.unlinkSync(outputPath);
                    }
                } catch (unlinkErr) {
                    console.error("Cleanup error:", unlinkErr);
                }
            });
        });
    });
});

// Server ko '0.0.0.0' par listen karwana taake network pr access ho sake
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});