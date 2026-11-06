const locationMasterData = [
  {
    city: "Bengaluru",
    localities: [
      {
        name: "Whitefield",
        subLocalities: [
          {
            name: "ITPL",
            societies: ["Prestige Shantiniketan", "Brigade IRV Centre", "Sowparnika The Columns"],
          },
          {
            name: "Varthur",
            societies: ["Prestige Lakeside Habitat", "Sobha Dream Acres", "Candeur Landmark"],
          },
        ],
      },
      {
        name: "Sarjapur Road",
        subLocalities: [
          {
            name: "Kaikondrahalli",
            societies: ["Prestige City", "Assetz 63 Degree East", "Godrej Park Retreat"],
          },
        ],
      },
    ],
  },

  
  {
    city: "Hyderabad",
    localities: [
      {
        name: "Gachibowli",
        subLocalities: [
          {
            name: "Financial District",
            societies: ["My Home Bhooja", "Rajapushpa Atria", "SAS Crown"],
          },
        ],
      },
      {
        name: "Kondapur",
        subLocalities: [
          {
            name: "Raghavendra Colony",
            societies: ["SMR Vinay Iconia", "Aparna Serene Park", "Aurobindo Kohinoor"],
          },
        ],
      },
    ],
  },
  {
    city: "Mumbai",
    localities: [
      {
        name: "Powai",
        subLocalities: [
          {
            name: "Hiranandani",
            societies: ["Hiranandani Gardens", "Lake Homes", "Eden Apartments"],
          },
        ],
      },
      {
        name: "Andheri West",
        subLocalities: [
          {
            name: "Lokhandwala",
            societies: ["Oberoi Springs", "Runwal Elegante", "DLH Orchid"],
          },
        ],
      },
    ],
  },
  {
    city: "Pune",
    localities: [
      {
        name: "Hinjewadi",
        subLocalities: [
          {
            name: "Phase 1",
            societies: ["Megapolis", "Paranjape Blue Ridge", "Kolte Patil Life Republic"],
          },
        ],
      },
      {
        name: "Kharadi",
        subLocalities: [
          {
            name: "EON IT Park",
            societies: ["Gera World of Joy", "Panchshil Towers", "Nyati Elysia"],
          },
        ],
      },
    ],
  },
  {
    city: "Chennai",
    localities: [
      {
        name: "OMR",
        subLocalities: [
          {
            name: "Sholinganallur",
            societies: ["Casa Grande Elan", "NCC Urban Signature Towers", "Baashyaam Pinnacle Crest"],
          },
        ],
      },
      {
        name: "Velachery",
        subLocalities: [
          {
            name: "Tansi Nagar",
            societies: ["DRA Infinique", "Appaswamy Altezza", "Ramaniyam Magnum"],
          },
        ],
      },
    ],
  },
  {
    city: "Delhi",
    localities: [
      {
        name: "Dwarka",
        subLocalities: [
          {
            name: "Sector 21",
            societies: ["Golf View Apartments", "New Millennium Apartments", "Shubham Apartments"],
          },
        ],
      },
      {
        name: "Rohini",
        subLocalities: [
          {
            name: "Sector 13",
            societies: ["DDA Metro View", "Harmony Heights", "Silver Residency"],
          },
        ],
      },
    ],
  },
  {
    city: "Noida",
    localities: [
      {
        name: "Sector 62",
        subLocalities: [
          {
            name: "Institutional Area",
            societies: ["Antriksh Green", "Apex Athena", "Stellar IT Park Residences"],
          },
        ],
      },
      {
        name: "Sector 137",
        subLocalities: [
          {
            name: "Expressway",
            societies: ["Paras Tierea", "Supertech Ecociti", "Ajnara Daffodil"],
          },
        ],
      },
    ],
  },
  {
    city: "Gurugram",
    localities: [
      {
        name: "Golf Course Road",
        subLocalities: [
          {
            name: "Sector 54",
            societies: ["DLF The Crest", "The Camellias", "Suncity Heights"],
          },
        ],
      },
      {
        name: "Sohna Road",
        subLocalities: [
          {
            name: "Sector 48",
            societies: ["Vipul Greens", "Central Park 2", "Orchid Petals"],
          },
        ],
      },
    ],
  },
  {
    city: "Kolkata",
    localities: [
      {
        name: "New Town",
        subLocalities: [
          {
            name: "Action Area 1",
            societies: ["PS One10", "Unitech Vistas", "Shrachi Rosedale"],
          },
        ],
      },
      {
        name: "Rajarhat",
        subLocalities: [
          {
            name: "Chinar Park",
            societies: ["Siddha Xanadu", "Natural City", "Magnolia Prestige"],
          },
        ],
      },
    ],
  },
  {
    city: "Ahmedabad",
    localities: [
      {
        name: "SG Highway",
        subLocalities: [
          {
            name: "Bodakdev",
            societies: ["Iscon Platinum", "Safal Parisar", "Gala Eternia"],
          },
        ],
      },
      {
        name: "South Bopal",
        subLocalities: [
          {
            name: "Bopal Junction",
            societies: ["Applewoods Township", "Sun Sky Park", "Orchid Legacy"],
          },
        ],
      },
    ],
  },
  {
    city: "Jaipur",
    localities: [
      {
        name: "Vaishali Nagar",
        subLocalities: [
          {
            name: "Gandhi Path",
            societies: ["Manglam Aadhar", "Rangoli Gardens", "Unique Emporia"],
          },
        ],
      },
      {
        name: "Mansarovar",
        subLocalities: [
          {
            name: "Patel Marg",
            societies: ["Sunny Residency", "Ashiana Amantran", "UDB Indus"],
          },
        ],
      },
    ],
  },
  {
    city: "Lucknow",
    localities: [
      {
        name: "Gomti Nagar",
        subLocalities: [
          {
            name: "Vibhuti Khand",
            societies: ["Shalimar OneWorld", "Omaxe Residency", "Eldeco Elegance"],
          },
        ],
      },
      {
        name: "Sushant Golf City",
        subLocalities: [
          {
            name: "Amar Shaheed Path",
            societies: ["Paarth Aadyant", "Ansal API Celebrity Greens", "Rishita Mulberry Heights"],
          },
        ],
      },
    ],
  },
  {
    city: "Kochi",
    localities: [
      {
        name: "Kakkanad",
        subLocalities: [
          {
            name: "Infopark",
            societies: ["Puravankara Purva Eternity", "Olive Kalista", "Trinity World"],
          },
        ],
      },
      {
        name: "Marine Drive",
        subLocalities: [
          {
            name: "MG Road",
            societies: ["Choice Paradise", "Skyline Waterfront", "ABAD Reflections"],
          },
        ],
      },
    ],
  },
  {
    city: "Indore",
    localities: [
      {
        name: "Vijay Nagar",
        subLocalities: [
          {
            name: "Scheme 78",
            societies: ["Shalimar Township", "BCM Heights", "Apollo DB City"],
          },
        ],
      },
      {
        name: "Super Corridor",
        subLocalities: [
          {
            name: "Talawali Chanda",
            societies: ["Sagar Eden Garden", "Nakshatra Habitat", "Caledonia Heaven"],
          },
        ],
      },
    ],
  },
  {
    city: "Agra",
    localities: [
      {
        name: "Sikandra",
        subLocalities: [
          {
            name: "Bodla",
            societies: ["Shivam Residency", "Pushpanjali Gardenia", "Ansal Courtyard"],
          },
        ],
      },
      {
        name: "Dayal Bagh",
        subLocalities: [
          {
            name: "Kamla Nagar",
            societies: ["Ganga Enclave", "Surya Apartment", "Ratan Heights"],
          },
        ],
      },
    ],
  },
  {
    city: "Bhopal",
    localities: [
      {
        name: "Kolar Road",
        subLocalities: [
          {
            name: "Chuna Bhatti",
            societies: ["Sagar Golden Palm", "Aakriti Eco City", "Sterling Pride City"],
          },
        ],
      },
      {
        name: "MP Nagar",
        subLocalities: [
          {
            name: "Zone 2",
            societies: ["Meenakshi Complex", "Platinum Plaza Residences", "DB City Towers"],
          },
        ],
      },
    ],
  },
  {
    city: "Ludhiana",
    localities: [
      {
        name: "Pakhowal Road",
        subLocalities: [
          {
            name: "Sarabha Nagar",
            societies: ["AIPL DreamCity", "Hero Homes", "Palm Enclave"],
          },
        ],
      },
      {
        name: "Ferozepur Road",
        subLocalities: [
          {
            name: "Gurdev Nagar",
            societies: ["Omaxe Royal Residency", "Canal View Apartments", "Silver Arc Homes"],
          },
        ],
      },
    ],
  },
  {
    city: "Kanpur",
    localities: [
      {
        name: "Swaroop Nagar",
        subLocalities: [
          {
            name: "Arya Nagar",
            societies: ["Ratan Planet", "Shyam Residency", "Tulsi Enclave"],
          },
        ],
      },
      {
        name: "Kalyanpur",
        subLocalities: [
          {
            name: "Awas Vikas",
            societies: ["Eldeco County", "Krishna Vihar Apartments", "Shiv Vatika"],
          },
        ],
      },
    ],
  },
  {
    city: "Dehradun",
    localities: [
      {
        name: "Rajpur Road",
        subLocalities: [
          {
            name: "Jakhan",
            societies: ["Pacific Hills", "GTM Forest and Hills", "Axiom Bliss"],
          },
        ],
      },
      {
        name: "Sahastradhara Road",
        subLocalities: [
          {
            name: "IT Park",
            societies: ["Windlass River Valley", "Capital Royal Casa", "Shivalik Green"],
          },
        ],
      },
    ],
  },
];

module.exports = locationMasterData;
