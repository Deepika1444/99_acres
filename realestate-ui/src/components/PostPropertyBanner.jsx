import { Box, Button, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

const AGENT_IMAGE = "https://www.99acres.com/universalapp/img/hp_ppf_banner.png";
const AGENT_FALLBACK_IMAGE = "https://www.99acres.com/universalapp/img/hp_ppf_banner.png";

export default function PostPropertyBanner() {
  return (
    <Box
      sx={{
        maxWidth: "1180px",
        mx: "auto",
        px: { xs: 2, md: 3 },
        pb: 10,
      }}
    >
      <Box
        sx={{
          borderRadius: "12px",
          background: "#dfe9e4",
          minHeight: { xs: 320, md: 390 },
          px: { xs: 3, md: 10 },
          py: { xs: 4, md: 6 },
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box sx={{ maxWidth: { xs: "100%", md: 560 }, pr: { md: 2 } }}>
          <Typography
            sx={{
              color: "#0f2241",
              fontWeight: 700,
              fontSize: { xs: 32, md: 28 },
              lineHeight: 1.2,
            }}
          >
            Sell or rent faster at the right price!
          </Typography>
          <Typography sx={{ mt: 1.2, color: "#536885", fontSize: { xs: 16, md: 15 } }}>
            Your perfect buyer is waiting, list your property now
          </Typography>

          <Button
            variant="contained"
            sx={{
              mt: 3.2,
              minWidth: { xs: 250, md: 360 },
              height: { xs: 52, md: 52 },
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: 18, md: 15 },
              bgcolor: "#147ccf",
              "&:hover": { bgcolor: "#0f6db7" },
              boxShadow: "none",
            }}
          >
            Post Property, It's FREE
          </Button>

          <Box sx={{ mt: 2.2, display: "flex", alignItems: "center", gap: 0.8, color: "#11284a" }}>
            <Typography sx={{ fontSize: { xs: 18, md: 16 }, fontWeight: 600 }}>Post via</Typography>
            <WhatsAppIcon sx={{ color: "#25D366", fontSize: { xs: 24, md: 18 } }} />
            <Typography sx={{ fontSize: { xs: 18, md: 16 }, fontWeight: 600 }}>Whatsapp</Typography>
            <ArrowForwardRoundedIcon sx={{ fontSize: { xs: 24, md: 20 } }} />
          </Box>
        </Box>

        <Box
          component="img"
          src={AGENT_IMAGE}
          alt="Agent holding phone"
          onError={(e) => {
            if (e.currentTarget.src !== AGENT_FALLBACK_IMAGE) {
              e.currentTarget.src = AGENT_FALLBACK_IMAGE;
            }
          }}
          sx={{
            position: "absolute",
            right: { xs: -60, md: 200 },
            bottom: 0,
            width: { xs: 174, md: 252 },
            height: { xs: 230, md: 320 },
            objectFit: "contain",
            filter: "drop-shadow(0 8px 16px rgba(9, 24, 48, 0.18))",
            display: { xs: "none", sm: "block" },
            pointerEvents: "none",
          }}
        />
      </Box>
    </Box>
  );
}
