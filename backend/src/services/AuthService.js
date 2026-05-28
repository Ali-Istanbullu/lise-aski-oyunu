/**
 * AuthService.js — Kimlik doğrulama iş mantığı
 * SOLID: Single Responsibility — Sadece auth işlemleri
 * SOLID: Dependency Inversion — userRepo ve jwt inject edilir
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'lise-aski-secret-key-2024';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const SALT_ROUNDS = 12;

class AuthService {
  /**
   * @param {import('../repositories/UserRepository')} userRepository
   */
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Yeni kullanıcı kaydı
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {{ user: object, token: string }}
   * @throws {Error} Kullanıcı zaten varsa
   */
  async register(username, email, password) {
    this._validateRegistration(username, email, password);

    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) throw new Error('Bu e-mail adresi zaten kullanımda.');

    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) throw new Error('Bu kullanıcı adı zaten alınmış.');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.userRepository.create({ username, email, passwordHash });
    const token = this._generateToken(user.id);

    return { user, token };
  }

  /**
   * Kullanıcı girişi
   * @param {string} email
   * @param {string} password
   * @returns {{ user: object, token: string }}
   * @throws {Error} Geçersiz kimlik bilgisi
   */
  async login(email, password) {
    if (!email || !password) throw new Error('E-mail ve şifre gereklidir.');

    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new Error('E-mail veya şifre hatalı.');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new Error('E-mail veya şifre hatalı.');

    const token = this._generateToken(user.id);
    const { password_hash, ...safeUser } = user;

    return { user: safeUser, token };
  }

  /**
   * JWT token doğrula
   * @param {string} token
   * @returns {{ userId: number }}
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error('Geçersiz veya süresi dolmuş token.');
    }
  }

  // ---- Private Methods ----

  _generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  }

  _validateRegistration(username, email, password) {
    if (!username || username.length < 3)
      throw new Error('Kullanıcı adı en az 3 karakter olmalı.');
    if (!email || !email.includes('@'))
      throw new Error('Geçerli bir e-mail adresi girin.');
    if (!password || password.length < 6)
      throw new Error('Şifre en az 6 karakter olmalı.');
  }
}

module.exports = AuthService;
