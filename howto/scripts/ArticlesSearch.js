const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const results = [];

function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', reject);
    });
}

async function scrapeContent(page) {
    try {
        await page.waitForSelector('article, .article-body, main', { timeout: 5000 });
        const content = await page.evaluate(() => {
            const article = document.querySelector('article, .article-body, main');
            return article ? article.innerText.trim() : 'No article content found';
        });
        return content;
    } catch (error) {
        console.error('Failed to scrape content:', error);
        return 'Failed to scrape content';
    }
}

async function searchMatches(matches, browser) {
    const scrapedData = [];
    for (const match of matches) {
        const page = await browser.newPage();
        const query = `${match['Home Team']} vs ${match['Away Team']} ${match['Match Date']}`;
        await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2' });

        // Wait for the search results to be fully loaded
        await page.waitForSelector('div#search', {timeout: 5000}); // Adjust the selector based on your observations of the page structure
        
        const links = await page.evaluate(() => {
            // Use more generic or different selectors based on observed structures
            const searchResults = Array.from(document.querySelectorAll('div#search a'));
            return searchResults.filter(a => a.href && a.textContent.includes('vs')).map(a => a.href).slice(0, 5);
        });

        console.log(links);  // Check the links collected

        for (const link of links) {
            const newPage = await browser.newPage();
            await newPage.goto(link, { waitUntil: 'networkidle2' });
            const content = await scrapeContent(newPage);
            console.log(`Scraped content: ${content}`);  // Debug output
            scrapedData.push({
                query,
                link,
                content: content.replace(/(\r\n|\n|\r)/gm, " ")  // Clean newlines for CSV format
            });
            await newPage.close();
        }

        await page.close();
    }
    return scrapedData;
}

function writeCSV(data) {
    const header = 'Query,Link,Content\n';
    const rows = data.map(d => `"${d.query}","${d.link}","${d.content}"`).join('\n');
    fs.writeFileSync('scraped_data.csv', header + rows);
}

async function performSearch() {
    try {
        const matches = await readCSV('../sources/schedule.csv');
        const browser = await puppeteer.launch({ headless: false });
        const data = await searchMatches(matches, browser);
        writeCSV(data);
        // await browser.close();
    } catch (error) {
        console.error('Error during search or write operation:', error);
    }
}

performSearch().catch(console.error);
