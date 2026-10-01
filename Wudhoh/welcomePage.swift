//
//  welcomePage.swift
//  Wudhoh
//

import SwiftUI

struct WelcomePage: View {
    // متغير للتحكم بظهور نافذة التفعيل
    @State private var showEnablePage = false
    
    var body: some View {
        VStack(spacing: 0) {
            
            Spacer()
            
            // 1. Logo Image
            Image("Logo")
                .resizable()
                .scaledToFit()
                .frame(width: 220, height: 220)
                .padding(.bottom, 24)
            
            // 2. Title
            Text("وضوح")
                .font(.system(size: 34, weight: .bold, design: .serif))
                .foregroundColor(Color(red: 0.15, green: 0.22, blue: 0.32))
                .padding(.bottom, 8)
            
            // 3. Subtitle
            Text("اعرف السياسات قبل\nلا تدفع مو بعدها.")
                .font(.title3)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
                .foregroundColor(.black.opacity(0.8))
                .lineSpacing(6)
                .padding(.bottom, 40)
            
            // 4. Feature Bullets List
            VStack(alignment: .leading, spacing: 16) {
                FeatureRow(text: "يعمل تلقائياً أثناء تسوقك")
                FeatureRow(text: "يبرز لك شروط الاسترجاع والاستبدال")
                FeatureRow(text: "يحتفظ بسجل مشترياتك للتتبع")
            }
            .environment(\.layoutDirection, .rightToLeft) // محاذاة النقاط لليمين
            .padding(.horizontal, 32)
            
            Spacer()
            
            // 5. Action Button (يفتح شاشة EnablePage)
            Button(action: {
                showEnablePage = true
            }) {
                Text("ابدأ الآن")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(Color(red: 0.05, green: 0.73, blue: 0.48))
                    .cornerRadius(14)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 8)
            
            // 6. Bottom Note
            Text("لا يتطلب إنشاء حساب أو تسجيل دخول")
                .font(.footnote)
                .foregroundColor(.gray)
                .padding(.bottom, 16)
        }
        .environment(\.layoutDirection, .rightToLeft) // تطبيق الاتجاه العربي على كامل الشاشة
        .background(Color.white.ignoresSafeArea())
        // عرض EnablePage كشاشة كاملة شفافة عند الضغط
        .fullScreenCover(isPresented: $showEnablePage) {
            EnablePage()
        }
    }
}

// MARK: - Reusable Feature Bullet Row
struct FeatureRow: View {
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Color(red: 0.05, green: 0.73, blue: 0.48))
                .frame(width: 8, height: 8)
            
            Text(text)
                .font(.subheadline)
                .foregroundColor(.gray)
        }
    }
}

#Preview {
    WelcomePage()
}
