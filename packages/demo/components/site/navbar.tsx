import { useEffect, useState } from 'react';
import Link from 'next/link';
import useLocalStorage from '../../hooks/useLocalStorage';
import {
  SunIcon,
  MoonIcon,
  Bars4Icon,
  XMarkIcon,
  WalletIcon,
  ChevronDownIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/solid';
import SvgGithub from '../svgs/github';
import SvgMesh from '../svgs/mesh';

export default function Navbar() {
  const [darkMode, setDarkMode] = useLocalStorage('darkmode', false);
  const [isSSR, setIsSSR] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSubmenuApi, setShowSubmenuApi] = useState(false);

  useEffect(() => {
    setIsSSR(false);
  }, []);

  function setDarkTheme(bool) {
    if (bool) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setDarkMode(bool);
  }

  function toggle() {
    setDarkMode(!darkMode);
  }

  function toggleMobileMenu() {
    setShowMobileMenu(!showMobileMenu);
  }

  function toggleSubmenuApi() {
    setShowSubmenuApi(!showSubmenuApi);
  }

  useEffect(() => {
    setDarkTheme(darkMode);
  }, [darkMode]);

  return (
    <header>
      <nav className="border-gray-200 px-4 lg:px-6 py-2.5 fixed z-30 w-full border-b dark:border-gray-700 bg-white/80 backdrop-blur dark:bg-gray-800/80">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <a href="/" className="flex items-center">
            {!isSSR && (
              <>
                <SvgMesh
                  className="mr-3 h-6 sm:h-9"
                  fill={darkMode ? '#ffffff' : '#000000'}
                />
              </>
            )}
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Mesh
            </span>
          </a>
          <div className="flex items-center lg:order-2">
            <a
              href="https://github.com/MartifyLabs/mesh"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            >
              <SvgGithub className="w-6 h-6" />
            </a>

            {!isSSR && (
              <button
                type="button"
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5"
                onClick={() => {
                  toggle();
                }}
              >
                {darkMode ? (
                  <MoonIcon className="h-4 w-4 text-gray-500" />
                ) : (
                  <SunIcon className="h-4 w-4 text-gray-500" />
                )}
              </button>
            )}

            <button
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              onClick={() => toggleMobileMenu()}
            >
              <span className="sr-only">Open main menu</span>
              <Bars4Icon className={`${showMobileMenu && 'hidden'} w-6 h-6`} />
              <XMarkIcon className={`${!showMobileMenu && 'hidden'} w-6 h-6`} />
            </button>
          </div>
          <div
            className={`${
              !showMobileMenu && 'hidden'
            } justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
            id="mobile-menu-2`}
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <NavLink href="/guides" label="Guides" />{' '}
              <li>
                <button
                  className="flex justify-between items-center py-2 pr-4 pl-3 w-full font-medium text-gray-700 border-b border-gray-100 lg:w-auto hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-600 lg:p-0 dark:text-gray-400 lg:dark:hover:text-primary-500 dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                  onClick={() => {
                    toggleSubmenuApi();
                  }}
                >
                  APIs{' '}
                  <ChevronDownIcon className="ml-1 w-5 h-5 lg:w-4 lg:h-4" />
                </button>
                <div
                  className={`grid ${
                    !showSubmenuApi && 'hidden'
                  } absolute z-10 w-full bg-white border border-gray-100 shadow-md dark:border-gray-700 lg:rounded-lg lg:w-auto lg:grid-cols-1 dark:bg-gray-700`}
                >
                  <div className="p-2 text-gray-900 bg-white lg:rounded-lg dark:text-white lg:col-span-1 dark:bg-gray-800">
                    <ul>
                      <SubMenuLinks
                        href={`/apis/browserwallet`}
                        title="Browser Wallet"
                        desc="Connect and perform wallet functions on Web3 dApps"
                        icon={<WalletIcon className="w-5 h-5" />}
                        setShowSubmenuApi={setShowSubmenuApi}
                      />
                      <SubMenuLinks
                        href={`/apis/transaction`}
                        title="Transaction"
                        desc="Build transactions, minting, redeem from smart contracts"
                        icon={<PuzzlePieceIcon className="w-5 h-5" />}
                        setShowSubmenuApi={setShowSubmenuApi}
                      />
                    </ul>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

function SubMenuLinks({ href, title, desc, icon, setShowSubmenuApi }) {
  return (
    <li>
      <Link href={href}>
        <div className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
          <div className="p-2 mr-4 bg-white rounded-lg shadow dark:bg-gray-700">
            {icon}
          </div>
          <div>
            <div className="font-semibold">{title}</div>
            <div className="text-sm font-light text-gray-500 dark:text-gray-400">
              {desc}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}

function NavLink({ href, label }) {
  return (
    <li>
      <Link href={href}>
        <span className="flex items-center py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-600 lg:p-0 dark:text-gray-400 lg:dark:hover:text-primary-500 dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700 cursor-pointer">
          {label}
        </span>
      </Link>
    </li>
  );
}
