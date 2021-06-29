import { getFirebaseAdmin } from "next-firebase-auth"
import withAdminAuth from "../../middlewares/withAdminAuth"
import { v4 as uuidv4 } from 'uuid'
import bodyParser from "../../../utils/bodyParser"
import storage from "../../../utils/storage"
import initAuth from "../../../utils/initAuth"

initAuth()

const handler = async (req, res) => {
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/

    if (req.method === 'GET') {
        const blogs = (await getFirebaseAdmin().firestore().collection('blogs').orderBy('created_at', 'desc').get()).docs
        const data = blogs.map((blog) => {
            return { _id: blog.id, blog: {...blog.data(), body: bodyParser(blog.data().body)}, _date: blog.createTime }
        })
    
        return res.status(200).json(data)
    }
    
    if (req.method === 'POST') {
        
        if (!req.body.formValues) {
            return res.status(200).json({ error: 'Missed blog parameters' }) //400
        }
    
        if (req.body.formValues.length < 2) {
            return res.status(200).json({ error: 'Title and body have to be especified' }) //400
        }

        try {
            
            const uuid = uuidv4()
            let createTime = Date.now()
    
            await getFirebaseAdmin().firestore().collection("blogs").doc(uuid).set({
                title: req.body.formValues[0],
                body: req.body.formValues[1],
                created_at: Date.now(),
                img: req.body.formValues[2]
            }).then(({writeTime}) => createTime = writeTime)
    
            const newBlog = { _id: uuid, blog: { title: req.body.formValues[0], body : bodyParser(req.body.formValues[1]), img: req.body.formValues[2] }, _date: createTime }
    
            return res.status(200).json(newBlog)
            
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e)
            return res.status(200).json({ error: e.message }) //403
        }
    }
}

export default withAdminAuth(handler)