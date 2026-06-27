export type ToolType =
  | "merge"
  | "split"
  | "compress"
  | "pdf-to-img"
  | "img-to-pdf"
  | "word-to-pdf"
  | "pdf-to-word"
  | "convert-img";

export interface ToolConfig {
  id: ToolType;
  title: string;
  shortDesc: string;
  longDesc: string;
  icon: string;
  color: string;
  category: "pdf" | "image" | "convert";
  popular?: boolean;
}

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  subscriptionStatus: "free" | "pro" | "admin";
  currentPeriodEnd: string | null;
  freeUsesToday: number;
  lastUsedDate: string; // YYYY-MM-DD
}

export interface UsageLogDoc {
  id: string;
  userId: string;
  toolType: ToolType;
  fileName: string;
  fileSize: number;
  timestamp: string;
}

export interface TxDoc {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  plan: string;
  status: string;
  timestamp: string;
}
