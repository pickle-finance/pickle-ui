import { cloneDeep } from "lodash";
import { UserData } from "picklefinance-core/lib/client/UserModel";

/**
 * A deep clone is important because if we dispatch data
 * passed to user model callbacks, Redux will make it
 * read-only, thus breaking the internals of UserModel.
 *
 */
export const normalizedData = (data: UserData): UserData => ({
  ...cloneDeep(data),
});
