# Contributing Guidelines - DKL Steps App

**Version**: 1.0.0
**Date**: 2025-11-03
**Status**: 📋 Active Guidelines

This document outlines the contribution process for the DKL Steps mobile application. Following these guidelines ensures smooth collaboration and maintains code quality across the project.

## 📋 Table of Contents

1. [Getting Started](#1-getting-started)
2. [Development Workflow](#2-development-workflow)
3. [Code Contribution Process](#3-code-contribution-process)
4. [Pull Request Guidelines](#4-pull-request-guidelines)
5. [Code Review Process](#5-code-review-process)
6. [Issue Reporting](#6-issue-reporting)
7. [Feature Requests](#7-feature-requests)
8. [Testing Requirements](#8-testing-requirements)
9. [Documentation Updates](#9-documentation-updates)
10. [Release Process](#10-release-process)

## 1. Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Git
- iOS Simulator (macOS) or Android Studio (all platforms)
- Basic knowledge of React Native, TypeScript, and Git

### Environment Setup
```bash
# 1. Fork the repository
git clone https://github.com/your-username/dkl-steps-app.git
cd dkl-steps-app

# 2. Install dependencies
npm install

# 3. Install Expo dependencies
npx expo install

# 4. Start development server
npm start

# 5. Run tests
npm test
```

### Development Environment
- Use VSCode with recommended extensions
- Enable ESLint and Prettier
- Configure auto-formatting on save
- Set up React Native development tools

## 2. Development Workflow

### Branching Strategy
```bash
# Feature branches
git checkout -b feature/add-step-counter-improvements

# Bug fix branches
git checkout -b fix/websocket-connection-issue

# Hotfix branches (from main)
git checkout -b hotfix/critical-security-patch

# Release branches
git checkout -b release/v1.1.0
```

### Commit Message Convention
```bash
# Format: type(scope): description

# Feature commits
feat(dashboard): add real-time step counter display
feat(websocket): implement connection retry logic

# Bug fixes
fix(auth): resolve login token expiration issue
fix(ui): fix button alignment on small screens

# Documentation
docs(readme): update installation instructions
docs(api): add websocket endpoint documentation

# Refactoring
refactor(components): extract reusable button component
refactor(hooks): optimize step tracking performance

# Testing
test(components): add unit tests for StepCounter
test(api): add integration tests for authentication

# Breaking changes
feat(auth)!: migrate to new authentication system
```

### Commit Best Practices
- Keep commits atomic and focused
- Write clear, descriptive commit messages
- Reference issue numbers when applicable
- Squash related commits before merging
- Use present tense in commit messages

## 3. Code Contribution Process

### Step 1: Choose or Create an Issue
- Check existing [GitHub Issues](../../issues) for tasks
- Create a new issue if your contribution doesn't exist
- Discuss the approach with maintainers if needed

### Step 2: Create a Feature Branch
```bash
# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Push the branch to GitHub
git push -u origin feature/your-feature-name
```

### Step 3: Implement Changes
- Follow the [STYLE_GUIDE.md](STYLE_GUIDE.md) for code standards
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass locally

### Step 4: Test Thoroughly
```bash
# Run unit tests
npm test

# Run linting
npm run lint

# Type checking
npm run type-check

# Manual testing on device/emulator
npm start
```

### Step 5: Submit Pull Request
- Ensure branch is up-to-date with main
- Write a clear PR description
- Reference related issues
- Request review from maintainers

## 4. Pull Request Guidelines

### PR Template
```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Related Issues
Fixes #123, Addresses #456

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed
- [ ] All tests pass

## Screenshots (if applicable)
Add screenshots of UI changes.

## Checklist
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] Tests written
- [ ] No breaking changes
- [ ] PR description is clear
```

### PR Best Practices
- Keep PRs focused on a single feature or fix
- Provide context and rationale for changes
- Include before/after screenshots for UI changes
- Test on both iOS and Android platforms
- Ensure CI checks pass

### PR Size Guidelines
- Small PRs (< 200 lines): Quick review
- Medium PRs (200-500 lines): Standard review
- Large PRs (> 500 lines): Break down into smaller PRs
- Very large PRs (> 1000 lines): Require discussion with maintainers

## 5. Code Review Process

### Review Checklist
#### Code Quality
- [ ] Follows [STYLE_GUIDE.md](STYLE_GUIDE.md)
- [ ] TypeScript types are correct
- [ ] No ESLint errors or warnings
- [ ] Code is readable and maintainable
- [ ] Functions have single responsibility

#### Functionality
- [ ] Requirements are met
- [ ] No breaking changes
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed

#### Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests added for API changes
- [ ] Existing tests still pass
- [ ] Edge cases are handled

#### Documentation
- [ ] Code is well-documented
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Breaking changes documented

### Review Process
1. **Automated Checks**: CI runs tests and linting
2. **Peer Review**: At least one maintainer reviews code
3. **Testing**: Reviewer tests functionality
4. **Approval**: PR approved or changes requested
5. **Merge**: Squash merge with descriptive commit message

### Review Comments
- Be constructive and specific
- Suggest improvements, don't just point out problems
- Explain reasoning for requested changes
- Acknowledge good practices and patterns

## 6. Issue Reporting

### Bug Reports
```markdown
## Bug Report

**Title:** Clear and descriptive title

**Description:**
Detailed description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What should happen.

**Actual Behavior:**
What actually happens.

**Environment:**
- Device: iPhone 12 / Pixel 5
- OS: iOS 15.2 / Android 12
- App Version: 1.0.0
- Backend Version: 2.1.0

**Screenshots:**
Attach screenshots if applicable.

**Additional Context:**
Any other relevant information.
```

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or improvement
- `documentation`: Documentation updates needed
- `question`: Further information needed
- `help wanted`: Good first issue for contributors
- `good first issue`: Suitable for new contributors

## 7. Feature Requests

### Feature Request Template
```markdown
## Feature Request

**Title:** Clear and descriptive title

**Problem:**
What problem does this solve?

**Solution:**
Describe the proposed solution.

**Alternatives:**
Describe alternative solutions considered.

**Additional Context:**
Screenshots, mockups, or examples.

**Acceptance Criteria:**
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3
```

### Feature Development Process
1. **Discussion**: Create issue and discuss approach
2. **Design**: Create technical specification if needed
3. **Implementation**: Develop feature following guidelines
4. **Testing**: Comprehensive testing including edge cases
5. **Documentation**: Update docs and create examples
6. **Release**: Include in next release cycle

## 8. Testing Requirements

### Test Coverage Requirements
- **Unit Tests**: 80%+ coverage for utilities and hooks
- **Component Tests**: All user-facing components
- **Integration Tests**: Critical user flows
- **E2E Tests**: Login → Dashboard → Feature usage

### Testing Guidelines
```typescript
// Unit test example
describe('useStepsWebSocket', () => {
  it('connects to WebSocket on mount', () => {
    const { result } = renderHook(() => useStepsWebSocket('user123'));
    expect(result.current.connected).toBe(false);
  });

  it('handles step updates', async () => {
    // Test implementation
  });
});

// Component test example
describe('StepCounter', () => {
  it('displays step count', () => {
    const { getByText } = render(<StepCounter onSync={() => {}} />);
    expect(getByText('0 steps')).toBeTruthy();
  });
});
```

### Test File Organization
```
src/
├── components/
│   ├── StepCounter.tsx
│   └── __tests__/
│       ├── StepCounter.test.tsx
│       └── StepCounter.test-utils.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── services/
    ├── api.ts
    └── __tests__/
        └── api.test.ts
```

## 9. Documentation Updates

### When to Update Documentation
- New features or components
- API changes
- Breaking changes
- Bug fixes that affect usage
- Security updates

### Documentation Standards
- Use clear, concise language
- Include code examples
- Update table of contents
- Test all code examples
- Follow existing documentation patterns

### Documentation Files
- `README.md`: User-facing documentation
- `docs/02-development/`: Developer documentation
- `docs/04-reference/`: API and technical references
- Inline code comments for complex logic

## 10. Release Process

### Release Types
- **Patch Release** (1.0.x): Bug fixes
- **Minor Release** (1.x.0): New features, backwards compatible
- **Major Release** (x.0.0): Breaking changes

### Release Checklist
#### Pre-Release
- [ ] All tests pass
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped in package.json and app.json

#### Release
- [ ] Create release branch
- [ ] Run final tests
- [ ] Build production APK/IPA
- [ ] Create GitHub release
- [ ] Update version tags

#### Post-Release
- [ ] Monitor crash reports
- [ ] Address urgent bug reports
- [ ] Plan next release cycle

### Version Numbering
Follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features, backwards compatible
- **PATCH**: Bug fixes, backwards compatible

## 🎯 Contribution Best Practices

### Communication
- Be respectful and constructive in discussions
- Ask questions when unsure
- Provide context for your changes
- Respond promptly to review comments

### Code Quality
- Follow the [STYLE_GUIDE.md](STYLE_GUIDE.md)
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused

### Testing
- Write tests for new functionality
- Test edge cases and error conditions
- Ensure backwards compatibility
- Test on multiple devices/platforms

### Documentation
- Document new features and APIs
- Update existing documentation
- Provide clear examples and usage
- Keep documentation current

## 🚀 Getting Help

### Resources
- [STYLE_GUIDE.md](STYLE_GUIDE.md) - Code standards
- [TESTING.md](TESTING.md) - Testing guidelines
- [DOCUMENTATIE.md](DOCUMENTATIE.md) - Technical documentation
- [FAQ.md](FAQ.md) - Common questions and solutions

### Contact
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub discussions for questions
- **Urgent**: Contact maintainers directly

## 📞 Recognition

Contributors are recognized through:
- GitHub contributor statistics
- Mention in release notes
- Attribution in documentation
- Recognition in project communications

## 🎉 Conclusion

Following these contribution guidelines ensures:
- High-quality code that meets project standards
- Smooth collaboration between contributors
- Maintainable and scalable codebase
- Positive contribution experience for everyone

Thank you for contributing to the DKL Steps App! 🚀

---

**Contributing Guidelines Status**: ✅ Active
**Last Updated**: 2025-11-03
**Version**: 1.0.0