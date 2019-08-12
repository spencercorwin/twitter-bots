import { tweetFunction, followFollowers } from './utils';

const todaysDate = new Date();

//Every month: 20 yr, 30 yr, all
//Potential options: 20_year 30_year all_data
if (todaysDate.getDate() === 1) {
  tweetFunction('20_year');
  console.log(`Tweeting at ${todaysDate.toString()}`);
} else {
  //Check if the day is Mon-Fri
  //Script for daily Tweets. Every Mon-Thurs at 9am
  //Potential options: 60_day
  if ([0, 1, 2, 3, 4, 5].includes(todaysDate.getDay())) {
    tweetFunction('60_day');
    console.log(`Tweeting at ${todaysDate.toString()}`);
  }

  //Every week on Sat: 6 months, 1 yr, 2 yr
  //Potential options: 6_month 1_year 2_year
  if (todaysDate.getDay() === 6) {
    followFollowers();
    setTimeout(() => tweetFunction('6_month'), 5000);
    console.log(`Tweeting at ${todaysDate.toString()}`);
  }
}