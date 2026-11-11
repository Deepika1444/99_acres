import { Box, Typography } from "@mui/material";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

const col1 = [
  "Mobile Apps",
  "Our Services",
  "Price Trends",
  "Post your Property",
  "Real Estate Investments",
  "Builders in India",
  "Area Converter",
  "Articles",
  "Rent Receipt",
  "Customer Service",
  "Sitemap",
];

const col2 = [
  "About us",
  "Contact us",
  "Careers with us",
  "Terms & Conditions",
  "Request Info",
  "Feedback",
  "Report a problem",
  "Testimonials",
  "Privacy Policy",
  "Summons/Notices",
  "Grievances",
  "Safety Guide",
];

const col3 = [
  "Naukri.com - Jobs in India",
  "Naukrigulf.com - Jobs in middle east",
  "Jeevansathi.com - Matrimonials",
  "Brjj.com - Professional Networking",
  "Shiksha.com - Education Career Info",
  "Policybazaar.com - Insurance India",
  "PaisaBazaar.com",
  "AmbitionBox.com",
  "FirstNaukri.com - A jobsite for campus hiring",
  "Jobhai.com - Find Jobs Near You",
  "Techminis.com - Tech news on the go",
];

function FooterList({ title, items }) {
  return (
    <Box>
      <Typography sx={{ color: "white", fontWeight: 700, fontSize: 17, mb: 1.8 }}>{title}</Typography>
      <Box sx={{ display: "grid", gap: 1.4 }}>
        {items.map((item) => (
          <Typography key={item} sx={{ color: "white", fontSize: 15, lineHeight: 1.25 }}>
            {item}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default function Footer() {
  return (
    <Box sx={{ mt: 0, background: "linear-gradient(90deg, #091825 0%, #0b1d2f 100%)", position: "relative" }}>
      <Box
        sx={{
          maxWidth: "1180px",
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 4, md: 4.8 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.02fr 0.95fr 1.55fr 1.35fr" },
            gap: { xs: 4, md: 4.5 },
            alignItems: "start",
          }}
        >
          <FooterList title="99acres" items={col1} />
          <FooterList title="Company" items={col2} />
          <FooterList title="Our Partners" items={col3} />

          <Box>
            <Typography sx={{ color: "white", fontWeight: 700, fontSize: 17, mb: 1.8 }}>Contact Us</Typography>

            <Typography sx={{ color: "white", fontWeight: 700, fontSize: 15 }}>
              Toll Free - 1800 41 99099
            </Typography>
            <Typography sx={{ color: "#96a7bc", fontSize: 12.5, mt: 0.35 }}>9:30 AM to 6:30 PM (Mon-Sun)</Typography>
            <Typography sx={{ color: "white", fontSize: 15, mt: 1.5 }}>Email - feedback@99acres.com</Typography>

            <Typography sx={{ color: "white", fontWeight: 700, fontSize: 17, mt: 3.2, mb: 1 }}>
              Connect with us
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2.3 }}>
              <FacebookRoundedIcon sx={{ color: "white", fontSize: 24 }} />
              <YouTubeIcon sx={{ color: "white", fontSize: 24 }} />
              <TwitterIcon sx={{ color: "white", fontSize: 24 }} />
              <InstagramIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>

            <Typography sx={{ color: "white", fontWeight: 700, fontSize: 17, mt: 3.2, mb: 1.2 }}>
              Download the App
            </Typography>
            <Box sx={{ display: "flex", gap: 1.3 }}>
              <Box
                component="img"
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                sx={{ height: 40, width: "auto", display: "block" }}
              />
              <Box
                component="img"
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                sx={{ height: 40, width: "auto", display: "block" }}
              />
            </Box>

            <Typography sx={{ color: "#96a7bc", fontSize: 12, mt: 1.4, lineHeight: 1.35 }}>
              Usage of 99acres.com to upload content showing area in non standard units or which enables targeting by
              religion/community/caste/race is prohibited. Please report inappropriate content by writing to us at
              report abuse
            </Typography>

            <Typography sx={{ color: "white", fontSize: 15, fontWeight: 700, mt: 3, lineHeight: 1.35 }}>
              All trademarks are the property of their respective owners.
            </Typography>
            <Typography sx={{ color: "white", fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>
              All rights reserved - Info Edge (India) Ltd.
            </Typography>
            <Typography sx={{ color: "white", fontSize: 15, fontWeight: 700, lineHeight: 1.35 }}>
              A naukri.com group venture
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
