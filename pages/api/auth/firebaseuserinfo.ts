import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";

interface customrequest extends NextApiRequest {
  query: {
    userEmail: string;
  };
}

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (!req.query.userEmail) {
    return res.status(200).json("user?");
  }

  let firebaseUser;

  if (req.query.userEmail.includes("@")) {
    firebaseUser = await getFirebaseAdmin()
      .auth()
      .getUserByEmail(req.query.userEmail);
  } else {
    firebaseUser = await getFirebaseAdmin()
      .auth()
      .getUserByPhoneNumber(req.query.userEmail);
  }

  let displayName: boolean | string = false;
  let img: boolean | string = false;

  if (firebaseUser.displayName) {
    displayName = firebaseUser.displayName;
  }

  if (firebaseUser.photoURL) {
    img = firebaseUser.photoURL;
  }

  return res.status(200).json({ displayName, img });
};

export default handler;
