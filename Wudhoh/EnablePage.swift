//
//  EnablePage.swift
//  Wudhoh
//

import SwiftUI

struct EnablePage: View {
    @Environment(\.dismiss) var dismiss
    @State private var navigateToMain = false
    
    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.opacity(0.5)
                .ignoresSafeArea()
            
            VStack(spacing: 16) {
                Image("Logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .padding(.top, 10)
                
                Text("تفعيل إضافة وضوح في Safari")
                    .font(.system(size: 20, weight: .bold, design: .serif))
                    .foregroundColor(Color(red: 0.15, green: 0.22, blue: 0.32))
                    .multilineTextAlignment(.center)
                
                // قائمة التعليمات الخطوة بخطوة
                VStack(alignment: .leading, spacing: 10) {
                    instructionRow(step: "1", text: "اضغط على **الذهاب للإعدادات** أدناه")
                    instructionRow(step: "2", text: "انتقل إلى **التطبيقات**")
                    instructionRow(step: "3", text: "اختار  **Safari**")
                    instructionRow(step: "4", text: "اضغطي على **الملحقات** (Extensions)")
                    instructionRow(step: "5", text: "فعّل إضافة **WudhohExtension**")
                }
                .environment(\.layoutDirection, .rightToLeft) // محاذاة النص والخطوات لليمين
                .padding(16)
                .background(Color(red: 0.96, green: 0.97, blue: 0.98))
                .cornerRadius(16)
                
                // زر التوجيه للإعدادات
                Button(action: {
                    openAppSettings()
                }) {
                    Text("الذهاب للإعدادات")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color(red: 0.05, green: 0.73, blue: 0.48))
                        .cornerRadius(14)
                }
                .padding(.top, 4)
                
                Button(action: {
                    navigateToMain = true
                }) {
                    Text("ليس الآن")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                        .underline()
                }
                .padding(.bottom, 10)
            }
            .padding(20)
            .background(Color.white)
            .cornerRadius(30)
            .padding(.horizontal, 16)
            .padding(.bottom, 24)
        }
        .environment(\.layoutDirection, .rightToLeft) // ضبط الاتجاه العام للبطاقة
        .presentationBackground(.clear)
        .fullScreenCover(isPresented: $navigateToMain) {
            MainPage()
        }
    }
    
    // MARK: - Instruction Row Helper
    @ViewBuilder
    private func instructionRow(step: String, text: String) -> some View {
        HStack(spacing: 12) {
            Text(step)
                .font(.caption)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .frame(width: 22, height: 22)
                .background(Color(red: 0.05, green: 0.73, blue: 0.48))
                .clipShape(Circle())
            
            Text(.init(text))
                .font(.subheadline)
                .foregroundColor(Color(red: 0.2, green: 0.25, blue: 0.3))
        }
    }
    
    // MARK: - Helper Function
    private func openAppSettings() {
        if let settingsURL = URL(string: UIApplication.openSettingsURLString) {
            if UIApplication.shared.canOpenURL(settingsURL) {
                UIApplication.shared.open(settingsURL)
            }
        }
    }
}

// MARK: - Preview
#Preview {
    EnablePage()
}
