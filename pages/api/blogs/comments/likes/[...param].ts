import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../../../../utils/redis";

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // blogid, commentid

  if (req.query.param.length !== 2) {
    return res
      .status(200)
      .json({ error: "You must to especify the blog and comment ids" });
  }

  let likeData;

  const redisLikes = await redis.hkeys(
    `likes:${req.query.param[0]}:${req.query.param[1]}`
  );

  if (redisLikes.length > 0) {
    likeData = JSON.parse(JSON.stringify(redisLikes));
  } else {
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
    const likes = (
      await getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.query.param[0])
        .collection("comments")
        .doc(req.query.param[1])
        .collection("likes")
        .get()
    ).docs;

    const likesList = likes.map((like) => like.id);
    likeData = likesList;

    likesList.map(async (like) => {
      await redis.hset(
        `likes:${req.query.param[0]}:${req.query.param[1]}`,
        like,
        ""
      );
    });
  }

  return res.status(200).json(likeData);
};

export default handler;
