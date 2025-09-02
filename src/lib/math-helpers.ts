import { create, all, MathJsStatic, Matrix, Eigensystem } from 'mathjs';

const math: MathJsStatic = create(all);

type MyMatrix = number[][];

// Matrix Helpers
export function addMatrices(a: MyMatrix, b: MyMatrix): MyMatrix {
    if (a.length !== b.length || a[0].length !== b[0].length) {
        throw new Error("Matrices must have the same dimensions for addition.");
    }
    const result = math.add(math.matrix(a), math.matrix(b));
    return result.toArray() as MyMatrix;
}

export function multiplyMatrices(a: MyMatrix, b: MyMatrix): MyMatrix {
    if (a[0].length !== b.length) {
        throw new Error("The number of columns in Matrix A must equal the number of rows in Matrix B.");
    }
    const result = math.multiply(math.matrix(a), math.matrix(b));
    return result.toArray() as MyMatrix;
}

export function determinant(m: MyMatrix): number {
    if (m.length !== m[0].length) {
        throw new Error("Matrix must be square to calculate the determinant.");
    }
    return math.det(math.matrix(m));
}

export function inverse(m: MyMatrix): MyMatrix {
    if (m.length !== m[0].length) {
        throw new Error("Matrix must be square to calculate the inverse.");
    }
    const result = math.inv(math.matrix(m));
    return result.toArray() as MyMatrix;
}

export function eigenvalues(m: MyMatrix): string {
    if (m.length !== m[0].length) {
        throw new Error("Matrix must be square to calculate eigenvalues.");
    }
    const result: Eigensystem = math.eigs(math.matrix(m));
    const values: any[] = result.values.toArray();
    return values.map(v => typeof v === 'number' ? v.toFixed(3) : math.format(v, {notation: 'fixed', precision: 3})).join(', ');
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
