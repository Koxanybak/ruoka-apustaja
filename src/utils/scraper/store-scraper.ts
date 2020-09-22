import puppeteer from "puppeteer"
import { Client } from "pg"
import format from "pg-format"
import logger from "../logger"
import dotenv from "dotenv"
dotenv.config()

// scrolls down until no more stores are loaded
const scrollStoreList = async (container: puppeteer.ElementHandle<Element> | null) => {
  await container?.evaluate(node => {
    return new Promise((resolve, reject) => {
      let tOut: ReturnType<typeof setTimeout> | undefined = undefined
      let timer: ReturnType<typeof setInterval> | undefined = undefined
      try {
        const distance = 500
        const delay = 100
        const scrollTimeSec = 15
        let totalHeight = 0

        console.log(node.className)
        console.log("scrollHeight:", node.scrollHeight)
        console.log("scrollHeight:", node.scrollHeight)
        console.log("clientHeight:", node.clientHeight)
        console.log("ISSCROLLABLE:", node.scrollHeight > node.clientHeight)

        timer = setInterval(() => {
          const scrollHeight = node.scrollHeight
          node.scrollBy(0, distance)
          totalHeight += distance

          console.log("totalHeight:", totalHeight)
          console.log("scrollHeight:", scrollHeight)
          console.log("clientHeight:", node.clientHeight)

          console.log("innerHTML:", node.className)

          if (totalHeight >= scrollHeight) {
            console.log("WAS BIGGER")
            totalHeight = scrollHeight
            if (!tOut) {
              console.log("TIMEOUT SET")
              tOut = setTimeout(() => {
                if (timer) {
                  clearInterval(timer)
                }
                resolve()
              }, scrollTimeSec*1000)
            }
          } else {
            console.log("TIMEOUT CLEARED")
            if (tOut) {
              clearTimeout(tOut)
            }
          }
        }, delay)
      } catch (err) {
        if (timer) {
          clearInterval(timer)
        }
        if (tOut) {
          clearTimeout(tOut)
        }
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
  const browser = await puppeteer.launch({ headless: true, })
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })
  await page.goto("https://www.k-ruoka.fi/kauppa")

  page.on("console", consoleObj => console.log(consoleObj.text()))

  // gets all stores
  const storeSwitchbutton = await page.$(".store-and-chain-selector__switch-icon")
  await storeSwitchbutton?.click()

  const storeButtons = await page.$(".store-selector__tabs")
  const allButtons = await storeButtons?.$$("span")
  await (allButtons ? allButtons[2].click() : Promise.resolve(null))

  const storeContainerNode = await page.waitForSelector(".store-list-container")
  await scrollStoreList(storeContainerNode)
  console.log("Scrolling done")

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
    if (err) {
      logger.error(err)
      throw err
    } else {
      res.rows.forEach(r => logger.info(r))
      void client.end()
    }
  })
  
  console.log(stores.length)


  await browser.close()
})()