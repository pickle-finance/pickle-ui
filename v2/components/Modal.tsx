import { FC, Fragment, ReactElement } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";

import { useAppSelector } from "v2/store";
import { ThemeSelectors } from "v2/store/theme";
import { classNames } from "v2/utils";

interface Props {
  isOpen: boolean;
  closeModal: () => void;
  title: string;
  size?: "normal" | "wide" | "xl";
  footer?: ReactElement;
}

const Modal: FC<Props> = ({ isOpen, closeModal, title, children, footer, size = "normal" }) => {
  const isConfettiOn = useAppSelector(ThemeSelectors.selectIsConfettiOn);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-220 overflow-y-auto" onClose={closeModal}>
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
            <Dialog.Overlay
              className={classNames(
                "fixed inset-0 z-210 transition-all bg-background-light bg-opacity-50",
                // Impossible to render smoothly over a blurred background.
                !isConfettiOn && "backdrop-filter backdrop-blur-sm",
              )}
            />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
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
            <div
              className={classNames(
                "relative inline-block w-full align-middle bg-background-light rounded-2xl border border-foreground-alt-500 z-220 transition-all",
                size === "normal" && "max-w-md",
                size === "wide" && "max-w-lg",
                size === "xl" && "max-w-3xl",
              )}
            >
              <Dialog.Title
                as="div"
                className="flex justify-between items-center text-lg text-left font-title font-medium leading-6 text-foreground px-6 py-4 sm:px-8 sm:py-6 border-b border-foreground-alt-500"
              >
                <span>{title}</span>
                <button
                  className="cursor-pointer p-2 text-foreground-alt-200 hover:bg-background hover:text-foreground outline-none transition duration-300 ease-in-out rounded-xl"
                  onClick={closeModal}
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </Dialog.Title>
              <div className="px-6 py-4 sm:px-8 sm:py-6">{children}</div>
              {footer && (
                <div className="text-foreground px-6 py-2 sm:px-8 sm:py-3 border-t border-foreground-alt-500">
                  {footer}
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Modal;
