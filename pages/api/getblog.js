import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {

    if (!req.query.uuid) {
        return res.status(200).json({ error : { httpcode: 400, name: 'Missed Argument', message: 'Missed uuid parameter' } })
    }

    const blogRef = getFirebaseAdmin().firestore().collection('blogs').doc(req.query.uuid)
    const blog = await blogRef.get()

    if (!blog.exists) {
        return res.status(200).json({ error : { httpcode: 204, name: 'Blog Not Found', message: `There's not blog with the identifier "${req.query.uuid}".` } })
    }

    let likes = []
    let comments = []

    if (req.query.getlikes) {
        const likesDocs = (await blogRef.collection('likes').get()).docs

        if (likesDocs) {
            likes = likesDocs.map((like) => {
                return like.id
            })
        }
    }

    if (req.query.getcomments) {
        const commentsDocs = (await blogRef.collection('comments').orderBy("created_at", "desc").get()).docs

        if (commentsDocs) {
            comments = commentsDocs.map(comment => {
                return { _id: comment.id, comment: comment.data(), _date: comment.createTime } 
            })
        }
    }

    return res.status(200).json({ _id: blog.id, blog: blog.data(), _date: blog.createTime, likes, comments })
}

export default handler