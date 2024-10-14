import React, { useState } from "react";
import {
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridColDef, GridRowId } from "@mui/x-data-grid";
import { axiosWithToken } from "../utils/axios";
import moment from "moment";
import { useMediaQuery } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { green, red } from "@mui/material/colors";
import { Controller, useForm } from "react-hook-form";

const ManageCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20); // Default page size
  const [rowCount, setRowCount] = useState(0); // Total number of rows
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<null | GridRowId>(null);

  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      searchString: "",
      filterBlacklisted: false,
    },
  });

  const searchString = watch("searchString");
  const filterBlacklisted = watch("filterBlacklisted");

  const formatPhoneNumber = (mobileNumber: string) => {
    if (!mobileNumber) {
      return "";
    }
    const part1 = mobileNumber.slice(0, 4); // First 2 digits
    const part2 = mobileNumber.slice(4, 7); // Next 4 digits
    const part3 = mobileNumber.slice(7, mobileNumber.length); // Last 4 digits
    return `${part1} ${part2} ${part3}`;
  };

  const mobileColumns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    {
      field: "email",
      headerName: "Email",
      width: 200,
      valueFormatter: (params: string) => formatPhoneNumber(params),
    },
    { field: "phone", headerName: "Phone", width: 150 },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 150,
      valueFormatter: (params: { value: any }) =>
        moment(params.value).format("DD-MM-YYYY"),
    },
    {
      field: "blacklisted",
      headerName: "Blacklisted",
      width: 150,
      renderCell: (params) =>
        params.value ? (
          <CheckIcon style={{ color: red[500] }} />
        ) : (
          <CloseIcon style={{ color: green[500] }} />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleMenuOpen(event, params.id)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const desktopColumns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      valueFormatter: (params: string) => formatPhoneNumber(params),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      valueFormatter: (params: { value: any }) =>
        moment(params.value).format("DD-MM-YYYY"),
    },
    {
      field: "blacklisted",
      headerName: "Blacklisted",
      flex: 1,
      renderCell: (params) =>
        params.value ? (
          <CheckIcon style={{ color: red[500] }} />
        ) : (
          <CloseIcon style={{ color: green[500] }} />
        ),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleMenuOpen(event, params.id)}>
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const isSmallOrMediumScreen = useMediaQuery("(max-width:960px)");
  const columns = isSmallOrMediumScreen ? mobileColumns : desktopColumns;

  const fetchCustomers = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const response = await axiosWithToken.get(`/customer/search`, {
        params: {
          page: page,
          size: pageSize,
          sort: "id,DESC",
          filterBlacklisted: filterBlacklisted,
          searchString: searchString,
        },
      });
      setCustomers(response.data.content);
      setRowCount(response.data.totalElements);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: GridRowId
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleMenuItemClick = (action: string) => {
    console.log(`Action: ${action}, Row ID: ${selectedRow}`);
    handleMenuClose();
  };

  const onSubmit = (data: {
    searchString: string;
    filterBlacklisted: boolean;
  }) => {
    fetchCustomers(page, pageSize);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 2,
            flexWrap: "wrap", // Allow wrapping on small screens
            "@media (min-width:600px)": {
              flexWrap: "nowrap", // No wrapping on medium and large screens
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%", // Full width on small screens
              marginBottom: 1, // Add margin bottom for small screens
              "@media (min-width:600px)": {
                width: "auto", // Auto width on medium and large screens
                marginRight: 2,
                marginBottom: 0, // Remove margin bottom for medium and large screens
              },
            }}
          >
            <Controller
              name="searchString"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Search Customers by Phone, Email, First Name, Last Name"
                  variant="outlined"
                  fullWidth
                  sx={{
                    marginRight: 2,
                    width: "100%", // Full width on small screens
                    "@media (min-width:600px)": {
                      width: "500px", // Width for medium and large screens
                    },
                  }}
                />
              )}
            />
            <Controller
              name="filterBlacklisted"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      color="primary"
                    />
                  }
                  label="Filter Blacklisted"
                  sx={{
                    marginRight: 2,
                    "@media (min-width:600px)": {
                      marginRight: 0,
                    },
                  }}
                />
              )}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{
              width: "100%", // Full width on small screens
              backgroundColor: "black",
              color: "white",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "black",
              },
              "@media (min-width:600px)": {
                width: "200px", // Width for medium and large screens
              },
            }}
          >
            Search
          </Button>
        </Box>
      </form>
      <DataGrid
        rows={customers}
        columns={columns}
        loading={loading}
        paginationMode="server"
        pagination
        hideFooterSelectedRowCount
        rowCount={rowCount} // Total number of rows for the pagination
        initialState={{
          density: "compact",
          pagination: {
            paginationModel: {
              pageSize: pageSize,
              page: page,
            },
          },
        }}
        pageSizeOptions={[20, 50, 100]}
        onPaginationModelChange={(params) => {
          setPage(params.page);
          setPageSize(params.pageSize);
          fetchCustomers(params.page, params.pageSize);
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuItemClick("Edit Info")}>
          Edit Info
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick("Set Blacklisted")}>
          Set Blacklisted
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick("Find Bookings")}>
          Find Bookings
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ManageCustomersPage;
