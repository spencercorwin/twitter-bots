import Twitter from 'twitter';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs';
import util from 'util';
import dotenv from 'dotenv';
import requestPromise from 'request-promise';
import uniqueString from 'unique-string';

dotenv.config();

// eslint-disable-next-line no-process-env
const { goldConsumerKey, goldConsumerSecret, goldAccessTokenKey, goldAccessTokenSecret } = process.env;
const errorMsg = 'Some environment variable is undefined';
if (!goldConsumerKey) {
  throw new Error(errorMsg);
}
if (!goldConsumerSecret) {
  throw new Error(errorMsg);
}
if (!goldAccessTokenKey) {
  throw new Error(errorMsg);
}
if (!goldAccessTokenSecret) {
  throw new Error(errorMsg);
}
const twitConfig = {
  consumer_key: goldConsumerKey,
  consumer_secret: goldConsumerSecret,
  access_token_key: goldAccessTokenKey,
  access_token_secret: goldAccessTokenSecret,
};
const url = 'https://goldprice.org/';
const dailygoldquotes = new Twitter(twitConfig);
const todaysDateString = new Date().toLocaleString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
const readFile = util.promisify(fs.readFile);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

const tweetChart = async (chartSrc: string, price: string, type: 'gold' | 'silver'): Promise<void> => {
  const chartFile = await requestPromise.get(chartSrc, { encoding: null });
  const chartFileName = `${uniqueString()}-${type}Chart.png`;
  await writeFile(chartFileName, chartFile);
  const media = await readFile(chartFileName);
  const chartMedia = await dailygoldquotes.post('media/upload', { media });
  await dailygoldquotes.post('statuses/update', {
    status: `${type === 'gold' ? 'Gold' : 'Silver'} price on ${todaysDateString}: $${price} USD #${type}`,
    media_ids: chartMedia.media_id_string,
  });
  await unlink(chartFileName);
};

export const tweetFunction = async (chartValue: '20_year' | '60_day' | '6_month'): Promise<void> => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const fourMinInMS = 4 * 60 * 100;
  await page.goto(url, { timeout: fourMinInMS });
  await Promise.all([
    page.select('select#gpxSmallChartTopLeft_time', chartValue),
    page.select('select#gpxSmallChartTopRight_time', chartValue),
  ]);
  const html = await page.content();
  const $ = cheerio.load(html);
  await browser.close();
  const goldPrice = $('#gpxtickerLeft_price').text();
  const goldChartSrc = $('#gpxSmallChartTopLeft_img').attr('src');
  const silverPrice = $('#gpxtickerMiddle_price').text();
  const silverChartSrc = $('#gpxSmallChartTopRight_img').attr('src');
  await Promise.all([tweetChart(goldChartSrc, goldPrice, 'gold'), tweetChart(silverChartSrc, silverPrice, 'silver')]);
};

export const followFollowers = async () => {
  const { users } = await dailygoldquotes.get('followers/list', {
    screen_name: 'dailygoldquotes',
  });
  await Promise.all(
    users.map(async (user: { id_str: string }) => {
      await dailygoldquotes.post('friendships/create', { user_id: user.id_str });
    }),
  );
};
