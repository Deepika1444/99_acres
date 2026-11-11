import {
  Box,
  Button,
  Chip,
  Divider,
  Radio,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import PostOwnProperty from "./PostOwnProperty";
import PostPropertyBasicDetails from "./PostPropertyBasicDetails";
import Footer from "../components/Footer";
import AuthDialog from "../components/AuthDialog";
import { getAuthToken, getAuthUser } from "../utils/authStorage";

const LOOKING_OPTIONS = ["sell", "rent", "pg"];
const SEGMENT_OPTIONS = ["residential", "commercial"];

const PROPERTY_TYPE_MAP = {
  sell: {
    residential: [
      "Flat/Apartment",
      "Independent House / Villa",
      "Builder Floor",
      "Plot / Land",
      "1 RK / Studio Apartment",
      "Serviced Apartment",
      "Farmhouse",
      "Other",
    ],
    commercial: [
      "Office",
      "Retail",
      "Plot / Land",
      "Storage",
      "Industry",
      "Hospitality",
      "Other",
    ],
  },
  rent: {
    residential: [
      "Flat/Apartment",
      "Independent House / Villa",
      "Builder Floor",
      "1 RK / Studio Apartment",
      "Serviced Apartment",
      "Farmhouse",
      "Other",
    ],
    commercial: [
      "Office",
      "Retail",
      "Plot / Land",
      "Storage",
      "Industry",
      "Hospitality",
      "Other",
    ],
  },
  pg: {
    residential: [
      "Flat/Apartment",
      "Independent House / Villa",
      "Builder Floor",
      "1 RK / Studio Apartment",
      "Serviced Apartment",
    ],
    commercial: [],
  },
};

const LOOKING_LABELS = {
  sell: "Sell",
  rent: "Rent / Lease",
  pg: "PG",
};

const SEGMENT_LABELS = {
  residential: "Residential",
  commercial: "Commercial",
};

export default function PostProperty({
  headingText = "Sell or Rent Property",
  mode = "post",
  pageType = "post",
  enablePgInResidential = true,
  showPgCommercialNotice = true,
  layoutVariant = "exact",
  compactHero = true,
  tightFormSpacing = true,
  laptopShiftRight = true,
  requireLoginForContact = true,
  inlineLoginOnPage = true,
  authDialogWidth = 445,
}) {
  const initialLookingTo =
    pageType === "sell" || mode === "sell" ? "sell" : pageType === "rent" || mode === "rent" ? "rent" : "sell";

  const [lookingTo, setLookingTo] = useState(initialLookingTo);
  const [segment, setSegment] = useState("residential");
  const [showAllPropertyTypes, setShowAllPropertyTypes] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState(false);

  const baseLookingOptions = enablePgInResidential
    ? LOOKING_OPTIONS
    : LOOKING_OPTIONS.filter((option) => option !== "pg");

  const visibleLookingOptions =
    segment === "commercial"
      ? baseLookingOptions.filter((option) => option !== "pg")
      : baseLookingOptions;

  const propertyTypes = useMemo(() => {
    return PROPERTY_TYPE_MAP[lookingTo]?.[segment] ?? [];
  }, [lookingTo, segment]);

  const isPgResidential = lookingTo === "pg" && segment === "residential";
  const visiblePropertyTypes =
    isPgResidential || showAllPropertyTypes
      ? propertyTypes
      : propertyTypes.slice(0, 4);
  const hiddenCount = isPgResidential ? 0 : Math.max(propertyTypes.length - 4, 0);
  const isPgCommercialBlocked = lookingTo === "pg";

  const handleLookingToChange = (nextLookingTo) => {
    setLookingTo(nextLookingTo);
    setSegment("residential");
    setShowAllPropertyTypes(false);
    setSelectedPropertyType("");
  };

  const handleSegmentChange = (nextSegment) => {
    setSegment(nextSegment);
    if (nextSegment === "commercial" && lookingTo === "pg") {
      setLookingTo("sell");
    }
    setShowAllPropertyTypes(false);
    setSelectedPropertyType("");
  };

  const hasAuthSession = () => {
    try {
      const token = getAuthToken();
      const user = getAuthUser();
      return Boolean(token && user && typeof user === "object");
    } catch (_error) {
      return false;
    }
  };

  useEffect(() => {
    const updateAuthState = () => {
      setIsBackendAuthenticated(hasAuthSession());
    };
    updateAuthState();
    window.addEventListener("storage", updateAuthState);
    window.addEventListener("auth-changed", updateAuthState);
    return () => {
      window.removeEventListener("storage", updateAuthState);
      window.removeEventListener("auth-changed", updateAuthState);
    };
  }, []);

  const navigateToLogin = () => {
    if (inlineLoginOnPage) {
      setIsLoginDialogOpen(true);
      return;
    }
    const redirectTo = `${window.location.pathname}${window.location.search || ""}`;
    window.location.href = `/?openLogin=1&redirectTo=${encodeURIComponent(redirectTo)}`;
  };

  const requireLoginOrProceed = () => {
    if (!requireLoginForContact) return true;
    if (hasAuthSession()) return true;
    navigateToLogin();
    return false;
  };

  if (isBackendAuthenticated) {
    return <PostPropertyBasicDetails pageType={pageType} hydrateFromDraft={false} />;
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#eef3f8",
        background: "#eef3f8",
        fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif',
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1300,
          height: { xs: 54, md: 54 },
          bgcolor: "#1065ad",
          px: { xs: 2, md: 4.5 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
          boxShadow: "0 1px 0 rgba(8, 48, 88, 0.18)",
        }}
      >
        <Typography sx={{ fontSize: { xs: 24, md: 34 }, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.6px" }}>
          99acres
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
          <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <AccountCircleOutlinedIcon sx={{ fontSize: 28 }} />
            <Box
              sx={{
                position: "absolute",
                top: 1,
                right: 1,
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#e3342f",
                border: "1px solid #0759a7",
              }}
            />
          </Box>
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
          <MenuRoundedIcon sx={{ ml: 0.8, fontSize: 26 }} />
        </Box>
      </Box>

      <Box sx={{ px: { xs: 1.5, md: 0 }, pt: { xs: 2, md: 0 }, pb: { xs: 1.5, md: 2.5 } }}>
        <Box
          sx={{
            maxWidth: 1365,
            mx: "auto",
            position: "relative",
            borderRadius: { xs: 2, md: "0 0 26px 26px" },
            overflow: "visible",
            background: "#e6edf5",
            minHeight: compactHero ? { xs: 600, md: 500 } : { xs: 620, md: 565 },
            px: { xs: 2, md: 4.6 },
            pt: compactHero ? { xs: 2.2, md: 2.4 } : { xs: 2.2, md: 3.2 },
            pb: compactHero ? { xs: 6.8, md: 3.2 } : { xs: 7.5, md: 4.2 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: layoutVariant === "exact" ? "1fr 336px" : "1fr 380px" },
              gap: { xs: 2.5, md: 2.1 },
              alignItems: "start",
            }}
          >
          <Box
            sx={{
              position: "relative",
              borderRadius: 0,
              overflow: "visible",
              minHeight: compactHero ? { xs: 430, md: 490 } : { xs: 460, md: 560 },
              background: "transparent",
              pl: { xs: 2, md: 0.6 },
              pr: { xs: 2, md: 1.2 },
              pt: compactHero ? { xs: 2.2, md: 1.0 } : { xs: 2.4, md: 1.3 },
              pb: compactHero ? { xs: 5.2, md: 5.2 } : { xs: 6, md: 6.6 },
            }}
          >
            <Box sx={{ pl: { xs: 0, md: 0.8 }, pt: { xs: 0, md: 0.6 }, position: "relative", zIndex: 2 }}>
              <Typography sx={{ fontSize: compactHero ? { xs: 25, md: 28 } : { xs: 25, md: 44 }, lineHeight: 1.12, fontWeight: 700, color: "#082246" }}>
                {headingText}
              </Typography>
              <Typography sx={{ fontSize: compactHero ? { xs: 25, md: 28 } : { xs: 25, md: 44 }, lineHeight: 1.12, fontWeight: 700, color: "#0f73cb" }}>
                online faster
                <Box component="span" sx={{ color: "#082246" }}>
                  {" "}with 99acres.com
                </Box>
              </Typography>

              <Stack spacing={0.75} sx={{ mt: 1.5 }}>
                {[
                  "Advertise for FREE",
                  "Get unlimited enquiries",
                  "Get shortlisted buyers and tenants *",
                  "Assistance in co-ordinating site visits *",
                ].map((line) => (
                  <Box key={line} sx={{ display: "flex", alignItems: "center", gap: 1.15, color: "#0d2747" }}>
                    <DoneRoundedIcon sx={{ fontSize: 16, color: "#26b14a", mt: "1px" }} />
                    <Typography sx={{ fontSize: 15, lineHeight: 1.2 }}>{line}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box
              component="img"
              src="https://static.99acres.com/universalapp/img/Desktop_Animation_compress.gif"
              alt="Post Property Illustration"
              height={"67%"}
              sx={{
                position: "absolute",
                right: laptopShiftRight ? { xs: -50, md: -30 } : { xs: -70, md: -56 },
                top: compactHero ? { xs: 145, md: 140 } : { xs: 150, md: 158 },
                width: compactHero ? { xs: 500, md: 700 } : { xs: 520, md: 765 },
                maxWidth: "none",
                opacity: 0.95,
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            <Typography
              sx={{
                position: "absolute",
                left: { xs: 18, md: 10 },
                bottom: { xs: 12, md: 8 },
                color: "#6f829b",
                fontSize: 12,
              }}
            >
              * Available with Owner Assist Plans
            </Typography>

          </Box>

          <Box
            sx={{
              bgcolor: "#ffffff",
              border: "1px solid #dbe2ea",
              borderRadius: "8px",
              p: "18px 18px 16px",
              boxShadow: "0 6px 16px rgba(10, 36, 67, 0.10)",
              position: "relative",
              zIndex: 2,
              minHeight: compactHero ? { md: 470 } : { md: 515 },
            }}
          >
            <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#102445", mb: 1.5, lineHeight: 1.3 }}>
              Start posting your property, it&apos;s free
            </Typography>

            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0f2e51", mb: 1.3 }}>Add Basic Details</Typography>

            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#102445", mb: 1 }}>You&apos;re looking to ...</Typography>
            <Box sx={{ display: "flex", gap: 0.8, mb: 1.8, flexWrap: "wrap" }}>
              {visibleLookingOptions.map((option) => {
                const isActive = lookingTo === option;

                return (
                  <Chip
                    key={option}
                    label={LOOKING_LABELS[option]}
                    color={isActive ? "primary" : "default"}
                    variant="outlined"
                    onClick={() => handleLookingToChange(option)}
                    sx={{
                      borderRadius: "15px",
                      height: tightFormSpacing ? 28 : 30,
                      cursor: "pointer",
                      fontSize: 12,
                      borderColor: isActive ? "#0f73cb" : undefined,
                      color: isActive ? "#0f73cb" : undefined,
                      "& .MuiChip-label": {
                        px: 1.05,
                      },
                    }}
                  />
                );
              })}
            </Box>

            <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#102445", mb: 0.6 }}>And it&apos;s a ...</Typography>
            <Box sx={{ display: "flex", gap: 1.45, mb: 0.8, alignItems: "center" }}>
              {SEGMENT_OPTIONS.map((option) => {
                const isActive = segment === option;
                const isDisabled = option === "commercial" && isPgCommercialBlocked;
                const showNotice =
                  isDisabled && showPgCommercialNotice
                    ? "Commercial properties cannot be posted for PG"
                    : "";

                return (
                  <Tooltip key={option} title={showNotice} arrow>
                    <Box
                      onClick={() => !isDisabled && handleSegmentChange(option)}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        opacity: isDisabled ? 0.65 : 1,
                      }}
                    >
                      <Radio
                        checked={isActive}
                        disabled={isDisabled}
                        size="small"
                        sx={{
                          p: 0.25,
                          color: isActive ? "#0f73cb" : "#98a5b5",
                          "&.Mui-checked": { color: "#0f73cb" },
                        }}
                      />
                      <Typography sx={{ fontSize: 15, color: isActive ? "#0f2e51" : "#425872" }}>
                        {SEGMENT_LABELS[option]}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.7, mb: 1.8 }}>
              {visiblePropertyTypes.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  variant="outlined"
                  onClick={() => setSelectedPropertyType(type)}
                  sx={{
                    borderRadius: "15px",
                    height: tightFormSpacing ? 28 : 30,
                    fontSize: 12,
                    cursor: "pointer",
                    borderColor: selectedPropertyType === type ? "#0f73cb" : undefined,
                    color: selectedPropertyType === type ? "#0f73cb" : undefined,
                    bgcolor: selectedPropertyType === type ? "#eff7ff" : undefined,
                    "& .MuiChip-label": {
                      px: 1.05,
                    },
                  }}
                />
              ))}
              {!showAllPropertyTypes && propertyTypes.length > 4 && !isPgResidential && (
                <Box
                  onClick={() => setShowAllPropertyTypes(true)}
                  sx={{
                    alignSelf: "center",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.2,
                    color: "#0f73cb",
                    cursor: "pointer",
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
                    {`${hiddenCount} more`}
                  </Typography>
                  <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 1.2 }} />

            <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#102445", mb: 0.8, lineHeight: 1.2 }}>
              Your contact details for the {lookingTo === "sell" ? "buyer" : "tenants"} to reach you
            </Typography>
            <TextField
              fullWidth
              placeholder="Phone Number"
              size="small"
              onFocus={() => {
                requireLoginOrProceed();
              }}
              onClick={() => {
                requireLoginOrProceed();
              }}
              sx={{
                mb: 0.55,
                "& .MuiInputBase-root": { bgcolor: "white", height: 38 },
                "& .MuiOutlinedInput-input": { fontSize: 13 },
              }}
            />
            <Typography sx={{ fontSize: 12, color: "#5a6c84", mb: 1.25 }}>
              Are you a registered user?{" "}
              <Box
                component="span"
                onClick={navigateToLogin}
                sx={{ color: "#0f73cb", fontWeight: 700, cursor: "pointer" }}
              >
                Login
              </Box>
            </Typography>

            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                requireLoginOrProceed();
              }}
              sx={{
                height: 42,
                fontSize: 18,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#0f73cb",
                borderRadius: "3px",
                boxShadow: "none",
                "&:hover": { bgcolor: "#0b65b4" },
              }}
            >
              Start now
            </Button>
          </Box>
        </Box>

          <Button
            variant="outlined"
            endIcon={<KeyboardArrowDownRoundedIcon />}
            sx={{
              position: "absolute",
              bottom: -17,
              left: "50%",
              transform: "translateX(-50%)",
              borderRadius: 20,
              px: 2,
              py: 0.35,
              bgcolor: "#ffffff",
              borderColor: "#d2dbe5",
              color: "#334b67",
              textTransform: "none",
              fontSize: 12,
              zIndex: 3,
              "&:hover": { borderColor: "#c5cfdb", bgcolor: "#ffffff" },
              display: "inline-flex",
            }}
          >
            Know More
          </Button>
        </Box>
      </Box>
      <PostOwnProperty mode={mode} />
      <Footer />
      <AuthDialog
        open={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        width={authDialogWidth}
      />
    </Box>
  );
}
