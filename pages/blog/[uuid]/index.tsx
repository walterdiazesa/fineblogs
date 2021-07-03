import axios from "axios";
import { formatDate } from "../../../utils/formatDates";
import { useRouter } from "next/router";
import Nav from "../../../components/Nav";
import { getFirebaseAdmin, withAuthUser } from "next-firebase-auth";
import { PencilAltIcon, TrashIcon, HeartIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/solid";
import { useAuthUser } from "next-firebase-auth";
import React, { useEffect, useState } from "react";
import CommentGrid from "../../../components/CommentGrid";
import { getPhoneOrProvider, isAuth } from "../../../utils/isAuth";
import bodyParser from "../../../utils/bodyParser";
import storage from "../../../utils/storage";
import { Blog } from "../../../types/blog";
import { Comment } from "../../../types/interactions";
import Swal from "sweetalert2";
import redis from "../../../utils/redis";

interface BlogInteraction extends Blog {
  comments?: Comment[];
  likes?: string[];
  error?: { name: string; message: string };
}

const index = ({
  data,
  error,
  uuid,
}: {
  data: BlogInteraction;
  error: { name: string; message: string };
  uuid: string;
}) => {
  /**
   * Throws an error modal
   * @param {string} title Title of the modal
   * @param {string} body Body of the modal.
   */
  function callModal(title: string, body: string) {
    if (typeof window === "object") {
      Swal.fire({
        title: title,
        text: body,
        icon: "error",
        confirmButtonText: "Understand",
      });
    }
  }

  if (error) {
    callModal(error.name, error.message);

    return (
      <>
        <Nav />
        <div className="text-center p-10">
          <h3 className="textFucsia text-3xl font-bold">{error.name}</h3>
          <p className="textWhite text-lg">{error.message}</p>
        </div>
      </>
    );
  }

  if (data && data.error) {
    callModal(data.error.name, data.error.message);

    return (
      <>
        <Nav />
        <div className="text-center p-10">
          <h3 className="textFucsia text-3xl font-bold">{data.error.name}</h3>
          <p className="textWhite text-lg">{data.error.message}</p>
        </div>
      </>
    );
  }

  const Router = useRouter();

  if (Router.isFallback) {
    return (
      <>
        <Nav />
        <div>Loading...</div>
      </>
    );
  }

  /**
   * Returns dangerous html body for the blog.
   * @param {string} text HTML or string type text for the blog.
   * @return {any} returns html or raw string for blog body.
   */
  function createBlogBody(text: string): any {
    return { __html: text };
  }

  /* <div id="resetFont" className="text-justify textWhite font-medium md:px-44" dangerouslySetInnerHTML={createBlogBody(data.blog.body)}></div> */

  const [trashHover, setTrashHover] = useState(false);
  const [editHover, setEditHover] = useState(false);

  const [likesCount, setLikesCount] = useState(
    data.likes!.length
  ); /* change for actual likes count from db */

  const AuthUser = useAuthUser();

  const [isLikedByUser, setLikedByUser] =
    useState(false); /* change for actual isLikedByUser info from db */

  useEffect(() => {
    if (isAuth(AuthUser)) {
      setLikedByUser(data.likes!.includes(getPhoneOrProvider(AuthUser)));
    }
  }, [AuthUser.email, AuthUser.phoneNumber]);

  const [actionLoading, setActionLoading] = useState(false);

  /* function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  } */

  const [thisBlog, setThisBlog] = useState(data);

  /* if (AuthUser.firebaseUser) {
        console.log(AuthUser.firebaseUser)

        try {
            AuthUser.firebaseUser.getIdTokenResult(false).then(token => console.log(token.claims))
        } catch (error) {
            console.error(error)
        }
    } */

  useEffect(() => {
    setEditHover(false);
  }, [thisBlog]);

  /**
   * Function for deleting the blog
   */
  async function deletePost() {
    setActionLoading(true);

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
        if (thisBlog.blog.img) {
          await storage.refFromURL(thisBlog.blog.img).delete();
        }

        const token = await AuthUser.getIdToken();
        const { data } = await axios.delete(`/api/blogs/${uuid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          /* params : {
                        blogid: uuid
                    } */
        });

        // await sleep(2000)

        if (data && data.error) {
          Swal.fire({
            title: !data.blogNotFound ? "Error" : "Something went wrong",
            text: data.error,
            icon: !data.blogNotFound ? "error" : "info",
            confirmButtonText: "Understand",
          });
        } else {
          await Swal.fire({
            title: "Deleted!",
            text: "Your blog has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          Router.push("/blog");
        }
      } catch (error) {
        Swal.fire({
          title: error.name,
          text: error.message,
          icon: "error",
          confirmButtonText: "Understand",
        });
      }
    }

    // await sleep(2000) //axios.get(getAbsoluteURL('/api/blogs'))

    setActionLoading(false);
    // alert(getAbsoluteURL('/api/blogs'))
  }

  const [uploadFile, setUploadFile] = useState(true);
  const [modalState, setModalState] = useState(false);

  useEffect(() => {
    if (modalState) {
      if (uploadFile === false) {
        (
          document.querySelector(".swal2-confirm") as HTMLButtonElement
        ).disabled = true;
        (
          document.querySelector("#fileUploadContainer") as HTMLLabelElement
        ).classList.add("animate-pulse");
        (
          document.querySelector("#fileUploadLoader") as HTMLElement &
            SVGElement
        ).classList.remove("hidden");

        // document.querySelector("#imgForBlogModal").src = document.getElementById('swal-input3').files[0]
        const fileImg = (
          document.getElementById("swal-input3") as HTMLInputElement
        ).files![0];

        if (FileReader && fileImg) {
          const fr = new FileReader();
          fr.onload = function () {
            (
              document.querySelector("#imgForBlogModal") as HTMLImageElement
            ).src = fr.result!.toString();
          };
          fr.onerror = function () {
            (
              document.querySelector("#imgForBlogModal") as HTMLImageElement
            ).classList.add("hidden");
            (
              document.getElementById("fileUploadSpan") as HTMLSpanElement
            ).innerText = "Img load fail, please select another image";
          };
          fr.readAsDataURL(fileImg);
        }
      } else {
        (
          document.querySelector(".swal2-confirm") as HTMLButtonElement
        ).disabled = false;
        (
          document.querySelector("#fileUploadLoader") as HTMLElement &
            SVGElement
        ).classList.add("hidden");
        (
          document.querySelector("#fileUploadContainer") as HTMLLabelElement
        ).classList.remove("animate-pulse");
      }
    }
  }, [uploadFile]);

  /**
   * Function for editing blog
   */
  async function editPost() {
    setActionLoading(true);

    const blogImgUrl = thisBlog.blog.img || "/imgs/dummyimg.png";

    const { value: formValues } = await Swal.fire({
      title: "Update Blog",
      // width: 1200,
      /* imageUrl: '/imgs/dummyimg.png',
            imageWidth: '90%',
            imageHeight: 'auto',
            imageAlt: 'dummyimg',*/
      html:
        `<img id="imgForBlogModal" class="h-48 w-full object-cover rounded-md mb-5" src="${blogImgUrl}" alt="dummyimg">` +
        '<span id="fileUploadError" class="textPink"></span>' +
        `<div class="w-full mb-4 pt-2 bg-slatepurple text-white rounded-md cursor-pointer hover:bg-darkslatepurple">
                    <label id="fileUploadContainer" class="flex justify-center">
                    <svg id="fileUploadLoader" class="animate-spin mt-1.5 mr-3 h-5 w-5 text-white hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span id="fileUploadSpan" class="text-white font-normal cursor-pointer hover:text-gray-300">Select a image</span>
                    <input id="swal-input3" type="file" class="hidden" accept=".jpg, .jpeg"/>
                    </label>
                </div>` +
        `<input id="swal-input1" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Leave blank for no changes">` /* value='${thisBlog.blog.title}'*/ +
        `<textarea id="swal-input2" class="overflow-y-hidden swal2-textarea" style="padding-top: 0; padding-bottom: 0; margin-left: 0; margin-right: 0; width: 100%;" placeholder="Leave blank for no changes">` /* value='${thisBlog.blog.body}'*/,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Blog",
      didDestroy: () => {
        /* didClose */
        setModalState(false);
      },
      didOpen: () => {
        const content = Swal.getHtmlContainer()!;
        (content.querySelector("#swal-input1") as HTMLInputElement).value =
          thisBlog.blog.title;
        (content.querySelector("#swal-input2") as HTMLInputElement).value =
          thisBlog.blog.body;

        setModalState(true);
        const img = document.querySelector(
          "#imgForBlogModal"
        ) as HTMLImageElement;

        img.addEventListener("load", () => {
          setUploadFile(true);

          if (
            (document.getElementById("swal-input3") as HTMLInputElement).files!
              .length === 1
          ) {
            (
              document.getElementById("fileUploadSpan") as HTMLSpanElement
            ).innerText = (
              document.getElementById("swal-input3") as HTMLInputElement
            ).files![0].name;
            (
              document.querySelector("#imgForBlogModal") as HTMLImageElement
            ).classList.remove("hidden");
          }
        });
        img.addEventListener("error", function () {
          setUploadFile(false);

          (
            document.getElementById("fileUploadSpan") as HTMLSpanElement
          ).innerText = "Img load fail, please select another image";

          (document.querySelector("#imgForBlogModal") as HTMLImageElement).src =
            "/imgs/dummyimg.png";

          (
            document.querySelector("#imgForBlogModal") as HTMLImageElement
          ).classList.add("hidden");
        });

        (
          document.getElementById("swal-input3") as HTMLInputElement
        ).addEventListener("change", async (event) => {
          const imgFile = (event.target as HTMLInputElement).files![0];

          if (imgFile && imgFile.size / 1024 / 1024 > 1) {
            /* fileSize > 1mb */
            (document.getElementById("swal-input3") as HTMLInputElement).value =
              "";
            (
              document.getElementById("fileUploadError") as HTMLSpanElement
            ).innerText = "Image size too big (limit 1mb)";
            (
              document.querySelector("#imgForBlogModal") as HTMLImageElement
            ).classList.add("hidden");
            return;
          }

          (
            document.getElementById("fileUploadError") as HTMLSpanElement
          ).innerText = "";
          // console.log(fileList);
          if (imgFile) {
            setUploadFile(false);
          } else {
            (
              document.querySelector("#imgForBlogModal") as HTMLImageElement
            ).classList.add("hidden");
            (
              document.getElementById("fileUploadSpan") as HTMLSpanElement
            ).innerText = "Select a image";
            // document.getElementById('swal-input3').value = document.querySelector("#imgForBlogModal").src
            // console.log(document.querySelector("#imgForBlogModal").src)
            // console.log(lastOkImage)
          }

          // await storage.ref().child(imgFile.name).put(imgFile)
        });
      },
      preConfirm: () => {
        return [
          (document.getElementById("swal-input1") as HTMLInputElement).value,
          (document.getElementById("swal-input2") as HTMLTextAreaElement).value,
          (document.getElementById("swal-input3") as HTMLInputElement).files!
            .length === 1
            ? (document.getElementById("swal-input3") as HTMLInputElement)
                .files![0]
            : undefined,
        ];
      },
    });

    if (formValues) {
      let addPostModalBody = "";
      let fieldUpdated = 0; // 0 = none, 1 = title, 2 = body, 3 = title and body

      if (
        (formValues[0] === thisBlog.blog.title ||
          (formValues[0] as string).trim().length === 0) &&
        (formValues[1] === thisBlog.blog.body ||
          (formValues[1] as string).trim().length === 0) &&
        !formValues[2]
      ) {
        addPostModalBody = "No changes";
      } else {
        addPostModalBody = "Changes successfully applied";

        if (
          formValues[0] === thisBlog.blog.title ||
          (formValues[0] as string).trim().length === 0
        ) {
        } else {
          fieldUpdated++;
        }
        if (
          formValues[1] === thisBlog.blog.body ||
          (formValues[1] as string).trim().length === 0
        ) {
        } else {
          fieldUpdated += 2;
        }
      }

      try {
        let errorCallback = false;

        if (addPostModalBody === "Changes successfully applied") {
          if (formValues[2]) {
            const imgUploadBlog = formValues[2] as File;
            const imgBlogName =
              imgUploadBlog.name.substring(
                0,
                imgUploadBlog.name.lastIndexOf(".")
              ) +
              Date.now() +
              imgUploadBlog.name.substring(imgUploadBlog.name.lastIndexOf("."));

            try {
              let timerInterval: NodeJS.Timeout;
              // const fileUploadProgress = 0;
              Swal.fire({
                title: "Uploading",
                html:
                  '<p id="modalLoadingProgress" class="textWhite">Progress 0%.</p>' +
                  '<div class="flex justify-center">' +
                  `<svg class="mt-4 animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>` +
                  "</div>",
                icon: "info",
                showConfirmButton: false,
                didOpen: () => {
                  // document.getElementById("modalLoadingProgress").innerText =
                  let dots = 1;
                  const modalLoadingP = document.getElementById(
                    "modalLoadingProgress"
                  ) as HTMLParagraphElement;

                  timerInterval = setInterval(() => {
                    if (dots === 1) {
                      modalLoadingP.innerText = `Uploading ${
                        imgUploadBlog.name
                      } (${(imgUploadBlog.size / 1024) | 0} kb).`;
                    } else if (dots === 2) {
                      modalLoadingP.innerText = `Uploading ${
                        imgUploadBlog.name
                      } (${(imgUploadBlog.size / 1024) | 0} kb)..`;
                    } else if (dots === 3) {
                      modalLoadingP.innerText = `Uploading ${
                        imgUploadBlog.name
                      } (${(imgUploadBlog.size / 1024) | 0} kb)...`;
                      dots = 0;
                    }

                    dots++;
                  }, 400);
                },
                didDestroy: () => {
                  clearInterval(timerInterval);
                },
              });

              if (thisBlog.blog.img) {
                try {
                  await storage.refFromURL(thisBlog.blog.img).delete();
                } catch (error) {
                  console.error(error.message);
                }
              }

              const imgStorageUpload = await storage
                .ref(`blogs/${imgBlogName}`)
                .put(formValues[2] as File); /* .on('state_changed', 
                          function progress(snapshot) {
            
                            fileUploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                          }, function error(error) {
            
                            Swal.fire("Error", error.message, "error")
                          }, function complete() {
            
                            
                          })*/

              formValues[2] = await imgStorageUpload.ref.getDownloadURL();
            } catch (error) {
              console.error(error.message);
              formValues[2] = undefined;
              Swal.fire({
                title: "Error",
                text: error.message,
                icon: "error",
                confirmButtonText: "Understand",
              });
            }
          }

          const token = await AuthUser.getIdToken();
          const { data } = await axios.put(
            `/api/blogs/${uuid}`,
            { formValues, fieldUpdated },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              } /* , params : { blogid : uuid } */,
            }
          );
          errorCallback = data.error;

          if (!data.error) {
            let blogFields: { title: string; body: string; img?: string } = {
              title: "",
              body: "",
            };

            if (fieldUpdated === 1) {
              blogFields = {
                title: formValues[0] as string,
                body: thisBlog.blog.body,
              };
            } else if (fieldUpdated === 2) {
              blogFields = {
                title: thisBlog.blog.title,
                body: formValues[1] as string,
              };
            } else if (fieldUpdated === 3) {
              blogFields = {
                title: formValues[0] as string,
                body: formValues[1] as string,
              };
            }

            if (formValues[2]) {
              if ((blogFields as any).length === undefined) {
                blogFields = {
                  title: (formValues[0] as string) || thisBlog.blog.title,
                  body: (formValues[1] as string) || thisBlog.blog.body,
                  img: formValues[2] as string,
                };
              } else {
                blogFields = { ...blogFields, img: formValues[2] as string };
              }
            } else {
              blogFields = { ...blogFields, img: thisBlog.blog.img };
            }

            setThisBlog({
              _id: thisBlog._id,
              blog: blogFields,
              _date: thisBlog._date,
            });
          }
        }

        Swal.fire({
          title: errorCallback ? "Update failed" : "Success",
          text: errorCallback
            ? (errorCallback as unknown as string)
            : addPostModalBody,
          icon:
            addPostModalBody === "Changes successfully applied"
              ? errorCallback
                ? "error"
                : "success"
              : "info",
          showConfirmButton: errorCallback,
          confirmButtonText: "Understand",
          timer: errorCallback
            ? undefined
            : addPostModalBody === "Changes successfully applied"
            ? 1200
            : 850,
        });
      } catch (error) {
        Swal.fire({
          title: error.name,
          text: error.message,
          icon: "error",
          confirmButtonText: "Understand",
        });
      }
    }

    setActionLoading(false);
  }

  /**
   * Function to like blog
   */
  async function likePost() {
    setActionLoading(true);

    const token = await AuthUser.getIdToken();
    const { data } = await axios.put(
      "/api/blogs/likes",
      { uuid, isLikedByUser },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.error) {
      Swal.fire("Error", data.error, "error");
    } else {
      // returns data.nowLiked
      setLikesCount(likesCount + (isLikedByUser ? -1 : 1));
      setLikedByUser(!isLikedByUser);
    }

    setActionLoading(false);
  }

  const [commentHookGet, commentHookSet] = useState(data.comments!);

  /**
   * Function to create comment
   */
  async function createComment() {
    if (
      (
        document.getElementById("inputCommentBody") as HTMLInputElement
      ).value.trim().length === 0
    ) {
      Swal.fire({
        title: "Failed adding comment",
        text: "The body for the comment have to be something",
        icon: "error",
        confirmButtonText: "Understand",
      });
      return;
    }

    const token = await AuthUser.getIdToken();
    const { data } = await axios.post(
      "/api/blogs/comments",
      {
        body: (document.getElementById("inputCommentBody") as HTMLInputElement)
          .value,
        uuid: uuid,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.error) {
      Swal.fire({
        title: "Failed adding comment",
        text: data.error,
        icon: "error",
        confirmButtonText: "Understand",
      });
    } else {
      commentHookSet([
        {
          _id: data._id,
          comment: {
            created_by: data.comment.created_by,
            body: data.comment.body,
          },
          _date: data._date,
        },
        ...commentHookGet,
      ]);
      // console.log(data)
      // console.log(commentHookGet)
      (document.getElementById("inputCommentBody") as HTMLInputElement).value =
        "";
    }
  }

  /**
   * Removes a comment *only* in the client
   * @param {string} id id of the comment
   */
  function deleteComment(id: string) {
    commentHookSet(commentHookGet.filter((comment) => comment._id !== id));
  }

  return (
    <>
      <Nav uuid={uuid} />
      <div className={`text-center ${isAuth(AuthUser) ? "" : "pb-0"} p-10`}>
        <p className="textPink font-semibold uppercase pb-4 md:pb-0">
          {formatDate(thisBlog._date)}
        </p>
        <h1
          className={`textYellow text-4xl font-bold ${
            !AuthUser.claims.admin || !isAuth(AuthUser) ? "pb-0" : "pb-4"
          }`}
        >
          {thisBlog.blog.title}
        </h1>
        {AuthUser.claims.admin && (
          <div className="mb-4">
            <button
              className={`mx-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none ${
                actionLoading && "animate-pulse"
              }`}
              onClick={() => editPost()}
              onMouseOver={() => setEditHover(true)}
              onMouseLeave={() => setEditHover(false)}
              disabled={actionLoading}
            >
              <span className="sr-only">Edit blog</span>
              <PencilAltIcon
                className={`h-6 w-6 ${
                  editHover && !actionLoading && "animate-bounce"
                }`}
                aria-hidden="true"
              />
            </button>
            <button
              className={`mx-3 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none ${
                actionLoading && "animate-pulse"
              }`}
              onClick={() => deletePost()}
              onMouseOver={() => setTrashHover(true)}
              onMouseLeave={() => setTrashHover(false)}
              disabled={actionLoading}
            >
              <span className="sr-only">Delete blog</span>
              <TrashIcon
                className={`h-6 w-6 ${
                  trashHover && !actionLoading && "animate-bounce"
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        )}
        {!AuthUser.claims.admin && isAuth(AuthUser) ? (
          <div className="mb-4">
            <button
              className={`mx-3 p-1 rounded-full ${
                isLikedByUser
                  ? "text-white hover:text-gray-400"
                  : "text-gray-400 hover:text-white"
              } focus:outline-none`}
              onClick={() => likePost()}
              disabled={actionLoading}
            >
              <span className="sr-only">Like blog</span>
              <div className="flex justify-center">
                {likesCount}{" "}
                {isLikedByUser ? (
                  <HeartIconSolid
                    className={`ml-2 h-6 w-6 fill-current ${
                      actionLoading && "animate-pulse"
                    }`}
                    aria-hidden="true"
                  />
                ) : (
                  <HeartIcon
                    className={`ml-2 h-6 w-6 ${
                      actionLoading && "animate-pulse"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            </button>
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-gray-400">
              <span className="sr-only">Likes blog</span>
              <div className="flex justify-center">
                {likesCount}
                <HeartIconSolid
                  className={`ml-2 h-6 w-6 fill-current`}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        )}

        <div
          id="resetFont"
          className="text-justify textWhite font-medium md:px-44"
          dangerouslySetInnerHTML={createBlogBody(thisBlog.blog.body)}
        ></div>
      </div>

      <div className="px-10">
        <div className={`text-center md:px-44 pb-3`}>
          {isAuth(AuthUser) && (
            <>
              <textarea
                id="inputCommentBody"
                className="w-full px-3 py-2 rounded-lg focus:outline-none border-slatebluenav focus:border-white resize-none border-2 bg-slateblueinput textWhite"
                rows={4}
                placeholder="Write your comment..."
              ></textarea>
              <div className="text-right">
                <button
                  className="text-gray-300 bgNavItemHover hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => createComment()}
                >
                  Submit Comment
                </button>
              </div>
            </>
          )}
          <div className={`${isAuth(AuthUser) ? "py-4" : ""}`}>
            {commentHookGet.map((comment) => {
              return (
                <CommentGrid
                  key={comment._id}
                  updateComments={deleteComment}
                  uuid={uuid}
                  id={comment._id}
                  userEmail={comment.comment.created_by}
                  date={comment._date}
                  body={comment.comment.body}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

// const REVALIDATE_ON_SECONDS = 1 change to higher value in production
export const getStaticProps = async (context: { params: { uuid: any } }) => {
  const uuid = context.params.uuid;

  let dataBlog;

  try {
    const redisBlog = await redis.get(`blogs:${uuid}`);

    const blogRef = getFirebaseAdmin()
      .firestore()
      .collection("blogs")
      .doc(uuid);

    const redisLikes = await redis.get(`blogs:${uuid}:likes`);
    const redisComments = await redis.get(`blogs:${uuid}:comments`);

    if (redisBlog) {
      dataBlog = {
        ...JSON.parse(redisBlog),
        likes: JSON.parse(redisLikes!),
        comments: JSON.parse(redisComments!),
      };
    } else {
      // const { data } = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/api/blogs/${uuid}`, { params : { getlikes : true, getcomments: true } })

      /* ==================================================*/
      /* ================ INSTEAD OF AXIOS ================*/
      /* ==================================================*/

      const blog = await blogRef.get();

      let likes: string[] = [];
      let comments: Comment[] = [];

      if (redisLikes) {
        likes = JSON.parse(redisLikes);
        /*  console.log("=== Redis Likes ===");
        console.log(likes); */
      } else {
        const likesDocs = (await blogRef.collection("likes").get()).docs;

        if (likesDocs) {
          likes = likesDocs.map((like) => {
            return like.id;
          });
        }

        await redis.set(`blogs:${uuid}:likes`, JSON.stringify(likes));
        /* console.log("=== noRedis Likes ===");
        console.log(likes); */
      }

      if (redisComments) {
        comments = JSON.parse(redisComments);
      } else {
        const commentsDocs = (
          await blogRef
            .collection("comments")
            .orderBy("created_at", "desc")
            .get()
        ).docs;

        if (commentsDocs) {
          comments = commentsDocs.map((comment) => {
            return {
              _id: comment.id,
              comment: comment.data(),
              _date: comment.createTime,
            };
          });
        }

        await redis.set(`blogs:${uuid}:comments`, JSON.stringify(comments));
      }

      const data = JSON.parse(
        JSON.stringify({
          _id: blog.id,
          blog: blog.data(),
          _date: blog.createTime,
          likes,
          comments,
        })
      );

      await redis.set(
        `blogs:${uuid}`,
        JSON.stringify({
          _id: blog.id,
          blog: blog.data(),
          _date: blog.createTime,
        })
      );

      dataBlog = data;
    }

    /* ==================================================*/
    /* ================ INSTEAD OF AXIOS ================*/
    /* ==================================================*/

    if (!dataBlog.comments) {
      const commentsDocs = (
        await blogRef.collection("comments").orderBy("created_at", "desc").get()
      ).docs;

      if (commentsDocs) {
        dataBlog.comments = JSON.parse(
          JSON.stringify(
            commentsDocs.map((comment) => {
              return {
                _id: comment.id,
                comment: comment.data(),
                _date: comment.createTime,
              };
            })
          )
        );
      } else {
        dataBlog.comments = [];
      }

      await redis.set(
        `blogs:${uuid}:comments`,
        JSON.stringify(dataBlog.comments)
      );
    }
    if (!dataBlog.likes) {
      const likesDocs = (await blogRef.collection("likes").get()).docs;

      if (likesDocs) {
        dataBlog.likes = likesDocs.map((like) => {
          return like.id;
        });
      } else {
        dataBlog.likes = [];
      }

      await redis.set(`blogs:${uuid}:likes`, JSON.stringify(dataBlog.likes));
    }

    return {
      props: {
        data: dataBlog,
        uuid,
      },
      revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_ON_SECONDS!),
    };
  } catch (error) {
    return {
      props: {
        error: { name: error.name, message: error.message },
        uuid,
      },
      revalidate: parseInt(process.env.NEXT_PUBLIC_REVALIDATE_ON_SECONDS!),
    };
  }
};

export const getStaticPaths = async () => {
  const redisBlogs = await redis.get("blogs");

  let dataBlogs;

  if (redisBlogs) {
    dataBlogs = JSON.parse(redisBlogs);
  } else {
    const blogs = (
      await getFirebaseAdmin()
        .firestore()
        .collection("blogs")
        .orderBy("created_at", "desc")
        .get()
    ).docs;
    const data = blogs.map((blog) => {
      return {
        _id: blog.id,
        blog: { ...blog.data(), body: bodyParser(blog.data().body) },
        _date: blog.createTime,
      };
    });

    await redis.set("blogs", JSON.stringify(data));

    dataBlogs = JSON.parse(JSON.stringify(data));
  }

  const ids = dataBlogs.map((blog: Blog) => blog._id);

  const paths = ids.map((id: string) => ({ params: { uuid: id } }));

  return {
    paths,
    fallback: "blocking",
  };
};

export default withAuthUser({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
})(index);
