const playwright = require('playwright');

async function scrapeMatches() {
  const browser = await playwright.chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://www.premierleague.com/fixtures'); // Change to your actual URL

  await page.waitForSelector('#onetrust-pc-btn-handler', { state: 'visible' });
  await page.click('#onetrust-pc-btn-handler');
  console.log('Clicked the first element.');

  // Wait for and click the second element
  await page.waitForSelector('#onetrust-pc-sdk > div > div.ot-pc-footer > div.ot-btn-container > button', { state: 'visible' });
  await page.click('#onetrust-pc-sdk > div > div.ot-pc-footer > div.ot-btn-container > button');
  console.log('Clicked the second element.');

  await page.waitForSelector('svg.icon.icn', { state: 'visible' });
  await page.click('svg.icon.icn');
  console.log('Clicked the close SVG.');

//   const matches = await page.$$eval('section.fixtures > div.fixtures__date-container > div[data-competition-matches-list]', elements => {
//     return elements.map(el => {
//       const date = el.querySelector('time.fixtures__date--long').textContent;
//       const matchDetails = Array.from(el.querySelectorAll('ul.matchList > li.match-fixture')).map(match => {
//         const homeTeam = match.querySelector('span.match-fixture__team-name').textContent.trim();
//         const awayTeam = match.querySelectorAll('span.match-fixture__team-name')[1].textContent.trim();
//         const time = match.querySelector('time').textContent;
//         return { date, homeTeam, awayTeam, time };
//       });
//       return matchDetails;
//     });
//   });

//   console.log(matches);
//   await browser.close();
}

scrapeMatches();
