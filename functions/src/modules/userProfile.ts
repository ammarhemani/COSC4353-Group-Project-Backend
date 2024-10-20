import * as admin from "firebase-admin";
import Firestore = require("firebase-admin/firestore");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Update user profile details
export const updateUserProfile = async (uid: string, data: any) => {
  if (!uid) {
    throw new Error("User not authenticated");
  }

  try {
    validateUserProfile(data);

    await admin.firestore().collection("users").doc(uid).update({
      ...data,
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });

    return {success: true};
  } catch (error) {
    console.error(`Error updating user profile for ${uid}:`, error);
    throw error;
  }
};

// Validation function for user profile
const validateUserProfile = (data: any) => {
  const {fullName, address1, address2, city, state, zipCode, skills, availabilityDates} = data;

  if (!fullName || fullName.length > 50) {
    throw new Error("Full Name is required and cannot exceed 50 characters");
  }
  if (!address1 || address1.length > 100) {
    throw new Error("Address 1 is required and cannot exceed 100 characters");
  }
  if (address2 && address2.length > 100) {
    throw new Error("Address 2 cannot exceed 100 characters");
  }
  if (!city || city.length > 100) {
    throw new Error("City is required and cannot exceed 100 characters");
  }
  if (!state || state.length !== 2) {
    throw new Error("State code is required and must be 2 characters");
  }
  if (!zipCode || zipCode.length < 5 || zipCode.length > 9) {
    throw new Error("Zip code must be between 5 to 9 characters long");
  }
  if (!skills || skills.length === 0) {
    throw new Error("At least one skill is required");
  }
  if (availabilityDates.length === 0) {
    throw new Error("Availability dates are required");
  }
};
