import React, { useEffect, useState } from 'react'
import { getFirebaseAdmin, useAuthUser } from 'next-firebase-auth'
import { TrashIcon } from "@heroicons/react/outline"
import { formatDate } from '../utils/formatDates'
import getAbsoluteURL from '../utils/getAbsoluteURL'
import axios from "axios"

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

    return (
        <div className="w-full bg-commentgrid rounded-xl overflow-hidden p-3 my-6">
            <div className="flex">
                <img src={imgUser} alt={displayName} className="h-6 w-6 rounded-full" />
                <p className="mx-2 textPink text-sm font-medium">{displayName} <span className="text-gray-400 text-sm font-light">{formatDate(date)}</span></p>
                {AuthUser.email === userEmail && <TrashIcon className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer" aria-hidden="true" onClick={() => deleteComment()} />}
            </div>
            <div className="px-4">
                <p className="text-gray-300 font-normal text-justify">{body}</p>
            </div>
        </div>
    )
}

export default CommentGrid
