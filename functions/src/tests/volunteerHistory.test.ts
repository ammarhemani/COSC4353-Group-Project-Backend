import {getVolunteerHistory} from "../modules/volunteerHistory";
import admin = require("firebase-admin");

// Mock Firestore methods
jest.mock("firebase-admin", () => {
  const firestore = {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
  };

  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => firestore),
  };
});

describe("getVolunteerHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches volunteer history successfully", async () => {
    const uid = "testUid";
    const mockHistory = [{id: "doc1"}, {id: "doc2"}];

    const docMock = {
      get: jest.fn().mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockHistory.forEach((doc) => callback({id: doc.id}));
        },
      }),
    };
    const collectionMock = {
      where: jest.fn(() => docMock),
    };
    const firestoreMock = {
      collection: jest.fn(() => collectionMock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestoreMock);

    const result = await getVolunteerHistory(uid);

    expect(result).toEqual({history: mockHistory}); // Expecting the mocked history
    expect(admin.firestore().collection).toHaveBeenCalledWith("volunteer_history"); // Ensure collection was called
  });

  it("throws an error if user is not authenticated", async () => {
    await expect(getVolunteerHistory("")).rejects.toThrow("User not authenticated");
  });

  it("throws an error when Firestore fetch fails", async () => {
    const uid = "testUid";
    (admin.firestore().collection("volunteer_history").where("volunteerId", "==", uid).get as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    await expect(getVolunteerHistory(uid)).rejects.toThrow("Unable to fetch volunteer history");
  });
});
