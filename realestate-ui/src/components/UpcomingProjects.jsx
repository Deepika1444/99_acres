import { useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";

const upcoming = [
  {
    id: 1,
    name: "SSVR Meridian",
    location: "Varthur, Bangalore",
    builder: "SSVR Builders",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 2,
    name: "Tranquil Vista",
    location: "Whitefield, Bangalore",
    builder: "Tranquil Homes",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 3,
    name: "Urban Skies",
    location: "Sarjapur, Bangalore",
    builder: "Urban Habitat",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 4,
    name: "Riverview Heights",
    location: "Hebbal, Bangalore",
    builder: "Riverview Group",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 5,
    name: "Crestline Towers",
    location: "Yelahanka, Bangalore",
    builder: "Crestline Infra",
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 6,
    name: "Palm Grove",
    location: "Electronic City, Bangalore",
    builder: "Palm Grove Builders",
    image:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function UpcomingProjects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const project = upcoming[activeIndex];

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + upcoming.length) % upcoming.length);
  };
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % upcoming.length);
  };

  return (
    <Box sx={{ mt: 3.2 }}>
      <Typography sx={{ color: "#172b4d", fontSize: 26, fontWeight: 660 }}>
        Upcoming Projects
      </Typography>
      <Typography sx={{ color: "#4c5f7b", fontSize: 13, mt: 0.3 }}>
        Visit these projects and get early bird benefits
      </Typography>

      <Box
        sx={{
          mt: 1.6,
          bgcolor: "#f2f5f9",
          borderRadius: "10px",
          p: 1.2,
          border: "1px solid #e0e6ef",
        }}
      >
        <Box
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          sx={{
            position: "relative",
            height: { xs: 420, md: 540 },
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${project.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: isHovering ? "scale(1.06)" : "scale(1)",
              transition: "transform 320ms ease",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0) 48%, rgba(0,8,26,0.75) 100%)",
            }}
          />

          <Box sx={{ position: "absolute", top: 22, left: 22, color: "white" }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2 }}>{project.name}</Typography>
            <Typography sx={{ fontSize: 15, fontWeight: 700, mt: 0.3 }}>{project.location}</Typography>
          </Box>

          <IconButton
            onClick={goPrev}
            sx={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "white",
              color: "#4f607b",
              boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
              opacity: { xs: 1, md: isHovering ? 1 : 0 },
              pointerEvents: { xs: "auto", md: isHovering ? "auto" : "none" },
              transition: "opacity 180ms ease",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            onClick={goNext}
            sx={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "white",
              color: "#4f607b",
              boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
              opacity: { xs: 1, md: isHovering ? 1 : 0 },
              pointerEvents: { xs: "auto", md: isHovering ? "auto" : "none" },
              transition: "opacity 180ms ease",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "#001a45",
              px: 2.1,
              py: 1.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.6,
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <Box>
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: 13 }}>
                Interested in this project by
              </Typography>
              <Typography sx={{ color: "white", fontSize: 18, fontWeight: 700, lineHeight: 1.2, mt: 0.15 }}>
                {project.builder}? <ArrowForwardRoundedIcon sx={{ verticalAlign: "middle", fontSize: 16 }} />
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<CallRoundedIcon />}
              sx={{
                bgcolor: "#157fdc",
                color: "white",
                textTransform: "none",
                borderRadius: "6px",
                px: 3,
                py: 0.95,
                minWidth: { xs: "100%", md: 312 },
                fontSize: 14,
                fontWeight: 700,
                "&:hover": { bgcolor: "#0e73ca" },
              }}
            >
              View Number
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
