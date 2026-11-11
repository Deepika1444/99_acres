import { useEffect, useMemo, useState } from "react";
import { Alert, Autocomplete, Box, Button, Checkbox, CircularProgress, Dialog, DialogContent, Divider, IconButton, LinearProgress, MenuItem, Radio, Select, Switch, TextField, Typography } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Navbar from "../components/Navbar";
import { getAuthToken, getAuthUser, getUserInitials } from "../utils/authStorage";

const SUBTYPE_LABELS = {
  flat_apartment: "Residential Flat/Apartment",
  independent_house_villa: "Independent House / Villa",
  independent_builder_floor: "Builder Floor",
  plot_land: "Plot / Land",
  studio_apartment: "1 RK / Studio Apartment",
  serviced_apartment: "Serviced Apartment",
  farmhouse: "Farmhouse",
  office: "Office",
  retail: "Retail",
  commercial_land: "Commercial Plot / Land",
  warehouse_godown: "Warehouse / Godown",
  industrial_shed: "Industrial Shed",
  other: "Property",
};

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
}

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
  return `${amount.toLocaleString("en-IN")}`;
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getListFromResult(result) {
  if (Array.isArray(result)) return result;
  const data = result?.data;
  const nestedData = data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(nestedData)) return nestedData;
  const options = [
    data?.properties,
    data?.listings,
    data?.items,
    data?.docs,
    data?.rows,
    nestedData?.properties,
    nestedData?.listings,
    nestedData?.items,
    nestedData?.docs,
    nestedData?.rows,
    result?.properties,
    result?.listings,
    result?.items,
    result?.docs,
    result?.rows,
  ];
  for (const item of options) if (Array.isArray(item)) return item;
  const single = data?.property || nestedData?.property || result?.property;
  if (single && typeof single === "object") return [single];
  return [];
}

function getCityOptionsFromResult(result) {
  const cityRows = Array.isArray(result?.data)
    ? result.data
    : Array.isArray(result?.data?.data)
      ? result.data.data
      : Array.isArray(result?.data?.cities)
        ? result.data.cities
        : Array.isArray(result?.cities)
          ? result.cities
          : Array.isArray(result)
            ? result
            : [];

  return cityRows
    .map((item) => {
      if (typeof item === "string") return item.trim();
      return String(item?.CityName || item?.cityName || item?.city || item?.name || item?.label || "").trim();
    })
    .filter(Boolean);
}

function normalizeCard(source) {
  const basic = source?.basicDetails || source?.basic || {};
  const location = source?.locationDetails || source?.location || {};
  const profile = source?.propertyProfile || source?.profile || {};
  const areaDetails = profile?.areaDetails || {};
  const pricing = source?.pricingDetails || source?.pricing || {};
  const priceDetails = pricing?.priceDetails || source?.priceDetails || {};

  const propertySubType = String(pickFirst(basic?.propertySubType, source?.propertySubType)).trim();
  const title = `${SUBTYPE_LABELS[propertySubType] || "Property"} for Sell`;
  const city = String(pickFirst(location?.city, source?.city)).trim();
  const locality = String(pickFirst(location?.locality, source?.locality)).trim();
  const subLocality = String(pickFirst(location?.subLocality, source?.subLocality)).trim();
  const address = [subLocality, locality, city].filter(Boolean).join(", ") || "Location not available";
  const expectedPrice = pickFirst(priceDetails?.expectedPrice, source?.expectedPrice, source?.price);
  const carpetArea = pickFirst(areaDetails?.carpetArea?.value, source?.carpetArea, source?.builtUpArea, "");
  const completion = Number(pickFirst(source?.completionPercent, source?.completion, 65));

  return {
    propertyId: String(pickFirst(source?.propertyId, source?._id)).trim(),
    title,
    address,
    priceText: formatPrice(expectedPrice),
    carpetAreaText: carpetArea ? `${carpetArea} sq.ft.` : "-",
    postedOn: formatDate(source?.createdAt || source?.updatedAt),
    expiryOn: formatDate(new Date(Date.now() + 1000 * 60 * 60 * 24 * 240)),
    completion: Number.isFinite(completion) ? Math.max(0, Math.min(100, completion)) : 65,
    raw: source,
  };
}

function clearPropertyDraftStorage() {
  const keys = [
    "postPropertyId",
    "previewPropertyId",
    "postPropertyEditMode",
    "postPropertyBasicDetails",
    "postPropertyLocationDetails",
    "postPropertyProfileDetails",
    "postPropertyMediaDetails",
    "postPropertyAmenitiesDetails",
  ];
  keys.forEach((key) => localStorage.removeItem(key));
}

