import {createEvent, updateEvent} from "../modules/eventManagement"; // Adjust the import path as necessary
import admin = require("firebase-admin");

// Mock Firestore methods
jest.mock("firebase-admin", () => {
  const firestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    add: jest.fn().mockResolvedValue({id: "testEventId"}), // Mock add method to return an event ID
    update: jest.fn().mockResolvedValue(undefined), // Mock update method
  };

  return {
    initializeApp: jest.fn(),
    firestore: jest.fn(() => firestore),
  };
});

describe("Event Management", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to ensure clean state
  });

  describe("createEvent", () => {
    it("creates an event", async () => {
      const eventData = {
        eventName: "Sample Event",
        eventDescription: "This is a sample event.",
        location: "Sample Location",
        requiredSkills: ["Skill1", "Skill2"],
        urgency: "High",
        eventDate: new Date().toISOString(),
      };

      const result = await createEvent(eventData); // Call the function

      // Check if Firestore's add method was called
      expect(admin.firestore().collection("events").add).toHaveBeenCalledWith({
        ...eventData,
        createdAt: expect.anything(), // Expecting a server timestamp
        status: "open",
      });

      // Check the returned result
      expect(result).toEqual({success: true, eventId: "testEventId"});
    });

    it("throws an error when event name validation fails", async () => {
      const invalidEventData = {
        eventDescription: "This is a sample event.",
        location: "Sample Location",
        requiredSkills: [],
        urgency: "High",
        eventDate: new Date().toISOString(),
      } as any;

      await expect(createEvent(invalidEventData)).rejects.toThrow("Event Name is required and cannot exceed 100 characters");
    });

    it("throws an error when event description validation fails", async () => {
      const invalidEventData = {
        eventName: "Sample Event",
        location: "Sample Location",
        requiredSkills: [],
        urgency: "High",
        eventDate: new Date().toISOString(),
      } as any;

      await expect(createEvent(invalidEventData)).rejects.toThrow("Event Description is required");
    });

    it("throws an error when location validation fails", async () => {
      const invalidEventData = {
        eventName: "Sample Event",
        eventDescription: "This is a sample event.",
        requiredSkills: [],
        urgency: "High",
        eventDate: new Date().toISOString(),
      } as any;

      await expect(createEvent(invalidEventData)).rejects.toThrow("Location is required");
    });

    it("throws an error when minimum skills required validation fails", async () => {
      const invalidEventData = {
        eventName: "Sample Event",
        eventDescription: "This is a sample event.",
        location: "Sample Location",
        requiredSkills: [],
        urgency: "High",
        eventDate: new Date().toISOString(),
      } as any;

      await expect(createEvent(invalidEventData)).rejects.toThrow("At least one required skill is required");
    });
  });

  describe("updateEvent", () => {
    it("updates an event", async () => {
      const updateData = {
        eventId: "existingEventId",
        eventName: "Updated Event Name",
        eventDescription: "Updated description.",
        location: "Updated Location",
        requiredSkills: ["Updated Skill1"],
        urgency: "Medium",
        eventDate: new Date().toISOString(),
      };

      const result = await updateEvent(updateData); // Call the function

      // Check if Firestore's update method was called
      expect(admin.firestore().collection("events").doc("existingEventId").update).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.anything(), // Expecting a server timestamp
      });

      // Check the returned result
      expect(result).toEqual({success: true});
    });

    it("throws an error when event ID is missing", async () => {
      const invalidUpdateData = {
        eventId: "", // Provide an empty string for eventId
        eventName: "Updated Event Name", // Other properties can be included as needed
      };

      await expect(updateEvent(invalidUpdateData)).rejects.toThrow("Event ID is required");
    });
  });
});
