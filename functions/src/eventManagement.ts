import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";

// Create an event
export const createEvent = functions.https.onCall(async (request: functions.https.CallableRequest<any>) => {
  try {
    validateEvent(request.data);

    const eventRef = await admin.firestore().collection("events").add({
      ...request.data,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "open",
    });

    return {success: true, eventId: eventRef.id};
  } catch (error) {
    console.error("Error creating event:", error);
    throw new functions.https.HttpsError("internal", "Unable to create event");
  }
});

// Update event details
export const updateEvent = functions.https.onCall(async (request: functions.https.CallableRequest<any>) => {
  const {eventId} = request.data;

  if (!eventId) {
    throw new functions.https.HttpsError("invalid-argument", "Event ID is required");
  }

  try {
    validateEvent(request.data);

    await admin.firestore().collection("events").doc(eventId).update({
      ...request.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true};
  } catch (error) {
    console.error(`Error updating event with ID ${eventId}:`, error);
    throw new functions.https.HttpsError("internal", "Unable to update event");
  }
});


// Validation function for events
const validateEvent = (data: any) => {
  const {eventName, eventDescription, location, requiredSkills, urgency, eventDate} = data;

  if (!eventName || eventName.length > 100) {
    throw new functions.https.HttpsError("invalid-argument", "Event Name is required and cannot exceed 100 characters");
  }
  if (!eventDescription) {
    throw new functions.https.HttpsError("invalid-argument", "Event Description is required");
  }
  if (!location) {
    throw new functions.https.HttpsError("invalid-argument", "Location is required");
  }
  if (!requiredSkills || requiredSkills.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "At least one required skill is required");
  }
  if (!urgency) {
    throw new functions.https.HttpsError("invalid-argument", "Urgency selection is required");
  }
  if (!eventDate) {
    throw new functions.https.HttpsError("invalid-argument", "Event Date is required");
  }
};
