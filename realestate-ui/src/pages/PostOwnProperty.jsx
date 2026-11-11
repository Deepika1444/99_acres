import { Box, Button, Typography } from "@mui/material";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import RecentlyPostedProperties from "./RecentlyPostedProperties";

const steps = [
  {
    title: "01. Add details of your property",
    description:
      "Begin by telling us the few basic details about your property like your property type, location, No. of rooms etc",
    icon: <DescriptionRoundedIcon sx={{ fontSize: 36, color: "#f0a33a" }} />,
  },
  {
    title: "02. Upload Photos & Videos",
    description:
      "Upload photos and videos of your property either via your desktop device or from your mobile phone",
    icon: <AddPhotoAlternateRoundedIcon sx={{ fontSize: 36, color: "#1a78d7" }} />,
  },
  {
    title: "03. Add Pricing & Ownership",
    description:
      "Just update your property's ownership details and your expected price and your property is ready for posting",
    icon: <AccountBalanceWalletRoundedIcon sx={{ fontSize: 36, color: "#1a78d7" }} />,
  },
];

export default function PostOwnProperty({ mode = "post" }) {
  const isSell = mode === "sell";
  const isRent = mode === "rent";

  const stepsHeading = isSell
    ? "Sell Your Property in"
    : isRent
      ? "Rent Your Property in"
      : "Post Your Property in";

  const ctaText = isSell
    ? "Begin to Sell your Property"
    : "Begin to Post your Property";

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    window.requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  return (
    <>
      <Box
        id="post-own-property"
        sx={{
          bgcolor: "#ffffff",
          pt: { xs: 4, md: 6 },
          pb: { xs: 8, md: 9 },
          px: 2,
        }}
      >
        <Box sx={{ maxWidth: 1080, mx: "auto", textAlign: "center" }}>
          <Typography sx={{ color: "#77889d", fontSize: 24 / 2, letterSpacing: 0.8, fontWeight: 600 }}>
            HOW TO POST
          </Typography>
          <Typography
            sx={{
              mt: 1,
              color: "#06234b",
              fontSize: { xs: 80 / 2, md: 80 / 2 },
              lineHeight: 1.4,
              fontWeight: 700,
            }}
          >
            {stepsHeading}
            <br />
            3 Simple Steps
          </Typography>

          <Box
            sx={{
              mt: { xs: 4.5, md: 5.2 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: { xs: 4, md: 3.8 },
              textAlign: "left",
            }}
          >
            {steps.map((step) => (
              <Box key={step.title} sx={{ px: { xs: 0.5, md: 1.2 } }}>
                <Box sx={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{step.icon}</Box>
                <Typography sx={{ mt: 1.8, color: "#06234b", fontSize: 37 / 2, fontWeight: 700, lineHeight: 1.2 }}>
                  {step.title}
                </Typography>
                <Typography sx={{ mt: 1.1, color: "#2d4261", fontSize: 13.5, lineHeight: 1.5 }}>
                  {step.description}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            variant="contained"
            onClick={handleScrollToTop}
            sx={{
              mt: { xs: 5, md: 6 },
              minWidth: 202,
              height: 42 / 1.1,
              bgcolor: "#1179d8",
              borderRadius: "4px",
              textTransform: "none",
              fontSize: 25 / 2,
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(17, 121, 216, 0.28)",
              "&:hover": { bgcolor: "#0d6dc3" },
            }}
          >
            {ctaText}
          </Button>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#ffffff", px: 2, pb: { xs: 7, md: 9 } }}>
        <Box
          sx={{
            maxWidth: 1060,
            mx: "auto",
            height: { xs: 210, md: 310 },
            backgroundImage:
              "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1500&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
          }}
        />
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            mt: { xs: -4, md: -12 },
            bgcolor: "white",
            border: "1px solid white",
            boxShadow: "0 2px 6px rgba(20, 46, 77, 0.06)",
            px: { xs: 2.5, md: 7 },
            py: { xs: 3, md: 5.5 },
            position: "relative",
            zIndex: 2,
          }}
        >
          <Typography
            sx={{
              color: "#06234b",
              fontWeight: 700,
              lineHeight: 1.32,
              fontSize: { xs: 34 / 2, md: 60 / 2 },
              maxWidth: 700,
            }}
          >
            With over 7 million unique visitors monthly, your property gets maximum visibility on 99acres.com
          </Typography>

          <Box sx={{ mt: { xs: 3, md: 5 }, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 14 / 1.4, color: "#7f90a7", fontWeight: 700 }}>OVER</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 58 / 2, color: "#06234b", fontWeight: 700 }}>1M</Typography>
              <Typography sx={{ mt: 0.8, fontSize: 16 / 1.5, color: "#334b67" }}>Property Listings</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14 / 1.4, color: "#7f90a7", fontWeight: 700 }}>OVER</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 58 / 2, color: "#06234b", fontWeight: 700 }}>5.5M</Typography>
              <Typography sx={{ mt: 0.8, fontSize: 16 / 1.5, color: "#334b67" }}>Monthly Searches</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14 / 1.4, color: "#7f90a7", fontWeight: 700 }}>OVER</Typography>
              <Typography sx={{ mt: 0.5, fontSize: 58 / 2, color: "#06234b", fontWeight: 700 }}>200K</Typography>
              <Typography sx={{ mt: 0.8, fontSize: 16 / 1.5, color: "#334b67" }}>Owners advertising monthly</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      <RecentlyPostedProperties mode={mode} />
    </>
  );
}
