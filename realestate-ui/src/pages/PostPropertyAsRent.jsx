import PostProperty from "./PostProperty";

export default function PostPropertyAsRent() {
  return (
    <PostProperty
      headingText="Post property for rent"
      mode="rent"
      pageType="rent"
      enablePgInResidential
      showPgCommercialNotice
      layoutVariant="exact"
      compactHero
      tightFormSpacing
      laptopShiftRight
      requireLoginForContact
      inlineLoginOnPage
      authDialogWidth={445}
    />
  );
}
