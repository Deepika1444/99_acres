import PostProperty from "./PostProperty";

export default function SellProperty() {
  return (
    <PostProperty
      headingText="Sell your property"
      mode="sell"
      pageType="sell"
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
