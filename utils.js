const { MongoClient } = require("mongodb");

exports.copyToClipboard = data => {
  const proc = require("child_process").spawn("pbcopy");
  proc.stdin.write(data);
  proc.stdin.end();
};

const handlesToCheck = [
  "CoryBooker",
  "SenBooker",
  "AOC",
  "RepAOC",
  "realDonaldTrump",
  "HowardSchultz",
  "SenWarren",
  "ewarren",
  "RepJohnDelaney",
  "TulsiGabbard",
  "TulsiPress",
  "KamalaHarris",
  "SenKamalaHarris",
  "JulianCastro",
  "SecretaryCastro",
  "petebuttigieg",
  "SenGillibrand",
  "gillibrandny",
  "AndrewYang",
  "SenSanders",
  "BernieSanders",
  "betoorourke",
  "RepBetoORourke",
  "MikeBloomberg",
  "BilldeBlasio",
  "JoeBiden",
  "staceyabrams",
  "DrJillStein",
  "amyklobuchar",
  "SenAmyKlobuchar",
  "TerryMcAuliffe",
  "andrewgillum",
  "marwilliamson",
  "officialmcafee",
  "verminsupreme",
  "arvinvohra",
  "justinamash",
  "randpaul",
  "RepThomasMassie",
  "GavinNewsom",
  "Ilhan",
  "IlhanMN",
  "RashidaTlaib",
  "GovGaryJohnson",
  "GovBillWeld",
  "elonmusk",
  "Hickenlooper",
  "MikeGravel",
  "ericswalwell",
  "RepSwalwell",
  "GovInslee",
  "JayInslee",
  "TimRyan",
  "RepTimRyan",
  "SenatorBennet",
  "MichaelBennet",
  "JohnDelaney",
  "GovernorBullock",
  "TomSteyer"
];

const idsToCheck = [
  "117839957",
  "377609596",
  "942156122",
  "1077214808",
  "21789463",
  "466532637",
  "13491312",
  "15808765",
  "2167097881",
  "138203134",
  "25073877",
  "807442387",
  "970207298",
  "357606935",
  "937723303",
  "26637348",
  "1064206014",
  "30354991",
  "803694179079458816",
  "19682187",
  "2695663285",
  "226222147",
  "72198806",
  "899978622416695297",
  "29442313",
  "216776631",
  "216881337",
  "975200486",
  "342863309",
  "1134292500",
  "16581604",
  "476193064",
  "939091",
  "216065430",
  "111216929",
  "33537967",
  "22044727",
  "19471123",
  "465046121",
  "21522338",
  "961445378",
  "394746333",
  "101348737",
  "233842454",
  "2228878592",
  "1079104563280527364",
  "11347122",
  "1082334352711790593",
  "783792992",
  "435331179",
  "95713333",
  "734783792502575105",
  "44196397",
  "14709326",
  "45645232",
  "426028646",
  "224285242",
  "111721601",
  "949934436"
];

exports.handleLookupString = (handlesToCheck => {
  let result = "";
  for (let i = 0; i < handlesToCheck.length - 1; i++) {
    result += handlesToCheck[i] + ",";
  }
  result += handlesToCheck[handlesToCheck.length - 1];
  return result;
})(handlesToCheck);

exports.idLookupString = (idsToCheck => {
  let result = "";
  for (let i = 0; i < idsToCheck.length - 1; i++) {
    result += idsToCheck[i] + ",";
  }
  result += idsToCheck[idsToCheck.length - 1];
  return result;
})(idsToCheck);

exports.transferToAtlas = async (oldDB, newDB) => {
  try {
    const oldClient = await MongoClient.connect(oldDB);
    const oldDBInstance = oldClient.db().collection("candidates");
    const oldCursor = await oldDBInstance.find({}); // Gets all records
    const oldData = await oldCursor.toArray();

    const newClient = await MongoClient.connect(newDB, {
      useNewUrlParser: true
    });
    const newCollection = newClient
      .db("popularity-contest")
      .collection("handles");

    oldData.forEach((document, index) => {
      newCollection.findOneAndUpdate(
        { id_str: document.id_str },
        {
          $set: {
            data: document.data
          }
        }
      );
      console.log(index, oldData.length);
      if (index === oldData.length - 1) {
        console.log("Done updating");
      }
    });
  } catch (err) {
    console.log(err);
  }
};
