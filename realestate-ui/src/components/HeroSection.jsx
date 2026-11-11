import { useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import Navbar from "./Navbar";
import SearchBox from "./SearchBox";

export default function HeroSection({
  onLoginClick,
  cityQuery,
  cityOptions,
  cityLoading,
  onCityQueryChange,
  onCitySelect,
  onSearch,
}) {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
      brand: "CASAGRAND PROMENADE",
      title: "HOMES IN YELAHANKA@Rs.7,599/SFT.",
      subtitle: "3 & 4 BHK Apts. from Rs.1.48CR* | 10 mins from Mall of Asia",
    },
    {
      image:
        "https://images.unsplash.com/photo-1613553507747-5f8d62ad5904?auto=format&fit=crop&w=1800&q=80",
      brand: "AMRUTHA LAKE VISTA",
      title: "3 BHK APARTMENT AT WHITEFIELD, BANGALORE",
      subtitle: "Starting price - Rs.1.65 Cr. Onwards",
    },
    {
      image:
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1800&q=80",
      brand: "SIGNATURE LIVING",
      title: "OFF HSR LAYOUT | Rs.2.47 CR*",
      subtitle: "Premium homes near ORR | Ready-to-move options",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = slides[activeSlide];

  const goPrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: 430, md: 340 },
        backgroundImage: `url('${currentSlide.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 280ms ease-in-out",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.1) 38%, rgba(235,214,172,0.9) 65%, rgba(235,214,172,0.95) 100%)",
        }}
      />

      <Navbar onLoginClick={onLoginClick} />

      <IconButton
        onClick={goPrev}
        sx={{
          position: "absolute",
          left: { xs: 12, md: 20 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.95)",
          color: "#4a5872",
          width: 40,
          height: 40,
          zIndex: 10,
        }}
      >
        <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <IconButton
        onClick={goNext}
        sx={{
          position: "absolute",
          right: { xs: 12, md: 20 },
          top: "50%",
          transform: "translateY(-50%)",
          bgcolor: "rgba(255,255,255,0.95)",
          color: "#4a5872",
          width: 40,
          height: 40,
          zIndex: 10,
        }}
      >
        <ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          right: { xs: 16, sm: 20, md: "9%" },
          top: { xs: "34%", sm: "31%", md: "20%" },
          zIndex: 10,
          maxWidth: { xs: 250, sm: 330, md: 420 },
          textAlign: "left",
        }}
      >
        <Typography sx={{ color: "#5f5a4b", fontSize: { xs: 11, md: 12 }, fontWeight: 700 }}>
          {currentSlide.brand}
        </Typography>
        <Typography
          sx={{
            mt: 0.8,
            fontSize: { xs: 19, sm: 24, md: 28 },
            lineHeight: { xs: 1.18, md: 1.15 },
            color: "#181818",
            fontWeight: 800,
          }}
        >
          {currentSlide.title}
        </Typography>
        <Typography sx={{ mt: 0.8, fontSize: { xs: 12, sm: 14, md: 15 }, color: "#252525" }}>
          {currentSlide.subtitle}
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mt: 1.2,
            borderColor: "#1f1f1f",
            color: "#1f1f1f",
            fontSize: { xs: 13, md: 14 },
            px: { xs: 1.8, md: 2.6 },
            py: { xs: 0.55, md: 0.7 },
            borderRadius: "2px",
            textTransform: "none",
            "&:hover": { borderColor: "#1f1f1f", bgcolor: "rgba(255,255,255,0.16)" },
          }}
        >
          Explore Now
        </Button>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 92, md: 84 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1,
          zIndex: 12,
        }}
      >
        {slides.map((slide, idx) => (
          <Box
            key={slide.title}
            onClick={() => setActiveSlide(idx)}
            sx={{
              width: idx === activeSlide ? 20 : 8,
              height: 8,
              borderRadius: 20,
              bgcolor: idx === activeSlide ? "#1485e8" : "rgba(255,255,255,0.75)",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          />
        ))}
      </Box>

      <SearchBox
        cityQuery={cityQuery}
        cityOptions={cityOptions}
        cityLoading={cityLoading}
        onCityQueryChange={onCityQueryChange}
        onCitySelect={onCitySelect}
        onSearch={onSearch}
      />
    </Box>
  );
}
