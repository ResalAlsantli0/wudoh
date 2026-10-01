// background.js
// Wudhoh Safari Web Extension

browser.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {

        console.log(
            "📩 Wudhoh background message:",
            request
        );


        // =====================================================
        // ANALYZE POLICIES
        // =====================================================

        if (
            request.action ===
            "analyzePolicies"
        ) {

            console.log(
                "🤖 Wudhoh Background: analyzePolicies received",
                request
            );


            const products =
                request.products || [];


            const policyText =
                request.policyText || "";


            // =================================================
            // VALIDATE DATA
            // =================================================

            if (
                products.length === 0 ||
                !policyText
            ) {

                console.log(
                    "⚠️ Wudhoh Background: Missing products or policy text"
                );


                sendResponse({

                    status:
                        "missing_data",

                    products:
                        products

                });


                return true;
            }


            // =================================================
            // ANALYZE FIRST PRODUCT
            // =================================================

            const firstProduct =
                products[0];


            console.log(
                "🛍️ Wudhoh Background: Product:",
                firstProduct.title
            );


            console.log(
                "📄 Wudhoh Background: Policy length:",
                policyText.length
            );


            const controller =
                new AbortController();


            const timeoutID =
                setTimeout(
                    () => controller.abort(),
                    30000
                );


            fetch(
                "https://wudhoh-agent.onrender.com/analyze",
                {
                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            product_name:
                                firstProduct.title,

                            policy_text:
                                policyText

                        }),

                    signal:
                        controller.signal
                }
            )

                .then(
                    response => {

                        if (
                            !response.ok
                        ) {

                            throw new Error(
                                `Agent server returned ${response.status}`
                            );
                        }


                        return response.json();
                    }
                )

                .then(
                    agentResult => {

                        console.log(
                            "✅ Wudhoh Background: Agent result:",
                            agentResult
                        );


                        sendResponse({

                            status:
                                "success",

                            agentResult:
                                agentResult,

                            products:
                                products

                        });
                    }
                )

                .catch(
                    error => {

                        console.error(
                            "❌ Wudhoh Background: Agent failed:",
                            error
                        );


                        sendResponse({

                            status:
                                "agent_error",

                            error:
                                String(error),

                            products:
                                products

                        });
                    }
                )

                .finally(
                    () =>
                        clearTimeout(timeoutID)
                );


            return true;
        }        // =====================================================
        // SAVE PURCHASED PRODUCTS
        // =====================================================

        if (
            request.action ===
            "savePurchasedProducts"
        ) {

            console.log(
                "💾 Wudhoh: Saving purchased products",
                request.products
            );


            browser.runtime
                .sendNativeMessage(
                    "application.id",
                    {
                        action:
                            "saveProducts",

                        products:
                            request.products
                    }
                )

                .then(
                    response => {

                        console.log(
                            "✅ Save Native response:",
                            response
                        );


                        sendResponse(
                            response || {
                                status:
                                    "success"
                            }
                        );
                    }
                )

                .catch(
                    error => {

                        console.error(
                            "❌ Save Native message error:",
                            error
                        );


                        sendResponse({

                            status:
                                "save_error",

                            error:
                                String(error)
                        });
                    }
                );


            return true;
        }



        // =====================================================
        // UNKNOWN ACTION
        // =====================================================

        console.log(
            "⚠️ Unknown Wudhoh action:",
            request.action
        );


        sendResponse({

            status:
                "unknown_action"
        });


        return false;
    }
);
