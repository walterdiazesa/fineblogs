import { getFirebaseAdmin } from "next-firebase-auth"

const handler = async (req, res) => {
    /* not needed bc i have my index set up for this case: .orderBy('created_at', 'desc')*/
    const USER_UID = "gqVFiBCqI1afC49cglci9sBOJS33"

    getFirebaseAdmin().auth().setCustomUserClaims(USER_UID, { admin: true })

    return res.status(200).json({ result: `${USER_UID} is now an admin` })
}

export default handler