import { AuthUserContext } from "next-firebase-auth";

export const isAuth = (AuthUser: AuthUserContext) => {
  return AuthUser.email || AuthUser.phoneNumber;
};

export const getPhoneOrProvider = (AuthUser: AuthUserContext) => {
  return AuthUser.email ? AuthUser.email : AuthUser.phoneNumber!;
};
