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

const Demo = () => {

  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    const unsubscribe = axios.get(getAbsoluteURL('/api/blogs')).then(({data}) => setBlogs(data))
    return unsubscribe
  }, [])

  /* useEffect(() => {
    blogs.map((blog) => {
      console.log(blog)
    })
  }, [blogs]) */
  
  return (
    <>
        <Nav blogHookGet={blogs} blogHookSet={setBlogs} />
        <div>
          {blogs && blogs.map(blog => {
            return <BlogGrid key={blog._id} uuid={blog._id} date={blog._date} title={blog.blog.title} body={blog.blog.body} />
          })}
        </div>
    </>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser()(Demo)
