import { Box, Typography } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import { useMemo, useState } from "react";

const tabs = ["News", "Tax & Legal", "Help Guides", "Investment"];

const articles = [
  {
    id: 1,
    title: "Bangalore builders will pay for extra floors",
    date: "Mar 03, 2025",
    image:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=900&q=80",
    fallbackImage: "https://picsum.photos/seed/article-1/900/600",
  },
  {
    id: 2,
    title: "Bangalore to get new satellite township",
    date: "Jan 31, 2025",
    image:
      "https://imagecdn.99acres.com/microsite/wp-content/blogs.dir/6161/files/2025/01/prestige-lakeside-habitat-villa-side-view-in-evening-stockpack-unsplash-287x180.jpg?1738320914000",
    fallbackImage: "https://picsum.photos/seed/article-2/900/600",
  },
  {
    id: 3,
    title: "Ozone Urbana flats double sold",
    date: "Jan 21, 2025",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80",
    fallbackImage: "https://picsum.photos/seed/article-3/900/600",
  },
  {
    id: 4,
    title: "BDA to auction 80 villas at Hunnigere Project",
    date: "Jan 16, 2025",
    image:
      "https://imagecdn.99acres.com/microsite/wp-content/blogs.dir/6161/files/2025/01/white-and-brown-concrete-building-near-the-swimming-pool-stockpack-pexels-270x180.jpg?1737104612000",
    fallbackImage: "https://picsum.photos/seed/article-4/900/600",
  },
  {
    id: 5,
    title: "Metro-linked housing demand rises in East Bengaluru",
    date: "Jan 10, 2025",
    image:
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80",
    fallbackImage: "https://picsum.photos/seed/article-5/900/600",
  },
  {
    id: 6,
    title: "Luxury apartments see strong booking in launch week",
    date: "Jan 04, 2025",
    image:
      "https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=900&q=80",
    fallbackImage: "https://picsum.photos/seed/article-6/900/600",
  },
  {
    id: 7,
    title: "Home loan rates steady as festive offers continue",
    date: "Dec 28, 2024",
    image:
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80",
    fallbackImage: "https://picsum.photos/seed/article-7/900/600",
  },
  {
    id: 8,
    title: "Township projects gain traction near IT corridors",
    date: "Dec 22, 2024",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    fallbackImage: "https://picsum.photos/seed/article-8/900/600",
  },
];

function ArticleCard({ article }) {
  return (
    <Box sx={{ minWidth: { xs: 276, md: 0 }, width: "100%" }}>
      <Box
        sx={{
          width: "100%",
          height: { xs: 148, md: 160 },
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={article.image}
          alt={article.title}
          onError={(e) => {
            if (e.currentTarget.src !== article.fallbackImage) {
              e.currentTarget.src = article.fallbackImage;
            }
          }}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.35s ease",
            "&:hover": {
              transform: "scale(1.08)",
            },
          }}
        />
      </Box>
      <Typography
        sx={{
          mt: 1.5,
          color: "#132849",
          fontSize: { xs: 20, md: 17 },
          fontWeight: 700,
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {article.title}
      </Typography>
      <Typography sx={{ mt: 0.65, color: "#526786", fontSize: { xs: 13, md: 13 } }}>
        {article.date}
      </Typography>
    </Box>
  );
}

export default function TopArticles() {
  const [startIndex, setStartIndex] = useState(0);

  const visibleArticles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 4; i += 1) {
      items.push(articles[(startIndex + i) % articles.length]);
    }
    return items;
  }, [startIndex]);

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % articles.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  return (
    <Box
      sx={{
        maxWidth: "1180px",
        mx: "auto",
        px: { xs: 2, md: 3 },
        pb: 8,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 2 }}>
        <Typography sx={{ color: "#0f2241", fontSize: { xs: 25, md: 25 }, fontWeight: 700 }}>
          Top articles on home buying
        </Typography>
        <Typography
          sx={{
            color: "#0f7ad7",
            fontSize: { xs: 8, md: 16 },
            fontWeight: 660,
            display: { xs: "none", md: "block" },
            whiteSpace: "nowrap",
          }}
        >
          Read realty news, guides & articles
        </Typography>
      </Box>

      <Box sx={{ mt: 1.4, borderBottom: "1px solid #d4dbe6", display: "flex", gap: 2.2 }}>
        {tabs.map((tab, index) => (
          <Box
            key={tab}
            sx={{
              pb: 1,
              borderBottom: index === 0 ? "2px solid #0f7ad7" : "2px solid transparent",
            }}
          >
            <Typography
              sx={{
                color: index === 0 ? "#1a2f50" : "#7d8ea7",
                fontSize: { xs: 14, md: 15 },
                fontWeight: index === 0 ? 700 : 500,
              }}
            >
              {tab}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 1.6, position: "relative" }}>
        <Box
          sx={{
            display: { xs: "flex", md: "grid" },
            gridTemplateColumns: { md: "repeat(4, minmax(0, 1fr))" },
            gap: 2,
            overflowX: { xs: "auto", md: "visible" },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {visibleArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </Box>

        <Box
          onClick={handlePrev}
          sx={{
            position: "absolute",
            left: { xs: 6, md: -20 },
            top: "40%",
            transform: "translateY(-50%)",
            width: { xs: 34, md: 44 },
            height: { xs: 34, md: 44 },
            borderRadius: "50%",
            bgcolor: "#f4f7fb",
            border: "1px solid #d8dfea",
            color: "#4e617e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(31, 45, 74, 0.12)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: { xs: 10, md: 13 } }} />
        </Box>

        <Box
          onClick={handleNext}
          sx={{
            position: "absolute",
            right: { xs: 6, md: -20 },
            top: "40%",
            transform: "translateY(-50%)",
            width: { xs: 30, md: 40 },
            height: { xs: 30, md: 40 },
            borderRadius: "50%",
            bgcolor: "#f4f7fb",
            border: "1px solid #d8dfea",
            color: "#4e617e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(31, 45, 74, 0.12)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <ArrowForwardIosRoundedIcon sx={{ fontSize: { xs: 10, md: 13 } }} />
        </Box>
      </Box>
    </Box>
  );
}
