import admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Function to create user profile in Firestore
export const createUserProfile = async (user: { uid: string; email: string; displayName?: string }) => {
  const {uid, email, displayName} = user;

  try {
    // Create user profile in Firestore
    await admin.firestore().collection("users").doc(uid).set({
      uid,
      email,
      displayName,
      skills: [],
      preferences: {},
      availabilityDates: [],
    });

    console.log(`User profile created for ${uid}`);
  } catch (error) {
    console.error(`Error creating user profile for ${uid}:`, error);
  }
};
