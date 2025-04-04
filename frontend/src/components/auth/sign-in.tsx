"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

export const SignIn = () => {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session?.user?.name?.slice(0, 10)} <br />
        <Button className="hover:cursor-pointer items-center justify-center self-center " onClick={() => signOut()}>Sign Out</Button >
      </>
    );
  } else {
    return (
      <>
        <Button className="hover:cursor-pointer items-center justify-center self-center " onClick={() => signIn("worldcoin")}>Sign in</Button >
      </>
    );
  }
};