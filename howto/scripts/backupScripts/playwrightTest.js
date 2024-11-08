const express = require('express');
const { chromium } = require('playwright');

const app = express();
const port = 3000;

// Route that triggers the Playwright script
app.get('/scrape-odds', async (req, res) => {
    try {
        const result = await runScrape();
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while scraping');
    }
});

async function runScrape() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const url = "https://www.oddsportal.com/football/england/premier-league/";
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // Wait until a specific element is visible
        await page.waitForSelector('div.min-h-[206px]', { state: 'visible' });

        // Perform additional interactions or data extraction
        // For example, extract some data
        const data = await page.evaluate(() => {
            const element = document.querySelector('div.min-h-[206px]');
            return element ? element.innerText : 'No data found';
        });

        await browser.close();
        return data; // Return the data extracted from the page
    } catch (error) {
        await browser.close();
        throw error; // Rethrow the error to be handled by the calling function
    }
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
