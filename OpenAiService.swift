//
//  OpenAiService.swift
//  Wudhoh
//

import Foundation


final class OpenAIService {

    static let shared =
        OpenAIService()


    private init() {}


    // =====================================================
    // API KEY
    // =====================================================

    private var apiKey: String {

        guard
            let path =
                Bundle.main.path(
                    forResource: "Secrets",
                    ofType: "plist"
                ),

            let dict =
                NSDictionary(
                    contentsOfFile: path
                ),

            let key =
                dict["OpenAI_Key"] as? String,

            !key.isEmpty

        else {

            fatalError(
                "لم يتم العثور على OpenAI_Key داخل Secrets.plist"
            )
        }

        return key
    }


    // =====================================================
    // ANALYZE POLICY
    // =====================================================

    func extractPolicy(
        productTitle: String,
        policyText: String
    ) async throws -> PolicySummary {


        let url =
            URL(
                string:
                    "https://api.openai.com/v1/chat/completions"
            )!


        var request =
            URLRequest(
                url: url
            )


        request.httpMethod =
            "POST"


        request.setValue(
            "Bearer \(apiKey)",
            forHTTPHeaderField:
                "Authorization"
        )


        request.setValue(
            "application/json",
            forHTTPHeaderField:
                "Content-Type"
        )


        // =================================================
        // SYSTEM PROMPT
        // =================================================

        let systemPrompt = """

        أنت محلل متخصص في سياسات الاسترجاع والاستبدال للمتاجر الإلكترونية في السعودية.

        لديك اسم منتج ونص سياسة الاسترجاع والاستبدال الخاصة بالمتجر.

        مهمتك:

        1. اقرأ سياسة المتجر.
        2. حدد سياسة الاسترجاع التي تنطبق على المنتج.
        3. حدد سياسة الاستبدال التي تنطبق على المنتج.
        4. انتبه للاستثناءات الخاصة بفئة المنتج.
        5. لا تفترض أن السياسة العامة تنطبق إذا كان هناك استثناء خاص.
        6. لا تخترع أي رقم غير موجود في النص.
        7. إذا لم تجد عدد الأيام بوضوح، استخدم null.
        8. إذا كان المنتج مستثنى من الاسترجاع أو الاستبدال، اجعل excluded = true.
        9. اذكر سبب الاستثناء داخل highlights.
        10. أجب بصيغة JSON فقط.

        استخدم الشكل التالي:

        {
          "return_days": number or null,
          "exchange_days": number or null,
          "free_returns": true or false,
          "excluded": true or false,
          "highlights": ["..."],
          "excluded_items": ["..."]
        }

        """


        // =================================================
        // USER PROMPT
        // =================================================

        let userPrompt = """

        اسم المنتج:
        \(productTitle)

        نص سياسة المتجر:
        \(policyText)

        حلل النص وحدد السياسة التي تنطبق على هذا المنتج بالتحديد.

        """


        // =================================================
        // REQUEST
        // =================================================

        let body:
            [String: Any] = [

                "model":
                    "gpt-4o-mini",

                "messages": [

                    [
                        "role":
                            "system",

                        "content":
                            systemPrompt
                    ],

                    [
                        "role":
                            "user",

                        "content":
                            userPrompt
                    ]
                ],

                "response_format":
                    [
                        "type":
                            "json_object"
                    ],

                "temperature":
                    0
            ]


        request.httpBody =
            try JSONSerialization.data(
                withJSONObject:
                    body
            )


        // =================================================
        // API CALL
        // =================================================

        let (
            data,
            response
        ) =
            try await URLSession.shared.data(
                for:
                    request
            )


        guard
            let httpResponse =
                response as? HTTPURLResponse
        else {

            throw URLError(
                .badServerResponse
            )
        }


        guard
            httpResponse.statusCode == 200
        else {

            let errorText =
                String(
                    data:
                        data,
                    encoding:
                        .utf8
                ) ?? ""


            print(
                "❌ OpenAI HTTP \(httpResponse.statusCode)"
            )

            print(
                errorText
            )


            throw NSError(
                domain:
                    "OpenAIService",

                code:
                    httpResponse.statusCode,

                userInfo:
                    [
                        NSLocalizedDescriptionKey:
                            errorText
                    ]
            )
        }


        // =================================================
        // DECODE
        // =================================================

        let decodedResponse =
            try JSONDecoder().decode(
                OpenAIResponse.self,
                from:
                    data
            )


        guard
            let jsonString =
                decodedResponse
                    .choices
                    .first?
                    .message
                    .content
        else {

            throw NSError(
                domain:
                    "OpenAIService",

                code:
                    -1,

                userInfo:
                    [
                        NSLocalizedDescriptionKey:
                            "OpenAI لم يرجع محتوى."
                    ]
            )
        }


        print(
            "🤖 OpenAI JSON:"
        )

        print(
            jsonString
        )


        guard
            let jsonData =
                jsonString.data(
                    using:
                        .utf8
                )
        else {

            throw NSError(
                domain:
                    "OpenAIService",

                code:
                    -2
            )
        }


        let policyData =
            try JSONDecoder().decode(
                PolicySummary.self,
                from:
                    jsonData
            )


        return policyData
    }
}


// =====================================================
// OPENAI RESPONSE
// =====================================================

struct OpenAIResponse:
    Codable {

    struct Choice:
        Codable {

        struct Message:
            Codable {

            let content:
                String
        }


        let message:
            Message
    }


    let choices:
        [Choice]
}


// =====================================================
// POLICY SUMMARY
// =====================================================

struct PolicySummary:
    Codable {

    let returnDays:
        Int?

    let exchangeDays:
        Int?

    let freeReturns:
        Bool

    let excluded:
        Bool

    let highlights:
        [String]

    let excludedItems:
        [String]


    enum CodingKeys:
        String,
        CodingKey {

        case returnDays =
            "return_days"

        case exchangeDays =
            "exchange_days"

        case freeReturns =
            "free_returns"

        case excluded

        case highlights

        case excludedItems =
            "excluded_items"
    }
}
