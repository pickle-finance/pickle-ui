import { FC, Fragment } from "react";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "next-i18next";
import { XIcon } from "@heroicons/react/solid";

import Button from "./Button";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
}

const RewardRow: FC = () => {
  const { t } = useTranslation("common");

  return (
    <div className="flex justify-between font-body">
      <div className="flex">
        <div className="w-12 p-1 bg-black rounded-full mr-4 border-3 border-gray-outline">
          <Image
            src="/pickle-icon.svg"
            width={200}
            height={200}
            layout="responsive"
            alt="Pickle Finance"
            title="Pickle Finance"
          />
        </div>
        <div className="flex flex-col text-left justify-center">
          <p className="uppercase text-gray-light font-bold text-xs">
            PICKLE-ETH
          </p>
          <p className="text-green font-bold text-lg align-bottom leading-6">
            102.01
            <span className="text-white text-xs ml-2">PICKLEs</span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <Button type="secondary" size="small" handleClick={() => {}}>
          {t("v2.farms.harvest")}
        </Button>
      </div>
    </div>
  );
};

const HarvestModal: FC<Props> = ({ isOpen, closeModal }) => {
  const { t } = useTranslation("common");

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeModal}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-400"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 z-10 transition-all bg-black-light bg-opacity-60" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-400"
            enterFrom="opacity-0 scale-110"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-110"
          >
            <div className="relative inline-block w-full max-w-md overflow-hidden align-middle bg-black-light rounded-2xl border border-gray-dark z-20 transition-all transform">
              <Dialog.Title
                as="div"
                className="flex justify-between items-center text-lg text-left font-title font-medium leading-6 text-white px-6 py-4 sm:px-8 sm:py-6 border-b border-gray-dark"
              >
                <span>{t("v2.farms.harvestRewards")}</span>
                <a
                  className="cursor-pointer p-2 text-gray-light hover:bg-black hover:text-white transition duration-300 ease-in-out rounded-xl"
                  onClick={closeModal}
                >
                  <XIcon className="w-5 h-5" />
                </a>
              </Dialog.Title>
              <div className="px-6 py-4 sm:px-8 sm:py-6">
                <div className="grid gap-9">
                  <RewardRow />
                  <RewardRow />
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HarvestModal;
