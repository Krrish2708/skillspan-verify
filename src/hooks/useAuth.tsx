import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "hr" | "candidate";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profileId: string | null;
  userRole: AppRole | null;
  loading: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken, signOut: clerkSignOut } = useClerkAuth();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!clerkUser) {
      setProfileId(null);
      setUserRole(null);
      setLoading(false);
      return;
    }

    try {
      const clerkId = clerkUser.id;
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      const fullName = clerkUser.fullName || "";

      // Try to find existing profile
      let { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("auth_id", clerkId)
        .maybeSingle();

      // Create profile if not found
      if (!profile) {
        const { data: newProfile, error } = await supabase
          .from("profiles")
          .insert({ auth_id: clerkId, email, full_name: fullName })
          .select("id, full_name, email")
          .single();
        if (error) throw error;
        profile = newProfile;
      }

      setProfileId(profile?.id || null);

      // Fetch role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", clerkId)
        .maybeSingle();

      setUserRole((roleData?.role as AppRole) || null);
    } catch (e) {
      console.error("Failed to fetch profile:", e);
    } finally {
      setLoading(false);
    }
  }, [clerkUser]);

  useEffect(() => {
    if (!isLoaded) return;
    fetchProfile();
  }, [isLoaded, fetchProfile]);

  const user: AuthUser | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        fullName: clerkUser.fullName || "",
      }
    : null;

  const handleSignOut = useCallback(async () => {
    await clerkSignOut();
    setProfileId(null);
    setUserRole(null);
  }, [clerkSignOut]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profileId,
        userRole,
        loading,
        getToken,
        signOut: handleSignOut,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
