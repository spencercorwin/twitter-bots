/* eslint-disable no-process-exit */
/* eslint-disable no-console */
import { tweetFunction, followFollowers } from './utils';

const todaysDate = new Date().getDate();
const dayOfTheWeek = new Date().getDay();
const dateString = new Date().toString();

//NYSE opens at 9:30am eastern, 6:30am pacific
//Most popular time to Tweet worldwide & US: noon eastern time, 8am-9am pacific time
if (todaysDate === 1) {
  console.log(`Tweeting 20_year chart at ${dateString}`);
  tweetFunction('20_year')
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.log(e);
    });
} else {
  if ([0, 1, 2, 3, 4, 5].includes(dayOfTheWeek)) {
    console.log(`Tweeting 60_day chart at ${dateString}`);
    tweetFunction('60_day')
      .then(() => {
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
      });
  }
  if (dayOfTheWeek === 6) {
    console.log(`Tweeting 6_month chart at ${dateString}`);
    followFollowers()
      .then(() => {
        console.log('Followed followers. Moving to tweetFunction');
        tweetFunction('6_month');
      })
      .then(() => {
        process.exit(0);
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
