import React, { useState, useEffect } from "react";
import { Box, Typography, FormControl, Grid, Skeleton } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment";
import { axiosWithToken } from "../utils/axios.tsx";
import EventTimeButton from "./EventTimeButton.tsx";
import * as RadixSelect from "@radix-ui/react-select";
import { ChevronDownIcon } from "@radix-ui/react-icons";

interface EventRescheduleTimePickerProps {
  reservation: Reservation;
  onUpdateReservation: (updatedReservation: Reservation) => void;
}

interface StaffAvailability {
  [time: string]: number[];
}

interface TimeSlot {
  time: string;
  staffs: number[];
}

const dateFormat = "DD/MM/YYYY";

const EventRescheduleTimePicker: React.FC<EventRescheduleTimePickerProps> = ({
  reservation,
  onUpdateReservation,
}) => {
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(
    moment(reservation.bookingTime, "DD/MM/YYYY HH:mm")
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(
    reservation.staff
  );
  const [availableStaff, setAvailableStaff] = useState<Staff[]>([]);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>();
  const [loading, setLoading] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    null
  );

  useEffect(() => {
    if (selectedStaff && selectedStaff.id !== null && selectedDate) {
      if (selectedDate?.isBefore(moment(), "day")) {
        setAvailableTimes([]);
      } else {
        fetchStaffAvailability(selectedStaff.id, selectedDate.format(dateFormat));
      }
    }
  }, [selectedStaff, selectedDate]);

  const fetchStaffAvailability = async (staffId: number, date: string) => {
    setLoading(true);
    try {
      const response = await axiosWithToken.get(
        `/staff/allStaffAvailability?staffId=${staffId}&date=${date}`
      );
      const filteredTimes = filteredTimeSlots(response.data);
      setAvailableTimes(filteredTimes);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaff();
  }, []);

  const filteredTimeSlots = (
    originalAvailableTimes: StaffAvailability
  ): TimeSlot[] => {
    const currentHour = moment().hour();
    if (!originalAvailableTimes) return [];

    return Object.entries(originalAvailableTimes)
      .map(([time, staffs]) => ({
        time,
        staffs,
      }))
      .filter(({ time }) => {
        const hour = parseInt(time.split(":")[0]);
        return selectedDate?.isSame(moment(), "day")
          ? hour >= currentHour + 1
          : true;
      });
  };

  const anyStaff: Staff = {
    id: 0,
    firstName: "Anyone",
    lastName: "Professional",
    nickname: "Anyone",
    phone: "",
    skillLevel: 5,
    dateOfBirth: "",
    rate: 0,
    workingDays: "1,2,3,4,5,6,7",
    storeUuid: "store-uuid-123",
    tenantUuid: "",
    isActive: true,
  };

  const fetchAllStaff = async () => {
    try {
      const response = await axiosWithToken.get(`staff/?isOnlyActive=true`);
      setAvailableStaff([anyStaff, ...response.data]);
    } catch (error) {
      console.error("Error fetching staff availability:", error);
    }
  };

  const handleDateChange = (date: moment.Moment) => {
    setSelectedDate(date);
    if (date?.isBefore(moment(), "day")) {
      setAvailableTimes([]);
    }
    // fetchStaffAvailability(
    //   selectedStaff?.id || 0,
    //   date?.format(dateFormat) || moment().format(dateFormat)
    // );
  };

  const handleStaffChange = (staffId: string) => {
    fetchStaffAvailability(
      Number(staffId),
      selectedDate?.format(dateFormat) || moment().format(dateFormat)
    );
    const staff = availableStaff.find((s) => s.id === Number(staffId)) || null;
    setSelectedStaff(staff);
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTimeSlot(time);
    if (selectedStaff && selectedDate) {
      let staff = selectedStaff;
      // if selected staff is Any, get random staff from the return list
      if (selectedStaff.id === 0) {
        const filterStaff = getStaffById(
          time.staffs[Math.floor(Math.random() * time.staffs.length)]
        );
        if (filterStaff) {
          staff = filterStaff;
        }
      }
      const updatedReservation: Reservation = {
        ...reservation,
        staff: staff,
        bookingTime: `${selectedDate.format(dateFormat)} ${time.time}`,
      };
      onUpdateReservation(updatedReservation);
    }
  };

  const getStaffById = (staffId: number): Staff | undefined => {
    return availableStaff.find((staff) => staff.id === staffId);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
        <Typography variant="h6">Select Date</Typography>
          <DateCalendar value={moment(reservation.bookingTime.split(' ')[0], 'DD/MM/YYYY')} onChange={(newValue) => {
            handleDateChange(newValue);
          }} />
        </Box>
        <Box>
          <FormControl fullWidth>
          <Typography variant="h6">Select Staff</Typography>
            <RadixSelect.Root
              value={selectedStaff?.id?.toString() || ""}
              onValueChange={handleStaffChange}
            >
              <RadixSelect.Trigger
                id="staff-select"
                className="SelectTrigger"
                style={{
                  width: "200px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <RadixSelect.Value placeholder="Select a staff member" />
                <RadixSelect.Icon className="SelectIcon">
                  <ChevronDownIcon />
                </RadixSelect.Icon>
              </RadixSelect.Trigger>
              <RadixSelect.Content
                style={{ width: "200px", opacity: 1 }}
                position="popper"
                className="SelectContent z-10"
              >
                <RadixSelect.Viewport className="SelectViewport">
                  {availableStaff.map((staff) => (
                    <RadixSelect.Item
                      key={staff.id}
                      value={staff.id?.toString() || ""}
                      className="SelectItem"
                    >
                      <RadixSelect.ItemText>
                        {staff.nickname}
                      </RadixSelect.ItemText>
                    </RadixSelect.Item>
                  ))}
                </RadixSelect.Viewport>
              </RadixSelect.Content>
            </RadixSelect.Root>
          </FormControl>
        </Box>
        {loading ? (
          <Box sx={{maxWidth: {
            xs: "400px", // Small screens
            sm: "400px", // Medium screens
            md: "400px", // Medium screens
            lg: "700px", // Large screens
            xl: "700px", // Extra large screens
          },}}>
          <Grid container spacing={2}>
            {Array.from(new Array(15)).map((_, index) => (
              <Grid item xs={3} sm={2} lg={2} key={index}>
                <Skeleton variant="rectangular" width={60} height={40} />
              </Grid>
            ))}
          </Grid>
          </Box>
        ) : (
          <Box sx={{maxWidth: {
            xs: "400px", // Small screens
            sm: "400px", // Medium screens
            md: "400px", // Medium screens
            lg: "700px", // Large screens
            xl: "700px", // Extra large screens
          }, minWidth: "200px",}}>
            <Typography variant="h6">Select Time</Typography>
            <Grid container spacing={2}>
              {availableTimes && availableTimes.length > 0 ? (
                availableTimes.map((timeslot: TimeSlot) => (
                  <Grid
                    item
                    xs={"auto"} // 4 items per row on small screens
                    sm={"auto"} // 6 items per row on medium screens
                    lg={"auto"} // 8 items per row on large screens
                    key={timeslot.time}
                  >
                    <EventTimeButton
                      staffs={timeslot.staffs}
                      hour={timeslot.time}
                      selected={selectedTimeSlot?.time === timeslot.time}
                      onSelect={() => handleTimeSelect(timeslot)}
                    />
                  </Grid>
                ))
              ) : (
                <Typography sx={{margin: "1rem"}} variant="subtitle1">No available times</Typography>
              )}
            </Grid>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default EventRescheduleTimePicker;
