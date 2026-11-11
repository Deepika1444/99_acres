import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Drawer, IconButton, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import Navbar from "../components/Navbar";
import { getAuthToken, getAuthUser } from "../utils/authStorage";

const SUBTYPE_LABELS = {
  flat_apartment: "Residential Flat/Apartment",
  independent_house_villa: "Independent House / Villa",
  independent_builder_floor: "Builder Floor",
  plot_land: "Plot / Land",
  studio_apartment: "1 RK / Studio Apartment",
  serviced_apartment: "Serviced Apartment",
  farmhouse: "Farmhouse",
  office: "Office",
  retail: "Retail",
  commercial_land: "Commercial Plot / Land",
  warehouse_godown: "Warehouse / Godown",
  industrial_shed: "Industrial Shed",
  other: "Property",
};

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function formatPrice(value) {
  const amount = Number(value || 0);
  if (!Number.isFinite(amount) || amount <= 0) return "Price on request";
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

function pickFirst(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
}

function getPropertyIdFromSearch() {
  if (typeof window === "undefined") return "";
  return String(new URLSearchParams(window.location.search || "").get("propertyId") || "").trim();
}

function getPropertyIdFromLocation() {
  return String(
    getPropertyIdFromSearch() ||
    getPropertyIdFromPathname() ||
    localStorage.getItem("postPropertyId") ||
    ""
  ).trim();
}

function normalizeProperty(source) {
  const basicFromStorage = readJson("postPropertyBasicDetails");
  const locationFromStorage = readJson("postPropertyLocationDetails");

  const location = source?.locationDetails || source?.location || {};
  const basic = source?.basicDetails || source?.basic || {};
  const pricing = source?.pricingDetails || source?.pricing || {};
  const priceDetails = pricing?.priceDetails || source?.priceDetails || {};

  const propertySubType = String(
    pickFirst(basic?.propertySubType, source?.propertySubType, basicFromStorage?.propertySubType)
  ).trim();

  const title = `Sell ${SUBTYPE_LABELS[propertySubType] || "Property"}`;
  const city = String(pickFirst(location?.city, source?.city, locationFromStorage?.city)).trim();
  const locality = String(pickFirst(location?.locality, source?.locality, locationFromStorage?.locality)).trim();
  const subLocality = String(
    pickFirst(location?.subLocality, source?.subLocality, locationFromStorage?.subLocality)
  ).trim();
  const locationText = [subLocality, locality, city].filter(Boolean).join(", ") || "Location not available";

  const expectedPrice = pickFirst(
    priceDetails?.expectedPrice,
    source?.expectedPrice,
    source?.expectedRent,
    source?.price
  );

  return {
    propertyId: String(pickFirst(source?.propertyId, source?._id, getPropertyIdFromLocation())).trim(),
    title,
    locationText,
    priceText: formatPrice(expectedPrice),
  };
}

function isMongoObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value || "").trim());
}

function getPropertyIdFromPathname() {
  if (typeof window === "undefined") return "";

  const segments = String(window.location.pathname || "")
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  for (let index = segments.length - 1; index >= 0; index -= 1) {
    if (isMongoObjectId(segments[index])) {
      return segments[index];
    }
  }

  return "";
}

function loadRazorpayCheckoutScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay can only be opened in the browser."));
  }

  if (window.Razorpay) {
    return Promise.resolve(window.Razorpay);
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');

    if (existingScript) {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      existingScript.addEventListener("load", () => resolve(window.Razorpay), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });
}

