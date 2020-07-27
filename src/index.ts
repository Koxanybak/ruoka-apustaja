import puppeteer from "puppeteer"

// scrolls down until no more stores are loaded
const scrollStoreList = async (container: puppeteer.ElementHandle<Element> | null) => {
  await container?.evaluate(node => {
    return new Promise((resolve, reject) => {
      try {
        const distance = 500
        const delay = 100
        const scrollTimeSec = 50
        /* let timeScrolled = 0 */

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
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({
    width: 1920,
    height: 1080,
  })
  await page.goto("https://www.k-ruoka.fi/kauppa")
  function describe(jsHandle: puppeteer.JSHandle) {
    return jsHandle.executionContext().evaluate(obj => {
      // serialize |obj| however you want
      return "beautiful object of type " + (typeof obj)
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
  console.log(allButtons)
  /* const buttonTexts = allButtons ? await Promise.all(allButtons.map(async node => {
    return node.evaluate(node => node.innerHTML)
  })) : []
  await (buttonTexts?.find(txt => txt === "Kaikki")?.click() */
  await (allButtons ? allButtons[2].click() : Promise.resolve(null))
  await page.screenshot({path: "screenshots/screenshot1.png"})

  const storeContainerNode = await page.waitForSelector(".store-list-container")
  await scrollStoreList(storeContainerNode)
  console.log("Scrolling done")

  const storeNodes = await storeContainerNode?.$$("a")
  const stores = storeNodes ? await Promise.all(storeNodes.map(async node => {
    const infoNode = await node.$(".store-list-item__name-and-hours")
    return (await infoNode?.$(":first-child"))?.evaluate(node => node.innerHTML)
  })) : []

  stores.forEach(s => console.log(s))

  // tries to find one store
  const inputField = await storeContainerNode.$(".clearable-input store-selector__search-input")
  await inputField?.click()

  await page.screenshot({path: "screenshots/screenshot2.png"})

  /* // gets the current store
  const storeNode = await page.$(".store-and-chain-selector")
  const store = await (await storeNode?.getProperty("innerText"))?.jsonValue()

  // product scraping test
  const products = await page.$$(".product-result-item")
  const names = await Promise.all(products.map(async el => {
    const nameEl = await el.$(".product-result-name")
    const textEl = nameEl ? await nameEl.$("span") : null
    return textEl ? await textEl.evaluate(node => {
      return node.innerHTML
    }) : null
  }))

  console.log(store)
  console.log(products.length)
  names.forEach(p => console.log(p)) */


  await browser.close()
})()