# Mandelbrot Set
Mandelbrot set is the set<br>
{c in C | z<sub>n</sub> converges where z<sub>0</sub> = 0, z<sub>n</sub> = z<sub>n-1</sub>+c}.


const mandelbrot = (u: number, v: number, iter: number): number => {
    let x = 0;
    let y = 0;
    let n = 0;
    while (x*x + y*y <= 4 && n++ < iter) {
        y = 2 * x * y + v;
        x = x*x - y*y + u;
    }
    return n;
};
