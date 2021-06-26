import React, { useEffect, useState } from 'react'
import axios from "axios"
import { useAuthUser } from 'next-firebase-auth'
import { TrashIcon } from "@heroicons/react/outline"
import { formatDate } from '../utils/formatDates'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import getUserImage from '../utils/getUserImage'

const ReplyGrid = ({ bloguuid, commentuuid, replyid, userEmail, body, date, updateReplies }) => {

    const AuthUser = useAuthUser()

    const [displayName, setDisplayName] = useState(userEmail.substring(0, userEmail.lastIndexOf("@")))
    const [imgUser, setImgUser] = useState("../imgs/profiles/@.png")

    useEffect(async () => {
        const { data } = await axios.get(getAbsoluteURL("/api/auth/firebaseuserinfo"), { params : { userEmail } }) /* .then instead of async? */

        if (data.displayName) {
            setDisplayName(data.displayName)
        }

        if (data.img) {
            setImgUser(data.img)
        } else {
            setImgUser(getUserImage(userEmail))
        }

    }, [])

    async function deleteReply() {
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
                const { data } = await axios.delete(getAbsoluteURL(`/api/blogs/comments/replies/${replyid}`), { headers : { Authorization: `Bearer ${token}` }, params : { bloguuid, commentuuid } })
    
                if (data.error) {
                    Swal.fire("Error", data.error, "error")
                } else {
                    updateReplies(replyid)
                }
                
            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div className="bg-commentgridextradark rounded-md m-2 p-2">
            <div className="block sm:flex">
                <div className="flex"><img src={imgUser} alt={displayName} className="h-6 w-6 rounded-full" />
                <p className="mx-2 textPink text-sm font-medium">{displayName} <span className="text-gray-400 text-sm font-light">{formatDate(date)}</span></p></div>
                {AuthUser.email === userEmail &&
                <div className="flex justify-center my-2 sm:my-0"><TrashIcon className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer" aria-hidden="true" onClick={() => deleteReply()} /></div>}
            </div>
            <div className="px-4">
                <p className="text-gray-300 font-normal text-left sm:text-justify">{body}</p>
            </div>
        </div>
    )
}

export default ReplyGrid
