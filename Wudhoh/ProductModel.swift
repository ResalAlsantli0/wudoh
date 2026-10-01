//
//  ProductModel.swift
//  Wudhoh
//

import Foundation


struct PurchasedProduct: Identifiable, Codable {

    // =====================================================
    // BASIC PRODUCT INFORMATION
    // =====================================================

    var id: UUID = UUID()

    let title: String

    let price: String

    let imageURL: String?

    let storeName: String


    // =====================================================
    // AI POLICY RESULTS
    // =====================================================

    // ممكن تكون nil إذا لم تحدد سياسة المتجر عدد الأيام.

    let returnWindowDays: Int?

    let exchangeWindowDays: Int?

    let freeReturns: Bool

    let excluded: Bool

    let highlights: [String]

    let excludedItems: [String]


    // =====================================================
    // PURCHASE DATE
    // =====================================================

    let purchaseDate: Date


    // =====================================================
    // DAYS REMAINING FOR RETURN
    // =====================================================

    var daysRemainingForReturn: Int {
        daysRemaining(windowDays: returnWindowDays)
    }


    // =====================================================
    // DAYS REMAINING FOR EXCHANGE
    // =====================================================

    var daysRemainingForExchange: Int {
        daysRemaining(windowDays: exchangeWindowDays)
    }


    // =====================================================
    // IS RETURN AVAILABLE?
    // =====================================================

    var isReturnAvailable: Bool {

        !excluded &&
        returnWindowDays != nil &&
        daysRemainingForReturn > 0
    }


    // =====================================================
    // IS EXCHANGE AVAILABLE?
    // =====================================================

    var isExchangeAvailable: Bool {

        !excluded &&
        exchangeWindowDays != nil &&
        daysRemainingForExchange > 0
    }


    // =====================================================
    // SHARED COUNTDOWN CALCULATION
    // =====================================================

    private func daysRemaining(windowDays: Int?) -> Int {
        guard !excluded, let windowDays else {
            return 0
        }

        let calendar = Calendar.current
        let purchaseDay = calendar.startOfDay(for: purchaseDate)
        let today = calendar.startOfDay(for: Date())

        guard let expirationDate = calendar.date(
            byAdding: .day,
            value: windowDays,
            to: purchaseDay
        ) else {
            return 0
        }

        return max(
            0,
            calendar.dateComponents(
                [.day],
                from: today,
                to: expirationDate
            ).day ?? 0
        )
    }
}
