import { Box, Button, IconButton, Typography } from "@mui/material";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useMemo, useState } from "react";

const launches = [
  {
    id: 1,
    title: "Sumadhura Solace",
    location: "Marathahalli, Bangalore",
    price: "2.47 - 4.19 Cr",
    config: "3, 4 BHK Apartment",
    growth: "30.5% price increase in last 1 year in Marathahalli",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=420&q=80",
  },
  {
    id: 2,
    title: "Sumadhura Edition",
    location: "Nallurhalli, Whitefield",
    price: "1.7 - 3.05 Cr",
    config: "2, 3, 4 BHK Apartment",
    growth: "8.4% price increase in last 3 months in Whitefield",
    image:
      "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=420&q=80",
  },
  {
    id: 3,
    title: "Greenwood Rise",
    location: "Sarjapur, Bangalore",
    price: "1.95 - 2.65 Cr",
    config: "2, 3 BHK Apartment",
    growth: "12.2% price increase in last 1 year in Sarjapur",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=420&q=80",
  },
  {
    id: 4,
    title: "Urban Crest",
    location: "Varthur, Bangalore",
    price: "1.82 - 2.94 Cr",
    config: "2, 3 BHK Apartment",
    growth: "9.6% price increase in last 6 months in Varthur",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=420&q=80",
  },
  {
    id: 5,
    title: "Urban Crest",
    location: "Varthur, Bangalore",
    price: "1.82 - 2.94 Cr",
    config: "2, 3 BHK Apartment",
    growth: "9.6% price increase in last 6 months in Varthur",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=420&q=80",
  },
  {
    id: 6,
    title: "Urban Crest",
    location: "Varthur, Bangalore",
    price: "1.82 - 2.94 Cr",
    config: "2, 3 BHK Apartment",
    growth: "9.6% price increase in last 6 months in Varthur",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=420&q=80",
  },
  
];

function LaunchCard({ item }) {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "white",
        border: "1px solid #c8d8ea",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 0.55, pt: 0.5 }}>
        <Box
          sx={{
            display: "inline-block",
            bgcolor: "#ffe2a8",
            color: "#112745",
            fontWeight: 800,
            fontSize: 10,
            px: 0.8,
            py: 0.2,
            borderRadius: "2px",
            lineHeight: 1.1,
            clipPath: "polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%)",
          }}
        >
          NEW LAUNCH
        </Box>
      </Box>

      <Box sx={{ px: 1.6, pt: 1, pb: 0.95, display: "flex", gap: 1.2 }}>
        <Box sx={{ position: "relative", flexShrink: 0 }}>
          <Box
            component="img"
            src={item.image}
            alt={item.title}
            sx={{ width: 74, height: 74, borderRadius: "50%", objectFit: "cover" }}
          />
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: -7,
              bgcolor: "#0a2e56",
              color: "white",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: "10px",
              px: 0.6,
              py: 0.05,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.25,
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 11, color: "#23c55e" }} />
            RERA
          </Box>
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              color: "#3e4249",
              fontSize: 18,
              fontWeight: 700,
              lineHeight: 1.08,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.title}
          </Typography>
          <Typography sx={{ mt: 0.35, color: "#535d6b", fontSize: 15 }}>
            {item.location}
          </Typography>
          <Typography sx={{ mt: 0.62, color: "#2f3136", fontSize: 15, fontWeight: 700 }}>
            {"\u20B9"}
            {item.price}
            <Box
              component="span"
              sx={{
                ml: 0.7,
                color: "#4f5560",
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              {item.config}
            </Box>
          </Typography>
          <Typography
            sx={{
              mt: 0.25,
              color: "#2f9f57",
              fontSize: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.growth}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          borderTop: "1px dashed #d2dcea",
          px: 1.5,
          py: 0.95,
          display: "flex",
          gap: 1.3,
          alignItems: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            left: -6,
            top: -7,
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "#e9f3fb",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            right: -6,
            top: -7,
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "#e9f3fb",
          },
        }}
      >
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, color: "#2f4668", flex: 1 }}>
          <SellRoundedIcon sx={{ fontSize: 16, color: "#1674cd" }} />
          <Typography sx={{ fontSize: 13, lineHeight: 1.2 }}>
            Get preferred options @zero brokerage
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{
            minWidth: 128,
            borderRadius: "5px",
            py: 0.7,
            textTransform: "none",
            bgcolor: "#0f7ad7",
            fontSize: 15,
            fontWeight: 700,
            "&:hover": { bgcolor: "#0d6dc0" },
          }}
        >
          View Number
        </Button>
      </Box>
    </Box>
  );
}

export default function NewlyLaunchedProjects() {
  const perPage = 2;
  const [pageStart, setPageStart] = useState(0);
  const maxStart = Math.max(launches.length - perPage, 0);

  const visibleLaunches = useMemo(
    () => launches.slice(pageStart, pageStart + perPage),
    [pageStart]
  );

  const goNext = () => {
    setPageStart((prev) => Math.min(prev + perPage, maxStart));
  };

  const goPrev = () => {
    setPageStart((prev) => Math.max(prev - perPage, 0));
  };

  return (
    <Box
      sx={{
        mt: 3.2,
        bgcolor: "#e9f3fb",
        borderRadius: "10px",
        px: { xs: 1.6, md: 2 },
        pt: 1.9,
        pb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Box sx={{ position: "relative", width: 34, height: 34 }}>
          <ApartmentRoundedIcon sx={{ color: "#1180dc", fontSize: 34 }} />
          <AutoAwesomeRoundedIcon
            sx={{ position: "absolute", top: -3, left: -1, fontSize: 12, color: "#f39c12" }}
          />
        </Box>
        <Box>
          <Typography sx={{ color: "#172b4d", fontSize: 21, fontWeight: 700, lineHeight: 1.05 }}>
            Newly launched projects
          </Typography>
          <Typography sx={{ color: "#465975", fontSize: 15, mt: 0.2 }}>
            Preferred units at zero brokerage
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 1.5, position: "relative" }}>
        {pageStart > 0 && (
          <IconButton
            onClick={goPrev}
            sx={{
              position: "absolute",
              left: -18,
              top: "44%",
              zIndex: 3,
              bgcolor: "white",
              color: "#556784",
              boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.8 }}>
          {visibleLaunches.map((item) => (
            <LaunchCard key={item.id} item={item} />
          ))}
        </Box>

        {pageStart < maxStart && (
          <IconButton
            onClick={goNext}
            sx={{
              position: "absolute",
              right: -18,
              top: "44%",
              zIndex: 3,
              bgcolor: "white",
              color: "#556784",
              boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
