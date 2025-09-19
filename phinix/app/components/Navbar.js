import { useState } from "react";

export default function Navbar({ user, notifications }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [showUser, setShowUser] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700 fixed left-0 right-0 top-0 z-50">
      <div className="flex flex-wrap justify-between items-center">
        {/* Left side: Logo + search + drawer button */}
        <div className="flex justify-start items-center">
          {/* Mobile drawer toggle */}
          <button
            data-drawer-target="drawer-navigation"
            data-drawer-toggle="drawer-navigation"
            aria-controls="drawer-navigation"
            className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 5h14M3 10h6M3 15h14"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Toggle sidebar</span>
          </button>

          {/* Logo */}
          <a href="/" className="flex items-center mr-4">
            <img
              src="/logo.svg"
              className="mr-3 h-8"
              alt="CMS Logo"
            />
            <span className="self-center text-2xl font-semibold dark:text-white">
              MyCMS
            </span>
          </a>

          {/* Search (desktop only) */}
          <form action="#" method="GET" className="hidden md:block md:pl-2">
            <label htmlFor="topbar-search" className="sr-only">
              Search
            </label>
            <div className="relative md:w-64 md:w-96">
              <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="topbar-search"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Search"
              />
            </div>
          </form>
        </div>

        {/* Right side: notifications, apps, user */}
        <div className="flex items-center lg:order-2">
          {/* Notifications */}
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 mr-1 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            <span className="sr-only">View notifications</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-12 w-80 bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 font-medium text-center text-gray-700 dark:text-gray-300">
                Notifications
              </div>
              <div>
                {notifications?.map((n, idx) => (
                  <a
                    key={idx}
                    href={n.link}
                    className="flex py-3 px-4 border-b hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <div className="flex-shrink-0">
                      <img
                        className="w-11 h-11 rounded-full"
                        src={n.avatar}
                        alt={n.name}
                      />
                    </div>
                    <div className="pl-3 w-full">
                      <div className="text-gray-500 font-normal text-sm dark:text-gray-400">
                        {n.message}
                      </div>
                      <div className="text-xs font-medium text-primary-600 dark:text-primary-500">
                        {n.time}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* User menu */}
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex mx-3 text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="w-8 h-8 rounded-full"
              src={user?.avatar || "/default-avatar.png"}
              alt="user photo"
            />
          </button>
          {showUser && (
            <div className="absolute right-0 mt-12 w-56 text-base bg-white dark:bg-gray-700 rounded-xl shadow divide-y divide-gray-100 dark:divide-gray-600">
              <div className="py-3 px-4">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </span>
                <span className="block text-sm text-gray-900 truncate dark:text-white">
                  {user?.email}
                </span>
              </div>
              <ul className="py-1">
                <li>
                  <a
                    href="/profile"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    My profile
                  </a>
                </li>
                <li>
                  <a
                    href="/account"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                  >
                    Account settings
                  </a>
                </li>
                <li>
                  <a
                    href="/logout"
                    className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    Sign out
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
