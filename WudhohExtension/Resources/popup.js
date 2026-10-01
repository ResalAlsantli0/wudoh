// popup.js - Wudhoh Cart Controller

document.addEventListener('DOMContentLoaded', async () => {

    const counterText =
        document.getElementById('wudhoh-counter');

    const carouselContainer =
        document.getElementById('wudhoh-carousel');

    const dotsContainer =
        document.getElementById('wudhoh-dots');

    const saveBtn =
        document.getElementById('wudhoh-continue-btn');

    const policyLink =
        document.querySelector('.wudhoh-link');

    let currentProducts = [];

    let currentPolicyURL = "";


    // =====================================================
    // SAVE PRODUCTS BUTTON
    // =====================================================

    if (saveBtn) {

        saveBtn.addEventListener('click', (event) => {

            event.preventDefault();

            if (
                currentProducts.length === 0 ||
                saveBtn.disabled
            ) {
                return;
            }

            saveBtn.disabled = true;
            saveBtn.textContent = "جاري الحفظ...";

            // نؤخر الإرسال لحظة قصيرة حتى يعرض Safari حالة التحميل.
            setTimeout(() => {

                chrome.runtime.sendMessage({

                    action:
                        "savePurchasedProducts",

                    products:
                        currentProducts

                }, (response) => {

                    if (chrome.runtime.lastError) {

                        console.log(
                            "Save message error:",
                            chrome.runtime.lastError.message
                        );

                        saveBtn.disabled = false;
                        saveBtn.textContent =
                            "تعذر الحفظ";

                        return;
                    }

                    console.log(
                        "Save response:",
                        response
                    );

                    if (response?.status === "success") {
                        saveBtn.textContent =
                            "تم حفظ المنتجات ✓";
                        return;
                    }

                    saveBtn.disabled = false;
                    saveBtn.textContent =
                        "تعذر الحفظ";

                });

            }, 100);

        });
    }


    function finishPolicyWithMessage(message) {

        currentProducts =
            currentProducts.map(product => ({
                ...product,
                returnWindowDays: message,
                exchangeWindowDays: message
            }));

        renderCarousel(currentProducts);
    }

    console.log("Wudhoh popup loaded");


    if (policyLink) {

        policyLink.addEventListener(
            'click',
            (event) => {

                event.preventDefault();

                if (!currentPolicyURL) {
                    console.log(
                        "No policy URL available"
                    );
                    return;
                }

                chrome.tabs.create({
                    url: currentPolicyURL
                });
            }
        );
    }


    try {

        // الحصول على التاب الحالي
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });


        if (!tab) {

            console.log("No active tab");

            if (counterText) {
                counterText.textContent =
                    "يرجى فتح صفحة السلة";
            }

            return;
        }


        console.log(
            "Current tab:",
            tab.url
        );


        // =====================================================
        // REQUEST CART SCAN
        // =====================================================

        chrome.tabs.sendMessage(
            tab.id,
            {
                action: "getCartProducts"
            },
            (response) => {

                if (chrome.runtime.lastError) {

                    console.log(
                        "Content script error:",
                        chrome.runtime.lastError.message
                    );

                    if (counterText) {
                        counterText.textContent =
                            "تعذر قراءة السلة";
                    }

                    return;
                }


                if (
                    !response ||
                    !response.products ||
                    response.products.length === 0
                ) {

                    console.log(
                        "No products found"
                    );

                    if (counterText) {
                        counterText.textContent =
                            "لا توجد منتجات في السلة";
                    }

                    return;
                }


                currentProducts =
                    response.products;


                console.log(
                    "✅ Wudhoh Popup: Products received:",
                    currentProducts
                );


                renderCarousel(
                    currentProducts
                );


                // =====================================================
                // GET POLICY TEXT - SEPARATE REQUEST
                // =====================================================

                chrome.tabs.sendMessage(
                    tab.id,
                    {
                        action: "getPolicyText"
                    },

                    async (policyResponse) => {

                        currentPolicyURL =
                            policyResponse?.policyURL ||
                            "";

                        if (
                            chrome.runtime.lastError
                        ) {

                            console.log(
                                "Policy request error:",
                                chrome.runtime.lastError.message
                            );

                            finishPolicyWithMessage(
                                "تعذر قراءة السياسة"
                            );

                            return;
                        }


                        if (
                            !policyResponse ||
                            !policyResponse.policyText
                        ) {

                            console.log(
                                "No policy text received"
                            );

                            finishPolicyWithMessage(
                                "لم يتم العثور على السياسة"
                            );

                            return;
                        }


                        console.log(
                            "📄 Wudhoh Popup: Policy received:",
                            policyResponse.policyText
                        );


                        console.log(
                            "📏 Wudhoh Popup: Policy length:",
                            policyResponse.policyText.length
                        );


                        // =====================================================
                        // ANALYZE PRODUCTS WITH AGENT
                        // =====================================================

                        console.log(
                            "🤖 Wudhoh Popup: Starting policy analysis..."
                        );


                        for (
                            let index = 0;
                            index < currentProducts.length;
                            index++
                        ) {

                            const product =
                                currentProducts[index];


                            try {

                                console.log(
                                    "🤖 Wudhoh: Analyzing product:",
                                    product.title
                                );


                                const agentResponse =
                                    await chrome.runtime.sendMessage({

                                        action:
                                            "analyzePolicies",

                                        products: [
                                            product
                                        ],

                                        policyText:
                                            policyResponse.policyText

                                    });


                                console.log(
                                    "🤖 Wudhoh: Agent response:",
                                    agentResponse
                                );


                                if (
                                    !agentResponse
                                ) {

                                    console.log(
                                        "No Agent response received"
                                    );

                                    currentProducts[index] = {
                                        ...product,
                                        returnWindowDays: "تعذر التحليل",
                                        exchangeWindowDays: "تعذر التحليل"
                                    };

                                    continue;
                                }


                                if (
                                    agentResponse.status &&
                                    agentResponse.status !== "success"
                                ) {

                                    currentProducts[index] = {
                                        ...product,
                                        returnWindowDays: "تعذر التحليل",
                                        exchangeWindowDays: "تعذر التحليل"
                                    };

                                    continue;
                                }


                                const agentResult =
                                    agentResponse.agentResult ||
                                    agentResponse.policy ||
                                    agentResponse;


                                currentProducts[index] = {

                                    ...product,

                                    returnWindowDays:
                                        agentResult.return_days ??
                                        "لم يُذكر",

                                    exchangeWindowDays:
                                        agentResult.exchange_days ??
                                        "لم يُذكر",

                                    freeReturns:
                                        agentResult.free_returns ??
                                        false,

                                    excluded:
                                        agentResult.excluded ??
                                        false,

                                    highlights:
                                        agentResult.highlights ??
                                        [],

                                    excludedItems:
                                        agentResult.excluded_items ??
                                        []
                                };


                                console.log(
                                    "✅ Wudhoh: Product updated with policy:",
                                    currentProducts[index]
                                );


                            } catch (error) {

                                console.error(
                                    "❌ Wudhoh: Agent analysis failed:",
                                    error
                                );

                                currentProducts[index] = {
                                    ...product,
                                    returnWindowDays: "تعذر التحليل",
                                    exchangeWindowDays: "تعذر التحليل"
                                };

                            }

                        }


                        // =====================================================
                        // RE-RENDER WITH AGENT RESULTS
                        // =====================================================

                        renderCarousel(
                            currentProducts
                        );

                    }
                );

            }
        );


    } catch (error) {

        console.log(
            "Popup error:",
            error
        );

        if (counterText) {
            counterText.textContent =
                "يرجى فتح صفحة السلة";
        }
    }



    // =====================================================
    // عرض المنتجات
    // =====================================================

    function renderCarousel(products) {

        const total =
            products.length;


        // -------------------------------------------------
        // العداد
        // -------------------------------------------------

        if (counterText) {

            counterText.textContent =
                `المنتج 1 من ${total}`;
        }



        // -------------------------------------------------
        // النقاط
        // -------------------------------------------------

        if (dotsContainer) {

            dotsContainer.innerHTML =
                products
                    .map((_, index) => {

                        return `
                            <span
                                class="dot ${index === 0 ? 'active' : ''}"
                                data-index="${index}">
                            </span>
                        `;

                    })
                    .join('');
        }



        // -------------------------------------------------
        // المنتجات
        // -------------------------------------------------

        if (carouselContainer) {

            carouselContainer.innerHTML =
                products
                    .map((prod) => {

                        // القيم القادمة من Agent
                        const returnDays =
                            prod.returnWindowDays == null
                                ? "جاري التحليل..."
                                : /^\d+$/.test(String(prod.returnWindowDays))
                                    ? `${prod.returnWindowDays} يوم`
                                    : prod.returnWindowDays;

                        const exchangeDays =
                            prod.exchangeWindowDays == null
                                ? "جاري التحليل..."
                                : /^\d+$/.test(String(prod.exchangeWindowDays))
                                    ? `${prod.exchangeWindowDays} يوم`
                                    : prod.exchangeWindowDays;


                        return `
                            <div class="wudhoh-slide">

                                <div class="wudhoh-product-card">

                                    ${
                                        prod.imageURL

                                        ? `
                                            <img
                                                src="${prod.imageURL}"
                                                class="wudhoh-product-image"
                                                style="
                                                    width:50px;
                                                    height:50px;
                                                    border-radius:8px;
                                                    object-fit:cover;
                                                "
                                            />
                                        `

                                        : `
                                            <div
                                                class="wudhoh-product-image-placeholder"
                                                style="
                                                    width:50px;
                                                    height:50px;
                                                    border-radius:8px;
                                                    background:#eee;
                                                ">
                                            </div>
                                        `
                                    }


                                    <div>

                                        <h3 class="wudhoh-product-name">
                                            ${prod.title}
                                        </h3>

                                        <p class="wudhoh-product-meta">

                                            ${
                                                prod.price
                                                ? prod.price + ' · '
                                                : ''
                                            }

                                            الكمية ${prod.quantity || '1'}

                                        </p>

                                    </div>

                                </div>



                                <div class="wudhoh-policy-list">


                                    <!-- الاسترجاع -->

                                    <div class="wudhoh-policy-item">

                                        <div class="wudhoh-policy-label">

                                            <div class="wudhoh-icon-box blue-box">

                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="#2563eb"
                                                    stroke-width="2.5">

                                                    <rect
                                                        x="3"
                                                        y="4"
                                                        width="18"
                                                        height="16"
                                                        rx="2"
                                                    />

                                                </svg>

                                            </div>

                                            <span>
                                                مهلة الاسترجاع
                                            </span>

                                        </div>


                                        <span class="wudhoh-policy-value">
                                            ${returnDays}
                                        </span>

                                    </div>



                                    <!-- الاستبدال -->

                                    <div class="wudhoh-policy-item">

                                        <div class="wudhoh-policy-label">

                                            <div class="wudhoh-icon-box purple-box">

                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="#7c3aed"
                                                    stroke-width="2.5">

                                                    <path
                                                        d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"
                                                    />

                                                </svg>

                                            </div>

                                            <span>
                                                الاستبدال
                                            </span>

                                        </div>


                                        <span class="wudhoh-policy-value">
                                            ${exchangeDays}
                                        </span>

                                    </div>

                                </div>

                            </div>
                        `;

                    })
                    .join('');
        }



        // =================================================
        // مزامنة النقاط مع السوايب
        // =================================================

        if (
            carouselContainer &&
            dotsContainer
        ) {

            const slides =
                carouselContainer.querySelectorAll(
                    '.wudhoh-slide'
                );

            const dots =
                dotsContainer.querySelectorAll(
                    '.dot'
                );


            const observer =
                new IntersectionObserver(

                    (entries) => {

                        entries.forEach(
                            (entry) => {

                                if (
                                    !entry.isIntersecting
                                ) {
                                    return;
                                }


                                const index =
                                    Array.from(
                                        slides
                                    ).indexOf(
                                        entry.target
                                    );


                                if (
                                    index === -1
                                ) {
                                    return;
                                }


                                // ---------------------------------
                                // تحديث النقاط
                                // ---------------------------------

                                dots.forEach(
                                    (dot, dotIndex) => {

                                        dot.classList.toggle(
                                            'active',
                                            dotIndex === index
                                        );

                                    }
                                );


                                // ---------------------------------
                                // تحديث العداد
                                // ---------------------------------

                                if (counterText) {

                                    counterText.textContent =
                                        `المنتج ${index + 1} من ${total}`;
                                }

                            }
                        );

                    },

                    {
                        root: carouselContainer,
                        threshold: 0.6
                    }

                );


            // مراقبة كل المنتجات
            slides.forEach(
                (slide) => {

                    observer.observe(
                        slide
                    );

                }
            );

        }



    }

});
