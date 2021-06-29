import React, { useEffect, useState } from 'react'
import {
  withAuthUser,
  withAuthUserTokenSSR,
  getFirebaseAdmin
} from 'next-firebase-auth'
import Nav from '../components/Nav'
import axios from "axios"
import getAbsoluteURL from '../utils/getAbsoluteURL'
import BlogGrid from '../components/BlogGrid'
import bodyParser from '../utils/bodyParser'

const Demo = ({ data }) => {

  const [blogs, setBlogs] = useState(data)

  /* useEffect(() => {
    const unsubscribe = axios.get('/api/blogs').then(({data}) => setBlogs(data))
    return unsubscribe
  }, []) */
  
  return (
    <>
        <Nav blogHookGet={blogs} blogHookSet={setBlogs} />
        <div className="grid grid-cols-1 2xl:grid-cols-3 2xl:px-80 my-3 2xl:my-5">
          {blogs && blogs.map(blog => {
            return <BlogGrid key={blog._id} uuid={blog._id} date={blog._date} title={blog.blog.title} body={blog.blog.body} img={blog.blog.img} />
          })}
        </div>
    </>
  )
}

export const getServerSideProps = async (context) => {
  
  const blogs = (await getFirebaseAdmin().firestore().collection('blogs').orderBy('created_at', 'desc').get()).docs
  const data = blogs.map((blog) => {
      return JSON.parse(JSON.stringify({ _id: blog.id, blog: {...blog.data(), body: bodyParser(blog.data().body)}, _date: blog.createTime }))
  })

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
          data
      }
  }
}

export default withAuthUser()(Demo)
