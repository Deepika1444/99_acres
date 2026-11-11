import { useMemo, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import Navbar from "../components/Navbar";
import { getShortlistedProperties, toggleShortlistedProperty } from "../utils/shortlistStorage";

export default function PostPropertyShortlist() {
  const [items, setItems] = useState(() => getShortlistedProperties());

  const shortlistedCount = useMemo(() => items.length, [items.length]);

  const handleToggle = (item) => {
    const result = toggleShortlistedProperty(item);
    setItems(result.list);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f2f6", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box sx={{ mt: { xs: "56px", md: "64px" }, px: { xs: 1.2, sm: 2.0, md: 3.6 }, py: { xs: 1.4, md: 2.0 } }}>
        <Box sx={{ maxWidth: 1320, mx: "auto" }}>
          <Box sx={{ borderBottom: "1px solid #d8dfeb", display: "flex", gap: { xs: 1.6, md: 3.8 }, overflowX: "auto", pb: 0.3, whiteSpace: "nowrap" }}>
            <Typography sx={{ color: "#4e5f75", fontSize: { xs: 13, md: 30 / 2 } }}>1 Recent Searches</Typography>
            <Typography sx={{ color: "#4e5f75", fontSize: { xs: 13, md: 30 / 2 } }}>2 Viewed</Typography>
            <Typography sx={{ color: "#1e3351", fontWeight: 700, fontSize: { xs: 13, md: 30 / 2 }, borderBottom: "3px solid #1e3351", pb: 0.9 }}>
              {shortlistedCount} Shortlisted
            </Typography>
            <Typography sx={{ color: "#4e5f75", fontSize: { xs: 13, md: 30 / 2 } }}>1 Contacted</Typography>
          </Box>

          <Typography sx={{ mt: 2.0, color: "#132c49", fontWeight: 800, fontSize: { xs: 26 / 2, md: 56 / 2 } }}>
            Shortlisted Properties
          </Typography>
          <Typography sx={{ color: "#7a8799", fontSize: { xs: 12, md: 16 / 1 } }}>Contact now to close the deal</Typography>

          {items.length === 0 ? (
            <Box sx={{ mt: 2.2, p: { xs: 2.0, md: 2.4 }, border: "1px solid #d8dfe9", borderRadius: "14px", bgcolor: "white" }}>
              <Typography sx={{ color: "#2f4057", fontSize: { xs: 14, md: 18 }, fontWeight: 700 }}>No shortlisted properties yet.</Typography>
              <Typography sx={{ mt: 0.6, color: "#6a7789", fontSize: { xs: 12, md: 14 } }}>
                Open any property preview and click Shortlist.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 1.6, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: { xs: 1.2, md: 1.6 } }}>
              {items.map((item) => (
                <Box key={item.propertyId} sx={{ border: "1px solid #d8dfe9", borderRadius: "14px", bgcolor: "white", overflow: "hidden" }}>
                  <Box sx={{ height: 178, bgcolor: "#c5cfde", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box
                      onClick={() => handleToggle(item)}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.96)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <FavoriteRoundedIcon sx={{ color: "#e05566", fontSize: 20 }} />
                    </Box>
                    {item.imageUrl ? (
                      <Box component="img" src={item.imageUrl} alt={item.title || "Shortlisted property"} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <ApartmentRoundedIcon sx={{ color: "#6f7f95", fontSize: 80 }} />
                    )}
                    <Box sx={{ position: "absolute", left: 10, bottom: 10, bgcolor: "rgba(255,255,255,0.95)", borderRadius: "8px", px: 1.0, py: 0.2, color: "#0e2a4a", fontWeight: 700, fontSize: 22 / 2 }}>
                      {item.priceText || "Price on request"}
                    </Box>
                  </Box>
                  <Box sx={{ p: 1.4 }}>
                    <Typography sx={{ color: "#0f2a49", fontWeight: 800, fontSize: { xs: 24 / 2, md: 40 / 2 }, lineHeight: 1.3 }}>
                      {item.title || "Property"}
                    </Typography>
                    <Typography sx={{ mt: 0.45, color: "#4c607a", fontSize: { xs: 12, md: 16 / 1 }, lineHeight: 1.3 }}>
                      {item.address || "Address not available"}
                    </Typography>
                    <Typography sx={{ mt: 0.55, color: "#8793a4", fontSize: { xs: 11, md: 13 } }}>
                      Posted by Owner
                    </Typography>
                    <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (item?.propertyId) localStorage.setItem("previewPropertyId", item.propertyId);
                          window.location.href = "/post-property/property-preview";
                        }}
                        sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#0a9b8a", "&:hover": { bgcolor: "#078374" } }}
                      >
                        Open
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<FavoriteBorderRoundedIcon />}
                        onClick={() => handleToggle(item)}
                        sx={{ textTransform: "none", fontWeight: 700, color: "#4e5f75", borderColor: "#d8dfe9" }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 50,
          height: 50,
          borderRadius: "50%",
          bgcolor: "#f6f7f9",
          border: "1px solid #d4d9e1",
          boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
        }}
      >
        <KeyboardArrowUpRoundedIcon sx={{ fontSize: 26, color: "#2f3d4f" }} />
      </Box>
    </Box>
  );
}
