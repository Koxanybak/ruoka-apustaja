import puppeteer from "puppeteer"
import { Client } from "pg"
import format from "pg-format"
import dotenv from "dotenv"
import logger from "./logger"
dotenv.config()

// scrolls down until no more stores are loaded
const scrollStoreList = async (container: puppeteer.ElementHandle<Element> | null) => {
  await container?.evaluate(node => {
    return new Promise((resolve, reject) => {
      try {
        const distance = 500
        const delay = 100
        const scrollTimeSec = 40

        console.log("Scrolling...")
        setInterval(() => {
          node.scrollBy(0, distance)
        }, delay)
        setTimeout(() => {
          resolve()
        }, scrollTimeSec*1000)
      } catch (err) {
        reject(err)
      }
    }).catch(err => {
      console.error(err)
    })
  }).catch(e => {
    console.error(e)
  })
}


// main
void (async () => {
  const browser = await puppeteer.launch({ headless: false, })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })
  await page.goto("https://www.k-ruoka.fi/kauppa")
  function describe(jsHandle: puppeteer.JSHandle) {
    return jsHandle.executionContext().evaluate(_obj => {
      // serialize |obj| however you want
      return ""
    }, jsHandle)
  }
  
  page.on("console", msg => {
    void Promise.all(msg.args().map(arg => describe(arg))).then(args => {
      console.log(msg.text(), ...args)
    })
  })

  // gets all stores
  const storeSwitchbutton = await page.$(".store-and-chain-selector__switch-icon")
  await storeSwitchbutton?.click()

  const storeButtons = await page.$(".store-selector__tabs")
  const allButtons = await storeButtons?.$$("span")
  await (allButtons ? allButtons[2].click() : Promise.resolve(null))

  const storeContainerNode = await page.waitForSelector(".store-list-container")
  await scrollStoreList(storeContainerNode)
  console.log("Scrolling done")

  // KATSO, ETTÄ NIMET OVAT UNIIKKEJA

  const storeNodes = await storeContainerNode?.$$("a")
  const stores = storeNodes ? await Promise.all(storeNodes.map(async node => {
    const infoNode = await node.$(".store-list-item__name-and-hours")
    const name = await (await infoNode?.$(":first-child"))?.evaluate(node => node.innerHTML)
    const city = await (await node.$(".store-list-item__location"))?.evaluate(node => node.innerHTML)
    return [ name ? name : "STORE_NOT_FOUND", city ? city : "CITY_NOT_FOUND" ]
  })) : []

  // saves the stores to db
  const client = new Client()
  await client.connect()

  const qText = format("INSERT INTO stores (name, city) VALUES %L ON CONFLICT (name, city) DO UPDATE SET name = EXCLUDED.name, city = EXCLUDED.city RETURNING *", stores)
  client.query(qText, (err, res) => {
    if (err) logger.error(err)
    else {
      res.rows.forEach(r => logger.info(r))
      void client.end()
    }
  })
  
  console.log(stores.length)


  await browser.close()
})()