// Wudhoh Multi-language Cart Scraper
// API: getCartProducts

console.log("Wudhoh content.js loaded");


// =====================================================
// 1. Page Detection
// =====================================================

function isCartOrCheckoutPage() {

    const url = window.location.href.toLowerCase();

    const cartKeywords = [
        "cart",
        "checkout",
        "basket",
        "bag",
        "shopping-cart",
        "shopping_cart",
        "my-bag",
        "mybag",
        "order",
        "purchase",
        "summary",
        "view"
    ];

    return cartKeywords.some(keyword =>
        url.includes(keyword)
    );
}


// =====================================================
// 2. Text Helpers
// =====================================================

function normalizeText(text) {

    return (text || "")
        .replace(/\s+/g, " ")
        .trim();
}


function normalizeNumber(text) {

    if (!text) {
        return "";
    }

    const arabicNumbers = "٠١٢٣٤٥٦٧٨٩";
    const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";

    return text
        .split("")
        .map(char => {

            const arabicIndex =
                arabicNumbers.indexOf(char);

            if (arabicIndex !== -1) {
                return arabicIndex;
            }

            const persianIndex =
                persianNumbers.indexOf(char);

            if (persianIndex !== -1) {
                return persianIndex;
            }

            return char;
        })
        .join("");
}


function getElementText(element) {

    if (!element) {
        return "";
    }

    return normalizeText(
        element.innerText ||
        element.textContent ||
        ""
    );
}


// =====================================================
// 3. Suggested / Recommendation Detection
// =====================================================

function isSuggestedSection(element) {

    if (!element) {
        return false;
    }

    const text =
        getElementText(element).toLowerCase();

    const className =
        typeof element.className === "string"
            ? element.className.toLowerCase()
            : "";

    const id =
        (element.id || "").toLowerCase();

    const keywords = [

        // English
        "recommend",
        "recommended",
        "related",
        "upsell",
        "cross-sell",
        "crosssell",
        "suggested",
        "suggestion",
        "you may also like",
        "you might also like",
        "frequently bought",
        "complete the look",
        "similar products",

        // Arabic
        "قد يعجبك",
        "قد يعجبك أيضاً",
        "قد يعجبك ايضا",
        "منتجات مقترحة",
        "منتجات مشابهة",
        "مقترحة لك",
        "أضفها لسلتك",
        "اضفها لسلتك",
        "أكمل الإطلالة",
        "منتجات ذات صلة",
        "منتجات قد تعجبك"
    ];

    return keywords.some(keyword =>
        text.includes(keyword) ||
        className.includes(keyword) ||
        id.includes(keyword)
    );
}


// =====================================================
// 4. Quantity
// =====================================================

function getQuantity(container) {

    if (!container) {
        return "1";
    }


    const quantityInput =
        container.querySelector(
            'input[type="number"], ' +
            'input[name*="quantity" i], ' +
            'input[name*="qty" i], ' +
            'input[class*="quantity" i], ' +
            'input[class*="qty" i]'
        );


    if (quantityInput) {

        const value =
            quantityInput.value ||
            quantityInput.getAttribute("value") ||
            "";

        if (value.trim()) {
            return normalizeNumber(value.trim());
        }
    }


    const quantityElements =
        container.querySelectorAll(
            '[class*="quantity" i], ' +
            '[class*="qty" i], ' +
            '[aria-label*="quantity" i], ' +
            '[aria-label*="qty" i]'
        );


    for (const element of quantityElements) {

        const text =
            normalizeNumber(
                getElementText(element)
            );

        const match =
            text.match(
                /(?:qty|quantity|الكمية)\s*[:\-]?\s*(\d+)/i
            );

        if (match) {
            return match[1];
        }


        if (/^\d+$/.test(text)) {
            return text;
        }
    }


    const text =
        normalizeNumber(
            getElementText(container)
        );


    const patterns = [

        /(?:qty|quantity)\s*[:\-]?\s*(\d+)/i,

        /(?:الكمية)\s*[:\-]?\s*(\d+)/i,

        /(?:الكمية)\s+(\d+)/i
    ];


    for (const pattern of patterns) {

        const match =
            text.match(pattern);

        if (match) {
            return match[1];
        }
    }


    return "1";
}


