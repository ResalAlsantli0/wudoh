//
//  acssesPage.swift
//  Wudhoh
//

import SwiftUI

struct acssesPage: View {
        @State private var showPopup = true
        var body: some View {
            ZStack {
                
                VStack {

                    Spacer()
                }

                if showPopup {


                    Color.black.opacity(0.45)
                        .ignoresSafeArea()

        
                    PopupMessage(showPopup: $showPopup)
                }
            }
            .animation(.easeInOut, value: showPopup)
        }
    }

    struct PopupMessage: View {
        @Binding var showPopup: Bool

        var body: some View {
            VStack(spacing: 20) {

                Image("logo")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 70, height: 70)

                Text("Turn on Wudhoh for Safari")
                    .font(.system(size: 20, weight: .semibold))
                    .multilineTextAlignment(.center)

                Text("Wudhoh needs to be enabled as a Safari extension to highlight policies for you.")
                    .font(.system(size: 15))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 24)

                VStack(spacing: 12) {

                    Button("Go to Settings") {
                        print("Go to Settings tapped")
                    }
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .cornerRadius(12)

                    Button("Not now") {
                    
                        showPopup = false
                    }
                    .font(.system(size: 17))
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color(.systemGray5))
                    .cornerRadius(12)
                }
            }
            .padding(24)
            .background(Color.white)
            .cornerRadius(20)
            .shadow(radius: 20)
            .padding(.horizontal, 32)
        }
    }
#Preview {
    acssesPage()
}
