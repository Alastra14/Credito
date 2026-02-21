# Credito

Credito is a comprehensive personal finance and credit management application built with React Native and Expo. It helps users track their debts, manage payments, and visualize their financial progress with an intuitive and modern interface.

## Features

- **Credit Tracking**: Add and manage multiple credits, loans, and debts.
- **Payment Management**: Record payments, track due dates, and view payment history.
- **Dashboard & Analytics**: Visualize your total debt, monthly payments, and progress with interactive charts.
- **Projections**: Calculate and visualize how different payment strategies affect your debt payoff timeline.
- **Multi-language Support**: Available in Spanish, English, and Japanese.
- **Dark Mode**: Full support for light, dark, and system-default themes with a polished UI.
- **Local Storage**: All data is securely stored locally on your device using SQLite.
- **Data Backup**: Export and import your database to keep your data safe or transfer it between devices.

## Tech Stack

- **Framework**: React Native with Expo
- **Routing**: Expo Router (File-based routing)
- **Database**: Expo SQLite
- **Styling**: Custom Theme Context with dynamic color palettes
- **Icons**: Expo Vector Icons (Ionicons)
- **Charts**: React Native Chart Kit
- **Fonts**: Google Fonts (Space Grotesk)

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your iOS or Android device (for physical device testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Alastra14/Credito.git
   cd Credito
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Open the app:
   - Scan the QR code with the Expo Go app on your physical device.
   - Press `a` to open in the Android Emulator.
   - Press `i` to open in the iOS Simulator.

## Project Structure

- `/app`: Expo Router file-based navigation screens.
- `/src/components`: Reusable UI components (cards, forms, charts, etc.).
- `/src/lib`: Utility functions, constants, database configuration, and Context providers (Theme, Language).
- `/src/types`: TypeScript type definitions.
- `/assets`: Images, fonts, and other static assets.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
