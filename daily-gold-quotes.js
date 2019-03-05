const Twitter = require('twitter');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
require('dotenv').config();
const request = require('request').defaults({encoding: null});

const twitConfig = {
    consumer_key: process.env.gold_consumer_key,
    consumer_secret: process.env.gold_consumer_secret,
    access_token_key: process.env.gold_access_token_key,
    access_token_secret: process.env.gold_access_token_secret
}

const dailygoldquotes = new Twitter(twitConfig);

const todaysDate = (() => {
    const dateObj = new Date();
    if (dateObj.getMonth() < 10) {
        result = '0' + Number(dateObj.getMonth() + 1);
    } else {
        result = Number(dateObj.getMonth()) + 1;
    }
    if (dateObj.getDate() < 10) {
        const todaysDate = Number(dateObj.getDate());
        dateObj.setDate((todaysDate).toString());
        result += '0' + dateObj.getDate();
    } else {
        const todaysDate = Number(dateObj.getDate());
        dateObj.setDate((todaysDate).toString());
        result += dateObj.getDate();
    }
    result += dateObj.getFullYear();

    return result;
})();

const todaysDateString = (() => {
    const dateObj = new Date();
    if (dateObj.getMonth() < 10) {
        result = '0' + Number(dateObj.getMonth() + 1) + '/';
    } else {
        result = Number(dateObj.getMonth()) + 1 + '/';
    }
    if (dateObj.getDate() < 10) {
        const todaysDate = Number(dateObj.getDate());
        dateObj.setDate((todaysDate).toString());
        result += '0' + dateObj.getDate() + '/';
    } else {
        const todaysDate = Number(dateObj.getDate());
        dateObj.setDate((todaysDate).toString());
        result += dateObj.getDate() + '/';
    }
    result += dateObj.getFullYear();

    return result;
})();

//NYSE opens at 9:30am eastern, 6:30am pacific
//Most popular time to Tweet worldwide & US: noon eastern time, 8am-9am pacific time

//URL for puppeteer to find gold charts
const url = 'https://goldprice.org/';

exports.tweetFunction = async (chartValue) => {
    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        const fourMinInMS = 4*60*100;
        await page.goto(url, {timeout: fourMinInMS});
        await page.select('select#gpxSmallChartTopLeft_time', chartValue);
        await page.select('select#gpxSmallChartTopRight_time', chartValue);
        const html = await page.content();
        $ = cheerio.load(html);
        await browser.close();
        //Get attribute src text for chart
        const goldPrice = $('#gpxtickerLeft_price').text();
        const goldChartSrc = $('#gpxSmallChartTopLeft_img').attr('src');
        const silverPrice = $('#gpxtickerMiddle_price').text();
        const silverChartSrc = $('#gpxSmallChartTopRight_img').attr('src');
        //Download the photos from goldprice.org then write to local directory
        request.get(goldChartSrc, (err, res, body) => {
            fs.writeFile(`${todaysDate}goldchart.png`, body, (err) => {
                if (err) throw err;
                console.log('The file was saved');
                const goldChartBuffer = fs.readFileSync(`./${todaysDate}goldchart.png`);
                //Upload chart png file
                dailygoldquotes.post('media/upload', {media: goldChartBuffer}, (err, media, res) => {
                    if (!err) {
                        const status = {
                            status: `Gold price on ${todaysDateString}: $${goldPrice} USD #gold`,
                            media_ids: media.media_id_string
                        };
                        dailygoldquotes.post('statuses/update', status, (err, tweet, res) => {
                            if (!err) {
                                console.log('Gold Success!');
                            }
                        });
                    }
                });
            })
            request.get(silverChartSrc, (err, res, body) => {
                fs.writeFile(`${todaysDate}silverchart.png`, body, (err) => {
                    if (err) throw err;
                    console.log('The file was saved');
                    const goldChartBuffer = fs.readFileSync(`./${todaysDate}silverchart.png`);
                    //Upload chart png file
                    dailygoldquotes.post('media/upload', {media: goldChartBuffer}, (err, media, res) => {
                        if (!err) {
                            const status = {
                                status: `Silver price on ${todaysDateString}: $${silverPrice} USD #silver`,
                                media_ids: media.media_id_string
                            };
                            dailygoldquotes.post('statuses/update', status, (err, tweet, res) => {
                                if (!err) {
                                    console.log('Silver Success!');
                                    fs.unlink(`./${todaysDate}goldchart.png`, (err) => {
                                        if (!err) {
                                            console.log('Deleted silver chart');
                                            fs.unlink(`./${todaysDate}silverchart.png`, (err) => {
                                                if (!err) {
                                                    console.log('Deleted gold chart');
                                                    //Exit the NodeJS process
                                                    process.exit(22);
                                                }
                                            })
                                        }
                                    })
                                }
                            });
                        }
                    });
                })
            })
        })
    } catch(error) {
        console.log('Error in tweet function: ' + error);
    }
};

//Function to check current followers then follow all that are returned. Gotta encourage more!
exports.followFollowers = async () => {
  try {
    const tweet = await dailygoldquotes.get('followers/list', {screen_name: 'dailygoldquotes'});
    for (let index in tweet.users) {
      let idToFollow = tweet.users[index].id_str;
      await dailygoldquotes.post('friendships/create', {user_id: idToFollow});
    }
  } catch (err) {
    console.log('Error following followers of @dailygoldquotes: ' + err);
  }
};
