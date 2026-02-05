export interface Profile {
  _id: string;
  name: string;
  relation: string;
  dob?: string;
  sex?: "female" | "male" | "other";
  isDefault?: boolean;
}
