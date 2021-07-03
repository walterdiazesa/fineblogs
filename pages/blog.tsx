import React, { useState } from "react";
import { withAuthUser, getFirebaseAdmin } from "next-firebase-auth";
import Nav from "../components/Nav";
import BlogGrid from "../components/BlogGrid";
import bodyParser from "../utils/bodyParser";
import { Blog as BlogType } from "../types/blog";
import redis from "../utils/redis";

const Demo = ({ data }: { data: BlogType[] }) => {
  const [blogs, setBlogs] = useState(data);

  /* useEffect(() => {
    const unsubscribe = axios.get('/api/blogs').then(({data}) => setBlogs(data))
    return unsubscribe
  }, []) */

  return (
    <>
      <Nav blogHookGet={blogs} blogHookSet={setBlogs} />
      <div className="grid grid-cols-1 2xl:grid-cols-3 2xl:px-80 my-3 2xl:my-5">
        {blogs &&
          blogs.map((blog: BlogType) => {
            return (
              <BlogGrid
                key={blog._id}
                uuid={blog._id}
                date={blog._date}
                title={blog.blog.title}
                body={blog.blog.body}
                img={blog.blog.img}
              />
            );
          })}
      </div>
    </>
  );
};

export const getServerSideProps = async () => {
  const redisBlogs = await redis.get("blogs");

  let dataBlogs;

  if (redisBlogs) {
    dataBlogs = JSON.parse(redisBlogs);
  } else {
    const blogs = (
      await getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .orderBy("created_at", "desc")
        .get()
    ).docs;

    const data = blogs.map((blog) => {
      return {
        _id: blog.id,
        blog: { ...blog.data(), body: bodyParser(blog.data().body) },
        _date: blog.createTime,
      };
    });

    await redis.set("blogs", JSON.stringify(data));

    dataBlogs = JSON.parse(JSON.stringify(data));
  }

  /* const likes = data.map(async (blog) => {
    const likes  = (await getFirebaseAdmin().firestore().collection('blogs').doc(blog._id).collection('likes').get()).docs.length
    return likes
  })

  const comments = data.map(async (blog) => {
    const comments  = (await getFirebaseAdmin().firestore().collection('blogs').doc(blog._id).collection('comments').get()).docs.length
    return comments
  }) */

  return {
    props: {
      data: dataBlogs,
    },
  };
};

export default withAuthUser({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
})(Demo);