// =====================================================
// 5. Price
// =====================================================

function getPrice(container) {

    if (!container) {
        return "";
    }


    // Zid / Treat first
    const zidPrice =
        container.querySelector(
            ".cart-product-price-each"
        );


    if (zidPrice) {

        const text =
            getElementText(zidPrice);

        if (text) {
            return text;
        }
    }


    const priceElements =
        container.querySelectorAll(
            '[class*="price" i], ' +
            '[class*="amount" i], ' +
            '[class*="cost" i], ' +
            '[data-price]'
        );


    for (const element of priceElements) {

        const text =
            getElementText(element);

        if (
            text &&
            /[0-9٠-٩]/.test(text)
        ) {
            return text;
        }
    }


    const text =
        getElementText(container);


    const pricePatterns = [

        /(?:SAR|ر\.س|ريال|SR)\s*[\d٠-٩,]+(?:\.\d+)?/i,

        /[\d٠-٩,]+(?:\.\d+)?\s*(?:SAR|ر\.س|ريال|SR)/i,

        /\$\s*[\d,]+(?:\.\d+)?/,

        /€\s*[\d,]+(?:\.\d+)?/,

        /£\s*[\d,]+(?:\.\d+)?/
    ];


    for (const pattern of pricePatterns) {

        const match =
            text.match(pattern);

        if (match) {
            return match[0];
        }
    }


    return "";
}


// =====================================================
// 6. Product Image
// =====================================================

function getProductImage(container) {

    if (!container) {
        return "";
    }


    // Zid / Treat
    const zidImage =
        container.querySelector(
            ".cart-product-image"
        );


    if (zidImage) {

        return (
            zidImage.currentSrc ||
            zidImage.src ||
            zidImage.getAttribute("data-src") ||
            zidImage.getAttribute("src") ||
            ""
        );
    }


    const images =
        Array.from(
            container.querySelectorAll("img")
        );


    if (!images.length) {
        return "";
    }


    for (const img of images) {

        const src =
            img.currentSrc ||
            img.src ||
            img.getAttribute("data-src") ||
            img.getAttribute("src");


        if (!src) {
            continue;
        }


        const alt =
            (img.alt || "").toLowerCase();


        if (
            alt.includes("logo") ||
            alt.includes("icon")
        ) {
            continue;
        }


        return src;
    }


    return "";
}


// =====================================================
// 7. Product Title
// =====================================================

function getProductTitle(container) {

    if (!container) {
        return "";
    }


    // -------------------------------------------------
    // Zid / Treat specific title
    // -------------------------------------------------

    const zidTitle =
        container.querySelector(
            ".cart-product-col-details h1 a, " +
            ".item-name-price h1 a"
        );


    if (zidTitle) {

        const text =
            normalizeText(
                getElementText(zidTitle)
            );

        if (text) {
            return text;
        }
    }


    const forbiddenWords = [

        // Arabic
        "أضفها لسلتك",
        "اضفها لسلتك",
        "إضافة للسلة",
        "اضافة للسلة",
        "أضف للسلة",
        "اضف للسلة",
        "تواصل معنا",
        "البحث",
        "السلة",
        "حقيبة التسوق",
        "الرئيسية",
        "مساعدة",
        "حذف",
        "إزالة",
        "الكمية",

        // English
        "add to cart",
        "add to bag",
        "shopping cart",
        "shopping bag",
        "cart",
        "checkout",
        "home",
        "search",
        "help",
        "remove",
        "delete",
        "qty",
        "quantity"
    ];


    // -------------------------------------------------
    // Headings
    // -------------------------------------------------

    const headingElements =
        container.querySelectorAll(
            "h1, h2, h3, h4, h5, h6"
        );


    for (const element of headingElements) {

        const text =
            normalizeText(
                getElementText(element)
            );


        if (
            isValidProductTitle(
                text,
                forbiddenWords
            )
        ) {
            return text;
        }
    }


    // -------------------------------------------------
    // Title/name classes
    // -------------------------------------------------

    const titleElements =
        container.querySelectorAll(
            '[class*="product-title" i], ' +
            '[class*="product_name" i], ' +
            '[class*="product-name" i], ' +
            '[class*="title" i], ' +
            '[class*="name" i]'
        );


    for (const element of titleElements) {

        const text =
            normalizeText(
                getElementText(element)
            );


        if (
            isValidProductTitle(
                text,
                forbiddenWords
            )
        ) {
            return text;
        }
    }


    // -------------------------------------------------
    // Links
    // -------------------------------------------------

    const links =
        container.querySelectorAll("a");


    for (const link of links) {

        const text =
            normalizeText(
                getElementText(link)
            );


        if (
            isValidProductTitle(
                text,
                forbiddenWords
            )
        ) {
            return text;
        }
    }


    return "";
}


