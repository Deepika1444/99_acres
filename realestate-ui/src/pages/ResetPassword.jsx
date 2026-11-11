import { Box, Button, InputBase, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ResetPassword() {
  const token = useMemo(() => new URLSearchParams(window.location.search).get("token") || "", []);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasResetSucceeded = Boolean(success);

  const handleSubmit = async () => {
    if (!token) {
      setError("Reset link is invalid or missing token.");
      setSuccess("");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Both password fields are required.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setSuccess("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      setSuccess(data.message || "Password reset successful.");
      setNewPassword("");
      setConfirmPassword("");
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
              Create a New Password
            </Typography>
          </Box>

          <Box sx={{ px: { xs: 1.8, md: 2.4 }, py: { xs: 2.2, md: 2.6 } }}>
            <Typography sx={{ color: "#1f3556", fontSize: 14.5, fontWeight: 700 }}>
              Your password should be 8 or more characters in length
              <Box component="span" sx={{ color: "#d73a49", fontWeight: 500, ml: 1 }}>
                Fields marked * are mandatory
              </Box>
            </Typography>

            {!hasResetSucceeded && (
              <>
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
                    New Password:
                  </Typography>
                  <InputBase
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
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

                <Box
                  sx={{
                    mt: 1.2,
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
                    Confirm Password:
                  </Typography>
                  <InputBase
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
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
              </>
            )}

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

            {hasResetSucceeded ? (
              <Button
                variant="contained"
                onClick={() => {
                  window.location.href = "/?openLogin=1";
                }}
                sx={{
                  mt: 1.6,
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
                Login
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{
                  mt: 1.6,
                  ml: { md: "220px" },
                  minWidth: 132,
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
                {isSubmitting ? "Submitting..." : "Create New Password"}
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
