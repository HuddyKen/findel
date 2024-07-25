const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (like index.html) from the current directory
app.use(express.static(path.join(__dirname)));

// Endpoint to get FM channels based on zip code
app.get('/fm-channels/:zip', async (req, res) => {
    const zip = req.params.zip;

    try {
        // Construct the correct URL
        const url = `https://radio-locator.com/cgi-bin/vacant?select=city&city=${zip}&state=&x=0&y=0`;

        // Log the constructed URL for debugging
        console.log(`Requesting URL: ${url}`);

        const { data } = await axios.get(url);

        // Log the received HTML for debugging
        console.log('Received HTML:', data);

        const $ = cheerio.load(data);
        const channels = [];
        $('td.vacant.smalltype').each((index, element) => {
            const text = $(element).text().trim();
            console.log(`Element ${index}: ${text}`); // Log the element's text
            const channelMatch = text.match(/^(\d+\.\d+)/);
            if (channelMatch) {
                console.log(`Matched channel: ${channelMatch[1]}`); // Log the matched channel
                channels.push(channelMatch[1]);
            }
        });

        // Log the channels array for debugging
        console.log('Extracted channels:', channels);

        res.json(channels);
    } catch (error) {
        console.error('Error fetching data:', error); // Log the error
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Endpoint to get zip code based on latitude and longitude
app.get('/zipcode', async (req, res) => {
    const { lat, lon } = req.query;

    try {
        const apiKey = '9734fb38936e4efaba9db7587a11bd5f'; // Replace with your real API key
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${apiKey}`;
        const { data } = await axios.get(url);

        if (data.results.length > 0) {
            const components = data.results[0].components;
            const zip = components.postcode || 'N/A';
            res.json({ zip });
        } else {
            res.status(404).json({ error: 'Zip code not found' });
        }
    } catch (error) {
        console.error('Error fetching zip code:', error); // Log the error
        res.status(500).json({ error: 'Failed to fetch zip code' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
