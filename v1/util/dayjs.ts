import dayjs from "dayjs";

// Plugins
import calendar from "dayjs/plugin/calendar";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import duration from "dayjs/plugin/duration";

dayjs.extend(calendar);
dayjs.extend(localizedFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(duration);

export default dayjs;
