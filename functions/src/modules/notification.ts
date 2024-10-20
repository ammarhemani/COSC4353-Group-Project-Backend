import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp();

export const sendNotification = async (tokens: string[], title: string, body: string) => {
  try {
    if (tokens.length === 0) {
      return {success: false}; // Return failure if no tokens
    }

    const payload = {
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().sendToDevice(tokens, payload);
    return {success: true}; // Return success with response
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message); // Throw the error message
    }
  }

  // Fallback return for any other unhandled case
  return {success: false};
};
