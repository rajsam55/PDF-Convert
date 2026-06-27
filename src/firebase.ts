import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Firebase Applet Config details
const firebaseConfig = {
  apiKey: "AIzaSyBvwVHfMECfYXSxgSMyNbDPTXO6mEdRd8k",
  authDomain: "eng-bulwark-96d0h.firebaseapp.com",
  projectId: "eng-bulwark-96d0h",
  storageBucket: "eng-bulwark-96d0h.firebasestorage.app",
  messagingSenderId: "1068162601286",
  appId: "1:1068162601286:web:78a91d550dbea44d871547"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Validate connection as per the Firebase Skill
async function testConnection() {
  try {
    // Attempt a silent fetch of a non-existent test document from server
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration or network status.");
    }
  }
}
testConnection();
