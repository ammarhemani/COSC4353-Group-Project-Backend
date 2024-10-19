import * as functions from "firebase-functions/v1";
import * as admin from "firebase-admin";

// Handle new user registration
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const {uid, email, displayName} = user;

  try {
    // Create user profile in Firestore
    await admin.firestore().collection("users").doc(uid).set({
      uid,
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      skills: [],
      preferences: {},
      availabilityDates: [],
    });

    console.log(`User profile created for ${uid}`);
  } catch (error) {
    console.error(`Error creating user profile for ${uid}:`, error);
  }
});
