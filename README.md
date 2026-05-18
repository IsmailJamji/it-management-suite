# 🖥️ IT Management Suite

**A comprehensive desktop application for managing IT infrastructure, assets, and operations with AI-powered insights and multi-user collaboration.**

## 🚀 Overview

IT Management Suite is a modern, feature-rich desktop application built with **Electron**, **React**, and **TypeScript** that provides a centralized platform for managing IT assets, telecom equipment, users, projects, and system monitoring. Perfect for IT departments, MSPs, and organizations looking to streamline their IT operations.

## ✨ Key Features

### 🏢 **Asset Management**
- **IT Assets**: Track computers, laptops, servers, and peripherals
- **Telecom Assets**: Manage phones, tablets, and accessories with provider-specific branding (Inwi, Orange, IAM)
- **Real-time Monitoring**: CPU, memory, disk usage, and system health tracking
- **Automated Discovery**: Auto-detect and register devices on the network

### 👥 **User & Permission Management**
- **Role-based Access Control**: Admin, Manager, User, and Viewer roles
- **Secure Authentication**: JWT-based login with session management
- **Permission System**: Granular control over user access and capabilities
- **User Profiles**: Complete user information and department management

### 📊 **Dashboard & Analytics**
- **Modern Dashboard**: Real-time overview with performance charts
- **Visual Analytics**: Interactive charts and graphs for system metrics
- **Customizable Views**: Tailored dashboards for different user roles
- **Export Capabilities**: Excel, CSV, and JSON export with advanced styling

### 🤖 **AI Assistant**
- **Intelligent Recommendations**: AI-powered suggestions for IT management
- **System Analysis**: Automated health analysis and issue detection
- **Task Optimization**: AI-assisted task prioritization and management
- **Natural Language Interface**: Conversational AI for queries and support

### 🌐 **Multi-User Collaboration**
- **Network Sharing**: Server/Client architecture for team collaboration
- **Cloud Sync**: OneDrive and Google Drive integration
- **Real-time Updates**: Synchronized data across multiple users
- **Offline Support**: Local mode for standalone operation

### 📋 **Project & Task Management**
- **Project Organization**: Create and manage IT projects
- **Task Assignment**: Assign tasks to team members with priorities
- **Progress Tracking**: Visual progress monitoring and completion status
- **Timeline Management**: Project deadlines and milestone tracking

## 🛠️ Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Electron, Node.js, Express
- **Database**: SQLite with Better-SQLite3
- **AI Integration**: OpenAI API for intelligent features
- **Export**: ExcelJS for advanced Excel formatting
- **System Info**: SystemInformation for hardware monitoring

## 🚀 Installation & Setup

### System Requirements
- **OS**: Windows 10/11 (64-bit)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Network**: For multi-user features

### Quick Start
1. **Download** the latest Windows build from **[Releases](https://github.com/IsmailJamji/it-management-suite/releases/latest)**  
   - `IT.Suite.Setup.1.0.1.exe` — installateur  
   - `IT-Suite-Portable.exe` — version portable
2. **Run** as Administrator
3. **Choose** your mode:
   - **Local**: Single PC use
   - **Server**: Multi-user host
   - **Client**: Connect to server
   - **Cloud**: OneDrive/Google Drive sync
4. **Login** with default credentials:
   - Email: `admin@itmanagement.com`
   - Password: `admin123`

## 🌟 Use Cases

- **IT Departments**: Centralized asset and user management
- **Managed Service Providers**: Client infrastructure monitoring
- **Small Businesses**: IT inventory and project tracking
- **Educational Institutions**: Computer lab and device management
- **Remote Teams**: Cloud-synchronized IT operations

## 📱 Screenshots



## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup
```bash
git clone https://github.com/IsmailJamji/it-management-suite.git
cd it-management-suite
npm install
npm run dev
```

### Build
```bash
npm run build:installer
```

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START_GUIDE.md)** - Get started in 5 minutes
- **[User Manual](docs/USER_MANUAL.md)** - Complete feature reference
- **[Installation Guide](docs/INSTALLATION_GUIDE.md)** - Detailed setup instructions
- **[Network Setup](docs/NETWORK_SETUP_GUIDE.md)** - Multi-user configuration
- **[Troubleshooting](docs/TROUBLESHOOTING_FAQ.md)** - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under a proprietary license. All rights reserved. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/IsmailJamji/it-management-suite/issues)
- **Documentation**: [Full Documentation](docs/)
- **Email**: ismail.jm.Jamji@gmail.com

## 🎯 Roadmap

- [ ] Mobile companion app
- [ ] Advanced reporting module
- [ ] Integration with popular ITSM tools
- [ ] Multi-language support
- [ ] Advanced AI features
- [ ] API for third-party integrations

---

**Built with ❤️ for IT professionals who want to streamline their operations and focus on what matters most.**
