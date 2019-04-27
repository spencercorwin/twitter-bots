const { MongoClient } = require('mongodb');
const Twitter = require('twitter');
require('dotenv').config();
const { copyToClipboard, idLookupString } = require('./utils');

const twitConfig = {
    consumer_key: process.env.corben_consumer_key,
    consumer_secret: process.env.corben_consumer_secret,
    access_token_key: process.env.corben_access_token_key,
    access_token_secret: process.env.corben_access_token_secret
}

const politicianTwitter = new Twitter(twitConfig);

exports.checkAndStore = async () => {
  try {
    const client = await MongoClient.connect(process.env.DB);
    const db = client.db();
    const tweet = await politicianTwitter.get('users/lookup', {user_id: idLookupString});
    for (let i = 0; i < tweet.length; i++) {
      const candidate = await db.collection('candidates').findOneAndUpdate(
          {id_str: tweet[i].id_str},
          {
            $push: {data: {followerCount: tweet[i].followers_count, date: new Date()}},
            $set: {
              handle: tweet[i].screen_name,
              location: tweet[i].location,
              id_str: tweet[i].id_str,
              description: tweet[i].description,
              url: tweet[i].url,
              name: tweet[i].name,
              created_at: tweet[i].created_at,
              profile_image_url: tweet[i].profile_image_url_https,
            }
          },
          {upsert: true, returnNewDocument: true}
        );
      if (!candidate) {
        console.log('Candidate not found: ' + candidate);
      } else {
        console.log(`Found and updated info for: ${JSON.stringify(candidate.value.handle)}. Now has ${JSON.stringify(candidate.value.data[0].followerCount)} followers`);
      }
    }
  } catch (err) {
    console.log('Error with checkAndStoreAll: ' + JSON.stringify(err));
  }
}

// Function for getting all the current id strings from database
exports.getIds = async () => {
  const client = await MongoClient.connect(process.env.DB);
  const db = client.db();
  const cursor = await db.collection('candidates').find({});
  const candidates = await cursor.toArray();
  const result = candidates.map(candidate => candidate.id_str);
  console.log('candidates length: ' + candidates.length);
  console.log('results length: ' + result.length);
  console.log(result);
  copyToClipboard(JSON.stringify(result));
}

// Function to get the id string for a given handle
exports.getIdFromHandle = async (handle) => {
  const tweet = await politicianTwitter.get('users/lookup', {screen_name: handle});
  console.log(tweet[0].id_str);
}
