const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-write-stream');

async function scrapeSchedule() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        const url = "https://www.nytimes.com/athletic/football/premier-league/schedule";
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        // Initialize CSV writer
        let writer = csvWriter({ headers: ["Date"] });
        writer.pipe(fs.createWriteStream(path.join(__dirname, 'dates.csv')));

        let continueScraping = true;

        const calendarSelector = '#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div > div > div';    
        await page.waitForSelector(calendarSelector);
        await page.click(calendarSelector);

        while (continueScraping) {
            const dayElements = await page.$$('.react-datepicker__day');

            const dates1 = await Promise.all(dayElements.map(async (element) => {
                const label = await element.getAttribute('aria-label');
                return label ? label.replace('Choose ', '') : null;  // Clean up the label to just return the date part
            }));

            console.log(dates1);  // Log the cleaned up dates

            dates1.forEach(date => {
                if (date) writer.write([date]);  // Write each date to the CSV file
            });

            const nextButtonLocator = page.locator('text="Next Month"');
            await nextButtonLocator.click();

            const dateLocator = page.locator('xpath=//div[contains(@class, "date-class-name")]');
            const dates2 = await dateLocator.allTextContents();

            console.log(dates2);

           
        }

        writer.end();
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await browser.close();
    }
}

scrapeSchedule();
