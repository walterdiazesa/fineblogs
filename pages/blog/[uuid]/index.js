import axios from "axios"
import https from 'https'
import { formatDate } from '../../../utils/formatDates'
import { useRouter } from 'next/router'
import Nav from "../../../components/Nav"
import { withAuthUser } from 'next-firebase-auth'
import { PencilAltIcon, TrashIcon, HeartIcon } from "@heroicons/react/outline"
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid"
import { useAuthUser } from 'next-firebase-auth'
import getAbsoluteURL from "../../../utils/getAbsoluteURL"
import { useEffect, useState } from "react"
import CommentGrid from "../../../components/CommentGrid"

const index = ({ data, error, uuid }) => {

    function callModal(title, body) {
        if (typeof window === 'object') {
            Swal.fire({
                title: title,
                text: body,
                icon: 'error',
                confirmButtonText: "Understand"
            })
        }
    }

    if (error) {

        callModal(error.name, error.message)

        return (
            <>
                <Nav />
                <div className="text-center p-10">
                    <h3 className="textFucsia text-3xl font-bold">{error.name}</h3>
                    <p className="textWhite text-lg">{error.message}</p>
                </div>
            </>
        )
    }

    if (data && data.error) {

        callModal(data.error.name, data.error.message)

        return (
            <>
                <Nav />
                <div className="text-center p-10">
                    <h3 className="textFucsia text-3xl font-bold">{data.error.name}</h3>
                    <p className="textWhite text-lg">{data.error.message}</p>
                </div>
            </>
        )

    }

    const Router = useRouter()
    
    if (Router.isFallback) {
        return (
            <>
                <Nav />
                <div>Loading...</div>
            </>
        )
    }
    
    function createBlogBody(text) { return {__html: text}; }

    /* <div id="resetFont" className="text-justify textWhite font-medium md:px-44" dangerouslySetInnerHTML={createBlogBody(data.blog.body)}></div> */

    const [trashHover, setTrashHover] = useState(false)
    const [editHover, setEditHover] = useState(false)
    const [likeHover, setLikeHover] = useState(false)

    const [likesCount, setLikesCount] = useState(data.likes.length) /* change for actual likes count from db */

    const AuthUser = useAuthUser()
    
    const [isLikedByUser, setLikedByUser] = useState(false) /* change for actual isLikedByUser info from db */

    useEffect(async () => {

        if (AuthUser.email) {
            setLikedByUser(data.likes.includes(AuthUser.email))
        }
        
    }, [AuthUser.email])

    const [actionLoading, setActionLoading] = useState(false)

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const [thisBlog, setThisBlog] = useState(data)

    /* if (AuthUser.firebaseUser) {
        console.log(AuthUser.firebaseUser)

        try {
            AuthUser.firebaseUser.getIdTokenResult(false).then(token => console.log(token.claims))
        } catch (error) {
            console.error(error)
        }
    } */

    useEffect(() => {
        setEditHover(false)
    }, [thisBlog])
    
    useEffect(() => {
        setLikeHover(false)
    }, [isLikedByUser])

    async function deletePost() {

        setActionLoading(true)

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
                const { data } = await axios.delete(getAbsoluteURL(`/api/deleteblog/?uuid=${uuid}`), {
                    headers : {
                        Authorization: `Bearer ${token}`
                    }
                })
                
                //await sleep(2000)

                if (data && data.error) {
                    Swal.fire({
                        title: !data.blogNotFound ? 'Error' : 'Something went wrong',
                        text: data.error,
                        icon: !data.blogNotFound ? 'error' : 'info',
                        confirmButtonText: 'Understand'
                    })
                } else {
                    await Swal.fire({
                        title: 'Deleted!',
                        text: 'Your blog has been deleted.',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500
                    })
                    Router.push("/blog")
                }
                
            } catch (error) {

                Swal.fire({
                    title: error.name,
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Understand'
                })
                
            }
            
        }

        //await sleep(2000) //axios.get(getAbsoluteURL('/api/blogs'))
        
        setActionLoading(false)
        //alert(getAbsoluteURL('/api/blogs'))
    }

    async function editPost() {

        setActionLoading(true)

        const {value: formValues} = await Swal.fire({
            title: 'Update Blog',
            html:
              `<input id="swal-input1" class="swal2-input" placeholder="Leave blank for no changes">` + /*value='${thisBlog.blog.title}'*/
              `<input id="swal-input2" class="swal2-textarea" placeholder="Leave blank for no changes">`/*value='${thisBlog.blog.body}'*/,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update Blog',
            preConfirm: () => {
              return [
                document.getElementById('swal-input1').value,
                document.getElementById('swal-input2').value
              ]
            }
        })

        if (formValues) {

            let addPostModalBody = ""
            let fieldUpdated = 0 // 0 = none, 1 = title, 2 = body, 3 = title and body
            
            if ((formValues[0] === thisBlog.blog.title || formValues[0].trim().length === 0) && (formValues[1] === thisBlog.blog.body || formValues[1].trim().length === 0)) {
    
                addPostModalBody = "No changes"
    
            } else {
    
                addPostModalBody = "Changes successfully applied"

                if ((formValues[0] === thisBlog.blog.title || formValues[0].trim().length === 0)) {} else { fieldUpdated++ }
                if ((formValues[1] === thisBlog.blog.body || formValues[1].trim().length === 0)) {} else { fieldUpdated+=2 }
    
            }
    
            try {

                let errorCallback = false

                if (addPostModalBody === "Changes successfully applied") {
                    const token = await AuthUser.getIdToken()
                    const { data } = await axios.put(getAbsoluteURL('/api/editblog'), { formValues, uuid, fieldUpdated }, { headers : { Authorization: `Bearer ${token}` } })
                    errorCallback = data.error

                    if (!data.error) {
                        let blogFields = {}
                        
                        if (fieldUpdated === 1) {
                            blogFields = { title: formValues[0], body: thisBlog.blog.body }
                        } else if (fieldUpdated === 2) {
                            blogFields = { title: thisBlog.blog.title, body: formValues[1] }
                        } else if (fieldUpdated === 3) {
                            blogFields = { title: formValues[0], body: formValues[1] }
                        }

                        setThisBlog({ _id: thisBlog._id, blog: blogFields, _date: thisBlog._date })
                    }
                }
                
                Swal.fire({
                    title: errorCallback ? "Update failed" : "Success",
                    text: errorCallback ? errorCallback : addPostModalBody,
                    icon: addPostModalBody === "Changes successfully applied" ? errorCallback ? 'error' : 'success' : 'info',
                    showConfirmButton: errorCallback,
                    confirmButtonText: "Understand",
                    timer: errorCallback ? undefined : addPostModalBody === "Changes successfully applied" ? 1200 : 850
                })
                
            } catch (error) {

                Swal.fire({
                    title: error.name,
                    text: error.message,
                    icon: 'error',
                    confirmButtonText: 'Understand'
                })
                
            }

        }
        
        setActionLoading(false)
    }

    async function likePost() {

        setActionLoading(true)

        const token = await AuthUser.getIdToken()
        const { data } = await axios.post(getAbsoluteURL('/api/setlikestateblog'), { uuid, isLikedByUser }, { headers : { Authorization: `Bearer ${token}` } })

        if (data.error) {
            Swal.fire("Error", data.error, "error")
        } else {
            //returns data.nowLiked
            setLikesCount(likesCount + (isLikedByUser ? -1 : 1))
            setLikedByUser(!isLikedByUser)
        }

        setActionLoading(false)

    }

    const [commentHookGet, commentHookSet] = useState(data.comments)

    async function createComment() {

        if (document.getElementById("inputCommentBody").value.trim().length === 0) {
            Swal.fire({
                title: 'Failed adding comment',
                text: 'The body for the comment have to be something',
                icon: 'error',
                confirmButtonText: 'Understand'
            })
            return
        }

        const token = await AuthUser.getIdToken()
        const { data } = await axios.post(getAbsoluteURL('/api/comment'), { body: document.getElementById("inputCommentBody").value, uuid: uuid }, { headers : { Authorization: `Bearer ${token}` } })

        if (data.error) {
            Swal.fire({
                title: 'Failed adding comment',
                text: data.error,
                icon: 'error',
                confirmButtonText: 'Understand'
            })
        } else {
            commentHookSet([{ _id: data._id, comment: { created_by: data.comment.created_by, body: data.comment.body }, _date: data._date }, ...commentHookGet])
            //console.log(data)
            //console.log(commentHookGet)
            document.getElementById("inputCommentBody").value = ""
        }
    }

    function deleteComment(id) {
        commentHookSet(commentHookGet.filter(comment => comment._id !== id))
    }

    return (
        <>
            <Nav uuid={uuid} />
            <div className={`text-center ${AuthUser.email ? '' : 'pb-0'} p-10`}>
                <p className="textPink font-semibold uppercase pb-4 md:pb-0">{formatDate(thisBlog._date)}</p>
                <h1 className={`textYellow text-4xl font-bold ${!AuthUser.claims.admin || !AuthUser.email ? 'pb-0' : 'pb-4'}`}>{thisBlog.blog.title}</h1>
                {AuthUser.claims.admin && <div className="mb-4">
                    <button className={`mx-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none ${actionLoading && 'animate-pulse'}`} onClick={() => editPost()}
                    onMouseOver={() => setEditHover(true)} onMouseLeave={() => setEditHover(false)} disabled={actionLoading}>
                        <span className="sr-only">Edit blog</span>
                        <PencilAltIcon className={`h-6 w-6 ${editHover && !actionLoading && 'animate-bounce'}`} aria-hidden="true" />
                    </button>
                    <button className={`mx-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none ${actionLoading && 'animate-pulse'}`} onClick={() => deletePost()}
                    onMouseOver={() => setTrashHover(true)} onMouseLeave={() => setTrashHover(false)} disabled={actionLoading}>
                        <span className="sr-only">Delete blog</span>
                        <TrashIcon className={`h-6 w-6 ${trashHover && !actionLoading && 'animate-bounce'}`} aria-hidden="true" />
                    </button>
                </div>}
                {!AuthUser.claims.admin && AuthUser.email ? 
                <div className="mb-4">
                    <button className={`mx-3 p-1 rounded-full ${isLikedByUser ? 'text-white hover:text-gray-400' : 'text-gray-400 hover:text-white'} focus:outline-none`}
                    onClick={() => likePost()} onMouseOver={() => setLikeHover(true)} onMouseLeave={() => setLikeHover(false)} disabled={actionLoading}>
                        <span className="sr-only">Like blog</span>
                        <div className="flex justify-center">{likesCount} {isLikedByUser ? <HeartIconSolid className={`ml-2 h-6 w-6 fill-current ${actionLoading && 'animate-pulse'}`} aria-hidden="true" /> :
                        <HeartIcon className={`ml-2 h-6 w-6 ${actionLoading && 'animate-pulse'}`} aria-hidden="true" />}</div>
                    </button>
                </div> : 
                <div className="mb-4">
                    <div className="text-gray-400">
                        <span className="sr-only">Likes blog</span>
                        <div className="flex justify-center">{likesCount}<HeartIconSolid className={`ml-2 h-6 w-6 fill-current`} aria-hidden="true" /></div>
                    </div>
                </div>}
                
                <div id="resetFont" className="text-justify textWhite font-medium md:px-44" dangerouslySetInnerHTML={createBlogBody(thisBlog.blog.body)}></div>
            </div>

            <div className="px-10">
                <div className={`text-center md:px-44 pb-3`}>
                    {AuthUser.email && <><textarea id="inputCommentBody" className="w-full px-3 py-2 rounded-lg focus:outline-none border-slatebluenav focus:border-white resize-none border-2 bg-slateblueinput textWhite" rows="4" placeholder="Write your comment..."></textarea>
                    <div className="text-right">
                        <button className="text-gray-300 bgNavItemHover hover:text-white px-3 py-2 rounded-md text-sm font-medium" onClick={() => createComment()}>Submit Comment</button>
                    </div></>}
                    <div className={`${AuthUser.email ? 'py-4' : ''}`}>
                        {commentHookGet.map((comment) => {
                            return <CommentGrid key={comment._id} updateComments={deleteComment} uuid={uuid} id={comment._id} userEmail={comment.comment.created_by} userComment="walterwalon" date={comment._date} body={comment.comment.body} />
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}

//const REVALIDATE_ON_SECONDS = 1 change to higher value in production
export const getStaticProps = async (context) => {
    
    const uuid = context.params.uuid

    try {

        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/getblog?uuid=${uuid}`, { params : { getlikes : true, getcomments: true } })

        return {
            props: {
                data,
                uuid
            },
            revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_ON_SECONDS)
        }
        
    } catch (error) {

        return {
            props: {
                error: { name: error.name, message: error.message },
                uuid
            },
            revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_ON_SECONDS)
        }

    }
}

export const getStaticPaths = async () => {

    const agent = new https.Agent({
        rejectUnauthorized: false
    })

    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/blogs`, { httpsAgent: agent })

    const ids = data.map(blog => blog._id)

    //console.log(ids)

    const paths = ids.map(id => ({params: {uuid: id.toString()}}))

    //console.log(paths)
    
    return {
        paths,
        fallback: true
    }

}

export default withAuthUser()(index)
