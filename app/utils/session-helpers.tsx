import { createSessionStorage } from "@remix-run/node";
import * as database from "~/shared/database";

export const storage = createSessionStorage({
  cookie: {
    name: "__session",
    secrets: [process.env.SECRET],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
  createData: async (data: Record<string, any>, expires?: Date) => {
    try {
      const sessionId = await database.createSession(data, expires);
      return sessionId.toString(); // Ensure the sessionId is returned as a string
    } catch (error) {
      console.error('Error creating session:', error);
      throw new Error('Failed to create session');
    }
  },
  readData: async (id: string) => {
    try {
      const sessionData = await database.readSession(Number(id));
      return sessionData;
    } catch (error) {
      console.error('Error reading session:', error);
      return null; // Return null if there's an error reading the session
    }
  },
  updateData: async (id: string, data: Record<string, any>, expires?: Date) => {
    try {
      const existingSession = await database.readSession(Number(id));
      if (existingSession) {
        await database.updateSession(Number(id), data, expires);
        return id;
      } else {
        const newSessionId = await database.createSession(data, expires);
        return newSessionId.toString();
      }
    } catch (error) {
      console.error('Error updating session:', error);
      throw new Error('Failed to update session');
    }
  },
  deleteData: async (id: string) => {
    try {
      await database.deleteSession(Number(id));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  }
});

export const getCompanyIdFromCookie = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null; // Return null if no cookie is present
  }
  const session = await storage.getSession(cookieHeader);
  return session ? session.get('companyId') : null;
};

export const getAccessTokenFromCookie = async (request: Request) => {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null; // Return null if no cookie is present
  }
  const session = await storage.getSession(cookieHeader);
  return session ? session.get('noonaAccessToken') : null;
};
