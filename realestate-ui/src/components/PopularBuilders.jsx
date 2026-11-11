import { Box, IconButton, Typography } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { useEffect, useRef, useState } from "react";

const columns = [
  [
    {
      id: 1,
      name: "Prestige Group",
      meta: "177 Total Projects | 51 in this city",
      logo: "Prestige",
      logoUrl: "https://newprojects.99acres.com/projects/prestige/lgosdg.jpg",
      logoBg: "#f7f8fa",
    },
    {
      id: 2,
      name: "Sobha",
      meta: "180 Total Projects | 40 in this city",
      logo: "SOBHA",
      logoUrl: "https://newprojects.99acres.com/projects/sobha/ypfvnog_1749455049_605160795_O.jpg",
      logoBg: "#f7f8fa",
    },
  ],
  [
    {
      id: 3,
      name: "Godrej Properties",
      meta: "191 Total Projects | 13 in this city",
      logo: "Godrej",
      logoUrl: "https://newprojects.99acres.com/projects/godrejproperties/40fn6j0_1762173585_667830551_O.jpg",
      logoBg: "#f7f8fa",
    },
    {
      id: 4,
      name: "Brigade Group",
      meta: "119 Total Projects | 20 in this city",
      logo: "BRIGADE",
      logoUrl: "https://newprojects.99acres.com/projects/brigade/build.jpg",
      logoBg: "#f7f8fa",
    },
  ],
  [
    {
      id: 5,
      name: "Puravankara",
      meta: "103 Total Projects | 18 in this city",
      logo: "Purva",
      logoUrl: "https://newprojects.99acres.com/projects/dsrinfraprojectsbangalore/nza2v65_1757922850_647361447_O.jpg",
      logoBg: "#f7f8fa",
    },
    {
      id: 6,
      name: "Embassy Group",
      meta: "86 Total Projects | 14 in this city",
      logo: "Embassy",
      logoUrl: "https://newprojects.99acres.com/projects/sumadhuragroup/61xfxff_1727504023_521241129_O.jpg",
      logoBg: "#f7f8fa",
    },
  ],
  [
    {
      id: 7,
      name: "Shapoorji Pallonji",
      meta: "94 Total Projects | 12 in this city",
      logo: "SP",
      logoUrl: "https://newprojects.99acres.com/projects/sree_properties/befunky_sreecasa.jpg.jpg",
      logoBg: "#f7f8fa",
    },
    {
      id: 8,
      name: "Lodha Group",
      meta: "122 Total Projects | 16 in this city",
      logo: "Lodha",
      logoUrl: "https://newprojects.99acres.com/projects/divyasree_/divyasree_logo.jpg",
      logoBg: "#f7f8fa",
    },
  ],
];

function BuilderCard({ item }) {
  return (
    <Box
      sx={{
        height: 144,
        border: "1px solid #dce2eb",
        borderRadius: "8px",
        bgcolor: "white",
        px: 2,
        py: 1.6,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 90,
          height: 90,
          borderRadius: "50%",
          border: "1px solid #dce2eb",
          bgcolor: item.logoBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#222",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {item.logoUrl ? (
          <>
          <Box
            component="img"
            src={item.logoUrl}
            alt={item.name}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const next = e.currentTarget.nextElementSibling;
              if (next) next.style.display = "inline-block";
            }}
            sx={{ width: 64, height: 64, objectFit: "contain" }}
          />
          <Box component="span" sx={{ display: "none", fontSize: 13, fontWeight: 600, color: "#2a2a2a" }}>
            {item.logo}
          </Box>
          </>
        ) : (
          item.logo
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: "#1a2f50", fontSize: 16, fontWeight: 700, lineHeight: 1.15 }}>
          {item.name}
        </Typography>
        <Typography sx={{ color: "#7a8ca8", fontSize: 13, mt: 0.45 }}>
          {item.meta}
        </Typography>
      </Box>
    </Box>
  );
}

