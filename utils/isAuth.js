export const isAuth = (AuthUser) => {
    return AuthUser.email || AuthUser.phoneNumber
}

export const getPhoneOrProvider = (AuthUser) => {
    return AuthUser.email ? AuthUser.email : AuthUser.phoneNumber
}