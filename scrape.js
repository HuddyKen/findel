// api/fm-channels.js
const axios = require('axios');
const cheerio = require('cheerio');

export default async function handler(req, res) {
  const zip = req.query.zip;
  
  if (!zip) {
    return res.status(400).json({ error: 'ZIP code is required' });
  }

  try {
    const response = await axios.get(`https://radio-locator.com/cgi-bin/vacant?select=city&city=${zip}&state=&x=0&y=0`);
    const html = response.data;
    const $ = cheerio.load(html);

    const fmChannels = [];
    $('td.vacant.smalltype').each((i, element) => {
      const channel = $(element).text().trim();
      if (channel) {
        fmChannels.push(channel);
      }
    });

    res.status(200).json(fmChannels);
  } catch (error) {
    console.error('Error fetching FM channels:', error);
    res.status(500).json({ error: 'An error occurred while fetching FM channels' });
  }
}
