export const PIECE_IMAGES = {
    'wK': '/common/assets/chess_media/white_king.png',
    'wQ': '/common/assets/chess_media/white_queen.png',
    'wR': '/common/assets/chess_media/white_rook.png',
    'wB': '/common/assets/chess_media/white_bishop.png',
    'wN': '/common/assets/chess_media/white_knight.png',
    'wP': '/common/assets/chess_media/white_pawn.png',
    'bK': '/common/assets/chess_media/black_king.png',
    'bQ': '/common/assets/chess_media/black_queen.png',
    'bR': '/common/assets/chess_media/black_rook.png',
    'bB': '/common/assets/chess_media/black_bishop.png',
    'bN': '/common/assets/chess_media/black_knight.png',
    'bP': '/common/assets/chess_media/black_pawn.png'
};

export const THEMES = [
    { light: '#7FC8A0', dark: '#2E7D52' },
    { light: '#F0D9B5', dark: '#B58863' },
    { light: '#89B0D4', dark: '#3A6B9F' },
    { light: '#C09CD8', dark: '#6B3A82' },
    { light: '#E8A898', dark: '#A04040' },
    { light: '#C8D8E8', dark: '#5A7A96' },
    { light: '#DEB887', dark: '#8B6508' },
    { light: '#F5E6A3', dark: '#C4A32E' },
    { light: '#A8E6CF', dark: '#3B8686' }
];

export const CAPTURE_ORDER = ['Q', 'R', 'B', 'N', 'P'];
export const COL_NAMES = 'abcdefgh';
export const DIFFICULTY_LABELS = ['Easy', 'Medium', 'Hard'];

export const INITIAL_BOARD = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

export const MAT = { 'P': 100, 'N': 320, 'B': 330, 'R': 500, 'Q': 900, 'K': 20000 };

const PST_P = [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
];
const PST_N = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
];
const PST_B = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
];
const PST_R = [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
];
const PST_Q = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
];
const PST_K = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
];
const PST = { 'P': PST_P, 'N': PST_N, 'B': PST_B, 'R': PST_R, 'Q': PST_Q, 'K': PST_K };

export function createCaptureCounts() {
    return { Q: 0, R: 0, B: 0, N: 0, P: 0 };
}

export function resetCaptureCounts(target) {
    for (let i = 0; i < CAPTURE_ORDER.length; i++) {
        target[CAPTURE_ORDER[i]] = 0;
    }
}

export function addCapture(wCounts, bCounts, side, piece) {
    if (!piece) {
        return;
    }
    const type = piece[1];
    if (!type || type === 'K') {
        return;
    }
    const counts = side === 'w' ? wCounts : bCounts;
    counts[type] = counts[type] + 1;
}

export function buildCaptureList(wCounts, bCounts, side) {
    const counts = side === 'w' ? wCounts : bCounts;
    const capturedColor = side === 'w' ? 'b' : 'w';
    const list = [];
    let key = 0;
    for (let i = 0; i < CAPTURE_ORDER.length; i++) {
        const type = CAPTURE_ORDER[i];
        const img = PIECE_IMAGES[capturedColor + type] || '';
        for (let n = 0; n < counts[type]; n++) {
            list.push({ k: key++, img: img });
        }
    }
    return list;
}

export function pieceSquareValue(piece, row, col) {
    const table = PST[piece[1]];
    if (!table) {
        return 0;
    }
    return table[piece[0] === 'w' ? row * 8 + col : (7 - row) * 8 + col];
}

export function checkSquareAttacked(board, row, col, defColor) {
    const attacker = defColor === 'w' ? 'b' : 'w';
    const pawnRow = attacker === 'w' ? row + 1 : row - 1;

    if (pawnRow >= 0 && pawnRow <= 7) {
        if (col - 1 >= 0 && board[pawnRow][col - 1] === `${attacker}P`) {
            return true;
        }
        if (col + 1 <= 7 && board[pawnRow][col + 1] === `${attacker}P`) {
            return true;
        }
    }

    const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (let i = 0; i < knightMoves.length; i++) {
        const nr = row + knightMoves[i][0];
        const nc = col + knightMoves[i][1];
        if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7 && board[nr][nc] === `${attacker}N`) {
            return true;
        }
    }

    const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (let j = 0; j < kingMoves.length; j++) {
        const kr = row + kingMoves[j][0];
        const kc = col + kingMoves[j][1];
        if (kr >= 0 && kr <= 7 && kc >= 0 && kc <= 7 && board[kr][kc] === `${attacker}K`) {
            return true;
        }
    }

    const straight = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (let d = 0; d < straight.length; d++) {
        for (let step = 1; step < 8; step++) {
            const sr = row + straight[d][0] * step;
            const sc = col + straight[d][1] * step;
            if (sr < 0 || sr > 7 || sc < 0 || sc > 7) {
                break;
            }
            const straightPiece = board[sr][sc];
            if (!straightPiece) {
                continue;
            }
            if (straightPiece[0] === attacker && (straightPiece[1] === 'R' || straightPiece[1] === 'Q')) {
                return true;
            }
            break;
        }
    }

    const diagonal = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (let d2 = 0; d2 < diagonal.length; d2++) {
        for (let step2 = 1; step2 < 8; step2++) {
            const dr = row + diagonal[d2][0] * step2;
            const dc = col + diagonal[d2][1] * step2;
            if (dr < 0 || dr > 7 || dc < 0 || dc > 7) {
                break;
            }
            const diagonalPiece = board[dr][dc];
            if (!diagonalPiece) {
                continue;
            }
            if (diagonalPiece[0] === attacker && (diagonalPiece[1] === 'B' || diagonalPiece[1] === 'Q')) {
                return true;
            }
            break;
        }
    }

    return false;
}
