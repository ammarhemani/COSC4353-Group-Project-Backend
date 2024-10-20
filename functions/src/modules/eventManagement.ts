import admin = require("firebase-admin");
import Firestore = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Create an event
export const createEvent = async (data: {
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: string;
  eventDate: string;
}) => {
  try {
    validateEvent(data); // Call the validation function

    const eventRef = await admin.firestore().collection("events").add({
      ...data,
      createdAt: Firestore.FieldValue.serverTimestamp(),
      status: "open",
    });

    console.log(`Event created with ID: ${eventRef.id}`);
    return {success: true, eventId: eventRef.id};
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
};

// Update event details
export const updateEvent = async (data: {
  eventId: string;
  eventName?: string;
  eventDescription?: string;
  location?: string;
  requiredSkills?: string[];
  urgency?: string;
  eventDate?: string;
}) => {
  const {eventId} = data;

  if (!eventId) {
    throw new Error("Event ID is required");
  }

  try {
    validateEvent(data);

    await admin.firestore().collection("events").doc(eventId).update({
      ...data,
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Event with ID ${eventId} updated successfully.`);
    return {success: true};
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw new Error("Unable to update event");
  }
};

// Validation function for events
const validateEvent = (data: any) => {
  const {eventName, eventDescription, location, requiredSkills, urgency, eventDate} = data;

  if (!eventName || eventName.length > 100) {
    throw new Error("Event Name is required and cannot exceed 100 characters");
  }
  if (!eventDescription) {
    throw new Error("Event Description is required");
  }
  if (!location) {
    throw new Error("Location is required");
  }
  if (!requiredSkills || requiredSkills.length === 0) {
    throw new Error("At least one required skill is required");
  }
  if (!urgency) {
    throw new Error("Urgency selection is required");
  }
  if (!eventDate) {
    throw new Error("Event Date is required");
  }
};
