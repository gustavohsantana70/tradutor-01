import { AuthUser } from "../types";

const MOCK_JWT_HEADER = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const MOCK_JWT_PAYLOAD = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkxlZ2FsIFBybyIsImlhdCI6MTUxNjIzOTAyMn0";
const MOCK_JWT_SIGNATURE = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export const login = async (email: string, password: string): Promise<AuthUser> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (password === "password" || password.length > 3) {
    const token = `${MOCK_JWT_HEADER}.${MOCK_JWT_PAYLOAD}.${MOCK_JWT_SIGNATURE}`;
    const user: AuthUser = {
      email,
      name: email.split('@')[0],
      token
    };
    localStorage.setItem('lexigen_user', JSON.stringify(user));
    return user;
  }
  
  throw new Error("Invalid credentials");
};

export const logout = () => {
  localStorage.removeItem('lexigen_user');
};

export const getCurrentUser = (): AuthUser | null => {
  const stored = localStorage.getItem('lexigen_user');
  return stored ? JSON.parse(stored) : null;
};