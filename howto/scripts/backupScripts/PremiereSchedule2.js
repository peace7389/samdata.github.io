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

        await page.waitForSelector('#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div > div > div');
        const calendarSelector = '#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div > div > div';    
        await page.click(calendarSelector);

        while (continueScraping) {
            const dayElements = await page.$$('.react-datepicker__day');

            const dates = await Promise.all(dayElements.map(async (element) => {
                const label = await element.getAttribute('aria-label');
                return label ? label.replace('Choose ', '') : null;  // Clean up the label to just return the date part
            }));

            console.log(dates);  // Log the cleaned up dates

            dates.forEach(date => {
                if (date) writer.write([date]);  // Write each date to the CSV file
            });

            await page.waitForSelector("#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div.sc-e356a8e3-2.cYTXcV > div.sc-a5f374a-0.sc-63e9df2d-0.vuXtC.jhbytc > div > div > button.react-datepicker__navigation.react-datepicker__navigation--next > span");
            
            

            const nextMonthButton = await page.$$('#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div.sc-e356a8e3-2.cYTXcV > div.sc-a5f374a-0.sc-63e9df2d-0.vuXtC.jhbytc > div > div > button.react-datepicker__navigation.react-datepicker__navigation--next > span');
            await page.click(nextMonthButton);
            if (nextMonthButton) {

                await page.waitForSelector('.react-datepicker__day', { state: 'attached' });
            } else {
                continueScraping = false;
            }
        }

        writer.end();
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await browser.close();
    }
}

scrapeSchedule();
