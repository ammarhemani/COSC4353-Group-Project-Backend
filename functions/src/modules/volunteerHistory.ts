import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Get volunteer history
export const getVolunteerHistory = async (uid: string) => {
  if (!uid) {
    throw new Error("User not authenticated");
  }

  try {
    // Fetch the volunteer's participation history
    const historySnapshot = await admin.firestore().collection("volunteer_history").where("volunteerId", "==", uid).get();

    const history: { id: string }[] = [];

    historySnapshot.forEach((doc) => {
      history.push({id: doc.id});
    });

    return {history}; // Return the history array
  } catch (error) {
    console.error(`Error fetching volunteer history for ${uid}:`, error);
    throw new Error("Unable to fetch volunteer history");
  }
};
