import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export const authService = {
    async signIn(email: string, password: string) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          return userCredential.user;
        } catch (error) {
          console.error("Error signing in animator:", error);
          throw error;
        }
      },
    
      async signOut() {
        try {
          await auth.signOut();
        } catch (error) {
          console.error("Error signing out:", error);
          throw error;
        }
      }
    }