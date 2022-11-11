# Mandelbrot Set
Mandelbrot set is the set<br>
&emsp;&emsp;&emsp;{<i>c</i> &#x2208; &#x2102; | the sequence <i>z<sub>n</sub></i> defined as <i>z<sub>0</sub> = 0</i>, <i>z<sub>n</sub> = z<sub>n-1</sub>+c</i>, converges}.

### implementation
```javascript
mandelbrot = (u, v, iter) => {
    let x = 0;
    let y = 0;
    let n = 0;
    while (x*x + y*y <= 4 && n++ < iter) {
        y = 2 * x * y + v;
        x = x*x - y*y + u;
    }
    return n;
};
```

### coloring
```
let colorUnit = 0xFFFFFF / iter;
for each pixel in canvas
    let x = (scaling of pixel x);
    let y = (scaling of pixel y);
    let color = Math.round(color * mandelbrot(x, y, iter));
    let r = color & 0xFF;
    let g = (color >>> 8) & 0xFF;
    let b = (color >>> 16) & 0xFF;
    let a = (some value | undefined);
    pixel color = (r, g, b) | (r, g, b, a);
```

Visit github page <a href='https://ggorr.github.io/MandelbrotSet/'>https://ggorr.github.io/MandelbrotSet/</a>
