const MongoClient = require('mongodb').MongoClient;
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
    'JohnKDelaney',
    'TulsiGabbard',
    'TulsiPress',
    'KamalaHarris',
    'SenKamalaHarris',
    'JulianCastro',
    'SecretaryCastro',
    'petebuttigieg',
    'SenGillibrand',
    'gillibrandny',
    'AndrewYangVFA',
    'SenSanders',
    'BernieSanders',
    'betoorourke',
    'RepBetoORourke',
    'MikeBloomberg',
    'BilldeBlasio',
    'JoeBiden',
    'staceyabrams',
    'DrJillStein',
    'HBWorldview',
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
    'elonmusk'
];

const lookupString = ((handlesToCheck) => {
    let result = '';
    for (let i = 0; i < handlesToCheck.length - 1; i++) {
        result += handlesToCheck[i] + ',';
    }
    result += handlesToCheck[handlesToCheck.length - 1];
    return result;
})(handlesToCheck);

exports.checkAndStore = () => {
    MongoClient.connect(process.env.DB, (err, client) => {
        if (err) {
            console.log('Database error: ' + err);
        } else {
            console.log('Successful database connection');
            const db = client.db();
            politicianTwitter.get('users/lookup', {screen_name: lookupString}, (err, tweet, response) => {
                if (err) {
                    console.log('Error: ' + err);
                } else {
                    //Loop and database logic here
                    for (let i = 0; i < tweet.length; i++) {
                        db.collection('candidates').findOneAndUpdate(
                            {handle: tweet[i].screen_name},
                            {$push: {data: {followerCount: tweet[i].followers_count, date: new Date()}}}, //Check here
                            {upsert: true, returnNewDocument: true},
                            (err, candidate) => {
                                if (err) {
                                    console.log('Error in finding handle: ' + err);
                                } else if (!candidate) {
                                    console.log('Candidate not found: ' + candidate);
                                } else {
                                    console.log(`Found and updated candidate count for: ${JSON.stringify(candidate.value.handle)}. Now has ${JSON.stringify(candidate.value.data[0].followerCount)} followers`);
                                }
                            })
                    }
                }
            });
        }
    })
}
