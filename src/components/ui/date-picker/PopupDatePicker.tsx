"use client";

import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/ko";
import dayjs, { Dayjs } from "dayjs";

interface Props {
  label: string;
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

function PopupDatePicker({ label, value, onChange }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(newValue: Dayjs | null) => onChange(newValue ? newValue.toDate() : undefined)}
        format="YYYY-MM-DD"
        slotProps={{
          textField: { variant: "outlined", fullWidth: true },
        }}
      />
    </LocalizationProvider>
  );
}

export { PopupDatePicker };
