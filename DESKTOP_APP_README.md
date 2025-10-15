# Café Management System - Desktop App

## 🖥️ Desktop Application

This is the desktop version of the Café Management System, built with Electron. It provides the exact same functionality as the web version but runs as a native desktop application.

## 🚀 Quick Start

### Option 1: Development Mode (Recommended for testing)
```bash
npm run electron:dev
```
This will:
- Start the Vite development server
- Launch the Electron desktop app
- Enable hot reload for development

### Option 2: Production Mode
```bash
npm run electron:dist
```
This will:
- Build the web application
- Create a distributable desktop app
- Output to `dist-electron/` folder

### Option 3: Direct Launch
```bash
node desktop-launcher.js
```
For development mode:
```bash
node desktop-launcher.js --dev
```

## 📱 Features

### ✅ Exact Same Functionality
- **Complete Reset System**: Dashboard and individual section resets
- **Historique Sections**: All archived data with month grouping
- **Enhanced Dashboard**: Individual expense categories and profit calculation
- **PDF Export**: All data can be exported to readable PDFs
- **Personnel Management**: Employee tracking with presence management
- **Financial Management**: Complete expense and revenue tracking

### 🖥️ Desktop-Specific Features
- **Native Window**: Runs as a desktop application
- **App Icon**: Uses `hikma.jpg` as the application icon
- **Menu Bar**: Native application menu with standard options
- **Window Controls**: Minimize, maximize, close functionality
- **Keyboard Shortcuts**: Standard desktop shortcuts
- **File System Access**: Direct access to local file system

## 🎯 App Icon

The application uses `public/hikma.jpg` as its icon for:
- Window icon
- Taskbar icon
- Installer icon
- App icon in system

## 📦 Building Distributables

### Windows
```bash
npm run electron:dist
```
Creates:
- NSIS installer (`.exe`)
- Portable executable

### macOS
```bash
npm run electron:dist
```
Creates:
- DMG installer
- App bundle

### Linux
```bash
npm run electron:dist
```
Creates:
- AppImage
- DEB package
- RPM package

## 🔧 Development

### Project Structure
```
├── electron/
│   └── main.js          # Electron main process
├── src/                 # React application (same as web)
├── public/
│   └── hikma.jpg       # App icon
├── dist/               # Built web application
├── dist-electron/      # Desktop app distributables
└── desktop-launcher.js # Desktop app launcher
```

### Development Workflow
1. **Start Development Server**:
   ```bash
   npm run electron:dev
   ```

2. **Make Changes**: Edit files in `src/` directory
   - Changes are automatically reflected in the desktop app
   - Hot reload works seamlessly

3. **Test Features**: All web functionality works identically
   - Reset functionality
   - PDF exports
   - Data management
   - All UI components

4. **Build for Distribution**:
   ```bash
   npm run electron:dist
   ```

## 🎨 User Interface

### Identical to Web Version
- **Same Design**: Exact same UI/UX as web version
- **Same Components**: All React components work identically
- **Same Functionality**: All features work the same way
- **Same Data**: Uses the same localStorage for data persistence

### Desktop Enhancements
- **Native Window**: Proper desktop window behavior
- **Menu Bar**: Standard application menu
- **Window Controls**: Native minimize/maximize/close
- **Keyboard Shortcuts**: Standard desktop shortcuts
- **File Dialogs**: Native file system access

## 📊 Data Management

### Local Storage
- **Same as Web**: Uses browser localStorage
- **Data Persistence**: All data saved locally
- **No Server Required**: Completely offline capable
- **Backup**: Data can be exported to PDF

### Reset Functionality
- **Dashboard Reset**: Complete system reset with archiving
- **Section Resets**: Individual section resets
- **Historique Storage**: All archived data properly stored
- **Monthly Archives**: Complete dashboard data with month names

## 🚀 Deployment

### For End Users
1. **Download**: Get the installer from `dist-electron/`
2. **Install**: Run the installer (Windows) or mount DMG (macOS)
3. **Launch**: Start the application from desktop or start menu
4. **Use**: Identical to web version with desktop benefits

### For Developers
1. **Clone Repository**: Get the source code
2. **Install Dependencies**: `npm install`
3. **Development**: `npm run electron:dev`
4. **Build**: `npm run electron:dist`

## 🔒 Security

### Electron Security
- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled for security
- **Web Security**: Enabled
- **External Links**: Opened in default browser

### Data Security
- **Local Storage**: All data stored locally
- **No Network**: No external connections required
- **Offline Capable**: Works without internet
- **Data Export**: Secure PDF export functionality

## 📱 System Requirements

### Minimum Requirements
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 or later
- **Linux**: Ubuntu 18.04 or later
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB for application

### Recommended
- **RAM**: 8GB or more
- **Storage**: 1GB free space
- **Display**: 1200x800 minimum resolution

## 🎉 Ready to Use!

The desktop app provides the exact same functionality as the web version with the added benefits of:
- ✅ **Native desktop experience**
- ✅ **App icon using hikma.jpg**
- ✅ **Offline operation**
- ✅ **Better performance**
- ✅ **Native file system access**
- ✅ **Standard desktop shortcuts**
- ✅ **Professional appearance**

**Launch the desktop app with `npm run electron:dev` for development or `npm run electron:dist` for production!**