function isValidProductTitle(
    text,
    forbiddenWords
) {

    if (!text) {
        return false;
    }


    if (text.length < 3) {
        return false;
    }


    if (text.length > 150) {
        return false;
    }


    const lower =
        text.toLowerCase();


    if (
        forbiddenWords.some(word =>
            lower.includes(
                word.toLowerCase()
            )
        )
    ) {
        return false;
    }


    if (
        /^[\d\s.,]+$/.test(text)
    ) {
        return false;
    }


    return true;
}


// =====================================================
// 8. Remove Button
// =====================================================

function hasRemoveControl(container) {

    if (!container) {
        return false;
    }


    // Zid / Treat
    const zidRemove =
        container.querySelector(
            '[onclick*="cartProductRemove" i], ' +
            '[data-cart-product-id]'
        );


    if (zidRemove) {
        return true;
    }


    const text =
        getElementText(container)
            .toLowerCase();


    const removeKeywords = [

        "remove",
        "delete",
        "حذف",
        "إزالة",
        "ازالة"
    ];


    if (
        removeKeywords.some(keyword =>
            text.includes(keyword)
        )
    ) {
        return true;
    }


    const controls =
        container.querySelectorAll(
            "button, " +
            "[role='button'], " +
            "a"
        );


    for (const control of controls) {

        const controlText =
            getElementText(control)
                .toLowerCase();


        const aria =
            (
                control.getAttribute(
                    "aria-label"
                ) ||
                ""
            ).toLowerCase();


        if (
            removeKeywords.some(keyword =>
                controlText.includes(keyword) ||
                aria.includes(keyword)
            )
        ) {
            return true;
        }
    }


    return false;
}


// =====================================================
// 9. Find Cart Container
// =====================================================

function findCartContainer() {

    const selectors = [

        // Generic
        "[data-cart]",
        "[data-cart-container]",
        "[data-testid*='cart' i]",
        "[data-testid*='bag' i]",

        ".cart",
        ".cart-page",
        ".cart-container",
        ".cart-content",
        ".shopping-cart",
        ".shopping-bag",
        ".basket",
        ".bag",

        // Zid
        ".cart-products",
        ".cart-products-list",

        // IDs
        "#cart",
        "#cart-page",
        "#shopping-cart",
        "#shopping-bag",
        "#basket",
        "#bag"
    ];


    for (const selector of selectors) {

        const element =
            document.querySelector(selector);


        if (element) {

            console.log(
                "✅ Wudhoh: Cart container selector:",
                selector
            );

            return element;
        }
    }


    // -------------------------------------------------
    // Important Zid fallback
    // -------------------------------------------------

    const zidProduct =
        document.querySelector(
            ".item-img-name-price"
        );


    if (zidProduct) {

        console.log(
            "✅ Wudhoh: Zid product found directly."
        );


        let parent =
            zidProduct.parentElement;


        // Find a useful parent containing all cart items
        for (
            let i = 0;
            i < 5 && parent;
            i++
        ) {

            const count =
                parent.querySelectorAll(
                    ".item-img-name-price"
                ).length;


            if (count >= 1) {

                console.log(
                    "✅ Wudhoh: Using Zid parent container."
                );

                return parent;
            }


            parent =
                parent.parentElement;
        }
    }


    return null;
}


// =====================================================
// 10. Known Cart Item Selectors
// =====================================================

