/**
 * Stage maps are equal-length strings, one row each.
 * Nintendo Lode Runner uses classic 28×16 boards. The camera crops the view
 * rather than the data, so later treasuries can stay on the same grid.
 *
 *   " " empty    "#" brick (diggable)    "@" solid
 *   "H" ladder   "-" rope                "X" trap brick
 *   "S" hidden escape ladder             "$" gold
 *   "0" guard    "&" runner
 */
export const STAGES = [
  {
    id: 1,
    name: "Treasury 1",
    map: [
      "                  S         ",
      "    $             S         ",
      "#######H#######   S         ",
      "       H----------S    $    ",
      "       H    ##H   #######H##",
      "       H    ##H          H  ",
      "     0 H    ##H       $0 H  ",
      "##H#####    ########H#######",
      "  H                 H       ",
      "  H           0     H       ",
      "#########H##########H       ",
      "         H          H       ",
      "       $ H----------H   $   ",
      "    H######         #######H",
      "    H         &  $         H",
      "############################",
    ],
  },
];
