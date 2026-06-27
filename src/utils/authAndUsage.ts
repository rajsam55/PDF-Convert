import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import { UserDoc, ToolType, UsageLogDoc } from "../types";
import { db } from "../firebase";

/**
 * Gets the current date string in local YYYY-MM-DD format.
 */
export function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Initializes or fetches a user's subscription and usage document in Firestore.
 */
export async function getOrCreateUserDoc(uid: string, email: string, displayName: string): Promise<UserDoc> {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserDoc;
  }

  // Create default Free tier profile
  const defaultUser: UserDoc = {
    uid,
    email,
    displayName: displayName || email.split("@")[0],
    createdAt: new Date().toISOString(),
    subscriptionStatus: "free",
    currentPeriodEnd: null,
    freeUsesToday: 0,
    lastUsedDate: getLocalDateString(),
  };

  await setDoc(userRef, defaultUser);
  return defaultUser;
}

/**
 * Checks whether the user can run another tool execution today.
 * If not logged in, falls back to a localStorage tracking mechanism.
 */
export async function checkUsageLimit(
  userId: string | null,
  toolId: ToolType
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const today = getLocalDateString();

  if (!userId) {
    // LocalStorage fallback for guests
    const guestData = localStorage.getItem("docucraft_guest_usage");
    let usage = { date: today, count: 0 };
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        if (parsed.date === today) {
          usage = parsed;
        }
      } catch (e) {
        // Ignored
      }
    }

    if (usage.count >= 3) {
      return {
        allowed: false,
        remaining: 0,
        reason: "guest_limit_reached",
      };
    }
    return {
      allowed: true,
      remaining: 3 - usage.count,
    };
  }

  // Logged-in Firestore check
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return { allowed: true, remaining: 3 };
  }

  const userData = userSnap.data() as UserDoc;

  // Pro & Admin users have infinite usage
  if (userData.subscriptionStatus === "pro" || userData.subscriptionStatus === "admin") {
    return { allowed: true, remaining: 999 };
  }

  // Check date match
  if (userData.lastUsedDate !== today) {
    // Reset daily uses
    return { allowed: true, remaining: 3 };
  }

  if (userData.freeUsesToday >= 3) {
    return {
      allowed: false,
      remaining: 0,
      reason: "free_limit_reached",
    };
  }

  return {
    allowed: true,
    remaining: 3 - userData.freeUsesToday,
  };
}

/**
 * Registers an execution of a tool, incrementing the count and adding a log entry.
 */
export async function recordToolUsage(
  userId: string | null,
  toolId: ToolType,
  fileName: string,
  fileSize: number
): Promise<UserDoc | null> {
  const today = getLocalDateString();
  const timestamp = new Date().toISOString();

  if (!userId) {
    // Guest increment
    const guestData = localStorage.getItem("docucraft_guest_usage");
    let usage = { date: today, count: 0 };
    if (guestData) {
      try {
        const parsed = JSON.parse(guestData);
        if (parsed.date === today) {
          usage = parsed;
        }
      } catch (e) {}
    }
    usage.count += 1;
    localStorage.setItem("docucraft_guest_usage", JSON.stringify(usage));
    return null;
  }

  // Logged-in Firestore record
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data() as UserDoc;
  let newCount = 1;
  
  if (userData.lastUsedDate === today) {
    newCount = userData.freeUsesToday + 1;
  }

  const updatedFields: Partial<UserDoc> = {
    freeUsesToday: userData.subscriptionStatus === "free" ? newCount : userData.freeUsesToday,
    lastUsedDate: today,
  };

  await updateDoc(userRef, updatedFields);

  // Write usage logs
  const logId = `log_${Date.now()}`;
  const logRef = doc(db, "users", userId, "usageLogs", logId);
  const logPayload: UsageLogDoc = {
    id: logId,
    userId,
    toolType: toolId,
    fileName,
    fileSize,
    timestamp,
  };
  await setDoc(logRef, logPayload);

  return { ...userData, ...updatedFields };
}

/**
 * Simulates a subscription checkout and updates the Firestore user profile.
 */
export async function simulateUpgradeToPro(userId: string, email: string): Promise<UserDoc> {
  const userRef = doc(db, "users", userId);
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // 1-month duration

  const updatedData: Partial<UserDoc> = {
    subscriptionStatus: "pro",
    currentPeriodEnd: currentPeriodEnd.toISOString(),
  };

  await updateDoc(userRef, updatedData);

  // Record a transaction
  const txId = `tx_${Date.now()}`;
  const txRef = doc(db, "transactions", txId);
  await setDoc(txRef, {
    id: txId,
    userId,
    userEmail: email,
    amount: 12.99, // premium pro tier pricing
    plan: "Pro Subscription (Monthly)",
    status: "completed",
    timestamp: new Date().toISOString(),
  });

  const finalSnap = await getDoc(userRef);
  return finalSnap.data() as UserDoc;
}

/**
 * Simulates canceling or resetting the subscription status.
 */
export async function simulateCancelSubscription(userId: string): Promise<UserDoc> {
  const userRef = doc(db, "users", userId);
  const updatedData: Partial<UserDoc> = {
    subscriptionStatus: "free",
    currentPeriodEnd: null,
  };

  await updateDoc(userRef, updatedData);
  const finalSnap = await getDoc(userRef);
  return finalSnap.data() as UserDoc;
}
