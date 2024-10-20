import {createUserProfile} from "../modules/auth";
import admin = require("firebase-admin");

// Mock Firestore methods
jest.mock("firebase-admin", () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
  };

  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => firestore),
  };
});

describe("onUserCreate", () => {
  it("creates a user", async () => {
    const userRecord = {
      uid: "testUID",
      email: "test@example.com",
      displayName: "Test User",
    };

    await createUserProfile(userRecord); // Call the function

    // Check if Firestore's set method was called
    expect(admin.firestore().collection("users").doc().set).toHaveBeenCalledWith({
      uid: "testUID",
      email: "test@example.com",
      displayName: "Test User",
      skills: [],
      preferences: {},
      availabilityDates: [],
    });
  });
});