export default function PopularBuilders() {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const update = () => {
      setCanScrollLeft(el.scrollLeft > 2);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollRight = () => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: 420, behavior: "smooth" });
  };
  const scrollLeft = () => {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: -420, behavior: "smooth" });
  };

  return (
    <Box sx={{ mt: 3.4 }}>
      <Typography sx={{ color: "#172b4d", fontSize: 20, fontWeight: 700 }}>
        Popular builders
      </Typography>
      <Typography sx={{ color: "#4e627f", fontSize: 13, mt: 0.4 }}>
        in Bangalore East
      </Typography>

      <Box sx={{ mt: 1.8, position: "relative" }}>
        <Box
          sx={{
            overflow: "hidden",
            width: { xs: "100%", md: 884 },
            maxWidth: "100%",
          }}
        >
          <Box
            ref={rowRef}
            sx={{
              display: "flex",
              gap: 1.2,
              overflowX: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {columns.map((pair, idx) => (
              <Box key={idx} sx={{ minWidth: 401, width: 401, display: "grid", gap: 1.2 }}>
                <BuilderCard item={pair[0]} />
                <BuilderCard item={pair[1]} />
              </Box>
            ))}
          </Box>
        </Box>

        {canScrollLeft && (
          <IconButton
            onClick={scrollLeft}
            sx={{
              position: "absolute",
              left: -16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: "white",
              color: "#556784",
              boxShadow: "0 4px 12px rgba(18, 41, 76, 0.16)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}

        {canScrollRight && (
          <IconButton
            onClick={scrollRight}
            sx={{
              position: "absolute",
              right: -16,
              top: "50%",
              transform: "translateY(-50%)",
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

      <Box sx={{ mt: 3.2, display: "grid", gap: 2 }}>
        <Box
          sx={{
            borderRadius: "14px",
            bgcolor: "#e1eee8",
            minHeight: { xs: 128, md: 142 },
            px: { xs: 1.8, md: 2.8 },
            py: { xs: 1.8, md: 2.2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, md: 2.4 }, minWidth: 0 }}>
            <Box
              sx={{
                width: { xs: 96, md: 140 },
                height: { xs: 78, md: 94 },
                position: "relative",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  left: 6,
                  top: 14,
                  width: { xs: 56, md: 84 },
                  height: { xs: 40, md: 58 },
                  borderRadius: "8px",
                  bgcolor: "#edf3f2",
                  border: "1px solid #d1ddda",
                  transform: "rotate(-12deg)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: { xs: 22, md: 34 },
                  top: 8,
                  width: { xs: 56, md: 84 },
                  height: { xs: 40, md: 58 },
                  borderRadius: "8px",
                  bgcolor: "#f7faf9",
                  border: "1px solid #d1ddda",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HomeRoundedIcon sx={{ color: "#1d8ad9", fontSize: { xs: 28, md: 34 } }} />
              </Box>
              <VerifiedRoundedIcon
                sx={{
                  position: "absolute",
                  right: { xs: 10, md: 18 },
                  top: 0,
                  color: "#22a56a",
                  fontSize: { xs: 20, md: 25 },
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  color: "#142643",
                  fontSize: { xs: 19, md: 22 },
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                View properties verified by 99acres
              </Typography>
              <Typography
                sx={{
                  color: "#4f657f",
                  fontSize: { xs: 12.5, md: 16 },
                  mt: 0.5,
                  lineHeight: 1.35,
                }}
              >
                Verified on site for genuineness. Check out real photos of the property
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              width: { xs: 42, md: 52 },
              height: { xs: 42, md: 52 },
              borderRadius: "50%",
              bgcolor: "#c7e8db",
              color: "#112746",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <KeyboardArrowRightRoundedIcon sx={{ fontSize: { xs: 24, md: 30 } }} />
          </Box>
        </Box>

        <Box
          id="locality-rating-section"
          sx={{
            borderRadius: "10px",
            bgcolor: "#efe4d1",
            minHeight: { xs: 126, md: 138 },
            px: { xs: 1.8, md: 2.8 },
            py: { xs: 1.8, md: 2.1 },
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, md: 2.8 },
          }}
        >
          <Box
            sx={{
              width: { xs: 96, md: 148 },
              height: { xs: 82, md: 104 },
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                left: 12,
                bottom: 0,
                width: { xs: 70, md: 104 },
                height: { xs: 45, md: 60 },
                borderRadius: "16px 16px 8px 8px",
                bgcolor: "#d4d7db",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                right: 4,
                bottom: 14,
                width: { xs: 44, md: 66 },
                height: { xs: 28, md: 38 },
                borderRadius: "6px",
                bgcolor: "#2a3547",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: 42,
                top: 20,
                width: { xs: 30, md: 44 },
                height: { xs: 30, md: 44 },
                borderRadius: "50%",
                bgcolor: "#d4903a",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: 36,
                top: 46,
                width: { xs: 46, md: 62 },
                height: { xs: 24, md: 32 },
                borderRadius: "18px 18px 10px 10px",
                bgcolor: "#e8b773",
              }}
            />
            <FavoriteRoundedIcon
              sx={{
                position: "absolute",
                left: 18,
                top: 18,
                color: "#f2a544",
                fontSize: { xs: 16, md: 20 },
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                color: "#001b45",
                fontWeight: 700,
                fontSize: { xs: 18, md: 22 },
                lineHeight: 1.2,
              }}
            >
              How would you rate your locality / society?
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.3, md: 2 }, mt: 1.1 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarBorderRoundedIcon
                  key={star}
                  sx={{
                    color: "#6f8198",
                    fontSize: { xs: 30, md: 36 },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
