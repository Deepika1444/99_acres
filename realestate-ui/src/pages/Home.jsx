import { Box, Button, Card, Dialog, DialogContent, IconButton, InputBase, Typography } from "@mui/material";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/HeroSection";
import RecommendedProperties from "../components/RecommendedProperties";
import HandpickedProjects from "../components/HandpickedProjects";
import NewlyLaunchedProjects from "../components/NewlyLaunchedProjects";
import DemandInBangalore from "../components/DemandInBangalore";
import UpcomingProjects from "../components/UpcomingProjects";
import PopularBuilders from "../components/PopularBuilders";
import TopArticles from "../components/TopArticles";
import PostPropertyBanner from "../components/PostPropertyBanner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { getAuthToken, getAuthUser, getUserInitials, setAuthSession } from "../utils/authStorage";

function getListFromResult(result) {
  if (Array.isArray(result)) return result;
  const data = result?.data;
  const nestedData = data?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(nestedData)) return nestedData;

  const options = [
    data?.properties,
    data?.listings,
    data?.items,
    data?.docs,
    data?.rows,
    nestedData?.properties,
    nestedData?.listings,
    nestedData?.items,
    nestedData?.docs,
    nestedData?.rows,
    result?.properties,
    result?.listings,
    result?.items,
    result?.docs,
    result?.rows,
  ];

  for (const item of options) {
    if (Array.isArray(item)) return item;
  }

  const single = data?.property || nestedData?.property || result?.property;
  if (single && typeof single === "object") return [single];
  return [];
}

function getHomeImageUrl(property) {
  const media = property?.mediaDetails || {};
  const photos = Array.isArray(media?.photos) ? media.photos : [];
  const cover = photos.find((item) => item?.isCover && String(item?.url || "").trim()) || photos[0];
  return String(property?.coverImageUrl || property?.image || cover?.url || "").trim();
}

