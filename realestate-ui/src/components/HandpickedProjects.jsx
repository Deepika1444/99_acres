import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";

const projects = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
    logoText: "INSPIRA",
    title: "Inspira Infinity",
    subtitle: "2 BHK Apartment, Sarjapur Road",
    price: "1.27 - 1.37 Cr",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1400&q=80",
    logoText: "AURELIUS",
    title: "Trendcon Aurelius Phase 1",
    subtitle: "4,5 BHK Independent House/Villa, Varthur",
    price: "2.88 - 3.68 Cr",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
    logoText: "ELITE",
    title: "Elite Green Valley",
    subtitle: "3 BHK Apartment, Whitefield",
    price: "1.98 - 2.42 Cr",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
    logoText: "URBAN",
    title: "Urban Crest Homes",
    subtitle: "3,4 BHK Villa, Sarjapur",
    price: "2.22 - 3.05 Cr",
  },
];

function ProjectCard({ project }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          height: { xs: 196, md: 232 },
          borderRadius: "4px",
          overflow: "hidden",
          backgroundImage: `url('${project.image}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 38,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 14,
            left: 0,
            bgcolor: "#cb0cc8",
            color: "white",
            fontWeight: 700,
            fontSize: 9,
            px: 0.65,
            py: 0.2,
            borderRadius: "0 2px 2px 0",
          }}
        >
          Featured
        </Box>
        <IconButton
          sx={{
            position: "absolute",
            top: 7,
            right: 7,
            color: "white",
            width: 30,
            height: 30,
          }}
        >
          <FavoriteBorderRoundedIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          position: "relative",
          mt: { xs: -5.2, md: -5.2 },
          mx: { xs: 2.2, md: 3.4 },
          p: 2.2,
          pt: 4.3,
          borderRadius: "10px",
          bgcolor: "white",
          boxShadow: "0 3px 12px rgba(18, 41, 76, 0.16)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -37,
            left: 30,
            width: 76,
            height: 76,
            borderRadius: "50%",
            backgroundImage: `url('${project.image}')`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            zIndex: 1,
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -25,
            left: 39,
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "3px solid #f4efe3",
            bgcolor: "#f8dfaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#1b2b4b",
            fontSize: 9,
            fontWeight: 700,
            zIndex: 2,
          }}
        >
          {project.logoText}
        </Box>

        <Typography sx={{ color: "#1b2b4b", fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>
          {project.title}
        </Typography>
        <Typography sx={{ mt: 0.6, color: "#7f8da3", fontSize: 12.5, lineHeight: 1.35 }}>
          {project.subtitle}
        </Typography>
        <Typography sx={{ mt: 1.05, color: "#1b2b4b", fontSize: 16, fontWeight: 700 }}>
          {"\u20B9"} {project.price}
        </Typography>
      </Box>
    </Box>
  );
}

export default function HandpickedProjects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = Math.max(projects.length - 2, 0);

  const showNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const showPrev = () => {
    setActiveIndex((prev) => Math.max(prev - 1, 0));
  };
  const visibleProjects = [
    projects[activeIndex],
    projects[(activeIndex + 1) % projects.length],
  ];

  return (
    <Box sx={{ mt: 4.2 }}>
      <Typography sx={{ color: "#172b4d", fontSize: 25, fontWeight: 700, lineHeight: 1.0 }}>
        Handpicked Projects
      </Typography>
      <Typography sx={{ color: "#8a95a9", fontSize: 14, mt: 0.7, mb: 2.2 }}>
        Featured Projects in Bangalore East
      </Typography>

      <Box sx={{ position: "relative" }}>
        {activeIndex > 0 && (
          <IconButton
            onClick={showPrev}
            sx={{
              position: "absolute",
              left: -14,
              top: "40%",
              zIndex: 4,
              bgcolor: "white",
              color: "#556784",
              boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 2.3,
            pb: 1.4,
          }}
        >
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </Box>

        {activeIndex < maxIndex && (
          <IconButton
            onClick={showNext}
            sx={{
              position: "absolute",
              right: -14,
              top: "40%",
              zIndex: 4,
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
