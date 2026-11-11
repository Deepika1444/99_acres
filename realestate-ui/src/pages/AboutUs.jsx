import { Box, Typography } from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutUs() {
  const awards = [
    "PropTech Mobile App of the Year Award 2019",
    "99acres.com won the award for 'Personalized User Journey'",
    "Best Mobile Appies Award 2015",
    "99acres.com won the award for having the 'Most Innovative Mobile App' in the real estate category",
    "CMO ASIA Awards 2012",
    "99acres.com was awarded the 'Most Admired Real Estate Website of the Year' at the 3rd CMO Asia Awards",
    "BCI Awards 2012",
    "99acres.com was recognised as the 'Best Real Estate Portal' in 2012.",
    "Accommodation Times Awards 2012",
    "99acres.com was announced the 'Best Online Realty Portal' by the Accommodation Times in 2012.",
  ];

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar sticky />

      <Box sx={{ maxWidth: 1180, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 10, md: 9.3 }, pb: 4 }}>
        <Box sx={{ maxWidth: 730, mx: "auto" }}>
          <Typography sx={{ color: "#334d6d", fontSize: 11.5 }}>
            <Box component="a" href="/" sx={{ color: "#334d6d", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              Home
            </Box>{" "}
            &gt;{" "}
            <Box component="a" href="/about-us" sx={{ color: "#0f4f9a", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
              About us
            </Box>
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 730, mx: "auto" }}>
          <Box
            sx={{
              mt: 2.1,
              borderRadius: "8px",
              bgcolor: "#e8eff5",
              minHeight: 154,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.3,
            }}
          >
            <EmojiEventsRoundedIcon sx={{ color: "#1f87d6", fontSize: 38 }} />
            <Typography sx={{ color: "#0d2444", fontSize: 40 / 2.0, fontWeight: 800 }}>About Us</Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 700, mx: "auto" }}>
          <Typography sx={{ mt: 3.2, color: "#1a3558", fontSize: 15.5, lineHeight: 1.82 }}>
            Launched in 2005, 99acres.com, India's No. 1 property portal, deals with every aspect of the consumers'
            needs in the real estate industry. It is an online forum where buyers, sellers and brokers/agents can
            exchange information about real estate properties quickly, effectively and inexpensively. At 99acres.com,
            you can advertise a property, search for a property, browse through properties, build your own property
            microsite, and keep yourself updated with the latest news and trends making headlines in the realty sector.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 700, mx: "auto", mt: 2.9, display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 0.8 }}>
          <AutoAwesomeRoundedIcon sx={{ color: "#efbf1a", fontSize: 22 }} />
          <Typography sx={{ color: "#0d2444", fontSize: 36 / 2.0, fontWeight: 800 }}>Why 99acres.com?</Typography>
        </Box>

        <Box sx={{ maxWidth: 700, mx: "auto" }}>
          <Typography sx={{ mt: 0.9, color: "#1a3558", fontSize: 13, lineHeight: 1.82 }}>
            At present, 99acres.com prides itself for having around nine lakh property listings spanning across 600+
            cities in India. Of all, the website held over 5.7 lakh paid listings at the end of FY 2018-19. In
            addition to providing an online platform to real estate developers, brokers and property owners for listing
            their property for sale, purchase or rent, 99acres.com offers advertisement stints such as microsites,
            banners, home page links and project pages to the clients for better visibility and branding in the market.
            <br />
            With the ever-evolving online search behaviour, 99acres.com shares updated information pertinent to real
            estate activities, assisting prospective buyers to make informed buying decision. We make online property
            search easier, quicker and smarter!
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 700, mx: "auto" }}>
          <Box
            sx={{
              mt: 3,
              borderRadius: "8px",
              bgcolor: "#e8eff5",
              minHeight: 82,
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              px: 2,
            }}
          >
            <EmojiEventsRoundedIcon sx={{ color: "#1f87d6", fontSize: 36 }} />
            <Typography sx={{ color: "#0d2444", fontSize: 36 / 2.0, fontWeight: 800 }}>Awards &amp; Recognitions</Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 700, mx: "auto", mt: 2, color: "#1a3558", fontSize: 15.5, lineHeight: 1.72 }}>
          {awards.map((award) => (
            <Typography key={award} sx={{ color: "inherit", fontSize: "inherit", lineHeight: "inherit" }}>
              - {award}
            </Typography>
          ))}
        </Box>

        <Box sx={{ maxWidth: 700, mx: "auto" }}>
          <Typography sx={{ mt: 2.4, color: "#6f8098", fontSize: 16.5 }}>Connect with us:</Typography>
        </Box>
        <Box sx={{ maxWidth: 700, mx: "auto", mt: 0.8, display: "flex", alignItems: "center", gap: 0.9 }}>
          <Box sx={{ width: 36, height: 36, bgcolor: "#1da1f2", display: "grid", placeItems: "center", borderRadius: "3px" }}>
            <TwitterIcon sx={{ color: "white", fontSize: 23 }} />
          </Box>
          <Box sx={{ width: 36, height: 36, bgcolor: "#3b5998", display: "grid", placeItems: "center", borderRadius: "3px" }}>
            <FacebookRoundedIcon sx={{ color: "white", fontSize: 23 }} />
          </Box>
          <Box sx={{ width: 36, height: 36, bgcolor: "#ff0000", display: "grid", placeItems: "center", borderRadius: "3px" }}>
            <YouTubeIcon sx={{ color: "white", fontSize: 23 }} />
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
