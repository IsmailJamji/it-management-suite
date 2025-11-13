/**
 * AssetFlow AI PowerPoint Presentation Generator
 * Creates a 15-slide professional presentation about the IT Management Suite
 */

const PptxGenJS = require('pptxgenjs');

// Create presentation
const pptx = new PptxGenJS();

// Set presentation properties
pptx.author = 'IT Management Team';
pptx.company = 'AssetFlow AI';
pptx.title = 'AssetFlow AI - IT Management Platform';
pptx.subject = 'Intelligent IT & Finance Management Platform';

// Define color scheme
const colors = {
  primary: '2563EB',      // Blue
  secondary: '7C3AED',    // Purple
  accent: '10B981',       // Green
  dark: '1E293B',         // Dark slate
  light: 'F8FAFC',        // Light gray
  white: 'FFFFFF'
};

// ============================================
// SLIDE 1: Title Slide
// ============================================
let slide = pptx.addSlide();
slide.background = { color: colors.primary };

slide.addText('AssetFlow AI', {
  x: 0.5,
  y: 2.0,
  w: 9,
  h: 1.5,
  fontSize: 60,
  bold: true,
  color: colors.white,
  align: 'center'
});

slide.addText('Intelligent IT & Finance Management Platform', {
  x: 0.5,
  y: 3.5,
  w: 9,
  h: 0.8,
  fontSize: 28,
  color: colors.white,
  align: 'center'
});

slide.addText('Streamline Your IT Operations with AI-Powered Insights', {
  x: 0.5,
  y: 4.5,
  w: 9,
  h: 0.5,
  fontSize: 18,
  color: colors.white,
  align: 'center',
  italic: true
});

