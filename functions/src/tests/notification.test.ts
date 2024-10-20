import {sendNotification} from "../modules/notification";
import admin = require("firebase-admin");

// Mock Firestore and Messaging methods
jest.mock("firebase-admin", () => {
  const firestore = {
    collection: jest.fn(() => ({
      get: jest.fn(),
    })),
  };

  const messaging = {
    sendToDevice: jest.fn(),
  };

  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => firestore),
    messaging: jest.fn(() => messaging),
  };
});

describe("sendNotification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends a notification successfully", async () => {
    const tokens = ["token1", "token2"];
    const title = "Test Title";
    const body = "Test Body";

    const result = await sendNotification(tokens, title, body);

    const payload = {
      notification: {
        title: title,
        body: body,
      },
    };

    // Check if the sendToDevice method was called with correct parameters
    expect(admin.messaging().sendToDevice).toHaveBeenCalledWith(
      ["token1", "token2"],
      payload
    );
    expect(result).toEqual({success: true}); // Expecting success response
  });

  it("returns success false if no tokens are found", async () => {
    const tokens = [];
    const title = "Test Title";
    const body = "Test Body";

    const result = await sendNotification(tokens, title, body);

    expect(result).toEqual({success: false}); // Expecting success response
    expect(admin.messaging().sendToDevice).not.toHaveBeenCalled(); // No send if no tokens
  });

  it("throws an error when there's an issue", async () => {
    // Mock Firestore to throw an error
    (admin.messaging().sendToDevice as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    const tokens = ["token1", "token2"];
    const title = "Test Title";
    const body = "Test Body";

    await expect(sendNotification(tokens, title, body)).rejects.toThrow("Firestore error");
  });
});
