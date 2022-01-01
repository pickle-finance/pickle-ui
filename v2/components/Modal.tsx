import { FC, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
}

const Modal: FC<Props> = ({ isOpen, closeModal, title, children }) => {
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
            <Dialog.Overlay className="fixed inset-0 z-10 transition-all bg-black-light bg-opacity-50 backdrop-filter backdrop-blur-sm" />
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
                <span>{title}</span>
                <a
                  className="cursor-pointer p-2 text-gray-light hover:bg-black hover:text-white transition duration-300 ease-in-out rounded-xl"
                  onClick={closeModal}
                >
                  <XIcon className="w-5 h-5" />
                </a>
              </Dialog.Title>
              <div className="px-6 py-4 sm:px-8 sm:py-6">{children}</div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
