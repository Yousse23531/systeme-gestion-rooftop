# Café Management System - Self-Contained App

This application has been configured to work as a self-contained desktop application using Electron. All data is stored locally on the user's machine, and the application can run completely offline.

## Features

- **Self-contained**: No internet connection required after installation
- **Local data storage**: All data is stored on the user's machine using both file system and localStorage for redundancy
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Automatic data persistence**: Data persists between application sessions

## Installation and Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm (usually comes with Node.js)

### Installation Steps

1. Download the application source code or installer
2. If you have the source code, navigate to the application directory in your terminal
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

To run the application in development mode:
```bash
npm run electron:dev
```

### Production Mode

To run the application in production mode:
```bash
npm start
# or
npm run electron
```

## Building the Application

To build the application for distribution:

### Windows
```bash
npm run package
```

### Cross-platform distribution
```bash
npm run electron:dist
```

The built application will be available in the `dist-electron` folder.

## Data Storage

The application stores data in two ways for maximum reliability:

1. **File System**: Data is stored in a dedicated folder on the user's machine:
   - Windows: `%APPDATA%\cafe-management-system\`
   - macOS: `~/Library/Application Support/cafe-management-system/`
   - Linux: `~/.config/cafe-management-system/`

2. **Browser Storage**: Data is also stored in localStorage as a backup

This dual storage approach ensures data persistence even if one storage method fails.

## Security

- The application requires a PIN to access (default: 2929 for access, 29173456 for deletion)
- All data remains on the user's local machine
- No data is transmitted over the internet

## Troubleshooting

If you encounter issues:

1. Make sure you have the latest version of Node.js installed
2. Clear the application data if needed (delete the data folder mentioned above)
3. Reinstall dependencies: `npm install`

## Support

For support, contact 7ekmaware Solutions.