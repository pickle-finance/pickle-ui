import { FC, MouseEventHandler } from "react";
import { useTranslation } from "next-i18next";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/solid";

import { classNames } from "v2/utils";
import { SetFunction } from "v2/types";

enum PageDirection {
  Forward = 1,
  Back = -1,
}

interface PaginationArrowProps {
  currentPage: number;
  pageCount: number;
  onClick: MouseEventHandler;
  type: "left" | "right";
}

const PaginationArrow: FC<PaginationArrowProps> = ({ currentPage, pageCount, onClick, type }) => {
  const Icon = type === "left" ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <Icon
      className={classNames(
        type === "left" && currentPage === 0 && "cursor-not-allowed text-foreground-alt-400",
        type === "left" &&
          currentPage !== 0 &&
          "cursor-pointer hover:text-accent transition duration-300 ease-in-out text-foreground-alt-200",
        type === "right" &&
          currentPage + 1 === pageCount &&
          "cursor-not-allowed text-foreground-alt-400",
        type === "right" &&
          currentPage + 1 !== pageCount &&
          "cursor-pointer hover:text-accent transition duration-300 ease-in-out text-foreground-alt-200",
        "w-5 h-5",
      )}
      onClick={onClick}
    />
  );
};

const Pagination: FC<{ currentPage: number; setCurrentPage: SetFunction; pageCount: number }> = ({
  currentPage,
  setCurrentPage,
  pageCount,
}) => {
  const { t } = useTranslation("common");
  const handlePageClick = (direction: PageDirection, setCurrentPage: SetFunction) => {
    const newPage = currentPage + direction;

    if (newPage < 0 || newPage >= pageCount) return;

    setCurrentPage(newPage);
  };

  return (
    <>
      <div className="flex items-center select-none">
        <PaginationArrow
          type="left"
          currentPage={currentPage}
          pageCount={pageCount}
          onClick={() => handlePageClick(PageDirection.Back, setCurrentPage)}
        />
        <span className="px-3 text-foreground-alt-200">
          {t("v2.farms.pagination", { current: currentPage + 1, total: pageCount })}
        </span>
        <PaginationArrow
          type="right"
          currentPage={currentPage}
          pageCount={pageCount}
          onClick={() => handlePageClick(PageDirection.Forward, setCurrentPage)}
        />
      </div>
    </>
  );
};

export default Pagination;
