import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Divider, InputBase, Typography } from "@mui/material";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Navbar from "../components/Navbar";
import { getAuthToken } from "../utils/authStorage";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function PostPropertyMediaDetails() {
  const videoInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const [selectedVideoName, setSelectedVideoName] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState(0);
  const [showPhotoInfo, setShowPhotoInfo] = useState(true);
  const [propertyDescription, setPropertyDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSaving, setIsSaving] = useState(false);
  const propertyScorePercent = 65;

  useEffect(() => {
    let cancelled = false;

    const hydrateFromSaved = (saved) => {
      if (!saved || typeof saved !== "object") return;

      const media = saved?.mediaDetails || saved || {};
      const photos = Array.isArray(media?.photos)
        ? media.photos
            .map((item) => ({
              name: String(item?.name || item?.fileName || "photo").trim() || "photo",
              url: String(item?.url || "").trim(),
              isCover: Boolean(item?.isCover),
            }))
            .filter((item) => Boolean(item.url))
        : [];

      const coverIndex = photos.findIndex((item) => item.isCover);
      const videoFileName = String(
        media?.video?.fileName ||
          media?.videoFileName ||
          media?.videoName ||
          ""
      ).trim();
      const description = String(
        media?.propertyDescription ||
          media?.description ||
          ""
      ).trim();
      const email = String(media?.contactEmail || "").trim();

      setSelectedPhotos(photos);
      setCoverPhotoIndex(coverIndex >= 0 ? coverIndex : 0);
      setSelectedVideoName(videoFileName);
      setPropertyDescription(description);
      setContactEmail(email);
    };

    const load = async () => {
      const propertyId = String(localStorage.getItem("postPropertyId") || "").trim();
      const token = getAuthToken();

      // Fallback hydrate from localStorage draft first.
      try {
        const raw = localStorage.getItem("postPropertyMediaDetails");
        if (raw) hydrateFromSaved(JSON.parse(raw));
      } catch {
        // Ignore malformed local draft.
      }

      if (!token || !propertyId) return;

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
        const paths = [
          `/api/properties/${encodeURIComponent(propertyId)}`,
          `/api/properties/details/${encodeURIComponent(propertyId)}`,
          `/api/properties/property-details/${encodeURIComponent(propertyId)}`,
        ];

        for (const path of paths) {
          const response = await fetch(`${apiBaseUrl}${path}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) continue;

          const payload = result?.data || result?.property || result || {};
          if (!payload || typeof payload !== "object") continue;

          if (!cancelled) {
            hydrateFromSaved(payload);
          }
          return;
        }
      } catch {
        // Keep fallback local values.
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stepItems = [
    { title: "Basic Details", step: "Step 1", done: true },
    { title: "Location Details", step: "Step 2", done: true },
    { title: "Property Profile", step: "Step 3", done: true },
    { title: "Photos, Videos & Voice-over", step: "Step 4", active: true },
    { title: "Other details", step: "Step 5" },
  ];

  const handlePhotoSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    const nextPhotos = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await fileToDataUrl(file),
      }))
    );
    setSelectedPhotos((prev) => [...prev, ...nextPhotos]);
  };

  const removePhoto = (indexToRemove) => {
    setSelectedPhotos((prev) => {
      const next = prev.filter((_, index) => index !== indexToRemove);
      if (next.length === 0) setCoverPhotoIndex(0);
      else if (coverPhotoIndex >= next.length) setCoverPhotoIndex(0);
      return next;
    });
  };

  const handleSaveAndContinue = async () => {
    const token = getAuthToken();
    const propertyId = String(localStorage.getItem("postPropertyId") || "").trim();
    if (!token) {
      setStatus({ type: "error", message: "Login token missing. Please login again." });
      return;
    }
    if (!propertyId) {
      setStatus({ type: "error", message: "Property ID missing. Please complete previous steps first." });
      return;
    }

    try {
      setIsSaving(true);
      setStatus({ type: "", message: "" });
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      const response = await fetch(`${apiBaseUrl}/api/properties/media-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId,
          completionPercent: propertyScorePercent,
          video: {
            url: "",
            title: selectedVideoName ? "Property video" : "",
            fileName: selectedVideoName,
          },
          photos: selectedPhotos.map((photo, index) => ({
            url: String(photo?.url || ""),
            name: String(photo?.name || ""),
            caption: "",
            order: index,
            isCover: index === coverPhotoIndex,
          })),
          propertyDescription: propertyDescription.trim(),
          contactEmail: contactEmail.trim(),
          continueWithoutPhotos: selectedPhotos.length === 0,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setStatus({ type: "error", message: result?.message || "Unable to save media details." });
        return;
      }

      localStorage.setItem(
        "postPropertyMediaDetails",
        JSON.stringify({
          videoFileName: selectedVideoName,
          photos: selectedPhotos.map((photo, index) => ({
            name: String(photo?.name || ""),
            url: String(photo?.url || ""),
            order: index,
            isCover: index === coverPhotoIndex,
          })),
          propertyDescription: propertyDescription.trim(),
          contactEmail: contactEmail.trim(),
        })
      );
      setStatus({ type: "success", message: "Media details saved successfully." });
      window.setTimeout(() => {
        window.location.href = "/post-property-amenities-details";
      }, 220);
    } catch {
      setStatus({ type: "error", message: "Unable to connect to server." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f7", fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif' }}>
      <Navbar sticky />

      <Box
        sx={{
          mt: { xs: "56px", md: "54px" },
          maxWidth: 968,
          mx: "auto",
          minHeight: "calc(100vh - 56px)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "220px 1fr 255px" },
          gap: 0,
        }}
      >
        <Box sx={{ px: { xs: 2, md: 0 }, pt: { xs: 2.5, md: 2.9 }, position: { md: "sticky" }, top: { md: 70 }, alignSelf: { md: "start" } }}>
          <Box sx={{ bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.15, py: 2.05, minHeight: 252 }}>
            {stepItems.map((item, index, all) => (
              <Box key={item.title} sx={{ display: "flex", alignItems: "flex-start", gap: 1.15, pb: index === all.length - 1 ? 0 : 1.5 }}>
                <Box sx={{ position: "relative", width: 16, height: 28, display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "1px solid #6792c8",
                      bgcolor: item.done || item.active ? "#0f73cb" : "transparent",
                      color: "white",
                      fontSize: 10,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {item.done ? <CheckRoundedIcon sx={{ fontSize: 10 }} /> : ""}
                  </Box>
                  {index !== all.length - 1 && <Box sx={{ position: "absolute", top: 15, width: "1px", height: 23, bgcolor: "#c8d6ea" }} />}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 9.2, color: "#102445", lineHeight: 1.15, fontWeight: item.active ? 700 : 400 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 9.2, color: "#8394ac", mt: 0.2 }}>{item.step}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 1.8, bgcolor: "#eceef3", border: "1px solid #e0e4ec", borderRadius: "10px", px: 2.1, py: 2.1, display: "flex", alignItems: "center", gap: 1.6 }}>
            <Box sx={{ width: 52, height: 52, borderRadius: "50%", background: `conic-gradient(#28b14a ${propertyScorePercent * 3.6}deg, #cfd4dc 0deg)`, p: "3px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", bgcolor: "#eceef3", display: "flex", alignItems: "center", justifyContent: "center", color: "#102445", fontSize: 10, fontWeight: 700 }}>
                {propertyScorePercent}%
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#102445", lineHeight: 1.2 }}>Property Score</Typography>
              <Typography sx={{ fontSize: 10.5, color: "#7f90a7", lineHeight: 1.3, mt: 0.2 }}>
                Better your property score,
                <br />
                greater your visibility
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ bgcolor: "white", borderLeft: { md: "1px solid #e4e7ed" }, borderRight: { md: "1px solid #e4e7ed" }, px: { xs: 2, md: 2.4 }, pt: { xs: 2.5, md: 2.9 }, pb: 3 }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.2, color: "#6f7f98", fontSize: 10.5, cursor: "pointer" }} onClick={() => { window.location.href = "/post-property-profile-details"; }}>
            <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 17 }} />
            Back
          </Box>

          <Typography sx={{ mt: 0.9, fontSize: 16.5, fontWeight: 700, color: "#102445" }}>Add one video of property</Typography>
          <Typography sx={{ mt: 0.2, fontSize: 10, color: "#90a1b7" }}>A video is worth a thousand pictures. Properties with videos get higher visibility.</Typography>

          <Box sx={{ mt: 1.0, border: "1px dashed #8ec3ef", bgcolor: "#f8fcff", borderRadius: "3px", overflow: "hidden" }}>
            <Box
              onClick={() => videoInputRef.current?.click()}
              sx={{
                px: 1.0,
                py: 0.7,
                borderBottom: "1px solid #0f73cb",
                textAlign: "center",
                fontSize: 11,
                color: "#102445",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Upload Video
            </Box>
            <Box sx={{ p: 1.4, textAlign: "center" }}>
              <Typography sx={{ fontSize: 22, lineHeight: 1, color: "#4ca2e6" }}>📹</Typography>
              <Typography sx={{ mt: 0.6, fontSize: 10, color: "#6d83a0" }}>
                Drag your videos here or{" "}
                <Box component="span" onClick={() => videoInputRef.current?.click()} sx={{ color: "#0f73cb", cursor: "pointer", fontWeight: 700 }}>
                  Upload
                </Box>
              </Typography>
              <Typography sx={{ mt: 0.45, fontSize: 9.5, color: "#8095b1" }}>Upload video of max size 80 MB in format .mov, .mp4, .H264 . Video duration should be less than 10 mins.</Typography>
              {selectedVideoName && <Typography sx={{ mt: 0.55, fontSize: 9.8, color: "#0f73cb", fontWeight: 700 }}>{selectedVideoName}</Typography>}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/*,.mp4,.mov,.h264"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setSelectedVideoName(file ? file.name : "");
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 0.9, bgcolor: "#fff8e8", border: "1px solid #ffe2a8", borderRadius: "3px", p: 0.8 }}>
            <Typography sx={{ fontSize: 10, color: "#9b6b00" }}>Don&apos;t have a Video? We can help you create one with our Add Plan feature.</Typography>
          </Box>

          <Typography sx={{ mt: 1.2, fontSize: 16, fontWeight: 700, color: "#102445" }}>Add photos of your property</Typography>
          <Typography sx={{ mt: 0.2, fontSize: 10, color: "#90a1b7" }}>A picture is worth a thousand words. Better your photos, better your chances.</Typography>

          {selectedPhotos.length === 0 ? (
            <Box
              onClick={() => photoInputRef.current?.click()}
              sx={{ mt: 1.0, border: "1px dashed #8ec3ef", bgcolor: "#f8fcff", borderRadius: "3px", p: 1.6, textAlign: "center", cursor: "pointer" }}
            >
              <Typography sx={{ fontSize: 10.5, color: "#0f73cb", fontWeight: 700 }}>+ Add atleast 5 photos</Typography>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  photoInputRef.current?.click();
                }}
                sx={{ mt: 1.0, textTransform: "none", fontSize: 10.5, bgcolor: "#0f73cb", boxShadow: "none", "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" } }}
              >
                Upload Photos Now
              </Button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                multiple
                style={{ display: "none" }}
                onChange={handlePhotoSelect}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 0.8 }}>
              {showPhotoInfo && (
                <Box sx={{ mb: 0.7, bgcolor: "#e8f3ff", border: "1px solid #c9e2ff", borderRadius: "2px", px: 0.8, py: 0.55, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.8 }}>
                  <Box sx={{ display: "flex", gap: 0.45, color: "#35597e" }}>
                    <InfoOutlinedIcon sx={{ fontSize: 12 }} />
                    <Typography sx={{ fontSize: 9.2, lineHeight: 1.35 }}>
                      Feel free to move to the next step.
                      <br />
                      Your photos will continue to upload in background
                    </Typography>
                  </Box>
                  <CloseRoundedIcon onClick={() => setShowPhotoInfo(false)} sx={{ fontSize: 12, color: "#617c9f", cursor: "pointer" }} />
                </Box>
              )}

              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 0.65 }}>
                {selectedPhotos.map((photo, index) => (
                  <Box key={`${photo.name}-${index}`} sx={{ position: "relative", border: "1px solid #d2dfef", borderRadius: "3px", overflow: "hidden", bgcolor: "white" }}>
                    <Box component="img" src={photo.url} alt={photo.name} sx={{ width: "100%", height: 98, objectFit: "cover", display: "block" }} />
                    <CloseRoundedIcon onClick={() => removePhoto(index)} sx={{ position: "absolute", right: 4, top: 4, fontSize: 14, color: "white", bgcolor: "rgba(0,0,0,0.45)", borderRadius: "50%", p: "1px", cursor: "pointer" }} />
                    <Box sx={{ px: 0.5, py: 0.25, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 8.6, color: "#35597e" }}>
                      <Typography sx={{ fontSize: 8.6, maxWidth: 62, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{photo.name}</Typography>
                      <Typography onClick={() => setCoverPhotoIndex(index)} sx={{ fontSize: 8.4, color: coverPhotoIndex === index ? "white" : "#0f73cb", bgcolor: coverPhotoIndex === index ? "#2b2f36" : "transparent", px: 0.55, borderRadius: "2px", cursor: "pointer" }}>
                        {coverPhotoIndex === index ? "Cover photo" : "Set cover"}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                <Box
                  onClick={() => photoInputRef.current?.click()}
                  sx={{ border: "1px dashed #8ec3ef", borderRadius: "3px", bgcolor: "#f8fcff", minHeight: 122, p: 0.75, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
                >
                  <Typography sx={{ fontSize: 17, color: "#4ca2e6", lineHeight: 1 }}>☁</Typography>
                  <Typography sx={{ mt: 0.3, fontSize: 9.4, color: "#6d83a0", fontWeight: 700 }}>Add more photos</Typography>
                  <Typography sx={{ mt: 0.15, fontSize: 8.3, color: "#8ca1b8", lineHeight: 1.3 }}>Upload upto 50 photos of max size 10 MB in format png, jpg, jpeg, HEIC, heif</Typography>
                  <Button variant="contained" sx={{ mt: 0.55, textTransform: "none", fontSize: 9.5, minWidth: 95, height: 24, bgcolor: "#0f73cb", boxShadow: "none", "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" } }}>
                    Upload Photos
                  </Button>
                </Box>
              </Box>
              <input ref={photoInputRef} type="file" accept="image/*,.jpg,.jpeg,.png,.webp" multiple style={{ display: "none" }} onChange={handlePhotoSelect} />
            </Box>
          )}

          <Typography sx={{ mt: 1.1, fontSize: 24 / 2, fontWeight: 700, color: "#243c5a" }}>What makes your property unique</Typography>
          <Typography sx={{ mt: 0.12, fontSize: 9.6, color: "#90a1b7" }}>Adding description will increase your listing visibility</Typography>
          <Box sx={{ mt: 0.45, width: "100%", border: "1px solid #d8deea", bgcolor: "white", px: 0.8, py: 0.6 }}>
            <InputBase
              multiline
              minRows={4}
              value={propertyDescription}
              onChange={(e) => setPropertyDescription(String(e.target.value || "").slice(0, 5000))}
              placeholder="Share some details about your property like spacious rooms, well maintained facilities..."
              sx={{ fontSize: 11.5, width: "100%" }}
            />
          </Box>
          <Box sx={{ mt: 0.25, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 9, color: "#8fa1b8" }}>
            <Box>Minimum 30 characters required</Box>
            <Box>{propertyDescription.length}/5000</Box>
          </Box>
          <Box sx={{ mt: 0.45, display: "flex", alignItems: "center", gap: 0.5, color: "#7f90a7", fontSize: 10 }}>
            <LightbulbOutlinedIcon sx={{ fontSize: 12.5, color: "#4ea0e0" }} />
            <Typography sx={{ fontSize: 10, color: "#7f90a7" }}>
              Need help in writing ?{" "}
              <Box
                component="span"
                onClick={() =>
                  setPropertyDescription(
                    "This well-maintained property offers spacious and well-ventilated rooms, abundant natural light, and a practical layout ideal for family living. It is located in a prime area with easy access to schools, markets, hospitals, and public transport. The home is in good condition with quality fittings and a peaceful neighborhood, making it a comfortable and convenient choice for tenants."
                  )
                }
                sx={{ color: "#0f73cb", cursor: "pointer", fontWeight: 700 }}
              >
                Yes, Write for me
              </Box>
            </Typography>
          </Box>

          <Typography sx={{ mt: 1.0, fontSize: 12, fontWeight: 700, color: "#243c5a" }}>Add Email (Optional)</Typography>
          <Box sx={{ mt: 0.45, width: 226, border: "1px solid #d8deea", bgcolor: "white", px: 0.8, py: 0.6 }}>
            <InputBase value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" sx={{ fontSize: 11.5, width: "100%" }} />
          </Box>

          {status.message && (
            <Alert severity={status.type || "info"} sx={{ mt: 1.0, py: 0.2, "& .MuiAlert-message": { fontSize: 12 } }}>
              {status.message}
            </Alert>
          )}

          <Button onClick={handleSaveAndContinue} disabled={isSaving} variant="contained" sx={{ mt: 1.3, minWidth: 132, height: 37, textTransform: "none", fontWeight: 700, fontSize: 12, bgcolor: "#0f73cb", borderRadius: "4px", boxShadow: "none", px: 2.2, "&:hover": { bgcolor: "#0c66b4", boxShadow: "none" } }}>
            {isSaving ? "Saving..." : "Save and Continue"}
          </Button>
        </Box>

        <Box sx={{ bgcolor: "#eaecf1", px: 1.45, pt: 1.95, pb: 1.8, display: "flex", flexDirection: "column", position: { md: "sticky" }, top: { md: 70 }, height: { md: "calc(100vh - 70px)" }, justifyContent: { md: "space-between" }, alignSelf: { md: "start" } }}>
          <Box sx={{ mt: 0.2, textAlign: "center" }}>
            <Box
              component="img"
              src="https://www.99acres.com/ppf-static/media/Photos.a374d44a.png"
              alt="Photo tips"
              sx={{ width: 116, height: "auto", mx: "auto", display: "block" }}
            />
            <Typography sx={{ mt: 0.8, fontSize: 11.2, color: "#556b86", fontWeight: 700 }}>Make your pictures perfect</Typography>
            <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2.4, display: "inline-block", textAlign: "left", color: "#607894", fontSize: 10.4, lineHeight: 1.5 }}>
              <li>Capture photos in landscape mode.</li>
              <li>Avoid clicking photos during day.</li>
              <li>Try to opt for better impact.</li>
              <li>Edit with 99acres filters for finish.</li>
            </Box>
          </Box>

          <Box sx={{ bgcolor: "#eceef3", border: "1px solid #dde2ea", borderRadius: "3px", px: 1.2, py: 1.05 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.45, color: "#7386a0" }}>
              <LocalPhoneOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography sx={{ fontSize: 12.5 }}>Need help ?</Typography>
            </Box>
            <Divider sx={{ my: 0.55, borderColor: "#dce2eb" }} />
            <Typography sx={{ fontSize: 10.5, color: "#6c7f98", lineHeight: 1.45 }}>
              You can email us at{" "}
              <Box component="span" sx={{ color: "#0f73cb" }}>
                services@99acres.com
              </Box>
              <br />
              or call us at{" "}
              <Box component="span" sx={{ color: "#0f73cb", fontWeight: 700 }}>
                1800 41 99099
              </Box>{" "}
              (IND Toll-Free).
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
