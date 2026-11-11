import { Box, Button, InputBase, Typography } from "@mui/material";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const value = String(identifier || "").trim();
    if (!value) {
      setSuccess("");
      setError("Please enter Email ID or Username");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: value }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to process your request right now.");
        return;
      }

      setSuccess(
        data.message || "If this account exists, a password reset link will be sent to your email."
      );
    } catch (_error) {
      setError("Unable to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f2f4f8" }}>
      <Navbar sticky />

      <Box sx={{ pt: { xs: 9, md: 10 }, px: { xs: 1.5, md: 0 } }}>
        <Box
          sx={{
            maxWidth: "980px",
            mx: "auto",
            border: "1px solid #c8d0db",
            bgcolor: "#fff",
          }}
        >
          <Box sx={{ px: 1.5, py: 1.2, borderBottom: "1px solid #c8d0db" }}>
            <Typography sx={{ color: "#1b2f4b", fontSize: 28 / 2.0, fontWeight: 700 }}>
              Forgot Password
            </Typography>
          </Box>

          <Box sx={{ px: { xs: 1.8, md: 2.4 }, py: { xs: 2.2, md: 2.6 } }}>
            <Typography sx={{ color: "#1f3556", fontSize: 29 / 2.0, fontWeight: 700 }}>
              Enter your email or username to create a new password
            </Typography>

            <Box
              sx={{
                mt: 1.8,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
                alignItems: "center",
                gap: 1.2,
              }}
            >
              <Typography sx={{ color: "#1f3556", fontSize: 15 / 1.0, textAlign: { md: "right" } }}>
                <Box component="span" sx={{ color: "#d73a49" }}>
                  *
                </Box>{" "}
                Enter Email id or Username:
              </Typography>
              <InputBase
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  if (error) setError("");
                  if (success) setSuccess("");
                }}
                sx={{
                  height: 42,
                  border: "1px solid #c8d0db",
                  borderRadius: "2px",
                  px: 1.2,
                  fontSize: 13.5,
                  color: "#132643",
                  width: { xs: "100%", md: "340px" },
                  maxWidth: "100%",
                }}
              />
            </Box>

            {error && (
              <Typography sx={{ mt: 1.2, color: "#d3313f", fontSize: 12.5 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography sx={{ mt: 1.2, color: "#137a3f", fontSize: 12.5 }}>
                {success}
              </Typography>
            )}

            <Typography sx={{ mt: 1.8, color: "#1f3556", fontSize: 14 / 1.0 }}>
              On Submit, an email with a link to create a password will be sent to your email
            </Typography>

            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isSubmitting}
              sx={{
                mt: 1.7,
                minWidth: 92,
                py: 0.8,
                borderRadius: "4px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: 15 / 1.0,
                bgcolor: "#0f7ad7",
                boxShadow: "none",
                "&:hover": { bgcolor: "#0d6abd", boxShadow: "none" },
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
