//
//  SafariWebExtensionHandler.swift
//  WudhohExtension
//

import Foundation
import SafariServices

final class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        guard
            let inputItem = context.inputItems.first as? NSExtensionItem,
            let message = inputItem.userInfo?[SFExtensionMessageKey] as? [String: Any],
            let action = message["action"] as? String
        else {
            complete(context: context, status: "error")
            return
        }

        guard action == "saveProducts" else {
            complete(context: context, status: "unknown_action")
            return
        }

        saveProducts(message: message, context: context)
    }

    private func saveProducts(
        message: [String: Any],
        context: NSExtensionContext
    ) {
        guard let productsData = message["products"] as? [[String: Any]] else {
            complete(context: context, status: "error")
            return
        }

        var savedCount = 0

        for productData in productsData {
            let product = PurchasedProduct(
                title: string(productData["title"]) ?? "منتج بدون عنوان",
                price: string(productData["price"]) ?? "",
                imageURL: string(productData["imageURL"]),
                storeName: string(productData["storeName"]) ?? "متجر إلكتروني",
                returnWindowDays: days(productData["returnWindowDays"]),
                exchangeWindowDays: days(productData["exchangeWindowDays"]),
                freeReturns: boolean(productData["freeReturns"]),
                excluded: boolean(productData["excluded"]),
                highlights: strings(productData["highlights"]),
                excludedItems: strings(productData["excludedItems"]),
                purchaseDate: Date()
            )

            if StorageManager.shared.saveProduct(product) {
                savedCount += 1
            }
        }

        guard savedCount == productsData.count else {
            complete(
                context: context,
                status: "save_error",
                extra: ["saved": savedCount]
            )
            return
        }

        complete(
            context: context,
            status: "success",
            extra: ["saved": savedCount]
        )
    }

    private func string(_ value: Any?) -> String? {
        guard let value = value as? String else { return nil }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }

    private func days(_ value: Any?) -> Int? {
        if let number = value as? NSNumber {
            return number.intValue
        }

        guard let text = string(value) else { return nil }

        if let exactValue = Int(text) {
            return exactValue
        }

        let digits = text.filter { $0.isNumber }
        return digits.isEmpty ? nil : Int(digits)
    }

    private func boolean(_ value: Any?) -> Bool {
        if let value = value as? Bool { return value }
        if let value = value as? NSNumber { return value.boolValue }
        if let value = value as? String { return value.lowercased() == "true" }
        return false
    }

    private func strings(_ value: Any?) -> [String] {
        value as? [String] ?? []
    }

    private func complete(
        context: NSExtensionContext,
        status: String,
        extra: [String: Any] = [:]
    ) {
        var responseData: [String: Any] = ["status": status]
        extra.forEach { responseData[$0.key] = $0.value }

        let response = NSExtensionItem()
        response.userInfo = [SFExtensionMessageKey: responseData]

        context.completeRequest(
            returningItems: [response],
            completionHandler: nil
        )
    }
}
