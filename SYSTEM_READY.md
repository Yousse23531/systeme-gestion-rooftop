# Café Management System - Standalone Version

## 🚀 Quick Start (No Commands Required)

### Option 1: Direct Launch
1. **Double-click `standalone.html`** for instructions and launch
2. **Or directly open `dist/index.html`** in your browser

### Option 2: Development Server
1. Open terminal in this folder
2. Run: `npm run dev`
3. Open: `http://localhost:3000`

## ✅ All Features Implemented

### 🔄 Reset System
- **Reset buttons** in all sections (Achats, Maintenance, Recettes)
- **Data archiving** - all reset data goes to historique sections
- **Complete monthly reset** with dashboard data storage

### 📊 New Historique Sections
- **Historique Achats** - All archived purchases by month
- **Historique Maintenances** - All archived maintenance records by month
- **Enhanced Mois Precedents** - Complete dashboard data with month names

### 💰 Enhanced Salary System
- **Smart calculation** - Uses `salaireTotal` when provided, falls back to daily calculation
- **Proper deductions** - For fixed salaries, only deducts advances
- **Clear display** - Shows calculation method in breakdown

### 📱 Standalone Operation
- **No server setup** required
- **Direct file opening** supported
- **Multiple launch options** available

## 🎯 Key Features

### Financial Management
- ✅ Complete expense tracking (Salaries, Maintenance, Purchases)
- ✅ Revenue tracking with detailed breakdowns
- ✅ Profit calculation: `Recettes - (Salaires + Maintenance + Achats)`
- ✅ PDF export for all data types

### Personnel Management
- ✅ Employee management with presence tracking
- ✅ Salary calculation (fixed or daily-based)
- ✅ Advance payment tracking
- ✅ Sick leave management

### Data Management
- ✅ Monthly archiving system
- ✅ Complete historique sections
- ✅ Data persistence in browser
- ✅ Export capabilities

### User Experience
- ✅ Modern, responsive UI
- ✅ Intuitive navigation
- ✅ Confirmation dialogs for important actions
- ✅ Toast notifications for feedback

## 🔧 Technical Details

### Storage System
- **Local Storage**: All data stored in browser
- **Historique Functions**: Separate storage for archived data
- **Reset Functions**: Complete data archiving before reset
- **Monthly Archives**: Dashboard data with month names

### Reset Process
1. **Individual Section Reset**: Archives data to respective historique
2. **Complete Reset**: Archives all data to monthly archives
3. **Employee Reset**: Resets counters and presences
4. **System Update**: Updates current period settings

## 📋 Usage Instructions

### First Time Setup
1. Add employees in "Personnel" section
2. Configure articles in "Articles" section
3. Start recording purchases and sales

### Monthly Reset Process
1. Use individual reset buttons in each section
2. Or use complete reset for full monthly archive
3. Check "Les Mois Précédents" for historical data
4. View "Historique Achats" and "Historique Maintenances" for detailed archives

### Data Export
- Use PDF export buttons in each section
- All exports are readable and properly formatted
- Data includes complete breakdowns and calculations

## 🎉 System Ready!

The system is now fully functional with:
- ✅ Complete reset functionality
- ✅ Historique sections for all data
- ✅ Enhanced salary calculations
- ✅ Standalone operation capability
- ✅ No command-line requirements

**Launch the system by opening `standalone.html` or `dist/index.html` directly in your browser!**
