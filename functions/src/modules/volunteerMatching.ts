import admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Function to match volunteers based on required skills
export const matchVolunteers = async (data: { eventId: string }) => {
  try {
    // Fetch event details to match volunteers
    const eventSnapshot = await admin.firestore().collection("events").doc(data.eventId).get();
    const eventData = eventSnapshot.data();

    if (eventData && eventData.requiredSkills) {
      // Find volunteers with the required skills
      const volunteersSnapshot = await admin.firestore().collection("users").where("skills", "array-contains-any", eventData.requiredSkills).get();

      const matchedVolunteers: { uid: string }[] = [];

      volunteersSnapshot.forEach((doc) => {
        matchedVolunteers.push({uid: doc.id});
      });

      return {matchedVolunteers}; // Return the matched volunteers
    }
  } catch (error) {
    console.error(`Error matching volunteers for eventId ${data.eventId}:`, error);
    throw new Error(error instanceof Error ? error.message : "An unexpected error occurred.");
  }

  // Fallback return if no volunteers were matched or if something goes wrong
  return {matchedVolunteers: []}; // Return an empty array as fallback
};
