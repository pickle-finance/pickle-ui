import { FC } from "react";
import Image from "next/image";
import Link from "next/link";

import pickleLogo from "public/pickle-logo.png";
import NavItems from "./NavItems";

const Navbar: FC = () => (
  <div className="hidden sm:flex sm:flex-col sm:w-64 sm:fixed sm:inset-y-0">
    <div className="flex-1 flex flex-col min-h-0 bg-black py-8 border-r border-gray-dark">
      <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 mb-12">
        <div className="w-32">
          <Link href="/ws">
            <a aria-label="Pickle Finance home">
              <Image
                src={pickleLogo}
                width={500}
                height={191}
                priority
                layout="responsive"
                alt="Pickle Finance home"
                title="Pickle Finance home"
                placeholder="blur"
              />
            </a>
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <NavItems />
      </div>
    </div>
  </div>
);

export default Navbar;
