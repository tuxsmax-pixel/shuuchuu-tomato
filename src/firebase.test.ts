const REQUIRED_FIREBASE_ENV = [
  "REACT_APP_FIREBASE_API_KEY",
  "REACT_APP_FIREBASE_AUTH_DOMAIN",
  "REACT_APP_FIREBASE_PROJECT_ID",
  "REACT_APP_FIREBASE_STORAGE_BUCKET",
  "REACT_APP_FIREBASE_MESSAGING_SENDER_ID",
  "REACT_APP_FIREBASE_APP_ID",
];

describe("firebase configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    REQUIRED_FIREBASE_ENV.forEach((key) => {
      delete process.env[key];
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  test("does not initialize Firebase when required environment variables are missing", () => {
    jest.doMock("firebase/app", () => ({
      initializeApp: jest.fn(() => ({ name: "mock-app" })),
    }));
    jest.doMock("firebase/auth", () => ({
      getAuth: jest.fn(() => ({ type: "mock-auth" })),
    }));
    jest.doMock("firebase/firestore", () => ({
      getFirestore: jest.fn(() => ({ type: "mock-db" })),
    }));

    const { initializeApp } = require("firebase/app");

    jest.isolateModules(() => {
      const firebase = require("./firebase");

      expect(firebase.isFirebaseConfigured).toBe(false);
      expect(firebase.app).toBeNull();
      expect(firebase.auth).toBeNull();
      expect(firebase.db).toBeNull();
    });

    expect(initializeApp).not.toHaveBeenCalled();
  });
});

export {};
