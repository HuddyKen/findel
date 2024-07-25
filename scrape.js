// api/fm-channels.js
const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  const zip = req.query.zip;

  if (!zip) {
    return res.status(400).json({ error: 'ZIP code is required' });
  }

  try {
    const url = `https://radio-locator.com/cgi-bin/vacant?select=city&city=${zip}&state=&x=0&y=0`;
    console.log(`Requesting URL: ${url}`); // Log the URL

    const response = await axios.get(url);
    const html = response.data;

    // Log the received HTML content
    console.log('Received HTML:', html);

    const $ = cheerio.load(html);

    const fmChannels = [];
    $('td.vacant.smalltype').each((i, element) => {
      const channel = $(element).text().trim();
      console.log(`Element ${i}: ${channel}`); // Log each element's text

      // Extract the channel numbers using regex
      const channelMatch = channel.match(/(\d+\.\d+)/g);
      if (channelMatch) {
        channelMatch.forEach(ch => {
          fmChannels.push(ch);
        });
      }
    });

    // Log the extracted FM channels
    console.log('Extracted FM channels:', fmChannels);

    res.status(200).json(fmChannels);
  } catch (error) {
    console.error('Error fetching FM channels:', error);
    res.status(500).json({ error: 'An error occurred while fetching FM channels' });
  }
}
