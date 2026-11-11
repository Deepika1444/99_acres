import {
  Box,
  InputBase,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Drawer,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { clearAuthSession, getAuthToken, getAuthUser, getUserInitials } from "../utils/authStorage";

export default function Navbar({ sticky = false, onLoginClick }) {
  const [accountMenuAnchor, setAccountMenuAnchor] = useState(null);
  const [contactMenuAnchor, setContactMenuAnchor] = useState(null);
  const [internationalMenuAnchor, setInternationalMenuAnchor] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuSection, setMobileMenuSection] = useState("root");
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isGetHelpOpen, setIsGetHelpOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const isAccountMenuOpen = Boolean(accountMenuAnchor);
  const isContactMenuOpen = Boolean(contactMenuAnchor);
  const isInternationalMenuOpen = Boolean(internationalMenuAnchor);
  const isLoggedIn = Boolean(authUser);

  const loadAuthUser = () => {
    try {
      const token = getAuthToken();
      const user = getAuthUser();
      console.log("user", token);
      console.log("token", user);
      if (!token || !user) {
        setAuthUser(null);
        return;
      }
      setAuthUser(user || null);
    } catch (_error) {
      setAuthUser(null);
    }
  };

  useEffect(() => {
    loadAuthUser();
    const handleStorage = () => loadAuthUser();
    const handleAuthChanged = () => loadAuthUser();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("auth-changed", handleAuthChanged);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("auth-changed", handleAuthChanged);
    };
  }, []);

  const handleOpenAccountMenu = (event) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleCloseAccountMenu = () => {
    setAccountMenuAnchor(null);
  };

  const handleOpenContactMenu = (event) => {
    setContactMenuAnchor(event.currentTarget);
  };

  const handleCloseContactMenu = () => {
    setContactMenuAnchor(null);
    setInternationalMenuAnchor(null);
  };

  const handleOpenInternationalMenu = (event) => {
    setInternationalMenuAnchor(event.currentTarget);
  };

  const handleCloseInternationalMenu = () => {
    setInternationalMenuAnchor(null);
  };

  const handleOpenMobileMenu = () => {
    setMobileMenuSection("root");
    setIsInsightsOpen(false);
    setIsGetHelpOpen(false);
    setIsMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setMobileMenuSection("root");
    setIsInsightsOpen(false);
    setIsGetHelpOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLoginRegisterClick = () => {
    handleCloseAccountMenu();
    handleCloseMobileMenu();
    if (onLoginClick) {
      onLoginClick();
    }
  };

  const handleLogoutClick = () => {
    clearAuthSession();
    setAuthUser(null);
    handleCloseAccountMenu();
    handleCloseMobileMenu();
    window.dispatchEvent(new Event("auth-changed"));
  };

  const handleNavigateAboutUs = () => {
    handleCloseMobileMenu();
    window.location.href = "/about-us";
  };

  const handleNavigatePostProperty = () => {
    handleCloseAccountMenu();
    handleCloseMobileMenu();
    [
      "postPropertyId",
      "previewPropertyId",
      "postPropertyEditMode",
      "postPropertyBasicDetails",
      "postPropertyLocationDetails",
      "postPropertyProfileDetails",
      "postPropertyMediaDetails",
      "postPropertyAmenitiesDetails",
    ].forEach((key) => localStorage.removeItem(key));
    window.location.href = "/post-property";
  };

  const getDisplayName = () => {
    const fullName = String(authUser?.fullName || authUser?.name || "").trim();
    if (fullName) return fullName;
    const username = String(authUser?.username || "").trim();
    if (username) return username;
    return String(authUser?.email || "").trim();
  };

  const getInitials = () => {
    return getUserInitials(authUser, "");
  };

  const accountMenu = (
    <Menu
      id="account-menu"
      anchorEl={accountMenuAnchor}
      open={isAccountMenuOpen}
      onClose={handleCloseAccountMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 1 }}
      slotProps={{
        paper: {
          sx: {
            width: 174,
            borderRadius: "8px",
            boxShadow: "0 12px 26px rgba(18, 43, 77, 0.2)",
            overflow: "hidden",
            "& .MuiMenu-list": {
              py: 1.2,
            },
          },
        },
      }}
    >
      {isLoggedIn ? (
        <MenuItem
          onClick={handleCloseAccountMenu}
          sx={{
            minHeight: "auto",
            pl: 2.8,
            pr: 2.2,
            py: 0.7,
            fontWeight: 700,
            color: "#1d2f49",
            fontSize: 11.5,
            lineHeight: 1.2,
          }}
        >
          {getDisplayName()}
        </MenuItem>
      ) : (
        <MenuItem
          onClick={handleLoginRegisterClick}
          sx={{
            minHeight: "auto",
            pl: 2.8,
            pr: 2.2,
            py: 0.7,
            fontWeight: 700,
            color: "#0078db",
            fontSize: 11.5,
            lineHeight: 1.2,
          }}
        >
          LOGIN / REGISTER
        </MenuItem>
      )}
      <MenuItem
        onClick={handleNavigatePostProperty}
        sx={{
          minHeight: "auto",
          pl: 2.8,
          pr: 2.2,
          py: 0.82,
          color: "#1d2f49",
          fontSize: 11.5,
          lineHeight: 1.2,
        }}
      >
        My Activity
      </MenuItem>
      <MenuItem
        onClick={() => {
          handleCloseAccountMenu();
          // window.location.href = "/post-property/shortlist-property";
        }}
        sx={{
          minHeight: "auto",
          pl: 4.1,
          pr: 2.2,
          py: 0.74,
          color: "#1d2f49",
          fontSize: 11.5,
          lineHeight: 1.2,
        }}
      >
        Recently Searched
      </MenuItem>
      <MenuItem
        onClick={handleCloseAccountMenu}
        sx={{
          minHeight: "auto",
          pl: 4.1,
          pr: 2.2,
          py: 0.74,
          color: "#1d2f49",
          fontSize: 11.5,
          lineHeight: 1.2,
        }}
      >
        Recently Viewed
      </MenuItem>
      <MenuItem
        onClick={handleCloseAccountMenu}
        sx={{
          minHeight: "auto",
          pl: 4.1,
          pr: 2.2,
          py: 0.74,
          color: "#1d2f49",
          fontSize: 11.5,
          lineHeight: 1.2,
        }}
      >
        Shortlisted
      </MenuItem>
      <MenuItem
        onClick={handleCloseAccountMenu}
        sx={{
          minHeight: "auto",
          pl: 4.1,
          pr: 2.2,
          py: 0.74,
          color: "#1d2f49",
          fontSize: 11.5,
          lineHeight: 1.2,
        }}
      >
        Contacted
      </MenuItem>
      <MenuItem
        onClick={handleNavigatePostProperty}
        sx={{
          minHeight: "auto",
          pl: 2.8,
          pr: 2.2,
          py: 0.86,
        }}
      >
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.7, color: "#1d2f49", fontSize: 11.5, lineHeight: 1.2 }}>
          <Box component="span">Post Property</Box>
          <Box
            component="span"
            sx={{
              px: 0.42,
              borderRadius: "2px",
              bgcolor: "#1eb35f",
              color: "white",
              fontSize: 8.5,
              fontWeight: 700,
              lineHeight: 1.35,
            }}
          >
            FREE
          </Box>
        </Box>
      </MenuItem>
      {isLoggedIn && (
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            minHeight: "auto",
            pl: 2.8,
            pr: 2.2,
            py: 0.86,
            color: "#c53a45",
            fontWeight: 700,
            fontSize: 11.5,
            lineHeight: 1.2,
          }}
        >
          Logout
        </MenuItem>
      )}
    </Menu>
  );

  const contactMenu = (
    <Menu
      id="contact-menu"
      anchorEl={contactMenuAnchor}
      open={isContactMenuOpen}
      onClose={handleCloseContactMenu}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ mt: 0.6 }}
      slotProps={{
        paper: {
          sx: {
            width: 252,
            borderRadius: "8px",
            boxShadow: "0 12px 26px rgba(18, 43, 77, 0.2)",
            overflow: "hidden",
            "& .MuiMenu-list": {
              p: 0,
            },
          },
        },
      }}
    >
      <Box sx={{ px: "20px", pt: "18px", pb: "16px" }}>
        <Typography sx={{ fontSize: "17px", fontWeight: 700, color: "#172c48", lineHeight: "22px" }}>
          CONTACT US
        </Typography>

        <Box sx={{ display: "flex", alignItems: "flex-start", mt: "14px", gap: "12px" }}>
          <CallRoundedIcon sx={{ fontSize: "15px", color: "#364b69", mt: "2px" }} />
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#7f8ca3", lineHeight: "14px", maxWidth: "165px" }}>
              Toll Free | 9:30 AM to 6:30 PM (Mon-Sun)
            </Typography>
            <Typography sx={{ fontSize: "15px", color: "#2e4569", fontWeight: 700, lineHeight: "19px", mt: "2px", whiteSpace: "nowrap" }}>
              1800-41-99099
            </Typography>
          </Box>
        </Box>

        <Box
          onClick={handleOpenInternationalMenu}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            mt: "8px",
            gap: "12px",
            cursor: "pointer",
            borderRadius: "4px",
            mr: "-4px",
            px: "4px",
            py: "2px",
            "&:hover": { bgcolor: "#f4f7fb" },
          }}
          aria-controls={isInternationalMenuOpen ? "international-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isInternationalMenuOpen ? "true" : undefined}
        >
          <CallRoundedIcon sx={{ fontSize: "15px", color: "#364b69", mt: "2px" }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "11px", color: "#7f8ca3", lineHeight: "14px" }}>
              For International Users
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
              <Typography sx={{ fontSize: "15px", color: "#2e4569", fontWeight: 700, lineHeight: "19px", mt: "2px", whiteSpace: "nowrap" }}>
                +91-120-6637501
              </Typography>
              <ChevronRightRoundedIcon sx={{ color: "#4d5f78", fontSize: "14px", mt: "3px", flexShrink: 0 }} />
            </Box>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          sx={{
            mt: "14px",
            height: "36px",
            textTransform: "none",
            borderColor: "#0f74cf",
            color: "#0f74cf",
            fontWeight: 700,
            fontSize: "13px",
            lineHeight: "16px",
            borderRadius: "3px",
            px: 0,
            "&:hover": {
              borderColor: "#0f69be",
              bgcolor: "#f7fbff",
            },
          }}
          startIcon={<CallRoundedIcon sx={{ fontSize: "14px" }} />}
        >
          Request a Call Back
        </Button>

        <Typography sx={{ mt: "10px", fontSize: "11px", color: "#223b58", lineHeight: "14px" }}>
          To check all the FAQ{" "}
          <Box component="span" sx={{ color: "#0f73cb", cursor: "pointer", fontSize: "11px", lineHeight: "14px" }}>
            click here
          </Box>
        </Typography>
      </Box>
    </Menu>
  );

  const internationalMenu = (
    <Menu
      id="international-menu"
      anchorEl={internationalMenuAnchor}
      open={isInternationalMenuOpen}
      onClose={handleCloseInternationalMenu}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
      sx={{ ml: 0.7, mt: -0.5 }}
      slotProps={{
        paper: {
          sx: {
            width: 206,
            borderRadius: "8px",
            boxShadow: "0 12px 26px rgba(18, 43, 77, 0.2)",
            overflow: "hidden",
            "& .MuiMenu-list": {
              p: 0,
            },
          },
        },
      }}
    >
      <Box sx={{ px: "18px", pt: "14px", pb: "14px" }}>
        <Typography sx={{ fontSize: "11px", fontWeight: 700, color: "#7a879b", lineHeight: "14px", mb: "8px" }}>
          INTERNATIONAL NUMBERS
        </Typography>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px", py: "4px" }}>
          <CallRoundedIcon sx={{ fontSize: "14px", color: "#364b69", mt: "2px" }} />
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#7f8ca3", lineHeight: "14px" }}>United Arab Emirates</Typography>
            <Typography sx={{ fontSize: "15px", color: "#2e4569", fontWeight: 700, lineHeight: "19px", mt: "2px" }}>
              8000 18 2956
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px", py: "4px" }}>
          <CallRoundedIcon sx={{ fontSize: "14px", color: "#364b69", mt: "2px" }} />
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#7f8ca3", lineHeight: "14px" }}>United States of America</Typography>
            <Typography sx={{ fontSize: "15px", color: "#2e4569", fontWeight: 700, lineHeight: "19px", mt: "2px" }}>
              1833 703-9807
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px", py: "4px" }}>
          <CallRoundedIcon sx={{ fontSize: "14px", color: "#364b69", mt: "2px" }} />
          <Box>
            <Typography sx={{ fontSize: "11px", color: "#7f8ca3", lineHeight: "14px" }}>United Kingdom</Typography>
            <Typography sx={{ fontSize: "15px", color: "#2e4569", fontWeight: 700, lineHeight: "19px", mt: "2px" }}>
              8000 48 9253
            </Typography>
          </Box>
        </Box>
      </Box>
    </Menu>
  );

  const mobileMenuDrawer = (
    <Drawer
      anchor="right"
      open={isMobileMenuOpen}
      onClose={handleCloseMobileMenu}
      PaperProps={{
        sx: {
          width: { xs: "92vw", sm: 312 },
          bgcolor: "#f6f7fa",
          fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif',
          borderTopLeftRadius: "4px",
          borderBottomLeftRadius: "4px",
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box
            sx={{
              height: 44,
              px: 1.5,
              bgcolor: "#eff1f5",
              borderBottom: "1px solid #d6dbe4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            onClick={handleLoginRegisterClick}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.7,
              color: "#0c6cc0",
              cursor: "pointer",
              minWidth: 0,
            }}
          >
            <AccountCircleRoundedIcon sx={{ fontSize: 19, color: "#4b5e7a" }} />
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1.2,
                maxWidth: 220,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              LOGIN / REGISTER
            </Typography>
          </Box>
          <IconButton onClick={handleCloseMobileMenu} sx={{ p: 0.25, color: "#435670" }}>
            <CloseRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
            {mobileMenuSection === "root" ? (
            <>
              <Box sx={{ p: 1.4, pb: 1.05 }}>
                <Box
                  sx={{
                    borderRadius: "8px",
                    background: "linear-gradient(90deg, #d2e7dc 0%, #c6dfd3 56%, #bdd9cb 100%)",
                    minHeight: 126,
                    px: 1.35,
                    py: 1.2,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Typography sx={{ color: "#0e2748", fontWeight: 800, fontSize: 16.5, lineHeight: 1.22, maxWidth: 170 }}>
                    Sell or rent faster at the right price!
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleNavigatePostProperty}
                    sx={{
                      mt: 1.05,
                      height: 34,
                      minWidth: 132,
                      textTransform: "none",
                      borderRadius: "5px",
                      boxShadow: "none",
                      bgcolor: "#0f7ad7",
                      fontWeight: 800,
                      fontSize: 14,
                      "&:hover": { bgcolor: "#0c6cc0", boxShadow: "none" },
                    }}
                  >
                    Post Property
                  </Button>
                  <Box
                    component="img"
                    src="https://www.99acres.com/universalapp/img/hp_ppf_banner.png"
                    alt="Agent"
                    sx={{
                      position: "absolute",
                      right: -4,
                      bottom: -2,
                      width: 92,
                      height: 118,
                      objectFit: "contain",
                      pointerEvents: "none",
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              <Box sx={{ px: 1.8, py: 1.45 }}>
                <Typography sx={{ color: "#172e4d", fontSize: 14.5, fontWeight: 500, lineHeight: 1.2 }}>
                  Explore our Services
                </Typography>
              </Box>
              <Divider />

              {["For Buyers", "For Tenants", "For Owners", "For Dealers / Builders"].map((item) => (
                <Box
                  key={item}
                  onClick={
                    item === "For Buyers"
                      ? () => setMobileMenuSection("buyers")
                      : item === "For Tenants"
                        ? () => setMobileMenuSection("tenants")
                        : item === "For Owners"
                          ? () => setMobileMenuSection("owners")
                          : item === "For Dealers / Builders"
                            ? () => setMobileMenuSection("dealers")
                          : undefined
                  }
                  sx={{
                    px: 1.7,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.95,
                    color: "#1a2f4b",
                    cursor:
                      item === "For Buyers" ||
                      item === "For Tenants" ||
                      item === "For Owners" ||
                      item === "For Dealers / Builders"
                        ? "pointer"
                        : "default",
                  }}
                >
                  <KeyboardArrowRightRoundedIcon sx={{ fontSize: 12, color: "#8b99ad" }} />
                  <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>{item}</Typography>
                </Box>
              ))}

              <Divider sx={{ mt: 0.2 }} />

              <Box
                sx={{
                  px: 1.7,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.95,
                  color: "#1a2f4b",
                }}
              >
                <KeyboardArrowRightRoundedIcon sx={{ fontSize: 12, color: "transparent" }} />
                <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>Home Loans</Typography>
              </Box>

              <Box
                onClick={() => setIsInsightsOpen((prev) => !prev)}
                sx={{
                  px: 1.7,
                  height: 34,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  color: "#1a2f4b",
                  cursor: "pointer",
                }}
              >
                <KeyboardArrowDownRoundedIcon
                  sx={{
                    fontSize: 13,
                    color: "#8b99ad",
                    transform: isInsightsOpen ? "rotate(180deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s ease",
                  }}
                />
                <Typography sx={{ fontSize: 14, lineHeight: 1.15, display: "inline-flex", alignItems: "center", gap: 0.65 }}>
                  Insights
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 13,
                      px: 0.5,
                      borderRadius: "2px",
                      bgcolor: "#0f7ad7",
                      color: "white",
                      fontSize: 8,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    NEW
                  </Box>
                </Typography>
              </Box>

              {isInsightsOpen && (
                <Box sx={{ mt: 0.45, pl: 3.35, pr: 1.6, pb: 0.5 }}>
                  {[
                    "Property Rates in Bangalore East",
                    "Builders in India",
                    "Real estate market research reports",
                    "Policies (GST, RERA, PMAY, Budget)",
                    "Area Converter Tool",
                    "Rent Receipt Generator",
                  ].map((insightItem) => (
                    <Box
                      key={insightItem}
                      sx={{
                        py: 0.57,
                        px: 0,
                      }}
                    >
                      <Typography sx={{ color: "#1a2f4b", fontSize: 13, lineHeight: 1.12 }}>
                        {insightItem}
                      </Typography>
                    </Box>
                  ))}
                  <Typography sx={{ py: 0.58, color: "#0f7ad7", fontSize: 14, fontWeight: 700, lineHeight: 1.12 }}>
                    View All Insights
                  </Typography>
                </Box>
              )}

              <Box
                onClick={() => setMobileMenuSection("articlesNews")}
                sx={{
                  px: 1.7,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.95,
                  color: "#1a2f4b",
                  cursor: "pointer",
                }}
              >
                <KeyboardArrowRightRoundedIcon sx={{ fontSize: 12, color: "#8b99ad" }} />
                <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>Articles & News</Typography>
              </Box>

              <Divider sx={{ mt: 0.2 }} />

              <Box
                onClick={handleNavigateAboutUs}
                sx={{
                  px: 1.7,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.95,
                  color: "#1a2f4b",
                  cursor: "pointer",
                }}
              >
                <KeyboardArrowRightRoundedIcon sx={{ fontSize: 12, color: "transparent" }} />
                <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>About Us</Typography>
              </Box>

              <Box
                onClick={() => setIsGetHelpOpen((prev) => !prev)}
                sx={{
                  px: 1.7,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.95,
                  color: "#1a2f4b",
                  bgcolor: "#eef0f4",
                  cursor: "pointer",
                }}
              >
                <KeyboardArrowDownRoundedIcon
                  sx={{
                    fontSize: 13,
                    color: "#8b99ad",
                    transform: isGetHelpOpen ? "rotate(180deg)" : "rotate(-90deg)",
                    transition: "transform 0.15s ease",
                  }}
                />
                <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>Get Help</Typography>
              </Box>

              {isGetHelpOpen && (
                <Box sx={{ pl: 3.35, pr: 1.7, py: 0.35, bgcolor: "#f6f7fa" }}>
                  <Typography sx={{ fontSize: 13.5, lineHeight: 1.2, color: "#1a2f4b", py: 0.45 }}>
                    Customer Services & FAQs
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  px: 1.7,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.95,
                  color: "#1a2f4b",
                }}
              >
                <KeyboardArrowRightRoundedIcon sx={{ fontSize: 12, color: "transparent" }} />
                <Typography sx={{ fontSize: 14, lineHeight: 1.2 }}>Download App</Typography>
              </Box>

              <Divider sx={{ mt: 0.2 }} />
            </>
          ) : (
            <>
              <Box sx={{ px: 1.7, py: 1.25, display: "flex", alignItems: "center", gap: 1.1, color: "#132d4f" }}>
                <IconButton onClick={() => setMobileMenuSection("root")} sx={{ p: 0.15, color: "#2f4869" }}>
                  <ArrowBackRoundedIcon sx={{ fontSize: 22 }} />
                </IconButton>
                <Typography sx={{ fontSize: 31 / 2.0, fontWeight: 700 }}>
                  {mobileMenuSection === "tenants"
                    ? "For Tenants"
                    : mobileMenuSection === "owners"
                      ? "For Owners"
                      : mobileMenuSection === "dealers"
                        ? "For Dealers / Builders"
                        : mobileMenuSection === "articlesNews"
                          ? "Articles & News"
                        : "For Buyers"}
                </Typography>
              </Box>

              {(mobileMenuSection === "articlesNews"
                ? ["Real Estate Articles", "Latest News", "User Guides", "View All Insights"]
                : mobileMenuSection === "dealers"
                ? ["Property Services"]
                : mobileMenuSection === "owners"
                  ? ["Post Property", "Owner Services", "Insights", "Articles & News"]
                : mobileMenuSection === "tenants"
                  ? [
                      "Rent a Home in Bangalore East",
                      "PG/Co-living in Bangalore East",
                      "Commercial in Bangalore East",
                      "Top Areas for Residential",
                      "Top Areas for Commercial",
                      "Insights",
                      "Articles & News",
                    ]
                  : [
                      "Buy a Home in Bangalore East",
                      "Commercial in Bangalore East",
                      "Top Areas for Residential",
                      "Top Areas for Commercial",
                      "Insights",
                      "Articles & News",
                    ]
              ).map((item) => (
                <Box
                  key={item}
                  onClick={
                    item === "Post Property"
                      ? handleNavigatePostProperty
                      : item === "Articles & News"
                        ? () => setMobileMenuSection("articlesNews")
                        : undefined
                  }
                  sx={{
                    px: 1.7,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.95,
                    color: "#1a2f4b",
                    cursor: item === "Post Property" || item === "Articles & News" ? "pointer" : "default",
                  }}
                >
                  <KeyboardArrowRightRoundedIcon
                    sx={{
                      fontSize: 12,
                      color:
                        (mobileMenuSection === "owners" && (item === "Post Property" || item === "Owner Services")) ||
                        mobileMenuSection === "dealers" ||
                        (mobileMenuSection === "articlesNews" &&
                          (item === "Real Estate Articles" || item === "Latest News" || item === "View All Insights"))
                          ? "transparent"
                          : "#8b99ad",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.2,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.8,
                      color: mobileMenuSection === "articlesNews" && item === "View All Insights" ? "#0f7ad7" : "#1a2f4b",
                      fontWeight: mobileMenuSection === "articlesNews" && item === "View All Insights" ? 700 : 400,
                    }}
                  >
                    {item}
                    {mobileMenuSection === "owners" && item === "Post Property" && (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 14,
                          px: 0.55,
                          borderRadius: "2px",
                          bgcolor: "#1eb35f",
                          color: "white",
                          fontSize: 8,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        FREE
                      </Box>
                    )}
                    {item === "Insights" && mobileMenuSection !== "articlesNews" && (
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: 14,
                          px: 0.55,
                          borderRadius: "2px",
                          bgcolor: "#0f7ad7",
                          color: "white",
                          fontSize: 8,
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        NEW
                      </Box>
                    )}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ mt: 0.2 }} />
            </>
          )}
          </Box>

          <Box sx={{ p: 1.1, borderTop: "1px solid #d7dce6", bgcolor: "#f6f7fa" }}>
            <Box
              sx={{
                height: 40,
                bgcolor: "#eef1f6",
                borderRadius: "2px",
                px: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#8998ad",
              }}
            >
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.15 }}>Search by Property Code</Typography>
              <SearchRoundedIcon sx={{ fontSize: 20 }} />
            </Box>

            <Typography sx={{ mt: 0.95, color: "#1b3251", fontSize: 11.5, lineHeight: 1.15 }}>
              Toll Free Number: 1800 41 99099.
            </Typography>
            <Typography sx={{ mt: 0.15, color: "#1b3251", fontSize: 11.5, lineHeight: 1.15 }}>
              For international numbers{" "}
              <Box component="span" sx={{ color: "#0f65bd", fontWeight: 700 }}>
                click here
              </Box>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );

  if (sticky) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: { xs: 56, md: 54 },
          bgcolor: "#005ca8",
          display: "flex",
          alignItems: "center",
          zIndex: 1300,
          px: { xs: 1.2, md: 1.8 },
          boxShadow: "0 2px 10px rgba(6, 23, 42, 0.26)",
        }}
      >
        <Typography sx={{ color: "white", fontSize: { xs: 16, md: 27 }, fontWeight: 600, mr: 2.4, lineHeight: 1 }}>
          99acres
        </Typography>

        <Typography
          sx={{
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            display: { xs: "none", md: "inline-flex" },
            alignItems: "center",
            mr: 2.1,
            whiteSpace: "nowrap",
          }}
        >
          Buy in Bangalore East <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
        </Typography>

        <Box
          sx={{
            bgcolor: "white",
            borderRadius: "3px",
            height: 40,
            flex: 1,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              height: "100%",
              px: 1,
              minWidth: 62,
              display: { xs: "none", md: "inline-flex" },
              alignItems: "center",
              borderRight: "1px solid #d5dde8",
              color: "#1f2f49",
              fontSize: 10,
              fontWeight: 500,
            }}
          >
            Buy <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
          <InputBase
            placeholder="Enter Locality / Project / Society / Landmark"
            sx={{
              flex: 1,
              px: 1.25,
              fontSize: 14,
              color: "#243a58",
              "& .MuiInputBase-input::placeholder": {
                color: "#5e6f86",
                opacity: 1,
              },
              minWidth: 0,
            }}
          />
          <IconButton
            sx={{
              color: "#1f8be4",
              width: 26,
              height: 26,
              mr: 0.35,
              bgcolor: "#edf4fb",
              "&:hover": { bgcolor: "#e4eef8" },
            }}
          >
            <MyLocationRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <IconButton
            sx={{
              color: "#1f8be4",
              width: 26,
              height: 26,
              mr: 0.5,
              bgcolor: "#edf4fb",
              "&:hover": { bgcolor: "#e4eef8" },
            }}
          >
            <MicNoneRoundedIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <Box sx={{ width: 1, height: 24, bgcolor: "#dce3ed", mr: 0.4 }} />
          <IconButton sx={{ color: "#263a57", width: 30, height: 30, mr: 0.4 }}>
            <SearchRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          onClick={handleNavigatePostProperty}
          sx={{
            ml: 1.6,
            bgcolor: "white",
            color: "#132643",
            borderRadius: "7px",
            px: { xs: 0.95, md: 1.35 },
            py: 0.38,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 12.5,
            boxShadow: "none",
            minWidth: "fit-content",
            "&:hover": { bgcolor: "#eef4fb", boxShadow: "none" },
          }}
        >
          Post property
          <Box
            component="span"
            sx={{
              ml: 0.55,
              px: 0.38,
              borderRadius: "2px",
              fontSize: 7.5,
              lineHeight: 1.35,
              bgcolor: "#1eb35f",
              color: "white",
              fontWeight: 700,
            }}
          >
            FREE
          </Box>
        </Button>

        <IconButton
          onClick={handleOpenContactMenu}
          sx={{
            ml: 0.8,
            display: { xs: "none", md: "inline-flex" },
            color: "white",
          }}
          aria-controls={isContactMenuOpen ? "contact-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isContactMenuOpen ? "true" : undefined}
        >
          <CallRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          onClick={handleOpenAccountMenu}
          sx={{ color: "white", display: "inline-flex" }}
          aria-controls={isAccountMenuOpen ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isAccountMenuOpen ? "true" : undefined}
        >
          {isLoggedIn ? (
            <Box
              sx={{
                width: 25,
                height: 25,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.7)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                color: "white",
                letterSpacing: 0.2,
              }}
            >
              {getInitials()}
            </Box>
          ) : (
            <AccountCircleOutlinedIcon />
          )}
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton onClick={handleOpenMobileMenu} sx={{ color: "white" }}>
          <MenuRoundedIcon />
        </IconButton>
        {accountMenu}
        {contactMenu}
        {internationalMenu}
        {mobileMenuDrawer}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: 14, md: 18 },
        left: { xs: 16, md: 26 },
        right: { xs: 16, md: 26 },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 20,
        gap: 2,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Typography
          sx={{
            fontSize: { xs: 14, md: 28 },
            lineHeight: 1,
            fontWeight: 550,
            color: "white",
            letterSpacing: "-1px",
          }}
        >
          99acres
        </Typography>
        <Typography
          sx={{
            display: { xs: "none", md: "inline-flex" },
            color: "#f4f4f4",
            fontWeight: 700,
            fontSize: 14,
            alignItems: "center",
            gap: 0.3,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          Buy in Bangalore East
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 22 }} />
        </Typography>
      </Stack>

      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          gap: 4,
          color: "white",
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
          For Buyers
        </Typography>
        <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
          For Tenants
        </Typography>
        <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
          For Owners
        </Typography>
        <Typography sx={{ fontSize: "inherit", fontWeight: "inherit" }}>
          For Dealers / Builders
        </Typography>
        <Typography
          sx={{
            fontSize: "inherit",
            fontWeight: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Insights
          <Chip
            label="NEW"
            size="small"
            sx={{
              height: 18,
              borderRadius: "4px",
              fontSize: 10,
              fontWeight: 700,
              color: "white",
              bgcolor: "#f15d77",
              "& .MuiChip-label": { px: 0.8 },
            }}
          />
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.8, md: 1.4 } }}>
        <Button
          variant="contained"
          onClick={handleNavigatePostProperty}
          sx={{
            bgcolor: "white",
            color: "#152238",
            borderRadius: "12px",
            px: { xs: 1.8, md: 2.4 },
            py: { xs: 0.8, md: 1.1 },
            textTransform: "none",
            fontWeight: 700,
            fontSize: { xs: 13, md: 14 },
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            minWidth: "fit-content",
            "&:hover": { bgcolor: "#f5f6fa" },
          }}
        >
          Post Property
          <Box
            component="span"
            sx={{
              ml: 1,
              px: 0.6,
              borderRadius: "3px",
              fontSize: 13,
              bgcolor: "#1eb35f",
              color: "white",
              lineHeight: 1.4,
            }}
          >
            FREE
          </Box>
        </Button>

        <IconButton
          onClick={handleOpenContactMenu}
          sx={{
            display: { xs: "none", md: "inline-flex" },
            color: "white",
          }}
          aria-controls={isContactMenuOpen ? "contact-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isContactMenuOpen ? "true" : undefined}
        >
          <CallRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          onClick={handleOpenAccountMenu}
          sx={{ color: "white", display: "inline-flex" }}
          aria-controls={isAccountMenuOpen ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={isAccountMenuOpen ? "true" : undefined}
        >
          {isLoggedIn ? (
            <Box
              sx={{
                width: 27,
                height: 27,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.7)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11.5,
                fontWeight: 800,
                color: "white",
                letterSpacing: 0.2,
              }}
            >
              {getInitials()}
            </Box>
          ) : (
            <AccountCircleOutlinedIcon />
          )}
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton onClick={handleOpenMobileMenu} sx={{ color: "white" }}>
          <MenuRoundedIcon />
        </IconButton>
        {accountMenu}
        {contactMenu}
        {internationalMenu}
        {mobileMenuDrawer}
      </Box>
    </Box>
  );
}
