import React, { useEffect, useRef, useState } from 'react'
import { useAuthUser } from 'next-firebase-auth'
import { TrashIcon, AnnotationIcon, HeartIcon, MinusSmIcon } from "@heroicons/react/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid"
import { formatDate } from '../utils/formatDates'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import axios from "axios"
import ReplyGrid from './ReplyGrid'

const CommentGrid = ({ uuid, id, body, date, userEmail, updateComments }) => {

    const AuthUser = useAuthUser()

    const [displayName, setDisplayName] = useState(userEmail.substring(0, userEmail.lastIndexOf("@")))
    const [imgUser, setImgUser] = useState("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")

    useEffect(async () => {
        const { data } = await axios.get(getAbsoluteURL("/api/getfirebaseuserinfo"), { params : { userEmail } }) /* .then instead of async? */

        if (data.displayName) {
            setDisplayName(data.displayName)
        }

        if (data.img) {
            setImgUser(data.img)
        }

    }, [])

    async function deleteComment() {

        const { isDenied } = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            showDenyButton: true,
            showConfirmButton: false,
            denyButtonColor: '#972046',
            denyButtonText: 'Yes, delete it!'
        })

        if (isDenied) {
            try {

                const token = await AuthUser.getIdToken()
                const { data } = await axios.post(getAbsoluteURL(`/api/deletecomment/`), { postuuid: uuid, commentid: id }, { headers : { Authorization: `Bearer ${token}` } })
    
                if (data.error) {
                    Swal.fire("Error", data.error, "error")
                } else {
                    updateComments(id)
                }
                
            } catch (error) {
                console.log(error)
            }
        }

    }

    const [replyArea, setReplyArea] = useState(false)

    const commentReplyRef = useRef()

    const [replies, setReplies] = useState([])
    const [likes, setLikes] = useState([])
    
    useEffect(async () => {
        const { data } = await axios.get(getAbsoluteURL("/api/replies"), { params : { postuuid : uuid, commentid: id } })
        if (!data.error) {
            setReplies(data)
        }
    }, [])

    useEffect(async () => {
        const { data } = await axios.get(getAbsoluteURL("/api/commentlikes"), { params : { postuuid : uuid, commentid: id } })
        if (!data.error) {
            setLikes(data)
            setLikesCount(data.length)
        }
    }, [])
    const [likesCount, setLikesCount] = useState(likes.length)

    const [isLikedByUser, setLikedByUser] = useState(false)

    useEffect(() => {

        if (AuthUser.email) {
            setLikedByUser(likes.includes(AuthUser.email))
        }
        
    }, [AuthUser.email])

    async function createReply() {
        if (commentReplyRef.current.value.trim().length === 0) {
            Swal.fire({
                title: 'Failed adding reply',
                text: 'The body for the reply have to be something',
                icon: 'error',
                confirmButtonText: 'Understand'
            })
            return
        }

        const token = await AuthUser.getIdToken()
        const { data } = await axios.post(getAbsoluteURL('/api/commentreply'), { body: commentReplyRef.current.value, postuuid: uuid, commentid: id }, { headers : { Authorization: `Bearer ${token}` } })

        setReplies([...replies, data])

        commentReplyRef.current.value = ""
        setReplyArea(false)
    }

    useEffect(() => {
        if (replyArea) {
            commentReplyRef.current.focus()
        }
    }, [replyArea])

    function updateReplies(id) {
        setReplies(replies.filter(reply => reply._id !== id))
    }

    const [likeLoading, setLikeLoading] = useState(false)
    async function likeComment() {
        setLikeLoading(true)

        const token = await AuthUser.getIdToken()
        const { data } = await axios.post(getAbsoluteURL('/api/setlikestatecomment'), { bloguuid: uuid, commentuuid: id, isLikedByUser }, { headers : { Authorization: `Bearer ${token}` } })

        if (data.error) {
            Swal.fire("Error", data.error, "error")
        } else {
            //returns data.nowLiked
            setLikesCount(likesCount + (isLikedByUser ? -1 : 1))
            setLikedByUser(!isLikedByUser)
        }

        setLikeLoading(false)
    }

    return (
        <div className="w-full bg-commentgrid rounded-xl overflow-hidden p-3 my-6">
            <div className="flex">
                <img src={imgUser} alt={displayName} className="h-6 w-6 rounded-full" />
                <p className="mx-2 textPink text-sm font-medium">{displayName} <span className="text-gray-400 text-sm font-light">{formatDate(date)}</span></p>
                {AuthUser.email === userEmail && <TrashIcon className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer" aria-hidden="true" onClick={() => deleteComment()} />}
                {AuthUser.email && <AnnotationIcon className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer" aria-hidden="true" onClick={() => setReplyArea(!replyArea)} />}
                {<MinusSmIcon className={`m${AuthUser.email ? 'x' : 'r'}-2 h-5 w-5 text-gray-400`} aria-hidden="true" />}
                {AuthUser.email && <button className="flex focus:outline-none" onClick={() => likeComment()} disabled={likeLoading}><p className={`mr-1  ${isLikedByUser ? 'textWhite' : 'text-gray-400'} text-sm font-normal`}>{likesCount}</p>
                <HeartIconSolid className={`h-5 w-5 ${isLikedByUser ? 'textWhite hover:text-gray-500' : 'text-gray-500 hover:text-gray-300'} cursor-pointer`} aria-hidden="true" /></button>}
                {!AuthUser.email && <><p className="mr-1 text-gray-400 text-sm font-normal">{likesCount}</p>
                <HeartIconSolid className="h-5 w-5 text-gray-400" aria-hidden="true" /></>}
            </div>
            <div className="px-4">
                <p className="text-gray-300 font-normal text-justify">{body}</p>
            </div>
            {replies.length > 0 && <div className="bg-commentgriddark rounded-lg m-2 p-1">
                {replies.map(reply => {
                    return <ReplyGrid key={reply._id} replyid={reply._id} commentuuid={id} bloguuid={uuid} body={reply.reply.body} date={reply._date} userEmail={reply.reply.created_by} updateReplies={updateReplies} />
                })}
            </div>}
            {replyArea && <div className="mx-4 my-2">
                <textarea ref={commentReplyRef} className="w-full px-3 py-2 rounded-lg focus:outline-none border-slatebluenav focus:border-white resize-none border-2 bg-slateblueinput textWhite" rows="2" placeholder={`Reply to ${displayName}...`} />
                <div className="text-right">
                    <button className="text-gray-300 bgNavItemHover hover:text-white px-3 py-2 rounded-md text-sm font-medium" onClick={() => createReply()}>Submit Reply</button>
                </div>
            </div>}
        </div>
    )
}

export default CommentGrid
