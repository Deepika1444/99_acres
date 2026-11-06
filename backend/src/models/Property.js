const mongoose = require("mongoose");

const lookingToValues = ["sell", "rent_lease", "pg"];
const propertyKindValues = ["residential", "commercial"];

const propertySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    lookingTo: {
      type: String,
      enum: lookingToValues,
      required: true,
    },
    propertyKind: {
      type: String,
      enum: propertyKindValues,
      required: true,
    },
    propertySubType: {
      type: String,
      required: true,
      trim: true,
    },
    locationDetails: {
      city: {
        type: String,
        trim: true,
      },
      locality: {
        type: String,
        trim: true,
      },
      subLocality: {
        type: String,
        trim: true,
      },
      apartmentSociety: {
        type: String,
        trim: true,
      },
      houseNumber: {
        type: String,
        trim: true,
      },
    },
    propertyProfile: {
      configuration: {
        type: String,
        trim: true,
      },
      selectedConfiguration: {
        apartmentType: {
          type: String,
          trim: true,
        },
        superBuiltUpArea: {
          type: Number,
          min: 0,
        },
        bathrooms: {
          type: Number,
          min: 0,
        },
        balconies: {
          type: Number,
          min: 0,
        },
        availability: {
          type: String,
          trim: true,
        },
        image: {
          type: String,
          trim: true,
        },
      },
      builtUpArea: {
        value: {
          type: Number,
          min: 0,
        },
        unit: {
          type: String,
          trim: true,
          default: "sqft",
        },
      },
      propertyOnFloor: {
        type: String,
        trim: true,
      },
      totalFloors: {
        type: Number,
        min: 0,
      },
      roomDetails: {
        bedrooms: {
          type: Number,
          min: 0,
        },
        bathrooms: {
          type: Number,
          min: 0,
        },
        balconies: {
          type: Number,
          min: 0,
        },
        otherRooms: [
          {
            type: String,
            trim: true,
          },
        ],
      },
      areaDetails: {
        carpetArea: {
          value: {
            type: Number,
            min: 0,
          },
          unit: {
            type: String,
            trim: true,
            default: "sqft",
          },
        },
      },
      parking: {
        covered: {
          type: Number,
          min: 0,
          default: 0,
        },
        open: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
      flooringTypes: [
        {
          type: String,
          trim: true,
        },
      ],
      furnishingStatus: {
        type: String,
        trim: true,
      },
      furnishingItems: [
        {
          type: String,
          trim: true,
        },
      ],
      availabilityStatus: {
        type: String,
        trim: true,
      },
      ageOfProperty: {
        type: String,
        trim: true,
      },
      possessionBy: {
        type: String,
        trim: true,
      },
      ownershipType: {
        type: String,
        trim: true,
      },
      propertyFacing: {
        type: String,
        trim: true,
      },
    },
    mediaDetails: {
      video: {
        url: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
        fileName: {
          type: String,
          trim: true,
        },
      },
      photos: [
        {
          url: {
            type: String,
            trim: true,
          },
          name: {
            type: String,
            trim: true,
          },
          caption: {
            type: String,
            trim: true,
          },
          order: {
            type: Number,
            min: 0,
          },
          isCover: {
            type: Boolean,
            default: false,
          },
        },
      ],
      propertyDescription: {
        type: String,
        trim: true,
      },
      contactEmail: {
        type: String,
        trim: true,
        lowercase: true,
      },
      continueWithoutPhotos: {
        type: Boolean,
        default: false,
      },
    },
    pricingDetails: {
      ownershipType: {
        type: String,
        trim: true,
      },
      priceDetails: {
        expectedPrice: {
          type: Number,
          min: 0,
        },
        expectedPriceUnit: {
          type: String,
          trim: true,
          default: "INR",
        },
        pricePerSqft: {
          type: Number,
          min: 0,
        },
        allInclusivePrice: {
          type: Boolean,
          default: false,
        },
        taxAndGovtChargesExcluded: {
          type: Boolean,
          default: false,
        },
        priceNegotiable: {
          type: Boolean,
          default: false,
        },
      },
      additionalPriceDetails: {
        maintenance: {
          amount: {
            type: Number,
            min: 0,
          },
          frequency: {
            type: String,
            trim: true,
          },
        },
        expectedRentalIncome: {
          type: Number,
          min: 0,
        },
        bookingAmount: {
          type: Number,
          min: 0,
        },
        annualDuesPayable: {
          type: Number,
          min: 0,
        },
      },
      brokerage: {
        charged: {
          type: Boolean,
          default: false,
        },
        type: {
          type: String,
          trim: true,
        },
        value: {
          type: Number,
          min: 0,
        },
        negotiable: {
          type: Boolean,
          default: false,
        },
      },
      propertyDescription: {
        type: String,
        trim: true,
      },
    },
    amenitiesDetails: {
      otherRooms: [
        {
          type: String,
          trim: true,
        },
      ],
      furnishingStatus: {
        type: String,
        trim: true,
      },
      furnishingItems: [
        {
          type: String,
          trim: true,
        },
      ],
      reservedParking: {
        covered: {
          type: Number,
          min: 0,
          default: 0,
        },
        open: {
          type: Number,
          min: 0,
          default: 0,
        },
      },
      amenities: [
        {
          type: String,
          trim: true,
        },
      ],
      propertyFeatures: [
        {
          type: String,
          trim: true,
        },
      ],
      societyFeatures: [
        {
          type: String,
          trim: true,
        },
      ],
      additionalFeatures: [
        {
          type: String,
          trim: true,
        },
      ],
      overlooking: [
        {
          type: String,
          trim: true,
        },
      ],
      otherFeatures: {
        cornerProperty: {
          type: Boolean,
          default: false,
        },
        inGatedSociety: {
          type: Boolean,
          default: false,
        },
      },
      powerBackup: {
        type: String,
        trim: true,
      },
      propertyFacing: [
        {
          type: String,
          trim: true,
        },
      ],
      typeOfFlooring: {
        type: String,
        trim: true,
      },
      widthOfFacingRoad: {
        value: {
          type: Number,
          min: 0,
        },
        unit: {
          type: String,
          trim: true,
          default: "ft",
        },
      },
      locationAdvantages: [
        {
          type: String,
          trim: true,
        },
      ],
      description: {
        type: String,
        trim: true,
      },
    },
    sellerDetails: {
      rera: {
        registrationStatus: {
          type: String,
          trim: true,
        },
        reraId: {
          type: String,
          trim: true,
        },
        state: {
          type: String,
          trim: true,
        },
        registrationDate: {
          type: String,
          trim: true,
        },
        expiryDate: {
          type: String,
          trim: true,
        },
      },
      licenseType: {
        type: String,
        trim: true,
      },
      companyDetails: {
        name: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
        addressLine1: {
          type: String,
          trim: true,
        },
        addressLine2: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
      contactDetails: {
        countryCode: {
          type: String,
          trim: true,
          default: "+91",
        },
        primaryNumber: {
          type: String,
          trim: true,
        },
        alternateNumbers: [
          {
            type: String,
            trim: true,
          },
        ],
        updateViaWhatsapp: {
          type: Boolean,
          default: false,
        },
      },
    },
    currentStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    completionPercent: {
      type: Number,
      default: 20,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

propertySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Property", propertySchema);