// ============================================
// SLIDE 2: Overview
// ============================================
slide = pptx.addSlide();
slide.addText('What is AssetFlow AI?', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

slide.addText([
  { text: 'AssetFlow AI', options: { bold: true, color: colors.primary } },
  { text: ' is a comprehensive, AI-powered enterprise management platform designed to streamline IT asset tracking, telecom management, financial operations, and project coordination.' }
], {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 1.2,
  fontSize: 18,
  color: colors.dark,
  valign: 'top'
});

const features = [
  '🖥️  Complete IT Asset Inventory Management',
  '📱  Telecom Equipment & Subscription Tracking',
  '💰  Financial Operations & Budget Management',
  '📊  Real-time Analytics & Reporting',
  '🤖  AI-Powered Insights & Recommendations',
  '👥  Multi-User Collaboration & Role-Based Access'
];

features.forEach((feature, index) => {
  slide.addText(feature, {
    x: 1.0,
    y: 3.0 + (index * 0.5),
    w: 8,
    h: 0.4,
    fontSize: 16,
    color: colors.dark,
    bullet: true
  });
});

// ============================================
// SLIDE 3: Problem Statement
// ============================================
slide = pptx.addSlide();
slide.addText('The Challenge', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const problems = [
  {
    title: '📋 Scattered Information',
    desc: 'IT assets tracked in spreadsheets, sticky notes, and multiple systems'
  },
  {
    title: '💸 Budget Overruns',
    desc: 'Lack of visibility into IT spending and telecom subscriptions'
  },
  {
    title: '⏰ Time-Consuming Tasks',
    desc: 'Manual data entry and reporting consuming valuable IT resources'
  },
  {
    title: '🔍 Limited Insights',
    desc: 'No actionable intelligence from existing data'
  },
  {
    title: '🔐 Security Concerns',
    desc: 'Difficulty tracking who has access to what equipment'
  }
];

problems.forEach((problem, index) => {
  slide.addText(problem.title, {
    x: 0.8,
    y: 1.8 + (index * 0.9),
    w: 8.5,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: colors.secondary
  });
  
  slide.addText(problem.desc, {
    x: 1.2,
    y: 2.1 + (index * 0.9),
    w: 8,
    h: 0.4,
    fontSize: 14,
    color: colors.dark
  });
});

// ============================================
// SLIDE 4: Solution Overview
// ============================================
slide = pptx.addSlide();
slide.addText('Our Solution', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

slide.addText('AssetFlow AI provides a unified platform that brings all your IT management needs under one roof:', {
  x: 0.5,
  y: 1.3,
  w: 9,
  h: 0.6,
  fontSize: 16,
  color: colors.dark
});

const solutions = [
  '✅ Centralized Asset Database',
  '✅ Automated Discovery & Tracking',
  '✅ Real-time System Monitoring',
  '✅ AI-Powered Analytics',
  '✅ Financial Management Tools',
  '✅ Secure Multi-User Access',
  '✅ Cloud & Local Deployment Options',
  '✅ Export & Reporting Capabilities'
];

let col1 = solutions.slice(0, 4);
let col2 = solutions.slice(4);

col1.forEach((item, index) => {
  slide.addText(item, {
    x: 0.8,
    y: 2.3 + (index * 0.6),
    w: 4,
    h: 0.5,
    fontSize: 16,
    color: colors.dark,
    bullet: { type: 'number' }
  });
});

col2.forEach((item, index) => {
  slide.addText(item, {
    x: 5.2,
    y: 2.3 + (index * 0.6),
    w: 4,
    h: 0.5,
    fontSize: 16,
    color: colors.dark,
    bullet: { type: 'number', numberStartAt: 5 }
  });
});

// ============================================
// SLIDE 5: Key Features - Dashboard
// ============================================
slide = pptx.addSlide();
slide.addText('Feature Spotlight: Dashboard', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

slide.addShape(pptx.ShapeType.rect, {
  x: 0.5,
  y: 1.5,
  w: 4,
  h: 4,
  fill: { color: colors.light }
});

slide.addText('📊', {
  x: 1.5,
  y: 2.5,
  w: 2,
  h: 1,
  fontSize: 72,
  align: 'center'
});

const dashboardFeatures = [
  '• Real-time KPI cards',
  '• Financial trend charts',
  '• Asset distribution graphs',
  '• System health monitoring',
  '• Quick action buttons',
  '• Customizable widgets',
  '• Dark/Light mode support'
];

dashboardFeatures.forEach((feature, index) => {
  slide.addText(feature, {
    x: 5.0,
    y: 1.8 + (index * 0.5),
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    color: colors.dark
  });
});

slide.addText('Get a complete overview of your IT infrastructure at a glance', {
  x: 0.5,
  y: 5.8,
  w: 9,
  h: 0.5,
  fontSize: 14,
  color: colors.secondary,
  italic: true,
  align: 'center'
});

// ============================================
// SLIDE 6: Key Features - IT Assets
// ============================================
slide = pptx.addSlide();
slide.addText('Feature Spotlight: IT Assets', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const assetFeatures = [
  {
    icon: '💻',
    title: 'Complete Inventory',
    desc: 'Track computers, laptops, servers, and peripherals'
  },
  {
    icon: '📸',
    title: 'Image Uploads',
    desc: 'Attach photos and documents to each asset'
  },
  {
    icon: '🏷️',
    title: 'Custom Fields',
    desc: 'Add custom attributes specific to your needs'
  },
  {
    icon: '🔄',
    title: 'Auto-Discovery',
    desc: 'Automatically detect devices on your network'
  },
  {
    icon: '📊',
    title: 'Status Tracking',
    desc: 'Monitor asset lifecycle from purchase to disposal'
  },
  {
    icon: '📤',
    title: 'Export Options',
    desc: 'Export to Excel, CSV, or JSON formats'
  }
];

assetFeatures.forEach((feature, index) => {
  const row = Math.floor(index / 2);
  const col = index % 2;
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5 + (col * 5),
    y: 1.5 + (row * 1.4),
    w: 4.5,
    h: 1.2,
    fill: { color: colors.light }
  });
  
  slide.addText(feature.icon, {
    x: 0.7 + (col * 5),
    y: 1.7 + (row * 1.4),
    w: 0.8,
    h: 0.8,
    fontSize: 32
  });
  
  slide.addText(feature.title, {
    x: 1.6 + (col * 5),
    y: 1.7 + (row * 1.4),
    w: 3.2,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.primary
  });
  
  slide.addText(feature.desc, {
    x: 1.6 + (col * 5),
    y: 2.1 + (row * 1.4),
    w: 3.2,
    h: 0.5,
    fontSize: 12,
    color: colors.dark
  });
});

// ============================================
// SLIDE 7: Key Features - Telecom Management
// ============================================
slide = pptx.addSlide();
slide.addText('Feature Spotlight: Telecom', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

slide.addText('Comprehensive telecom asset and subscription management', {
  x: 0.5,
  y: 1.3,
  w: 9,
  h: 0.4,
  fontSize: 16,
  color: colors.dark
});

const telecomFeatures = [
  '📱 Track phones, tablets, and accessories',
  '📡 Manage subscriptions and data plans',
  '💰 Monitor telecom expenses',
  '🏢 Provider-specific branding (Inwi, Orange, IAM)',
  '📊 Usage analytics and trends',
  '⚠️ Contract expiration alerts',
  '📈 Cost optimization recommendations'
];

telecomFeatures.forEach((feature, index) => {
  slide.addText(feature, {
    x: 1.0,
    y: 2.2 + (index * 0.55),
    w: 8,
    h: 0.5,
    fontSize: 16,
    color: colors.dark,
    bullet: true
  });
});

slide.addShape(pptx.ShapeType.rect, {
  x: 7.5,
  y: 5.0,
  w: 2,
  h: 1.2,
  fill: { color: colors.accent }
});

slide.addText('Save up to\n30%', {
  x: 7.5,
  y: 5.0,
  w: 2,
  h: 1.2,
  fontSize: 24,
  bold: true,
  color: colors.white,
  align: 'center',
  valign: 'middle'
});

slide.addText('on telecom costs', {
  x: 7.5,
  y: 6.3,
  w: 2,
  h: 0.3,
  fontSize: 12,
  color: colors.dark,
  align: 'center'
});

// ============================================
// SLIDE 8: Key Features - Finance Module
// ============================================
slide = pptx.addSlide();
slide.addText('Feature Spotlight: Finance', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const financeBoxes = [
  {
    title: 'Budget Management',
    items: ['Create budgets', 'Track spending', 'Set limits', 'Get alerts']
  },
  {
    title: 'Financial Records',
    items: ['Income tracking', 'Expense logging', 'Receipt storage', 'Audit trails']
  },
  {
    title: 'AI Insights',
    items: ['Spending patterns', 'Cost predictions', 'Optimization tips', 'Anomaly detection']
  }
];

financeBoxes.forEach((box, index) => {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5 + (index * 3.2),
    y: 1.5,
    w: 3.0,
    h: 3.5,
    fill: { color: colors.light }
  });
  
  slide.addText(box.title, {
    x: 0.5 + (index * 3.2),
    y: 1.7,
    w: 3.0,
    h: 0.5,
    fontSize: 18,
    bold: true,
    color: colors.primary,
    align: 'center'
  });
  
  box.items.forEach((item, itemIndex) => {
    slide.addText('✓ ' + item, {
      x: 0.7 + (index * 3.2),
      y: 2.4 + (itemIndex * 0.6),
      w: 2.6,
      h: 0.5,
      fontSize: 14,
      color: colors.dark
    });
  });
});

slide.addText('💱 Multi-Currency Support', {
  x: 0.5,
  y: 5.3,
  w: 9,
  h: 0.4,
  fontSize: 16,
  bold: true,
  color: colors.secondary,
  align: 'center'
});

slide.addText('Support for all world currencies with real-time conversion', {
  x: 0.5,
  y: 5.7,
  w: 9,
  h: 0.3,
  fontSize: 12,
  color: colors.dark,
  align: 'center'
});

// ============================================
// SLIDE 9: AI Assistant
// ============================================
slide = pptx.addSlide();
slide.addText('AI-Powered Intelligence', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

slide.addText('🤖', {
  x: 4.0,
  y: 1.5,
  w: 2,
  h: 1.5,
  fontSize: 96,
  align: 'center'
});

slide.addText('Integrated with DeepSeek AI', {
  x: 0.5,
  y: 3.2,
  w: 9,
  h: 0.5,
  fontSize: 20,
  bold: true,
  color: colors.secondary,
  align: 'center'
});

const aiFeatures = [
  'Natural language queries and commands',
  'Intelligent asset recommendations',
  'Predictive maintenance alerts',
  'Cost optimization suggestions',
  'Automated report generation',
  'Smart data analysis and insights'
];

aiFeatures.forEach((feature, index) => {
  slide.addText('• ' + feature, {
    x: 1.5,
    y: 4.0 + (index * 0.4),
    w: 7,
    h: 0.35,
    fontSize: 14,
    color: colors.dark
  });
});

// ============================================
// SLIDE 10: User Management & Security
// ============================================
slide = pptx.addSlide();
slide.addText('Security & Access Control', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const securityFeatures = [
  {
    title: '👥 Role-Based Access',
    desc: 'Admin, Manager, User, and Viewer roles with granular permissions'
  },
  {
    title: '🔐 Secure Authentication',
    desc: 'JWT-based authentication with session management'
  },
  {
    title: '📝 Audit Trails',
    desc: 'Complete logging of all user actions and changes'
  },
  {
    title: '🔒 Data Encryption',
    desc: 'Encrypted storage for sensitive information'
  },
  {
    title: '👤 User Profiles',
    desc: 'Detailed user information and department management'
  },
  {
    title: '⚙️ Permission System',
    desc: 'Fine-grained control over feature access'
  }
];

securityFeatures.forEach((feature, index) => {
  const row = Math.floor(index / 2);
  const col = index % 2;
  
  slide.addText(feature.title, {
    x: 0.7 + (col * 5),
    y: 1.8 + (row * 1.3),
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.secondary
  });
  
  slide.addText(feature.desc, {
    x: 0.7 + (col * 5),
    y: 2.2 + (row * 1.3),
    w: 4.5,
    h: 0.6,
    fontSize: 12,
    color: colors.dark
  });
});

// ============================================
// SLIDE 11: Technical Architecture
// ============================================
slide = pptx.addSlide();
slide.addText('Technical Architecture', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const techStack = [
  {
    layer: 'Frontend',
    tech: 'React 18 • TypeScript • Tailwind CSS • Shadcn/ui'
  },
  {
    layer: 'State Management',
    tech: 'Zustand • TanStack Query • React Hook Form'
  },
  {
    layer: 'Desktop Runtime',
    tech: 'Electron • Node.js • Express'
  },
  {
    layer: 'Database',
    tech: 'SQLite • Better-SQLite3 • SQLAlchemy ORM'
  },
  {
    layer: 'AI Integration',
    tech: 'DeepSeek AI • OpenAI API'
  },
  {
    layer: 'Export & Reports',
    tech: 'ExcelJS • XLSX • PDF Generation'
  }
];

techStack.forEach((item, index) => {
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.0,
    y: 1.8 + (index * 0.7),
    w: 8,
    h: 0.6,
    fill: { color: index % 2 === 0 ? colors.light : colors.white },
    line: { color: colors.primary, width: 1 }
  });
  
  slide.addText(item.layer, {
    x: 1.2,
    y: 1.9 + (index * 0.7),
    w: 2.5,
    h: 0.4,
    fontSize: 14,
    bold: true,
    color: colors.primary
  });
  
  slide.addText(item.tech, {
    x: 3.8,
    y: 1.9 + (index * 0.7),
    w: 5,
    h: 0.4,
    fontSize: 12,
    color: colors.dark
  });
});

// ============================================
// SLIDE 12: Deployment Options
// ============================================
slide = pptx.addSlide();
slide.addText('Flexible Deployment', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const deploymentOptions = [
  {
    icon: '💻',
    title: 'Local Mode',
    desc: 'Single PC installation for individual use',
    color: colors.primary
  },
  {
    icon: '🖥️',
    title: 'Server Mode',
    desc: 'Multi-user host for team collaboration',
    color: colors.secondary
  },
  {
    icon: '🌐',
    title: 'Client Mode',
    desc: 'Connect to existing server instance',
    color: colors.accent
  },
  {
    icon: '☁️',
    title: 'Cloud Sync',
    desc: 'OneDrive & Google Drive integration',
    color: '0EA5E9'
  }
];

deploymentOptions.forEach((option, index) => {
  const row = Math.floor(index / 2);
  const col = index % 2;
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5 + (col * 5),
    y: 1.8 + (row * 2.2),
    w: 4.5,
    h: 1.8,
    fill: { color: colors.light },
    line: { color: option.color, width: 3 }
  });
  
  slide.addText(option.icon, {
    x: 0.7 + (col * 5),
    y: 2.0 + (row * 2.2),
    w: 1,
    h: 0.8,
    fontSize: 48
  });
  
  slide.addText(option.title, {
    x: 1.8 + (col * 5),
    y: 2.1 + (row * 2.2),
    w: 2.9,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: option.color
  });
  
  slide.addText(option.desc, {
    x: 1.8 + (col * 5),
    y: 2.6 + (row * 2.2),
    w: 2.9,
    h: 0.6,
    fontSize: 13,
    color: colors.dark
  });
});

// ============================================
// SLIDE 13: Benefits & ROI
// ============================================
slide = pptx.addSlide();
slide.addText('Benefits & ROI', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const benefits = [
  {
    metric: '70%',
    desc: 'Reduction in manual data entry time'
  },
  {
    metric: '30%',
    desc: 'Cost savings on IT & telecom expenses'
  },
  {
    metric: '50%',
    desc: 'Faster asset tracking and reporting'
  },
  {
    metric: '100%',
    desc: 'Visibility into IT infrastructure'
  }
];

benefits.forEach((benefit, index) => {
  const col = index % 2;
  const row = Math.floor(index / 2);
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5 + (col * 5),
    y: 1.8 + (row * 2.0),
    w: 4.5,
    h: 1.6,
    fill: { color: colors.accent }
  });
  
  slide.addText(benefit.metric, {
    x: 0.5 + (col * 5),
    y: 2.0 + (row * 2.0),
    w: 4.5,
    h: 0.8,
    fontSize: 48,
    bold: true,
    color: colors.white,
    align: 'center'
  });
  
  slide.addText(benefit.desc, {
    x: 0.5 + (col * 5),
    y: 2.9 + (row * 2.0),
    w: 4.5,
    h: 0.4,
    fontSize: 14,
    color: colors.white,
    align: 'center'
  });
});

slide.addText('Transform your IT operations and see measurable results', {
  x: 0.5,
  y: 6.0,
  w: 9,
  h: 0.4,
  fontSize: 16,
  color: colors.secondary,
  italic: true,
  align: 'center'
});

// ============================================
// SLIDE 14: Use Cases
// ============================================
slide = pptx.addSlide();
slide.addText('Who Benefits?', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.6,
  fontSize: 36,
  bold: true,
  color: colors.primary
});

const useCases = [
  {
    title: '🏢 IT Departments',
    desc: 'Centralized asset and user management for enterprise IT teams'
  },
  {
    title: '🔧 MSPs',
    desc: 'Client infrastructure monitoring and management'
  },
  {
    title: '🏪 Small Businesses',
    desc: 'IT inventory and project tracking without complexity'
  },
  {
    title: '🎓 Educational Institutions',
    desc: 'Computer lab and device management for schools'
  },
  {
    title: '🌍 Remote Teams',
    desc: 'Cloud-synchronized IT operations across locations'
  },
  {
    title: '💼 Consultants',
    desc: 'Professional IT asset auditing and reporting'
  }
];

useCases.forEach((useCase, index) => {
  const row = Math.floor(index / 2);
  const col = index % 2;
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5 + (col * 5),
    y: 1.6 + (row * 1.4),
    w: 4.5,
    h: 1.1,
    fill: { color: colors.light }
  });
  
  slide.addText(useCase.title, {
    x: 0.7 + (col * 5),
    y: 1.75 + (row * 1.4),
    w: 4.1,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: colors.primary
  });
  
  slide.addText(useCase.desc, {
    x: 0.7 + (col * 5),
    y: 2.15 + (row * 1.4),
    w: 4.1,
    h: 0.5,
    fontSize: 12,
    color: colors.dark
  });
});

