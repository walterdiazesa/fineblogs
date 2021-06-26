import { verifyIdToken } from "next-firebase-auth"

const withUserAuth = (handler) => async (req, res) => {
    
    if (req.method !== 'GET') {
        if (!(req.headers && req.headers.authorization)) {
            return res.status(200).json({ error: 'Missing Authorization header value' }) //400
        }

        const token = req.headers.authorization
        
        req.token = token

        if (token === 'unauthenticated') {
            return res.status(200).json({ error: 'unauthenticated' }) //401
        }

        try {
            const getUserJWT = await verifyIdToken(req.token.replace("Bearer ", ""))
            req.getUserJWT = getUserJWT
        } catch (error) {
            console.log(error.message)
            return res.status(200).json({ error: 'Not authorized, please try to log in again' })//403
        }
    }
    
    return handler(req, res)
}

export default withUserAuth