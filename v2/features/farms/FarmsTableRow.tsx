import { FC, Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";

import { classNames } from "v2/utils";
import FarmsTableSpacerRow from "./FarmsTableSpacerRow";
import FarmsTableRowHeader from "./FarmsTableRowHeader";
import BrineryTableRowHeader from "../brinery/BrineryTableRowHeader";
import FarmsTableRowBody from "./FarmsTableRowBody";
import { AssetWithData, BrineryWithData } from "v2/store/core";
import { isBrinery } from "v2/store/core.helpers";
import { useAppSelector } from "v2/store";
import { UserSelectors } from "v2/store/user";
import { useAccount } from "v2/hooks";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { AssetEnablement } from "picklefinance-core/lib/model/PickleModelJson";

interface Props {
  simple?: boolean;
  asset: AssetWithData | BrineryWithData;
  dashboard?: boolean;
  userDillRatio: number;
  hideDescription?: boolean;
}

const FarmsTableRow: FC<Props> = ({ asset, simple, dashboard, hideDescription, userDillRatio }) => {
  const account = useAccount();
  const userModel: UserData | undefined = useAppSelector((state) =>
    UserSelectors.selectData(state, account),
  );
  // temporary to filter UST jars, in future maybe add switch for withdraw only or label these jars permanently disabled
  if (asset.depositToken.components)
    for (let i = 0; i < asset.depositToken.components?.length; i++)
      if (
        asset.enablement === AssetEnablement.WITHDRAW_ONLY &&
        userModel &&
        userModel.tokens[asset.details.apiKey] &&
        userModel.tokens[asset.details.apiKey].depositTokenBalance !== "0"
      ) {
        return null;
        // let userInJar = false;
        // for (let i=0; i<Object.keys(userModel?.tokens).length; i++)
        //   if (Object.keys(userModel.tokens).includes(asset.depositToken))
      }
  if (isBrinery(asset))
    return (
      <>
        <tr>
          <BrineryTableRowHeader
            open={true}
            simple={simple}
            brinery={asset}
            userDillRatio={userDillRatio}
          />
        </tr>
        <FarmsTableRowBody asset={asset} hideDescription={hideDescription} />
      </>
    );
  if (simple)
    return (
      <>
        <tr className="group">
          <FarmsTableRowHeader
            open={false}
            simple={simple}
            asset={asset}
            dashboard={dashboard}
            userDillRatio={userDillRatio}
          />
        </tr>
        <FarmsTableSpacerRow />
      </>
    );

  return (
    <>
      <Disclosure as={Fragment}>
        {({ open }) => (
          <>
            <Disclosure.Button
              as="tr"
              // No hover state when the row is expaned.
              className={classNames(!open && "group", !simple && "cursor-pointer")}
            >
              <FarmsTableRowHeader
                open={open}
                simple={simple}
                asset={asset}
                userDillRatio={userDillRatio}
              />
            </Disclosure.Button>

            <Transition
              as={Fragment}
              enter="transition duration-100 ease-out"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition duration-100 ease-out"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Disclosure.Panel as="tr">
                <FarmsTableRowBody asset={asset} hideDescription={hideDescription} />
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
      <FarmsTableSpacerRow />
    </>
  );
};

export default FarmsTableRow;
