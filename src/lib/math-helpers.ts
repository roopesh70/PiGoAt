type Matrix = number[][];

// Matrix Helpers
export function addMatrices(a: Matrix, b: Matrix): Matrix {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error("Matrices must have the same dimensions for addition.");
    }
    return a.map((row, r) => row.map((val, c) => val + b[r][c]));
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
    if (a[0].length !== b.length) {
        throw new Error("The number of columns in Matrix A must equal the number of rows in Matrix B.");
    }
    const result: Matrix = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
    for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < b[0].length; j++) {
            for (let k = 0; k < a[0].length; k++) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return result;
}

export function determinant(m: Matrix): number {
    const n = m.length;
    if (n === 1) return m[0][0];
    if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    if (n === 3) {
        return (
            m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
            m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
            m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
        );
    }
    throw new Error("Determinant for matrices larger than 3x3 is not supported in this version.");
}

// Polynomial Helpers
export function solveQuadratic(a: number, b: number, c: number): string {
    if (a === 0) throw new Error('"a" cannot be zero for a quadratic equation.');
    const discriminant = b * b - 4 * a * c;
    if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        return `x₁ = ${x1.toFixed(3)}, x₂ = ${x2.toFixed(3)}`;
    } else if (discriminant === 0) {
        const x = -b / (2 * a);
        return `x = ${x.toFixed(3)}`;
    } else {
        const realPart = (-b / (2 * a)).toFixed(3);
        const imaginaryPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(3);
        return `x₁ = ${realPart} + ${imaginaryPart}i, x₂ = ${realPart} - ${imaginaryPart}i`;
    }
}

export function getDerivative(coeffs: number[]): number[] {
    if (coeffs.length <= 1) return [0];
    const degree = coeffs.length - 1;
    return coeffs.slice(0, -1).map((c, i) => c * (degree - i));
}

export function getIntegral(coeffs: number[]): number[] {
    const degree = coeffs.length - 1;
    return coeffs.map((c, i) => c / (degree - i + 1));
}

export function evaluatePolynomial(coeffs: number[], x: number): number {
    return coeffs.reduce((acc, c) => acc * x + c, 0);
};

export function formatPolynomial(coeffs: number[]): string {
    const degree = coeffs.length - 1;
    return coeffs.map((c, i) => {
        const power = degree - i;
        if (c === 0) return '';
        const coeffStr = Math.abs(c) === 1 && power !== 0 ? '' : `${c.toFixed(2).replace(/\.00$/, '')}`;
        const xStr = power > 1 ? `x^${power}` : power === 1 ? 'x' : '';
        const sign = c > 0 ? ' + ' : ' - ';
        const term = `${Math.abs(c) === 1 && power !== 0 ? '' : Math.abs(c).toFixed(2).replace(/\.00$/, '')}${xStr}`;
        if (i === 0) return `${c < 0 ? '-' : ''}${term}`;
        return `${sign}${term}`;
    }).join('').replace(/^\s\+\s/, '').replace(/(\s\+\s|\s\-\s)$/, '').trim() || '0';
}
