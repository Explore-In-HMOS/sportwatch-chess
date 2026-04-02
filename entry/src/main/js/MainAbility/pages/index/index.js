import {
    PIECE_IMAGES, THEMES, COL_NAMES, DIFFICULTY_LABELS, INITIAL_BOARD, MAT,
    createCaptureCounts, resetCaptureCounts, addCapture, buildCaptureList,
    pieceSquareValue, checkSquareAttacked
} from '../../common/chess-utils';

let capWCounts = createCaptureCounts();
let capBCounts = createCaptureCounts();
let pendingMove = null;
let aiTimer = null;

function clearAiTimer() {
    if (aiTimer) {
        clearTimeout(aiTimer);
        aiTimer = null;
    }
}

export default {
    data: {
        showMenu: true,
        difficulty: 1,
        status: "White's turn",
        board: [],
        selected: null,
        validMoves: [],
        currentTurn: 'w',
        gameOver: false,
        row0: [], row1: [], row2: [], row3: [],
        row4: [], row5: [], row6: [], row7: [],
        wKingMoved: false, bKingMoved: false,
        wKingRow: 7, wKingCol: 4,
        bKingRow: 0, bKingCol: 4,
        wRookL: false, wRookR: false,
        bRookL: false, bRookR: false,
        epRow: -1, epCol: -1,
        lastFR: -1, lastFC: -1, lastTR: -1, lastTC: -1,
        checkR: -1, checkC: -1,
        capW: [], capB: [],
        showPromo: false,
        promoRow: 0, promoCol: 0,
        promoQ: '', promoR: '', promoB: '', promoN: '',
        fullMoves: 1,
        theme: 0
    },

    onInit() {
        this.showMenu = true;
        this.initBoard();
    },

    initBoard() {
        clearAiTimer();
        this.theme = Math.floor(Math.random() * THEMES.length);
        this.board = INITIAL_BOARD.map(function(row) { return row.slice(); });
        this.selected = null;
        this.validMoves = [];
        this.currentTurn = 'w';
        this.gameOver = false;
        this.wKingMoved = false; this.bKingMoved = false;
        this.wKingRow = 7; this.wKingCol = 4;
        this.bKingRow = 0; this.bKingCol = 4;
        this.wRookL = false; this.wRookR = false;
        this.bRookL = false; this.bRookR = false;
        this.epRow = -1; this.epCol = -1;
        this.lastFR = -1; this.lastFC = -1;
        this.lastTR = -1; this.lastTC = -1;
        this.checkR = -1; this.checkC = -1;
        this.capW = []; this.capB = [];
        this.showPromo = false;
        this.promoRow = 0; this.promoCol = 0;
        this.promoQ = ''; this.promoR = ''; this.promoB = ''; this.promoN = '';
        this.fullMoves = 1;
        resetCaptureCounts(capWCounts);
        resetCaptureCounts(capBCounts);
        pendingMove = null;
        this.status = `${DIFFICULTY_LABELS[this.difficulty]} - Your turn`;
        this.updateBoardView();
    },

    onReset() {
        clearAiTimer();
        this.showMenu = true;
        this.initBoard();
    },

    setEasy() {
        this.difficulty = 0;
        this.showMenu = false;
        this.initBoard();
    },

    setMedium() {
        this.difficulty = 1;
        this.showMenu = false;
        this.initBoard();
    },

    setHard() {
        this.difficulty = 2;
        this.showMenu = false;
        this.initBoard();
    },

    updateBoardView() {
        this.buildRows();
        this.buildCaptures();
    },

    setKingPosition(color, row, col) {
        if (color === 'w') {
            this.wKingRow = row;
            this.wKingCol = col;
        } else {
            this.bKingRow = row;
            this.bKingCol = col;
        }
    },

    buildRows() {
        const theme = THEMES[this.theme];
        const validLookup = {};
        for (let i = 0; i < this.validMoves.length; i++) {
            validLookup[this.validMoves[i].row * 8 + this.validMoves[i].col] = true;
        }

        for (let r = 0; r < 8; r++) {
            const cols = [];
            for (let c = 0; c < 8; c++) {
                const idx = r * 8 + c;
                const isLight = (r + c) % 2 === 0;
                const piece = this.board[r][c];
                const isSel = this.selected && this.selected.row === r && this.selected.col === c;
                const isValid = !!validLookup[idx];
                const isLastF = this.lastFR === r && this.lastFC === c;
                const isLastT = this.lastTR === r && this.lastTC === c;
                const isCheck = this.checkR === r && this.checkC === c;
                let bg = isLight ? theme.light : theme.dark;

                if (isSel) {
                    bg = '#00E5FF';
                } else if (isCheck) {
                    bg = '#FF1744';
                } else if (isValid) {
                    bg = piece ? '#FF5252' : (isLight ? '#E8F5E9' : '#A5D6A7');
                } else if (isLastF || isLastT) {
                    bg = isLight ? '#FFF9C4' : '#DAC34B';
                }

                const img = piece ? (PIECE_IMAGES[piece] || '') : '';
                cols.push({
                    k: idx,
                    bg: bg,
                    img: img,
                    hasImg: img !== '',
                    isDot: isValid && !piece
                });
            }
            this[`row${r}`] = cols;
        }
    },

    buildCaptures() {
        this.capW = buildCaptureList(capWCounts, capBCounts, 'w');
        this.capB = buildCaptureList(capWCounts, capBCounts, 'b');
    },    onCell(k) {
        if (this.gameOver || this.showPromo || this.showMenu || aiTimer) {
            return;
        }
        const row = Math.floor(k / 8);
        const col = k % 8;
        this.handleClick(row, col);
    },

    handleClick(row, col) {
        const piece = this.board[row][col];
        if (this.selected) {
            let isValid = false;
            for (let i = 0; i < this.validMoves.length; i++) {
                if (this.validMoves[i].row === row && this.validMoves[i].col === col) {
                    isValid = true;
                    break;
                }
            }

            if (isValid) {
                const from = this.selected;
                this.selected = null;
                this.validMoves = [];
                this.makeMove(from.row, from.col, row, col);
                return;
            }

            if (piece && piece[0] === this.currentTurn) {
                if (this.selected.row === row && this.selected.col === col) {
                    this.selected = null;
                    this.validMoves = [];
                } else {
                    this.selected = { row: row, col: col };
                    this.validMoves = this.getValidMoves(row, col);
                }
            } else {
                this.selected = null;
                this.validMoves = [];
            }
        } else if (piece && piece[0] === this.currentTurn) {
            this.selected = { row: row, col: col };
            this.validMoves = this.getValidMoves(row, col);
        }

        this.buildRows();
    },

    makeMove(fr, fc, tr, tc) {
        const piece = this.board[fr][fc];
        const destPiece = this.board[tr][tc];
        let castleType = null;
        let epCaptured = null;

        if (piece[1] === 'K' && Math.abs(tc - fc) === 2) {
            castleType = tc > fc ? 'K' : 'Q';
        }

        if (piece[1] === 'P' && tc !== fc && !destPiece) {
            epCaptured = this.board[fr][tc];
            this.board[fr][tc] = null;
        }

        const actualCap = destPiece || epCaptured;
        if (actualCap) {
            addCapture(capWCounts, capBCounts, piece[0], actualCap);
        }

        this.board[tr][tc] = piece;
        this.board[fr][fc] = null;

        if (castleType === 'K') {
            const kingRookRow = piece[0] === 'w' ? 7 : 0;
            this.board[kingRookRow][5] = this.board[kingRookRow][7];
            this.board[kingRookRow][7] = null;
        } else if (castleType === 'Q') {
            const queenRookRow = piece[0] === 'w' ? 7 : 0;
            this.board[queenRookRow][3] = this.board[queenRookRow][0];
            this.board[queenRookRow][0] = null;
        }

        if (piece[1] === 'K') {
            this.setKingPosition(piece[0], tr, tc);
            if (piece[0] === 'w') {
                this.wKingMoved = true;
            } else {
                this.bKingMoved = true;
            }
        }
        if (piece[1] === 'R') {
            if (fr === 7 && fc === 0) {
                this.wRookL = true;
            }
            if (fr === 7 && fc === 7) {
                this.wRookR = true;
            }
            if (fr === 0 && fc === 0) {
                this.bRookL = true;
            }
            if (fr === 0 && fc === 7) {
                this.bRookR = true;
            }
        }
        if (tr === 7 && tc === 0) {
            this.wRookL = true;
        }
        if (tr === 7 && tc === 7) {
            this.wRookR = true;
        }
        if (tr === 0 && tc === 0) {
            this.bRookL = true;
        }
        if (tr === 0 && tc === 7) {
            this.bRookR = true;
        }

        if (piece[1] === 'P' && Math.abs(tr - fr) === 2) {
            this.epRow = (fr + tr) / 2;
            this.epCol = fc;
        } else {
            this.epRow = -1;
            this.epCol = -1;
        }

        this.lastFR = fr; this.lastFC = fc;
        this.lastTR = tr; this.lastTC = tc;

        pendingMove = {
            fr: fr,
            fc: fc,
            tr: tr,
            tc: tc,
            piece: piece,
            captured: actualCap,
            castleType: castleType
        };

        if (piece[1] === 'P' && (tr === 0 || tr === 7)) {
            if (piece[0] === 'b') {
                this.board[tr][tc] = 'bQ';
                this.completeTurn('Q');
                return;
            }

            this.promoRow = tr;
            this.promoCol = tc;
            this.promoQ = PIECE_IMAGES[piece[0] + 'Q'];
            this.promoR = PIECE_IMAGES[piece[0] + 'R'];
            this.promoB = PIECE_IMAGES[piece[0] + 'B'];
            this.promoN = PIECE_IMAGES[piece[0] + 'N'];
            this.showPromo = true;
            this.updateBoardView();
            return;
        }

        this.completeTurn(null);
    },

    promoteQueen() {
        this.doPromotion('Q');
    },

    promoteRook() {
        this.doPromotion('R');
    },

    promoteBishop() {
        this.doPromotion('B');
    },

    promoteKnight() {
        this.doPromotion('N');
    },

    doPromotion(type) {
        const color = this.board[this.promoRow][this.promoCol][0];
        this.board[this.promoRow][this.promoCol] = color + type;
        this.showPromo = false;
        this.completeTurn(type);
    },

    completeTurn(promoteTo) {
        const moveInfo = pendingMove;
        const prevTurn = this.currentTurn;

        this.currentTurn = this.currentTurn === 'w' ? 'b' : 'w';

        if (this.currentTurn === 'w') {
            this.fullMoves++;
        }

        const enemy = this.currentTurn;
        const enemyName = enemy === 'w' ? 'White' : 'Black';
        const inCheck = this.isInCheck(enemy);
        const notation = this.getNotation(
            moveInfo.fr,
            moveInfo.fc,
            moveInfo.tr,
            moveInfo.tc,
            moveInfo.piece,
            moveInfo.captured,
            moveInfo.castleType,
            promoteTo,
            inCheck,
            false
        );
        const moveNum = prevTurn === 'w' ? this.fullMoves : this.fullMoves - 1;
        const moveText = prevTurn === 'w' ? `${moveNum}.${notation}` : `${moveNum}...${notation}`;

        if (inCheck) {
            if (enemy === 'w') {
                this.checkR = this.wKingRow;
                this.checkC = this.wKingCol;
            } else {
                this.checkR = this.bKingRow;
                this.checkC = this.bKingCol;
            }
        } else {
            this.checkR = -1;
            this.checkC = -1;
        }

        if (inCheck) {
            this.status = `${enemyName} check! ${moveText}`;
        } else {
            this.status = enemy === 'w' ? `${DIFFICULTY_LABELS[this.difficulty]} ${moveText}` : 'AI';
        }

        pendingMove = null;
        this.updateBoardView();

        if (!this.gameOver && this.currentTurn === 'b') {
            const self = this;
            const delay = 1000 + Math.floor(Math.random() * 2000);
            aiTimer = setTimeout(function() {
                let needsRefresh = false;
                try {
                    self.aiPlay();
                } catch (e) {
                    self.currentTurn = 'w';
                    self.status = `${DIFFICULTY_LABELS[self.difficulty]} - Your turn`;
                    needsRefresh = true;
                }
                aiTimer = null;
                if (needsRefresh) {
                    self.updateBoardView();
                }
            }, delay);
        }
    },

    getNotation(fr, fc, tr, tc, piece, captured, castleType, promo, isCheck, isMate) {
        let notation = '';
        if (castleType === 'K') {
            notation = 'O-O';
        } else if (castleType === 'Q') {
            notation = 'O-O-O';
        } else {
            if (piece[1] !== 'P') {
                notation += piece[1];
            }
            if (captured) {
                if (piece[1] === 'P') {
                    notation += COL_NAMES[fc];
                }
                notation += 'x';
            }
            notation += COL_NAMES[tc] + (8 - tr);
            if (promo) {
                notation += `=${promo}`;
            }
        }
        if (isMate) {
            notation += '#';
        } else if (isCheck) {
            notation += '+';
        }
        return notation;
    },

    getValidMoves(row, col) {
        const raw = this.getRawMoves(row, col);
        const color = this.board[row][col][0];
        const result = [];
        for (let i = 0; i < raw.length; i++) {
            if (!this.wouldLeaveInCheck(row, col, raw[i].row, raw[i].col, color)) {
                result.push(raw[i]);
            }
        }
        return result;
    },

    wouldLeaveInCheck(fr, fc, tr, tc, color) {
        const fromPiece = this.board[fr][fc];
        const toPiece = this.board[tr][tc];
        const kingRow = color === 'w' ? this.wKingRow : this.bKingRow;
        const kingCol = color === 'w' ? this.wKingCol : this.bKingCol;
        this.board[tr][tc] = fromPiece;
        this.board[fr][fc] = null;

        if (fromPiece && fromPiece[1] === 'K') {
            this.setKingPosition(color, tr, tc);
        }

        let epRow = -1;
        let epCol = -1;
        let epPiece = null;
        if (fromPiece && fromPiece[1] === 'P' && tc !== fc && !toPiece) {
            epRow = fr;
            epCol = tc;
            epPiece = this.board[epRow][epCol];
            this.board[epRow][epCol] = null;
        }

        let rookFromCol = -1;
        let rookToCol = -1;
        let rookPiece = null;
        if (fromPiece && fromPiece[1] === 'K' && Math.abs(tc - fc) === 2) {
            if (tc === 6) {
                rookFromCol = 7;
                rookToCol = 5;
            } else if (tc === 2) {
                rookFromCol = 0;
                rookToCol = 3;
            }
            if (rookFromCol >= 0) {
                rookPiece = this.board[tr][rookFromCol];
                this.board[tr][rookToCol] = rookPiece;
                this.board[tr][rookFromCol] = null;
            }
        }

        const inCheck = this.isInCheck(color);

        this.board[fr][fc] = fromPiece;
        this.board[tr][tc] = toPiece;
        if (fromPiece && fromPiece[1] === 'K') {
            this.setKingPosition(color, kingRow, kingCol);
        }
        if (epRow >= 0) {
            this.board[epRow][epCol] = epPiece;
        }
        if (rookFromCol >= 0) {
            this.board[tr][rookFromCol] = rookPiece;
            this.board[tr][rookToCol] = null;
        }
        return inCheck;
    },
    isSquareAttacked(row, col, defColor) {
        return checkSquareAttacked(this.board, row, col, defColor);
    },
    isInCheck(color) {
        const row = color === 'w' ? this.wKingRow : this.bKingRow;
        const col = color === 'w' ? this.wKingCol : this.bKingCol;
        return this.isSquareAttacked(row, col, color);
    },
    getRawMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) {
            return [];
        }

        const color = piece[0];
        const type = piece[1];
        const moves = [];
        const board = this.board;
        const self = this;

        const add = function(r, c) {
            if (r < 0 || r > 7 || c < 0 || c > 7) {
                return false;
            }
            const target = board[r][c];
            if (target && target[0] === color) {
                return false;
            }
            moves.push({ row: r, col: c });
            return !target;
        };

        const slide = function(dr, dc) {
            for (let step = 1; step < 8; step++) {
                if (!add(row + dr * step, col + dc * step)) {
                    break;
                }
            }
        };

        if (type === 'P') {
            const dir = color === 'w' ? -1 : 1;
            const startRow = color === 'w' ? 6 : 1;
            const nextRow = row + dir;
            if (nextRow >= 0 && nextRow <= 7 && !board[nextRow][col]) {
                moves.push({ row: nextRow, col: col });
                const jumpRow = row + dir * 2;
                if (row === startRow && !board[jumpRow][col]) {
                    moves.push({ row: jumpRow, col: col });
                }
            }
            for (let dc = -1; dc <= 1; dc += 2) {
                const pr = row + dir;
                const pc = col + dc;
                if (pr < 0 || pr > 7 || pc < 0 || pc > 7) {
                    continue;
                }
                const capture = board[pr][pc];
                if (capture && capture[0] !== color) {
                    moves.push({ row: pr, col: pc });
                } else if (pr === self.epRow && pc === self.epCol) {
                    moves.push({ row: pr, col: pc });
                }
            }
        } else if (type === 'R') {
            slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
        } else if (type === 'B') {
            slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
        } else if (type === 'Q') {
            slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
            slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
        } else if (type === 'N') {
            const knight = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            for (let i = 0; i < knight.length; i++) {
                add(row + knight[i][0], col + knight[i][1]);
            }
        } else if (type === 'K') {
            const king = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
            for (let j = 0; j < king.length; j++) {
                add(row + king[j][0], col + king[j][1]);
            }

            const castleRow = color === 'w' ? 7 : 0;
            const kingMoved = color === 'w' ? self.wKingMoved : self.bKingMoved;
            if (!kingMoved && row === castleRow && col === 4) {
                const rookRight = color === 'w' ? self.wRookR : self.bRookR;
                if (!rookRight && board[castleRow][7] === `${color}R` && !board[castleRow][5] && !board[castleRow][6]) {
                    if (!self.isSquareAttacked(castleRow, 4, color) && !self.isSquareAttacked(castleRow, 5, color) && !self.isSquareAttacked(castleRow, 6, color)) {
                        moves.push({ row: castleRow, col: 6 });
                    }
                }
                const rookLeft = color === 'w' ? self.wRookL : self.bRookL;
                if (!rookLeft && board[castleRow][0] === `${color}R` && !board[castleRow][1] && !board[castleRow][2] && !board[castleRow][3]) {
                    if (!self.isSquareAttacked(castleRow, 4, color) && !self.isSquareAttacked(castleRow, 3, color) && !self.isSquareAttacked(castleRow, 2, color)) {
                        moves.push({ row: castleRow, col: 2 });
                    }
                }
            }
        }

        return moves;
    },

    qApply(fr, fc, tr, tc) {
        const piece = this.board[fr][fc];
        if (!piece) {
            return null;
        }

        const undo = {
            fr: fr,
            fc: fc,
            tr: tr,
            tc: tc,
            piece: piece,
            captured: this.board[tr][tc],
            epCaptured: null,
            rookFromCol: -1,
            rookToCol: -1,
            rookPiece: null,
            eR: this.epRow,
            eC: this.epCol,
            wKM: this.wKingMoved,
            bKM: this.bKingMoved,
            wKR: this.wKingRow,
            wKC: this.wKingCol,
            bKR: this.bKingRow,
            bKC: this.bKingCol,
            wRL: this.wRookL,
            wRR: this.wRookR,
            bRL: this.bRookL,
            bRR: this.bRookR
        };

        if (piece[1] === 'P' && tc !== fc && !undo.captured) {
            undo.epCaptured = this.board[fr][tc];
            this.board[fr][tc] = null;
        }

        this.board[tr][tc] = piece;
        this.board[fr][fc] = null;

        if (piece[1] === 'K' && Math.abs(tc - fc) === 2) {
            if (tc === 6) {
                undo.rookFromCol = 7;
                undo.rookToCol = 5;
            } else if (tc === 2) {
                undo.rookFromCol = 0;
                undo.rookToCol = 3;
            }
            if (undo.rookFromCol >= 0) {
                undo.rookPiece = this.board[tr][undo.rookFromCol];
                this.board[tr][undo.rookToCol] = undo.rookPiece;
                this.board[tr][undo.rookFromCol] = null;
            }
        }

        if (piece[1] === 'P' && (tr === 0 || tr === 7)) {
            this.board[tr][tc] = piece[0] + 'Q';
        }

        if (piece[1] === 'K') {
            this.setKingPosition(piece[0], tr, tc);
            if (piece[0] === 'w') {
                this.wKingMoved = true;
            } else {
                this.bKingMoved = true;
            }
        }
        if (piece[1] === 'R') {
            if (fr === 7 && fc === 0) {
                this.wRookL = true;
            }
            if (fr === 7 && fc === 7) {
                this.wRookR = true;
            }
            if (fr === 0 && fc === 0) {
                this.bRookL = true;
            }
            if (fr === 0 && fc === 7) {
                this.bRookR = true;
            }
        }
        if (tr === 7 && tc === 0) {
            this.wRookL = true;
        }
        if (tr === 7 && tc === 7) {
            this.wRookR = true;
        }
        if (tr === 0 && tc === 0) {
            this.bRookL = true;
        }
        if (tr === 0 && tc === 7) {
            this.bRookR = true;
        }

        if (piece[1] === 'P' && Math.abs(tr - fr) === 2) {
            this.epRow = (fr + tr) / 2;
            this.epCol = fc;
        } else {
            this.epRow = -1;
            this.epCol = -1;
        }

        return undo;
    },

    qUndo(undo) {
        if (!undo) {
            return;
        }

        this.board[undo.fr][undo.fc] = undo.piece;
        this.board[undo.tr][undo.tc] = undo.captured;
        if (undo.epCaptured) {
            this.board[undo.fr][undo.tc] = undo.epCaptured;
        }
        if (undo.rookFromCol >= 0) {
            this.board[undo.tr][undo.rookFromCol] = undo.rookPiece;
            this.board[undo.tr][undo.rookToCol] = null;
        }

        this.epRow = undo.eR; this.epCol = undo.eC;
        this.wKingMoved = undo.wKM; this.bKingMoved = undo.bKM;
        this.wKingRow = undo.wKR; this.wKingCol = undo.wKC;
        this.bKingRow = undo.bKR; this.bKingCol = undo.bKC;
        this.wRookL = undo.wRL; this.wRookR = undo.wRR;
        this.bRookL = undo.bRL; this.bRookR = undo.bRR;
    },

    collectMoves(color) {
        const allMoves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (!piece || piece[0] !== color) {
                    continue;
                }
                const moves = this.getValidMoves(r, c);
                for (let i = 0; i < moves.length; i++) {
                    allMoves.push({ fr: r, fc: c, tr: moves[i].row, tc: moves[i].col });
                }
            }
        }
        return allMoves;
    },

    evaluate() {
        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (!piece) {
                    continue;
                }
                const value = (MAT[piece[1]] || 0) + pieceSquareValue(piece, r, c);
                score += piece[0] === 'w' ? value : -value;
            }
        }
        return score;
    },

    aiSearchFn(depth, alpha, beta, isMax) {
        if (depth === 0) {
            return this.evaluate();
        }

        const color = isMax ? 'w' : 'b';
        let hasMoves = false;

        if (isMax) {
            let best = -100000;
            for (let r = 0; r < 8; r++) {
                for (let c = 0; c < 8; c++) {
                    const piece = this.board[r][c];
                    if (!piece || piece[0] !== color) {
                        continue;
                    }
                    const moves = this.getValidMoves(r, c);
                    for (let i = 0; i < moves.length; i++) {
                        hasMoves = true;
                        const undo = this.qApply(r, c, moves[i].row, moves[i].col);
                        let score;
                        try {
                            score = this.aiSearchFn(depth - 1, alpha, beta, false);
                        } finally {
                            this.qUndo(undo);
                        }
                        if (score > best) {
                            best = score;
                        }
                        if (score > alpha) {
                            alpha = score;
                        }
                        if (beta <= alpha) {
                            return best;
                        }
                    }
                }
            }
            if (!hasMoves) {
                return this.isInCheck(color) ? -90000 : 0;
            }
            return best;
        }

        let best2 = 100000;
        for (let r2 = 0; r2 < 8; r2++) {
            for (let c2 = 0; c2 < 8; c2++) {
                const piece2 = this.board[r2][c2];
                if (!piece2 || piece2[0] !== color) {
                    continue;
                }
                const moves2 = this.getValidMoves(r2, c2);
                for (let j = 0; j < moves2.length; j++) {
                    hasMoves = true;
                    const undo2 = this.qApply(r2, c2, moves2[j].row, moves2[j].col);
                    let score2;
                    try {
                        score2 = this.aiSearchFn(depth - 1, alpha, beta, true);
                    } finally {
                        this.qUndo(undo2);
                    }
                    if (score2 < best2) {
                        best2 = score2;
                    }
                    if (score2 < beta) {
                        beta = score2;
                    }
                    if (beta <= alpha) {
                        return best2;
                    }
                }
            }
        }
        if (!hasMoves) {
            return this.isInCheck(color) ? 90000 : 0;
        }
        return best2;
    },

    aiPlay() {
        aiTimer = null;
        if (this.gameOver || this.currentTurn !== 'b') {
            return;
        }

        const allMoves = this.collectMoves('b');
        if (allMoves.length === 0) {
            return;
        }

        if (this.difficulty === 0) {
            const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            this.makeMove(randomMove.fr, randomMove.fc, randomMove.tr, randomMove.tc);
            return;
        }

        let bestMove = allMoves[0];
        let bestScore = 100000;
        const depth = 0;

        try {
            for (let i = 0; i < allMoves.length; i++) {
                const move = allMoves[i];
                const undo = this.qApply(move.fr, move.fc, move.tr, move.tc);
                let score;
                try {
                    score = depth > 0 ? this.aiSearchFn(depth, -100000, 100000, true) : this.evaluate();
                } finally {
                    this.qUndo(undo);
                }

                if (score < bestScore || (score === bestScore && Math.random() < 0.3)) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        } catch (e) {
            bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }

        this.makeMove(bestMove.fr, bestMove.fc, bestMove.tr, bestMove.tc);
    }
};