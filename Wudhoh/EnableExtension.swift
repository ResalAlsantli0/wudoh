import SwiftUI
import UIKit

struct EnableExtensionView: View {

    var body: some View {

        ZStack {

            Color(red: 0.97, green: 0.97, blue: 0.98)
                .ignoresSafeArea()

            VStack(spacing: 24) {

                Image("Logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 110, height: 110)

                
                Text("اتبع الخطوات التالية لتفعيل إضافة Safari حتى تتمكن من استخدام تطبيق وضوح.")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)

                VStack(alignment: .trailing, spacing: 18) {

                    StepRow(number: "1", text: "افتح الإعدادات")
                    StepRow(number: "2", text: "انتقل إلى التطبيقات")
                    StepRow(number: "3", text: "اختر Safari")
                    StepRow(number: "4", text: "اضغط على الإضافات")
                    StepRow(number: "5", text: "فعّل وضوح")

                }
                .environment(\.layoutDirection, .rightToLeft)
                .padding()
                .background(Color.white)
                .cornerRadius(20)

                Spacer()

                Button {

                    if let url = URL(string: UIApplication.openSettingsURLString) {
                        UIApplication.shared.open(url)
                    }

                } label: {

                    Text("فتح الإعدادات")
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Color(red: 0.05, green: 0.73, blue: 0.48))
                        .cornerRadius(14)

                }
            }
            .padding(24)
        }
        .navigationTitle("الإعدادات")
        .navigationBarTitleDisplayMode(.inline)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

struct StepRow: View {

    let number: String
    let text: String

    var body: some View {

        HStack(spacing: 12) {

            ZStack {
                Circle()
                    .fill(Color(red: 0.05, green: 0.73, blue: 0.48))
                    .frame(width: 30, height: 30)

                Text(number)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }

            Text(text)
                .foregroundColor(Color(red: 0.15, green: 0.22, blue: 0.32))
                .multilineTextAlignment(.trailing)

            Spacer()
        }
    }
}

#Preview {
    NavigationStack {
        EnableExtensionView()
            .environment(\.layoutDirection, .rightToLeft)
    }
}
