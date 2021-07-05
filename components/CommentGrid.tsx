import React, { useEffect, useRef, useState } from "react";
import { useAuthUser } from "next-firebase-auth";
import {
  TrashIcon,
  AnnotationIcon,
  MinusSmIcon,
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid";
import { formatDate } from "../utils/formatDates";
import axios from "axios";
import ReplyGrid from "./ReplyGrid";
import getUserImage from "../utils/getUserImage";
import { getPhoneOrProvider, isAuth } from "../utils/isAuth";
import Swal from "sweetalert2";
import { Reply } from "../types/interactions";
import Image from "next/image";

const CommentGrid = ({
  uuid,
  id,
  body,
  date,
  userEmail,
  updateComments,
}: {
  uuid: string;
  id: string;
  body: string;
  date: FirebaseFirestore.Timestamp;
  userEmail: any;
  updateComments: Function;
}) => {
  const AuthUser = useAuthUser();

  const [displayName, setDisplayName] = useState(
    userEmail.includes("@")
      ? userEmail.substring(0, userEmail.lastIndexOf("@"))
      : userEmail
  );
  /* https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80 */
  const [imgUser, setImgUser] = useState(
    userEmail.includes("@")
      ? "/imgs/profiles/@.png" // ..
      : "/imgs/profiles/phone.png" // ..
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
  async function deleteComment() {
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
        const { data } = await axios.delete(`/api/blogs/comments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { postuuid: uuid },
        });

        if (data.error) {
          Swal.fire("Error", data.error, "error");
        } else {
          updateComments(id);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  const [replyArea, setReplyArea] = useState(false);

  const commentReplyRef = useRef(null);

  const [replies, setReplies] = useState([]);
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    axios
      .get("/api/blogs/comments/replies", {
        params: { postuuid: uuid, commentid: id },
      })
      .then(({ data }: any) => {
        if (!data.error) {
          setReplies(data);
        }
      });
  }, []);

  const [likesCount, setLikesCount] = useState(likes.length);
  useEffect(() => {
    // const { data } = await axios.get(getAbsoluteURL("/api/blogs/comments/likes/"), { params : { postuuid : uuid, commentid: id } })

    axios
      .get(`/api/blogs/comments/likes/${uuid}/${id}`)
      .then(({ data }: any) => {
        if (!data.error) {
          setLikes(data);
          setLikesCount(data.length);
        }
      });
  }, []);

  const [isCommentLikedByUser, setCommentLikedByUser] = useState(false);

  const [onceGetLike, setOnceGetLike] = useState(false);

  if (likes.length > 0 && isAuth(AuthUser) && !onceGetLike) {
    setOnceGetLike(true);
    setCommentLikedByUser(
      (likes as string[]).includes(getPhoneOrProvider(AuthUser))
    );
  }

  /**
   * Create a reply
   */
  async function createReply() {
    if ((commentReplyRef.current! as any).value.trim().length === 0) {
      Swal.fire({
        title: "Failed adding reply",
        text: "The body for the reply have to be something",
        icon: "error",
        confirmButtonText: "Understand",
      });
      return;
    }

    const token = await AuthUser.getIdToken();
    const { data } = await axios.post(
      "/api/blogs/comments/replies",
      {
        body: (commentReplyRef.current! as any).value,
        postuuid: uuid,
        commentid: id,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReplies([...replies, data as never]);

    (commentReplyRef.current! as any).value = "";
    setReplyArea(false);
  }

  useEffect(() => {
    if (replyArea) {
      (commentReplyRef.current! as HTMLTextAreaElement).focus();
    }
  }, [replyArea]);

  /**
   * Updates the replies on the client
   * @param {string} id uuid for filter the replies
   */
  function updateReplies(id: string) {
    setReplies(replies.filter((reply: Reply) => reply._id !== id));
  }

  const [likeLoading, setLikeLoading] = useState(false);
  /**
   * Change like state for the comment
   */
  async function likeComment() {
    setLikeLoading(true);

    const token = await AuthUser.getIdToken();
    const { data } = await axios.put(
      "/api/blogs/comments/likes",
      { bloguuid: uuid, commentuuid: id, isLikedByUser: isCommentLikedByUser },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.error) {
      Swal.fire("Error", data.error, "error");
    } else {
      // returns data.nowLiked
      setLikesCount(likesCount + (isCommentLikedByUser ? -1 : 1));
      setCommentLikedByUser(!isCommentLikedByUser);
    }

    setLikeLoading(false);
  }

  return (
    <div className="w-full bg-commentgrid rounded-xl overflow-hidden p-3 my-6">
      <div className="block sm:flex">
        <div className="flex">
          <div className="relative h-6 w-6">
            <Image
              src={imgUser}
              alt={displayName}
              className="rounded-full"
              width={24}
              height={24}
              quality={100}
              layout="fixed"
            />
          </div>
          <p className="mx-2 textPink text-sm font-medium">
            {displayName}{" "}
            <span className="text-gray-400 text-sm font-light">
              {formatDate(date)}
            </span>
          </p>
        </div>
        <div
          className={`flex justify-center ${
            isAuth(AuthUser) ? "my-2 sm:my-0" : ""
          }`}
        >
          {getPhoneOrProvider(AuthUser) === userEmail && (
            <TrashIcon
              className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer sm:mr-1"
              aria-hidden="true"
              onClick={() => deleteComment()}
            />
          )}
          {isAuth(AuthUser) && (
            <AnnotationIcon
              className="h-5 w-5 text-gray-500 hover:text-gray-300 cursor-pointer mx-4 sm:mx-0"
              aria-hidden="true"
              onClick={() => setReplyArea(!replyArea)}
            />
          )}
          {
            <MinusSmIcon
              className={`hidden sm:block m${
                isAuth(AuthUser) ? "x" : "r"
              }-2 h-5 w-5 text-gray-400`}
              aria-hidden="true"
            />
          }
          {isAuth(AuthUser) && (
            <button
              className="flex focus:outline-none"
              onClick={() => likeComment()}
              disabled={likeLoading}
            >
              <p
                className={`mr-1  ${
                  isCommentLikedByUser ? "textWhite" : "text-gray-400"
                } text-sm font-normal`}
              >
                {likesCount}
              </p>
              <HeartIconSolid
                className={`h-5 w-5 ${
                  isCommentLikedByUser
                    ? "textWhite hover:text-gray-500"
                    : "text-gray-500 hover:text-gray-300"
                } cursor-pointer`}
                aria-hidden="true"
              />
            </button>
          )}
          {!isAuth(AuthUser) && (
            <>
              <p className="mr-1 text-gray-400 text-sm font-normal">
                {likesCount}
              </p>
              <HeartIconSolid
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </div>
      <div className="px-4">
        <p className="text-gray-300 font-normal text-justify">{body}</p>
      </div>
      {replies.length > 0 && (
        <div className="bg-commentgriddark rounded-lg m-2 p-1">
          {replies.map((reply: Reply) => {
            return (
              <ReplyGrid
                key={reply._id}
                replyid={reply._id}
                commentuuid={id}
                bloguuid={uuid}
                body={reply.reply.body}
                date={reply._date}
                userEmail={reply.reply.created_by}
                updateReplies={updateReplies}
              />
            );
          })}
        </div>
      )}
      {replyArea && (
        <div className="mx-4 my-2">
          <textarea
            ref={commentReplyRef}
            className="w-full px-3 py-2 rounded-lg focus:outline-none border-slatebluenav focus:border-white resize-none border-2 bg-slateblueinput textWhite"
            rows={2}
            placeholder={`Reply to ${displayName}...`}
          />
          <div className="text-right">
            <button
              className="text-gray-300 bgNavItemHover hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => createReply()}
            >
              Submit Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentGrid;
