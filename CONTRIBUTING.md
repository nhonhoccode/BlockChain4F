# Contributing Guidelines

## Welcome Contributors!

Thank you for your interest in contributing to the Blockchain Administrative Management System.

## Development Workflow

### 1. Setup Development Environment
```bash
# Clone the repository
git clone <repository-url>
cd blockchain-administrative-management

# Install dependencies
npm run install:all

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm start
```

### 2. Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation updates

### 3. Commit Message Format
```
type(scope): brief description

Detailed explanation of changes made.

Fixes #issue-number
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### 4. Pull Request Process
1. Create a feature branch from `develop`
2. Make your changes with proper tests
3. Ensure all tests pass
4. Update documentation if needed
5. Submit pull request to `develop` branch
6. Request code review from team members

## Code Standards

### Frontend (React)
- Use functional components with hooks
- Follow Material-UI design patterns
- Write unit tests for components
- Use TypeScript for type safety

### Backend (Django)
- Follow PEP 8 style guidelines
- Write comprehensive unit tests
- Use Django REST Framework patterns
- Implement proper error handling

### Blockchain
- Follow Hyperledger Fabric best practices
- Write chaincode tests
- Document smart contract functions
- Implement proper error handling

## Testing Requirements
- Minimum 80% code coverage
- All tests must pass before merging
- Write both unit and integration tests
- Include end-to-end tests for critical paths

## Documentation
- Update README for new features
- Document API changes
- Include inline code comments
- Update user guides when needed

## Questions?
- Create an issue for discussions
- Contact the maintainers
- Check existing documentation first 