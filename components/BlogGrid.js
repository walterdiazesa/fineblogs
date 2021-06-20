import React from 'react'
import Link from 'next/link'
import { formatDate } from '../utils/formatDates'

const BlogGrid = ({ uuid, date, title, body }) => {

    function bodyParser(body) {

        body = body.replace( /(<([^>]+)>)/ig, '')

        body = body.length > 125 ? `${body.substring(0, 125)}...` : body

        return body
    }

    return (
        <Link href="/blog/[uuid]" as={`/blog/${uuid}`}>
            <div className="max-w-md bgNavItemHover rounded-xl shadow-md overflow-hidden md:max-w-2xl my-3 sm:my-3 2xl:my-6 mx-8 sm:mx-auto 2xl:max-w-sm 2xl:mx-6 2xl:shadow-2xl">
                <div className="md:flex 2xl:block" style={{cursor: 'pointer'}}>
                    <div className="hidden md:flex md:flex-shrink-0">
                        <img className="h-48 w-full object-cover md:h-full md:w-48 2xl:w-full 2xl:h-48" src="/imgs/dummyimg.png" alt="dummyimg" />
                    </div>
                    <div className="p-8">
                        <a className="block mt-1 text-lg leading-tight font-bold textYellow hover:underline 2xl:mb-2">{title}</a>
                        <div className="font-normal tracking-wide text-base text-gray-400">
                            {bodyParser(body)}
                        </div>
                        <p className="mt-2 text-gray-500">{formatDate(date)}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default BlogGrid
