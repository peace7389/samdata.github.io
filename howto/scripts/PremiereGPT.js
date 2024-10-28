const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-write-stream');

async function scrapeArticles() {
    const data = [];
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // const query = "the athletic";
        // const url = `https://www.google.com/search?q=${query}`;

        const url = "https://www.nytimes.com/athletic/football/premier-league/standings/"
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // await page.keyboard.press('End');
        // await page.waitForTimeout(2000);

        // const firstArticleSelector = '#rso > div > div > div:nth-child(1) a[jsname]';
        // const articleLink = await page.getAttribute(firstArticleSelector, 'href');

        // const newPage = await context.newPage();
        // await newPage.goto(articleLink, { waitUntil: 'domcontentloaded' });
        // await newPage.waitForSelector('body', { timeout: 5000 });

        // const PremiereLeagueElementSelector = "#__next > div > div:nth-child(1) > header > nav > div > div.sc-5db001b-2.sc-5db001b-3.cnuTkH.fJFTKm > div > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(1) > a"
        // await newPage.click(PremiereLeagueElementSelector);

        // const StandingElementSelector = "#__next > div > div:nth-child(1) > header > nav > div > div.sc-5db001b-2.sc-5db001b-3.cnuTkH.fJFTKm > div > div > div:nth-child(4) > div > div:nth-child(2) > div:nth-child(4) > a";  
        // await newPage.click(StandingElementSelector);

        const rows = await page.$$eval('.table-body > tr', rows =>
            rows.map(row => {
                const cols = row.querySelectorAll('td');
                return Array.from(cols, col => col.textContent.replace(/<[^>]*>?/gm, '').trim());
            })
        );

        if (rows.length === 0) throw new Error('No rows extracted');
        data.push(...rows);
    } catch (error) {
        console.error(`Error processing articles: ${error}`);
    } finally {
        await browser.close();
    }

    if (data.length > 0) {
        console.log("First row of data:", data[0]);
        await writeCSV(data);
    } else {
        console.log("No data to save.");
    }
}

async function writeCSV(data) {
    const dirPath = path.join(__dirname, '..', 'sources');
    fs.mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, 'premiere_JS.csv');
    const writer = csvWriter({ headers: ["Column1", "Column2", "Column3", "Column4", "Column5", "Column6", "Column7", "Column8", "Column9", "Column10"] });
    writer.pipe(fs.createWriteStream(filePath));
    for (let row of data) {
        writer.write(row);
    }
    writer.end();
    console.log(`Data saved to CSV successfully in '${filePath}'.`);
}

scrapeArticles();
