const puppeteer = require("puppeteer");
const logger = require("../util/logger");

const url = "https://www.chesapeakearena.com/events/calendar/";
const screenWidth = 1280;
const screenHeight = 800;

/**
 * Scrapes the chesapeake energy arena calendar for events for each month
 * @param {number} months How many months the scraper should scrape
 * @param {boolean} headless Should the browser run headless. Default true
 *
 * @return {array} array of objects containing events data
 */
module.exports = async function scrapeFor(months, headless = true) {
  //
  try {
    logger(`launching new browser`);
    const browser = await puppeteer.launch({
      headless: headless,
      defaultViewport: { width: screenWidth, height: screenHeight }
    });
    const page = await browser.newPage();

    logger(`navigating to ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle0"
    });

    async function scrapeData() {
      logger(`scraping data...`);
      const results = await page.evaluate(() => {
        let data = [];
        let events = document.querySelectorAll(".hasEvent");
        events.forEach(event => {
          let date = event.getAttribute("data-fulldate");
          let id = "che" + date.split("-").join("");
          // let id = event
          //   .querySelector(".event_item")
          //   .getAttribute("data-event-id");
          let name = event.querySelector("a").innerText;
          let time = event.querySelector(".showings.time").innerText;
          let info = event.querySelector("a").href;
          data.push({ id, name, date, time, info });
        });

        return data;
      });
      return results;
    }

    async function clickNext() {
      logger(`navigating to the next page`);
      await page.click(".cal-next");
      await page.waitFor(".hasEvent");
    }

    let results = [];

    for (let i = 0; i < months; i++) {
      results.push(...(await scrapeData()));
      await clickNext();
    }

    logger(`closing browser`);
    await browser.close();

    return results;
    //
  } catch (err) {
    console.log(err);
  }
};
