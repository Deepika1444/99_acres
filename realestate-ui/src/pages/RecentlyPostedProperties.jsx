import { Box, Button, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

const items = [
  {
    name: "v.sampathkumar",
    text: "posted a Independent House/Villa1724 sq.ft. in Anna Nagar,Chennai...",
    day: "Today",
  },
  {
    name: "Kumaresh",
    text: "posted a Residential Apartment1400 sq.ft. in Anakaputhur,Chennai...",
    day: "Today",
  },
  {
    name: "Raman",
    text: "posted a Builder Floor1100 sq.ft. in Velachery,Chennai...",
    day: "Today",
  },
  {
    name: "Shankar",
    text: "posted a Plot/Land2400 sq.ft. in Tambaram,Chennai...",
    day: "Today",
  },
  {
    name: "Hari",
    text: "posted a Apartment1280 sq.ft. in Pallikaranai,Chennai...",
    day: "Today",
  },
  {
    name: "Prakash",
    text: "posted a Residential House1600 sq.ft. in Porur,Chennai...",
    day: "Today",
  },
];

const pageSize = 2;

export default function RecentlyPostedProperties({ mode }) {
  const byPathSell = window.location.pathname === "/sell-property";
  const byPathRent = window.location.pathname === "/post-property-as-rent";
  const isSellPage = mode ? mode === "sell" : byPathSell;
  const isRentPage = mode ? mode === "rent" : byPathRent;

  const sectionTitle = isSellPage ? "Recently Posted\nSell Properties" : isRentPage ? "Recently Posted\nRent Properties" : "Recently Posted\nProperties";
  const ctaText = isSellPage ? "Begin to Sell your Property" : isRentPage ? "Begin to Post Rental Property" : "Begin to Post your Property";

  const pages = useMemo(() => {
    const out = [];
    for (let i = 0; i < items.length; i += pageSize) out.push(items.slice(i, i + pageSize));
    return out;
  }, []);

  const [page, setPage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % pages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [pages.length]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  const goHome = () => {
    window.location.href = "/";
  };

  const goPostProperty = () => {
    window.location.href = "/post-property";
  };

  const goSellProperty = () => {
    window.location.href = "/sell-property";
  };

  const goPostPropertyAsRent = () => {
    window.location.href = "/post-property-as-rent";
  };

  return (
    <Box sx={{ bgcolor: "#ffffff", px: 2, py: { xs: 5, md: 6 } }}>
      <Box sx={{ maxWidth: 1060, mx: "auto", display: "grid", gridTemplateColumns: { xs: "1fr", md: "320px 1fr" }, gap: 2.8 }}>
        <Typography sx={{ color: "#06234b", fontSize: { xs: 44 / 2, md: 76 / 2 }, fontWeight: 700, lineHeight: 1.08 }}>
          {sectionTitle.split("\n")[0]}
          <br />
          {sectionTitle.split("\n")[1]}
        </Typography>

        <Box sx={{ overflow: "hidden" }}>
          <Box
            sx={{
              width: `${pages.length * 100}%`,
              display: "flex",
              transition: "transform 520ms ease",
              transform: `translateX(-${(100 / pages.length) * page}%)`,
            }}
          >
            {pages.map((group, i) => (
              <Box
                key={i}
                sx={{
                  width: `${100 / pages.length}%`,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.3,
                }}
              >
                {group.map((post, idx) => (
                  <Box
                    key={`${post.name}-${idx}`}
                    sx={{
                      border: "1px solid #dce3ec",
                      borderRadius: "12px",
                      bgcolor: "#f6f8fb",
                      px: 1.4,
                      py: 0.95,
                      display: "grid",
                      gridTemplateColumns: "48px 1fr",
                      alignItems: "start",
                      columnGap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: "#e8f2ff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <HomeRoundedIcon sx={{ fontSize: 22, color: "#1a78d7" }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: "#06234b", fontSize: 15, lineHeight: 1.35 }}>
                        <Box component="span" sx={{ fontWeight: 700 }}>
                          {post.name}
                        </Box>{" "}
                        {post.text}
                      </Typography>
                      <Typography sx={{ mt: 0.25, color: "#7c8da3", fontSize: 13 }}>{post.day}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 0.9 }}>
            {pages.map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: i === page ? "#167bd7" : "#d7dbe2",
                  transition: "background-color 220ms ease",
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1060, mx: "auto", mt: 10, display: "flex", justifyContent: "flex-start" }}>
        <Box>
          <Button
            variant="contained"
            onClick={handleScrollToTop}
            sx={{
              minWidth: 172,
              height: 40,
              bgcolor: "#1179d8",
              borderRadius: "4px",
              textTransform: "none",
              fontSize: 14,
              fontWeight: 700,
              px: 2.2,
              boxShadow: "0 2px 6px rgba(17, 121, 216, 0.28)",
              "&:hover": { bgcolor: "#0d6dc3" },
            }}
          >
            {ctaText}
          </Button>

          <Box sx={{ mt: 7, display: "flex", alignItems: "center", gap: { xs: 3, md: 7 } }}>
            <Typography sx={{ color: "#06234b", fontSize: { xs: 18, md: 38 / 2 }, fontWeight: 700 }}>
              Quick Links
            </Typography>
            <Typography
              onClick={isRentPage || isSellPage ? goPostProperty : goSellProperty}
              sx={{
                color: "#102445",
                fontSize: { xs: 16, md: 32 / 2 },
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {isRentPage || isSellPage ? "Post Property" : "Sell Property"}
            </Typography>
            <Typography
              onClick={isRentPage ? goSellProperty : goPostPropertyAsRent}
              sx={{
                color: "#102445",
                fontSize: { xs: 16, md: 32 / 2 },
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {isRentPage ? "Sell Property" : "Post Property for Rent"}
            </Typography>
          </Box>

          <Box sx={{ mt: 5, display: "flex", alignItems: "center", gap: 0.7, fontSize: 26 / 2 }}>
            <Typography
              onClick={goHome}
              sx={{ color: "#6d1fa5", cursor: "pointer", fontSize: "inherit", "&:hover": { textDecoration: "underline" } }}
            >
              Home
            </Typography>
            <Typography sx={{ color: "#6d1fa5", fontSize: "inherit" }}>&gt;</Typography>
            <Typography
              onClick={goPostProperty}
              sx={{ color: "#6d1fa5", cursor: "pointer", fontSize: "inherit", "&:hover": { textDecoration: "underline" } }}
            >
              Post Property
            </Typography>
            {(isRentPage || isSellPage) && (
              <>
                <Typography sx={{ color: "#6d1fa5", fontSize: "inherit" }}>&gt;</Typography>
                <Typography sx={{ color: "#102445", fontSize: "inherit" }}>
                  {isRentPage ? "Post property for rent online" : "Sell property online"}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
