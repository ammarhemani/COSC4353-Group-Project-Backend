import {matchVolunteers} from "../modules/volunteerMatching";
import admin = require("firebase-admin");

// Mock Firestore and Messaging methods
jest.mock("firebase-admin", () => {
  const firestore = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
      })),
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

describe("matchVolunteers", () => {
  const eventId = "test_event_id";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns matched volunteers successfully", async () => {
    // Mock skills
    const requiredSkills = ["skill1", "skill2"];

    const docMock = {
      get: jest.fn().mockResolvedValue({
        data: () => ({requiredSkills}),
      }),
    };
    const collectionMock = {
      doc: jest.fn(() => docMock),
    };
    const firestoreMock = {
      collection: jest.fn(() => collectionMock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestoreMock);

    // Mock volunteers
    const volunteerData = [
      {id: "volunteer1", skills: ["skill1"]},
      {id: "volunteer2", skills: ["skill2"]},
    ];

    const doc2Mock = {
      get: jest.fn().mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          volunteerData.forEach((volunteer) => callback({id: volunteer.id}));
        },
      }),
    };
    const collection2Mock = {
      where: jest.fn(() => doc2Mock),
      doc: jest.fn(() => docMock),
    };
    const firestore2Mock = {
      collection: jest.fn(() => collection2Mock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestore2Mock);

    const result = await matchVolunteers({eventId});

    expect(result).toEqual({
      matchedVolunteers: [
        {uid: "volunteer1"},
        {uid: "volunteer2"},
      ],
    });
  });

  it("returns empty matched volunteers if no skills match", async () => {
    const requiredSkills = ["nonexistentSkill"];

    const docMock = {
      get: jest.fn().mockResolvedValue({
        data: () => ({requiredSkills}),
      }),
    };
    const collectionMock = {
      doc: jest.fn(() => docMock),
    };
    const firestoreMock = {
      collection: jest.fn(() => collectionMock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestoreMock);

    const doc2Mock = {
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn(), // No volunteers to iterate over
      }),
    };
    const collection2Mock = {
      where: jest.fn(() => doc2Mock),
      doc: jest.fn(() => docMock),
    };
    const firestore2Mock = {
      collection: jest.fn(() => collection2Mock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestore2Mock);

    (admin.firestore().collection("users").where("skills", "array-contains-any", requiredSkills).get as jest.Mock).mockResolvedValue({
      forEach: jest.fn(), // No volunteers to iterate over
    });

    const result = await matchVolunteers({eventId});

    expect(result).toEqual({
      matchedVolunteers: [],
    });
  });

  it("throws an error when there is an issue fetching event data", async () => {
    // Mock skills
    const requiredSkills = ["skill1", "skill2"];
    const docMock = {
      get: jest.fn().mockResolvedValue({
        data: () => ({requiredSkills}),
      }),
    };

    const doc2Mock = {
      get: jest.fn().mockRejectedValue(new Error("Firestore error")),
    };

    const collection2Mock = {
      where: jest.fn(() => doc2Mock),
      doc: jest.fn(() => docMock),
    };
    const firestore2Mock = {
      collection: jest.fn(() => collection2Mock),
    };
    (admin.firestore as any as jest.Mock).mockReturnValue(firestore2Mock);

    await expect(matchVolunteers({eventId})).rejects.toThrow("Firestore error");
  });

  it("throws an error when there is an issue fetching volunteers", async () => {
    const requiredSkills = ["skill1"];

    (admin.firestore().collection("events").doc(eventId).get as jest.Mock).mockResolvedValue({
      data: () => ({requiredSkills}),
    });

    (admin.firestore().collection("users").where("skills", "array-contains-any", requiredSkills).get as jest.Mock).mockRejectedValue(new Error("Firestore error"));

    await expect(matchVolunteers({eventId})).rejects.toThrow("Firestore error");
  });
});
