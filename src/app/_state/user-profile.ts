import { atom } from "jotai";
import { UserProfile } from "../_types/user-profile";

export const userProfile = atom<UserProfile | undefined>(undefined);
