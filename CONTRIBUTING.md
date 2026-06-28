# Contributing to TradeHub

Terima kasih telah tertarik untuk berkontribusi pada TradeHub! Dokumentasi ini akan memandu Anda melalui proses kontribusi.

## Code of Conduct

Kami berkomitmen untuk menyediakan komunitas yang welcoming dan inclusive. Semua kontributor diharapkan mengikuti [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to Contribute

### 1. Fork Repository
```bash
# Fork repository via GitHub interface
# Clone fork Anda
git clone https://github.com/YOUR_USERNAME/TradeHub.git
cd TradeHub
git remote add upstream https://github.com/DanangHaristianto/TradeHub.git
```

### 2. Create Feature Branch
```bash
# Update main branch
git checkout main
git fetch upstream
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Ikuti coding standards di project
- Write clean, readable code
- Add comments untuk complex logic
- Test changes secara menyeluruh

### 4. Commit Changes
```bash
git add .
git commit -m "type: brief description

Detailed description of changes here.
Explain why changes were made.

Fixes #123"
```

Commit message format:
```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build/tooling changes

### 5. Push Changes
```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request
1. Go to GitHub dan create PR
2. Fill out PR template completely
3. Link ke related issues
4. Request review dari maintainers

### 7. Address Review Comments
- Respond ke feedback
- Make requested changes
- Push updates (rebasing tidak diperlukan)

## Development Setup

See [SETUP.md](./docs/SETUP.md) untuk detailed setup instructions.

```bash
# Install dependencies & start dev environment
docker-compose up -d
cd backend && npm install
cd ../frontend && npm install
```

## Coding Standards

### TypeScript
- Use strict mode
- Add type annotations
- Avoid `any` type
- Use interfaces untuk objects

### Naming Conventions
```typescript
// Variables & functions: camelCase
const userName = 'John';
function getUserById() {}

// Classes & Types: PascalCase
class UserService {}
interface IUser {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
```

### File Organization
```
src/
├── apps/
│   └── user/
│       ├── entities/
│       ├── services/
│       ├── controllers/
│       ├── repositories/
│       ├── types.ts
│       └── index.ts
├── shared/
├── config/
└── types/
```

### Error Handling
```typescript
// Use custom error classes
class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

// Throw meaningful errors
throw new ValidationError('Email already exists');
```

## Testing

### Write Tests
```bash
cd backend
npm run test
npm run test:coverage

cd ../frontend
npm run test
npm run test:coverage
```

### Test Coverage
- Aim untuk >80% coverage
- Test edge cases
- Mock external services
- Use descriptive test names

```typescript
describe('UserService', () => {
  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123';
      const expectedUser = { id: userId, name: 'John' };
      
      // Act
      const user = await service.getUserById(userId);
      
      // Assert
      expect(user).toEqual(expectedUser);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const userId = 'nonexistent';
      
      // Act & Assert
      await expect(service.getUserById(userId))
        .rejects
        .toThrow('User not found');
    });
  });
});
```

## Documentation

### Update Documentation
- Update README.md untuk major changes
- Add JSDoc comments untuk functions
- Update API docs untuk new endpoints
- Create/update guides jika diperlukan

### JSDoc Example
```typescript
/**
 * Get user by ID
 * @param {string} userId - The user ID
 * @returns {Promise<User>} The user object
 * @throws {NotFoundError} When user not found
 */
async getUserById(userId: string): Promise<User> {
  // Implementation
}
```

## Performance Guidelines

- Use pagination untuk large datasets
- Implement caching untuk expensive operations
- Optimize database queries dengan indexes
- Lazy load components di frontend
- Monitor bundle size

## Security Guidelines

- Never commit secrets (use .env)
- Validate all inputs
- Use parameterized queries
- Implement rate limiting
- Follow OWASP guidelines
- Regular dependency updates

## PR Review Checklist

- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (atau documented)
- [ ] Performance impact analyzed
- [ ] Security reviewed
- [ ] Build passes CI
- [ ] Commits are clean & descriptive

## Common Issues

### Merge Conflicts
```bash
# Update from upstream
git fetch upstream
git rebase upstream/main

# Resolve conflicts manually, then:
git add .
git rebase --continue
git push origin feature/name -f
```

### Need to Update PR Branch
```bash
git fetch upstream
git rebase upstream/main
git push origin feature/name -f
```

### Large PR
- Preferably keep PR <= 400 lines
- Split large features ke multiple PRs
- Start dengan core functionality
- Build incrementally

## Getting Help

- Ask questions di PR comments
- Create discussion di GitHub Discussions
- Join Discord community
- Email: support@tradehub.io

## Rewards

Contributors aktif akan:
- Listed di README
- Invited ke core team
- Early access ke features
- Potential monetary rewards

## License

By contributing, Anda agree bahwa contributions akan licensed under MIT License.

---

Terima kasih atas kontribusinya! 🎉
