import puppeteer from "puppeteer"

// scrolls down until no more products are loaded
const scrollProductList = async (container: puppeteer.ElementHandle<Element> | null | undefined) => {
  if (!container) {
    throw new Error("Container missing, cannot scroll")
  }

  await container?.evaluate(node => {
    return new Promise((resolve, reject) => {
      try {
        const distance = 500
        const delay = 100
        const scrollTimeSec = 15
        let totalHeight = 0
        let tOut: ReturnType<typeof setTimeout>

        setInterval(() => {
          const scrollHeight = node.scrollHeight
          node.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= scrollHeight) {
            totalHeight = scrollHeight
            if (!tOut) {
              tOut = setTimeout(() => {
                resolve()
              }, scrollTimeSec*1000)
            }
          } else {
            clearTimeout(tOut)
          }
        }, delay)
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

// gets the name of the product node
const getName = (productNode: puppeteer.ElementHandle<Element>) => {
  return productNode.evaluate(node => {
    // CONTINUE WITH GETTING THE NAME OF THE PRODUCT AND THE CONTINUE WITH THE SCRAPING
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

  // gets the current store
  const storeNode = await page.$(".store-and-chain-selector")
  const store = await (await storeNode?.getProperty("innerText"))?.jsonValue()

  // goes to the product page and gets the categories
  const productButton = await page.$(".product-search-category-button kcm open")
  await productButton?.click()
  let categoryNodes = await page.$$(".ProductCategoriesDesktop__categories__category")

  // goes through all the categories and gets their products
  categoryNodes = categoryNodes.filter(async node => await node.evaluate(node => node.id) !== "suosittelemme")
  const productNames: string[] = []

  for (let i = 0; i < categoryNodes.length; i++) {
    await categoryNodes[i].click()
    await (await page.$(".ProductCategoriesDesktop__sub-categories__category ProductCategoriesDesktop__sub-categories__category__show-all"))?.click()
    const productContainer = await page.$(".product-grid")
    await scrollProductList(productContainer)
    const productNodes = await productContainer?.$$(".product-result-item")
  }

  console.log(store)


  await browser.close()
})()