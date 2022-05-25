import DayPickerInput from "react-day-picker/DayPickerInput";
import { DayPickerInputProps } from "react-day-picker/types/Props";
import styled from "styled-components";
import { colors } from "../styles/theme";

interface DayPickerInputWrapperProps extends Omit<DayPickerInputProps, "classNames"> {
  className?: string;
}

const DayPickerInputWrapper = ({ className = "", ...rest }: DayPickerInputWrapperProps) => {
  return (
    <DayPickerInput
      classNames={{
        container: className,
        overlayWrapper: "overlayWrapper",
        overlay: "overlay",
      }}
      {...rest}
    />
  );
};

export const DayPicker = styled(DayPickerInputWrapper)({
  ".overlayWrapper": {},
  ".overlay": {
    position: "relative",
    zIndex: 999,
    ".DayPicker": {
      background: colors.background.grey,
      transform: "translate(-50%, 0)",
      position: "absolute",
      left: "50%",
      borderRadius: 5,
      border: `1px solid ${colors.border.green}`,
      marginTop: 2,
      ".DayPicker-Day": {
        pointerEvents: "none",
        color: "grey",
        "&.DayPicker-Day--range": {
          pointerEvents: "all",
          color: "white",
        },
      },
    },
  },
});
