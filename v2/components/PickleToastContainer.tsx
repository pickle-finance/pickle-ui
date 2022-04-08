import { FC } from "react";
import { ToastContainer } from "react-toastify";

const PickleToastContainer: FC = () => (
  <ToastContainer
    toastClassName={() =>
      "relative flex p-1 mb-2 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer bg-background-light"
    }
    bodyClassName={() => "flex text-sm text-foreground-alt-200 font-med block p-3"}
    position="bottom-right"
    autoClose={5000}
    hideProgressBar
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss={false}
    draggable={false}
    pauseOnHover
  />
);

export default PickleToastContainer;
