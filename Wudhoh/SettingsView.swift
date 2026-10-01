//
//  SettingsView.swift
//  Wudhoh
//

import SwiftUI

struct SettingsView: View {
    
    var body: some View {
        
        List {
            
            NavigationLink {
                EnableExtensionView()
            } label: {
                SettingRow(
                    icon: "gearshape.fill",
                    title: "إعداد إضافة وضوح"
                )
            }

            NavigationLink {
                PrivacyView()
            } label: {
                SettingRow(
                    icon: "lock.shield.fill",
                    title: "الخصوصية والأمان"
                )
            }
        }
        .listStyle(.plain)
        .navigationTitle("الإعدادات")
        .navigationBarTitleDisplayMode(.inline)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

struct SettingRow: View {
    
    let icon: String
    let title: String

    var body: some View {
        
        HStack(spacing: 15) {

            RoundedRectangle(cornerRadius: 8)
                .fill(Color.gray.opacity(0.15))
                .frame(width: 34, height: 34)
                .overlay {
                    Image(systemName: icon)
                        .foregroundColor(.gray)
                }

            Text(title)
                .font(.body)
                .foregroundColor(.primary)

            Spacer()
        }
        .padding(.vertical, 8)
    }
}

// صفحة الخصوصية والأمان
struct PrivacyView: View {
    
    var body: some View {
        
        VStack {
            Text("الخصوصية والأمان")
                .font(.title2)
                .fontWeight(.bold)
        }
        .navigationTitle("الخصوصية والأمان")
        .navigationBarTitleDisplayMode(.inline)
        .environment(\.layoutDirection, .rightToLeft)
    }
}

#Preview {
    NavigationStack {
        SettingsView()
    }
}
