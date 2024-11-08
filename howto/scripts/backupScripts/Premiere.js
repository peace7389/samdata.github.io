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
        const query = "athletic/football/premier-league/standings/";
        const url = `https://www.google.com/search?q=${query}&tbm=nws`;
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        await page.keyboard.press('End');
        await page.waitForTimeout(2000);

        // Adjust the selector if needed to match the actual element
        const singleArticleSelector = '#rso > div > div > div:nth-child(1) a[jsname]';
        const articleLink = await page.getAttribute(singleArticleSelector, 'href');


        

        // Opening and switching to new window
        const newPage = await context.newPage();
        await newPage.goto(articleLink);
        await newPage.waitForSelector('body');

        // XPath used here needs to precisely match the navigation element
        const specificElementSelector = "//*[@id='__next']/div/div[1]/header/nav/div/div[1]/div/div/div[4]/div/div[2]/div[3]/a";
        await newPage.click(specificElementSelector);

        // Ensure class name matches for table container
        const table = await newPage.locator('.table-container');
        const rows = await table.locator('tr').elementHandles();
        for (let row of rows) {
            const cols = await row.$$eval('td', tds => tds.map(td => td.textContent.replace('\n', ' ')));
            data.push(cols);
        }
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
    const dirPath = path.join(__dirname, 'howto', 'sources');
    fs.mkdirSync(dirPath, { recursive: true }); // Ensure directory exists
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