function getKnownCartItems(cartContainer) {

    if (!cartContainer) {
        return [];
    }


    const selectors = [

        // Generic
        ".cart-item",
        ".cart__item",
        "[data-cart-item]",
        ".basket-item",
        ".shopping-bag-item",
        ".shopping-cart-item",
        ".cart-product",
        ".cart-product-item",
        ".c-cart-product-tile",

        // =============================================
        // ZID / TREAT
        // =============================================

        ".item-img-name-price",

        // Data/Test IDs
        "[data-testid*='cart-item' i]",
        "[data-testid*='bag-item' i]",
        "[data-testid*='product-item' i]",

        // Generic matching
        "div[class*='cart-item' i]",
        "div[class*='cart_product' i]",
        "div[class*='cart-product' i]",
        "li[class*='cart-item' i]"
    ];


    const items =
        Array.from(
            cartContainer.querySelectorAll(
                selectors.join(",")
            )
        );


    console.log(
        "🛒 Wudhoh: Known selector matches:",
        items.length
    );


    return removeNestedDuplicates(items);
}


// =====================================================
// 11. Generic Product Detection
// =====================================================

function getGenericCartItems(cartContainer) {

    if (!cartContainer) {
        return [];
    }


    const allElements =
        Array.from(
            cartContainer.querySelectorAll(
                "article, li, section, div"
            )
        );


    const candidates = [];


    for (const element of allElements) {

        const text =
            getElementText(element);


        if (
            !text ||
            text.length < 5
        ) {
            continue;
        }


        const images =
            element.querySelectorAll("img");


        if (
            images.length === 0
        ) {
            continue;
        }


        const title =
            getProductTitle(element);


        if (!title) {
            continue;
        }


        const price =
            getPrice(element);


        const quantity =
            getQuantity(element);


        const hasRemove =
            hasRemoveControl(element);


        let score = 0;


        if (title) {
            score += 3;
        }


        if (price) {
            score += 2;
        }


        if (quantity) {
            score += 2;
        }


        if (hasRemove) {
            score += 4;
        }


        if (images.length > 0) {
            score += 1;
        }


        if (score >= 7) {

            candidates.push({

                element: element,

                score: score
            });
        }
    }


    candidates.sort(
        (a, b) =>
            b.score - a.score
    );


    const finalItems = [];


    for (const candidate of candidates) {

        const alreadyIncluded =
            finalItems.some(existing =>

                existing.element.contains(
                    candidate.element
                ) ||

                candidate.element.contains(
                    existing.element
                )
            );


        if (!alreadyIncluded) {

            finalItems.push(
                candidate
            );
        }
    }


    return finalItems.map(
        candidate =>
            candidate.element
    );
}


// =====================================================
// 12. Remove Nested Duplicates
// =====================================================

function removeNestedDuplicates(items) {

    const result = [];


    for (const item of items) {

        const duplicate =
            result.some(existing =>

                existing.contains(item) ||

                item.contains(existing)
            );


        if (!duplicate) {

            result.push(item);
        }
    }


    return result;
}


// =====================================================
// 13. Extract Product
// =====================================================

function extractProduct(item) {

    if (!item) {

        console.log(
            "❌ Wudhoh: Empty product element."
        );

        return null;
    }


    // -------------------------------------------------
    // Known cart items must NOT be rejected because
    // a parent area contains recommendation text.
    // -------------------------------------------------

    const isKnownCartItem =
        item.matches(
            ".item-img-name-price, " +
            ".cart-item, " +
            ".cart__item, " +
            "[data-cart-item], " +
            ".basket-item, " +
            ".shopping-bag-item, " +
            ".shopping-cart-item, " +
            ".cart-product, " +
            ".cart-product-item, " +
            ".c-cart-product-tile"
        );


    if (
        !isKnownCartItem &&
        isSuggestedSection(item)
    ) {

        console.log(
            "⚠️ Wudhoh: Suggested product ignored."
        );

        return null;
    }


    const title =
        getProductTitle(item);


    console.log(
        "📝 Wudhoh title:",
        title
    );


    if (!title) {

        console.log(
            "❌ Wudhoh: Product title not found:",
            item
        );

        return null;
    }


    const price =
        getPrice(item);


    console.log(
        "💰 Wudhoh price:",
        price
    );


    const quantity =
        getQuantity(item);


    console.log(
        "🔢 Wudhoh quantity:",
        quantity
    );


    const imageURL =
        getProductImage(item);


    console.log(
        "🖼️ Wudhoh image:",
        imageURL
    );


    if (
        !imageURL &&
        !price
    ) {

        console.log(
            "❌ Wudhoh: Product has no image or price."
        );

        return null;
    }


    const product = {

        title: title,

        price: price,

        quantity:
            quantity || "1",

        imageURL: imageURL,

        storeName:
            document.title ||
            "متجر إلكتروني",

        returnWindowDays: null,

        exchangeWindowDays: null
    };


    console.log(
        "✅ Wudhoh: Extracted product:",
        product
    );


    return product;
}


