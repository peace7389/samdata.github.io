const playwright = require('playwright');
const query = 'premierleague official schedule'
const url = `https://www.google.com/search?q=${query}`;

async function scrapeMatches() {
    const browser = await playwright.chromium.launch({ headless: false });
    const page = await browser.newPage();  

    try {
        const url = "https://www.nytimes.com/athletic/football/premier-league/schedule";
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        
}

scrapeMatches();
