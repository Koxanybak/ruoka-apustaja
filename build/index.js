"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
// scrolls down until no more stores are loaded
const scrollStoreList = (container) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(!container);
    yield (container === null || container === void 0 ? void 0 : container.evaluate(node => {
        console.log("Evaluation started");
        return new Promise((resolve, reject) => {
            try {
                const distance = 500;
                const delay = 100;
                const scrollTimeSec = 50;
                /* let timeScrolled = 0 */
                console.log("Scrolling...");
                setInterval(() => {
                    node.scrollBy(0, distance);
                }, delay);
                setTimeout(() => {
                    resolve();
                }, scrollTimeSec * 1000);
            }
            catch (err) {
                reject(err);
            }
        }).catch(err => {
            console.error(err);
        });
    }).catch(e => {
        console.error(e);
    }));
});
// main
void (() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield puppeteer_1.default.launch();
    const page = yield browser.newPage();
    yield page.setViewport({
        width: 1920,
        height: 1080,
    });
    yield page.goto("https://www.k-ruoka.fi/kauppa");
    function describe(jsHandle) {
        return jsHandle.executionContext().evaluate(obj => {
            // serialize |obj| however you want
            return "beautiful object of type " + (typeof obj);
        }, jsHandle);
    }
    page.on("console", msg => {
        void Promise.all(msg.args().map(arg => describe(arg))).then(args => {
            console.log(msg.text(), ...args);
        });
    });
    // gets all stores
    const storeSwitchbutton = yield page.$(".store-and-chain-selector__switch-icon");
    yield (storeSwitchbutton === null || storeSwitchbutton === void 0 ? void 0 : storeSwitchbutton.click());
    const storeButtons = yield page.$(".store-and-chain-selector__switch-icon");
    const allButton = (yield (storeButtons === null || storeButtons === void 0 ? void 0 : storeButtons.$$eval("span", nodes => nodes.find(n => n.innerHTML === "Kaikki"))));
    yield (allButton === null || allButton === void 0 ? void 0 : allButton.click());
    yield page.screenshot({ path: "screenshot1.png" });
    const storeContainerNode = yield page.waitForSelector(".store-list-container");
    console.log("Scrolling starts");
    yield scrollStoreList(storeContainerNode);
    console.log("Scrolling done");
    const storeNodes = yield (storeContainerNode === null || storeContainerNode === void 0 ? void 0 : storeContainerNode.$$("a"));
    const stores = storeNodes ? yield Promise.all(storeNodes.map((node) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const infoNode = yield node.$(".store-list-item__name-and-hours");
        return (_a = (yield (infoNode === null || infoNode === void 0 ? void 0 : infoNode.$(":first-child")))) === null || _a === void 0 ? void 0 : _a.evaluate(node => node.innerHTML);
    }))) : [];
    stores.forEach(s => console.log(s));
    // tries to find one store
    const inputField = yield storeContainerNode.$(".clearable-input store-selector__search-input");
    yield (inputField === null || inputField === void 0 ? void 0 : inputField.click());
    yield page.screenshot({ path: "screenshot2.png" });
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
    yield browser.close();
}))();
//# sourceMappingURL=index.js.map