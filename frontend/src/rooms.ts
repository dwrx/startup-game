export const legalRooms = [
  {
    name: "Laundry",
    roomType: { laundry: {} },
    description:
      "This business operates within the law, converting your dirty money into clean cash at a cost of -30% loss. Remember, only the dirty funds you've collected can be laundered - uncollected funds remain in the shadows. Keep an eye on the storage capacity! Regularly collect your earnings to keep the cash flow smooth and steady. Happy laundering!",
    price: 100,
    yield: 50,
    capacity: 100,
    image: "/rooms/laundry.gif",
    levelRequirement: 0,
  },
  {
    name: "Fastfood",
    roomType: { fastFoodRestaurant: {} },
    description:
      "This business operates within the law, converting your dirty money into clean cash at a cost of -30% loss. Remember, only the dirty funds you've collected can be laundered - uncollected funds remain in the shadows. Keep an eye on the storage capacity! Regularly collect your earnings to keep the cash flow smooth and steady. Happy laundering!",
    price: 600,
    yield: 75,
    capacity: 200,
    image: "/rooms/fastFoodRestaurant.gif",
    levelRequirement: 2,
  },
  {
    name: "Fitness Center",
    roomType: { fitnessCenter: {} },
    description:
      "This business operates within the law, converting your dirty money into clean cash at a cost of -30% loss. Remember, only the dirty funds you've collected can be laundered - uncollected funds remain in the shadows. Keep an eye on the storage capacity! Regularly collect your earnings to keep the cash flow smooth and steady. Happy laundering!",
    price: 800,
    yield: 85,
    capacity: 300,
    image: "/rooms/fitnessCenter.png",
    levelRequirement: 5,
  },
];

export const illegalRooms = [
  {
    name: "Unlicensed Bar",
    roomType: { unlicensedBar: {} },
    description:
      "Generate dirty cash with high-risk ventures. If storage is full, you stop yielding new dirty cash. Collect cash regularly to keep the money flowing and avoid interruptions. Happy hustling!",
    price: 400,
    yield: 65,
    capacity: 150,
    image: "/rooms/unlicensedBar.gif",
    levelRequirement: 1,
  },
  {
    name: "Cannabis Farm",
    roomType: { cannabisFarm: {} },
    description:
      "Generate dirty cash with high-risk ventures. If storage is full, you stop yielding new dirty cash. Collect cash regularly to keep the money flowing and avoid interruptions. Happy hustling!",
    price: 500,
    yield: 70,
    capacity: 250,
    image: "/rooms/cannabisFarm.gif",
    levelRequirement: 3,
  },
  {
    name: "Strip Club",
    roomType: { stripClub: {} },
    description:
      "Generate dirty cash with high-risk ventures. If storage is full, you stop yielding new dirty cash. Collect cash regularly to keep the money flowing and avoid interruptions. Happy hustling!",
    price: 1500,
    yield: 100,
    capacity: 400,
    image: "/rooms/stripClub.gif",
    levelRequirement: 4,
  },
  {
    name: "Casino",
    roomType: { casino: {} },
    description:
      "Generate dirty cash with high-risk ventures. If storage is full, you stop yielding new dirty cash. Collect cash regularly to keep the money flowing and avoid interruptions. Happy hustling!",
    price: 2000,
    yield: 120,
    capacity: 500,
    image: "/rooms/casino.gif",
    levelRequirement: 6,
  },
  {
    name: "Saferoom",
    roomType: { saferoom: {} },
    description:
      "Hide your illegal earnings in the ultimate secret stash. The Saferoom provides a secure haven for your dirty cash, keeping it safe from authorities.",
    price: 800,
    yield: 0,
    capacity: 300,
    image: "/rooms/saferoom.png",
    levelRequirement: 0,
  },
  {
    name: "Security Room",
    roomType: { securityRoom: {} },
    description:
      "Hire enforcers and hitmen to safeguard your operations and intimidate rivals. The Security Room is your command center for managing muscle.",
    price: 600,
    yield: 0,
    capacity: 0,
    image: "/rooms/securityRoom.gif",
    levelRequirement: 2,
  },
];

export const allRooms = [...legalRooms, ...illegalRooms];
