import {updateUserProfile} from "../modules/userProfile";
import admin = require("firebase-admin");

// Mock Firestore methods
jest.mock("firebase-admin", () => {
  const firestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        update: jest.fn(),
      })),
    })),
  };

  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => firestore),
  };
});

describe("updateUserProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates user profile successfully", async () => {
    const uid = "testUID";
    const data = {
      fullName: "Test User",
      address1: "123 Main St",
      city: "Test City",
      state: "CA",
      zipCode: "12345",
      skills: ["JavaScript"],
      availabilityDates: ["2024-01-01"],
    };

    const result = await updateUserProfile(uid, data);
    expect(result).toEqual({success: true});
  });

  it("throws an error if user is not authenticated", async () => {
    await expect(updateUserProfile("", {})).rejects.toThrow("User not authenticated");
  });

  it("throws an error if full name validation fails", async () => {
    const uid = "testUID";
    const invalidData = {
      fullName: "",
      address1: "123 Main St",
      city: "Test City",
      state: "CA",
      zipCode: "12345",
      skills: [],
      availabilityDates: [],
    };

    await expect(updateUserProfile(uid, invalidData)).rejects.toThrow("Full Name is required and cannot exceed 50 characters");
  });

  it("throws an error if address1 validation fails", async () => {
    const uid = "testUID";
    const invalidData = {
      fullName: "Test User",
      address1: "",
      city: "Test City",
      state: "CA",
      zipCode: "12345",
      skills: [],
      availabilityDates: [],
    };

    await expect(updateUserProfile(uid, invalidData)).rejects.toThrow("Address 1 is required and cannot exceed 100 characters");
  });

  it("throws an error if city validation fails", async () => {
    const uid = "testUID";
    const invalidData = {
      fullName: "Test User",
      address1: "123 Main St",
      city: "",
      state: "CA",
      zipCode: "12345",
      skills: [],
      availabilityDates: [],
    };

    await expect(updateUserProfile(uid, invalidData)).rejects.toThrow("City is required and cannot exceed 100 characters");
  });

  it("throws an error if state validation fails", async () => {
    const uid = "testUID";
    const invalidData = {
      fullName: "Test User",
      address1: "123 Main St",
      city: "Test City",
      state: "",
      zipCode: "12345",
      skills: [],
      availabilityDates: [],
    };

    await expect(updateUserProfile(uid, invalidData)).rejects.toThrow("State code is required and must be 2 characters");
  });

  it("throws an error if zipcode validation fails", async () => {
    const uid = "testUID";
    const invalidData = {
      fullName: "Test User",
      address1: "123 Main St",
      city: "Test City",
      state: "CA",
      zipCode: "22",
      skills: [],
      availabilityDates: [],
    };

    await expect(updateUserProfile(uid, invalidData)).rejects.toThrow("Zip code must be between 5 to 9 characters long");
  });

  it("throws an error when Firestore update fails", async () => {
    const uid = "testUID";
    const data = {
      fullName: "Test User",
      address1: "123 Main St",
      city: "Test City",
      state: "CA",
      zipCode: "12345",
      skills: ["JavaScript"],
      availabilityDates: ["2024-01-01"],
    };

    const docMock = {
      update: jest.fn().mockRejectedValue(new Error("Firestore error")),
    };
    const collectionMock = {
      doc: jest.fn(() => docMock),
    };
    const firestoreMock = {
      collection: jest.fn(() => collectionMock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestoreMock);

    await expect(updateUserProfile(uid, data)).rejects.toThrow("Firestore error");
  });
});
