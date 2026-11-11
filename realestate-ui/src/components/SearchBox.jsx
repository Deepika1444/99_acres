import { Box, Button, Card, Divider, InputBase, Typography } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import KeyboardVoiceRoundedIcon from "@mui/icons-material/KeyboardVoiceRounded";

export default function SearchBox({
  cityQuery = "",
  cityOptions = [],
  cityLoading = false,
  onCityQueryChange,
  onCitySelect,
  onSearch,
}) {
  return (
    <Card
      sx={{
        position: "absolute",
        bottom: { xs: -72, md: -78 },
        left: "50%",
        transform: "translateX(-50%)",
        width: { xs: "calc(100% - 24px)", md: "74%" },
        borderRadius: "18px",
        boxShadow: "0 8px 24px rgba(18, 41, 76, 0.2)",
        overflow: "visible",
        zIndex: 30,
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 2 },
          pt: { xs: 2, md: 2.1 },
          pb: { xs: 1.1, md: 1.2 },
          display: "flex",
          alignItems: "center",
          overflowX: { xs: "auto", md: "visible" },
          flexWrap: "nowrap",
          bgcolor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.8, md: 2 },
            minWidth: { xs: "max-content", md: 0 },
            flexWrap: "nowrap",
            flex: 1,
            justifyContent: { xs: "flex-start", md: "space-between" },
            pr: { md: 1.2 },
          }}
        >
          {["Buy", "Rent", "New Launch", "Commercial", "Plots/Land", "Projects"].map(
            (item) => (
              <Typography
                key={item}
                sx={{
                  fontSize: { xs: 15, md: 16 },
                  fontWeight: item === "Buy" ? 700 : 600,
                  color: "#33486a",
                  pb: 1.6,
                  borderBottom: item === "Buy" ? "3px solid #0f8cff" : "3px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {item}
                {item === "New Launch" && (
                  <Box
                    component="span"
                    sx={{
                      ml: 0.4,
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      display: "inline-block",
                      bgcolor: "#ff4040",
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </Typography>
            )
          )}
        </Box>

        <Typography
          sx={{
            ml: { xs: 1.6, md: 1.2 },
            color: "#33486a",
            fontSize: { xs: 15, md: 16 },
            fontWeight: 700,
            whiteSpace: "nowrap",
            display: "inline-flex",
            borderLeft: "1px solid #dde4ee",
            pl: { xs: 1.6, md: 1.2 },
            pb: 1.6,
            borderBottom: "3px solid transparent",
            alignItems: "center",
            flexShrink: 0,
            lineHeight: 1.2,
          }}
        >
          Post Property
          <Box
            component="span"
            sx={{
              ml: 0.9,
              px: 0.6,
              borderRadius: "3px",
              fontSize: 12,
              bgcolor: "#1eb35f",
              color: "white",
              lineHeight: 1.25,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              alignSelf: "center",
            }}
          >
            FREE
          </Box>
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 1.8, md: 2 },
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.2, md: 2 },
          flexWrap: { xs: "wrap", md: "nowrap" },
          bgcolor: "#fff",
        }}
      >
        <Button
          endIcon={<KeyboardArrowDownRoundedIcon />}
          sx={{
            color: "#33486a",
            px: 0.4,
            py: 0.8,
            minWidth: "fit-content",
            textTransform: "none",
            fontSize: { xs: 14, md: 16 },
            fontWeight: 600,
          }}
        >
          All Residential
        </Button>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", md: 260 },
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            color: "#7d8ba1",
            position: "relative",
          }}
        >
          <SearchRoundedIcon sx={{ fontSize: 24 }} />
          <InputBase
            value={cityQuery}
            onChange={(event) => onCityQueryChange?.(event.target.value)}
            placeholder='Search "Hyderabad"'
            sx={{
              flex: 1,
              color: "#6b7990",
              fontSize: { xs: 14, md: 15 },
              "& .MuiInputBase-input::placeholder": { color: "#6b7990", opacity: 1 },
            }}
          />

          {(cityLoading || cityOptions.length > 0) && (
            <Box
              sx={{
                position: "absolute",
                left: 34,
                right: 0,
                top: "calc(100% + 8px)",
                bgcolor: "#fff",
                border: "1px solid #d9e1ec",
                borderRadius: "12px",
                boxShadow: "0 10px 24px rgba(19, 39, 69, 0.12)",
                overflow: "hidden",
                zIndex: 20,
              }}
            >
              {cityLoading ? (
                <Typography sx={{ px: 1.4, py: 1.2, color: "#6b7990", fontSize: 13 }}>Loading cities...</Typography>
              ) : (
                cityOptions.map((city) => (
                  <Box
                    key={city}
                    onClick={() => onCitySelect?.(city)}
                    sx={{
                      px: 1.4,
                      py: 1.1,
                      color: "#24384f",
                      fontSize: 13,
                      cursor: "pointer",
                      borderTop: "1px solid #eef2f6",
                      "&:first-of-type": { borderTop: "none" },
                      "&:hover": { bgcolor: "#f5f9fd" },
                    }}
                  >
                    {city}
                  </Box>
                ))
              )}
            </Box>
          )}
        </Box>

        <Button
          sx={{
            minWidth: 0,
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "#ecf4fb",
            color: "#1485e8",
          }}
        >
          <MyLocationRoundedIcon fontSize="small" />
        </Button>
        <Button
          sx={{
            minWidth: 0,
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "#ecf4fb",
            color: "#1485e8",
          }}
        >
          <KeyboardVoiceRoundedIcon fontSize="small" />
        </Button>

        <Button
          variant="contained"
          onClick={onSearch}
          sx={{
            bgcolor: "#1485e8",
            borderRadius: "8px",
            px: { xs: 2.4, md: 3.8 },
            py: 1.1,
            textTransform: "none",
            fontWeight: 700,
            fontSize: { xs: 16, md: 16 },
            "&:hover": { bgcolor: "#0f73ca" },
          }}
        >
          Search
        </Button>
      </Box>
    </Card>
  );
}
