/* ==========================================================================
   JULIE SCENTS — PRODUCT CATALOGUE
   --------------------------------------------------------------------------
   Single source of truth. Consumed by the storefront (window.JULIE_PRODUCTS)
   and by tools/import-images.mjs (which attaches product photos by slug).

   Order matches the presentation sheet: ids 1-16 line up one-to-one with the
   sixteen reference images. Prices are in USD and are demo values only.
   ========================================================================== */

window.JULIE_PRODUCTS = [
  {
    "id": 1,
    "slug": "dior-sauvage-edp",
    "brand": "Dior",
    "name": "Sauvage Eau de Parfum",
    "gender": "men",
    "family": "Fresh Amber",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 60,
        "price": 98
      },
      {
        "ml": 100,
        "price": 128
      },
      {
        "ml": 200,
        "price": 178
      }
    ],
    "recreate": {
      "ml": [
        60,
        100
      ],
      "price": [
        32,
        44
      ]
    },
    "rating": 4.9,
    "reviews": 3412,
    "badge": "Best Seller",
    "notes": {
      "top": [
        "Bergamot",
        "Pepper"
      ],
      "heart": [
        "Lavender",
        "Sichuan Pepper",
        "Pink Pepper"
      ],
      "base": [
        "Ambroxan",
        "Vanilla",
        "Amberwood"
      ]
    },
    "blurb": "The best-selling men's fragrance on earth — radiant bergamot over warm Ambroxan.",
    "imageAlt": "Dior Sauvage eau de parfum bottle",
    "imageQuery": "Dior Sauvage perfume bottle"
  },
  {
    "id": 2,
    "slug": "chanel-bleu-de-chanel-edp",
    "brand": "Chanel",
    "name": "Bleu de Chanel Eau de Parfum",
    "gender": "men",
    "family": "Woody Aromatic",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 132
      },
      {
        "ml": 100,
        "price": 172
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        42,
        58
      ]
    },
    "rating": 4.9,
    "reviews": 2810,
    "badge": "Best Seller",
    "notes": {
      "top": [
        "Grapefruit",
        "Lemon",
        "Mint"
      ],
      "heart": [
        "Ginger",
        "Nutmeg",
        "Jasmine"
      ],
      "base": [
        "Incense",
        "Cedar",
        "Sandalwood"
      ]
    },
    "blurb": "The definitive modern masculine — citrus, incense and creamy woods.",
    "imageAlt": "Bleu de Chanel eau de parfum bottle",
    "imageQuery": "Bleu de Chanel perfume bottle"
  },
  {
    "id": 3,
    "slug": "armani-acqua-di-gio-profumo",
    "brand": "Giorgio Armani",
    "name": "Acqua di Giò Profumo",
    "gender": "men",
    "family": "Aquatic Woody",
    "concentration": "Parfum",
    "sizes": [
      {
        "ml": 40,
        "price": 94
      },
      {
        "ml": 75,
        "price": 132
      }
    ],
    "recreate": {
      "ml": [
        40,
        75
      ],
      "price": [
        30,
        44
      ]
    },
    "rating": 4.9,
    "reviews": 1655,
    "badge": "Best Seller",
    "notes": {
      "top": [
        "Bergamot",
        "Aquatic Notes"
      ],
      "heart": [
        "Sea Notes",
        "Sage",
        "Rosemary"
      ],
      "base": [
        "Incense",
        "Patchouli"
      ]
    },
    "blurb": "The deepest, smokiest Acqua di Giò — mineral, salty and refined.",
    "imageAlt": "Armani Acqua di Gio Profumo bottle",
    "imageQuery": "Acqua di Gio Profumo perfume bottle"
  },
  {
    "id": 4,
    "slug": "paco-rabanne-1-million-edp",
    "brand": "Paco Rabanne",
    "name": "1 Million Eau de Parfum",
    "gender": "men",
    "family": "Spicy Leather",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 88
      },
      {
        "ml": 100,
        "price": 122
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        29,
        40
      ]
    },
    "rating": 4.7,
    "reviews": 1420,
    "badge": null,
    "notes": {
      "top": [
        "Blood Mandarin",
        "Peppermint",
        "Grapefruit"
      ],
      "heart": [
        "Cinnamon",
        "Rose",
        "Spicy Notes"
      ],
      "base": [
        "Leather",
        "Amber",
        "Patchouli"
      ]
    },
    "blurb": "The gold bar — spicy cinnamon and leather with real swagger.",
    "imageAlt": "Paco Rabanne 1 Million perfume bottle",
    "imageQuery": "Paco Rabanne 1 Million perfume bottle"
  },
  {
    "id": 5,
    "slug": "creed-aventus-edp",
    "brand": "Creed",
    "name": "Aventus Eau de Parfum",
    "gender": "men",
    "family": "Fruity Chypre",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 328
      },
      {
        "ml": 100,
        "price": 448
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        92,
        132
      ]
    },
    "rating": 4.9,
    "reviews": 1420,
    "badge": "Luxury",
    "notes": {
      "top": [
        "Pineapple",
        "Bergamot",
        "Blackcurrant",
        "Apple"
      ],
      "heart": [
        "Birch",
        "Patchouli",
        "Jasmine"
      ],
      "base": [
        "Musk",
        "Oakmoss",
        "Vanilla",
        "Ambergris"
      ]
    },
    "blurb": "Smoky pineapple and birch — the most talked-about niche masculine ever made.",
    "imageAlt": "Creed Aventus perfume bottle",
    "imageQuery": "Creed Aventus perfume bottle"
  },
  {
    "id": 6,
    "slug": "chanel-no-5-edp",
    "brand": "Chanel",
    "name": "No. 5 Eau de Parfum",
    "gender": "women",
    "family": "Floral Aldehyde",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 142
      },
      {
        "ml": 100,
        "price": 189
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        46,
        68
      ]
    },
    "rating": 4.8,
    "reviews": 1284,
    "badge": "Icon",
    "notes": {
      "top": [
        "Neroli",
        "Aldehydes",
        "Ylang-Ylang"
      ],
      "heart": [
        "Jasmine",
        "Rose",
        "Iris"
      ],
      "base": [
        "Sandalwood",
        "Vanilla",
        "Vetiver"
      ]
    },
    "blurb": "The most famous fragrance in the world — a timeless bouquet of ylang-ylang and jasmine over warm sandalwood.",
    "imageAlt": "Chanel No. 5 eau de parfum bottle",
    "imageQuery": "Chanel No 5 perfume bottle"
  },
  {
    "id": 7,
    "slug": "dior-jadore-edp",
    "brand": "Dior",
    "name": "J'adore Eau de Parfum",
    "gender": "women",
    "family": "Floral Bouquet",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 128
      },
      {
        "ml": 100,
        "price": 165
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        42,
        59
      ]
    },
    "rating": 4.8,
    "reviews": 1673,
    "badge": null,
    "notes": {
      "top": [
        "Pear",
        "Melon",
        "Bergamot"
      ],
      "heart": [
        "Jasmine",
        "Lily of the Valley",
        "Tuberose"
      ],
      "base": [
        "Musk",
        "Vanilla",
        "Blackberry"
      ]
    },
    "blurb": "An opulent golden bouquet of jasmine and tuberose, luminous from the first spray.",
    "imageAlt": "Dior J'adore perfume bottle",
    "imageQuery": "Dior Jadore perfume bottle"
  },
  {
    "id": 8,
    "slug": "ysl-black-opium-edp",
    "brand": "Yves Saint Laurent",
    "name": "Black Opium Eau de Parfum",
    "gender": "women",
    "family": "Gourmand Oriental",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 124
      },
      {
        "ml": 90,
        "price": 158
      }
    ],
    "recreate": {
      "ml": [
        50,
        90
      ],
      "price": [
        40,
        57
      ]
    },
    "rating": 4.9,
    "reviews": 2411,
    "badge": "Best Seller",
    "notes": {
      "top": [
        "Pink Pepper",
        "Orange Blossom",
        "Pear"
      ],
      "heart": [
        "Coffee",
        "Jasmine",
        "Licorice"
      ],
      "base": [
        "Vanilla",
        "Patchouli",
        "Cedar"
      ]
    },
    "blurb": "Addictive black coffee and vanilla — the gourmand that redefined the category.",
    "imageAlt": "YSL Black Opium perfume bottle",
    "imageQuery": "Black Opium perfume bottle"
  },
  {
    "id": 9,
    "slug": "dior-miss-dior-blooming-bouquet-edt",
    "brand": "Dior",
    "name": "Miss Dior Blooming Bouquet",
    "gender": "women",
    "family": "Floral",
    "concentration": "Eau de Toilette",
    "sizes": [
      {
        "ml": 50,
        "price": 118
      },
      {
        "ml": 100,
        "price": 152
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        38,
        55
      ]
    },
    "rating": 4.7,
    "reviews": 998,
    "badge": null,
    "notes": {
      "top": [
        "Peony",
        "Sicilian Mandarin"
      ],
      "heart": [
        "Damask Rose",
        "Apricot"
      ],
      "base": [
        "White Musk"
      ]
    },
    "blurb": "A tender, luminous peony-rose — soft, feminine and endlessly wearable.",
    "imageAlt": "Miss Dior Blooming Bouquet perfume bottle",
    "imageQuery": "Miss Dior perfume bottle"
  },
  {
    "id": 10,
    "slug": "lancome-la-vie-est-belle-edp",
    "brand": "Lancôme",
    "name": "La Vie Est Belle Eau de Parfum",
    "gender": "women",
    "family": "Gourmand Floral",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 112
      },
      {
        "ml": 100,
        "price": 148
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        36,
        52
      ]
    },
    "rating": 4.7,
    "reviews": 1890,
    "badge": null,
    "notes": {
      "top": [
        "Iris",
        "Blackcurrant",
        "Pear"
      ],
      "heart": [
        "Iris",
        "Jasmine",
        "Orange Blossom"
      ],
      "base": [
        "Praline",
        "Vanilla",
        "Patchouli",
        "Tonka"
      ]
    },
    "blurb": "Iris and praline — a sweet, powdery happiness in a bottle.",
    "imageAlt": "Lancome La Vie Est Belle perfume bottle",
    "imageQuery": "La Vie Est Belle perfume bottle"
  },
  {
    "id": 11,
    "slug": "carolina-herrera-good-girl-edp",
    "brand": "Carolina Herrera",
    "name": "Good Girl Eau de Parfum",
    "gender": "women",
    "family": "Oriental Floral",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 116
      },
      {
        "ml": 80,
        "price": 148
      }
    ],
    "recreate": {
      "ml": [
        50,
        80
      ],
      "price": [
        38,
        52
      ]
    },
    "rating": 4.8,
    "reviews": 1401,
    "badge": "Best Seller",
    "notes": {
      "top": [
        "Almond",
        "Coffee",
        "Lemon"
      ],
      "heart": [
        "Tuberose",
        "Jasmine Sambac",
        "Orris"
      ],
      "base": [
        "Tonka",
        "Cacao",
        "Vanilla",
        "Cedar"
      ]
    },
    "blurb": "A dangerously good blend of almond, coffee and cocoa in that stiletto bottle.",
    "imageAlt": "Carolina Herrera Good Girl perfume bottle",
    "imageQuery": "Good Girl perfume bottle"
  },
  {
    "id": 12,
    "slug": "versace-eros-edt",
    "brand": "Versace",
    "name": "Eros Eau de Toilette",
    "gender": "men",
    "family": "Aromatic Fougere",
    "concentration": "Eau de Toilette",
    "sizes": [
      {
        "ml": 50,
        "price": 82
      },
      {
        "ml": 100,
        "price": 112
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        27,
        37
      ]
    },
    "rating": 4.8,
    "reviews": 1876,
    "badge": "Best Seller",
    "notes": {
      "top": [
        "Mint",
        "Green Apple",
        "Lemon"
      ],
      "heart": [
        "Tonka",
        "Geranium",
        "Ambroxan"
      ],
      "base": [
        "Vanilla",
        "Vetiver",
        "Oakmoss",
        "Cedar"
      ]
    },
    "blurb": "Mint, apple and vanilla — sweet, powerful and wildly popular.",
    "imageAlt": "Versace Eros perfume bottle",
    "imageQuery": "Versace Eros perfume bottle"
  },
  {
    "id": 13,
    "slug": "jpg-le-male-le-parfum",
    "brand": "Jean Paul Gaultier",
    "name": "Le Male Le Parfum",
    "gender": "men",
    "family": "Oriental Fougere",
    "concentration": "Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 96
      },
      {
        "ml": 125,
        "price": 138
      }
    ],
    "recreate": {
      "ml": [
        50,
        125
      ],
      "price": [
        31,
        46
      ]
    },
    "rating": 4.8,
    "reviews": 1290,
    "badge": null,
    "notes": {
      "top": [
        "Cardamom",
        "Mint"
      ],
      "heart": [
        "Lavender",
        "Iris"
      ],
      "base": [
        "Vanilla",
        "Tonka",
        "Sandalwood"
      ]
    },
    "blurb": "Creamy vanilla and lavender in the iconic sailor torso bottle.",
    "imageAlt": "Jean Paul Gaultier Le Male perfume bottle",
    "imageQuery": "Jean Paul Gaultier Le Male perfume bottle"
  },
  {
    "id": 14,
    "slug": "tom-ford-black-orchid-edp",
    "brand": "Tom Ford",
    "name": "Black Orchid Eau de Parfum",
    "gender": "unisex",
    "family": "Oriental Floral",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 168
      },
      {
        "ml": 100,
        "price": 235
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        49,
        70
      ]
    },
    "rating": 4.8,
    "reviews": 964,
    "badge": "Unisex icon",
    "notes": {
      "top": [
        "Truffle",
        "Black Currant",
        "Ylang-Ylang"
      ],
      "heart": [
        "Black Orchid",
        "Lotus Wood",
        "Fruity Notes"
      ],
      "base": [
        "Patchouli",
        "Vanilla",
        "Incense",
        "Sandalwood"
      ]
    },
    "blurb": "A dark, luxurious oriental — black truffle and orchid over patchouli, incense and creamy vanilla.",
    "imageAlt": "Tom Ford Black Orchid eau de parfum bottle",
    "imageQuery": "Tom Ford Black Orchid perfume bottle"
  },
  {
    "id": 15,
    "slug": "prada-paradoxe-edp",
    "brand": "Prada",
    "name": "Paradoxe Eau de Parfum",
    "gender": "women",
    "family": "Amber Floral",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 122
      },
      {
        "ml": 90,
        "price": 156
      }
    ],
    "recreate": {
      "ml": [
        50,
        90
      ],
      "price": [
        40,
        53
      ]
    },
    "rating": 4.7,
    "reviews": 588,
    "badge": "New",
    "notes": {
      "top": [
        "Bergamot",
        "Pear"
      ],
      "heart": [
        "Orange Blossom",
        "Jasmine"
      ],
      "base": [
        "Amber",
        "Musk",
        "Vanilla"
      ]
    },
    "blurb": "A bright orange blossom that melts into a deep, addictive amber.",
    "imageAlt": "Prada Paradoxe perfume bottle",
    "imageQuery": "Prada Paradoxe perfume bottle"
  },
  {
    "id": 16,
    "slug": "le-labo-santal-33-edp",
    "brand": "Le Labo",
    "name": "Santal 33 Eau de Parfum",
    "gender": "unisex",
    "family": "Woody Leather",
    "concentration": "Eau de Parfum",
    "sizes": [
      {
        "ml": 50,
        "price": 215
      },
      {
        "ml": 100,
        "price": 305
      }
    ],
    "recreate": {
      "ml": [
        50,
        100
      ],
      "price": [
        62,
        90
      ]
    },
    "rating": 4.7,
    "reviews": 754,
    "badge": "Luxury",
    "notes": {
      "top": [
        "Cardamom",
        "Violet",
        "Iris"
      ],
      "heart": [
        "Sandalwood",
        "Leather",
        "Amber"
      ],
      "base": [
        "Papyrus",
        "Cedar",
        "Musk"
      ]
    },
    "blurb": "Smoky cardamom and creamy sandalwood — the scent that became a uniform.",
    "imageAlt": "Le Labo Santal 33 perfume bottle",
    "imageQuery": "Le Labo Santal 33 perfume bottle"
  }
];

/* Recreate hint shown across the site — the Julie Scents house promise. */
window.JULIE_RECREATE = {
  title: "Recreated to order",
  claim: "We re-blend any fragrance you love using premium fragrance oils.",
  points: [
    "High-concentration premium oils, blended in-house",
    "Long-lasting — 8 to 12 hours of wear, guaranteed",
    "Identical scent profile at a fraction of retail",
    "Every bottle filled, sealed and labelled by hand"
  ]
};
