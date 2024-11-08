const puppeteer = require('puppeteer');

async function getHref() {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 }); // 'slowMo' slows down Puppeteer operations to make them visible
    const page = await browser.newPage();

    const query = "premier league official schedule";
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    try {
        await page.goto(url);
        // Convert the XPath to a CSS selector for general use
        const selector = '#rso > div:first-child div > div > div:first-child div > div > span > a';
        await page.waitForSelector(selector, { visible: true });
        const hrefValue = await page.$eval(selector, el => el.href);

        const newPage = await browser.newPage();
        await newPage.goto(hrefValue);


        if (hrefValue) {
            console.log(hrefValue);
        } else {
            console.log('No link found');
        }

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

        const matches = await page.$$eval('section.fixtures > div.fixtures__date-container > div[data-competition-matches-list]', elements => {
            return elements.map(el => {
              const date = el.querySelector('time.fixtures__date--long').textContent;
              const matchDetails = Array.from(el.querySelectorAll('ul.matchList > li.match-fixture')).map(match => {
                const homeTeam = match.querySelector('span.match-fixture__team-name').textContent.trim();
                const awayTeam = match.querySelectorAll('span.match-fixture__team-name')[1].textContent.trim();
                const time = match.querySelector('time').textContent;
                return { date, homeTeam, awayTeam, time };
              });
              return matchDetails;
            });
          });
        
          console.log(matches);
          await browser.close();


    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        await browser.close();
    }
}

getHref();