export default function PostPropertyThankYou() {
  const [property, setProperty] = useState(() => normalizeProperty({}));
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [isPaymentStarting, setIsPaymentStarting] = useState(false);

  useEffect(() => {
    loadRazorpayCheckoutScript().catch(() => {
      // Show the actual error only when the user clicks the payment CTA.
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      const token = localStorage.getItem("authToken");
      const propertyId = getPropertyIdFromLocation();
      if (!propertyId) {
        setProperty(normalizeProperty({}));
        setIsLoading(false);
        return;
      }
      if (!token) {
        setProperty((previous) => ({ ...previous, propertyId }));
        setIsLoading(false);
        return;
      }
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const candidatePaths = [
        `/api/properties/${encodeURIComponent(propertyId)}`,
        `/api/properties/details/${encodeURIComponent(propertyId)}`,
        `/api/properties/location-details/${encodeURIComponent(propertyId)}`,
        `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
      ];
      let lastError = "";
      for (const path of candidatePaths) {
        try {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) {
            lastError = result?.message || `Failed to load details from ${path}`;
            continue;
          }
          const payload = result?.data || result?.property || result || {};
          if (!payload || typeof payload !== "object") continue;
          if (!isCancelled) {
            setProperty(normalizeProperty(payload));
            setErrorMessage("");
          }
          setIsLoading(false);
          return;
        } catch {
          lastError = `Unable to load details from ${path}`;
        }
      }
      if (!isCancelled) {
        setProperty(normalizeProperty({}));
        const fallbackPropertyId = getPropertyIdFromLocation();
        if (fallbackPropertyId) {
          setProperty((previous) => ({
            ...previous,
            propertyId: fallbackPropertyId,
          }));
        }
        setErrorMessage(lastError || "Could not load posted property details from DB.");
        setIsLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, []);

  const propertyIdText = useMemo(() => {
    if (!property.propertyId) return "Property ID not available";
    return `Property ID: ${property.propertyId}`;
  }, [property.propertyId]);

  const planBaseAmount = useMemo(() => {
    const amount = Number(String(property.priceText || "").replace(/[^\d]/g, "")) || 2039;
    if (amount <= 0) return 6459;
    if (amount < 100000) return 6459;
    if (amount < 5000000) return 7622;
    return 9843;
  }, [property.priceText]);

  const gstAmount = useMemo(() => Math.round(planBaseAmount * 0.18), [planBaseAmount]);
  const totalAmount = planBaseAmount + gstAmount;
  const authUser = useMemo(() => getAuthUser() || {}, []);

  const handleProceedToPurchase = async () => {
    const token = getAuthToken();
    const propertyId = String(property.propertyId || getPropertyIdFromLocation()).trim();
    const rawUserId = String(authUser?._id || authUser?.id || authUser?.userId || "").trim();
    const userId = isMongoObjectId(rawUserId) ? rawUserId : "";
    const fullName = String(authUser?.fullName || authUser?.name || "").trim();
    const email = String(authUser?.email || "").trim();
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

    if (!isMongoObjectId(propertyId)) {
      setPaymentSuccess("");
      setPaymentError("Property ID is missing. Reload the page and try again.");
      return;
    }

    try {
      setIsPaymentStarting(true);
      setPaymentError("");
      setPaymentSuccess("");

      const RazorpayCheckout = await loadRazorpayCheckoutScript();

      if (!RazorpayCheckout) {
        throw new Error("Razorpay checkout is not available.");
      }

      const createOrderResponse = await fetch(`${apiBaseUrl}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
          userId: userId || undefined,
          propertyId,
          notes: {
            planName: "Advanced Plus",
            duration: "4 Months",
            source: "post-property-thank-you",
          },
        }),
      });

      const createOrderResult = await createOrderResponse.json().catch(() => ({}));

      if (!createOrderResponse.ok) {
        throw new Error(createOrderResult?.message || "Unable to create Razorpay order.");
      }

      const order = createOrderResult?.data || {};

      const razorpay = new RazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        order_id: order.orderId,
        name: "99acres Clone",
        description: "Advanced Plus plan purchase",
        handler: async (paymentResponse) => {
          try {
            const verifyResponse = await fetch(`${apiBaseUrl}/api/payments/verify`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify(paymentResponse),
            });

            const verifyResult = await verifyResponse.json().catch(() => ({}));

            if (!verifyResponse.ok) {
              throw new Error(verifyResult?.message || "Payment verification failed.");
            }

            setPaymentError("");
            setPaymentSuccess("Payment completed successfully.");
            setIsCartOpen(false);
          } catch (verifyError) {
            setPaymentSuccess("");
            setPaymentError(verifyError.message || "Payment verification failed.");
          } finally {
            setIsPaymentStarting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaymentStarting(false);
          },
        },
        prefill: {
          name: fullName,
          email,
        },
        notes: order.notes || {},
        theme: {
          color: "#0f5fad",
        },
      });

      razorpay.open();
    } catch (paymentStartError) {
      setPaymentSuccess("");
      setPaymentError(paymentStartError.message || "Unable to start payment.");
      setIsPaymentStarting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      width: "100%",
      bgcolor: "#eef0f3",
      fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif',
      boxSizing: "border-box",
    }}>

      <Navbar sticky />

      {/* ── Page body ── */}
      <Box sx={{
        width: "100%",
        px: "36px",
        pt: "18px",
        pb: "36px",
        mt: "64px",
        boxSizing: "border-box",
        display: "grid",
        gridTemplateColumns: "380px 1fr",
        gap: "24px",
        alignItems: "start",
      }}>

        {/* ══ LEFT PANEL ══ */}
        <Box sx={{
          bgcolor: "#d3d3d5",
          borderRadius: "16px",
          p: "18px",
          boxSizing: "border-box",
        }}>

          {/* Success section */}
          <Box sx={{ textAlign: "center", pt: "10px", pb: "6px" }}>
            <CheckCircleRoundedIcon sx={{ color: "#2e8b38", fontSize: 58 }} />
            <Typography sx={{
              mt: "8px",
              fontSize: 22,
              fontWeight: 700,
              color: "#0d2b4a",
              lineHeight: 1.25,
            }}>
              Your free listing<br />will be live soon
            </Typography>
          </Box>

          {/* White property card */}
          <Box sx={{ bgcolor: "white", borderRadius: "12px", p: "14px", mt: "10px" }}>
            {/* Image placeholder */}
            <Box sx={{
              height: 178,
              bgcolor: "#e2e5eb",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {/* House illustration matching image 1 */}
              <Box sx={{ position: "relative", width: 120, height: 100 }}>
                {/* Roof */}
                <Box sx={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 0,
                  height: 0,
                  borderLeft: "60px solid transparent",
                  borderRight: "60px solid transparent",
                  borderBottom: "48px solid #7a9ab5",
                }} />
                {/* Body */}
                <Box sx={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 84,
                  height: 54,
                  bgcolor: "#9fbdd4",
                  borderRadius: "2px",
                }} />
                {/* Door */}
                <Box sx={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 18,
                  height: 26,
                  bgcolor: "#7a9ab5",
                  borderRadius: "2px 2px 0 0",
                }} />
                {/* Left tree */}
                <Box sx={{ position: "absolute", bottom: 0, left: -4 }}>
                  <Box sx={{ width: 20, height: 28, bgcolor: "#5a9e5a", borderRadius: "50% 50% 40% 40%", ml: "2px" }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: "#8b6340", mx: "auto" }} />
                </Box>
                {/* Right tree */}
                <Box sx={{ position: "absolute", bottom: 0, right: -4 }}>
                  <Box sx={{ width: 20, height: 28, bgcolor: "#5a9e5a", borderRadius: "50% 50% 40% 40%", ml: "2px" }} />
                  <Box sx={{ width: 4, height: 10, bgcolor: "#8b6340", mx: "auto" }} />
                </Box>
              </Box>
            </Box>

            <Typography sx={{ mt: "10px", color: "#9aabbc", fontSize: 11, fontWeight: 400 }}>
              {propertyIdText}
            </Typography>
            <Typography sx={{ mt: "4px", color: "#0e2a48", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
              {property.title}
            </Typography>
            <Typography sx={{ mt: "3px", color: "#4a6070", fontSize: 13.5, lineHeight: 1.4 }}>
              {property.locationText}
            </Typography>
            <Typography sx={{ mt: "8px", color: "#0f2948", fontSize: 16, fontWeight: 700 }}>
              {property.priceText}
            </Typography>
          </Box>

          {/* Edit / Preview button */}
          <Button
            variant="outlined"
            onClick={() => { window.location.href = "/post-property/property-dashboard"; }}
            sx={{
              mt: "14px",
              width: "100%",
              textTransform: "none",
              fontSize: 13.5,
              color: "#2f5787",
              borderColor: "#ccd5e0",
              bgcolor: "white",
              borderRadius: "8px",
              py: "7px",
              fontWeight: 400,
              "&:hover": { bgcolor: "#f4f7fb", borderColor: "#aab8cc" },
            }}
          >
            Edit / Preview
          </Button>
        </Box>

        {/* ══ RIGHT PANEL ══ */}
        <Box sx={{ width: "100%", boxSizing: "border-box" }}>

          {/* Listing count row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: "6px", mb: "10px" }}>
            <MyLocationRoundedIcon sx={{ color: "#e8521e", fontSize: 16 }} />
            <Typography sx={{ color: "#717b88", fontSize: 13 }}>
              12,32,422+ listings currently live on 99acres
            </Typography>
          </Box>

          {/* Main headline */}
          <Typography sx={{
            color: "#071f3a",
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: "-0.2px",
          }}>
            Free listings get lower visibility due to competition
          </Typography>

          {/* Sub headline */}
          <Typography sx={{
            mt: "10px",
            color: "#0a2540",
            fontSize: 17,
            fontWeight: 700,
            lineHeight: 1.25,
          }}>
            Upgrade &amp; get more attention from buyers
          </Typography>

          {/* ── Upgrade card ── */}
          <Box sx={{
            mt: "14px",
            width: "100%",
            border: "1.5px solid #97bdd8",
            borderRadius: "12px",
            bgcolor: "#f2f5fa",
            overflow: "hidden",
            boxSizing: "border-box",
          }}>
            {/* Advanced badge */}
            <Box sx={{
              px: "14px",
              py: "6px",
              width: "fit-content",
              bgcolor: "#cde0f0",
              borderRadius: "0 0 12px 0",
              color: "#1a5a96",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 15 }} />
              Advanced
            </Box>

            {/* Features + Price */}
            <Box sx={{
              display: "grid",
              gridTemplateColumns: "1fr 230px",
              alignItems: "stretch",
              minHeight: 220,
            }}>
              {/* Feature bullets */}
              <Box sx={{
                px: "28px",
                py: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "14px",
              }}>
                {[
                  { bold: "5x more responses", rest: " from buyers" },
                  { bold: "Stand out to buyers", rest: " with Premium listing" },
                  { bold: "Free Verification & Photoshoot", rest: " of your property*" },
                ].map(({ bold, rest }) => (
                  <Box key={bold} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <AutoAwesomeRoundedIcon sx={{ color: "#4d92c8", fontSize: 16, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 14, color: "#07244a", lineHeight: 1.5 }}>
                      <Box component="span" sx={{ fontWeight: 700 }}>{bold}</Box>
                      {rest}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Price box — right column, full height, green bg */}
              <Box sx={{
                bgcolor: "#e5ede5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                px: "16px",
                py: "20px",
                gap: "4px",
              }}>
                <Typography sx={{ color: "#5a6368", fontSize: 13, fontWeight: 400 }}>2 months</Typography>
                <Typography sx={{ color: "#041e3a", fontSize: 42, fontWeight: 700, lineHeight: 1, mt: "2px" }}>
                  ₹2039
                </Typography>
                <Typography sx={{ color: "#666f74", fontSize: 11, mb: "4px" }}>all inclusive</Typography>
                <Button
                  onClick={() => setIsCartOpen(true)}
                  sx={{
                  mt: "6px",
                  width: "100%",
                  maxWidth: 160,
                  height: 38,
                  textTransform: "none",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "white",
                  bgcolor: "#277010",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  "&:hover": { bgcolor: "#206010" },
                }}>
                  Buy Now
                </Button>
              </Box>
            </Box>

            {/* Footer bar */}
            <Box sx={{
              px: "22px",
              py: "11px",
              borderTop: "1px solid #b2cfe8",
              bgcolor: "#d4e6f5",
              color: "#445e78",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              {/* Trend arrow icon */}
              <Box component="span" sx={{ fontSize: 15 }}>↗</Box>
              400+ owner chose upgrade in last 48hrs
            </Box>
          </Box>

          {/* Help line */}
          <Box sx={{
            mt: "16px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <LocalPhoneOutlinedIcon sx={{ color: "#c8a010", fontSize: 17 }} />
            <Typography sx={{ color: "#666f78", fontSize: 13 }}>
              Need help? Call us on -{" "}
              <Box component="span" sx={{ color: "#0d2644", fontWeight: 700 }}>
                1800 41 99099
              </Box>{" "}
              (Toll Free IND)
            </Typography>
          </Box>

          {isLoading && (
            <Box sx={{ mt: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
              <CircularProgress size={15} />
              <Typography sx={{ fontSize: 12, color: "#5f6e80" }}>
                Loading posted property details from DB...
              </Typography>
            </Box>
          )}
          {errorMessage && (
            <Alert severity="warning" sx={{ mt: "14px", fontSize: 12 }}>
              {errorMessage} Showing available saved details.
            </Alert>
          )}
          {paymentError && (
            <Alert severity="error" sx={{ mt: "14px", fontSize: 12 }}>
              {paymentError}
            </Alert>
          )}
          {paymentSuccess && (
            <Alert severity="success" sx={{ mt: "14px", fontSize: 12 }}>
              {paymentSuccess}
            </Alert>
          )}
        </Box>
      </Box>

      {/* ── Scroll-to-top ── */}
      <Box
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 46,
          height: 46,
          borderRadius: "50%",
          bgcolor: "#f3f4f5",
          border: "1px solid #ced5de",
          boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 20,
        }}
      >
        <KeyboardArrowUpRoundedIcon sx={{ fontSize: 24, color: "#2f3d4f" }} />
      </Box>

      <Drawer
        anchor="right"
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 356 },
            bgcolor: "#ffffff",
          },
        }}
      >
        <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              px: 1.6,
              py: 1.4,
              borderBottom: "1px solid #e6ebf2",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ color: "#202b3a", fontSize: 22 / 2, fontWeight: 700 }}>Cart</Typography>
            <IconButton onClick={() => setIsCartOpen(false)} sx={{ color: "#6d7785" }}>
              <CloseRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.6, py: 1.5, flex: 1, overflowY: "auto" }}>
            <Typography sx={{ color: "#223449", fontSize: 12, fontWeight: 700 }}>
              Advanced Plus - Plan Options
            </Typography>

            <Box
              sx={{
                mt: 1.2,
                border: "1px solid #87afd0",
                borderRadius: "6px",
                px: 1.2,
                py: 1.1,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1.0,
              }}
            >
              <Box>
                <Typography sx={{ color: "#7d8794", fontSize: 10.5 }}>4 Months</Typography>
                <Typography sx={{ mt: 0.5, color: "#0d2744", fontSize: 28 / 2, fontWeight: 700 }}>
                  Rs {totalAmount.toLocaleString("en-IN")}
                  <Box component="span" sx={{ color: "#7d8794", fontSize: 10.5, fontWeight: 400 }}> incl. GST</Box>
                </Typography>
                <Typography sx={{ mt: 0.35, color: "#8a93a0", fontSize: 10.5 }}>TL cost</Typography>
              </Box>
              <Box
                sx={{
                  mt: 0.1,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "1px solid #2d78b7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#2d78b7" }} />
              </Box>
            </Box>

            <Typography sx={{ mt: 1.1, color: "#7d8794", fontSize: 10.5 }}>
              Still confused? <Box component="span" sx={{ color: "#1f73be", fontWeight: 700 }}>Get assistance</Box>
            </Typography>

            <Box sx={{ mt: 2.3 }}>
              <Typography sx={{ color: "#223449", fontSize: 12, fontWeight: 700 }}>
                Payment Summary
              </Typography>

              <Box sx={{ mt: 1.1, display: "grid", gap: 0.85 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#8a93a0", fontSize: 11 }}>
                  <Typography sx={{ fontSize: "inherit" }}>Advanced Plus</Typography>
                  <Typography sx={{ fontSize: "inherit" }}>Rs {planBaseAmount.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: "#8a93a0", fontSize: 11 }}>
                  <Typography sx={{ fontSize: "inherit" }}>
                    GST <Box component="span" sx={{ color: "#9aa3b0" }}>(18%)</Box>
                  </Typography>
                  <Typography sx={{ fontSize: "inherit" }}>Rs {gstAmount.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box sx={{ borderTop: "1px solid #e8edf3", pt: 0.9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ color: "#1f2d3d", fontSize: 12, fontWeight: 700 }}>Total</Typography>
                  <Typography sx={{ color: "#1f2d3d", fontSize: 18 / 2, fontWeight: 700 }}>
                    Rs {totalAmount.toLocaleString("en-IN")}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2.0,
                borderRadius: "6px",
                bgcolor: "#fff7ed",
                border: "1px solid #f3dec2",
                px: 1.1,
                py: 1.0,
                color: "#97734a",
                fontSize: 10.5,
                lineHeight: 1.5,
              }}
            >
              Upgrading your property in {property.locationText || "this locality"} improves visibility and buyer attention.
            </Box>
            {paymentError && (
              <Alert severity="error" sx={{ mt: 1.2, fontSize: 12 }}>
                {paymentError}
              </Alert>
            )}
            {paymentSuccess && (
              <Alert severity="success" sx={{ mt: 1.2, fontSize: 12 }}>
                {paymentSuccess}
              </Alert>
            )}
          </Box>

          <Box sx={{ p: 1.6, borderTop: "1px solid #e6ebf2" }}>
            <Button
              fullWidth
              onClick={handleProceedToPurchase}
              disabled={isPaymentStarting}
              sx={{
                height: 38,
                textTransform: "none",
                borderRadius: "4px",
                bgcolor: "#0f5fad",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                "&:hover": { bgcolor: "#0b5399" },
              }}
            >
              {isPaymentStarting ? "Opening Razorpay..." : "Proceed To Purchase"}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}


