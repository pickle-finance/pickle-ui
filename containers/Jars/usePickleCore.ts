import { useState, useEffect } from "react";
import { getPickleCore } from "../../util/api";
import { createContainer } from "unstated-next";
import { Connection } from "../Connection"
import { PickleModelJson } from "picklefinance-core";

const usePickleCore = () => {
    const [pickleCore, setPickleCore] = useState<PickleModelJson.PickleModelJson | null>(null);
    const { blockNum } = Connection.useContainer();
    const fetchPickleCore = async () => { setPickleCore(<PickleModelJson.PickleModelJson>await getPickleCore()) }

    useEffect(() => {
        fetchPickleCore();
    }, [ blockNum, ]);   // TODO: should be changed to something less frequent
    
    return { pickleCore, };
};

export const PickleCore = createContainer(usePickleCore);

