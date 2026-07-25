import { signInAnonymously } from "firebase/auth";
import { auth } from "../firebase";

export const authService = {
  async signIn() {
      try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
      } catch (error) {
        console.error("Error signing in anonymously:", error);
        throw error;
      }
    },
}