// =====================================================
// 14. Direct Zid Detection
// =====================================================

function getZidCartItems() {

    const items =
        Array.from(
            document.querySelectorAll(
                ".item-img-name-price"
            )
        );


    console.log(
        "🧪 Wudhoh: Direct Zid items:",
        items.length
    );


    return items;
}


// =====================================================
// 15. Main Cart Extraction
// =====================================================

function getLiveCartProducts() {

    console.log(
        "================================"
    );

    console.log(
        "🟢 Wudhoh: Starting cart scan..."
    );


    console.log(
        "🌐 Wudhoh URL:",
        window.location.href
    );


    // -------------------------------------------------
    // Debug: check Zid/Treat immediately
    // -------------------------------------------------

    const zidItems =
        getZidCartItems();


    console.log(
        "🧪 Zid items on page:",
        zidItems.length
    );


    // -------------------------------------------------
    // IMPORTANT:
    // If Zid items exist, use them DIRECTLY.
    // Do not depend on cart container detection.
    // -------------------------------------------------

    let cartItems = [];


    if (zidItems.length > 0) {

        console.log(
            "🎯 Wudhoh: Zid/Treat cart detected."
        );


        cartItems =
            zidItems;

    } else {

        // ---------------------------------------------
        // URL detection is only informational
        // ---------------------------------------------

        if (
            isCartOrCheckoutPage()
        ) {

            console.log(
                "✅ Wudhoh: Cart/checkout URL detected."
            );

        } else {

            console.log(
                "⚠️ Wudhoh: URL is not recognized as cart, continuing anyway."
            );
        }


        // ---------------------------------------------
        // Find cart container
        // ---------------------------------------------

        let cartContainer =
            findCartContainer();


        if (!cartContainer) {

            console.log(
                "⚠️ Wudhoh: Cart container not found."
            );


            cartContainer =
                document.querySelector("main") ||
                document.querySelector(
                    '[role="main"]'
                ) ||
                document.body;


            console.log(
                "🔄 Wudhoh: Using fallback container:",
                cartContainer
            );

        } else {

            console.log(
                "✅ Wudhoh: Cart container found:",
                cartContainer
            );
        }


        // ---------------------------------------------
        // Known selectors inside container
        // ---------------------------------------------

        cartItems =
            getKnownCartItems(
                cartContainer
            );


        console.log(
            "🛒 Wudhoh: Known cart items:",
            cartItems.length
        );


        // ---------------------------------------------
        // Known selectors on full page
        // ---------------------------------------------

        if (
            cartItems.length === 0 &&
            cartContainer !== document.body
        ) {

            console.log(
                "🔄 Wudhoh: Trying known selectors on document.body..."
            );


            cartItems =
                getKnownCartItems(
                    document.body
                );


            console.log(
                "🌍 Wudhoh: Full-page known items:",
                cartItems.length
            );
        }


        // ---------------------------------------------
        // Generic detection
        // ---------------------------------------------

        if (
            cartItems.length === 0
        ) {

            console.log(
                "🔍 Wudhoh: Trying generic detection..."
            );


            cartItems =
                getGenericCartItems(
                    cartContainer
                );


            console.log(
                "🔎 Wudhoh: Generic items:",
                cartItems.length
            );
        }


        // ---------------------------------------------
        // Full page generic fallback
        // ---------------------------------------------

        if (
            cartItems.length === 0 &&
            cartContainer !== document.body
        ) {

            console.log(
                "🔄 Wudhoh: Trying generic full-page scan..."
            );


            cartItems =
                getGenericCartItems(
                    document.body
                );


            console.log(
                "🌍 Wudhoh: Full-page generic items:",
                cartItems.length
            );
        }
    }


    // -------------------------------------------------
    // Extract Product Objects
    // -------------------------------------------------

    console.log(
        "📦 Wudhoh: Elements to extract:",
        cartItems.length
    );


    const products = [];


    for (const item of cartItems) {

        const product =
            extractProduct(item);


        if (product) {

            products.push(
                product
            );
        }
    }


    // -------------------------------------------------
    // Remove duplicates
    // -------------------------------------------------

    const uniqueProducts =
        Array.from(

            new Map(

                products.map(product => [

                    (
                        product.title +
                        "|" +
                        product.price +
                        "|" +
                        product.imageURL
                    ).toLowerCase(),

                    product
                ])

            ).values()
        );


    // -------------------------------------------------
    // Final Debug
    // -------------------------------------------------

    if (
        uniqueProducts.length === 0
    ) {

        console.log(
            "❌ Wudhoh: No cart products detected."
        );

    } else {

        console.log(
            `✅ Wudhoh: ${uniqueProducts.length} product(s) detected.`
        );
    }


    console.log(
        "🛍️ Wudhoh FINAL PRODUCTS:",
        uniqueProducts
    );


    console.log(
        "================================"
    );


    return uniqueProducts;
}
// =====================================================
// Wudhoh Policy Agent
// =====================================================

