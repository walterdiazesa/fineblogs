export default function getUserImage(AuthUser) {
    
    let userEmail = AuthUser
    if (AuthUser.email) {

        userEmail = AuthUser.email

        if (AuthUser.photoURL) {
            return AuthUser.photoURL
        }

        return `/imgs/profiles/${userEmail ? userEmail.charAt(0).match(/[a-z]/i) ? userEmail.charAt(0).toLowerCase() : '@' : '@'}.png`
    }

    if (AuthUser.phoneNumber) {
        return `/imgs/profiles/phone.png`
    }

    if (!AuthUser.includes("@")) {
        return `/imgs/profiles/phone.png`
    }

    return `/imgs/profiles/${userEmail ? userEmail.charAt(0).match(/[a-z]/i) ? userEmail.charAt(0).toLowerCase() : '@' : '@'}.png`
}