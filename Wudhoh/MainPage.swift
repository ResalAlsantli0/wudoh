//
//  MainPage.swift
//  Wudhoh
//

import SwiftUI

struct MainPage: View {

    @State private var products: [PurchasedProduct] = []
    @Environment(\.scenePhase) private var scenePhase

    private let navy = Color(
        red: 0.06,
        green: 0.14,
        blue: 0.27
    )

    private var activeProductsCount: Int {
        products.filter {
            $0.isReturnAvailable || $0.isExchangeAvailable
        }.count
    }

    private var nearestReturnDays: Int? {
        products
            .filter(\.isReturnAvailable)
            .map(\.daysRemainingForReturn)
            .min()
    }

    private var nearestExchangeDays: Int? {
        products
            .filter(\.isExchangeAvailable)
            .map(\.daysRemainingForExchange)
            .min()
    }

    private var nearestDeadlineText: String {
        let deadlines = [nearestReturnDays, nearestExchangeDays]
            .compactMap { $0 }

        guard let nearest = deadlines.min() else {
            return "لا توجد مهل نشطة حالياً"
        }

        return "أقرب مهلة تنتهي خلال \(nearest) يوم"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {

                    HStack {
                        NavigationLink(destination: SettingsView()) {
                            Image(systemName: "gearshape")
                                .font(.title2.weight(.semibold))
                                .foregroundStyle(.black)
                        }

                        Spacer()
                    }
                    .padding(.top, 8)

                    statusBanner

                    Text("سجل الاسترجاع والاستبدال")
                        .font(.title2.bold())

                    if products.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "shippingbox")
                                .font(.largeTitle)
                                .foregroundStyle(.gray.opacity(0.55))

                            Text("لا توجد منتجات مسجلة حتى الآن")
                                .font(.subheadline)
                                .foregroundStyle(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 42)
                    } else {
                        LazyVStack(spacing: 16) {
                            ForEach(products) { product in
                                HistoryCardView(product: product)
                            }
                        }
                    }

                    HStack {
                        Spacer()
                        Text("— نهاية السجل —")
                            .font(.footnote)
                            .foregroundStyle(.gray.opacity(0.7))
                        Spacer()
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 24)
            }
            .background(Color.white.ignoresSafeArea())
        }
        .environment(\.layoutDirection, .rightToLeft)
        .onAppear(perform: refreshProducts)
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .active {
                refreshProducts()
            }
        }
    }

    private var statusBanner: some View {
        VStack(spacing: 16) {
            HStack(spacing: 14) {
                RoundedRectangle(cornerRadius: 14)
                    .fill(.white)
                    .frame(width: 54, height: 54)
                    .overlay {
                        Image(systemName: "arrow.left.arrow.right.circle")
                            .font(.title2)
                            .foregroundStyle(navy)
                    }

                VStack(alignment: .leading, spacing: 4) {
                    Text("\(activeProductsCount) منتجات نشطة")
                        .font(.headline)
                        .foregroundStyle(.white)

                    Text(nearestDeadlineText)
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.75))
                }

                Spacer()
            }

            Divider()
                .overlay(.white.opacity(0.22))

            HStack(spacing: 0) {
                BannerCountdownView(
                    title: "الاسترجاع",
                    icon: "arrow.uturn.backward",
                    days: nearestReturnDays,
                    tint: .green
                )

                Rectangle()
                    .fill(.white.opacity(0.22))
                    .frame(width: 1, height: 42)
                    .padding(.horizontal, 14)

                BannerCountdownView(
                    title: "الاستبدال",
                    icon: "arrow.triangle.2.circlepath",
                    days: nearestExchangeDays,
                    tint: .blue
                )
            }
        }
        .padding(18)
        .background(
            LinearGradient(
                colors: [navy, Color(red: 0.08, green: 0.19, blue: 0.36)],
                startPoint: .topTrailing,
                endPoint: .bottomLeading
            )
        )
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .shadow(color: navy.opacity(0.16), radius: 12, y: 6)
    }

    private func refreshProducts() {
        products = StorageManager.shared.fetchProducts()
    }
}


private struct BannerCountdownView: View {

    let title: String
    let icon: String
    let days: Int?
    let tint: Color

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .font(.title2.weight(.semibold))
                .foregroundStyle(tint)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.white)

                Text(days.map { "\($0) يوم متبقي" } ?? "لا توجد مهلة")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(days == nil ? .white.opacity(0.6) : tint)
            }

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity)
    }
}


struct HistoryCardView: View {

    let product: PurchasedProduct

    private var formattedPurchaseDate: String {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "ar_SA")
        formatter.dateFormat = "d MMMM"
        return formatter.string(from: product.purchaseDate)
    }

    var body: some View {
        VStack(spacing: 14) {
            HStack(alignment: .top, spacing: 13) {
                productImage

                VStack(alignment: .leading, spacing: 5) {
                    Text(product.title)
                        .font(.headline)
                        .foregroundStyle(.black)
                        .lineLimit(2)

                    Text("البائع: \(product.storeName)")
                        .font(.subheadline)
                        .foregroundStyle(.gray)
                        .lineLimit(1)

                    Text("تاريخ الحفظ: \(formattedPurchaseDate)")
                        .font(.caption)
                        .foregroundStyle(.gray.opacity(0.85))
                }

            }

            HStack(spacing: 8) {
                PolicyCountdownView(
                    title: "الاسترجاع",
                    icon: "arrow.uturn.backward",
                    windowDays: product.returnWindowDays,
                    daysRemaining: product.daysRemainingForReturn,
                    excluded: product.excluded,
                    tint: .green
                )

                PolicyCountdownView(
                    title: "الاستبدال",
                    icon: "arrow.triangle.2.circlepath",
                    windowDays: product.exchangeWindowDays,
                    daysRemaining: product.daysRemainingForExchange,
                    excluded: product.excluded,
                    tint: .blue
                )
            }
        }
        .padding(14)
        .background(Color.gray.opacity(0.055))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay {
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.gray.opacity(0.1), lineWidth: 1)
        }
    }

    private var productImage: some View {
        AsyncImage(url: product.imageURL.flatMap(URL.init(string:))) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
            default:
                Image(systemName: "shippingbox")
                    .foregroundStyle(.gray.opacity(0.6))
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(Color.gray.opacity(0.12))
            }
        }
        .frame(width: 62, height: 62)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}


private struct PolicyCountdownView: View {

    let title: String
    let icon: String
    let windowDays: Int?
    let daysRemaining: Int
    let excluded: Bool
    let tint: Color

    private var isActive: Bool {
        !excluded && windowDays != nil && daysRemaining > 0
    }

    private var isExpired: Bool {
        !excluded && windowDays != nil && daysRemaining == 0
    }

    private var statusText: String {
        if excluded || windowDays == nil {
            return "غير متاح"
        }

        return isActive ? "\(daysRemaining) يوم متبقي" : "منتهي"
    }

    private var statusColor: Color {
        if isExpired { return .red }
        if isActive { return tint }
        return .gray
    }

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: icon)
                .font(.headline)
                .foregroundStyle(statusColor)

            VStack(alignment: .leading, spacing: 3) {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.primary)

                Text(statusText)
                    .font(.caption2.bold())
                    .foregroundStyle(statusColor)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 11)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, minHeight: 58)
        .background(statusColor.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay {
            RoundedRectangle(cornerRadius: 12)
                .stroke(statusColor.opacity(0.16), lineWidth: 1)
        }
    }
}
