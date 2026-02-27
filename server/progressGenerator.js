import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

// ============================================================
// CONFIGURATION — tweak these values to customize the card
// ============================================================

const CONFIG = {
  // Colors (HSL strings)
  colors: {
    background:    'hsl(240, 10%, 12%)',  // dark outer background
    card:          'hsl(240, 10%, 18%)',  // player card background
    gridEmpty:     'hsl(240, 10%, 24%)',  // unfilled square
    gridGreen:     'hsl(115, 29%, 43%)',  // correct letter (green)
    gridYellow:    'hsl(49,  51%, 47%)',  // wrong position (yellow)
    titleText:     'hsl(240, 10%, 90%)',  // header title color
  },

  // Card layout
  card: {
    width:    145,
    height:   260,
    radius:   12,   // corner radius of each player card
  },

  // Profile image circle
  avatar: {
    size:    72,   // diameter of the circular avatar
    offsetY: 16,   // y position relative to the top of the card
  },

  // Wordle grid settings
  grid: {
    cols:       4,    // letters per row
    rows:       8,    // number of guesses
    squareSize: 14,   // size of each square in px
    gap:        3,    // gap between squares in px
    offsetY:    108,  // y position relative to the top of the card
  },

  // Spacing
  cardGap:     16,   // gap between cards
  cardPadding: 32,   // padding around the edges of the canvas
  titleHeight: 80,   // vertical space reserved for the title at the top
  cardsPerRow: 4,    // how many cards before wrapping to next row
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Draws a rounded rectangle and fills it with the given color.
 */
function roundedRect(ctx, x, y, width, height, radius, color) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y,          x + width, y + radius,          radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x,           y + height, x, y + height - radius,       radius);
  ctx.lineTo(x,          y + radius);
  ctx.arcTo(x,           y,          x + radius, y,                radius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a circular clipped image (for avatars).
 * Falls back to a gray circle if the image fails to load.
 */
async function drawCircularAvatar(ctx, imagePath, cx, cy, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  try {
    const img = await loadImage(imagePath);
    ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
  } catch {
    // fallback: solid circle if image not found
    ctx.fillStyle = 'hsl(240, 10%, 35%)';
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws a 5x6 Wordle grid for one player.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {string[]} guesses - array of 6 strings, each 5 chars ('g', 'y', '_')
 * @param {number} originX   - left edge of the grid
 * @param {number} originY   - top edge of the grid
 */
function drawGrid(ctx, guesses, originX, originY) {
  const { squareSize, gap, cols, rows } = CONFIG.grid;
  const { gridEmpty, gridGreen, gridYellow } = CONFIG.colors;

  // Map character codes to colors
  const colorMap = { g: gridGreen, y: gridYellow, _: gridEmpty };

  for (let row = 0; row < rows; row++) {
    const rowStr = guesses[row] || '_____';
    for (let col = 0; col < cols; col++) {
      const char = rowStr[col] || '_';
      const x = originX + col * (squareSize + gap);
      const y = originY + row * (squareSize + gap);
      roundedRect(ctx, x, y, squareSize, squareSize, 3, colorMap[char] || gridEmpty);
    }
  }
}

// ============================================================
// MAIN FUNCTION
// ============================================================

/**
 * Generates a Wordle results card and saves it as a PNG.
 *
 * @param {object[]} players            - Array of player objects
 * @param {string}   players[].imageUrl - Path or URL to the player's avatar
 * @param {string[]} players[].guesses  - Array of 6 guess strings (e.g. 'gg_y_')
 * @param {string}   title              - Title text shown at the top of the card
 * @param {string}   filename           - Output filename (e.g. 'wordle-card.png')
 */
export async function generateProgressCard(players, title, filename) {
  const {
    colors, card, avatar, grid,
    cardGap, cardPadding, titleHeight, cardsPerRow,
  } = CONFIG;

  // --- Compute canvas dimensions dynamically ---
  const totalRows       = Math.ceil(players.length / cardsPerRow);
  const cardsInFirstRow = Math.min(players.length, cardsPerRow);

  const minCanvasWidth = 260; // minimum width so single-player cards don't look too narrow
  const canvasWidth  = Math.max(minCanvasWidth, cardPadding * 2 + cardsInFirstRow * card.width + (cardsInFirstRow - 1) * cardGap);
  const canvasHeight = titleHeight + totalRows * card.height + (totalRows - 1) * cardGap + cardPadding;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // --- Background ---
  roundedRect(ctx, 0, 0, canvasWidth, canvasHeight, 12, colors.background);

  // --- Title ---
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = colors.titleText;
  ctx.textAlign = 'center';
  ctx.fillText(title, canvasWidth / 2, titleHeight / 2 + 8); // vertically centered in title area

  // --- Player cards ---
  for (let i = 0; i < players.length; i++) {
    const player = players[i];

    // Determine which row and column this card belongs to
    const col = i % cardsPerRow;
    const row = Math.floor(i / cardsPerRow);

    // Center each row independently (last row may have fewer cards)
    const cardsInThisRow = Math.min(cardsPerRow, players.length - row * cardsPerRow);
    const rowWidth  = cardsInThisRow * card.width + (cardsInThisRow - 1) * cardGap;
    const rowStartX = (canvasWidth - rowWidth) / 2;

    const cardX = rowStartX + col * (card.width + cardGap);
    const cardY = titleHeight + row * (card.height + cardGap);

    // Draw card background
    roundedRect(ctx, cardX, cardY, card.width, card.height, card.radius, colors.card);

    // Draw circular avatar — centered horizontally on the card
    const avatarCX     = cardX + card.width / 2;
    const avatarCY     = cardY + avatar.offsetY + avatar.size / 2;
    const avatarRadius = avatar.size / 2;
    await drawCircularAvatar(ctx, player.imageUrl, avatarCX, avatarCY, avatarRadius);

    // Draw Wordle grid — centered horizontally on the card
    const gridWidth = grid.cols * (grid.squareSize + grid.gap) - grid.gap;
    const gridX     = cardX + (card.width - gridWidth) / 2;
    const gridY     = cardY + grid.offsetY;
    drawGrid(ctx, player.guesses, gridX, gridY);
  }

  // --- Save output ---
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Saved ${filename}`);
}

// ============================================================
// EXAMPLE USAGE
// ============================================================

const players = [
  {
    imageUrl: 'avatar1.jpg',
    guesses: [
      '__y_',
      '_yy_',
      'gg_g',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
    ],
  },{
    imageUrl: 'avatar1.jpg',
    guesses: [
      '__y_',
      '_yy_',
      'gg_g',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
    ],
  },{
    imageUrl: 'avatar1.jpg',
    guesses: [
      '__y_',
      '_yy_',
      'gg_g',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
    ],
  },{
    imageUrl: 'avatar1.jpg',
    guesses: [
      '__y_',
      '_yy_',
      'gg_g',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
    ],
  },{
    imageUrl: 'avatar1.jpg',
    guesses: [
      '__y_',
      '_yy_',
      'gg_g',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
      'gggg',
    ],
  },
];

generateProgressCard(players, 'Duotrigordle No. 1', 'wordle-card.png');