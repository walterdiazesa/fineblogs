import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {

    if (!req.query.uuid) {
        return res.status(200).json({ error : { httpcode: 400, name: 'Missed Argument', message: 'Missed uuid parameter' } })
    }

    const blog = await getFirebaseAdmin().firestore().collection('blogs').doc(req.query.uuid).get()

    if (!blog.exists) {
        return res.status(200).json({ error : { httpcode: 204, name: 'Blog Not Found', message: `There's not blog with the identifier "${req.query.uuid}".` } })
    }

    return res.status(200).json({ _id: blog.id, blog: blog.data(), _date: blog.createTime })
}

export default handler