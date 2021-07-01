import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthUser } from "next-firebase-auth";
import { TrashIcon } from "@heroicons/react/outline";
import { formatDate } from "../utils/formatDates";
import getUserImage from "../utils/getUserImage";
import { getPhoneOrProvider } from "../utils/isAuth";
import Swal from "sweetalert2";

const ReplyGrid = ({
  bloguuid,
  commentuuid,
  replyid,
  userEmail,
  body,
  date,
  updateReplies,
}: {
  bloguuid: string;
  commentuuid: string;
  replyid: string;
  userEmail: any;
  body: string;
  date: FirebaseFirestore.Timestamp; // FirebaseFirestore.Timestamp
  updateReplies: Function;
}) => {
  const AuthUser = useAuthUser();

  const [displayName, setDisplayName] = useState(
    userEmail.includes("@")
      ? userEmail.substring(0, userEmail.lastIndexOf("@"))
      : userEmail
  );
  const [imgUser, setImgUser] = useState(
    userEmail.includes("@")
      ? "../imgs/profiles/@.png"
      : "../imgs/profiles/phone.png"
  );

  useEffect(() => {
    axios
      .get("/api/auth/firebaseuserinfo", {
        params: { userEmail },
      })
      .then(({ data }: any) => {
        if (data.displayName) {
          setDisplayName(data.displayName);
        }

        if (data.img) {
          setImgUser(data.img);
        } else {
          setImgUser(getUserImage(userEmail));
        }
      }); /* .then instead of async? */
  }, []);

  /**
   * Delete the reply
   */
  async function deleteReply() {
    const { isDenied } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      showConfirmButton: false,
      denyButtonColor: "#972046",
      denyButtonText: "Yes, delete it!",
    });

    if (isDenied) {
      try {
        const token = await AuthUser.getIdToken();
        const { data } = await axios.delete(
          `/api/blogs/comments/replies/${replyid}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { bloguuid, commentuuid },
          }
        );

        if (data.error) {
          Swal.fire("Error", data.error, "error");
        } else {
          updateReplies(replyid);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="bg-commentgridextradark rounded-md m-2 p-2">
      <div className="block sm:flex">
        <div className="flex">
          <img
            src={imgUser}
            alt={displayName}
            className="h-6 w-6 rounded-full"
          />
          <p className="mx-2 textPink text-sm font-medium">
            {displayName}{" "}
            <span className="text-gray-400 text-sm font-light">
              {formatDate(date)}
            </span>
          </p>
        </div>
        {getPhoneOrProvider(AuthUser) === userEmail && (
          <div className="flex justify-center my-2 sm:my-0">
            <TrashIcon
              className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer"
              aria-hidden="true"
              onClick={() => deleteReply()}
            />
          </div>
        )}
      </div>
      <div className="px-4">
        <p className="text-gray-300 font-normal text-left sm:text-justify">
          {body}
        </p>
      </div>
    </div>
  );
};

export default ReplyGrid;