async function analyzeProductWithAgent(
    productName,
    policyText
) {

    try {

        console.log(
            "🤖 Wudhoh: Sending product to Policy Agent:",
            productName
        );


        const response = await fetch(
            "http://127.0.0.1:8000/analyze",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    product_name:
                        productName,

                    policy_text:
                        policyText

                })
            }
        );


        if (!response.ok) {

            throw new Error(
                `Agent server returned ${response.status}`
            );
        }


        const result =
            await response.json();


        console.log(
            "🤖 Wudhoh: Policy Agent result:",
            result
        );


        return result;


    } catch (error) {

        console.error(
            "❌ Wudhoh: Policy Agent request failed:",
            error
        );


        return {

            return_days:
                "لم يُذكر",

            exchange_days:
                "لم يُذكر"

        };
    }
}

// =====================================================
// Wudhoh Policy Text Extractor
// =====================================================

let lastResolvedPolicyURL = "";


async function getPolicyText() {

    try {

        lastResolvedPolicyURL = "";

        console.log(
            "📄 Wudhoh: Searching for return/exchange policy..."
        );


        const officialPolicyURLs = {
            "treat.inc":
                "https://treat.inc/pages/refund-exchange-policy",
            "swarovski.sa":
                "https://ar.swarovski.sa/سياسة-التوصيل-و-الاستبدال/delivery.html",
            "laverne.com":
                "https://laverne.com/ar/p/bxoa",
            "surgeperfumes.com":
                "https://surgeperfumes.com/pages/30769",
            "namshi.com":
                "https://help.namshi.com/portal/ar/kb/الإسترجاع-والإستبدال",
            "daralamirat.com.sa":
                "https://daralamirat.com.sa/ar/سياسة-الاسترجاع/page-1322918713",
            "ounass.com":
                "https://saudi.ounass.com/content/online-returns",
            "vogacloset.com":
                "https://vogacloset.com/saudi/ar/returns-and-refunds/",
            "shein.com":
                "https://m.shein.com/ar/Return-Policy-a-281.html",
            "eyewa.com":
                "https://eyewa.com/sa-ar/return-policy"
        };


        const hostname =
            window.location.hostname
                .toLowerCase()
                .replace(/^www\./, "");


        const officialDomain =
            Object.keys(officialPolicyURLs)
                .find(domain =>
                    hostname === domain ||
                    hostname.endsWith(`.${domain}`)
                );


        const policyKeywords = [

            // Arabic
            "سياسة الاسترجاع",
            "سياسة الاستبدال",
            "الاسترجاع والاستبدال",
            "الاستبدال والاسترجاع",
            "سياسة الإرجاع",
            "سياسة الإرجاع والاستبدال",
            "سياسة الاسترجاع والاستبدال",

            // English
            "return policy",
            "refund policy",
            "exchange policy",
            "returns and exchanges",
            "exchange and return",
            "refund and exchange"
        ];


        const links =
            Array.from(
                document.querySelectorAll(
                    "a[href]"
                )
            );


        let policyLink =
            officialDomain
                ? officialPolicyURLs[officialDomain]
                : null;


        if (policyLink) {
            console.log(
                "✅ Wudhoh: Using official policy URL:",
                policyLink
            );
        }


        for (const link of links) {

            if (policyLink) {
                break;
            }

            const text =
                (link.innerText || "")
                    .trim()
                    .toLowerCase();


            const href =
                (link.href || "")
                    .toLowerCase();


            const matchesText =
                policyKeywords.some(
                    keyword =>
                        text.includes(
                            keyword.toLowerCase()
                        )
                );


            const matchesURL =
                href.includes("refund") ||
                href.includes("return") ||
                href.includes("exchange") ||
                href.includes("استرجاع") ||
                href.includes("استبدال");


            if (
                matchesText ||
                matchesURL
            ) {

                policyLink =
                    link.href;


                console.log(
                    "🔗 Wudhoh: Policy link found:",
                    policyLink
                );


                break;
            }
        }


        if (!policyLink) {

            console.log(
                "⚠️ Wudhoh: No policy link found."
            );


            return "";
        }


        lastResolvedPolicyURL =
            policyLink;


        console.log(
            "📥 Wudhoh: Fetching policy page..."
        );


        const controller =
            new AbortController();


        const timeoutID =
            setTimeout(
                () => controller.abort(),
                15000
            );


        let response;


        try {
            response = await fetch(
                policyLink,
                {
                    signal: controller.signal
                }
            );
        } finally {
            clearTimeout(timeoutID);
        }


        if (!response.ok) {

            throw new Error(
                `Policy page returned ${response.status}`
            );
        }


        const html =
            await response.text();


        const parser =
            new DOMParser();


        const doc =
            parser.parseFromString(
                html,
                "text/html"
            );


        doc.querySelectorAll(
            "script, style, noscript, svg"
        ).forEach(
            element =>
                element.remove()
        );


        const policyText =
            (
                doc.body?.innerText ||
                ""
            )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        console.log(
            "📄 Wudhoh: Policy text length:",
            policyText.length
        );


        return policyText;


    } catch (error) {

        console.error(
            "❌ Wudhoh: Policy extraction failed:",
            error
        );


        return "";
    }
}
// =====================================================
// 16. Popup API
// =====================================================

