"use client"

import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useAuthCheck } from "@/hooks/login/useAuthCheck";
import { useSetAtom } from "jotai";
import { userEmailAtom } from "@/store/atoms";

interface AuthContextType {
  user: User | null;
  isChecking: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isChecking } = useAuthCheck();

  const setUserEmail = useSetAtom(userEmailAtom);

  // 🔥 로그인 정보가 바뀌면 userEmailAtom 업데이트 (kakao_email 우선)
  useEffect(() => {
    const email = user?.user_metadata?.email ?? user?.email ?? null;
    setUserEmail(email);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isChecking }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
