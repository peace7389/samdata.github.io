const puppeteer = require('puppeteer');

async function searchPremierLeagueSchedule() {
    const browser = await puppeteer.launch({ headless: false }); // Set headless: false to see the browser in action
    const page = await browser.newPage();

    // Navigate to Google with network conditions that allow us to assume full load
    await page.goto('https://www.google.com', { waitUntil: 'networkidle0' });

    // Use the specific attributes of the textarea to ensure correct selection
    const searchSelector = 'textarea[name="q"]'; // Updated to select the textarea element
    await page.waitForSelector(searchSelector, { timeout: 60000 }); // Increased timeout
    await page.click(searchSelector); // Ensure the textarea is focused
    await page.type(searchSelector, 'premier league official schedule');

    // Press Enter to submit the search
    await page.keyboard.press('Enter');

    // Wait for the search results to be loaded
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    // Retrieve the URL of the first search result
    const firstResultSelector = 'h3';
    await page.waitForSelector(firstResultSelector);
    const firstResultURL = await page.evaluate((selector) => {
        return document.querySelector(selector).parentNode.href;
    }, firstResultSelector);

    // Open the URL in a new tab
    const newPage = await browser.newPage();
    await newPage.goto(firstResultURL, { waitUntil: 'networkidle0' });

    // Scroll to the bottom of the page to ensure all dynamic content is loaded
    await newPage.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    // Now, scrape the match details from the new page
    const matches = await newPage.evaluate(() => {
        const matchList = [];
        const matchElements = document.querySelectorAll('.fixtures__matches-list .match-fixture');

        matchElements.forEach(match => {
            const homeTeam = match.querySelector('.match-fixture__team-name').textContent.trim();
            const awayTeam = match.querySelectorAll('.match-fixture__team-name')[1].textContent.trim();
            const matchDate = match.closest('.fixtures__date-container').querySelector('.fixtures__date--long').textContent.trim();
            const timeOfMatch = match.querySelector('time').textContent.trim();

            matchList.push({ matchDate, timeOfMatch, homeTeam, awayTeam });
        });

        return matchList;
    });

    console.log(matches);

    await browser.close();
}

searchPremierLeagueSchedule();
