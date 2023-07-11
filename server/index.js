const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// Increase the payload size limit (e.g., 10MB)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(cors());
app.use(express.json());

app.post('/save-image', (req, res) => {
    // Extract image extension and data
    const base64Data = req.body.imageData;
    const matches = base64Data.match(/^data:(.+);base64,(.+)/);
    const extension = matches[1].split('/')[1];
    const data = matches[2];

    // Create a unique filename
    const filename = `image_${Date.now()}.${extension}`;

    // Set the file path
    const filePath = path.join(__dirname, 'images', filename); // Set the desired directory path

    // Write the buffer to disk
    fs.writeFile(filePath, data, 'base64', (error) => {
        if (error) {
            console.error('Error:', error);
            res.status(500).send('Image save failed');
        } else {
            console.log('Image saved successfully');
            res.sendStatus(200);
        }
    });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
