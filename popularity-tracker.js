const { MongoClient } = require('mongodb');
const Twitter = require('twitter');
require('dotenv').config();

const twitConfig = {
    consumer_key: process.env.corben_consumer_key,
    consumer_secret: process.env.corben_consumer_secret,
    access_token_key: process.env.corben_access_token_key,
    access_token_secret: process.env.corben_access_token_secret
}

const politicianTwitter = new Twitter(twitConfig);

const handlesToCheck = [
    'CoryBooker',
    'SenBooker',
    'AOC',
    'RepAOC',
    'realDonaldTrump',
    'HowardSchultz',
    'SenWarren',
    'ewarren',
    'RepJohnDelaney',
    'TulsiGabbard',
    'TulsiPress',
    'KamalaHarris',
    'SenKamalaHarris',
    'JulianCastro',
    'SecretaryCastro',
    'petebuttigieg',
    'SenGillibrand',
    'gillibrandny',
    'AndrewYang',
    'SenSanders',
    'BernieSanders',
    'betoorourke',
    'RepBetoORourke',
    'MikeBloomberg',
    'BilldeBlasio',
    'JoeBiden',
    'staceyabrams',
    'DrJillStein',
    'MichaelEArth',
    'amyklobuchar',
    'SenAmyKlobuchar',
    'TerryMcAuliffe',
    'andrewgillum',
    'FreeHugsProject',
    'ElectRobbyWells',
    'marwilliamson',
    'VoteOjeda2020',
    'officialmcafee',
    'verminsupreme',
    'arvinvohra',
    'justinamash',
    'randpaul',
    'RepThomasMassie',
    'adamkokesh',
    'GavinNewsom',
    'Ilhan',
    'IlhanMN',
    'RashidaTlaib',
    'GovGaryJohnson',
    'GovBillWeld',
    'elonmusk',
    'Hickenlooper',
    'MikeGravel',
    'ericswalwell',
    'RepSwalwell',
    'GovInslee',
    'JayInslee',
    'TimRyan',
    'RepTimRyan',
];

const lookupString = ((handlesToCheck) => {
    let result = '';
    for (let i = 0; i < handlesToCheck.length - 1; i++) {
        result += handlesToCheck[i] + ',';
    }
    result += handlesToCheck[handlesToCheck.length - 1];
    return result;
})(handlesToCheck);

exports.checkAndStore = async () => {
  try {
    const client = await MongoClient.connect(process.env.DB);
    const db = client.db();
    const tweet = await politicianTwitter.get('users/lookup', {screen_name: lookupString});
    //Loop and database logic here
    for (let i = 0; i < tweet.length; i++) {
      const candidate = await db.collection('candidates').findOneAndUpdate(
          {handle: tweet[i].screen_name},
          {$push: {data: {followerCount: tweet[i].followers_count, date: new Date()}}},
          {upsert: true, returnNewDocument: true});
      if (!candidate) {
        console.log('Candidate not found: ' + candidate);
      } else {
        console.log(`Found and updated follower count for: ${JSON.stringify(candidate.value.handle)}. Now has ${JSON.stringify(candidate.value.data[0].followerCount)} followers`);
      }
    }
  } catch (err) {
    console.log('Error with checkAndStore: ' + err);
  }
}
