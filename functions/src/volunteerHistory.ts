import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const getVolunteerHistory = functions.https.onCall(async (request: functions.https.CallableRequest<any>) => {
  const data = request.data;

  try {
    // Fetch the volunteer's participation history
    const historySnapshot = await admin.firestore().collection("volunteer_history").where("volunteerId", "==", data.uid).get();

    const history: { id: string }[] = [];

    historySnapshot.forEach((doc) => {
      history.push({id: doc.id});
    });

    return {history}; // Return the history array
  } catch (error) {
    if (error instanceof Error) {
      throw new functions.https.HttpsError("internal", error.message);
    }
  }

  // Fallback return in case the try-catch block doesn't cover the execution
  return {history: []}; // Return an empty history array as fallback
});
