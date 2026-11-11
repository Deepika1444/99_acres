import { useMemo, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ThumbUpOffAltRoundedIcon from "@mui/icons-material/ThumbUpOffAltRounded";
import ThumbDownOffAltRoundedIcon from "@mui/icons-material/ThumbDownOffAltRounded";

const CARD_WIDTH = 326;
const CARD_GAP = 16;

const tabLabels = [
  { key: "east", label: "Bangalore East" },
  { key: "central", label: "Bangalore Central" },
  { key: "north", label: "Bangalore North" },
  { key: "west", label: "Bangalore West" },
  { key: "south", label: "Bangalore South" },
];

const demandByTab = {
  east: [
    {
      title: "Apartment",
      subtitle: "Most searched localities for Flat/Apartment",
      items: [
        { rank: 1, name: "Outer Ring Road East", pct: "14% Searches" },
        { rank: 2, name: "Old Madras Road", pct: "7% Searches" },
        { rank: 3, name: "Sarjapur Road", pct: "5% Searches" },
        { rank: 4, name: "Old Airport Road", pct: "4% Searches" },
        { rank: 5, name: "Hoskote", pct: "3% Searches" },
      ],
    },
    {
      title: "Plots",
      subtitle: "Most searched societies for Plots",
      items: [
        { rank: 1, name: "Old Madras Road", pct: "12% Searches" },
        { rank: 2, name: "Hoskote", pct: "9% Searches" },
        { rank: 3, name: "Outer Ring Road East", pct: "6% Searches" },
        { rank: 4, name: "Sarjapur Road", pct: "5% Searches" },
        { rank: 5, name: "Budigere Cross", pct: "4% Searches" },
      ],
    },
    {
      title: "Builder Floor",
      subtitle: "Most searched societies for Builder Floor",
      items: [
        { rank: 1, name: "Outer Ring Road East", pct: "11% Searches" },
        { rank: 2, name: "Old Madras Road", pct: "8% Searches" },
        { rank: 3, name: "Whitefield", pct: "6% Searches" },
        { rank: 4, name: "Hoskote", pct: "5% Searches" },
        { rank: 5, name: "Sarjapur Road", pct: "4% Searches" },
      ],
    },
  ],
  central: [
    {
      title: "Apartment",
      subtitle: "Most searched localities for Flat/Apartment",
      items: [
        { rank: 1, name: "MG Road", pct: "13% Searches" },
        { rank: 2, name: "Indiranagar", pct: "10% Searches" },
        { rank: 3, name: "Ulsoor", pct: "8% Searches" },
        { rank: 4, name: "Lavelle Road", pct: "6% Searches" },
        { rank: 5, name: "Richmond Town", pct: "4% Searches" },
      ],
    },
    {
      title: "Plots",
      subtitle: "Most searched societies for Plots",
      items: [
        { rank: 1, name: "Ulsoor", pct: "11% Searches" },
        { rank: 2, name: "Domlur", pct: "9% Searches" },
        { rank: 3, name: "Shivajinagar", pct: "7% Searches" },
        { rank: 4, name: "Langford Town", pct: "5% Searches" },
        { rank: 5, name: "Victoria Layout", pct: "4% Searches" },
      ],
    },
    {
      title: "Builder Floor",
      subtitle: "Most searched societies for Builder Floor",
      items: [
        { rank: 1, name: "Indiranagar", pct: "12% Searches" },
        { rank: 2, name: "Domlur", pct: "8% Searches" },
        { rank: 3, name: "Ulsoor", pct: "7% Searches" },
        { rank: 4, name: "Basavanagudi", pct: "5% Searches" },
        { rank: 5, name: "Malleswaram", pct: "4% Searches" },
      ],
    },
  ],
  north: [
    {
      title: "Apartment",
      subtitle: "Most searched localities for Flat/Apartment",
      items: [
        { rank: 1, name: "Hebbal", pct: "15% Searches" },
        { rank: 2, name: "Yelahanka", pct: "11% Searches" },
        { rank: 3, name: "Thanisandra", pct: "9% Searches" },
        { rank: 4, name: "Jakkur", pct: "6% Searches" },
        { rank: 5, name: "RT Nagar", pct: "4% Searches" },
      ],
    },
    {
      title: "Plots",
      subtitle: "Most searched societies for Plots",
      items: [
        { rank: 1, name: "Yelahanka", pct: "12% Searches" },
        { rank: 2, name: "Devanahalli", pct: "10% Searches" },
        { rank: 3, name: "Hennur", pct: "8% Searches" },
        { rank: 4, name: "Jakkur", pct: "6% Searches" },
        { rank: 5, name: "Bagalur", pct: "4% Searches" },
      ],
    },
    {
      title: "Builder Floor",
      subtitle: "Most searched societies for Builder Floor",
      items: [
        { rank: 1, name: "Hebbal", pct: "13% Searches" },
        { rank: 2, name: "Hennur", pct: "9% Searches" },
        { rank: 3, name: "Thanisandra", pct: "8% Searches" },
        { rank: 4, name: "Yelahanka", pct: "5% Searches" },
        { rank: 5, name: "Jakkur", pct: "4% Searches" },
      ],
    },
  ],
  west: [
    {
      title: "Apartment",
      subtitle: "Most searched localities for Flat/Apartment",
      items: [
        { rank: 1, name: "Rajajinagar", pct: "14% Searches" },
        { rank: 2, name: "Vijayanagar", pct: "10% Searches" },
        { rank: 3, name: "Nagarbhavi", pct: "8% Searches" },
        { rank: 4, name: "Magadi Road", pct: "6% Searches" },
        { rank: 5, name: "Kengeri", pct: "4% Searches" },
      ],
    },
    {
      title: "Plots",
      subtitle: "Most searched societies for Plots",
      items: [
        { rank: 1, name: "Kengeri", pct: "11% Searches" },
        { rank: 2, name: "Nagarbhavi", pct: "9% Searches" },
        { rank: 3, name: "Magadi Road", pct: "7% Searches" },
        { rank: 4, name: "Rajarajeshwari", pct: "6% Searches" },
        { rank: 5, name: "Uttarahalli", pct: "4% Searches" },
      ],
    },
    {
      title: "Builder Floor",
      subtitle: "Most searched societies for Builder Floor",
      items: [
        { rank: 1, name: "Rajajinagar", pct: "12% Searches" },
        { rank: 2, name: "Vijayanagar", pct: "9% Searches" },
        { rank: 3, name: "Basaveshwaranagar", pct: "7% Searches" },
        { rank: 4, name: "Kengeri", pct: "5% Searches" },
        { rank: 5, name: "Nagarbhavi", pct: "4% Searches" },
      ],
    },
  ],
  south: [
    {
      title: "Apartment",
      subtitle: "Most searched localities for Flat/Apartment",
      items: [
        { rank: 1, name: "JP Nagar", pct: "15% Searches" },
        { rank: 2, name: "BTM Layout", pct: "11% Searches" },
        { rank: 3, name: "HSR Layout", pct: "10% Searches" },
        { rank: 4, name: "Bannerghatta Road", pct: "7% Searches" },
        { rank: 5, name: "Kanakapura Road", pct: "5% Searches" },
      ],
    },
    {
      title: "Plots",
      subtitle: "Most searched societies for Plots",
      items: [
        { rank: 1, name: "Kanakapura Road", pct: "12% Searches" },
        { rank: 2, name: "Electronic City", pct: "10% Searches" },
        { rank: 3, name: "Bannerghatta Road", pct: "8% Searches" },
        { rank: 4, name: "Sarjapur Road", pct: "6% Searches" },
        { rank: 5, name: "JP Nagar", pct: "4% Searches" },
      ],
    },
    {
      title: "Builder Floor",
      subtitle: "Most searched societies for Builder Floor",
      items: [
        { rank: 1, name: "HSR Layout", pct: "13% Searches" },
        { rank: 2, name: "JP Nagar", pct: "10% Searches" },
        { rank: 3, name: "BTM Layout", pct: "8% Searches" },
        { rank: 4, name: "Jayanagar", pct: "6% Searches" },
        { rank: 5, name: "Bannerghatta Road", pct: "4% Searches" },
      ],
    },
  ],
};

function DemandCard({ card }) {
  return (
    <Box
      sx={{
        width: CARD_WIDTH,
        minWidth: CARD_WIDTH,
        minHeight: 386,
        bgcolor: "white",
        border: "1px solid #cedcee",
        borderRadius: "10px",
        px: 2,
        pt: 1.8,
        pb: 1.5,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography sx={{ color: "#1a2f50", fontSize: 17, fontWeight: 600 }}>
        {card.title}
      </Typography>
      <Typography sx={{ color: "#7a8ca8", fontSize: 14, mt: 0.2, mb: 1.3 }}>
        {card.subtitle}
      </Typography>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        {card.items.map((item) => (
          <Box
            key={`${card.title}-${item.rank}`}
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: "#8a97ac", fontSize: 13, display: "inline" }}>
                #{item.rank}
              </Typography>
              <Typography
                sx={{
                  ml: 0.8,
                  color: "#23395d",
                  fontSize: 14,
                  fontWeight: 700,
                  borderBottom: "1px dashed #b8c5d8",
                  display: "inline",
                }}
              >
                {item.name}
              </Typography>
              <Box sx={{ mt: 0.35, width: 24, height: 8, borderRadius: 999, bgcolor: "#9dcbf0" }} />
            </Box>
            <Typography sx={{ color: "#506684", fontSize: 13, ml: 1.2, whiteSpace: "nowrap" }}>
              {item.pct}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography sx={{ mt: 1.2, color: "#1177d5", fontSize: 13, fontWeight: 700 }}>
        View all 5 Localities
      </Typography>
    </Box>
  );
}

export default function DemandInBangalore() {
  const [activeTab, setActiveTab] = useState("east");
  const [shiftStep, setShiftStep] = useState(0);

  const cards = demandByTab[activeTab];
  const maxShiftStep = cards.length > 2 ? 1 : 0;
  const shiftAmount = CARD_WIDTH + CARD_GAP;
  const translateX = useMemo(() => shiftStep * shiftAmount, [shiftStep]);

  const onTabClick = (tabKey) => {
    setActiveTab(tabKey);
    setShiftStep(0);
  };

  return (
    <Box sx={{ mt: 2.8 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
        <Typography sx={{ color: "#172b4d", fontSize: 20, fontWeight: 700 }}>
          Demand in Bangalore
        </Typography>
        <InfoOutlinedIcon sx={{ color: "#5d6f89", fontSize: 22 }} />
      </Box>
      <Typography sx={{ color: "#4e627f", fontSize: 14, mt: 0.3 }}>
        Where are buyers searching in Bangalore
      </Typography>

      <Box sx={{ display: "flex", gap: 3.4, mt: 2.2, px: 0.8 }}>
        {tabLabels.map((tab) => (
          <Typography
            key={tab.key}
            onClick={() => onTabClick(tab.key)}
            sx={{
              color: activeTab === tab.key ? "#1c3355" : "#4d6180",
              fontSize: 15,
              fontWeight: activeTab === tab.key ? 700 : 500,
              pb: 1,
              borderBottom: activeTab === tab.key ? "2px solid #2e7ccf" : "2px solid transparent",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          mt: 0.2,
          position: "relative",
          bgcolor: "#edf2f8",
          borderRadius: "0 0 10px 10px",
          p: 1.6,
          overflow: "hidden",
        }}
      >
        {shiftStep > 0 && (
          <IconButton
            onClick={() => setShiftStep(0)}
            sx={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
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

        <Box
          sx={{
            overflow: "hidden",
            width: {
              xs: "100%",
              md:
                shiftStep === 0
                  ? `${CARD_WIDTH * 2.5 + CARD_GAP * 2}px`
                  : `${CARD_WIDTH * 2 + CARD_GAP}px`,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: `${CARD_GAP}px`,
              transform: { xs: "none", md: `translateX(-${translateX}px)` },
              transition: "transform 260ms ease",
            }}
          >
            {cards.map((card) => (
              <DemandCard key={`${activeTab}-${card.title}`} card={card} />
            ))}
          </Box>
        </Box>

        {shiftStep < maxShiftStep && (
          <IconButton
            onClick={() => setShiftStep(1)}
            sx={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.4, px: 0.8 }}>
        <Typography sx={{ color: "#6e7d93", fontSize: 13 }}>Is this helpful?</Typography>
        <Typography sx={{ color: "#6e7d93", fontSize: 13, fontWeight: 700 }}>Yes</Typography>
        <ThumbUpOffAltRoundedIcon sx={{ color: "#6e7d93", fontSize: 18 }} />
        <Typography sx={{ color: "#6e7d93", fontSize: 13, fontWeight: 700 }}>No</Typography>
        <ThumbDownOffAltRoundedIcon sx={{ color: "#6e7d93", fontSize: 18 }} />
      </Box>
    </Box>
  );
}
