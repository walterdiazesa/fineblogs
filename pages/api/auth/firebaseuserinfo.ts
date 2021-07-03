import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../../utils/redis";
import { auth } from "firebase-admin";

interface customrequest extends NextApiRequest {
  query: {
    userEmail: string;
  };
}

type userFromCache = {
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
};

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (!req.query.userEmail) {
    return res.status(200).json("user?");
  }

  let firebaseUser: auth.UserRecord | userFromCache;
  let displayName: boolean | string = false;
  let img: boolean | string = false;

  const redisUser = await redis.get(`users:${req.query.userEmail}`);

  if (redisUser) {
    // console.log(redisUser);
    firebaseUser = JSON.parse(redisUser);
  } else {
    if (req.query.userEmail.includes("@")) {
      firebaseUser = await getFirebaseAdmin()
        .auth()
        .getUserByEmail(req.query.userEmail);
    } else {
      firebaseUser = await getFirebaseAdmin()
        .auth()
        .getUserByPhoneNumber(req.query.userEmail);
    }

    const userCache = {
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      displayName: firebaseUser.displayName,
      phoneNumber: firebaseUser.phoneNumber,
      photoURL: firebaseUser.photoURL,
    };

    // console.log(userCache);

    await redis.setex(
      `users:${req.query.userEmail}`,
      60 * 60 * 24 /* 1 DAY */,
      JSON.stringify(userCache)
    );
  }

  if (firebaseUser.displayName) {
    displayName = firebaseUser.displayName;
  }

  if (firebaseUser.photoURL) {
    img = firebaseUser.photoURL;
  }

  return res.status(200).json({ displayName, img });
};

export default handler;
