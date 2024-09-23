 
/**!
 * @license CBC-News-Streams.js - A JavaScript library for fetching free live TV stream URLs from CBC.ca / CBC News
 * VERSION: 1.0.0
 * CREATED BY: JARED VAN VALKENOGED
 * LICENSED UNDER MIT LICENSE
 * MORE INFO CAN BE FOUND AT https://github.com/MarketingPipeline/CBC-News-Streams.js/
 */
export function CBC_News_Streams() {

     const LIST_ELEMENT = "2415871718";
  
    if (typeof node !== 'undefined' || typeof process === 'object') {
        try {
            let fetch = require('node-fetch');
        } catch (e) {
            console.log('node-fetch is not installed. Please install node-fetch to use "CBC-News.js".');
            if (typeof process !== 'undefined') {
                process.exit(1);
            }
        }
    }

    async function getAllChannels() {
        try {
            let result = await fetchURL("url", "https://services.radio-canada.ca/ott/catalog/v2/gem/home?device=web");
            result = result.lineups.results
          
           const items = result.find((result) => result.key === LIST_ELEMENT)?.items || [];
          
            return await fetchAllChannelURLs(items)
        } catch (err) {
            throw err
        }
    }


    async function getChannel(channel_title) {
        try {
            if (!channel_title) {
                throw new Error('Error: No channel title provided to .getChannel() for.');
            }
            // Uppercase the first letter.
            channel_title = channel_title.charAt(0).toUpperCase() + channel_title.slice(1);
            let result = await fetchURL("url", "https://services.radio-canada.ca/ott/catalog/v2/gem/home?device=web");
            let channels = result.lineups.results
            channels =  channels.find((result) => result.key === LIST_ELEMENT)?.items || []; 
            let foundResults = false
            for (const channel in channels) {
                if (channel_title === channels[channel].title) {
                    foundResults = true
                    let results = {
                        channel_title: channels[channel].title,
                        description: channels[channel].description,
                        channel_image: channels[channel].cbc$staticImage,
                        stream_url: await getStreamData(channels[channel].idMedia)
                    }
                    return results
                }
            }

            if (foundResults != true) {
                throw new Error(`Error: No results found for channel ${channel_title}`);

            }
        } catch (err) {
            throw err
        }
    }

    /// CORE FUNCTIONS BELOW

    // Core function to fetch URL from text (for XML) or JSON file
    async function fetchURL(fetchType, url) {

        //console.log(url)
        if (fetchType === "text") {
            const rsp = await fetch(url),
            data = await rsp.text();
            return data;
        } else {
            const rsp = await fetch(url),
            data = await rsp.json();
            return data;
        }

    }

    // Core function to fetch all channels
    async function fetchAllChannelURLs(json) {
        const results = await Promise.all(json.map(async item => ({
    channel_title: item.title,
    description: item.description,
    channel_image: item.images.card,
    stream_url: await getStreamData(item.idMedia)
})));

        return results
    }


    async function getStreamData(id) {
        try {
            let result = await fetchURL("url", `https://corsproxy.io/?https://services.radio-canada.ca/media/validation/v2/?appCode=medianetlive&connectionType=hd&deviceType=ipad&idMedia=${id}&multibitrate=true&output=json&tech=hls&manifestType=desktop`);
            return  result
        } catch (err) {
            throw err
            return
        }
    }
 

    return {
        getChannel: getChannel,
        getAllChannels: getAllChannels
    }
}
     console.log(await CBC_News_Streams().getChannel("Toronto")) 
