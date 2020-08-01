import puppeteer from "puppeteer"
import { ProductScrapeError } from "../errors"
import { ProductEntry } from "../../types"

// scrolls down until no more products are loaded
const scrollProductList = async (container: puppeteer.ElementHandle<Element> | null) => {
  if (!container) {
    throw new ProductScrapeError("Unable to get products")
  }

  await container?.evaluate(node => {
    return new Promise((resolve, reject) => {
      let tOut: ReturnType<typeof setTimeout> | undefined = undefined
      let timer: ReturnType<typeof setInterval> | undefined = undefined
      try {
        const distance = 500
        const delay = 100
        const scrollTimeSec = 6
        let totalHeight = 0

        /* console.log(node.className)
        console.log("scrollHeight:", node.scrollHeight)
        console.log("scrollHeight:", node.scrollHeight)
        console.log("clientHeight:", node.clientHeight)
        console.log("ISSCROLLABLE:", node.scrollHeight > node.clientHeight) */

        if (node.scrollHeight < node.clientHeight || (node.scrollHeight === 0 || node.clientHeight === 0)) {
          throw new Error("Unable to get products")
        }

        timer = setInterval(() => {
          const scrollHeight = node.scrollHeight
          node.scrollBy(0, distance)
          totalHeight += distance

          /* console.log("totalHeight:", totalHeight)
          console.log("scrollHeight:", scrollHeight)
          console.log("clientHeight:", node.clientHeight) */

          if (node.scrollHeight === 0 || node.clientHeight === 0) {
            throw new Error("Unable to get products")
          }

          if (totalHeight >= scrollHeight) {
            /* console.log("WAS BIGGER") */
            totalHeight = scrollHeight
            if (!tOut) {
              /* console.log("TIMEOUT SET") */
              tOut = setTimeout(() => {
                if (timer) {
                  clearInterval(timer)
                }
                resolve()
              }, scrollTimeSec*1000)
            }
          } else {
            /* console.log("TIMEOUT CLEARED") */
            if (tOut) {
              clearTimeout(tOut)
              tOut = undefined
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
    }).catch((err: Error) => {
      throw new Error(err.message)
    })
  }).catch((err: Error) => {
    throw new ProductScrapeError(err.message)
  })
}

// gets the name of the product node
const getProductDetails = async (productNode: puppeteer.ElementHandle<Element>): Promise<Omit<ProductEntry, "storeID" | "id" | "link">> => {
  return await productNode.evaluate(node => {
    const name = node.querySelector("div.product-result-name > div > div.text-ellipsis.text-ellipsis__2-lines.product-name > span")?.innerHTML
    const imgSrc = node.querySelector("div.product-result-image > div > img")?.getAttribute("src")

    let intPart = node.querySelector("div.product-result-price > span.price > span.price-integer-part")?.innerHTML
    intPart = intPart ? intPart : ""
    let decPart = node.querySelector("div.product-result-price > span.price > span.price-fractional-part")?.innerHTML
    decPart = decPart ? decPart : ""
    const price = parseFloat(intPart + "." + decPart)

    const pricePerUnitStr = document.querySelector("div.product-result-price > span.reference")?.childNodes[0].nodeValue
    const decimalSep = pricePerUnitStr?.replace(",", ".")
    const pricePerUnit = parseFloat(decimalSep ? decimalSep : "")
    const unit = document.querySelector("div.product-result-price > span.reference > span:nth-child(2)")?.innerHTML

    return {
      name: name ? name : "",
      price,
      pricePerUnit: pricePerUnit ? pricePerUnit : null,
      unit: unit ? unit : null,
      imgSrc: imgSrc ? imgSrc : "/assets/ei-tuotekuvaa.svg",
    }
  })
}
// gets the name of the category node
const getCategoryName = async (page: puppeteer.Page): Promise<string | undefined> => {
  const name = await page.$("#app > section > section > div.shopping-list-container > div.shopping-list-items-container > div > div > div > div > div > div.product-search-query > h1 > span > span")
  return await name?.evaluate(node => {
    return node.innerHTML
  })
}

//switches store, requires to have the switch button enabled
const switchStore = async (page: puppeteer.Page, name: string): Promise<void> => {
  const storeSwitchbutton = await page.$(".store-and-chain-selector__switch-icon")
  await storeSwitchbutton?.click()

  const storeButtons = await page.$(".store-selector__tabs")
  if (!storeButtons) {
    throw new Error("Unable to switch stores")
  }
  const allButtons = await storeButtons?.$$("span")
  await (allButtons ? allButtons[2].click() : Promise.resolve(null))

  await (await page.$("#store-selector-modal > div.all-stores-tab > form > div > div > input[type=text]"))?.type(name)

  await page.waitFor(2*1000)

  await (await page.waitForSelector("#store-selector-modal > div.all-stores-tab > div > div > a > div.store-list-item__name-and-hours > div:nth-child(1)")).click()
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

  page.on("console", consoleObj => console.log(consoleObj.text()))

  await switchStore(page, "K-Market Herkkupuoti").catch((err: Error) => { throw new Error(err.message) })
  await page.waitFor(2*1000)

  // gets the current store
  const storeNode = await page.$(".store-and-chain-selector")
  const store = await storeNode?.evaluate(node => node.childNodes[node.childNodes.length - 1].nodeValue)
  /* const cleanStore = store ? store : "" */

  // goes to the product page and gets the categories
  const productButton = await page.$(".product-search-category-button")
  await productButton?.click()
  /* console.log("productButton exists:", !!productButton) */
  await page.waitForSelector(".ProductCategoriesDesktop__categories__category")
  let categoryNodes = await page.$$(".ProductCategoriesDesktop__categories__category")

  /* console.log(categoryNodes.length) */

  // goes through all the categories and gets their products
  const products: Omit<ProductEntry, "storeID" | "id" | "link">[] = []
  const failedCategories: (string | undefined)[] = []
  const errors: string[] = []

  for (let i = categoryNodes.length - 1; i > 0; i--) {
    // clicks a category and scrolls down the product list
    categoryNodes = await page.$$(".ProductCategoriesDesktop__categories__category")
    await categoryNodes[i].click()
    const showAllButton = await page.$(".ProductCategoriesDesktop__sub-categories__category.ProductCategoriesDesktop__sub-categories__category__show-all")
    await showAllButton?.click()
    const productContainer = await page.$(".product-search-result-list.shopping-list-side-panel-tab-content")
    await page.waitFor(1.5*1000)

    // scrolling
    await scrollProductList(productContainer).catch(async (err: Error) => {
      console.error(err.message)
      errors.push(err.message)
      if (err instanceof ProductScrapeError) {
        const catName = await getCategoryName(page)
        failedCategories.push(catName)
      }
    })

    // get the products
    const productNodes = await productContainer?.$$(".product-result-item")
    const cleanedNodes = productNodes ? productNodes : []
    const details = (await Promise.all(cleanedNodes.map(node => getProductDetails(node)))).map(p => ({ ...p }))
    products.push(...details)

    // goes back to the category page
    const productButton = await page.$(".product-search-category-button")
    await productButton?.click()
    await page.waitForSelector(".ProductCategoriesDesktop__categories__category")
  }

  // makes sure the products are unique
  const cleanedProducts = products.filter(p => p.name !== "" && !!p.price)
  const uniqueMap = new Map<string, string>()
  const uniqueProducts: Omit<ProductEntry, "storeID" | "id" | "link">[] = []
  const duplicateProducts: Omit<ProductEntry, "storeID" | "id" | "link">[] = []
  cleanedProducts.forEach(p => {
    if (!uniqueMap.get(p.name)) uniqueProducts.push(p)
    else duplicateProducts.push(p)
  })

  // logs info
  uniqueProducts.forEach(p => console.log(p))
  duplicateProducts.forEach(p => console.log(p))
  console.log({store})
  console.log({failedCategories})
  console.log({errors})


  await browser.close()
})()