import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AboutUs from "./pages/AboutUs";
import PostProperty from "./pages/PostProperty";
import SellProperty from "./pages/SellProperty";
import PostPropertyAsRent from "./pages/PostPropertyAsRent";
import PostOwnProperty from "./pages/PostOwnProperty";
import RecentlyPostedProperties from "./pages/RecentlyPostedProperties";
import PostPropertyBasicDetails from "./pages/PostPropertyBasicDetails";
import PostPropertyLocationDetails from "./pages/PostPropertyLocationDetails";
import PostPropertyProfileDetails from "./pages/PostPropertyProfileDetails";
import PostPropertyMediaDetails from "./pages/PostPropertyMediaDetails";
import PostPropertyAmenitiesDetails from "./pages/PostPropertyAmenitiesDetails";
import PostPropertyThankYou from "./pages/PostPropertyThankYou";
import PostPropertyDashboard from "./pages/PostPropertyDashboard";
import PostPropertyPreview from "./pages/PostPropertyPreview";
import PostPropertyUserDashboard from "./pages/PostPropertyUserDashboard";
import PostPropertyShortlist from "./pages/PostPropertyShortlist";
import PostPropertyAllPreviews from "./pages/PostPropertyAllPreviews";

function App() {
  const rawPath = window.location.pathname || "/";
  const path = rawPath.replace(/\/+$/, "") || "/";

  if (path === "/forgot-password") {
    return <ForgotPassword />;
  }
  if (path === "/reset-password") {
    return <ResetPassword />;
  }
  if (path === "/about-us") {
    return <AboutUs />;
  }
  if (path === "/post-property") {
    return <PostProperty />;
  }
  if (path === "/sell-property") {
    return <SellProperty />;
  }
  if (path === "/post-property-as-rent") {
    return <PostPropertyAsRent />;
  }
  if (path === "/post-own-property") {
    return <PostOwnProperty />;
  }
  if (path === "/recently-posted-properties") {
    return <RecentlyPostedProperties />;
  }
  if (path === "/post-property/primary-details") {
    return <PostPropertyBasicDetails pageType="sell" hydrateFromDraft />;
  }
  if (path === "/post-property-location-details") {
    return <PostPropertyLocationDetails />;
  }
  if (path === "/post-property-profile-details") {
    return <PostPropertyProfileDetails />;
  }
  if (path === "/post-property-media-details") {
    return <PostPropertyMediaDetails />;
  }
  if (path === "/post-property-amenities-details") {
    return <PostPropertyAmenitiesDetails />;
  }
  if (path === "/post-property/thank-you") {
    return <PostPropertyThankYou />;
  }
  if (path.startsWith("/post-property/thank-you/")) {
    return <PostPropertyThankYou />;
  }
  if (path === "/post-property/property-dashboard") {
    return <PostPropertyDashboard />;
  }
  if (path.startsWith("/post-property/property-dashboard/")) {
    return <PostPropertyDashboard />;
  }
  if (path === "/post-property/property-preview") {
    return <PostPropertyPreview />;
  }
  if (path === "/post-property/user-property-dashboard") {
    return <PostPropertyUserDashboard />;
  }
  if (path === "/post-property/shortlist-property") {
    return <PostPropertyShortlist />;
  }
  if (path === "/post-property/all-previews") {
    return <PostPropertyAllPreviews />;
  }

  return <Home />;
}

export default App;
