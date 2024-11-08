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

        const today = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        // This selector needs to be specific to the elements that contain the date info
        await page.waitForSelector('#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div > div > div');

        const calendarSelector = '#body-container > div.sc-84353c08-0.bdUdHw > div.sc-786e9a8b-8.fQztJo > div:nth-child(2) > p > div > div > div';    
        await page.click(calendarSelector);

        
        const dayElements = await page.$$('.react-datepicker__day');


        const dates = await Promise.all(dayElements.map(async (element) => {
            const label = await element.getAttribute('aria-label');
            return label ? label.replace('Choose ', '') : null;  // Clean up the label to just return the date part
        }));

        // await page.click('.react-datepicker__navigation-icon.react-datepicker__navigation-icon--next');
        // await page.waitForTimeout(1000);  // Wait for the calendar to update


        console.log(dates);  // Log the cleaned up dates

        // Example of writing data to a CSV file
        if (dates.length > 0) {
            let writer = csvWriter({ headers: ["Date"]});
            writer.pipe(fs.createWriteStream(path.join(__dirname, 'dates.csv')));
            dates.forEach(date => {
                if (date) writer.write([date]);  // Write each date to the CSV file
            });
            writer.end();
        }
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        await browser.close();
    }
}

scrapeSchedule();