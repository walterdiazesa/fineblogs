import React from "react";
import { withAuthUser, AuthAction } from "next-firebase-auth";
import FirebaseAuth from "../components/FirebaseAuth";
import Nav from "../components/Nav";

const Auth = () => (
  <>
    <Nav />
    <h1 className="text-4xl font-bold text-center pt-16">
      Select your sign up or sign in method
    </h1>
    <div>
      <FirebaseAuth />
    </div>
  </>
);

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.RETURN_NULL,
  whenUnauthedAfterInit: AuthAction.RENDER,
})(Auth);
