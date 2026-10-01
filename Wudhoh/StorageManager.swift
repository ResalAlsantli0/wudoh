//
//  StorageManager.swift
//  Wudhoh
//

import Foundation


final class StorageManager {

    static let shared =
        StorageManager()


    private init() {}


    private let groupIdentifier =
        "group.com.wudhoh.app"


    private let productsKey =
        "saved_purchased_products_v2"


    private var sharedDefaults:
        UserDefaults? {

        UserDefaults(
            suiteName:
                groupIdentifier
        )
    }


    // =====================================================
    // SAVE
    // =====================================================

    @discardableResult
    func saveProduct(
        _ product: PurchasedProduct
    ) -> Bool {

        var products =
            fetchProducts()


        products.insert(
            product,
            at: 0
        )


        guard
            let encoded =
                try? JSONEncoder().encode(
                    products
                )
        else {
            return false
        }

        guard let sharedDefaults else {
            return false
        }

        sharedDefaults.set(
            encoded,
            forKey:
                productsKey
        )


        guard
            let savedData = sharedDefaults.data(forKey: productsKey),
            let savedProducts = try? JSONDecoder().decode(
                [PurchasedProduct].self,
                from: savedData
            )
        else {
            return false
        }

        return savedProducts.contains { $0.id == product.id }
    }


    // =====================================================
    // FETCH
    // =====================================================

    func fetchProducts()
        -> [PurchasedProduct] {


        // App Group

        if let localData =
            sharedDefaults?.data(
                forKey:
                    productsKey
            ),

           let decoded =
            try? JSONDecoder().decode(
                [PurchasedProduct].self,
                from:
                    localData
            ) {

            return decoded
        }


        return []
    }
}
