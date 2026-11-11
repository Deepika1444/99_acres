import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../utils/authStorage";
import { isPropertyShortlisted, toggleShortlistedProperty } from "../utils/shortlistStorage";

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") return value;
  }
  return "";
}

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
  return `Rs ${amount.toLocaleString("en-IN")}`;
}

function normalizeItem(source) {
  const location = source?.locationDetails || source?.location || {};
  const profile = source?.propertyProfile || source?.profile || {};
  const pricing = source?.pricingDetails || source?.pricing || {};
  const priceDetails = pricing?.priceDetails || source?.priceDetails || {};
  const mediaDetails = source?.mediaDetails || {};
  const photos = Array.isArray(mediaDetails?.photos)
    ? mediaDetails.photos.filter((item) => String(item?.url || "").trim())
    : [];
  const coverPhoto =
    photos.find((item) => Boolean(item?.isCover) && String(item?.url || "").trim()) ||
    photos[0] ||
    null;

  const city = String(pickFirst(location?.city, source?.city)).trim();
  const locality = String(pickFirst(location?.locality, source?.locality)).trim();
  const subLocality = String(pickFirst(location?.subLocality, source?.subLocality)).trim();
  const bedrooms = Number(pickFirst(profile?.roomDetails?.bedrooms, source?.bedrooms, 2));
  const bathrooms = Number(pickFirst(profile?.roomDetails?.bathrooms, source?.bathrooms, 2));
  const expectedPrice = pickFirst(priceDetails?.expectedPrice, source?.expectedPrice, source?.price);
  const balconies = Number(pickFirst(profile?.roomDetails?.balconies, source?.balconies, 1));
  const carpetArea = Number(
    pickFirst(profile?.areaDetails?.carpetArea?.value, source?.carpetArea, source?.builtUpArea, 1200)
  );
  const carpetUnit = String(pickFirst(profile?.areaDetails?.carpetArea?.unit, "sq.ft."));
  const propertyOnFloor = String(pickFirst(profile?.propertyOnFloor, source?.propertyOnFloor, 6));
  const totalFloors = String(pickFirst(profile?.totalFloors, source?.totalFloors, 12));
  const possessionText = String(pickFirst(profile?.possessionBy, profile?.ageOfProperty, "10+ years"));
  const priceNumber = Number(expectedPrice || 0);
  const pricePerSqft = carpetArea > 0 && priceNumber > 0 ? Math.round(priceNumber / carpetArea) : 0;

  return {
    propertyId: String(pickFirst(source?.propertyId, source?._id)).trim(),
    title: `${bedrooms}BHK ${bathrooms}Bath`,
    typeText: "Flat/Apartment for Sell",
    locationText: [subLocality, locality, city].filter(Boolean).join(", ") || "Location not available",
    postedDate: new Date(pickFirst(source?.createdAt, source?.updatedAt, Date.now())).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    priceText: formatPrice(expectedPrice),
    imageUrl: String(pickFirst(source?.coverImageUrl, source?.image, coverPhoto?.url)).trim(),
    pricePerSqftText: pricePerSqft > 0 ? `@ ${pricePerSqft.toLocaleString("en-IN")} per sq.ft.` : "",
    emiText: `Estimated EMI Rs ${Math.max(0, Math.round(priceNumber * 0.03)).toLocaleString("en-IN")}`,
    configText: `${bedrooms} Bedrooms, ${bathrooms} Bathrooms, ${balconies} Balconies`,
    carpetAreaText: `${carpetArea} ${carpetUnit}`,
    carpetAreaSqmText: `${(carpetArea * 0.092903).toFixed(2)} sq.m.`,
    floorText: `${propertyOnFloor} of ${totalFloors} Floors`,
    possessionText,
    shortlist: isPropertyShortlisted(String(pickFirst(source?.propertyId, source?._id)).trim()),
  };
}

function extractPropertyList(result) {
  if (Array.isArray(result)) return result;
  const data = result?.data;
  if (Array.isArray(data)) return data;
  const dataCandidates = [data?.properties, data?.listings, data?.items, data?.docs, data?.rows];
  for (const candidate of dataCandidates) if (Array.isArray(candidate)) return candidate;
  const rootCandidates = [result?.properties, result?.listings, result?.items, result?.docs, result?.rows];
  for (const candidate of rootCandidates) if (Array.isArray(candidate)) return candidate;
  return [];
}

const LIST_ENDPOINTS = [
  "/api/properties",
  "/api/properties/my-listings",
  "/api/properties/my-properties",
  "/api/properties/owner",
  "/api/properties/user",
];

