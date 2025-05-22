/**
 * Unit tests for User model
 */
const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const UserModel = require('../../src/models/user');

describe('User Model', () => {
  let sequelize;
  let User;

  beforeAll(async () => {
    // Setup in-memory SQLite database for testing
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false,
    });
    
    // Initialize User model
    User = UserModel(sequelize);
    
    // Sync model with database
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a user with hashed password', async () => {
    // Create a test user
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const user = await User.create(userData);

    // Check that user was created
    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    
    // Check that password was hashed
    expect(user.password).not.toBe(userData.password);
    
    // Verify password can be compared correctly
    const passwordMatch = await user.comparePassword(userData.password);
    expect(passwordMatch).toBe(true);
    
    const wrongPasswordMatch = await user.comparePassword('wrongpassword');
    expect(wrongPasswordMatch).toBe(false);
  });

  it('should update user password with hash when changed', async () => {
    // Create a test user
    const user = await User.create({
      username: 'updateuser',
      email: 'update@example.com',
      password: 'originalpassword',
    });

    // Store original hashed password
    const originalPassword = user.password;

    // Update password
    user.password = 'newpassword';
    await user.save();

    // Check that password was updated and hashed
    expect(user.password).not.toBe(originalPassword);
    expect(user.password).not.toBe('newpassword');

    // Verify new password works
    const passwordMatch = await user.comparePassword('newpassword');
    expect(passwordMatch).toBe(true);
  });

  it('should create a user with GitHub OAuth credentials', async () => {
    // Create a test OAuth user
    const oauthUser = await User.create({
      username: 'githubuser',
      email: 'github@example.com',
      githubId: '12345',
      password: null, // No password for OAuth users
    });

    expect(oauthUser).toBeDefined();
    expect(oauthUser.githubId).toBe('12345');
    expect(oauthUser.password).toBeNull();

    // Verify comparePassword returns false for OAuth users
    const passwordMatch = await oauthUser.comparePassword('anypassword');
    expect(passwordMatch).toBe(false);
  });
});
