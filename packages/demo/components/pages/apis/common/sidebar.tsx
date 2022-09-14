import { Link, Element } from 'react-scroll';

export default function ApisSidebar({ sidebarItems }) {
  return (
    <div className="hidden mb-6 mr-6 xl:block lg:w-72">
      <div className="sticky top-24">
        <aside aria-labelledby="categories-label">
          <h3 id="categories-label" className="sr-only">
            Topics
          </h3>
          <nav className="p-6 font-medium text-gray-500 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-gray-400">
            <ul className="space-y-4">
              {sidebarItems.map((item, i) => {
                return (
                  <li key={i}>
                    <Link
                      activeClass="text-primary-600 dark:text-primary-500"
                      className="hover:text-black dark:hover:text-white cursor-pointer"
                      to={item.to}
                      spy={true}
                      smooth={true}
                      duration={500}
                      offset={-100}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* <h4 className="mb-4 text-gray-900 dark:text-white">Others</h4> */}
          </nav>
        </aside>
        {/* <aside>
          <div className="flex justify-center items-center mb-3 w-full h-32 bg-gray-100 rounded-lg dark:bg-gray-800">
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <p className="mb-2 text-sm font-light text-gray-500 dark:text-gray-400">
            Students and Teachers, save up to 60% on Flowbite Creative Cloud.
          </p>
          <p className="text-xs font-light text-gray-400 uppercase dark:text-gray-500">
            Ads placeholder
          </p>
        </aside> */}
      </div>
    </div>
  );
}
