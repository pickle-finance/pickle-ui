import { VFC, useEffect } from "react";
import { useTranslation } from "next-i18next";

import { useAppDispatch } from "v2/store";
import { fetchDocs } from "v2/store/docs";

const DocsProvider: VFC = () => {
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    dispatch(fetchDocs(i18n.language));
  }, [i18n.language]);

  return null;
};

export default DocsProvider;
