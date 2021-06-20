import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
    const blogs = (await getFirebaseAdmin().firestore().collection('blogs').orderBy('created_at', 'desc').get()).docs
    const data = blogs.map((blog) => {
        return { _id: blog.id, blog: blog.data(), _date: blog.createTime }
    })

    return res.status(200).json(data)
}

export default handler