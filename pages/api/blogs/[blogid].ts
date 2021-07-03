import { getFirebaseAdmin } from "next-firebase-auth";
import withAdminAuth from "../../middlewares/withAdminAuth";
import initAuth from "../../../utils/initAuth";
import type { NextApiRequest, NextApiResponse } from "next";
import { Comment } from "../../../types/interactions";
import redis from "../../../utils/redis";
import { Blog } from "../../../types/blog";

interface customrequest extends NextApiRequest {
  query: {
    blogid: string;
    getlikes?: string;
    getcomments?: string;
  };
}

initAuth();

const handler = async (req: customrequest, res: NextApiResponse) => {
  if (req.method === "PUT" || req.method === "DELETE") {
    if (!req.query.blogid) {
      return res.status(200).json({ error: "Missing identifier parameter" }); // 400
    }
  }

  if (req.method === "GET") {
    if (!req.query.blogid) {
      return res.status(200).json({
        error: {
          httpcode: 400,
          name: "Missed Argument",
          message: "Missed uuid parameter",
        },
      });
    }

    const blogRef = getFirebaseAdmin()
      .firestore()
      .collection("blogs")
      .doc(req.query.blogid);
    const blog = await blogRef.get();

    if (!blog.exists) {
      return res.status(200).json({
        error: {
          httpcode: 204,
          name: "Blog Not Found",
          message: `There's not blog with the identifier "${req.query.blogid}".`,
        },
      });
    }

    let likes: string[] = [];
    let comments: Comment[] = [];

    if (req.query.getlikes) {
      const likesDocs = (await blogRef.collection("likes").get()).docs;

      if (likesDocs) {
        likes = likesDocs.map((like) => {
          return like.id;
        });
      }
    }

    if (req.query.getcomments) {
      const commentsDocs = (
        await blogRef.collection("comments").orderBy("created_at", "desc").get()
      ).docs;

      if (commentsDocs) {
        comments = commentsDocs.map((comment) => {
          return {
            _id: comment.id,
            comment: comment.data(),
            _date: comment.createTime,
          };
        });
      }
    }

    return res.status(200).json({
      _id: blog.id,
      blog: blog.data(),
      _date: blog.createTime,
      likes,
      comments,
    });
  }

  if (req.method === "PUT") {
    try {
      /* If you wanna know in first instance if the blog exist you have to uncomment next lines, but
            firestore calls gets up by twice */

      let blogFields = {};

      if (req.body.fieldUpdated === 1) {
        blogFields = { title: req.body.formValues[0] };
      } else if (req.body.fieldUpdated === 2) {
        blogFields = { body: req.body.formValues[1] };
      } else if (req.body.fieldUpdated === 3) {
        blogFields = {
          title: req.body.formValues[0],
          body: req.body.formValues[1],
        };
      }

      const blogInputs = req.body.formValues[2]
        ? { ...blogFields, img: req.body.formValues[2] }
        : blogFields;

      // eslint-disable-next-line no-unused-vars
      const blog = await getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.query.blogid)
        .update(blogInputs); // get

      const redisBlogs = await redis.get(`blogs`);

      if (redisBlogs) {
        let newThisCachedBlog;
        const updatedBlogs = (JSON.parse(redisBlogs) as Blog[]).map((blog) => {
          if (blog._id === req.query.blogid) {
            newThisCachedBlog = {
              ...blog,
              blog: { ...blog.blog, ...blogInputs },
            };
            console.log("=== newThisCachedBlog ===");
            console.log(newThisCachedBlog);
            return { ...blog, blog: { ...blog.blog, ...blogInputs } };
          } else {
            return blog;
          }
        });

        console.log("=== updatedBlogs ===");
        console.log(updatedBlogs);

        await redis.set(`blogs`, JSON.stringify(updatedBlogs));
        await redis.set(
          `blogs:${req.query.blogid}`,
          JSON.stringify(newThisCachedBlog)
        );
      }

      return res.status(200).json({ blogUp: req.body.formValues });

      /* const blogRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.query.blogid)
    
            if ((await blogRef.get()).exists) {
                await blogRef.update(blogFields)
                return res.status(200).json({ blogFound: true, blogUp: req.body.formValues })
            } else {
                return res.status(200).json({ blogFound: false })
            }*/
    } catch (e) {
      console.error(e);

      return res.status(200).json({
        error:
          e.code === 5
            ? "Blog not found"
            : "Not authorized, please log in again",
      }); // 403
    }
  }

  if (req.method === "DELETE") {
    try {
      /* If you wanna know in first instance if the blog exist you have to uncomment next lines, but
            firestore calls gets up by twice */

      // eslint-disable-next-line no-unused-vars
      const blog = await getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .doc(req.query.blogid)
        .delete(); // get

      const redisBlogs = await redis.get(`blogs`);
      if (redisBlogs) {
        const updatedBlogs = (JSON.parse(redisBlogs) as Blog[]).filter(
          (blog) => blog._id !== req.query.blogid
        );

        await redis.set(`blogs`, JSON.stringify(updatedBlogs));

        redis.del(`blogs:${req.query.blogid}`);
        redis.del(`blogs:${req.query.blogid}:likes`);
        redis.del(`blogs:${req.query.blogid}:comments`);
      }

      return res.status(200).json({ blogDeleted: true });

      /* if (blog.exists) {
                return res.status(200).json({ blogDeleted: true })
            }
    
            return res.status(200).json({ error: `Blog with identifier "${req.query.blogid}" not found`, blogNotFound: true })//204*/
    } catch (e) {
      console.error(e);
      return res.status(200).json({ error: e.message }); // 403
    }
  }
};

export default withAdminAuth(handler);
