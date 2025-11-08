# 🌊 Whitewater Rapids Mobile App

iOS and Android mobile application for the Whitewater Rapids community platform.

## 📱 Features

- **Interactive Map** - Browse rapids on native maps (Apple Maps/Google Maps)
- **Rapid Details** - View comprehensive rapid information
- **Community Discussions** - Read and post beta, trip reports, and questions
- **User Authentication** - Secure login and registration
- **Offline Support** - View previously loaded rapids without internet
- **Native Performance** - Smooth, native-feeling experience

## 🛠️ Tech Stack

- **React Native** with Expo
- **React Navigation** - Native navigation
- **React Native Maps** - Native map components
- **Async Storage** - Persistent local storage
- **Axios** - API communication

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Expo Go app on your physical device (for testing)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### Running on Devices

**iOS Simulator (Mac only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
1. Install Expo Go from App Store or Google Play
2. Run `npm start`
3. Scan the QR code with your camera (iOS) or Expo Go app (Android)

## ⚙️ Configuration

### Backend API URL

Update the API URL in `src/services/api.js`:

```javascript
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

**Note:** For physical devices, use your computer's IP address (not `localhost`).

**Finding your IP:**
- Mac: System Preferences → Network
- Windows: `ipconfig`
- Linux: `ifconfig` or `ip addr`

### Google Maps API Key

For Android, you need a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project or select existing
3. Enable "Maps SDK for Android" and "Maps SDK for iOS"
4. Create API key
5. Add to `app.json`:

```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
      }
    }
  },
  "ios": {
    "config": {
      "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
    }
  }
}
```

## 📂 Project Structure

```
mobile/
├── src/
│   ├── screens/           # App screens
│   │   ├── MapScreen.js           # Map view with rapids
│   │   ├── RapidDetailScreen.js   # Rapid details and discussions
│   │   └── AuthScreen.js          # Login/Register
│   ├── components/        # Reusable components
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.js
│   ├── services/          # API services
│   │   └── api.js
│   └── context/           # React context (Auth)
│       └── AuthContext.js
├── assets/                # Images, icons, fonts
├── App.js                 # Root component
└── app.json               # Expo configuration
```

## 🎨 Screens

### Map Screen
- Interactive map showing all rapids
- Color-coded difficulty markers
- Search by name or river
- Filter by difficulty class
- Tap markers to view rapid details

### Rapid Detail Screen
- Comprehensive rapid information
- Flow data and conditions
- Hazards and access notes
- Community discussions
- Post new discussions (authenticated users)

### Auth Screen
- Login / Register toggle
- Secure authentication
- Skip option for browsing

## 🔑 Key Libraries

- `@react-navigation/native` - Navigation framework
- `react-native-maps` - Native map components
- `@react-native-async-storage/async-storage` - Persistent storage
- `axios` - HTTP client
- `expo` - Development toolchain

## 📦 Building for Production

### iOS (requires Mac with Xcode)

```bash
# Build for TestFlight/App Store
expo build:ios
```

### Android

```bash
# Build APK
expo build:android -t apk

# Build Android App Bundle (for Google Play)
expo build:android -t app-bundle
```

## 🐛 Debugging

**Metro Bundler Issues:**
```bash
npx expo start -c
```

**iOS Simulator Not Opening:**
```bash
# Open simulator manually
open -a Simulator
```

**Android Emulator Issues:**
- Ensure Android Studio is installed
- Check AVD Manager for available emulators
- Verify ANDROID_HOME environment variable

## 📝 Development Tips

1. **Fast Refresh** - Saves automatically reload the app
2. **Shake device** - Opens developer menu
3. **Remote Debugging** - Use Chrome DevTools
4. **Console Logs** - Visible in Metro Bundler terminal

## 🚀 Deployment

### iOS App Store

1. Join Apple Developer Program ($99/year)
2. Create app in App Store Connect
3. Build with `expo build:ios`
4. Submit for review

### Google Play Store

1. Create Google Play Developer account ($25 one-time)
2. Create app listing
3. Build with `expo build:android -t app-bundle`
4. Upload to Google Play Console

## 🔧 Troubleshooting

**API Connection Failed:**
- Verify backend is running
- Check API_BASE_URL in `src/services/api.js`
- For physical devices, use computer's IP (not localhost)
- Disable firewall/antivirus temporarily

**Maps Not Showing:**
- Ensure Google Maps API key is configured (Android)
- Check internet connection
- Verify permissions in app.json

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

## 📱 Testing

- **iOS:** iPhone SE (minimum) to iPhone 15 Pro Max
- **Android:** Android 5.0 (API 21) to latest
- Test on both phones and tablets

## 🎯 Future Enhancements

- [ ] Offline mode with cached rapids
- [ ] Push notifications for flow alerts
- [ ] Photo upload from camera
- [ ] GPS navigation to put-in/take-out
- [ ] Favorite rapids
- [ ] Share rapids with friends
- [ ] Dark mode

## 📄 License

MIT License - feel free to use for your own projects!

---

**Built with ❤️ for the paddling community**