// ============================================
// SLIDE 15: Call to Action
// ============================================
slide = pptx.addSlide();
slide.background = { color: colors.primary };

slide.addText('Ready to Transform Your IT Operations?', {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 0.8,
  fontSize: 36,
  bold: true,
  color: colors.white,
  align: 'center'
});

slide.addShape(pptx.ShapeType.rect, {
  x: 2.0,
  y: 2.8,
  w: 6,
  h: 2.5,
  fill: { color: colors.white }
});

slide.addText('Get Started Today', {
  x: 2.0,
  y: 3.0,
  w: 6,
  h: 0.5,
  fontSize: 24,
  bold: true,
  color: colors.primary,
  align: 'center'
});

const ctaItems = [
  '✓ Download the installer',
  '✓ Choose your deployment mode',
  '✓ Start managing your IT assets',
  '✓ Experience AI-powered insights'
];

ctaItems.forEach((item, index) => {
  slide.addText(item, {
    x: 2.5,
    y: 3.7 + (index * 0.4),
    w: 5,
    h: 0.35,
    fontSize: 14,
    color: colors.dark
  });
});

slide.addText('Contact: ismail.jm.Jamji@gmail.com', {
  x: 0.5,
  y: 5.8,
  w: 9,
  h: 0.4,
  fontSize: 16,
  color: colors.white,
  align: 'center'
});

slide.addText('AssetFlow AI - Intelligent IT Management', {
  x: 0.5,
  y: 6.3,
  w: 9,
  h: 0.3,
  fontSize: 14,
  color: colors.white,
  align: 'center',
  italic: true
});

// Save presentation
pptx.writeFile({ fileName: 'AssetFlow-AI-Presentation.pptx' })
  .then(() => {
    console.log('✅ Presentation created successfully!');
    console.log('📄 File: AssetFlow-AI-Presentation.pptx');
    console.log('📊 Total slides: 15');
  })
  .catch(err => {
    console.error('❌ Error creating presentation:', err);
  });