chrome.runtime.onMessage.addListener(

    (
        request,
        sender,
        sendResponse
    ) => {

        console.log(
            "📩 Wudhoh content.js received:",
            request
        );


        if (
            request.action ===
            "getCartProducts"
        ) {

            console.log(
                "📩 Wudhoh: getCartProducts requested."
            );


            const cartData =
                getLiveCartProducts();


            console.log(
                "📤 Wudhoh: Sending products:",
                cartData
            );


            sendResponse({

                status: "success",

                products: cartData
            });


            // The cart response is synchronous. Close the message channel
            // immediately so Safari delivers this response to the popup.
            return false;
        }

        // =================================================
        // GET POLICY TEXT
        // =================================================

        if (
            request.action ===
            "getPolicyText"
        ) {

            console.log(
                "📄 Wudhoh: Policy text requested by popup."
            );


            getPolicyText()
                .then(
                    policyText => {

                        console.log(
                            "📄 Wudhoh: Sending policy text to popup:",
                            policyText.length
                        );


                        sendResponse({

                            status: "success",

                            policyText:
                                policyText,

                            policyURL:
                                lastResolvedPolicyURL

                        });
                    }
                )
                .catch(
                    error => {

                        console.error(
                            "❌ Wudhoh: Policy request failed:",
                            error
                        );


                        sendResponse({

                            status: "error",

                            policyText: "",

                            policyURL:
                                lastResolvedPolicyURL

                        });
                    }
                );


            return true;
        }
        return false;
    }
);


// =====================================================
// 18. Zid/Treat Initial Check
// =====================================================

setTimeout(() => {

    const count =
        document.querySelectorAll(
            ".item-img-name-price"
        ).length;


    console.log(
        "🧪 Wudhoh initial Zid/Treat check:",
        count
    );

}, 1500);