async function fetchPropertyForEdit(propertyId, token, apiBaseUrl) {
  const detailPaths = [
    `/api/properties/${encodeURIComponent(propertyId)}`,
    `/api/properties/details/${encodeURIComponent(propertyId)}`,
    `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
  ];
  for (const path of detailPaths) {
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) continue;
      const payload = result?.data?.property || result?.property || result?.data || result;
      if (payload && typeof payload === "object") return payload;
    } catch {
      // Try next endpoint.
    }
  }
  return null;
}

export default function PostPropertyUserDashboard() {
  const deleteReasons = [
    "Property is sold out",
    "Unable to edit",
    "Have changed my mind",
    "Not satisfied with 99acres",
    "Others",
  ];
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("All Listings");
  const [deletingId, setDeletingId] = useState("");
  const [selectedPropertyIds, setSelectedPropertyIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [deleteDialogRow, setDeleteDialogRow] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteOtherReason, setDeleteOtherReason] = useState("");
  const user = getAuthUser();
  const userId = useMemo(
    () => String(user?._id || user?.id || user?.userId || "").trim(),
    [user?._id, user?.id, user?.userId]
  );
  const ownerName = String(user?.fullName || user?.name || "Owner").trim() || "Owner";
  const initials = getUserInitials(user, "O");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Please login to view your listings.");
        setLoading(false);
        return;
      }
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const queryParams = new URLSearchParams({ sortOrder });
      if (selectedCity) queryParams.set("city", selectedCity);
      const queryString = queryParams.toString();
      const paths = [
        ...(userId ? [`/api/properties/user/${encodeURIComponent(userId)}?${queryString}`] : []),
        `/api/properties?${queryString}`,
        `/api/properties/my-listings?${queryString}`,
        `/api/properties/my-properties?${queryString}`,
        `/api/properties/owner?${queryString}`,
        `/api/properties/user?${queryString}`,
      ];

      for (const path of paths) {
        try {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) continue;
          const list = getListFromResult(result);
          if (!Array.isArray(list) || list.length === 0) {
            continue;
          }
          if (!cancelled) {
            setRows(list.map(normalizeCard));
            setLoading(false);
            setError("");
          }
          return;
        } catch {
          // try next
        }
      }

      // Fallback: try to render single current property if list APIs are empty.
      const currentPropertyId = String(localStorage.getItem("postPropertyId") || "").trim();
      if (currentPropertyId) {
        const detailPaths = [
          `/api/properties/${encodeURIComponent(currentPropertyId)}`,
          `/api/properties/details/${encodeURIComponent(currentPropertyId)}`,
          `/api/properties/property-details/${encodeURIComponent(currentPropertyId)}`,
        ];
        for (const detailPath of detailPaths) {
          try {
            const response = await fetch(`${apiBaseUrl}${detailPath}`, {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) continue;
            const single = result?.data?.property || result?.property || result?.data || result;
            if (single && typeof single === "object") {
              if (!cancelled) {
                setRows([normalizeCard(single)]);
                setLoading(false);
                setError("");
              }
              return;
            }
          } catch {
            // try next fallback endpoint
          }
        }
      }

      if (!cancelled) {
        setRows([]);
        setError("Unable to load listings from DB.");
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedCity, sortOrder, userId]);

  useEffect(() => {
    let active = true;
    const token = getAuthToken();
    const trimmedQuery = cityQuery.trim();

    if (!trimmedQuery) {
      setCityOptions(selectedCity ? [selectedCity] : []);
      setCityLoading(false);
      return undefined;
    }

    setCityLoading(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const timerId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/locations/cities?search=${encodeURIComponent(trimmedQuery)}`,
          {
            method: "GET",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            cache: "no-store",
          }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !active) {
          if (active) setCityOptions(selectedCity ? [selectedCity] : []);
          return;
        }

        const nextOptions = getCityOptionsFromResult(result);
        const uniqueOptions = [...new Set(selectedCity ? [selectedCity, ...nextOptions] : nextOptions)];
        setCityOptions(uniqueOptions);
      } catch {
        if (active) setCityOptions(selectedCity ? [selectedCity] : []);
      } finally {
        if (active) setCityLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [cityQuery, selectedCity]);

  const totalText = useMemo(() => `Displaying 1 - ${rows.length} of ${rows.length} results`, [rows.length]);
  const sortedRows = useMemo(() => {
    const getTime = (value) => {
      const time = new Date(value?.raw?.createdAt || value?.raw?.updatedAt || 0).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    return [...rows].sort((a, b) => {
      const first = getTime(a);
      const second = getTime(b);
      return sortOrder === "oldest" ? first - second : second - first;
    });
  }, [rows, sortOrder]);
  const allSelectableIds = useMemo(
    () => sortedRows.map((row) => String(row?.propertyId || "").trim()).filter(Boolean),
    [sortedRows]
  );
  const isAllSelected = useMemo(
    () => allSelectableIds.length > 0 && selectedPropertyIds.length === allSelectableIds.length,
    [allSelectableIds, selectedPropertyIds.length]
  );
  const menuSections = [
    {
      title: "My99acres",
      items: [{ label: "Manage Products", isSectionHeader: true }, { label: "All Product" }],
    },
    {
      title: "",
      items: [
        { label: "Listings", children: ["All Listings", "Plain Listings", "Platinum Listings", "Premium Listings", "Infinity Listings", "AI Listings"] },
        { label: "Projects" },
        { label: "Banners" },
        { label: "FSL Booking" },
        { label: "Manage BOSS" },
      ],
    },
    {
      title: "",
      items: [
        { label: "Manage Responses", isSectionHeader: true },
        { label: "All Responses" },
        { label: "Listings" },
        { label: "Projects" },
        { label: "All Leads" },
      ],
    },
    {
      title: "",
      items: [{ label: "Upload Media", isSectionHeader: true }, { label: "AI Listings" }],
    },
    {
      title: "",
      items: [
        { label: "Manage Subscriptions", isSectionHeader: true },
        { label: "Manage Payments" },
        { label: "Subscription Status" },
        { label: "Credit Usage History" },
        { label: "Upgrade History" },
        { label: "Manage Sub-users 0" },
        { label: "Omni Ads Performance" },
      ],
    },
    {
      title: "",
      items: [
        { label: "My Profile", isSectionHeader: true },
        { label: "Shortlist" },
        { label: "My Leads" },
        { label: "Change Password" },
        { label: "Opt out Dealer Response" },
      ],
    },
  ];

  const persistEditDraftFromRow = (row, overrideSource) => {
    const source =
      overrideSource && typeof overrideSource === "object"
        ? overrideSource
        : row?.raw && typeof row.raw === "object"
          ? row.raw
          : {};
    const basic = source?.basicDetails || source?.basic || {};
    const location = source?.locationDetails || source?.location || {};
    const profile = source?.propertyProfile || source?.profile || {};
    const media = source?.mediaDetails || {};
    const amenities = source?.amenitiesDetails || source?.amenities || {};

    const propertyIdForEdit = String(
      source?.propertyId || source?._id || row?.propertyId || localStorage.getItem("postPropertyId") || ""
    ).trim();

    clearPropertyDraftStorage();
    if (propertyIdForEdit) localStorage.setItem("postPropertyId", propertyIdForEdit);
    localStorage.setItem(
      "postPropertyBasicDetails",
      JSON.stringify({
        lookingTo: String(basic?.lookingTo || "sell"),
        propertyKind: String(basic?.propertyKind || "residential"),
        propertySubType: String(basic?.propertySubType || "flat_apartment"),
      })
    );
    localStorage.setItem(
      "postPropertyLocationDetails",
      JSON.stringify({
        city: String(location?.city || "").trim(),
        locality: String(location?.locality || "").trim(),
        subLocality: String(location?.subLocality || "").trim(),
        apartmentSociety: String(location?.apartmentSociety || "").trim(),
        houseNumber: String(location?.houseNumber || "").trim(),
      })
    );
    localStorage.setItem("postPropertyProfileDetails", JSON.stringify(profile || {}));
    localStorage.setItem("postPropertyMediaDetails", JSON.stringify(media || {}));
    localStorage.setItem("postPropertyAmenitiesDetails", JSON.stringify(amenities || {}));
    localStorage.setItem("postPropertyEditMode", "1");
  };

  const handleEditRow = async (row) => {
    const editWindow = window.open("", "_blank");
    const propertyId = String(row?.propertyId || "").trim();
    const token = getAuthToken();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    let fullSource = null;
    if (propertyId && token) {
      fullSource = await fetchPropertyForEdit(propertyId, token, apiBaseUrl);
    }
    persistEditDraftFromRow(row, fullSource);
    if (editWindow) {
      editWindow.opener = null;
      editWindow.location.href = "/post-property/primary-details";
    } else {
      window.location.href = "/post-property/primary-details";
    }
  };

  const handlePreviewRow = (row) => {
    const propertyId = String(row?.propertyId || "").trim();
    if (!propertyId) return;
    localStorage.setItem("previewPropertyId", propertyId);
    window.open("/post-property/property-preview", "_blank", "noopener,noreferrer");
  };

  const handleDeleteRow = (row) => {
    const propertyId = String(row?.propertyId || "").trim();
    if (!propertyId || deletingId) return;
    setDeleteDialogRow(row);
    setDeleteReason("");
    setDeleteOtherReason("");
  };

  const handleCloseDeleteDialog = () => {
    if (deletingId) return;
    setDeleteDialogRow(null);
    setDeleteReason("");
    setDeleteOtherReason("");
  };

  const handleConfirmDeleteRow = async () => {
    const propertyId = String(deleteDialogRow?.propertyId || "").trim();
    if (!propertyId || deletingId) return;
    if (deleteReason === "Others" && !deleteOtherReason.trim()) return;

    const token = getAuthToken();
    if (!token) {
      setError("Login token missing. Please login again.");
      return;
    }

    try {
      setDeletingId(propertyId);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${apiBaseUrl}/api/properties/${encodeURIComponent(propertyId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result?.message || "Unable to delete property.");
        return;
      }
      setRows((prev) => {
        const next = prev.filter((item) => String(item?.propertyId || "").trim() !== propertyId);
        clearPropertyDraftStorage();
        return next;
      });
      setError("");
      handleCloseDeleteDialog();
    } catch {
      setError("Unable to delete property right now.");
    } finally {
      setDeletingId("");
    }
  };

  const toggleSelectRow = (propertyId) => {
    const id = String(propertyId || "").trim();
    if (!id) return;
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedPropertyIds((prev) => (prev.length === allSelectableIds.length ? [] : allSelectableIds));
  };

  const handleDeleteSelected = async () => {
    if (bulkDeleting || selectedPropertyIds.length === 0) return;
    const ok = window.confirm(`Delete ${selectedPropertyIds.length} selected properties permanently?`);
    if (!ok) return;

    const token = getAuthToken();
    if (!token) {
      setError("Login token missing. Please login again.");
      return;
    }

    try {
      setBulkDeleting(true);
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const failed = [];

      for (const propertyId of selectedPropertyIds) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/properties/${encodeURIComponent(propertyId)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) failed.push(propertyId);
        } catch {
          failed.push(propertyId);
        }
      }

      const failedSet = new Set(failed);
      const selectedSet = new Set(selectedPropertyIds);
      setRows((prev) =>
        prev.filter((item) => {
          const id = String(item?.propertyId || "").trim();
          if (!selectedSet.has(id)) return true;
          return failedSet.has(id);
        })
      );
      if (failed.length > 0) {
        setError(`Deleted ${selectedPropertyIds.length - failed.length} properties. Failed to delete ${failed.length}.`);
      } else {
        setError("");
      }
      clearPropertyDraftStorage();
      setSelectedPropertyIds([]);
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSidebarMenuClick = (itemLabel) => {
    if (itemLabel === "Shortlist") {
      window.location.href = "/post-property/shortlist-property";
      return;
    }
    setActiveMenu(itemLabel);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#edf1f6", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Dialog
        open={Boolean(deleteDialogRow)}
        onClose={handleCloseDeleteDialog}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: 468,
              maxWidth: "calc(100vw - 24px)",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 10px 28px rgba(0, 0, 0, 0.28)",
            },
          },
        }}
      >
        <Box sx={{ height: 29, px: 1.15, bgcolor: "#5b616b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ color: "#ffffff", fontSize: 10.5, fontWeight: 700, lineHeight: 1 }}>
            Tell us your reason to delete this listing
          </Typography>
          <IconButton onClick={handleCloseDeleteDialog} disabled={Boolean(deletingId)} sx={{ p: 0.2, color: "#ffffff", mr: -0.4 }}>
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ px: 1.15, pt: 1.0, pb: 1.1 }}>
          <Box sx={{ display: "grid", gap: 0.15 }}>
            {deleteReasons.map((reason) => (
              <Box
                key={reason}
                onClick={() => setDeleteReason(reason)}
                sx={{
                  minHeight: 23,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.55,
                  cursor: "pointer",
                }}
              >
                <Radio
                  checked={deleteReason === reason}
                  onChange={() => setDeleteReason(reason)}
                  size="small"
                  sx={{
                    p: 0.2,
                    color: "#7f7f7f",
                    "&.Mui-checked": { color: "#7f7f7f" },
                    "& .MuiSvgIcon-root": { fontSize: 15 },
                  }}
                />
                <Typography sx={{ color: "#4a4a4a", fontSize: 11.2, lineHeight: 1.2 }}>{reason}</Typography>
              </Box>
            ))}
          </Box>
          {deleteReason === "Others" ? (
            <TextField
              value={deleteOtherReason}
              onChange={(event) => setDeleteOtherReason(event.target.value)}
              placeholder="Enter reason"
              multiline
              minRows={2}
              fullWidth
              sx={{
                mt: 0.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "2px",
                  fontSize: 11.2,
                  bgcolor: "#ffffff",
                },
                "& .MuiOutlinedInput-input": { p: 1.0 },
              }}
            />
          ) : null}
          <Box sx={{ mt: 0.85, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              onClick={handleConfirmDeleteRow}
              disabled={!deleteReason || Boolean(deletingId) || (deleteReason === "Others" && !deleteOtherReason.trim())}
              sx={{
                minWidth: 107,
                height: 24,
                px: 1.0,
                borderRadius: "16px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 10,
                bgcolor: deleteReason && !(deleteReason === "Others" && !deleteOtherReason.trim()) ? "#cf2e2e" : "#d7d7d7",
                color: "#f4f4f4",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: deleteReason && !(deleteReason === "Others" && !deleteOtherReason.trim()) ? "#bb2525" : "#c9c9c9",
                  boxShadow: "none",
                },
                "&.Mui-disabled": { bgcolor: "#dedede", color: "#f7f7f7" },
              }}
            >
              {deletingId ? "Deleting..." : "Delete Listing"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Box sx={{ mt: { xs: "56px", md: "54px" }, maxWidth: 1440, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "270px 1fr" } }}>
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            bgcolor: "#162a4d",
            height: "calc(100vh - 54px)",
            color: "white",
            borderRight: "1px solid #102241",
            position: "sticky",
            top: "54px",
          }}
        >
          <Box sx={{ bgcolor: "#1f3d73", p: 2.2, textAlign: "center" }}>
            <Box sx={{ width: 96, height: 96, borderRadius: "50%", border: "3px solid #6d87b7", mx: "auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700 }}>{initials}</Box>
            <Typography sx={{ mt: 1.3, fontWeight: 700, fontSize: 34 / 2 }}>{ownerName}</Typography>
            <Typography sx={{ color: "#a6b7d4", fontSize: 15 / 2 }}>Master User</Typography>
            <Box sx={{ mt: 1.3, mx: "auto", width: 82, height: 31, borderRadius: "6px", border: "1px solid #7c93bd", color: "#dce6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
              Modify
            </Box>
          </Box>
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": { width: 7 },
              "&::-webkit-scrollbar-thumb": { backgroundColor: "#486189", borderRadius: "999px" },
              "&::-webkit-scrollbar-track": { backgroundColor: "#132746" },
            }}
          >
            {menuSections.map((section, sectionIndex) => (
              <Box key={section.title} sx={{ py: sectionIndex === 0 ? 0 : 0.6 }}>
                {section.title ? (
                  <Box sx={{ px: 2.1, py: sectionIndex === 0 ? 1.6 : 1.15, bgcolor: sectionIndex === 0 ? "#1b1f25" : "transparent", color: "#1fa0ff", fontSize: 14, fontWeight: 400 }}>
                    {section.title}
                  </Box>
                ) : null}
                {section.items.map((item) => {
                  if (item.isSectionHeader) {
                    return (
                      <Box
                        key={item.label}
                        sx={{
                          mx: 1.7,
                          mt: 0.6,
                          mb: 0.8,
                          px: 1.0,
                          py: 0.7,
                          bgcolor: "#383838",
                          color: "#6f7781",
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 0.4,
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </Box>
                    );
                  }

                  const isActive = item.label === activeMenu;
                  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                  const showAlertDot = item.label === "AI Listings";

                  return (
                    <Box key={item.label}>
                      <Box
                        onClick={() => handleSidebarMenuClick(item.label)}
                        sx={{
                          px: 2.1,
                          py: 0.8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          bgcolor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                          color: "#ffffff",
                          fontSize: 14,
                          cursor: "pointer",
                          borderLeft: isActive ? "3px solid #58b1ff" : "3px solid transparent",
                          "&:hover": { bgcolor: isActive ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" },
                        }}
                      >
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.8, position: "relative" }}>
                          <span>{item.label}</span>
                          {showAlertDot ? <Box component="span" sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#ff3b30" }} /> : null}
                        </Box>
                        {hasChildren ? <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16, color: "#7b848f" }} /> : null}
                      </Box>
                      {hasChildren ? (
                        <Box sx={{ pl: 3.1, pr: 1.2, pb: 0.4 }}>
                          {item.children.map((child) => (
                            <Box
                              key={child}
                              onClick={() => handleSidebarMenuClick(child)}
                              sx={{
                                py: 0.7,
                                color: child === activeMenu ? "#ffffff" : "#d9dde3",
                                fontSize: 13,
                                cursor: "pointer",
                                position: "relative",
                                "&:hover": { color: "#ffffff" },
                                ...(child === "AI Listings"
                                  ? {
                                      "&::after": {
                                        content: '""',
                                        width: 5,
                                        height: 5,
                                        borderRadius: "50%",
                                        bgcolor: "#ff3b30",
                                        position: "absolute",
                                        right: 6,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                      },
                                    }
                                  : {}),
                              }}
                            >
                              {child}
                            </Box>
                          ))}
                        </Box>
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 1.2, md: 2.2 } }}>
          {activeMenu !== "All Listings" ? (
            <Box sx={{ mt: 1.2, border: "1px solid #d6dde8", borderRadius: "10px", bgcolor: "white", p: 2.2 }}>
              <Typography sx={{ color: "#1d3554", fontSize: 22 / 2, fontWeight: 700 }}>{activeMenu}</Typography>
              <Typography sx={{ mt: 0.7, color: "#6a7789", fontSize: 14 }}>
                Select <b>All Listings</b> from the left menu to view the listing dashboard panel.
              </Typography>
            </Box>
          ) : (
            <>
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "space-between", color: "#5f6d7f", fontSize: 14, py: 0.7, px: 0.3 }}>
            <Box>Last Visited: 10:30 AM | 04 Mar, 2026</Box>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 2.6, fontWeight: 700, color: "#33475e" }}>
              <span>BUY OUR SERVICES</span>
              <span style={{ color: "#b7bfcc" }}>|</span>
              <span>POST A PROPERTY</span>
              <span style={{ color: "#b7bfcc" }}>|</span>
              <span>CUSTOMER SERVICE</span>
            </Box>
          </Box>
          <Box sx={{ mt: 0.75, color: "#2d6898", fontSize: 14, display: "flex", gap: 1.0 }}>
            <span>Home</span>
            <span style={{ color: "#4f5f73" }}>Manage Listing</span>
          </Box>

          <Box sx={{ mt: 1.0, border: "1px solid #c8d9ec", borderRadius: "10px", bgcolor: "white", p: { xs: 1.0, md: 1.3 } }}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 520px" }, gap: 1.2 }}>
              <Box>
                <Typography sx={{ color: "#8a95a7", fontSize: 12 }}>ACTIVATION STATUS</Typography>
                <Box sx={{ mt: 0.45, display: "flex", gap: 0.9, color: "#4f5f73", fontSize: 11, flexWrap: "wrap" }}>
                  <span>ALL</span>
                  <span style={{ color: "#bec7d2" }}>|</span>
                  <span style={{ color: "#1e5e99", fontWeight: 700, borderBottom: "2px solid #1e5e99" }}>Active</span>
                  <span>Reported</span>
                  <span>Underscreening</span>
                  <span>Expired</span>
                  <span>Deleted</span>
                </Box>
              </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 136px 120px", gap: 0.9, alignItems: "end" }}>
                <Autocomplete
                  freeSolo
                  options={cityOptions}
                  value={selectedCity || null}
                  inputValue={cityQuery}
                  loading={cityLoading}
                  filterOptions={(options) => options}
                  openOnFocus
                  onInputChange={(_, newInputValue, reason) => {
                    setCityQuery(newInputValue);
                    if (reason === "clear" || newInputValue.trim() === "") {
                      setSelectedCity("");
                      setCityOptions([]);
                    }
                  }}
                  onChange={(_, newValue) => {
                    const nextCity = typeof newValue === "string" ? newValue.trim() : "";
                    setSelectedCity(nextCity);
                    setCityQuery(nextCity);
                  }}
                  noOptionsText={cityQuery.trim() ? "No cities found" : "Type a city"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      pl: 0.2,
                      pr: 0.6,
                      borderRadius: "8px",
                      fontSize: 12,
                      color: "#8b96a8",
                    },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d6dce6" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c4d0df" },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Enter Locality"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <SearchRoundedIcon sx={{ fontSize: 18, mr: 0.8, color: "#8b96a8" }} />,
                        endAdornment: (
                          <>
                            {cityLoading ? <CircularProgress color="inherit" size={14} sx={{ mr: 0.6 }} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
                <Box>
                  <Typography sx={{ fontSize: 11, color: "#8a95a7", mb: 0.25 }}>CATEGORY</Typography>
                  <Box sx={{ border: "1px solid #d6dce6", borderRadius: "8px", height: 36, px: 1.0, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#4f5f73", fontSize: 13 }}>
                    Select <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
                <Box sx={{ border: "1px solid #d6dce6", borderRadius: "8px", height: 36, px: 0.9, display: "flex", alignItems: "center", gap: 0.5, color: "#4f5f73", fontSize: 12 }}>
                  <FilterAltOutlinedIcon sx={{ fontSize: 17 }} />
                  More Filters
                </Box>
              </Box>
            </Box>
            <Box sx={{ mt: 1.1, width: 160 }}>
              <Typography sx={{ fontSize: 11, color: "#8a95a7", mb: 0.25 }}>SORT</Typography>
              <Select
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value)}
                size="small"
                displayEmpty
                IconComponent={KeyboardArrowDownRoundedIcon}
                sx={{
                  height: 36,
                  width: "100%",
                  borderRadius: "8px",
                  fontSize: 12.5,
                  color: "#4f5f73",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#d6dce6" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#c4d0df" },
                  "& .MuiSelect-select": { py: 0.9, px: 1.0 },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
              </Select>
            </Box>
          </Box>

          <Typography sx={{ mt: 1.6, color: "#1b5f99", fontWeight: 700, textAlign: "right", fontSize: 11.5 }}>
            List of Premium New Launches
          </Typography>

          <Box sx={{ mt: 1.1, border: "1px solid #d6dde8", borderRadius: "10px", bgcolor: "white", overflow: "hidden" }}>
            <Box sx={{ px: { xs: 1.0, md: 1.6 }, py: 1.15, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography sx={{ fontSize: 17, color: "#2f3f54", fontWeight: 700 }}>{rows.length} Active Product</Typography>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.3, color: "#596a7f", fontSize: 14 }}>
                  <Checkbox
                    size="small"
                    checked={isAllSelected}
                    indeterminate={selectedPropertyIds.length > 0 && !isAllSelected}
                    onChange={toggleSelectAll}
                  />
                  <span>Select All</span>
                  <Box
                    component="span"
                    onClick={handleDeleteSelected}
                    sx={{
                      display: "inline",
                      color: selectedPropertyIds.length > 0 ? "#b42318" : "#9aa5b5",
                      cursor: selectedPropertyIds.length > 0 && !bulkDeleting ? "pointer" : "not-allowed",
                      fontWeight: 600,
                    }}
                  >
                    {bulkDeleting ? "Deleting..." : "Delete"}
                  </Box>
                  <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>Show Contact</Box>
                </Box>
            </Box>
            <Divider />

            {loading && (
              <Box sx={{ px: 2, py: 2.2, display: "inline-flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography sx={{ fontSize: 12, color: "#5d6d82" }}>Loading listings from DB...</Typography>
              </Box>
            )}
            {!loading && rows.length === 0 && (
              <Box sx={{ px: 2, py: 2 }}>
                <Typography sx={{ fontSize: 14, color: "#516177" }}>No active listings found.</Typography>
              </Box>
            )}

          </Box>

          <Box sx={{ mt: 1.1, display: "grid", gap: 1.05 }}>
            {sortedRows.map((row) => (
              <Box
                key={row.propertyId || row.title}
                sx={{
                  border: "1px solid #d6dde8",
                  borderRadius: "10px",
                  bgcolor: "white",
                  px: { xs: 1.0, md: 1.6 },
                  py: 1.2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.1, flexWrap: { xs: "wrap", md: "nowrap" } }}>
                  <Checkbox
                    size="small"
                    checked={selectedPropertyIds.includes(String(row?.propertyId || "").trim())}
                    onChange={() => toggleSelectRow(row?.propertyId)}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: "#22384f", fontSize: { xs: 14, md: 17 }, fontWeight: 700, lineHeight: 1.3 }}>
                      {row.title} in {row.address}
                    </Typography>
                    <Typography sx={{ mt: 0.45, color: "#5e6d82", fontSize: 12.5 }}>
                      Price: <b>{row.priceText}</b> | Carpet Area: <b>{row.carpetAreaText}</b>
                    </Typography>
                  </Box>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.0, color: "#4f5f73", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Box sx={{ bgcolor: "#d58a00", color: "white", px: 1.0, py: 0.2, borderRadius: "4px", fontSize: 11, fontWeight: 700 }}>Plain</Box>
                    <Typography sx={{ color: "#2a679d", fontWeight: 700, fontSize: 12 }}>Show Contact</Typography>
                    <OpenInNewRoundedIcon onClick={() => handlePreviewRow(row)} sx={{ fontSize: 18, display: { xs: "none", md: "inline-flex" }, cursor: "pointer", "&:hover": { color: "#2a679d" } }} />
                    <EditOutlinedIcon
                      onClick={() => handleEditRow(row)}
                      sx={{ fontSize: 18, display: { xs: "none", md: "inline-flex" }, cursor: "pointer", "&:hover": { color: "#2a679d" } }}
                    />
                    <DeleteOutlineRoundedIcon
                      onClick={() => handleDeleteRow(row)}
                      sx={{ fontSize: 18, display: { xs: "none", md: "inline-flex" }, cursor: deletingId ? "not-allowed" : "pointer", opacity: deletingId && deletingId === row.propertyId ? 0.4 : 1, "&:hover": { color: "#be2f2f" } }}
                    />
                    <BlockRoundedIcon sx={{ fontSize: 18, display: { xs: "none", md: "inline-flex" } }} />
                    <Box sx={{ display: { xs: "inline-flex", md: "none" }, gap: 1.1, fontSize: 12 }}>
                      <Box onClick={() => handleEditRow(row)} sx={{ color: "#2a679d", fontWeight: 700, cursor: "pointer" }}>Edit</Box>
                      <Box onClick={() => handleDeleteRow(row)} sx={{ color: "#be2f2f", fontWeight: 700, cursor: "pointer" }}>Delete</Box>
                    </Box>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.0, borderColor: "#e7ebf1" }} />
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 360px 240px" }, gap: { xs: 1.2, md: 1.1 }, alignItems: "center" }}>
                  <Typography sx={{ color: "#394a60", fontSize: 16 }}>
                    <b>{row.propertyId}</b>: <Box component="span" sx={{ color: "#2f9a40", fontWeight: 700 }}>Active</Box> | Posted On: <b>{row.postedOn}</b>
                    <br />
                    Expiry On: <b>{row.expiryOn}</b>
                  </Typography>
                  <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
                    <LinearProgress variant="determinate" value={row.completion} sx={{ width: 232, height: 10, borderRadius: "999px", bgcolor: "#dedede", "& .MuiLinearProgress-bar": { bgcolor: "#49a84e" } }} />
                    <Typography sx={{ color: "#47586d", fontSize: 12, fontWeight: 700 }}>{row.completion}% Complete</Typography>
                  </Box>
                  <Box sx={{ color: "#59708a", fontSize: 12 }}>
                    <Typography sx={{ fontSize: "inherit", color: "inherit" }}>
                      Listing Price : 0 Credits <Box component="span" sx={{ color: "#2a679d", fontWeight: 700 }}>Upgrade</Box>
                    </Typography>
                    <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#6f7e92" }}>
                      <Typography sx={{ fontSize: 12 }}>Video Tour Booking</Typography>
                      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}>
                        <Box sx={{ px: 0.7, py: 0.1, borderRadius: "4px", bgcolor: "#4caf50", color: "white", fontSize: 10, fontWeight: 700 }}>
                          New
                        </Box>
                        <Switch checked={false} size="small" />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mt: 1.3 }}>
              {error}
            </Alert>
          )}
          {deletingId && (
            <Typography sx={{ mt: 0.7, color: "#66778d", fontSize: 12 }}>
              Deleting property...
            </Typography>
          )}
          {!loading && rows.length > 0 && (
            <Typography sx={{ mt: 1.3, color: "#5c6b80", fontSize: 13 }}>
              {totalText}
            </Typography>
          )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
