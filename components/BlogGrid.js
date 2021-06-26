import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '../utils/formatDates'
import axios from 'axios'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import { HeartIcon, AnnotationIcon } from "@heroicons/react/solid"

const BlogGrid = ({ uuid, date, title, body }) => {

    const [likesCount, setLikesCount] = useState(0)
    const [commentsCount, setCommentsCount] = useState(0)

    useEffect(async () => {
        const { data } = await axios.get(getAbsoluteURL(`/api/blogs/likes/${uuid}/count`))
        setLikesCount(data.likesCount)
        
        const response = await axios.get(getAbsoluteURL(`/api/blogs/comments/${uuid}/count`))
        setCommentsCount(response.data.commentsCount)
    }, [])

    return (
        <Link href="/blog/[uuid]" as={`/blog/${uuid}`}>
            <div className="2xl:relative max-w-md bgNavItemHover rounded-xl shadow-md overflow-hidden md:max-w-2xl my-3 sm:my-3 2xl:my-6 mx-8 sm:mx-auto 2xl:max-w-sm 2xl:mx-6 2xl:shadow-2xl">
                <div className="md:flex 2xl:block" style={{cursor: 'pointer'}}>
                    <div className="hidden md:flex md:flex-shrink-0">
                        <img className="h-48 w-full object-cover md:h-full md:w-48 2xl:w-full 2xl:h-48" src="/imgs/dummyimg.png" alt="dummyimg" />
                    </div>
                    <div className="p-8">
                        <a className="block mt-1 text-lg leading-tight font-bold textYellow hover:underline 2xl:mb-2">{title}</a>
                        <div className="font-normal tracking-wide text-base text-gray-400">
                            {body}
                        </div>
                        <p className="mt-2 text-gray-500">{formatDate(date)}</p>
                        <div className="flex 2xl:absolute 2xl:bottom-8 2xl:right-8">
                            <div className="ml-auto">
                                <div className="flex">
                                    <p className="mr-1 text-gray-400 text-sm font-normal">{likesCount}</p>
                                    <HeartIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />

                                    <p className="ml-2 mr-1 text-gray-400 text-sm font-normal">{commentsCount}</p>
                                    <AnnotationIcon className="h-5 w-5 text-gray-400 cursor-pointer" aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default BlogGrid
