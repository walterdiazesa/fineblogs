/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import Link from 'next/link'
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon, UserCircleIcon } from "@heroicons/react/outline";
import getAbsoluteURL from '../utils/getAbsoluteURL'
import axios from "axios"
import { useAuthUser } from 'next-firebase-auth'

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Nav({ blogHookGet, blogHookSet, uuid }) {

  const navigation = [
    { name: "Blogs", href: "/blog", current: true },
    { name: "Create Blog", href: "#", current: false },
  ]  

  const AuthUser = useAuthUser()

  /*if (AuthUser.claims.admin) {
    console.log("Nav (AuthUser.claims.admin): ")
    console.log(AuthUser.claims.admin)
  }*/

  /*const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 756)

    window.addEventListener('resize', function(event) {
      setIsMobile(window.innerWidth < 756)
    }, false)
  }, [])*/

  async function createBlog(btnname) {
    if (btnname === "Create Blog") {
                            
      const {value: formValues} = await Swal.fire({
        title: 'Create Blog',
        html:
          '<input id="swal-input1" class="swal2-input" placeholder="Title">' +
          '<input id="swal-input2" class="swal2-textarea" placeholder="Body">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Create Blog',
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value
          ]
        }
      })
      
      if (formValues) {

        //axios.get(getAbsoluteURL('/api/blogs')).then(data => console.log(data))

        let addPostModalTitle = ""
        let addPostModalBody = ""
        let addPostModalIcon = "info"
        let validationOrError = false
        let addPostFailed = false

        if (formValues.length !== 2) {

          addPostModalBody = "Can't leave blank inputs"

        } else if (!formValues[0] || !formValues[1]) {

          addPostModalBody = "You must add body and title"

        } else if (formValues[0].trim().length === 0 || formValues[1].trim().length === 0) {

          addPostModalBody = "Body and title cannot be blank"

        } else {

          validationOrError = true

          const token = await AuthUser.getIdToken()
          const { data } = await axios.post(getAbsoluteURL('/api/blog'), { formValues }, { headers : { Authorization: `Bearer ${token}` } })

          if (data.error) {
            addPostModalTitle = 'Failed adding blog'
            addPostModalBody = data.error
            addPostModalIcon = 'error'
            addPostFailed = true
          } else {
            addPostModalTitle = 'Success'
            addPostModalBody = `Post "${data.blog.title}" created successfully`
            addPostModalIcon = 'success'

            if (blogHookGet) {
              // blogHookSet(blogHookGet.concat({ _id: data._id, blog: { title: data.blog.title, body: data.blog.body }, _date: data._date })) // lo agrega de último
              blogHookSet([{ _id: data._id, blog: { title: data.blog.title, body: data.blog.body }, _date: data._date }, ...blogHookGet]) // Lo agrega de primero
            }
            //setBlogs(add)
          }

        }
        
        //JSON.stringify(formValues)
        Swal.fire({
          title: validationOrError ? addPostModalTitle : undefined,
          text: addPostModalBody,
          icon: addPostModalIcon,
          showConfirmButton: addPostFailed,
          confirmButtonText: "Understand",
          timer: addPostFailed ? undefined : validationOrError ? 1750 : 1250
        })
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
                  <img
                    className="block lg:hidden h-8 w-auto"
                    src={ blogHookGet ? "logo.svg" : "../logo.svg"}
                    alt="Workflow"
                    style={{padding: '3px 3px'}}
                  />
                  <img
                    className="hidden lg:block h-8 w-auto"
                    src={ blogHookGet ? "logo.svg" : "../logo.svg"}
                    alt="Workflow"
                    style={{padding: '5px 5px'}}
                  />
                </div>
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      !AuthUser.claims.admin && item.name === "Create Blog" ? null :
                      <Link href={item.name === "Create Blog" ? (uuid ? `/blog/[uuid]` : item.href) : item.href} as={item.name === "Create Blog" ? (uuid ? `/blog/${uuid}` : item.href) : undefined} key={item.name}><a
                        onClick={() => { createBlog(item.name) }}
                        className={classNames(
                          item.current
                            ? "bgNavItem text-white"
                            : "text-gray-300 bgNavItemHover hover:text-white",
                          "px-3 py-2 rounded-md text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </a></Link>
                    ))}
                  </div>
                </div>
              </div>
              {AuthUser.email ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  {/*<button className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>*/}
                  <p className="text-white hidden md:block">{/*!isMobile && */AuthUser.email}</p>

                  {/* Profile dropdown */}
                  <Menu as="div" className="ml-3 relative">
                    {({ open }) => (
                      <>
                        <div>
                          <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="h-8 w-8 rounded-full"
                              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
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
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bgNavItem ring-1 ring-black ring-opacity-5 focus:outline-none"
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
                  <Link href="/auth"><button className="bgNavItemHover p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                    <span className="sr-only">Ingresar</span>
                    <UserCircleIcon className="h-6 w-6" aria-hidden="true" />
                  </button></Link>
                </div>
              )}
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* <Link href={item.name === "Create Blog" ? (uuid ? `/blog/[uuid]` : item.href) : item.href} as={item.name === "Create Blog" ? (uuid ? `/blog/${uuid}` : item.href) : undefined} key={item.name}> */}
              {navigation.map((item) => (
                !AuthUser.claims.admin && item.name === "Create Blog" ? null :
                <Link key={item.name} href={item.name === "Create Blog" ? (uuid ? `/blog/[uuid]` : item.href) : item.href} as={item.name === "Create Blog" ? (uuid ? `/blog/${uuid}` : item.href) : undefined}><a onClick={() => { createBlog(item.name) }} className={classNames(
                    item.current
                      ? "bgNavItem text-white"
                      : "text-gray-300 bgNavItemHover hover:text-white",
                    "block px-3 py-2 rounded-md text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </a></Link>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
