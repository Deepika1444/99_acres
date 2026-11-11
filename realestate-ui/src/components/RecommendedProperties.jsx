import {
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { useRef } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FmdGoodOutlinedIcon from "@mui/icons-material/FmdGoodOutlined";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";

const properties = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80",
    price: "47 L",
    title: "2 BHK Independent House...",
    details: "In 2bhk simplex villas, Whitefield, Ba",
    postedBy: "Posted by Dealer",
    time: "4 months ago",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
    price: "45 L",
    title: "2 BHK Independent House...",
    details: "In ITPL, Bangalore",
    postedBy: "Posted by Dealer",
    time: "2 weeks ago",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
    price: "45 L",
    title: "2 BHK Independent House...",
    details: "In Varthur, Bangalore",
    postedBy: "Posted by Dealer",
    time: "2 weeks ago",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
    price: "45 L",
    title: "2 BHK Independent House...",
    details: "In Hoodi, Bangalore",
    postedBy: "Posted by Dealer",
    time: "2 weeks ago",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1000&q=80",
    price: "45 L",
    title: "2 BHK Independent House...",
    details: "In Hoodi, Bangalore",
    postedBy: "Posted by Dealer",
    time: "2 weeks ago",
  },
];

function PropertyCard({ property }) {
  return (
    <Box sx={{ minWidth: { xs: 238, md: 210 }, width: { xs: 238, md: 210 } }}>
      <Box
        sx={{
          position: "relative",
          borderRadius: "8px",
          overflow: "hidden",
          height: { xs: 172, md: 154 },
          backgroundImage: `url('${property.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "0 6px 16px rgba(18, 41, 76, 0.15)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 40,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "white",
            width: 30,
            height: 30,
          }}
        >
          <FavoriteBorderRoundedIcon sx={{ fontSize: 21 }} />
        </IconButton>
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            bgcolor: "white",
            color: "#0e2f55",
            borderRadius: "6px",
            px: 1,
            py: 0.35,
            fontWeight: 800,
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ₹ {property.price}
        </Box>
      </Box>

      <Typography
        sx={{
          mt: 1,
          color: "#1b2b4b",
          fontSize: 14,
          fontWeight: 700,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {property.title}
      </Typography>
      <Typography sx={{ mt: 0.35, fontSize: 12, color: "#34445f" }}>
        {property.details}
      </Typography>
      <Box sx={{ mt: 0.2, display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Typography sx={{ fontSize: 11, color: "#566783" }}>
          {property.postedBy}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#66758f", whiteSpace: "nowrap" }}>
          {property.time}
        </Typography>
      </Box>
    </Box>
  );
}

export default function RecommendedProperties() {
  const scrollRef = useRef(null);

  const scrollCards = (direction) => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -230 : 230;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <Box id="recommended-properties-section">
      <Typography sx={{ color: "#8a95a9", fontSize: 18, fontWeight: 700, mb: 1.8 }}>
        Continue browsing...
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            height: 46,
            pl: 1.2,
            pr: 2.2,
            borderRadius: "23px",
            bgcolor: "#eef6ff",
            border: "1px solid #d4e7fb",
            boxShadow: "0 2px 6px rgba(20, 133, 232, 0.12)",
            color: "#1f3250",
          }}
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              bgcolor: "#e3f1ff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1.1,
            }}
          >
            <FlagRoundedIcon sx={{ color: "#1c8de8", fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1b2c4a", lineHeight: 1 }}>
            Buy in Bangalore East
          </Typography>
        </Box>

        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            height: 46,
            pl: 1.2,
            pr: 2.2,
            borderRadius: "23px",
            bgcolor: "#f5f7fb",
            border: "1px solid #d8dfea",
            color: "#4d5f7d",
          }}
        >
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "1.5px dashed #97a4bb",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1,
              bgcolor: "white",
            }}
          >
            <FmdGoodOutlinedIcon sx={{ color: "#7e8da5", fontSize: 15 }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#4e5f7c", lineHeight: 1 }}>
            Explore New City
          </Typography>
        </Box>
      </Box>

      <Box sx={{ borderBottom: "1px solid #dce2ed", mt: 2.5, mb: 2.8 }} />

      <Typography sx={{ color: "#172b4d", fontSize: 25, fontWeight: 500, lineHeight: 1.15 }}>
        Recommended Properties
      </Typography>
      <Typography sx={{ color: "#516583", fontSize: 12, mt: 0.5, mb: 2 }}>
        Curated especially for you
      </Typography>

      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={() => scrollCards("left")}
          sx={{
            position: "absolute",
            left: -18,
            top: { xs: 106, md: 94 },
            zIndex: 5,
            bgcolor: "white",
            color: "#556784",
            boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 1.4,
            overflowX: "auto",
            pb: 0.6,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </Box>

        <IconButton
          onClick={() => scrollCards("right")}
          sx={{
            position: "absolute",
            right: -18,
            top: { xs: 106, md: 94 },
            zIndex: 5,
            bgcolor: "white",
            color: "#556784",
            boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}
