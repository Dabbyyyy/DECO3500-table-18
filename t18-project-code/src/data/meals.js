const meals = [
  {
    id: "teriyaki",
    name: "Teriyaki Chicken Bowl",
    time: 30,
    difficulty: "Easy",
    cooks: 3,

    equipment: [
      "Stove",
      "Rice cooker",
      "Knife",
      "Chopping board",
    ],

    ingredients: [
      "Chicken thigh",
      "Rice",
      "Broccoli",
      "Carrots",
      "Teriyaki sauce",
    ],

    icon: "🍗",

    matchText: "Matches all 3 cooks",
    votes: 3,

    tasks: [
      {
        id: "rice",
        name: "Prepare Rice",
        icon: "🍚",
        difficulty: "Easy",
        estimatedTime: 20,
        equipment: ["Rice cooker"],

        steps: [
          "Measure the rice.",
          "Wash the rice.",
          "Add water.",
          "Start the rice cooker.",
        ],
      },

      {
        id: "chicken",
        name: "Cook Chicken",
        icon: "🍗",
        difficulty: "Medium",
        estimatedTime: 15,
        equipment: ["Stove"],

        steps: [
          "Cut the chicken into pieces.",
          "Heat the pan.",
          "Add the chicken.",
          "Add teriyaki sauce.",
          "Cook until the chicken is fully cooked.",
        ],
      },

      {
        id: "vegetables",
        name: "Prepare Vegetables",
        icon: "🥕",
        difficulty: "Easy",
        estimatedTime: 10,
        equipment: ["Knife", "Chopping board"],

        steps: [
          "Wash the vegetables.",
          "Peel the carrots.",
          "Slice the vegetables.",
          "Cook the vegetables.",
        ],
      },
    ],
  },

  {
    id: "fried-rice",
    name: "One-Pan Fried Rice",
    time: 20,
    difficulty: "Easy",
    cooks: 3,

    equipment: [
      "Stove",
      "Large pan",
      "Knife",
      "Chopping board",
    ],

    ingredients: [
      "Rice",
      "Egg",
      "Carrots",
      "Peas",
      "Soy sauce",
    ],

    icon: "🍚",

    matchText: "Matches 2 cooks",
    votes: 2,

    tasks: [
      {
        id: "vegetables",
        name: "Prepare Vegetables",
        icon: "🥕",
        difficulty: "Easy",
        estimatedTime: 8,
        equipment: ["Knife", "Chopping board"],

        steps: [
          "Wash the vegetables.",
          "Cut the carrots.",
          "Prepare the peas.",
        ],
      },

      {
        id: "egg",
        name: "Prepare Egg",
        icon: "🥚",
        difficulty: "Easy",
        estimatedTime: 5,
        equipment: ["Bowl"],

        steps: [
          "Crack the eggs into a bowl.",
          "Beat the eggs.",
          "Cook the eggs.",
        ],
      },

      {
        id: "rice",
        name: "Cook Fried Rice",
        icon: "🍚",
        difficulty: "Medium",
        estimatedTime: 12,
        equipment: ["Stove", "Large pan"],

        steps: [
          "Heat the pan.",
          "Add the rice.",
          "Add the vegetables.",
          "Add the egg.",
          "Add soy sauce.",
          "Mix everything together.",
        ],
      },
    ],
  },

  {
    id: "curry",
    name: "Vegetable Curry",
    time: 40,
    difficulty: "Medium",
    cooks: 3,

    equipment: [
      "Stove",
      "Pot",
      "Knife",
      "Chopping board",
    ],

    ingredients: [
      "Mixed vegetables",
      "Coconut milk",
      "Curry paste",
      "Rice",
    ],

    icon: "🥘",

    matchText: "Matches 1 cook",
    votes: 1,

    tasks: [
      {
        id: "vegetables",
        name: "Prepare Vegetables",
        icon: "🥕",
        difficulty: "Easy",
        estimatedTime: 10,
        equipment: ["Knife", "Chopping board"],

        steps: [
          "Wash the vegetables.",
          "Peel vegetables if needed.",
          "Cut the vegetables into pieces.",
        ],
      },

      {
        id: "curry",
        name: "Prepare Curry",
        icon: "🥘",
        difficulty: "Medium",
        estimatedTime: 20,
        equipment: ["Stove", "Pot"],

        steps: [
          "Heat the pot.",
          "Add curry paste.",
          "Add coconut milk.",
          "Add the vegetables.",
          "Simmer until cooked.",
        ],
      },

      {
        id: "rice",
        name: "Prepare Rice",
        icon: "🍚",
        difficulty: "Easy",
        estimatedTime: 20,
        equipment: ["Rice cooker"],

        steps: [
          "Measure the rice.",
          "Wash the rice.",
          "Add water.",
          "Cook the rice.",
        ],
      },
    ],
  },
];

export default meals;