export default function PostPropertyAllPreviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const token = getAuthToken();
      if (!token) {
        setErrorMessage("Please login to view property previews.");
        setLoading(false);
        return;
      }
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      for (const path of LIST_ENDPOINTS) {
        try {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            cache: "no-store",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) continue;
          const list = extractPropertyList(result);
          if (!Array.isArray(list)) continue;
          const sorted = [...list].sort((a, b) => {
            const aTime = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
            const bTime = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
            return bTime - aTime;
          });
          if (!cancelled) {
            setItems(sorted.map(normalizeItem));
            setErrorMessage("");
            setLoading(false);
          }
          return;
        } catch {
          // Try next endpoint.
        }
      }
      if (!cancelled) {
        setErrorMessage("Unable to load properties from DB.");
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eceef3", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />
      <Box sx={{ mt: { xs: "56px", md: "64px" }, px: { xs: 1.2, md: 3.2 }, py: { xs: 1.2, md: 2.0 } }}>
        <Box sx={{ maxWidth: 1280, mx: "auto" }}>
          <Typography sx={{ color: "#0e2a4a", fontSize: { xs: 20, md: 32 / 2 }, fontWeight: 800 }}>
            All Property Previews
          </Typography>
          <Typography sx={{ mt: 0.4, color: "#607086", fontSize: { xs: 12, md: 14 } }}>
            Showing all properties you posted, one below another.
          </Typography>

          {loading && (
            <Box sx={{ mt: 1.6, display: "inline-flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography sx={{ fontSize: 12, color: "#5f6e80" }}>Loading previews from DB...</Typography>
            </Box>
          )}
          {errorMessage && (
            <Alert severity="warning" sx={{ mt: 1.4 }}>
              {errorMessage}
            </Alert>
          )}

          <Box sx={{ mt: 1.6, display: "grid", gap: 1.2 }}>
            {!loading && items.length === 0 && (
              <Box sx={{ p: 2, border: "1px solid #d8dde7", borderRadius: "12px", bgcolor: "white" }}>
                <Typography sx={{ color: "#41556f", fontSize: 14 }}>No properties found.</Typography>
              </Box>
            )}
            {items.map((item, index) => (
              <Box key={item.propertyId || `preview-item-${index}`} sx={{ border: "1px solid #d8dde7", borderRadius: "14px", overflow: "hidden", bgcolor: "white", p: { xs: 1.0, md: 1.4 } }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 1.0, md: 1.6 } }}>
                  <Box>
                    <Typography sx={{ color: "#0d2644", fontWeight: 800, fontSize: { xs: 24 / 2, md: 56 / 2 } }}>{item.priceText}</Typography>
                    <Typography sx={{ mt: 0.2, color: "#5f6f82", fontSize: { xs: 12, md: 32 / 2 } }}>{item.pricePerSqftText}</Typography>
                    <Typography sx={{ mt: 0.3, color: "#0a8b73", fontWeight: 700, fontSize: { xs: 12, md: 16 } }}>{item.emiText}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ color: "#0d2644", fontWeight: 800, fontSize: { xs: 24 / 2, md: 56 / 2 } }}>{item.title}</Typography>
                    <Typography sx={{ mt: 0.15, color: "#3f4f64", fontSize: { xs: 13, md: 32 / 2 } }}>{item.typeText}</Typography>
                    <Typography sx={{ mt: 0.2, color: "#5f6f82", fontSize: { xs: 12, md: 30 / 2 } }}>in {item.locationText}</Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 1.0, display: "flex", alignItems: "center", gap: 1.0, flexWrap: "wrap" }}>
                  <Box sx={{ bgcolor: "#1f5f98", color: "white", px: 1.2, py: 0.4, borderRadius: "4px", fontSize: 12, fontWeight: 700 }}>RERA STATUS i</Box>
                  <Box sx={{ border: "1px solid #dc3a34", color: "#dc3a34", px: 1.2, py: 0.33, borderRadius: "4px", fontSize: 12, fontWeight: 700 }}>NOT AVAILABLE</Box>
                  <Typography sx={{ color: "#596a80", fontSize: 14 }}>| Website: https://rera.karnataka.gov.in/</Typography>
                </Box>

                <Box sx={{ mt: 1.1, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.05fr 0.95fr" }, gap: 1.1 }}>
                  <Box sx={{ border: "1px solid #d8dde7", borderRadius: "14px", overflow: "hidden", bgcolor: "white" }}>
                    <Box sx={{ bgcolor: "#1a1d3a", color: "white", px: 1.4, py: 0.85, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <Box sx={{ fontWeight: 700 }}>Property (1)</Box>
                      <Box sx={{ color: "#90b2d8" }}>Explore Locality Photos/Videos</Box>
                    </Box>
                    <Box sx={{ height: { xs: 220, md: 260 }, bgcolor: "#9ea8ba", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <Box
                        onClick={() => {
                          const result = toggleShortlistedProperty({
                            propertyId: item.propertyId,
                            title: item.title,
                            address: item.locationText,
                            priceText: item.priceText,
                            imageUrl: item.imageUrl,
                            city: "",
                            postedDate: item.postedDate,
                          });
                          setItems((prev) =>
                            prev.map((entry) =>
                              entry.propertyId === item.propertyId ? { ...entry, shortlist: result.shortlisted } : entry
                            )
                          );
                        }}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          bgcolor: "rgba(255,255,255,0.95)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          zIndex: 2,
                        }}
                      >
                        {item.shortlist ? (
                          <FavoriteRoundedIcon sx={{ fontSize: 20, color: "#e05463" }} />
                        ) : (
                          <FavoriteBorderRoundedIcon sx={{ fontSize: 20, color: "#4f6078" }} />
                        )}
                      </Box>
                      {item.imageUrl ? (
                        <Box component="img" src={item.imageUrl} alt={item.title || "Property"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <ApartmentRoundedIcon sx={{ fontSize: 90, color: "#70829a" }} />
                      )}
                    </Box>
                    <Box sx={{ bgcolor: "#1a1d3a", color: "#c6cee0", textAlign: "center", py: 0.7, fontSize: 13 }}>
                      Photos shared by advertiser
                    </Box>
                  </Box>

                  <Box sx={{ border: "1px solid #d8dde7", borderRadius: "14px", overflow: "hidden", bgcolor: "white" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                      <Box sx={{ p: { xs: 1.2, md: 1.6 }, borderRight: "1px solid #ebeff5", borderBottom: "1px solid #ebeff5" }}>
                        <Typography sx={{ color: "#7f8da0", fontSize: 14, display: "flex", alignItems: "center", gap: 0.7 }}><StraightenRoundedIcon fontSize="small" /> Area</Typography>
                        <Typography sx={{ mt: 0.8, color: "#152a44", fontSize: 20 / 2, fontWeight: 700 }}>Carpet area: {item.carpetAreaText}</Typography>
                        <Typography sx={{ mt: 0.4, color: "#7d8a9c", fontSize: 14 / 1 }}>{item.carpetAreaSqmText}</Typography>
                      </Box>
                      <Box sx={{ p: { xs: 1.2, md: 1.6 }, borderBottom: "1px solid #ebeff5" }}>
                        <Typography sx={{ color: "#7f8da0", fontSize: 14, display: "flex", alignItems: "center", gap: 0.7 }}><ApartmentRoundedIcon fontSize="small" /> Configuration</Typography>
                        <Typography sx={{ mt: 0.8, color: "#152a44", fontSize: 20 / 2, fontWeight: 700 }}>{item.configText}</Typography>
                      </Box>
                      <Box sx={{ p: { xs: 1.2, md: 1.6 }, borderRight: "1px solid #ebeff5", borderBottom: "1px solid #ebeff5" }}>
                        <Typography sx={{ color: "#7f8da0", fontSize: 14, display: "flex", alignItems: "center", gap: 0.7 }}><CurrencyRupeeRoundedIcon fontSize="small" /> Price</Typography>
                        <Typography sx={{ mt: 0.8, color: "#152a44", fontSize: 20 / 2, fontWeight: 700 }}>{item.priceText}</Typography>
                        <Typography sx={{ mt: 0.3, color: "#7d8a9c", fontSize: 14 / 1 }}>{item.pricePerSqftText}</Typography>
                      </Box>
                      <Box sx={{ p: { xs: 1.2, md: 1.6 }, borderBottom: "1px solid #ebeff5" }}>
                        <Typography sx={{ color: "#7f8da0", fontSize: 14, display: "flex", alignItems: "center", gap: 0.7 }}><LocationOnOutlinedIcon fontSize="small" /> Address</Typography>
                        <Typography sx={{ mt: 0.8, color: "#152a44", fontSize: 20 / 2, fontWeight: 700 }}>{item.locationText.split(",")[0] || "Address"}</Typography>
                        <Typography sx={{ mt: 0.3, color: "#7d8a9c", fontSize: 14 / 1 }}>{item.locationText}</Typography>
                      </Box>
                      <Box sx={{ p: { xs: 1.2, md: 1.6 }, borderRight: "1px solid #ebeff5" }}>
                        <Typography sx={{ color: "#7f8da0", fontSize: 14 }}>Floor Number</Typography>
                        <Typography sx={{ mt: 0.8, color: "#152a44", fontSize: 20 / 2, fontWeight: 700 }}>{item.floorText}</Typography>
                      </Box>
                      <Box sx={{ p: { xs: 1.2, md: 1.6 } }}>
                        <Typography sx={{ color: "#7f8da0", fontSize: 14, display: "flex", alignItems: "center", gap: 0.7 }}><CalendarTodayRoundedIcon fontSize="small" /> Possession in</Typography>
                        <Typography sx={{ mt: 0.8, color: "#152a44", fontSize: 20 / 2, fontWeight: 700 }}>{item.possessionText}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mt: 1.0, display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (item?.propertyId) localStorage.setItem("previewPropertyId", item.propertyId);
                      window.location.href = "/post-property/property-preview";
                    }}
                    sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0a9b8a", "&:hover": { bgcolor: "#078374" } }}
                  >
                    Open Full Preview
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
