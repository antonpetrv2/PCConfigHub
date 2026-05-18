import { SignJWT, jwtVerify } from "jose";

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
  name: string;
};

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
};

export const signAuthToken = async (payload: AuthTokenPayload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
};

export const verifyAuthToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify<AuthTokenPayload>(token, getJwtSecret());
    return payload;
  } catch {
    return null;
  }
};
