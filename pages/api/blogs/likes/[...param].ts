import { getFirebaseAdmin } from "next-firebase-auth";
import initAuth from "../../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import redis from "../../../../utils/redis";

initAuth();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    if (req.query.param.length === 2) {
      try {
        const redisLikes = await redis.get(`blogs:${req.query.param[0]}:likes`);

        let dataLikes;

        if (redisLikes) {
          dataLikes = (JSON.parse(redisLikes) as string[]).length;
        } else {
          const likesCount = (
            await getFirebaseAdmin()
              .firestore()
              .collection("blogs")
              .doc(req.query.param[0])
              .collection("likes")
              .get()
          ).docs;

          dataLikes = likesCount.length;

          const likes = likesCount.map((like) => like.id);

          await redis.set(
            `blogs:${req.query.param[0]}:likes`,
            JSON.stringify(likes)
          );
        }

        return res.status(200).json({ likesCount: dataLikes });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return res.status(200).json({ error: e.message }); // 403
      }
    }
  }
};

export default handler;
