// app/auth/page.tsx
"use client";

import { supabase } from "@/utils/supabase/client";
// import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const SignIn = () => {
    const supabaseClient = supabase;

    return (
        <div className="h-full flex justify-center items-center">
            <Auth
                supabaseClient={supabaseClient}
                appearance={{
                    theme: ThemeSupa,
                    style: { container: { width: "300px" } },
                }} 
                providers={["kakao"]}
                localization={{}}
                redirectTo={typeof window !== "undefined" ? `${window.location.origin}/` : undefined}
            />
        </div>
    );
};

export default SignIn;