function getHomePropertyCardData(property) {
  const basic = property?.basicDetails || property?.basic || {};
  const location = property?.locationDetails || property?.location || {};
  const profile = property?.propertyProfile || property?.profile || {};
  const roomDetails = profile?.roomDetails || {};
  const pricing = property?.pricingDetails || property?.pricing || {};
  const priceDetails = pricing?.priceDetails || property?.priceDetails || {};
  const city = String(location?.city || property?.city || "").trim();
  const locality = String(location?.locality || property?.locality || "").trim();
  const subLocality = String(location?.subLocality || property?.subLocality || "").trim();
  const propertyId = String(property?.propertyId || property?._id || "").trim();
  const expectedPrice = Number(priceDetails?.expectedPrice || property?.expectedPrice || property?.price || 0);
  const bedrooms = String(roomDetails?.bedrooms || property?.bedrooms || "").trim();
  const propertyType = String(basic?.propertySubType || basic?.propertyType || "Property").replace(/_/g, " ").trim();

  return {
    id: propertyId,
    imageUrl: getHomeImageUrl(property),
    title: [bedrooms ? `${bedrooms} BHK` : "", propertyType].filter(Boolean).join(" ").trim() || "Property Listing",
    priceText: expectedPrice > 0 ? `Rs ${expectedPrice.toLocaleString("en-IN")}` : "Price on request",
    addressText: [subLocality, locality, city].filter(Boolean).join(", ") || "Address not available",
    city,
    postedOn: new Date(property?.createdAt || property?.updatedAt || Date.now()).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
}

export default function Home() {
  const [showStickyArrow, setShowStickyArrow] = useState(true);
  const [showStickyNavbar, setShowStickyNavbar] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [emailId, setEmailId] = useState("");
  const [loginDialogStep, setLoginDialogStep] = useState("default");
  const [createAccountBackStep, setCreateAccountBackStep] = useState("emailUsername");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agentType, setAgentType] = useState("");
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [registrationId, setRegistrationId] = useState("");
  const [otpInfoMessage, setOtpInfoMessage] = useState("");
  const [emailLinkMessage, setEmailLinkMessage] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmCreatePassword, setConfirmCreatePassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmCreatePassword, setShowConfirmCreatePassword] = useState(false);
  const [createPasswordError, setCreatePasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [agentTypeError, setAgentTypeError] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [showPasswordValue, setShowPasswordValue] = useState(false);
  const [getWhatsappUpdates, setGetWhatsappUpdates] = useState(true);
  const [passwordError, setPasswordError] = useState(false);
  const [authUser, setAuthUser] = useState(() => getAuthUser());
  const [homePropertyCount, setHomePropertyCount] = useState(0);
  const [homeTotalResponses, setHomeTotalResponses] = useState(0);
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityOptions, setCityOptions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [searchProperties, setSearchProperties] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const otpInputRefs = useRef([]);
  const authRedirectPathRef = useRef("");
  const focusOtpInput = (index) => {
    requestAnimationFrame(() => {
      const input = otpInputRefs.current[index];
      if (!input) return;
      input.focus();
      input.select?.();
    });
  };
  const primaryBtnActive = "#0f7ad7";
  const primaryBtnInactive = "#76aede";
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const authToken = getAuthToken();
  const authUserId = String(authUser?._id || authUser?.id || authUser?.userId || "").trim();
  const authUserName = String(authUser?.fullName || authUser?.name || "Guest User").trim() || "Guest User";
  const authUserRole = String(authUser?.agentType || "").trim().toLowerCase() === "yes" ? "Dealer" : "User";
  const authUserInitials = getUserInitials(authUser, "D");
  const isGmailEmail = (value) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(String(value || "").trim());
  const isTenDigitPhone = (value) => String(value || "").replace(/\D/g, "").length === 10;
  const isStrongPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(String(value || ""));

  const callAuthApi = async (path, payload) => {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await response.json();
    } catch (_error) {
      data = {};
    }

    return {
      ok: response.ok,
      status: response.status,
      message: data?.message || "",
      data: data?.data || null,
    };
  };

  const openLoginDialog = () => {
    setLoginDialogStep("default");
    setCreateAccountBackStep("emailUsername");
    setGeneralError("");
    setOtpInfoMessage("");
    setEmailLinkMessage("");
    setRegistrationId("");
    setPasswordError(false);
    setIsSubmitting(false);
    setIsLoginDialogOpen(true);
  };

  const closeLoginDialog = () => {
    setLoginDialogStep("default");
    setCreateAccountBackStep("emailUsername");
    setGeneralError("");
    setOtpInfoMessage("");
    setEmailLinkMessage("");
    setRegistrationId("");
    setPasswordError(false);
    setIsSubmitting(false);
    setIsLoginDialogOpen(false);
  };

  const openCreateAccountStep = async (fromStep) => {
    if (!isGmailEmail(emailId)) {
      setEmailError("Email must be a valid @gmail.com address");
      return;
    }

    try {
      setIsSubmitting(true);
      setEmailError("");
      setGeneralError("");
      const result = await callAuthApi("/api/auth/register/check-email", { email: emailId.trim() });

      if (!result.ok) {
        setEmailError(result.message || "Unable to validate email right now.");
        return;
      }

      setCreateAccountBackStep(fromStep);
      setLoginDialogStep("createAccount");
    } catch (_error) {
      setEmailError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAccount = async () => {
    let hasError = false;

    if (!fullName.trim()) {
      setFullNameError("Full name is required");
      hasError = true;
    } else {
      setFullNameError("");
    }

    if (!isTenDigitPhone(phoneNumber)) {
      setPhoneError("Phone number must contain exactly 10 digits");
      hasError = true;
    } else {
      setPhoneError("");
    }

    if (!isStrongPassword(createPassword)) {
      setCreatePasswordError("Use 8+ chars with uppercase, lowercase, number, and special character");
      hasError = true;
    } else {
      setCreatePasswordError("");
    }

    if (!confirmCreatePassword.trim()) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    } else if (createPassword !== confirmCreatePassword) {
      setConfirmPasswordError("Password and confirm password do not match");
      hasError = true;
    } else {
      setConfirmPasswordError("");
    }

    if (!agentType.trim()) {
      setAgentTypeError("Please select Yes or No");
      hasError = true;
    } else {
      setAgentTypeError("");
    }

    if (!isTermsAccepted) {
      setShowTermsError(true);
      hasError = true;
    } else {
      setShowTermsError(false);
    }

    if (hasError) return;

    try {
      setIsSubmitting(true);
      setGeneralError("");

      const result = await callAuthApi("/api/auth/register/request-otp", {
        fullName: fullName.trim(),
        email: emailId.trim(),
        phoneNumber: phoneNumber.trim(),
        agentType: agentType.trim(),
        password: createPassword,
        confirmPassword: confirmCreatePassword,
      });

      if (!result.ok) {
        setGeneralError(result.message || "Unable to create account right now.");
        return;
      }

      const nextRegistrationId = String(result.data?.registrationId || "").trim();
      if (!nextRegistrationId) {
        setGeneralError("Registration started but registration ID is missing.");
        return;
      }

      setRegistrationId(nextRegistrationId);
      setOtpInfoMessage(
        result.data?.otpCode
          ? `OTP sent to your email: ${result.data.otpCode}`
          : "OTP sent to your email."
      );
      setEmailLinkMessage("");
      setOtpDigits(["", "", "", ""]);
      setLoginDialogStep("verifyEmailOtp");
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) {
      const next = [...otpDigits];
      next[index] = "";
      setOtpDigits(next);
      if (generalError) setGeneralError("");
      return;
    }

    const next = [...otpDigits];
    const nextDigits = digits.slice(0, otpDigits.length - index).split("");
    nextDigits.forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setOtpDigits(next);
    const nextFocusIndex = Math.min(index + nextDigits.length, otpDigits.length - 1);
    focusOtpInput(nextFocusIndex);
    if (generalError) setGeneralError("");
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;
    if (otpDigits[index]) return;
    if (index === 0) return;
    focusOtpInput(index - 1);
  };

  const handleOtpPaste = (index, event) => {
    const pasted = event.clipboardData?.getData("text") || "";
    const digits = pasted.replace(/\D/g, "");
    if (!digits) return;
    event.preventDefault();

    const next = [...otpDigits];
    const nextDigits = digits.slice(0, otpDigits.length - index).split("");
    nextDigits.forEach((digit, offset) => {
      next[index + offset] = digit;
    });
    setOtpDigits(next);
    const nextFocusIndex = Math.min(index + nextDigits.length, otpDigits.length - 1);
    focusOtpInput(nextFocusIndex);
    if (generalError) setGeneralError("");
  };

  const maskEmail = (email) => {
    if (!email || !email.includes("@")) return email;
    const [name, domain] = email.split("@");
    if (!name) return email;
    const keep = name.slice(0, Math.min(3, name.length));
    return `${keep}${"*".repeat(Math.max(name.length - keep.length, 0))}@${domain}`;
  };

  const handleVerifyAndContinue = async () => {
    if (otpDigits.some((digit) => digit === "")) return;
    if (!registrationId) {
      setGeneralError("Registration session expired. Please create account again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setGeneralError("");
      const result = await callAuthApi("/api/auth/register/verify-otp", {
        registrationId,
        otp: otpDigits.join(""),
      });

      if (!result.ok) {
        setGeneralError(result.message || "OTP verification failed.");
        return;
      }

      if (result.data?.token || result.data?.user) {
        setAuthSession({ token: result.data?.token, user: result.data?.user });
        window.dispatchEvent(new Event("auth-changed"));
      }
      setLoginDialogStep("accountCreated");
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsSubmitting(true);
      setGeneralError("");
      const result = await callAuthApi("/api/auth/register/request-otp", {
        fullName: fullName.trim(),
        email: emailId.trim(),
        phoneNumber: phoneNumber.trim(),
        agentType: agentType.trim(),
        password: createPassword,
        confirmPassword: confirmCreatePassword,
      });

      if (!result.ok) {
        setGeneralError(result.message || "Unable to resend OTP right now.");
        return;
      }

      const nextRegistrationId = String(result.data?.registrationId || "").trim();
      if (nextRegistrationId) {
        setRegistrationId(nextRegistrationId);
      }
      setOtpInfoMessage(
        result.data?.otpCode
          ? `OTP sent to your email: ${result.data.otpCode}`
          : "OTP sent to your email."
      );
      setEmailLinkMessage("");
      setOtpDigits(["", "", "", ""]);
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyViaEmailLink = async () => {
    if (!registrationId) {
      setGeneralError("Registration session expired. Please create account again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setGeneralError("");
      setEmailLinkMessage("");
      const result = await callAuthApi("/api/auth/register/request-email-link", {
        registrationId,
        email: emailId.trim(),
      });

      if (!result.ok) {
        setGeneralError(result.message || "Unable to send verification link right now.");
        return;
      }

      setOtpInfoMessage(result.message || "Verification link sent to your email.");
      setEmailLinkMessage("Verification link sent to your email.");
    } catch (_error) {
      setGeneralError("Unable to connect to server. Please try again.");
      setEmailLinkMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordContinue = async () => {
    if (!passwordValue.trim()) return;

    try {
      setIsSubmitting(true);
      setGeneralError("");
      const result = await callAuthApi("/api/auth/login", {
        identifier: emailId.trim(),
        password: passwordValue,
      });

      if (!result.ok) {
        setPasswordError(true);
        setGeneralError(result.message || "Invalid credentials");
        return;
      }

      setPasswordError(false);
      if (result.data?.token || result.data?.user) {
        setAuthSession({ token: result.data?.token, user: result.data?.user });
        window.dispatchEvent(new Event("auth-changed"));
      }
      setLoginDialogStep("loginSuccess");
    } catch (_error) {
      setPasswordError(true);
      setGeneralError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGmailEmailFilled = isGmailEmail(emailId);
  const isIdentifierFilled = emailId.trim().length > 0;
  const isOtpFilled = otpDigits.every((digit) => digit !== "");
  const isPasswordFilled = passwordValue.trim().length > 0;

  useEffect(() => {
    const syncAuthUser = () => {
      setAuthUser(getAuthUser());
    };

    syncAuthUser();
    window.addEventListener("auth-changed", syncAuthUser);
    return () => {
      window.removeEventListener("auth-changed", syncAuthUser);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHomeProperties = async () => {
      if (!authToken || !authUserId) {
        setHomePropertyCount(0);
        setHomeTotalResponses(0);
        return;
      }

      const paths = [
        `/api/properties/user/${encodeURIComponent(authUserId)}?sortOrder=newest`,
        "/api/properties/my-listings?sortOrder=newest",
        "/api/properties/my-properties?sortOrder=newest",
      ];

      for (const path of paths) {
        try {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
            cache: "no-store",
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) continue;

          const properties = getListFromResult(result);
          if (!Array.isArray(properties)) continue;

          const totalResponses = properties.reduce((sum, item) => {
            const count = Number(
              item?.totalResponses ||
              item?.responseCount ||
              item?.responsesCount ||
              item?.leadCount ||
              item?.leadsCount ||
              0
            );
            return sum + (Number.isFinite(count) ? count : 0);
          }, 0);

          if (!cancelled) {
            setHomePropertyCount(properties.length);
            setHomeTotalResponses(totalResponses);
          }
          return;
        } catch {
          // try next endpoint
        }
      }

      if (!cancelled) {
        setHomePropertyCount(0);
        setHomeTotalResponses(0);
      }
    };

    loadHomeProperties();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken, authUserId]);

  useEffect(() => {
    const onScroll = () => {
      const startBox = document.getElementById("sticky-arrow-start");
      const startY = startBox
        ? startBox.getBoundingClientRect().bottom + window.scrollY - window.innerHeight + 56
        : 420;
      const passedStart = window.scrollY >= startY;
      const atFooterEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
      setShowStickyArrow(passedStart && !atFooterEnd);

      const recommended = document.getElementById("recommended-properties-section");
      if (recommended) {
        const recTop = recommended.getBoundingClientRect().top + window.scrollY;
        setShowStickyNavbar(window.scrollY >= recTop - 62);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const openLoginFlag = query.get("openLogin") === "1";
    const verifyEmailToken = query.get("verifyEmailToken");
    const redirectTo = String(query.get("redirectTo") || "").trim();
    if (!openLoginFlag && !verifyEmailToken) return;

    if (openLoginFlag && redirectTo) {
      authRedirectPathRef.current = redirectTo;
    }

    const cleanQuery = () => {
      query.delete("openLogin");
      query.delete("verifyEmailToken");
      query.delete("redirectTo");
      const queryString = query.toString();
      const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", nextUrl);
    };

    openLoginDialog();
    cleanQuery();

    if (!verifyEmailToken) return;

    const verifyByLink = async () => {
      try {
        setIsSubmitting(true);
        setGeneralError("");
        const result = await callAuthApi("/api/auth/register/verify-email-link", {
          token: verifyEmailToken,
        });

        if (!result.ok) {
          setLoginDialogStep("verifyEmailOtp");
          setGeneralError(result.message || "Verification link is invalid or expired.");
          return;
        }

        if (result.data?.token || result.data?.user) {
          setAuthSession({ token: result.data?.token, user: result.data?.user });
          window.dispatchEvent(new Event("auth-changed"));
        }
        setLoginDialogStep("accountCreated");
      } catch (_error) {
        setLoginDialogStep("verifyEmailOtp");
        setGeneralError("Unable to connect to server. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    verifyByLink();
  }, []);

  useEffect(() => {
    if (!isLoginDialogOpen) return;
    if (loginDialogStep !== "accountCreated" && loginDialogStep !== "loginSuccess") return;

    const redirectPath = String(authRedirectPathRef.current || "").trim();
    if (redirectPath) {
      const timer = setTimeout(() => {
        authRedirectPathRef.current = "";
        window.location.href = redirectPath;
      }, loginDialogStep === "loginSuccess" ? 1200 : 1200);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      closeLoginDialog();
    }, loginDialogStep === "loginSuccess" ? 3500 : 2500);
    return () => clearTimeout(timer);
  }, [isLoginDialogOpen, loginDialogStep]);

  useEffect(() => {
    if (!isLoginDialogOpen || loginDialogStep !== "verifyEmailOtp") return;
    const timer = setTimeout(() => {
      focusOtpInput(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoginDialogOpen, loginDialogStep]);

  useEffect(() => {
    let cancelled = false;

    const loadCities = async () => {
      const query = cityQuery.trim();
      if (query.length === 0) {
        setCityOptions([]);
        setCityLoading(false);
        return;
      }

      try {
        setCityLoading(true);
        const response = await fetch(`${apiBaseUrl}/api/locations/cities?search=${encodeURIComponent(query)}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });
        const result = await response.json().catch(() => ({}));
        const rawCities = result?.data || result?.cities || result?.items || result;
        const nextCities = Array.isArray(rawCities)
          ? rawCities
              .map((item) => {
                if (typeof item === "string") return item;
                return String(item?.city || item?.cityName || item?.CityName || item?.name || "").trim();
              })
              .filter(Boolean)
          : [];

        if (!cancelled) {
          setCityOptions([...new Set(nextCities)].slice(0, 8));
        }
      } catch (_error) {
        if (!cancelled) setCityOptions([]);
      } finally {
        if (!cancelled) setCityLoading(false);
      }
    };

    const timer = setTimeout(loadCities, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [apiBaseUrl, authToken, cityQuery]);

  useEffect(() => {
    let cancelled = false;

    const loadSearchProperties = async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const params = new URLSearchParams({ sortOrder: "newest" });
        if (selectedCity) params.set("city", selectedCity);

        const response = await fetch(`${apiBaseUrl}/api/properties?${params.toString()}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(result?.message || "Unable to load properties.");
        }

        const properties = getListFromResult(result).map(getHomePropertyCardData);
        if (!cancelled) setSearchProperties(properties);
      } catch (error) {
        if (!cancelled) {
          setSearchProperties([]);
          setSearchError(error?.message || "Unable to load properties.");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    };

    loadSearchProperties();
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, authToken, selectedCity]);

  const handleHomeCitySearch = () => {
    setSelectedCity(cityQuery.trim());
    setCityOptions([]);
  };

  const handleHomeCitySelect = (city) => {
    setCityQuery(city);
    setSelectedCity(city);
    setCityOptions([]);
  };

  return (
    <Box sx={{ bgcolor: "#ffffff", minHeight: "100vh" }}>
      {showStickyNavbar && <Navbar sticky onLoginClick={openLoginDialog} />}
      <HeroSection
        onLoginClick={openLoginDialog}
        cityQuery={cityQuery}
        cityOptions={cityOptions}
        cityLoading={cityLoading}
        onCityQueryChange={(value) => {
          setCityQuery(value);
          if (!value.trim()) {
            setSelectedCity("");
            setCityOptions([]);
          }
        }}
        onCitySelect={handleHomeCitySelect}
        onSearch={handleHomeCitySearch}
      />

      <Box
        sx={{
          maxWidth: "1180px",
          mx: "auto",
          px: { xs: 2, md: 3 },
          pt: { xs: 14, md: 15 },
          pb: 8,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 336px" },
          gap: { xs: 2.2, md: 2.8 },
          alignItems: "start",
        }}
      >
        <Box>
          <Box sx={{ mt: 0.2 }}>
            <Typography sx={{ color: "#102747", fontSize: { xs: 18, md: 24 }, fontWeight: 800 }}>
              {selectedCity ? `${selectedCity} Properties` : "Posted Properties"}
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#6b7990", fontSize: 13 }}>
              {selectedCity
                ? `Showing properties posted for ${selectedCity}.`
                : "Browse all recently posted properties. Search by city to narrow the results."}
            </Typography>

            {searchError && (
              <Typography sx={{ mt: 1.0, color: "#d3313f", fontSize: 13 }}>
                {searchError}
              </Typography>
            )}

            {searchLoading ? (
              <Typography sx={{ mt: 1.6, color: "#6b7990", fontSize: 13 }}>Loading properties...</Typography>
            ) : searchProperties.length === 0 ? (
              <Typography sx={{ mt: 1.6, color: "#6b7990", fontSize: 13 }}>
                No properties found{selectedCity ? ` for ${selectedCity}` : ""}.
              </Typography>
            ) : (
              <Box sx={{ mt: 1.4, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.35 }}>
                {searchProperties.map((property) => (
                  <Card
                    key={property.id || `${property.title}-${property.addressText}`}
                    sx={{
                      borderRadius: "14px",
                      border: "1px solid #d7dfeb",
                      boxShadow: "none",
                      overflow: "hidden",
                      bgcolor: "#fff",
                    }}
                  >
                    <Box sx={{ display: "grid", gridTemplateColumns: "146px minmax(0, 1fr)", minHeight: 150 }}>
                      <Box sx={{ bgcolor: "#eef3f8", minHeight: 150 }}>
                        {property.imageUrl ? (
                          <Box
                            component="img"
                            src={property.imageUrl}
                            alt={property.title}
                            sx={{ width: "100%", height: "100%", minHeight: 150, objectFit: "cover" }}
                          />
                        ) : (
                          <Box sx={{ width: "100%", height: "100%", minHeight: 150, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7990", fontSize: 13 }}>
                            No Image
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ p: 1.35, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                        <Typography sx={{ color: "#102747", fontSize: 15, fontWeight: 800, lineHeight: 1.25, letterSpacing: "-0.1px" }}>
                          {property.title}
                        </Typography>
                        <Typography sx={{ mt: 0.55, color: "#0f7ad7", fontSize: 17, fontWeight: 800 }}>
                          {property.priceText}
                        </Typography>
                        <Typography sx={{ mt: 0.5, color: "#43566f", fontSize: 12.5, lineHeight: 1.55 }}>
                          {property.addressText}
                        </Typography>
                        <Box sx={{ mt: 0.95, display: "flex", alignItems: "center", gap: 0.7, flexWrap: "wrap" }}>
                          <Box sx={{ px: 0.8, py: 0.35, borderRadius: "999px", bgcolor: "#eef6ff", color: "#296fae", fontSize: 10.5, fontWeight: 700 }}>
                            {property.city || "City"}
                          </Box>
                          <Typography sx={{ color: "#7b8796", fontSize: 10.5 }}>Posted on {property.postedOn}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 2.1 }}>
            <RecommendedProperties />
          </Box>
          <HandpickedProjects />
          <NewlyLaunchedProjects />
          <DemandInBangalore />
          <UpcomingProjects />
          <PopularBuilders />
        </Box>

        <Box
          id="sticky-arrow-start"
          sx={{
            width: "100%",
            position: { xs: "static", md: "sticky" },
            top: { md: 86 },
            alignSelf: "start",
            zIndex: 5,
          }}
        >
          {!authToken || !authUserId ? (
            <Card
              sx={{
                borderRadius: "10px",
                boxShadow: "none",
                border: "1px solid #d7dce6",
                p: 2.3,
                minHeight: 300,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.3 }}>
                <AccountCircleRoundedIcon sx={{ color: "#52617b", fontSize: 26 }} />
                <Typography sx={{ fontSize: 31, fontWeight: 700, color: "#102747" }}>
                  Guest User
                </Typography>
              </Box>

              <Typography sx={{ mt: 2.8, color: "#2c4569", fontWeight: 700, fontSize: 13 }}>
                Your Recent Activity
              </Typography>
              <Typography sx={{ mt: 1.2, color: "#111f34", lineHeight: 1.45, fontSize: 13 }}>
                No activity yet! Start browsing properties and projects and track them from here.
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={openLoginDialog}
                sx={{
                  mt: 3.3,
                  borderRadius: "5px",
                  py: 1,
                  bgcolor: "#0f7ad7",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 14,
                  textTransform: "uppercase",
                  "&:hover": { bgcolor: "#0c6cc0" },
                }}
              >
                Login / Register
              </Button>
              <Typography sx={{ mt: 1, textAlign: "center", color: "#2f4f77", fontSize: 12 }}>
                to access all the features on 99acres
              </Typography>
            </Card>
          ) : (
            <Card
              sx={{
                borderRadius: "10px",
                boxShadow: "none",
                border: "1px solid #d7dce6",
                p: 1.9,
                minHeight: 190,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box sx={{ width: 28, height: 28, borderRadius: "50%", bgcolor: "#d9f0dc", color: "#2f7b2f", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {authUserInitials}
                </Box>
                <Box>
                  <Typography sx={{ color: "#173154", fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{authUserName}</Typography>
                  <Typography sx={{ color: "#7a8799", fontSize: 12 }}>{authUserRole}</Typography>
                </Box>
              </Box>

              <Typography sx={{ mt: 2.0, color: "#233d62", fontWeight: 700, fontSize: 11 }}>
                Your Properties
              </Typography>
              {homePropertyCount > 0 ? (
                <Box sx={{ mt: 1.2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}>
                  <Box sx={{ border: "1px solid #e0e5ed", borderRadius: "10px", p: 1.3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "#162c47", fontWeight: 700, fontSize: 26 / 2 }}>{homePropertyCount}</Typography>
                      <LaunchRoundedIcon
                        onClick={() => {
                          window.location.href = "/post-property/property-dashboard";
                        }}
                        sx={{ color: "#346b9d", fontSize: 18, cursor: "pointer" }}
                      />
                    </Box>
                    <Typography sx={{ mt: 0.6, color: "#6f7a88", fontSize: 10 }}>Property Posted</Typography>
                  </Box>
                  <Box sx={{ border: "1px solid #e0e5ed", borderRadius: "10px", p: 1.3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography sx={{ color: "#162c47", fontWeight: 700, fontSize: 26 / 2 }}>{homeTotalResponses}</Typography>
                      <LaunchRoundedIcon sx={{ color: "#346b9d", fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ mt: 0.6, color: "#6f7a88", fontSize: 10 }}>Total Responses</Typography>
                  </Box>
                </Box>
              ) : (
                <Typography sx={{ mt: 1.2, color: "#111f34", lineHeight: 1.45, fontSize: 12 }}>
                  You do not have any active properties.
                </Typography>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  window.location.href = "/post-property/user-property-dashboard";
                }}
                sx={{
                  mt: 3.3,
                  borderRadius: "4px",
                  py: 0.9,
                  bgcolor: "#0f7ad7",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 14 / 1.1,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#0c6cc0", boxShadow: "none" },
                }}
              >
                Go to my99acres
              </Button>
              <Typography sx={{ mt: 0.6, textAlign: "center", color: "#6a7789", fontSize: 10.5 }}>
                {homePropertyCount > 0 ? "manage your posted properties" : "and start adding properties"}
              </Typography>
            </Card>
          )}

          <Card
            sx={{
              mt: 1.8,
              borderRadius: "10px",
              border: "1px solid #d7dce6",
              p: 1.55,
              background: "linear-gradient(90deg, #d3e7dd 0%, #c6dfd3 56%, #bfdacb 100%)",
              position: "relative",
              overflow: "hidden",
              minHeight: 160,
            }}
          >
            <Typography
              sx={{
                color: "#102747",
                fontWeight: 800,
                fontSize: 34 / 2.0,
                lineHeight: 1.22,
                letterSpacing: "-0.1px",
                maxWidth: 176,
              }}
            >
              Sell or rent faster at the right price!
            </Typography>
            <Typography sx={{ mt: 0.5, color: "#2e3b4f", fontSize: 30 / 2.0, fontWeight: 500 }}>
              List your property now
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 1.35,
                borderRadius: "5px",
                minWidth: 176,
                height: 40,
                px: 1.5,
                py: 0,
                bgcolor: "#0f7ad7",
                color: "white",
                fontWeight: 800,
                fontSize: 29 / 2.0,
                textTransform: "none",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(15, 122, 215, 0.35)",
                "&:hover": { bgcolor: "#0c6cc0" },
              }}
            >
              Post Property, It's FREE
            </Button>

            <Box
              component="img"
              src="https://www.99acres.com/universalapp/img/hp_ppf_banner.png"
              alt="Agent"
              sx={{
                position: "absolute",
                right: -1,
                bottom: -3,
                width: 114,
                height: 146,
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
          </Card>

        </Box>
      </Box>

      <TopArticles />
      <PostPropertyBanner />
      <Footer />

      <Dialog
        open={isLoginDialogOpen}
        onClose={closeLoginDialog}
        maxWidth={false}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: "calc(100vw - 24px)",
              borderRadius: "8px",
              maxHeight: "92vh",
              overflowY: "auto",
            },
          },
        }}
      >
        {loginDialogStep === "default" ? (
          <DialogContent sx={{ px: 2.6, pt: 2.3, pb: 2.1 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <Box>
                <Typography sx={{ color: "#102747", fontSize: 20 / 1.0, fontWeight: 800, lineHeight: 1.2 }}>
                  Login / Register
                </Typography>
                <Typography sx={{ mt: 0.7, color: "#4b5f7b", fontSize: 24 / 2.0, lineHeight: 1.25 }}>
                  Please enter your Email ID
                </Typography>
              </Box>
              <IconButton onClick={closeLoginDialog} sx={{ color: "#374d6f", mt: -0.4, mr: -0.5 }}>
                <CloseRoundedIcon sx={{ fontSize: 26 }} />
              </IconButton>
            </Box>

            <Box sx={{ mt: 2.6 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#7e8ea5", mb: 0.7 }}>
                Email ID
              </Typography>
              <InputBase
                value={emailId}
                onChange={(event) => {
                  setEmailId(event.target.value);
                  if (emailError) setEmailError("");
                  if (generalError) setGeneralError("");
                }}
                placeholder="Enter your email id"
                fullWidth
                sx={{
                  height: 44,
                  border: "1px solid #d3d9e4",
                  borderRadius: "2px",
                  px: 1.3,
                  fontSize: 27 / 2.0,
                  color: "#132643",
                  "& .MuiInputBase-input::placeholder": {
                    color: "#8799b1",
                    opacity: 1,
                  },
                }}
              />
              {emailError && (
                <Typography sx={{ mt: 0.7, color: "#d3313f", fontSize: 12 }}>
                  {emailError}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => openCreateAccountStep("default")}
              disabled={!isGmailEmailFilled || isSubmitting}
              sx={{
                mt: 11.5,
                py: 1.05,
                borderRadius: "3px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 30 / 2.0,
                bgcolor: isGmailEmailFilled ? primaryBtnActive : primaryBtnInactive,
                boxShadow: "none",
                "&:hover": { bgcolor: isGmailEmailFilled ? "#0c6cc0" : primaryBtnInactive, boxShadow: "none" },
                "&.Mui-disabled": {
                  bgcolor: primaryBtnInactive,
                  color: "white",
                  opacity: 1,
                },
              }}
            >
              Continue
            </Button>
            {generalError && (
              <Typography sx={{ mt: 0.7, color: "#d3313f", fontSize: 12 }}>
                {generalError}
              </Typography>
            )}

            <Box sx={{ mt: 1.9, display: "flex", alignItems: "center", gap: 1.2 }}>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#d3dbe7" }} />
              <Typography sx={{ color: "#687d99", fontSize: 28 / 2.0, lineHeight: 1 }}>Or</Typography>
              <Box sx={{ flex: 1, height: 1, bgcolor: "#d3dbe7" }} />
            </Box>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => setLoginDialogStep("emailUsername")}
              sx={{
                mt: 1.9,
                py: 1.05,
                borderColor: "#bfc9d8",
                color: "#1d2f49",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 27 / 2.0,
                borderRadius: "2px",
                "&:hover": { borderColor: "#a9b8cc", bgcolor: "#f8fafc" },
              }}
            >
              Already have an account? Click here
            </Button>

            <Typography sx={{ mt: 1, color: "#6c7f9b", fontSize: 11 }}>
              By clicking you agree to Terms and Conditions
            </Typography>
          </DialogContent>
        ) : loginDialogStep === "password" ? (
          <DialogContent sx={{ px: 2.2, pt: 1.8, pb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={closeLoginDialog} sx={{ color: "#374d6f", mt: -0.4, mr: -0.3 }}>
                <CloseRoundedIcon sx={{ fontSize: 26 }} />
              </IconButton>
            </Box>

            <Typography sx={{ mt: -0.3, color: "#102747", fontSize: 36 / 2.0, fontWeight: 800, lineHeight: 1.2 }}>
              Enter Password
            </Typography>

            <Box sx={{ mt: 2.2, display: "flex", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Typography sx={{ color: "#324a6c", fontSize: 25 / 2.0, lineHeight: 1.25 }}>
                Your Password for
              </Typography>
              <Typography sx={{ color: "#0f7ad7", fontSize: 29 / 2.0, fontWeight: 700, lineHeight: 1.25 }}>
                {emailId || "your@email.com"}
              </Typography>
              <EditRoundedIcon sx={{ fontSize: 16, color: "#0f7ad7" }} />
            </Box>

            <Box sx={{ mt: 1.2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0f7ad7", mb: 0.6 }}>
                Password
              </Typography>
              <Box
                sx={{
                  height: 44,
                  border: "1px solid #0f7ad7",
                  borderRadius: "2px",
                  px: 1.1,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                <InputBase
                  type={showPasswordValue ? "text" : "password"}
                  value={passwordValue}
                  onChange={(event) => {
                    setPasswordValue(event.target.value);
                    if (passwordError) setPasswordError(false);
                    if (generalError) setGeneralError("");
                  }}
                  fullWidth
                  sx={{
                    fontSize: 13.5,
                    color: "#132643",
                    "& .MuiInputBase-input": { p: 0 },
                  }}
                />
                <IconButton onClick={() => setShowPasswordValue((prev) => !prev)} sx={{ p: 0.2, color: "#94a2b6" }}>
                  {showPasswordValue ? <VisibilityOutlinedIcon sx={{ fontSize: 21 }} /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 21 }} />}
                </IconButton>
              </Box>
              {passwordError && (
                <Typography sx={{ mt: 0.7, color: "#d3313f", fontSize: 12 }}>
                  {generalError || "Incorrect password. Please try again."}
                </Typography>
              )}
            </Box>

            <Typography
              onClick={() => {
                window.location.href = "/forgot-password";
              }}
              sx={{
                mt: 1.2,
                textAlign: "right",
                color: "#0f7ad7",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Forgot Password
            </Typography>

            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box
                component="input"
                type="checkbox"
                checked={getWhatsappUpdates}
                onChange={(event) => setGetWhatsappUpdates(event.target.checked)}
                sx={{ width: 14, height: 14, m: 0 }}
              />
              <Typography sx={{ color: "#4f647f", fontSize: 15 / 1.0 }}>
                Get updates via <Box component="span" sx={{ color: "#21a454", fontWeight: 700 }}>whatsapp</Box>
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handlePasswordContinue}
              disabled={!isPasswordFilled || isSubmitting}
              sx={{
                mt: 1.8,
                py: 1.05,
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 30 / 2.0,
                bgcolor: isPasswordFilled ? primaryBtnActive : primaryBtnInactive,
                boxShadow: "none",
                "&:hover": { bgcolor: isPasswordFilled ? "#0c6cc0" : primaryBtnInactive, boxShadow: "none" },
                "&.Mui-disabled": {
                  bgcolor: primaryBtnInactive,
                  color: "white",
                  opacity: 1,
                },
              }}
            >
              {isSubmitting ? "Please wait..." : "Continue"}
            </Button>
          </DialogContent>
        ) : loginDialogStep === "loginSuccess" ? (
          <DialogContent sx={{ px: 2.6, pt: 3.8, pb: 3.8 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              <CheckCircleRoundedIcon sx={{ color: "#29b346", fontSize: 56 }} />
              <Typography sx={{ mt: 1.5, color: "#102747", fontSize: 18, fontWeight: 700 }}>
                Logged in Successfully!
              </Typography>
              <Typography sx={{ mt: 0.8, color: "#5d708a", fontSize: 12 }}>
                Welcome back
              </Typography>
            </Box>
          </DialogContent>
        ) : loginDialogStep === "emailUsername" ? (
          <DialogContent sx={{ px: 2.6, pt: 1.8, pb: 1.4 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <IconButton onClick={() => setLoginDialogStep("default")} sx={{ color: "#374d6f", ml: -1 }}>
                <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
              </IconButton>
              <IconButton onClick={closeLoginDialog} sx={{ color: "#374d6f", mr: -0.5 }}>
                <CloseRoundedIcon sx={{ fontSize: 26 }} />
              </IconButton>
            </Box>

            <Typography sx={{ mt: 0.2, color: "#102747", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>
              Login / Register
            </Typography>
            <Typography sx={{ mt: 0.8, color: "#4b5f7b", fontSize: 12, lineHeight: 1.25 }}>
              Please enter your Email ID/Username
            </Typography>

            <Box sx={{ mt: 2.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#0f7ad7", mb: 0.7 }}>
                Email Id/Username
              </Typography>
              <InputBase
                value={emailId}
                onChange={(event) => setEmailId(event.target.value)}
                fullWidth
                sx={{
                  height: 44,
                  border: "1px solid #0f7ad7",
                  borderRadius: "2px",
                  px: 1.3,
                  fontSize: 13.5,
                  color: "#132643",
                }}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setLoginDialogStep("password")}
              disabled={!isIdentifierFilled || isSubmitting}
              sx={{
                mt: 10.5,
                py: 1.05,
                borderRadius: "3px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15,
                bgcolor: isIdentifierFilled ? primaryBtnActive : primaryBtnInactive,
                boxShadow: "none",
                "&:hover": { bgcolor: isIdentifierFilled ? "#0c6cc0" : primaryBtnInactive, boxShadow: "none" },
                "&.Mui-disabled": {
                  bgcolor: primaryBtnInactive,
                  color: "white",
                  opacity: 1,
                },
              }}
            >
              Continue
            </Button>
            {generalError && (
              <Typography sx={{ mt: 0.7, color: "#d3313f", fontSize: 12 }}>
                {generalError}
              </Typography>
            )}
          </DialogContent>
        ) : loginDialogStep === "createAccount" ? (
          <DialogContent sx={{ px: 2.6, pt: 1.8, pb: 1.7 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <IconButton onClick={() => setLoginDialogStep(createAccountBackStep)} sx={{ color: "#374d6f", ml: -1 }}>
                <ArrowBackRoundedIcon sx={{ fontSize: 24 }} />
              </IconButton>
              <IconButton onClick={closeLoginDialog} sx={{ color: "#374d6f", mr: -0.5 }}>
                <CloseRoundedIcon sx={{ fontSize: 26 }} />
              </IconButton>
            </Box>

            <Typography sx={{ mt: 0.1, color: "#102747", fontSize: 36 / 2.0, fontWeight: 800, lineHeight: 1.2 }}>
              Create Account
            </Typography>

            <InputBase
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                if (fullNameError) setFullNameError("");
              }}
              placeholder="Full Name"
              fullWidth
              sx={{
                mt: 1.7,
                height: 44,
                border: "1px solid #d3d9e4",
                borderRadius: "2px",
                px: 1.2,
                fontSize: 13.5,
                color: "#132643",
                "& .MuiInputBase-input::placeholder": { color: "#8b98ac", opacity: 1, fontWeight: 600 },
              }}
            />
            {fullNameError && (
              <Box sx={{ mt: 0.55, display: "flex", alignItems: "center", gap: 0.55 }}>
                <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
                <Typography sx={{ color: "#d3313f", fontSize: 14 / 1.0 }}>
                  {fullNameError}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mt: 1.1,
                height: 44,
                border: "1px solid #d3d9e4",
                borderRadius: "2px",
                px: 1.2,
                bgcolor: "#eef2f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#425a7a",
                fontSize: 13.5,
              }}
            >
              <Typography sx={{ fontSize: "inherit", color: "inherit", maxWidth: 250, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {emailId}
              </Typography>
              <LockOutlinedIcon sx={{ fontSize: 17, color: "#8695aa" }} />
            </Box>
            <Button
              onClick={() => setLoginDialogStep(createAccountBackStep)}
              sx={{
                minWidth: 0,
                mt: 0.5,
                px: 0,
                py: 0,
                color: "#0f7ad7",
                textTransform: "none",
                fontSize: 14 / 1.0,
                fontWeight: 600,
                justifyContent: "flex-start",
                "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
              }}
            >
              Change Email
            </Button>

            <InputBase
              value={phoneNumber}
              onChange={(event) => {
                const digitsOnly = event.target.value.replace(/\D/g, "").slice(0, 10);
                setPhoneNumber(digitsOnly);
                if (phoneError) setPhoneError("");
              }}
              placeholder="Phone Number"
              fullWidth
              sx={{
                mt: 1.1,
                height: 44,
                border: "1px solid #d3d9e4",
                borderRadius: "2px",
                px: 1.2,
                fontSize: 13.5,
                color: "#132643",
                "& .MuiInputBase-input::placeholder": { color: "#8b98ac", opacity: 1, fontWeight: 600 },
              }}
            />
            {phoneError && (
              <Box sx={{ mt: 0.55, display: "flex", alignItems: "center", gap: 0.55 }}>
                <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
                <Typography sx={{ color: "#d3313f", fontSize: 14 / 1.0 }}>
                  {phoneError}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mt: 1.1,
                height: 44,
                border: "1px solid #d3d9e4",
                borderRadius: "2px",
                px: 1.1,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <InputBase
                type={showCreatePassword ? "text" : "password"}
                value={createPassword}
                onChange={(event) => {
                  setCreatePassword(event.target.value);
                  if (createPasswordError) setCreatePasswordError("");
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                placeholder="Password"
                fullWidth
                sx={{
                  fontSize: 13.5,
                  color: "#132643",
                  "& .MuiInputBase-input": { p: 0 },
                  "& .MuiInputBase-input::placeholder": { color: "#8b98ac", opacity: 1, fontWeight: 600 },
                }}
              />
              <IconButton onClick={() => setShowCreatePassword((prev) => !prev)} sx={{ p: 0.2, color: "#94a2b6" }}>
                {showCreatePassword ? <VisibilityOutlinedIcon sx={{ fontSize: 21 }} /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 21 }} />}
              </IconButton>
            </Box>
            {createPasswordError && (
              <Box sx={{ mt: 0.55, display: "flex", alignItems: "center", gap: 0.55 }}>
                <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
                <Typography sx={{ color: "#d3313f", fontSize: 14 / 1.0 }}>
                  {createPasswordError}
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mt: 1.1,
                height: 44,
                border: "1px solid #d3d9e4",
                borderRadius: "2px",
                px: 1.1,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <InputBase
                type={showConfirmCreatePassword ? "text" : "password"}
                value={confirmCreatePassword}
                onChange={(event) => {
                  setConfirmCreatePassword(event.target.value);
                  if (confirmPasswordError) setConfirmPasswordError("");
                }}
                placeholder="Confirm Password"
                fullWidth
                sx={{
                  fontSize: 13.5,
                  color: "#132643",
                  "& .MuiInputBase-input": { p: 0 },
                  "& .MuiInputBase-input::placeholder": { color: "#8b98ac", opacity: 1, fontWeight: 600 },
                }}
              />
              <IconButton onClick={() => setShowConfirmCreatePassword((prev) => !prev)} sx={{ p: 0.2, color: "#94a2b6" }}>
                {showConfirmCreatePassword ? <VisibilityOutlinedIcon sx={{ fontSize: 21 }} /> : <VisibilityOffOutlinedIcon sx={{ fontSize: 21 }} />}
              </IconButton>
            </Box>
            {confirmPasswordError && (
              <Box sx={{ mt: 0.55, display: "flex", alignItems: "center", gap: 0.55 }}>
                <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
                <Typography sx={{ color: "#d3313f", fontSize: 14 / 1.0 }}>
                  {confirmPasswordError}
                </Typography>
              </Box>
            )}

            <Typography sx={{ mt: 1.6, color: "#132643", fontWeight: 700, fontSize: 31 / 2.0 }}>
              Are you a Real Estate Agent?
            </Typography>
            <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setAgentType("yes");
                  if (agentTypeError) setAgentTypeError("");
                }}
                sx={{
                  minWidth: 72,
                  py: 0.65,
                  borderRadius: "8px",
                  borderColor: agentType === "yes" ? "#0f7ad7" : "#d3d9e4",
                  color: "#405471",
                  textTransform: "none",
                  fontSize: 14 / 1.0,
                  fontWeight: 600,
                }}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setAgentType("no");
                  if (agentTypeError) setAgentTypeError("");
                }}
                sx={{
                  minWidth: 72,
                  py: 0.65,
                  borderRadius: "8px",
                  borderColor: agentType === "no" ? "#0f7ad7" : "#d3d9e4",
                  color: "#405471",
                  textTransform: "none",
                  fontSize: 14 / 1.0,
                  fontWeight: 600,
                }}
              >
                No
              </Button>
            </Box>
            {agentTypeError && (
              <Box sx={{ mt: 0.55, display: "flex", alignItems: "center", gap: 0.55 }}>
                <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
                <Typography sx={{ color: "#d3313f", fontSize: 14 / 1.0 }}>
                  {agentTypeError}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 1.6, display: "flex", alignItems: "center", gap: 0.9 }}>
              <Box
                component="input"
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(event) => {
                  setIsTermsAccepted(event.target.checked);
                  if (event.target.checked) {
                    setShowTermsError(false);
                  }
                }}
                sx={{ width: 15, height: 15, m: 0 }}
              />
              <Typography sx={{ fontSize: 11, color: "#5d6f88" }}>
                I agree to the <Box component="span" sx={{ color: "#0f7ad7", fontWeight: 600 }}>Terms & Conditions</Box> and <Box component="span" sx={{ color: "#0f7ad7", fontWeight: 600 }}>Privacy Policy</Box>
              </Typography>
            </Box>
            {showTermsError && (
              <Box sx={{ mt: 0.55, display: "flex", alignItems: "center", gap: 0.55 }}>
                <ErrorRoundedIcon sx={{ color: "#d3313f", fontSize: 14 }} />
                <Typography sx={{ color: "#d3313f", fontSize: 14 / 1.0 }}>
                  This is required for creating an account
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleCreateAccount}
              disabled={isSubmitting}
              sx={{
                mt: 2.1,
                py: 1.05,
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 30 / 2.0,
                bgcolor: primaryBtnActive,
                boxShadow: "none",
                "&:hover": { bgcolor: "#0c6cc0", boxShadow: "none" },
              }}
            >
              {isSubmitting ? "Please wait..." : "Create Account"}
            </Button>
            {generalError && (
              <Typography sx={{ mt: 0.8, color: "#d3313f", fontSize: 12 }}>
                {generalError}
              </Typography>
            )}
          </DialogContent>
        ) : loginDialogStep === "verifyEmailOtp" ? (
          <DialogContent sx={{ px: 2.2, pt: 1.8, pb: 1.8 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={closeLoginDialog} sx={{ color: "#374d6f", mt: -0.4, mr: -0.3 }}>
                <CloseRoundedIcon sx={{ fontSize: 26 }} />
              </IconButton>
            </Box>

            <Typography sx={{ mt: -0.4, color: "#102747", fontSize: 37 / 2.0, fontWeight: 800, lineHeight: 1.2 }}>
              Verify your email
            </Typography>

            <Box sx={{ mt: 1, display: "inline-flex", alignItems: "center", gap: 0.55 }}>
              <Typography sx={{ color: "#102747", fontSize: 34 / 2.0, fontWeight: 700, lineHeight: 1.2 }}>
                {maskEmail(emailId)}
              </Typography>
              <IconButton onClick={() => setLoginDialogStep("createAccount")} sx={{ p: 0.2, color: "#0f7ad7" }}>
                <EditRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <Typography sx={{ mt: 0.2, color: "#5d708a", fontSize: 11.5 }}>
              {otpInfoMessage || "OTP sent to your email."}
            </Typography>

            <Typography sx={{ mt: 3.7, color: "#1f3558", fontSize: 15, fontWeight: 700 }}>
              Enter your 4 digit OTP
            </Typography>

            <Box sx={{ mt: 1.2, display: "flex", gap: 1.2 }}>
              {otpDigits.map((digit, index) => (
                <InputBase
                  key={`otp-${index}`}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onPaste={(event) => handleOtpPaste(index, event)}
                  inputRef={(element) => {
                    otpInputRefs.current[index] = element;
                  }}
                  inputProps={{ maxLength: 1, inputMode: "numeric", autoComplete: "one-time-code" }}
                  sx={{
                    width: 46,
                    height: 46,
                    border: "1px solid #d3d9e4",
                    borderRadius: "2px",
                    px: 0,
                    "& .MuiInputBase-input": {
                      textAlign: "center",
                      fontSize: 20 / 1.0,
                      color: "#102747",
                      p: 0,
                    },
                  }}
                />
              ))}
            </Box>

            <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography sx={{ color: "#5d708a", fontSize: 24 / 2.0 }}>
                Haven't received yet?
              </Typography>
              <Button
                onClick={handleResendOtp}
                disabled={isSubmitting}
                sx={{
                  minWidth: 0,
                  px: 0,
                  py: 0,
                  color: "#0f7ad7",
                  textTransform: "none",
                  fontSize: 31 / 2.0,
                  fontWeight: 700,
                  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
                }}
              >
                Resend OTP
              </Button>
            </Box>
            {generalError && (
              <Typography sx={{ mt: 0.8, color: "#d3313f", fontSize: 12 }}>
                {generalError}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleVerifyAndContinue}
              disabled={!isOtpFilled || isSubmitting}
              sx={{
                mt: 5.3,
                py: 1.05,
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 30 / 2.0,
                bgcolor: isOtpFilled ? primaryBtnActive : primaryBtnInactive,
                boxShadow: "none",
                "&:hover": { bgcolor: isOtpFilled ? "#0c6cc0" : primaryBtnInactive, boxShadow: "none" },
                "&.Mui-disabled": {
                  bgcolor: primaryBtnInactive,
                  color: "white",
                  opacity: 1,
                },
              }}
            >
              {isSubmitting ? "Please wait..." : "Verify & Continue"}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={handleVerifyViaEmailLink}
              disabled={isSubmitting}
              sx={{
                mt: 1.8,
                py: 1.05,
                borderColor: "#0f7ad7",
                color: "#0f64be",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 17 / 1.0,
                borderRadius: "3px",
                "&:hover": { borderColor: "#0d5aaa", bgcolor: "#f7fbff" },
              }}
            >
              {isSubmitting ? "Please wait..." : "Or, Verify via Email Link"}
            </Button>
            {emailLinkMessage && (
              <Typography sx={{ mt: 0.8, color: "#3c6389", fontSize: 12 }}>
                {emailLinkMessage}
              </Typography>
            )}
          </DialogContent>
        ) : (
          <DialogContent sx={{ px: 2.6, pt: 1.6, pb: 1.7, minHeight: 170 }}>
            <Box
              sx={{
                mt: 2.8,
                border: "1px solid #b7e7c6",
                bgcolor: "#f3fff7",
                borderRadius: "10px",
                minHeight: 88,
                px: 1.7,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.1,
              }}
            >
              <CheckCircleRoundedIcon sx={{ color: "#1ea74c", fontSize: 29 }} />
              <Box>
                <Typography sx={{ color: "#1f2f49", fontSize: 17, fontWeight: 700 }}>
                  Account created successfully
                </Typography>
                <Typography sx={{ color: "#476285", fontSize: 12.5, mt: 0.1 }}>
                  You can now use the website.
                </Typography>
              </Box>
            </Box>
          </DialogContent>
        )}
      </Dialog>

      {showStickyArrow && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            minWidth: 0,
            width: 46,
            height: 46,
            borderRadius: "50%",
            bgcolor: "#cde9ff",
            color: "#0f7ad7",
            position: "fixed",
            right: { xs: 18, md: 30 },
            bottom: { xs: 18, md: 24 },
            zIndex: 1200,
            "&:hover": { bgcolor: "#bbdefa" },
          }}
        >
          <ArrowUpwardRoundedIcon />
        </Button>
      )}
    </Box>
  );
}
