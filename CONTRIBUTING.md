# Contributing to IT Management Suite

Thank you for your interest in contributing to IT Management Suite! This document provides guidelines for contributing to our project.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Electron

### Development Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/it-management-suite.git
   cd it-management-suite
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed information about the bug
- Include steps to reproduce
- Add screenshots if applicable

### Suggesting Features
- Use the GitHub issue tracker with "enhancement" label
- Describe the feature clearly
- Explain the use case and benefits
- Consider implementation complexity

### Code Contributions
1. **Create a branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run build
   npm test
   ```

4. **Commit your changes**:
   ```bash
   git commit -m "Add: brief description of changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**

## 🎨 Coding Standards

### TypeScript/React
- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

### Code Style
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for components

### File Organization
- Keep components in `src/components/`
- Keep pages in `src/pages/`
- Keep services in `electron/services/`
- Use descriptive file names

## 🧪 Testing

### Before Submitting
- Test your changes thoroughly
- Ensure no console errors
- Test on different screen sizes
- Verify functionality works as expected

### Test Cases
- Unit tests for utility functions
- Integration tests for API calls
- UI tests for critical user flows
- Performance tests for heavy operations

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated if needed
- [ ] No console errors or warnings

### PR Description
- Clear title describing the change
- Detailed description of what was changed
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

### Review Process
- All PRs require review
- Address feedback promptly
- Keep PRs focused and small
- Update documentation as needed

## 🏷️ Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority
- `priority: low` - Low priority

## 📞 Getting Help

- Check existing issues and discussions
- Join our community discussions
- Contact maintainers for guidance
- Read the documentation thoroughly

## 🎯 Areas for Contribution

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Security enhancements
- Documentation improvements

### Medium Priority
- New features and enhancements
- UI/UX improvements
- Test coverage
- Code refactoring

### Low Priority
- Code style improvements
- Minor documentation updates
- Non-critical feature requests

## 📄 License

By contributing to IT Management Suite, you agree that your contributions will be licensed under the same proprietary license as the project.

## 🙏 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to IT Management Suite! 🚀


