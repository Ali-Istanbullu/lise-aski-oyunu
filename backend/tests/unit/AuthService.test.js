/**
 * AuthService.test.js — Unit testler
 */

const AuthService = require('../../src/services/AuthService');

// Mock UserRepository — DI sayesinde test edilebilir
class MockUserRepository {
  constructor() {
    this.users = [];
    this.nextId = 1;
  }
  findByEmail(email) {
    return this.users.find(u => u.email === email);
  }
  findByUsername(username) {
    return this.users.find(u => u.username === username);
  }
  findById(id) {
    return this.users.find(u => u.id === id);
  }
  create({ username, email, passwordHash }) {
    const user = { id: this.nextId++, username, email, password_hash: passwordHash };
    this.users.push(user);
    return { id: user.id, username, email };
  }
}

describe('AuthService', () => {
  let authService;
  let mockRepo;

  beforeEach(() => {
    mockRepo = new MockUserRepository();
    authService = new AuthService(mockRepo);
  });

  // ── register ──────────────────────────────────────────
  describe('register()', () => {
    it('geçerli veriyle kullanıcı kaydeder ve token döner', async () => {
      const result = await authService.register('kerem', 'kerem@test.com', 'sifre123');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.username).toBe('kerem');
    });

    it('kısa kullanıcı adında hata fırlatır', async () => {
      await expect(
        authService.register('ke', 'k@test.com', 'sifre123')
      ).rejects.toThrow('en az 3 karakter');
    });

    it('geçersiz emailde hata fırlatır', async () => {
      await expect(
        authService.register('kerem', 'gecersiz-email', 'sifre123')
      ).rejects.toThrow('e-mail');
    });

    it('kısa şifrede hata fırlatır', async () => {
      await expect(
        authService.register('kerem', 'kerem@test.com', '123')
      ).rejects.toThrow('en az 6 karakter');
    });

    it('var olan emailde hata fırlatır', async () => {
      await authService.register('kerem', 'kerem@test.com', 'sifre123');
      await expect(
        authService.register('kerem2', 'kerem@test.com', 'sifre123')
      ).rejects.toThrow('zaten kullanımda');
    });

    it('var olan kullanıcı adında hata fırlatır', async () => {
      await authService.register('kerem', 'kerem@test.com', 'sifre123');
      await expect(
        authService.register('kerem', 'kerem2@test.com', 'sifre123')
      ).rejects.toThrow('zaten alınmış');
    });
  });

  // ── login ─────────────────────────────────────────────
  describe('login()', () => {
    beforeEach(async () => {
      await authService.register('kerem', 'kerem@test.com', 'sifre123');
    });

    it('doğru bilgilerle giriş yapar', async () => {
      const result = await authService.login('kerem@test.com', 'sifre123');
      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('yanlış şifrede hata fırlatır', async () => {
      await expect(
        authService.login('kerem@test.com', 'yanlis')
      ).rejects.toThrow('hatalı');
    });

    it('olmayan emailde hata fırlatır', async () => {
      await expect(
        authService.login('yok@test.com', 'sifre123')
      ).rejects.toThrow('hatalı');
    });

    it('eksik alanlarla hata fırlatır', async () => {
      await expect(
        authService.login('', 'sifre123')
      ).rejects.toThrow('gereklidir');
    });
  });

  // ── verifyToken ───────────────────────────────────────
  describe('verifyToken()', () => {
    it('geçerli token doğrular', async () => {
      const { token } = await authService.register('kerem', 'kerem@test.com', 'sifre123');
      const payload = authService.verifyToken(token);
      expect(payload).toHaveProperty('userId');
    });

    it('geçersiz token hata fırlatır', () => {
      expect(() => authService.verifyToken('gecersiz-token')).toThrow('Geçersiz');
    });
  });
});
