import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const matchVolunteers = functions.https.onCall(async (request: functions.https.CallableRequest<any>) => {
  const data = request.data;

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
    if (error instanceof Error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }

  // Fallback return if no volunteers were matched or if something goes wrong
  return {matchedVolunteers: []}; // Return an empty array as fallback
});
