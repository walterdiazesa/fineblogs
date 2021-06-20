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

    if (req.query.getlikes) {
        const likesDocs = (await blogRef.collection('likes').get()).docs

        if (likesDocs) {
            const likes = likesDocs.map((like) => {
                return like.id
            })
            return res.status(200).json({ _id: blog.id, blog: blog.data(), _date: blog.createTime, likes })
        }
    }

    return res.status(200).json({ _id: blog.id, blog: blog.data(), _date: blog.createTime, likes: []})
}

export default handler