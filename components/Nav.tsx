/* This example requires Tailwind CSS v2.0+ */
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon, UserCircleIcon } from "@heroicons/react/outline";
import axios from "axios";
import { useAuthUser } from "next-firebase-auth";
import getUserImage from "../utils/getUserImage";
import { getPhoneOrProvider, isAuth } from "../utils/isAuth";
import storage from "../utils/storage";
import { Blog as BlogType } from "../types/blog";
import Swal, { SweetAlertIcon } from "sweetalert2";

/**
 * Add classes for each case for TailwindCSS.
 * @param {classes} string[] classes to join
 * @return {object} boolean classes joining default classes.
 */
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Add classes for each case for TailwindCSS.
 * @param {BlogType[]} blogHookGet hook return value
 * @param {React.Dispatch<React.SetStateAction<BlogType[]>>?} blogHookSet hook set value
 * @param {string?} uuid blog uuid
 * @return {object} react components type navbar
 */
export default function Nav({
  blogHookGet,
  blogHookSet,
  uuid,
}: {
  blogHookGet?: BlogType[];
  blogHookSet?: React.Dispatch<React.SetStateAction<BlogType[]>>;
  uuid?: string;
}) {
  const navigation = [
    { name: "Blogs", href: "/blog", current: true },
    { name: "Create Blog", href: "#", current: false },
  ];

  const AuthUser = useAuthUser();

  /* if (AuthUser.claims.admin) {
    console.log("Nav (AuthUser.claims.admin): ")
    console.log(AuthUser.claims.admin)
  }*/

  /* const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 756)

    window.addEventListener('resize', function(event) {
      setIsMobile(window.innerWidth < 756)
    }, false)
  }, [])*/

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
   * Adds two numbers together.
   * @param {string} btnname Bools the parameter to "Create Blog"
   */
  async function createBlog(btnname: string) {
    if (btnname === "Create Blog") {
      const { value: formValues } = await Swal.fire({
        title: "Create Blog",
        html:
          // '<input id="swal-input3" type="file" accept=".jpg, .jpeg, .png" />' +
          '<img id="imgForBlogModal" class="h-48 w-full object-cover rounded-md mb-5 hidden" src="/imgs/dummyimg.png" alt="dummyimg">' +
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
          '<input id="swal-input1" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Title">' +
          '<textarea id="swal-input2" class="overflow-y-hidden swal2-textarea" style="padding-top: 5px; padding-bottom: 0; margin-left: 0; margin-right: 0; width: 100%;" placeholder="Body">',
        focusConfirm: true,
        showCancelButton: true,
        confirmButtonText: "Create Blog",
        didDestroy: () => {
          /* didClose */
          setModalState(false);
        },
        didOpen: () => {
          setModalState(true);
          const img = document.querySelector(
            "#imgForBlogModal"
          ) as HTMLImageElement;

          img.addEventListener("load", () => {
            setUploadFile(true);
            // console.log("completo por load")

            if (
              (document.getElementById("swal-input3") as HTMLInputElement)
                .files!.length === 1
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
              (
                document.getElementById("swal-input3") as HTMLInputElement
              ).value = "";
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
            (document.getElementById("swal-input2") as HTMLTextAreaElement)
              .value,
            (document.getElementById("swal-input3") as HTMLInputElement).files!
              .length === 1
              ? (document.getElementById("swal-input3") as HTMLInputElement)
                  .files![0]
              : undefined,
          ];
        },
      });

      if (formValues) {
        // axios.get(getAbsoluteURL('/api/blogs')).then(data => console.log(data))
        let addPostModalTitle = "";
        let addPostModalBody = "";
        let addPostModalIcon: SweetAlertIcon = "info"; // = "info";
        let validationOrError = false;
        let addPostFailed = false;

        if (formValues.length < 2) {
          addPostModalBody = "Can't leave blank inputs";
        } else if (!formValues[0] || !formValues[1]) {
          addPostModalBody = "You must add body and title";
        } else if (
          (formValues[0] as string).trim().length === 0 ||
          (formValues[1] as string).trim().length === 0
        ) {
          addPostModalBody = "Body and title cannot be blank";
        } else {
          validationOrError = true;

          /* var bodyFormData = new FormData()
          bodyFormData.append('title', formValues[0])
          bodyFormData.append('body', formValues[1])
          bodyFormData.append('images', formValues[2]) 
          const { data } = await axios.post(getAbsoluteURL('/api/blogs'), bodyFormData, { headers : { Authorization: `Bearer ${token}`, "Content-Type" : "multipart/form-data" } }) */

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

          const { data } = await axios.post(
            "/api/blogs",
            { formValues },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (data.error) {
            addPostModalTitle = "Failed adding blog";
            addPostModalBody = data.error;
            addPostModalIcon = "error";
            addPostFailed = true;
          } else {
            addPostModalTitle = "Success";
            addPostModalBody = `Post "${data.blog.title}" created successfully`;
            addPostModalIcon = "success";

            if (blogHookGet && blogHookSet) {
              // blogHookSet(blogHookGet.concat({ _id: data._id, blog: { title: data.blog.title, body: data.blog.body }, _date: data._date })) // lo agrega de último
              blogHookSet([
                {
                  _id: data._id,
                  blog: {
                    title: data.blog.title,
                    body: data.blog.body,
                    img: data.blog.img,
                  },
                  _date: data._date,
                },
                ...blogHookGet,
              ]); // Lo agrega de primero
            }
            // setBlogs(add)
          }
        }

        // JSON.stringify(formValues)
        Swal.fire({
          title: validationOrError ? addPostModalTitle : undefined,
          text: addPostModalBody,
          icon: addPostModalIcon,
          showConfirmButton: addPostFailed,
          confirmButtonText: "Understand",
          timer: addPostFailed ? undefined : validationOrError ? 1750 : 1250,
        });
      }
    }
  }

  return (
    <Disclosure as="nav" className="bgNav">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/">
                    <img
                      className="block lg:hidden h-8 w-auto"
                      src={blogHookGet ? "logo.svg" : "../logo.svg"}
                      alt="Workflow"
                      style={{ padding: "3px 3px" }}
                    />
                  </Link>
                  <Link href="/">
                    <img
                      className="hidden lg:block h-8 w-auto"
                      src={blogHookGet ? "logo.svg" : "../logo.svg"}
                      alt="Workflow"
                      style={{ padding: "5px 5px" }}
                    />
                  </Link>
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) =>
                      !AuthUser.claims.admin &&
                      item.name === "Create Blog" ? null : (
                        <Link
                          href={
                            item.name === "Create Blog"
                              ? uuid
                                ? `/blog/[uuid]`
                                : item.href
                              : item.href
                          }
                          as={
                            item.name === "Create Blog"
                              ? uuid
                                ? `/blog/${uuid}`
                                : item.href
                              : undefined
                          }
                          key={item.name}
                        >
                          <a
                            onClick={() => {
                              createBlog(item.name);
                            }}
                            className={classNames(
                              item.current
                                ? "bgNavItem text-white"
                                : "text-gray-300 bgNavItemHover hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
              {isAuth(AuthUser) ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {/* <button className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>*/}
                  <p className="text-white hidden md:block">
                    {getPhoneOrProvider(AuthUser)}
                  </p>

                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-3 relative">
                    {({ open }) => (
                      <>
                        <div>
                          <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              /* https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80 */
                              src={getUserImage(AuthUser)}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          show={open}
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items
                            static
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bgNavItem ring-1 ring-black ring-opacity-5 focus:outline-none 2xl:z-50"
                          >
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="#"
                                  className={classNames(
                                    active ? "bgNavMenuItemSelect" : "",
                                    "block px-4 py-2 text-sm textWhite"
                                  )}
                                >
                                  Your Profile
                                </a>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href="#"
                                  className={classNames(
                                    active ? "bgNavMenuItemSelect" : "",
                                    "block px-4 py-2 text-sm textWhite"
                                  )}
                                >
                                  Settings
                                </a>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  style={{ cursor: "pointer" }}
                                  className={classNames(
                                    active ? "bgNavMenuItemSelect" : "",
                                    "block px-4 py-2 text-sm textWhite"
                                  )}
                                  onClick={() => AuthUser.signOut()}
                                >
                                  Sign out
                                </a>
                              )}
                            </Menu.Item>
                          </Menu.Items>
                        </Transition>
                      </>
                    )}
                  </Menu>
                </div>
              ) : (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <Link href="/auth">
                    <button className="bgNavItemHover p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                      <span className="sr-only">Ingresar</span>
                      <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* <Link href={item.name === "Create Blog" ? (uuid ? `/blog/[uuid]` : item.href) : item.href} as={item.name === "Create Blog" ? (uuid ? `/blog/${uuid}` : item.href) : undefined} key={item.name}> */}
              {navigation.map((item) =>
                !AuthUser.claims.admin && item.name === "Create Blog" ? null : (
                  <Link
                    key={item.name}
                    href={
                      item.name === "Create Blog"
                        ? uuid
                          ? `/blog/[uuid]`
                          : item.href
                        : item.href
                    }
                    as={
                      item.name === "Create Blog"
                        ? uuid
                          ? `/blog/${uuid}`
                          : item.href
                        : undefined
                    }
                  >
                    <a
                      onClick={() => {
                        createBlog(item.name);
                      }}
                      className={classNames(
                        item.current
                          ? "bgNavItem text-white"
                          : "text-gray-300 bgNavItemHover hover:text-white",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  </Link>
                )
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
