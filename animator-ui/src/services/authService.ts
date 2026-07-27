import { signInWithEmailAndPassword, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebase";

export const authService = {
    getCurrentUser(): Promise<User | null> {
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        });
      });
    },

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